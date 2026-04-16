/**
 * IndexedDB-backed autosave for the slicer state.
 *
 * Two object stores:
 *   - "state": single record (key "current") containing all serialisable state
 *              (crops, text layers, settings, selected formats, etc.) plus
 *              the list of file IDs and their metadata.
 *   - "files": per-file blob records keyed by file ID, so uploaded images
 *              survive a page reload. Blobs are the most efficient storage
 *              format in IDB; we re-create ObjectURLs on rehydration.
 */

import type {
  SlicerState, SlicerFile, FormatDef, FolderLevel,
  CropsMap, TextLayersMap, ExportFormat,
} from '@/types/slicer'

const DB_NAME    = 'aspct-slicer'
const DB_VERSION = 1
const STATE_STORE = 'state'
const FILES_STORE = 'files'
const STATE_KEY   = 'current'
const SCHEMA_VERSION = 1

export interface PersistedFile {
  id: string
  blob: Blob
  name: string
  w: number
  h: number
  isV: boolean
  mime: string
}

export interface PersistedState {
  schema: number
  activeFile: number
  selected: string[]
  custom: FormatDef[]
  crops: CropsMap
  namingPattern: string
  exportFormats: ExportFormat[]
  folderLevels: FolderLevel[]
  clientName: string
  campaignName: string
  rootFolderName: string
  quality: number
  textLayers: TextLayersMap
  fileOrder: string[]
  updatedAt: number
}

// ── DB boot ─────────────────────────────────────────────────────

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB not available'))
  }
  if (dbPromise) return dbPromise
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STATE_STORE)) db.createObjectStore(STATE_STORE)
      if (!db.objectStoreNames.contains(FILES_STORE)) db.createObjectStore(FILES_STORE, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error ?? new Error('IDB open failed'))
  })
  return dbPromise
}

function tx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB().then(db => new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode)
    const store = transaction.objectStore(storeName)
    const req = fn(store)
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error ?? new Error('IDB tx failed'))
  }))
}

// ── State serialisation ─────────────────────────────────────────

export function serialiseState(state: SlicerState): PersistedState {
  return {
    schema:         SCHEMA_VERSION,
    activeFile:     state.activeFile,
    selected:       Array.from(state.selected),
    custom:         state.custom,
    crops:          state.crops,
    namingPattern:  state.namingPattern,
    exportFormats:  Array.from(state.exportFormats),
    folderLevels:   state.folderLevels,
    clientName:     state.clientName,
    campaignName:   state.campaignName,
    rootFolderName: state.rootFolderName,
    quality:        state.quality,
    textLayers:     state.textLayers,
    fileOrder:      state.files.map(f => f.id),
    updatedAt:      Date.now(),
  }
}

// ── State API ───────────────────────────────────────────────────

export async function saveState(state: SlicerState): Promise<void> {
  const payload = serialiseState(state)
  await tx(STATE_STORE, 'readwrite', store => store.put(payload, STATE_KEY))
}

export async function loadState(): Promise<PersistedState | null> {
  try {
    const v = await tx(STATE_STORE, 'readonly', store => store.get(STATE_KEY))
    if (!v || typeof v !== 'object') return null
    const s = v as PersistedState
    if (s.schema !== SCHEMA_VERSION) return null
    return s
  } catch { return null }
}

export async function clearAll(): Promise<void> {
  try {
    await tx(STATE_STORE, 'readwrite', store => store.delete(STATE_KEY))
    await tx(FILES_STORE, 'readwrite', store => store.clear())
  } catch { /* ignore */ }
}

// ── File API ────────────────────────────────────────────────────

export async function saveFile(rec: PersistedFile): Promise<void> {
  await tx(FILES_STORE, 'readwrite', store => store.put(rec))
}

export async function deleteFile(id: string): Promise<void> {
  try {
    await tx(FILES_STORE, 'readwrite', store => store.delete(id))
  } catch { /* ignore */ }
}

export async function loadAllFiles(): Promise<PersistedFile[]> {
  try {
    const v = await tx(FILES_STORE, 'readonly', store => store.getAll())
    return (v ?? []) as PersistedFile[]
  } catch { return [] }
}

// ── Rehydration helpers ─────────────────────────────────────────

function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload  = () => resolve(img)
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image decode failed')) }
    img.src = url
  })
}

function blobToVideoFrame(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const vid = document.createElement('video')
    vid.src = url
    vid.preload = 'metadata'
    vid.muted = true
    vid.addEventListener('loadedmetadata', () => { vid.currentTime = Math.min(0.5, vid.duration * 0.1) })
    vid.onseeked = () => {
      const c = document.createElement('canvas')
      c.width = vid.videoWidth; c.height = vid.videoHeight
      c.getContext('2d')!.drawImage(vid, 0, 0)
      const img = new Image()
      img.src = c.toDataURL('image/jpeg', 0.8)
      img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    }
    vid.onerror = () => { URL.revokeObjectURL(url); reject(new Error('video decode failed')) }
  })
}

/** Re-build a SlicerFile from its persisted blob + metadata. */
export async function rehydrateFile(rec: PersistedFile): Promise<SlicerFile | null> {
  try {
    const img = rec.isV ? await blobToVideoFrame(rec.blob) : await blobToImage(rec.blob)
    return { id: rec.id, name: rec.name, img, thumb: img.src, w: rec.w, h: rec.h, isV: rec.isV }
  } catch { return null }
}
