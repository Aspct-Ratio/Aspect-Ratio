'use client'

import {
  createContext, useContext, useReducer, useCallback,
  type Dispatch, type ReactNode,
} from 'react'
import type { SlicerState, SlicerFile, FormatDef, FolderLevel, ExportFormat, CropState } from '@/types/slicer'
import { DEFAULT_SELECTED, DEFAULT_FOLDER_LEVELS, getAllFormats } from '@/lib/formats'
import { calcCrop } from '@/lib/crop'

// ── Actions ────────────────────────────────────────────────────

type Action =
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
      const activeFile = Math.min(state.activeFile, Math.max(0, files.length - 1))
      return { ...state, files, crops, activeFile }
    }

    case 'CLEAR_FILES':
      return { ...state, files: [], crops: {}, activeFile: 0 }

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
} | null>(null)

export function SlicerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    selected: new Set(DEFAULT_SELECTED),
    folderLevels: DEFAULT_FOLDER_LEVELS.map(l => ({ ...l })),
    exportFormats: new Set(['jpeg'] as ExportFormat[]),
  })
  return (
    <SlicerContext.Provider value={{ state, dispatch }}>
      {children}
    </SlicerContext.Provider>
  )
}

export function useSlicer() {
  const ctx = useContext(SlicerContext)
  if (!ctx) throw new Error('useSlicer must be used within SlicerProvider')
  return ctx
}

/** Convenience: getRootName computed from state */
export function useRootName(state: SlicerState) {
  return useCallback(() => {
    const manual = state.rootFolderName.trim()
    if (manual) return manual.replace(/\s+/g, '-')
    const cl = (state.clientName || 'Brand').replace(/\s+/g, '-')
    return cl + '-assets'
  }, [state.rootFolderName, state.clientName])
}
