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

// ── Text compositing ────────────────────────────────────────────

/** Render a crop AND composite text layers on top using Canvas 2D. */
export function renderToCanvasWithText(
  canvas: HTMLCanvasElement,
  fmt: FormatDef,
  file: SlicerFile,
  crop: CropState,
  layers: import('@/types/slicer').TextLayer[],
): HTMLCanvasElement {
  renderToCanvas(canvas, fmt, file, crop)
  if (!layers || layers.length === 0) return canvas

  const ctx = canvas.getContext('2d')!

  for (const layer of layers) {
    if (!layer.text.trim() || layer.opacity <= 0) continue
    if (layer.visible === false) continue

    ctx.save()
    ctx.globalAlpha = layer.opacity

    const effectiveFontSize = layer.fontSize * (layer.scaleY ?? 1)
    const effectiveWidth    = layer.width    * (layer.scaleX ?? 1)
    const lineH = effectiveFontSize * (layer.lineHeight ?? 1.16)

    // Rotate around the textbox centre
    if (layer.angle) {
      const cx = layer.left + effectiveWidth / 2
      const cy = layer.top  + lineH / 2
      ctx.translate(cx, cy)
      ctx.rotate((layer.angle * Math.PI) / 180)
      ctx.translate(-cx, -cy)
    }

    // Font
    ctx.font         = `${layer.fontWeight} ${effectiveFontSize}px "${layer.fontFamily}", sans-serif`
    ctx.fillStyle    = layer.fill
    ctx.textAlign    = layer.textAlign as CanvasTextAlign
    ctx.textBaseline = 'top'

    // Letter spacing (modern browsers)
    const lsCtx = ctx as CanvasRenderingContext2D & { letterSpacing?: string }
    if ('letterSpacing' in ctx) {
      lsCtx.letterSpacing = `${(layer.letterSpacing / 1000) * effectiveFontSize}px`
    }

    // Shadow
    if (layer.shadow) {
      ctx.shadowColor   = layer.shadow.color
      ctx.shadowBlur    = layer.shadow.blur
      ctx.shadowOffsetX = layer.shadow.offsetX
      ctx.shadowOffsetY = layer.shadow.offsetY
    }

    const lines = _wrapText(ctx, layer.text, effectiveWidth)

    // Background rect
    if (layer.bgRect?.fill) {
      const totalH = lines.length * lineH
      const maxLineW = Math.max(...lines.map(l => ctx.measureText(l).width))
      const { padding, rx, fill: bgFill } = layer.bgRect
      ctx.save()
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0
      ctx.fillStyle = bgFill
      _roundRect(ctx, layer.left - padding, layer.top - padding,
                 maxLineW + padding * 2, totalH + padding * 2, rx)
      ctx.fill()
      ctx.restore()
      ctx.fillStyle = layer.fill
    }

    // Draw each line
    const startX =
      layer.textAlign === 'center' ? layer.left + effectiveWidth / 2 :
      layer.textAlign === 'right'  ? layer.left + effectiveWidth :
                                      layer.left

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], startX, layer.top + i * lineH)
    }

    ctx.restore()
  }

  return canvas
}

function _wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const result: string[] = []
  for (const para of text.split('\n')) {
    const words = para.split(' ')
    let cur = ''
    for (const word of words) {
      const test = cur ? `${cur} ${word}` : word
      if (ctx.measureText(test).width > maxW && cur) { result.push(cur); cur = word }
      else cur = test
    }
    result.push(cur)
  }
  return result.length ? result : ['']
}

function _roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r)
  } else {
    const rr = Math.min(r, w / 2, h / 2)
    ctx.beginPath()
    ctx.moveTo(x + rr, y)
    ctx.lineTo(x + w - rr, y); ctx.quadraticCurveTo(x + w, y, x + w, y + rr)
    ctx.lineTo(x + w, y + h - rr); ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h)
    ctx.lineTo(x + rr, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - rr)
    ctx.lineTo(x, y + rr); ctx.quadraticCurveTo(x, y, x + rr, y)
    ctx.closePath()
  }
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
