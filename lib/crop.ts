import type { CropState, FormatDef, SlicerFile } from '@/types/slicer'

/** Compute a fit-to-cover (object-fit: cover) crop centered on the image */
export function calcCrop(fmt: FormatDef, file: SlicerFile): CropState {
  const bsc =
    file.w / file.h > fmt.w / fmt.h
      ? file.h / fmt.h
      : file.w / fmt.w
  return {
    x: (file.w - fmt.w * bsc) / 2,
    y: (file.h - fmt.h * bsc) / 2,
    bsc,
    zoom: 1,
  }
}

/** Effective scale: how many source pixels per output pixel */
export function getScale(c: CropState) {
  return c.bsc / c.zoom
}

/** Clamp crop position so the canvas never shows empty space */
export function clampCrop(c: CropState, fmt: FormatDef, file: SlicerFile) {
  const s = getScale(c)
  const mx = Math.max(0, file.w - fmt.w * s)
  const my = Math.max(0, file.h - fmt.h * s)
  c.x = Math.max(0, Math.min(mx, c.x))
  c.y = Math.max(0, Math.min(my, c.y))
}

/** Smart crop: upper-quarter vertical bias (good for faces/heroes) */
export function smartCrop(c: CropState, fmt: FormatDef, file: SlicerFile) {
  const s = getScale(c)
  const mx = Math.max(0, file.w - fmt.w * s)
  const my = Math.max(0, file.h - fmt.h * s)
  c.x = mx / 2
  c.y = my * 0.25
}

/**
 * Render a crop into a <canvas> and return the canvas element.
 * The canvas is sized to the format's output dimensions.
 */
export function renderToCanvas(
  canvas: HTMLCanvasElement,
  fmt: FormatDef,
  file: SlicerFile,
  crop: CropState,
) {
  canvas.width = fmt.w
  canvas.height = fmt.h
  const ctx = canvas.getContext('2d')!
  const s = getScale(crop)
  ctx.drawImage(file.img, crop.x, crop.y, fmt.w * s, fmt.h * s, 0, 0, fmt.w, fmt.h)
  return canvas
}

/** canvas → Blob */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality: number,
): Promise<Blob> {
  const mime =
    format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg'
  return new Promise((res, rej) =>
    canvas.toBlob(
      blob => (blob ? res(blob) : rej(new Error('toBlob failed'))),
      mime,
      quality / 100,
    ),
  )
}

/** Build filename from pattern + format + asset name + client */
export function buildFilename(opts: {
  pattern: string
  clientName: string
  campaignName?: string
  fmt: FormatDef
  assetName: string
}): string {
  const { pattern, clientName, campaignName, fmt, assetName } = opts
  const cl = (clientName || 'Brand').replace(/\s+/g, '-')
  const camp = campaignName?.trim().replace(/\s+/g, '-') ?? ''
  const dt = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const an = assetName.replace(/\.[^.]+$/, '').replace(/\s+/g, '-')

  // Build client prefix: Brand or Brand_Campaign
  const clientPrefix = camp ? `${cl}_${camp}` : cl

  const platVal = fmt.pf ?? fmt.platform ?? 'Pl'
  const chanVal = fmt.cf ?? 'Ch'

  return pattern
    // Named aliases (friendlier)
    .replace(/{brand}/g, clientPrefix)
    .replace(/{campaign}/g, camp || cl)
    .replace(/{format}/g, platVal)
    .replace(/{asset}/g, an)
    // Original tokens
    .replace(/{client}/g, clientPrefix)
    .replace(/{channel}/g, chanVal)
    .replace(/{platform}/g, platVal)
    .replace(/{width}x{height}/g, `${fmt.w}x${fmt.h}`)
    .replace(/{width}/g, String(fmt.w))
    .replace(/{height}/g, String(fmt.h))
    .replace(/{dimension}/g, `${fmt.w}x${fmt.h}`)
    .replace(/{assetname}/g, an)
    .replace(/{date}/g, dt)
}

/** Get ordered folder path parts for a given format */
export function getFolderParts(
  fmt: FormatDef,
  folderLevels: import('@/types/slicer').FolderLevel[],
): string[] {
  return folderLevels
    .filter(l => l.enabled)
    .map(l => {
      if (l.customName.trim()) return l.customName.trim().replace(/\s+/g, '-')
      return (fmt[l.key] as string) ?? l.exampleDefault
    })
}
