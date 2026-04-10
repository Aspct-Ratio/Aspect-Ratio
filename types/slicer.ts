// ── Format / Channel data ──────────────────────────────────────

export interface FormatDef {
  id: string
  n: string     // display name
  zf: string    // folder name
  w: number
  h: number
  // enriched after joining with channel data
  ck?: string   // channel key
  cl?: string   // channel label
  cf?: string   // channel folder name
  pc?: string   // platform CSS class tag
  pl?: string   // platform label
  pf?: string   // platform folder name
  platform?: string // for custom dims
}

export interface PlatformDef {
  label: string
  pf: string
  fmts: FormatDef[]
}

export interface ChannelDef {
  label: string
  icon: string
  cf: string
  pc: string
  plats: Record<string, PlatformDef>
}

// ── Crop state ─────────────────────────────────────────────────

export interface CropState {
  x: number
  y: number
  bsc: number   // base scale (fit-to-cover)
  zoom: number  // multiplier ≥ 1
}

// crops[fileId][formatId] = CropState
export type CropsMap = Record<string, Record<string, CropState>>

// ── File record ────────────────────────────────────────────────

export interface SlicerFile {
  id: string
  name: string
  img: HTMLImageElement
  thumb: string
  w: number
  h: number
  isV: boolean  // video (frame preview)
}

// ── Folder level ───────────────────────────────────────────────

export interface FolderLevel {
  id: string
  label: string
  exampleDefault: string
  key: keyof FormatDef   // which property to read
  enabled: boolean
  customName: string
}

// ── Export formats ─────────────────────────────────────────────

export type ExportFormat = 'jpeg' | 'png' | 'webp' | 'pdf' | 'tiff'

// ── Global slicer state ────────────────────────────────────────

export interface SlicerState {
  files: SlicerFile[]
  activeFile: number
  selected: Set<string>          // selected format IDs
  custom: FormatDef[]            // custom dimensions
  crops: CropsMap
  namingPattern: string
  exportFormats: Set<ExportFormat>
  folderLevels: FolderLevel[]
  clientName: string
  rootFolderName: string
  quality: number                // 60–100
}

// ── Sharp API ──────────────────────────────────────────────────

export interface ProcessRequest {
  formatId: string
  width: number
  height: number
  cropX: number
  cropY: number
  cropW: number   // source crop width
  cropH: number   // source crop height
  outputFormat: 'jpeg' | 'png' | 'webp'
  quality: number
}

export interface ProcessResponse {
  formatId: string
  blob: string   // base64
  mimeType: string
}
