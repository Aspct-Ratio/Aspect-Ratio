'use client'

import {
  createContext, useContext, useReducer, useCallback, useEffect, useRef, useState,
  type Dispatch, type ReactNode,
} from 'react'
import type { SlicerState, SlicerFile, FormatDef, FolderLevel, ExportFormat, CropState, TextLayer } from '@/types/slicer'
import { DEFAULT_SELECTED, DEFAULT_FOLDER_LEVELS, getAllFormats } from '@/lib/formats'
import { calcCrop } from '@/lib/crop'
import {
  loadState as idbLoadState, saveState as idbSaveState,
  loadAllFiles as idbLoadAllFiles, deleteFile as idbDeleteFile,
  clearAll as idbClearAll, rehydrateFile,
  type PersistedState,
} from '@/lib/slicer-persist'

// ── Actions ────────────────────────────────────────────────────

type Action =
  | { type: 'HYDRATE'; state: SlicerState }
  | { type: 'ADD_FILES';     files: SlicerFile[] }
  | { type: 'REMOVE_FILE';   id: string }
  | { type: 'CLEAR_FILES' }
  | { type: 'SET_ACTIVE_FILE'; index: number }
  | { type: 'TOGGLE_FORMAT'; id: string }
  | { type: 'SELECT_ALL' }
  | { type: 'SELECT_NONE' }
  | { type: 'SET_SELECTION'; ids: string[] }
  | { type: 'TOGGLE_CHANNEL_ALL'; channelKey: string }
  | { type: 'TOGGLE_PLATFORM_ALL'; channelKey: string; platformKey: string }
  | { type: 'ADD_CUSTOM'; fmt: FormatDef }
  | { type: 'LOAD_SAVED_CUSTOM'; fmts: FormatDef[] }
  | { type: 'REMOVE_CUSTOM'; id: string }
  | { type: 'SET_NAMING_PATTERN'; pattern: string }
  | { type: 'SET_CLIENT_NAME'; name: string }
  | { type: 'SET_CAMPAIGN_NAME'; name: string }
  | { type: 'SET_ROOT_FOLDER'; name: string }
  | { type: 'TOGGLE_EXPORT_FORMAT'; fmt: ExportFormat }
  | { type: 'SET_QUALITY'; value: number }
  | { type: 'UPDATE_CROP'; fileId: string; formatId: string; crop: CropState }
  | { type: 'UPDATE_FOLDER_LEVELS'; levels: FolderLevel[] }
  | { type: 'RESET' }
  | { type: 'SET_TEXT_LAYERS';       fileId: string; formatId: string; layers: TextLayer[] }
  | { type: 'CLEAR_TEXT_LAYERS';     fileId: string; formatId: string }
  | { type: 'CLEAR_TEXT_LAYERS_BATCH'; fileId: string; formatIds: string[] }
  | { type: 'APPLY_TEXT_TO_FORMATS'; fileId: string; sourceFormatId: string;
      sourceDims: { w: number; h: number };
      targets: Array<{ formatId: string; w: number; h: number }> }

// ── Initial state ──────────────────────────────────────────────

const initialState: SlicerState = {
  files: [],
  activeFile: 0,
  selected: new Set(DEFAULT_SELECTED),
  custom: [],
  crops: {},
  namingPattern: '{client}_{dimension}',
  exportFormats: new Set(['jpeg']),
  folderLevels: DEFAULT_FOLDER_LEVELS.map(l => ({ ...l })),
  clientName: '',
  campaignName: '',
  rootFolderName: '',
  quality: 90,
  textLayers: {},
}

// ── Helpers ────────────────────────────────────────────────────

function initCropsForFile(
  state: SlicerState,
  file: SlicerFile,
): Record<string, CropState> {
  const crops: Record<string, CropState> = {}
  const fmts = getAllFormats(state.custom)
  for (const fmt of fmts) {
    crops[fmt.id] = calcCrop(fmt, file)
  }
  return crops
}

// ── Reducer ────────────────────────────────────────────────────

function reducer(state: SlicerState, action: Action): SlicerState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state

    case 'ADD_FILES': {
      const newFiles = action.files.filter(f =>
        !state.files.some(existing => existing.id === f.id),
      )
      const newCrops = { ...state.crops }
      for (const file of newFiles) {
        newCrops[file.id] = initCropsForFile(state, file)
      }
      return { ...state, files: [...state.files, ...newFiles], crops: newCrops }
    }

    case 'REMOVE_FILE': {
      const files = state.files.filter(f => f.id !== action.id)
      const crops = { ...state.crops }
      delete crops[action.id]
      const tl = { ...state.textLayers }
      delete tl[action.id]
      const activeFile = Math.min(state.activeFile, Math.max(0, files.length - 1))
      return { ...state, files, crops, textLayers: tl, activeFile }
    }

    case 'CLEAR_FILES':
      return { ...state, files: [], crops: {}, textLayers: {}, activeFile: 0 }

    case 'SET_ACTIVE_FILE':
      return { ...state, activeFile: action.index }

    case 'TOGGLE_FORMAT': {
      const selected = new Set(state.selected)
      selected.has(action.id) ? selected.delete(action.id) : selected.add(action.id)
      return { ...state, selected }
    }

    case 'SELECT_ALL': {
      const selected = new Set(getAllFormats(state.custom).map(f => f.id))
      return { ...state, selected }
    }

    case 'SELECT_NONE':
      return { ...state, selected: new Set() }

    case 'SET_SELECTION':
      return { ...state, selected: new Set(action.ids) }

    case 'LOAD_SAVED_CUSTOM': {
      // Batch-add saved dims, deduplicating by ID
      const existingIds = new Set(state.custom.map(c => c.id))
      const newFmts = action.fmts.filter(f => !existingIds.has(f.id))
      if (newFmts.length === 0) return state
      const custom = [...state.custom, ...newFmts]
      const selected = new Set(state.selected)
      newFmts.forEach(f => selected.add(f.id))
      const newCrops = { ...state.crops }
      for (const file of state.files) {
        newCrops[file.id] = { ...newCrops[file.id] }
        for (const f of newFmts) {
          newCrops[file.id][f.id] = calcCrop(f, file)
        }
      }
      return { ...state, custom, selected, crops: newCrops }
    }

    case 'TOGGLE_CHANNEL_ALL': {
      const { CHANNELS } = require('@/lib/formats')
      const ch = CHANNELS[action.channelKey]
      if (!ch) return state
      const allFmts = Object.values(ch.plats as Record<string, { fmts: FormatDef[] }>)
        .flatMap(p => p.fmts)
      const selected = new Set(state.selected)
      const allSel = allFmts.every(f => selected.has(f.id))
      allFmts.forEach(f => allSel ? selected.delete(f.id) : selected.add(f.id))
      return { ...state, selected }
    }

    case 'TOGGLE_PLATFORM_ALL': {
      const { CHANNELS } = require('@/lib/formats')
      const plat = CHANNELS[action.channelKey]?.plats[action.platformKey]
      if (!plat) return state
      const selected = new Set(state.selected)
      const allSel = plat.fmts.every((f: FormatDef) => selected.has(f.id))
      plat.fmts.forEach((f: FormatDef) => allSel ? selected.delete(f.id) : selected.add(f.id))
      return { ...state, selected }
    }

    case 'ADD_CUSTOM': {
      const custom = [...state.custom, action.fmt]
      const selected = new Set(state.selected)
      selected.add(action.fmt.id)
      const newCrops = { ...state.crops }
      for (const file of state.files) {
        newCrops[file.id] = {
          ...newCrops[file.id],
          [action.fmt.id]: calcCrop(action.fmt, file),
        }
      }
      return { ...state, custom, selected, crops: newCrops }
    }

    case 'REMOVE_CUSTOM': {
      const custom = state.custom.filter(f => f.id !== action.id)
      const selected = new Set(state.selected)
      selected.delete(action.id)
      return { ...state, custom, selected }
    }

    case 'SET_NAMING_PATTERN':
      return { ...state, namingPattern: action.pattern }

    case 'SET_CLIENT_NAME':
      return { ...state, clientName: action.name }

    case 'SET_CAMPAIGN_NAME':
      return { ...state, campaignName: action.name }

    case 'SET_ROOT_FOLDER':
      return { ...state, rootFolderName: action.name }

    case 'TOGGLE_EXPORT_FORMAT': {
      const exportFormats = new Set(state.exportFormats)
      if (exportFormats.has(action.fmt) && exportFormats.size > 1) {
        exportFormats.delete(action.fmt)
      } else {
        exportFormats.add(action.fmt)
      }
      return { ...state, exportFormats }
    }

    case 'SET_QUALITY':
      return { ...state, quality: action.value }

    case 'UPDATE_CROP':
      return {
        ...state,
        crops: {
          ...state.crops,
          [action.fileId]: {
            ...state.crops[action.fileId],
            [action.formatId]: action.crop,
          },
        },
      }

    case 'UPDATE_FOLDER_LEVELS':
      return { ...state, folderLevels: action.levels }

    case 'SET_TEXT_LAYERS': {
      return {
        ...state,
        textLayers: {
          ...state.textLayers,
          [action.fileId]: {
            ...(state.textLayers[action.fileId] ?? {}),
            [action.formatId]: action.layers,
          },
        },
      }
    }

    case 'CLEAR_TEXT_LAYERS': {
      const fileMap = { ...(state.textLayers[action.fileId] ?? {}) }
      delete fileMap[action.formatId]
      return { ...state, textLayers: { ...state.textLayers, [action.fileId]: fileMap } }
    }

    case 'CLEAR_TEXT_LAYERS_BATCH': {
      const fileMap = { ...(state.textLayers[action.fileId] ?? {}) }
      for (const fid of action.formatIds) delete fileMap[fid]
      return { ...state, textLayers: { ...state.textLayers, [action.fileId]: fileMap } }
    }

    case 'APPLY_TEXT_TO_FORMATS': {
      const sourceLayers = state.textLayers[action.fileId]?.[action.sourceFormatId] ?? []
      if (sourceLayers.length === 0) return state
      const { w: sw, h: sh } = action.sourceDims
      const fileMap = { ...(state.textLayers[action.fileId] ?? {}) }
      for (const { formatId, w: tw, h: th } of action.targets) {
        if (formatId === action.sourceFormatId) continue
        const fontScale = Math.min(tw / sw, th / sh)
        const xScale    = tw / sw
        const yScale    = th / sh
        fileMap[formatId] = sourceLayers.map(l => ({
          ...l,
          id:       `${l.id}-${formatId}`,
          fontSize: Math.round(l.fontSize * fontScale),
          left:     Math.round(l.left  * xScale),
          top:      Math.round(l.top   * yScale),
          width:    Math.round(l.width * xScale),
        }))
      }
      return { ...state, textLayers: { ...state.textLayers, [action.fileId]: fileMap } }
    }

    case 'RESET':
      return {
        ...initialState,
        selected: new Set(DEFAULT_SELECTED),
        folderLevels: DEFAULT_FOLDER_LEVELS.map(l => ({ ...l })),
        exportFormats: new Set(['jpeg'] as ExportFormat[]),
      }

    default:
      return state
  }
}

// ── Context ────────────────────────────────────────────────────

const SlicerContext = createContext<{
  state: SlicerState
  dispatch: Dispatch<Action>
  hydrating: boolean
  /** Wipe IndexedDB + reset in-memory state. */
  resetAll: () => Promise<void>
} | null>(null)

// ── Hydration ──────────────────────────────────────────────────
// Merge persisted JSON state + rehydrated SlicerFile[] back into a SlicerState
// shape the reducer can consume via HYDRATE.
function mergePersisted(persisted: PersistedState, files: SlicerFile[]): SlicerState {
  return {
    files,
    activeFile: Math.min(persisted.activeFile ?? 0, Math.max(0, files.length - 1)),
    selected: new Set(persisted.selected ?? DEFAULT_SELECTED),
    custom: persisted.custom ?? [],
    crops: persisted.crops ?? {},
    namingPattern: persisted.namingPattern ?? '{client}_{dimension}',
    exportFormats: new Set(persisted.exportFormats ?? ['jpeg']),
    folderLevels: (persisted.folderLevels && persisted.folderLevels.length > 0)
      ? persisted.folderLevels
      : DEFAULT_FOLDER_LEVELS.map(l => ({ ...l })),
    clientName: persisted.clientName ?? '',
    campaignName: persisted.campaignName ?? '',
    rootFolderName: persisted.rootFolderName ?? '',
    quality: persisted.quality ?? 90,
    textLayers: persisted.textLayers ?? {},
  }
}

export function SlicerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    selected: new Set(DEFAULT_SELECTED),
    folderLevels: DEFAULT_FOLDER_LEVELS.map(l => ({ ...l })),
    exportFormats: new Set(['jpeg'] as ExportFormat[]),
  })
  const [hydrating, setHydrating] = useState(true)
  const hasHydratedRef = useRef(false)

  // ── Hydrate from IndexedDB on first mount ─────────────────────
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const persisted = await idbLoadState()
        if (!persisted) return
        const fileRecs = await idbLoadAllFiles()
        // Preserve file order from persisted state
        const byId = new Map(fileRecs.map(r => [r.id, r]))
        const ordered = persisted.fileOrder
          .map(id => byId.get(id))
          .filter((r): r is NonNullable<typeof r> => !!r)
        const files = (await Promise.all(ordered.map(rehydrateFile)))
          .filter((f): f is SlicerFile => !!f)
        if (cancelled) return
        dispatch({ type: 'HYDRATE', state: mergePersisted(persisted, files) })
      } catch { /* ignore — fall back to fresh state */ }
      finally {
        if (!cancelled) {
          hasHydratedRef.current = true
          setHydrating(false)
        }
      }
    })()
    return () => { cancelled = true }
  }, [])

  // ── Autosave state (debounced) ────────────────────────────────
  useEffect(() => {
    if (!hasHydratedRef.current) return
    const t = setTimeout(() => { idbSaveState(state).catch(() => { /* ignore */ }) }, 400)
    return () => clearTimeout(t)
  }, [state])

  const resetAll = useCallback(async () => {
    try { await idbClearAll() } catch { /* ignore */ }
    dispatch({ type: 'RESET' })
  }, [])

  return (
    <SlicerContext.Provider value={{ state, dispatch, hydrating, resetAll }}>
      {children}
    </SlicerContext.Provider>
  )
}

export function useSlicer() {
  const ctx = useContext(SlicerContext)
  if (!ctx) throw new Error('useSlicer must be used within SlicerProvider')
  return ctx
}

// Re-exported for callers (Step1Upload wants to persist file blobs directly
// when the user drops new files, and remove them when files are deleted).
export { idbDeleteFile as persistDeleteFile }

/** Convenience: getRootName computed from state */
export function useRootName(state: SlicerState) {
  return useCallback(() => {
    const manual = state.rootFolderName.trim()
    if (manual) return manual.replace(/\s+/g, '-')
    const cl = (state.clientName || 'Brand').replace(/\s+/g, '-')
    return cl + '-assets'
  }, [state.rootFolderName, state.clientName])
}
