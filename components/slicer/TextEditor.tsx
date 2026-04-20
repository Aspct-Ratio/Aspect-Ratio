'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useSlicer } from './SlicerContext'
import { renderToCanvas, calcCrop } from '@/lib/crop'
import type { FormatDef, SlicerFile, CropState, TextLayer } from '@/types/slicer'

// ── Constants ───────────────────────────────────────────────────

const MODAL_MAX_W = 640
const MODAL_MAX_H = 560

const SYSTEM_FONTS = ['Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Courier New', 'Impact', 'Verdana']
// Curated Google Fonts, organised by weight coverage.
// Fonts marked "full" support every weight from 100–900 (or close).
// Others are included for their style but have limited weight ranges.
const GOOGLE_FONTS = [
  // Full weight range (100–900)
  'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Raleway', 'Lato',
  'Work Sans', 'DM Sans', 'Archivo', 'Mulish', 'Urbanist',
  // Wide range (200–900 or 300–800)
  'Nunito', 'Nunito Sans', 'Manrope', 'Source Sans 3', 'Rubik',
  'Plus Jakarta Sans', 'Barlow', 'Kanit', 'Open Sans', 'Oswald',
  // Serif / display
  'Playfair Display', 'Merriweather', 'Lora', 'PT Serif',
  // Single-weight display
  'Bebas Neue', 'Anton', 'Archivo Black',
]
const ALL_FONTS    = [...SYSTEM_FONTS, ...GOOGLE_FONTS]

const PRESETS = {
  headline:  { text: 'Your Headline', fontSize: 72, fontWeight: 700, textAlign: 'center' as const },
  subheader: { text: 'Subheader copy goes here', fontSize: 36, fontWeight: 600, textAlign: 'center' as const },
  eyebrow:   { text: 'EYEBROW TEXT', fontSize: 18, fontWeight: 500, textAlign: 'center' as const, letterSpacing: 200 },
  body:      { text: 'Body copy goes here. Keep it short and compelling.', fontSize: 24, fontWeight: 400, textAlign: 'left' as const },
  cta:       { text: 'Shop Now', fontSize: 28, fontWeight: 700, textAlign: 'center' as const,
               bgRect: { fill: '#4F46E5', padding: 20, rx: 8 } },
}

const WEIGHT_OPTIONS = [
  { value: 100, label: 'Thin 100' },
  { value: 200, label: 'Extra Light 200' },
  { value: 300, label: 'Light 300' },
  { value: 400, label: 'Regular 400' },
  { value: 500, label: 'Medium 500' },
  { value: 600, label: 'Semibold 600' },
  { value: 700, label: 'Bold 700' },
  { value: 800, label: 'Extra Bold 800' },
  { value: 900, label: 'Black 900' },
]

const ORIENTATION_FILTERS = [
  { key: 'vertical',   label: 'Vertical' },
  { key: 'horizontal', label: 'Horizontal' },
  { key: 'square',     label: 'Square' },
]

const CHANNEL_FILTERS = [
  { key: 'social', label: 'Social' },
  { key: 'ecomm',  label: 'Ecomm' },
  { key: 'paid',   label: 'Paid' },
  { key: 'retail', label: 'Retail' },
]

function applyFilters(
  fmts: FormatDef[],
  sourceId: string,
  orientations: Set<string>,
  channels: Set<string>,
): FormatDef[] {
  return fmts.filter(f => {
    if (f.id === sourceId) return false
    if (orientations.size > 0) {
      const isV = f.h > f.w
      const isH = f.w > f.h
      const isS = f.w === f.h
      const match =
        (orientations.has('vertical') && isV) ||
        (orientations.has('horizontal') && isH) ||
        (orientations.has('square') && isS)
      if (!match) return false
    }
    if (channels.size > 0) {
      if (!channels.has(f.ck ?? '')) return false
    }
    return true
  })
}

// ── Types ────────────────────────────────────────────────────────

interface SelProps {
  id: string
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  fill: string
  textAlign: 'left' | 'center' | 'right'
  opacity: number
  charSpacing: number
  lineHeight: number
  shadowEnabled: boolean
  shadowColor: string
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
  bgEnabled: boolean
  bgFill: string
  bgPadding: number
  bgRx: number
}

interface LayerItem { id: string; preview: string; visible: boolean }

// ── Google Font loader ──────────────────────────────────────────

/** Inject the Google Fonts stylesheet for a family (all weights 100–900). */
function loadGoogleFont(family: string): Promise<void> {
  const id = `gf-${family.replace(/\s+/g, '-')}`
  if (document.getElementById(id)) return Promise.resolve()
  return new Promise(resolve => {
    const link = document.createElement('link')
    link.id   = id
    link.rel  = 'stylesheet'
    // Request the full weight range. Google serves the variable axis (wght@100..900)
    // where supported; for static fonts it maps to the closest available weights.
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:ital,wght@0,100..900;1,100..900&display=swap`
    link.onload = () => resolve()
    link.onerror = () => resolve()
    document.head.appendChild(link)
  })
}

/**
 * Ensure a specific (family, weight) combo is fully loaded.
 * Browsers lazily download font weights even after the CSS is loaded,
 * so we explicitly ask the FontFace API to fetch them before rendering.
 */
async function ensureFontLoaded(family: string, weight: number): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return
  try {
    // CSS font shorthand: weight size family
    await document.fonts.load(`${weight} 32px "${family}"`)
  } catch { /* ignore load errors */ }
}

function uid() { return `tl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

// ── Rounded background box renderer ─────────────────────────────
// Fabric's native `backgroundColor` paints a plain rectangle. To get rounded
// corners (matching preview/export), we patch the prototype chain so any
// Textbox with `data.bgRect.rx > 0` renders a rounded path instead.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function patchFabricRoundedBg(F: any) {
  // Walk up from Textbox.prototype to find the class that actually owns
  // `_renderBackground` (it lives on FabricObject.prototype by default).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let proto: any = F?.Textbox?.prototype
  while (proto && !Object.prototype.hasOwnProperty.call(proto, '_renderBackground')) {
    proto = Object.getPrototypeOf(proto)
  }
  if (!proto || proto.__aspctRoundedBgPatched) return
  proto.__aspctRoundedBgPatched = true
  const originalRender = proto._renderBackground
  proto._renderBackground = function (ctx: CanvasRenderingContext2D) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const self = this as any
    if (!self.backgroundColor) return
    const rx = Math.max(0, self.data?.bgRect?.rx ?? 0)
    // Non-rounded: delegate to the original renderer to preserve default behaviour
    if (rx <= 0 && typeof originalRender === 'function') {
      return originalRender.call(self, ctx)
    }
    const pad = self.data?.bgRect?.padding ?? self.padding ?? 0
    const dim = self._getNonTransformedDimensions()
    const x = -dim.x / 2 - pad, y = -dim.y / 2 - pad
    const w = dim.x + pad * 2, h = dim.y + pad * 2
    const r = Math.min(rx, w / 2, h / 2)
    ctx.fillStyle = self.backgroundColor
    ctx.beginPath()
    if (r > 0) {
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
      ctx.fill()
    } else {
      ctx.fillRect(x, y, w, h)
    }
    if (self.shadow && !self.shadow.affectStroke && typeof self._removeShadow === 'function') {
      self._removeShadow(ctx)
    }
  }
}

// ── Props ────────────────────────────────────────────────────────

interface Props {
  fmt: FormatDef
  file: SlicerFile
  crop: CropState
  initialLayers: TextLayer[]
  allFmts: FormatDef[]
  /** The subset of formats shown as clickable thumbnails in the left rail. */
  selectedFmts?: FormatDef[]
  fileId: string
  onClose: () => void
  /** Called when the user clicks a different format thumbnail. */
  onSwitchFormat?: (fmt: FormatDef) => void
}

// ── Format thumbnail component ──────────────────────────────────

function FormatThumb({
  fmt: thumbFmt,
  file: thumbFile,
  crop: thumbCrop,
  isActive,
  hasText,
  onClick,
}: {
  fmt: FormatDef
  file: SlicerFile
  crop: CropState | undefined
  isActive: boolean
  hasText: boolean
  onClick: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const ar = thumbFmt.w / thumbFmt.h
  const THUMB_MAX = 80
  let tw: number, th: number
  if (ar >= 1) { tw = THUMB_MAX; th = Math.round(tw / ar) }
  else         { th = THUMB_MAX; tw = Math.round(th * ar) }
  tw = Math.max(tw, 30); th = Math.max(th, 20)

  useEffect(() => {
    if (!canvasRef.current || !thumbFile || !thumbCrop) return
    const offscreen = document.createElement('canvas')
    renderToCanvas(offscreen, thumbFmt, thumbFile, thumbCrop)
    const c = canvasRef.current
    c.width = tw; c.height = th
    c.getContext('2d')?.drawImage(offscreen, 0, 0, tw, th)
  }, [thumbFmt, thumbFile, thumbCrop, tw, th])

  return (
    <button
      onClick={onClick}
      className={[
        'flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all w-full',
        isActive
          ? 'border-indigo-400 bg-indigo-50 shadow-sm'
          : 'border-transparent hover:bg-gray-50 hover:border-gray-200',
      ].join(' ')}
      title={`${thumbFmt.n} (${thumbFmt.w}×${thumbFmt.h})`}
    >
      <canvas
        ref={canvasRef}
        width={tw}
        height={th}
        className="block rounded"
        style={{ width: tw, height: th }}
      />
      <span className="text-[9px] font-semibold text-gray-600 truncate max-w-full leading-tight">
        {thumbFmt.w}×{thumbFmt.h}
      </span>
      {hasText && (
        <span className="text-[8px] font-bold px-1 py-0 rounded bg-indigo-100 text-indigo-600">Aa</span>
      )}
    </button>
  )
}

// ── Main TextEditor modal ────────────────────────────────────────

export default function TextEditor({ fmt, file, crop, initialLayers, allFmts, selectedFmts, fileId, onClose, onSwitchFormat }: Props) {
  const { state, dispatch } = useSlicer()
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricRef   = useRef<any>(null)   // Fabric.Canvas instance
  const scaleRef    = useRef(1)

  const [sel, setSel]         = useState<SelProps | null>(null)
  const [layerList, setLayerList] = useState<LayerItem[]>([])
  const [applyOpen, setApplyOpen] = useState(false)
  const [applyOrientations, setApplyOrientations] = useState<Set<string>>(new Set())
  const [applyChannels, setApplyChannels] = useState<Set<string>>(new Set())
  const [removeOpen, setRemoveOpen] = useState(false)
  const [removeOrientations, setRemoveOrientations] = useState<Set<string>>(new Set())
  const [removeChannels, setRemoveChannels] = useState<Set<string>>(new Set())
  const [customFonts, setCustomFonts] = useState<string[]>([])
  const [ready, setReady]     = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  // Compute display dimensions
  const ar    = fmt.w / fmt.h
  let dw: number, dh: number
  if (ar >= 1) { dw = MODAL_MAX_W; dh = Math.round(dw / ar); if (dh > MODAL_MAX_H) { dh = MODAL_MAX_H; dw = Math.round(dh * ar) } }
  else         { dh = MODAL_MAX_H; dw = Math.round(dh * ar);  if (dw > MODAL_MAX_W) { dw = MODAL_MAX_W; dh = Math.round(dw / ar) } }
  dw = Math.max(dw, 120); dh = Math.max(dh, 80)
  const scale = dw / fmt.w

  // ── Serialize canvas objects → TextLayer[] ────────────────────

  const serialize = useCallback((): TextLayer[] => {
    const canvas = fabricRef.current
    if (!canvas) return []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return canvas.getObjects().filter((o: any) => o.type === 'textbox').map((o: any) => {
      const shadow = o.shadow
      const bgRect = o.data?.bgRect ?? null
      return {
        id:           o.data?.id ?? uid(),
        text:         o.text ?? '',
        fontFamily:   o.fontFamily ?? 'Arial',
        fontSize:     Math.round(o.fontSize ?? 24),
        fontWeight:   typeof o.fontWeight === 'number' ? o.fontWeight : parseInt(o.fontWeight) || 400,
        fill:         typeof o.fill === 'string' ? o.fill : '#ffffff',
        textAlign:    (o.textAlign ?? 'left') as 'left' | 'center' | 'right',
        left:         Math.round(o.left ?? 0),
        top:          Math.round(o.top  ?? 0),
        width:        Math.round(o.width ?? 400),
        scaleX:       o.scaleX ?? 1,
        scaleY:       o.scaleY ?? 1,
        angle:        o.angle  ?? 0,
        opacity:      o.opacity ?? 1,
        letterSpacing: o.charSpacing ?? 0,
        lineHeight:   o.lineHeight ?? 1.16,
        shadow: shadow
          ? { color: shadow.color ?? '#000', blur: shadow.blur ?? 0,
              offsetX: shadow.offsetX ?? 0, offsetY: shadow.offsetY ?? 0 }
          : null,
        bgRect,
        visible: o.visible ?? true,
      } satisfies TextLayer
    })
  }, [])

  const saveToState = useCallback(() => {
    dispatch({ type: 'SET_TEXT_LAYERS', fileId, formatId: fmt.id, layers: serialize() })
  }, [dispatch, fileId, fmt.id, serialize])

  const refreshLayerList = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setLayerList(canvas.getObjects().filter((o: any) => o.type === 'textbox').map((o: any) => ({
      id:      o.data?.id ?? '',
      preview: (o.text ?? '(empty)').slice(0, 30),
      visible: o.visible ?? true,
    })))
  }, [])

  // ── Read selected object → sidebar state ──────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const readSel = useCallback((obj: any) => {
    if (!obj || obj.type !== 'textbox') { setSel(null); return }
    const shadow = obj.shadow
    const bgRect = obj.data?.bgRect ?? null
    setSel({
      id:           obj.data?.id ?? '',
      text:         obj.text ?? '',
      fontFamily:   obj.fontFamily ?? 'Arial',
      fontSize:     Math.round(obj.fontSize ?? 24),
      fontWeight:   typeof obj.fontWeight === 'number' ? obj.fontWeight : parseInt(obj.fontWeight) || 400,
      fill:         typeof obj.fill === 'string' ? obj.fill : '#ffffff',
      textAlign:    (obj.textAlign ?? 'left') as 'left' | 'center' | 'right',
      opacity:      obj.opacity ?? 1,
      charSpacing:  obj.charSpacing ?? 0,
      lineHeight:   obj.lineHeight ?? 1.16,
      shadowEnabled: !!shadow,
      shadowColor:   shadow?.color  ?? '#000000',
      shadowBlur:    shadow?.blur   ?? 10,
      shadowOffsetX: shadow?.offsetX ?? 2,
      shadowOffsetY: shadow?.offsetY ?? 2,
      bgEnabled: !!bgRect,
      bgFill:    bgRect?.fill    ?? '#4F46E5',
      bgPadding: bgRect?.padding ?? 16,
      bgRx:      bgRect?.rx      ?? 8,
    })
  }, [])

  // ── Update active object property ─────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateObj = useCallback(async (props: Record<string, any>) => {
    const canvas = fabricRef.current
    const obj = canvas?.getActiveObject()
    if (!obj || obj.type !== 'textbox') return
    // If weight or family is being changed, pre-load the exact (family, weight)
    // combo so the browser has the glyphs ready before the next paint.
    if ('fontWeight' in props || 'fontFamily' in props) {
      const family = (props.fontFamily ?? obj.fontFamily) as string
      const weight = (props.fontWeight ?? obj.fontWeight) as number
      if (family && GOOGLE_FONTS.includes(family)) await loadGoogleFont(family)
      await ensureFontLoaded(family, weight)
    }
    obj.set(props)
    obj.initDimensions?.()       // re-measure after weight/size/family change
    canvas.requestRenderAll()
    readSel(obj)
    saveToState()
    refreshLayerList()
  }, [readSel, saveToState, refreshLayerList])

  // ── Init Fabric.js ────────────────────────────────────────────

  useEffect(() => {
    if (!canvasElRef.current) return
    let disposed = false

    // Load Google Fonts in background
    GOOGLE_FONTS.forEach(f => loadGoogleFont(f))

    async function init() {
      try {
      // ── Resolve Fabric namespace (handles CJS, ESM, and bundler variations) ──
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fabricModule: any = await import('fabric')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const F: any = fabricModule.fabric ?? fabricModule.default?.fabric ?? fabricModule.default ?? fabricModule
      console.log('[TextEditor] fabric loaded, type:', typeof F, 'keys:', Object.keys(F ?? {}).slice(0, 8))

      // Guard: make sure the classes we need actually exist
      // fabric v6 exports FabricImage (canonical) and Image (alias) at the top level
      const ImageClass = F?.FabricImage ?? F?.Image
      const missing = ['Canvas', 'Textbox', 'Shadow'].filter(k => !F?.[k])
      if (missing.length || !ImageClass) {
        const msg = `Fabric classes missing: ${[...missing, ...(!ImageClass ? ['FabricImage/Image'] : [])].join(', ')}. Keys: ${Object.keys(F ?? {}).slice(0, 12).join(', ')}`
        console.error('[TextEditor]', msg)
        setInitError(msg)
        return
      }

      // Patch fabric's Textbox rendering pipeline so background boxes render
      // with rounded corners (matching preview/export). Idempotent — safe to call
      // on every TextEditor mount.
      patchFabricRoundedBg(F)

      // If cleanup already ran (StrictMode), abort
      if (disposed) return

      console.log('[TextEditor] creating canvas', fmt.w, 'x', fmt.h, 'scale:', scale, 'display:', dw, 'x', dh)
      // Canvas buffer = display size; setZoom maps fmt-space coords into the buffer.
      // This keeps a clean coord system: objects are positioned in fmt-space (0..fmt.w, 0..fmt.h)
      // and fabric handles the scale-to-display transform for rendering AND hit-testing.
      const canvas = new F.Canvas(canvasElRef.current!, { width: dw, height: dh, selection: true })
      canvas.setZoom(scale)
      fabricRef.current = canvas
      scaleRef.current  = scale

      // Background: render crop → data URL → HTMLImageElement → FabricImage
      const offscreen = document.createElement('canvas')
      // Guard: if crop state is missing, use a default fit-to-cover crop
      const safeCrop = crop ?? calcCrop(fmt, file)
      renderToCanvas(offscreen, fmt, file, safeCrop)
      const dataUrl = offscreen.toDataURL('image/jpeg', 0.92)

      // Load image manually to avoid fromURL hanging issues
      const htmlImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        const timeout = setTimeout(() => reject(new Error('Background image load timed out')), 10000)
        img.onload = () => { clearTimeout(timeout); resolve(img) }
        img.onerror = () => { clearTimeout(timeout); reject(new Error('Background image failed to load')) }
        img.src = dataUrl
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bgImg: any = new ImageClass(htmlImg)

      // Check again after await
      if (disposed) { canvas.dispose(); return }

      bgImg.set({
        selectable: false,
        evented: false,
        hoverCursor: 'default',
        // Scale so the image fills the full output coordinate space (fmt.w × fmt.h)
        scaleX: fmt.w / bgImg.width!,
        scaleY: fmt.h / bgImg.height!,
      })
      console.log('[TextEditor] bg image loaded, size:', htmlImg.naturalWidth, 'x', htmlImg.naturalHeight)
      canvas.backgroundImage = bgImg
      canvas.requestRenderAll()

      // Restore existing layers
      for (const layer of initialLayers) {
        // Pre-load the exact (family, weight) combo before building the textbox
        if (layer.fontFamily && GOOGLE_FONTS.includes(layer.fontFamily)) {
          await loadGoogleFont(layer.fontFamily)
        }
        await ensureFontLoaded(layer.fontFamily ?? 'Arial', layer.fontWeight as number)

        const tb = new F.Textbox(layer.text, {
          left:        layer.left,
          top:         layer.top,
          width:       layer.width,
          fontSize:    layer.fontSize,
          fontFamily:  layer.fontFamily,
          fontWeight:  layer.fontWeight as number,
          fill:        layer.fill,
          textAlign:   layer.textAlign,
          scaleX:      layer.scaleX,
          scaleY:      layer.scaleY,
          angle:       layer.angle,
          opacity:     layer.opacity,
          charSpacing: layer.letterSpacing,
          lineHeight:  layer.lineHeight,
          visible:     layer.visible ?? true,
          originX:     'left',
          originY:     'top',
          selectable:  true,
          evented:     true,
          editable:    true,
          hasControls: true,
          hasBorders:  true,
          lockUniScaling: false,
          ...(layer.bgRect ? { backgroundColor: layer.bgRect.fill, padding: layer.bgRect.padding } : {}),
        })
        if (layer.shadow) {
          tb.shadow = new F.Shadow({
            color: layer.shadow.color, blur: layer.shadow.blur,
            offsetX: layer.shadow.offsetX, offsetY: layer.shadow.offsetY,
          })
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(tb as any).data = { id: layer.id, bgRect: layer.bgRect ?? null }
        canvas.add(tb)
      }

      if (disposed) { canvas.dispose(); return }

      canvas.requestRenderAll()

      // Events
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      canvas.on('selection:created', (e: any) => readSel(e.selected?.[0]))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      canvas.on('selection:updated', (e: any) => readSel(e.selected?.[0]))
      canvas.on('selection:cleared', () => setSel(null))
      canvas.on('object:modified',  () => { saveToState(); refreshLayerList() })
      canvas.on('text:changed',     () => { saveToState(); refreshLayerList() })
      canvas.on('object:added',     refreshLayerList)
      canvas.on('object:removed',   refreshLayerList)

      refreshLayerList()
      console.log('[TextEditor] init complete, setting ready')
      setReady(true)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('[TextEditor] init failed:', err)
        setInitError(msg)
      }
    }

    init()
    return () => {
      disposed = true
      if (fabricRef.current) {
        fabricRef.current.dispose()
        fabricRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') { saveToState(); onClose() } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, saveToState])

  // ── Add preset text ───────────────────────────────────────────

  async function addPreset(presetKey: keyof typeof PRESETS) {
    const canvas = fabricRef.current
    if (!canvas) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fabricModule: any = await import('fabric')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const F: any = fabricModule.fabric ?? fabricModule.default?.fabric ?? fabricModule.default ?? fabricModule
    // Ensure the Textbox prototype has the rounded-bg patch (idempotent).
    // addPreset runs via a separate fabric import path in Next.js dynamic chunks,
    // so we patch here too in case init hasn't run or didn't resolve the same F.
    patchFabricRoundedBg(F)

    const p = PRESETS[presetKey]
    const id = uid()
    const tbW    = Math.round(fmt.w * 0.8)
    const tbX    = Math.round((fmt.w - tbW) / 2)
    const tbY    = Math.round(fmt.h * 0.65)
    const bgRect = 'bgRect' in p ? (p as { bgRect: TextLayer['bgRect'] }).bgRect ?? null : null
    // Default new text to Inter (full variable weight 100–900) so weight changes
    // in the sidebar produce visible thickness changes. System fonts like Arial
    // typically only ship 400 and 700, making mid-weights look identical.
    const defaultFamily = 'Inter'
    await loadGoogleFont(defaultFamily)
    await ensureFontLoaded(defaultFamily, p.fontWeight)
    const tb = new F.Textbox(p.text, {
      left:        tbX,
      top:         tbY,
      width:       tbW,
      fontSize:    p.fontSize,
      fontFamily:  defaultFamily,
      fontWeight:  p.fontWeight,
      fill:        '#ffffff',
      textAlign:   p.textAlign,
      charSpacing: 'letterSpacing' in p ? (p as { letterSpacing: number }).letterSpacing : 0,
      lineHeight:  1.16,
      originX:     'left',
      originY:     'top',
      selectable:  true,
      evented:     true,
      editable:    true,
      hasControls: true,
      hasBorders:  true,
      lockUniScaling: false,
      ...(bgRect ? { backgroundColor: bgRect.fill, padding: bgRect.padding } : {}),
    })
    // Eye-catch shadow for legibility
    tb.shadow = new F.Shadow({ color: 'rgba(0,0,0,0.55)', blur: 12, offsetX: 0, offsetY: 2 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(tb as any).data = { id, bgRect }
    canvas.add(tb)
    canvas.setActiveObject(tb)
    canvas.requestRenderAll()
    saveToState()
  }

  // ── Font family change ────────────────────────────────────────

  async function changeFont(family: string) {
    if (GOOGLE_FONTS.includes(family)) await loadGoogleFont(family)
    // Also preload the current weight for the new family so the editor renders
    // the change immediately instead of falling back to 400.
    const currentWeight = sel?.fontWeight ?? 400
    await ensureFontLoaded(family, currentWeight)
    await updateObj({ fontFamily: family })
    setSel(s => s ? { ...s, fontFamily: family } : s)
  }

  // ── Custom font import ────────────────────────────────────────

  async function handleFontImport(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const buf = await f.arrayBuffer()
    const name = f.name.replace(/\.[^.]+$/, '').replace(/\s+/g, '-')
    try {
      const ff = new FontFace(name, buf)
      await ff.load()
      document.fonts.add(ff)
      setCustomFonts(c => [...c, name])
    } catch { /* ignore bad fonts */ }
  }

  // ── Delete / layer ops ────────────────────────────────────────

  function deleteSelected() {
    const canvas = fabricRef.current
    const obj = canvas?.getActiveObject()
    if (!obj) return
    canvas.remove(obj)
    canvas.requestRenderAll()
    setSel(null)
    saveToState()
  }

  function bringForward() {
    const canvas = fabricRef.current
    const obj = canvas?.getActiveObject()
    if (!obj) return
    // Fabric v6: bringObjectForward replaces v5's bringForward
    if (typeof canvas.bringObjectForward === 'function') canvas.bringObjectForward(obj)
    else if (typeof canvas.bringForward === 'function')  canvas.bringForward(obj)
    canvas.requestRenderAll()
    saveToState()
    refreshLayerList()
  }

  function sendBack() {
    const canvas = fabricRef.current
    const obj = canvas?.getActiveObject()
    if (!obj) return
    // Fabric v6: sendObjectBackwards replaces v5's sendBackwards
    if (typeof canvas.sendObjectBackwards === 'function') canvas.sendObjectBackwards(obj)
    else if (typeof canvas.sendBackwards === 'function')  canvas.sendBackwards(obj)
    canvas.requestRenderAll()
    saveToState()
    refreshLayerList()
  }

  function selectById(id: string) {
    const canvas = fabricRef.current
    if (!canvas) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = canvas.getObjects().find((o: any) => o.data?.id === id)
    if (obj) { canvas.setActiveObject(obj); canvas.requestRenderAll(); readSel(obj) }
  }

  function toggleVisible(id: string) {
    const canvas = fabricRef.current
    if (!canvas) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = canvas.getObjects().find((o: any) => o.data?.id === id)
    if (obj) {
      obj.set('visible', !obj.visible)
      canvas.requestRenderAll()
      refreshLayerList()
      saveToState()
    }
  }

  function removeById(id: string) {
    const canvas = fabricRef.current
    if (!canvas) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = canvas.getObjects().find((o: any) => o.data?.id === id)
    if (obj) { canvas.remove(obj); canvas.requestRenderAll(); saveToState(); setSel(null) }
  }

  // ── Shadow helpers ────────────────────────────────────────────

  async function setShadow(enabled: boolean, updates?: Partial<SelProps>) {
    const canvas = fabricRef.current
    const obj = canvas?.getActiveObject()
    if (!obj || obj.type !== 'textbox') return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fabricModule: any = await import('fabric')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const F: any = fabricModule.fabric ?? fabricModule.default?.fabric ?? fabricModule.default ?? fabricModule
    const current = sel ?? ({} as SelProps)
    if (enabled) {
      obj.shadow = new F.Shadow({
        color:   updates?.shadowColor   ?? current.shadowColor   ?? '#000000',
        blur:    updates?.shadowBlur    ?? current.shadowBlur    ?? 10,
        offsetX: updates?.shadowOffsetX ?? current.shadowOffsetX ?? 2,
        offsetY: updates?.shadowOffsetY ?? current.shadowOffsetY ?? 2,
      })
    } else {
      obj.shadow = null
    }
    canvas.requestRenderAll()
    readSel(obj)
    saveToState()
  }

  // ── BgRect helpers ────────────────────────────────────────────

  function setBgRect(enabled: boolean, updates?: Partial<SelProps>) {
    const canvas = fabricRef.current
    const obj = canvas?.getActiveObject()
    if (!obj || obj.type !== 'textbox') return
    const current = sel ?? ({} as SelProps)
    const bgRect = enabled ? {
      fill:    updates?.bgFill    ?? current.bgFill    ?? '#4F46E5',
      padding: updates?.bgPadding ?? current.bgPadding ?? 16,
      rx:      updates?.bgRx      ?? current.bgRx      ?? 8,
    } : null
    obj.data = { ...obj.data, bgRect }
    // Sync to Fabric's native backgroundColor + padding so it renders in the editor.
    // Our prototype-patched _renderBackground picks up the rx from obj.data.bgRect.
    if (bgRect) {
      obj.set({ backgroundColor: bgRect.fill, padding: bgRect.padding })
    } else {
      obj.set({ backgroundColor: '', padding: 0 })
    }
    canvas.requestRenderAll()
    readSel(obj)
    saveToState()
  }

  // ── Apply-to (stackable filters) ───────────────────────────────

  const applyTargets = applyFilters(allFmts, fmt.id, applyOrientations, applyChannels)

  function toggleApplyOrientation(key: string) {
    setApplyOrientations(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function toggleApplyChannel(key: string) {
    setApplyChannels(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function handleApplyTo() {
    saveToState()
    if (applyTargets.length === 0) { setApplyOpen(false); return }
    dispatch({
      type: 'APPLY_TEXT_TO_FORMATS',
      fileId,
      sourceFormatId: fmt.id,
      sourceDims: { w: fmt.w, h: fmt.h },
      targets: applyTargets.map(f => ({ formatId: f.id, w: f.w, h: f.h })),
    })
    setApplyOpen(false)
    setApplyOrientations(new Set())
    setApplyChannels(new Set())
  }

  // ── Remove-from (stackable filters) ────────────────────────────

  // Only show formats that actually have text layers
  const removableFmts = allFmts.filter(f => f.id !== fmt.id && (state.textLayers[fileId]?.[f.id] ?? []).length > 0)
  const removeTargets = applyFilters(removableFmts, fmt.id, removeOrientations, removeChannels)

  function toggleRemoveOrientation(key: string) {
    setRemoveOrientations(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function toggleRemoveChannel(key: string) {
    setRemoveChannels(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function handleRemoveFrom() {
    if (removeTargets.length === 0) { setRemoveOpen(false); return }
    dispatch({
      type: 'CLEAR_TEXT_LAYERS_BATCH',
      fileId,
      formatIds: removeTargets.map(f => f.id),
    })
    setRemoveOpen(false)
    setRemoveOrientations(new Set())
    setRemoveChannels(new Set())
  }

  // ── Done ──────────────────────────────────────────────────────

  function handleDone() {
    saveToState()
    onClose()
  }

  function handleSwitchFormat(target: FormatDef) {
    if (target.id === fmt.id) return
    saveToState()
    onSwitchFormat?.(target)
  }

  // ── Render ────────────────────────────────────────────────────

  const allFontOptions = [...ALL_FONTS, ...customFonts]
  const showThumbnails = selectedFmts && selectedFmts.length > 1 && onSwitchFormat

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) handleDone() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel — wider when showing format thumbnails */}
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[95vh]"
           style={{ width: showThumbnails ? 'min(95vw, 1240px)' : 'min(95vw, 1040px)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
          <div>
            <p className="text-sm font-bold text-gray-900">{fmt.n}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{fmt.w}×{fmt.h} · {fmt.pl}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Apply to... */}
            <div className="relative">
              <button
                onClick={() => { setApplyOpen(o => !o); setRemoveOpen(false) }}
                disabled={layerList.length === 0}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-40"
              >
                Apply to… ▾
              </button>
              {applyOpen && (
                <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-xl w-64 p-3 space-y-3">
                  {/* Orientation */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.6px] text-gray-400 mb-1.5">Orientation</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ORIENTATION_FILTERS.map(f => (
                        <button key={f.key} onClick={() => toggleApplyOrientation(f.key)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                            applyOrientations.has(f.key)
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-200 hover:text-indigo-600'
                          }`}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Channel */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.6px] text-gray-400 mb-1.5">Channel</p>
                    <div className="flex flex-wrap gap-1.5">
                      {CHANNEL_FILTERS.map(f => (
                        <button key={f.key} onClick={() => toggleApplyChannel(f.key)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                            applyChannels.has(f.key)
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-200 hover:text-indigo-600'
                          }`}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Apply bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-[11px] text-gray-400">
                      {applyOrientations.size === 0 && applyChannels.size === 0
                        ? `${applyTargets.length} formats (all)`
                        : `${applyTargets.length} format${applyTargets.length !== 1 ? 's' : ''} matched`}
                    </span>
                    <div className="flex gap-1.5">
                      <button onClick={() => setApplyOpen(false)}
                        className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-700 transition">
                        Cancel
                      </button>
                      <button onClick={handleApplyTo} disabled={applyTargets.length === 0}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-lg transition disabled:opacity-40">
                        Apply to {applyTargets.length}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Remove from... */}
            <div className="relative">
              <button
                onClick={() => { setRemoveOpen(o => !o); setApplyOpen(false) }}
                disabled={removableFmts.length === 0}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-40"
              >
                Remove from… ▾
              </button>
              {removeOpen && (
                <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-xl w-64 p-3 space-y-3">
                  {/* Orientation */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.6px] text-gray-400 mb-1.5">Orientation</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ORIENTATION_FILTERS.map(f => (
                        <button key={f.key} onClick={() => toggleRemoveOrientation(f.key)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                            removeOrientations.has(f.key)
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-red-200 hover:text-red-600'
                          }`}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Channel */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.6px] text-gray-400 mb-1.5">Channel</p>
                    <div className="flex flex-wrap gap-1.5">
                      {CHANNEL_FILTERS.map(f => (
                        <button key={f.key} onClick={() => toggleRemoveChannel(f.key)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                            removeChannels.has(f.key)
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-red-200 hover:text-red-600'
                          }`}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Remove bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-[11px] text-gray-400">
                      {removeOrientations.size === 0 && removeChannels.size === 0
                        ? `${removeTargets.length} with text`
                        : `${removeTargets.length} matched`}
                    </span>
                    <div className="flex gap-1.5">
                      <button onClick={() => setRemoveOpen(false)}
                        className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-700 transition">
                        Cancel
                      </button>
                      <button onClick={handleRemoveFrom} disabled={removeTargets.length === 0}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold rounded-lg transition disabled:opacity-40">
                        Remove from {removeTargets.length}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleDone}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body: 3-column layout (stacks on mobile) */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-y-auto md:overflow-hidden">

          {/* Left rail — format thumbnails (hidden on mobile) */}
          {showThumbnails && (
            <div className="hidden md:block w-[110px] flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto">
              <div className="p-2 space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.8px] text-gray-400 px-1 mb-1">Formats</p>
                {selectedFmts.map(sf => (
                  <FormatThumb
                    key={sf.id}
                    fmt={sf}
                    file={file}
                    crop={state.crops[file.id]?.[sf.id]}
                    isActive={sf.id === fmt.id}
                    hasText={(state.textLayers[file.id]?.[sf.id] ?? []).length > 0}
                    onClick={() => handleSwitchFormat(sf)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Center — canvas area (flex-1 so it fills remaining space) */}
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 p-4 min-w-0">
            <div className="relative" style={{ width: dw, height: dh }}>
              <canvas
                ref={canvasElRef}
                style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}
              />
              {!ready && !initError && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-gray-400 bg-gray-100 rounded-lg">
                  <svg className="animate-spin w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Loading…
                </div>
              )}
              {initError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                  <div className="text-xs text-red-500 text-center p-4 max-w-xs">
                    <p className="font-semibold mb-1">Failed to load editor</p>
                    <p className="text-red-400 break-all">{initError}</p>
                    <p className="text-gray-400 mt-2">Check the browser console for details.</p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              Click text to select · Drag to move · Double-click to edit
            </p>
          </div>

          {/* Right — property sidebar (collapses on mobile) */}
          <div className="w-full md:w-72 flex-shrink-0 md:overflow-y-auto bg-white border-t md:border-t-0 md:border-l border-gray-200">
            <div className="p-4 space-y-5">

              {/* Add Text presets */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-2">Add Text</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map(k => (
                    <button key={k} onClick={() => addPreset(k)}
                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-700 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition capitalize">
                      + {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layer list */}
              {layerList.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-2">Layers</p>
                  <div className="space-y-1">
                    {[...layerList].reverse().map(item => (
                      <div key={item.id}
                        onClick={() => selectById(item.id)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer border transition ${
                          sel?.id === item.id ? 'border-indigo-300 bg-indigo-50' : 'border-transparent hover:bg-gray-50'}`}>
                        <button onClick={e => { e.stopPropagation(); toggleVisible(item.id) }}
                          className="flex-shrink-0 text-gray-400 hover:text-gray-700">
                          {item.visible
                            ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="2.5" fill="currentColor"/><path d="M1 6C2 3.5 4 2 6 2s4 1.5 5 4c-1 2.5-3 4-5 4S2 8.5 1 6z" stroke="currentColor" strokeWidth="1" fill="none"/></svg>
                            : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M1 6c1-2 3-3.5 5-3.5M11 6c-1 2-3 3.5-5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                          }
                        </button>
                        <span className="text-[11px] text-gray-700 truncate flex-1">{item.preview || '(empty)'}</span>
                        <button onClick={e => { e.stopPropagation(); removeById(item.id) }}
                          className="flex-shrink-0 text-gray-300 hover:text-red-500 transition">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Typography controls — only when something is selected */}
              {sel && (
                <>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-3">Typography</p>
                    <div className="space-y-3">
                      {/* Font family */}
                      <div>
                        <label className="text-[10px] font-semibold text-gray-500 block mb-1">Font</label>
                        <select
                          value={sel.fontFamily}
                          onChange={e => changeFont(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-indigo-400"
                          style={{ fontFamily: sel.fontFamily }}
                        >
                          <optgroup label="System">
                            {SYSTEM_FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                          </optgroup>
                          <optgroup label="Google Fonts">
                            {GOOGLE_FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                          </optgroup>
                          {customFonts.length > 0 && (
                            <optgroup label="Imported">
                              {customFonts.map(f => <option key={f} value={f}>{f}</option>)}
                            </optgroup>
                          )}
                        </select>
                      </div>

                      {/* Import font */}
                      <label className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-indigo-600 cursor-pointer hover:text-indigo-800">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v6M2 7l3 2 3-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Import font (.ttf / .woff)
                        <input type="file" accept=".ttf,.woff,.woff2" className="hidden" onChange={handleFontImport} />
                      </label>

                      {/* Size + weight row */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 block mb-1">Size (px)</label>
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button onClick={() => updateObj({ fontSize: Math.max(8, sel.fontSize - 1) })}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-100 text-sm font-bold">−</button>
                            <input type="number" min={8} max={400} value={sel.fontSize}
                              onChange={e => updateObj({ fontSize: Math.max(8, parseInt(e.target.value) || 24) })}
                              className="flex-1 text-xs text-center outline-none w-0 min-w-0" />
                            <button onClick={() => updateObj({ fontSize: Math.min(400, sel.fontSize + 1) })}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-100 text-sm font-bold">+</button>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 block mb-1">Weight</label>
                          <select value={sel.fontWeight}
                            onChange={e => updateObj({ fontWeight: parseInt(e.target.value) })}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none">
                            {WEIGHT_OPTIONS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Color + align */}
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] font-semibold text-gray-500 block mb-1">Color</label>
                          <div className="flex items-center gap-1.5">
                            <input type="color" value={sel.fill}
                              onChange={e => updateObj({ fill: e.target.value })}
                              className="w-8 h-7 border border-gray-200 rounded cursor-pointer p-0.5" />
                            {['#ffffff','#000000','#4F46E5'].map(c => (
                              <button key={c} onClick={() => updateObj({ fill: c })}
                                className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0"
                                style={{ background: c }} />
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 block mb-1">Align</label>
                          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                            {(['left','center','right'] as const).map(a => (
                              <button key={a} onClick={() => updateObj({ textAlign: a })}
                                className={`px-2 py-1.5 text-xs transition ${sel.textAlign === a ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                                {a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Spacing */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-3">Spacing</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-gray-500 block mb-1">Letter Spacing</label>
                        <input type="number" min={-200} max={2000} step={10} value={sel.charSpacing}
                          onChange={e => updateObj({ charSpacing: parseInt(e.target.value) || 0 })}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-indigo-400" />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-gray-500 block mb-1">Line Height</label>
                        <input type="number" min={0.8} max={3} step={0.05} value={sel.lineHeight}
                          onChange={e => updateObj({ lineHeight: parseFloat(e.target.value) || 1.16 })}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-indigo-400" />
                      </div>
                    </div>
                  </div>

                  {/* Effects */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-3">Effects</p>
                    <div className="space-y-3">
                      {/* Opacity */}
                      <div>
                        <label className="text-[10px] font-semibold text-gray-500 block mb-1">
                          Opacity — {Math.round(sel.opacity * 100)}%
                        </label>
                        <input type="range" min={0} max={1} step={0.01} value={sel.opacity}
                          onChange={e => updateObj({ opacity: parseFloat(e.target.value) })}
                          className="w-full cursor-pointer" />
                      </div>

                      {/* Shadow */}
                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-semibold text-gray-500 cursor-pointer mb-2">
                          <input type="checkbox" checked={sel.shadowEnabled}
                            onChange={e => setShadow(e.target.checked)}
                            className="rounded accent-indigo-600" />
                          Text Shadow
                        </label>
                        {sel.shadowEnabled && (
                          <div className="grid grid-cols-2 gap-2 pl-4">
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-0.5">Color</label>
                              <input type="color" value={sel.shadowColor}
                                onChange={e => setShadow(true, { shadowColor: e.target.value })}
                                className="w-full h-7 border border-gray-200 rounded p-0.5 cursor-pointer" />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-0.5">Blur</label>
                              <input type="number" min={0} max={100} value={sel.shadowBlur}
                                onChange={e => setShadow(true, { shadowBlur: parseInt(e.target.value) || 0 })}
                                className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Background rect */}
                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-semibold text-gray-500 cursor-pointer mb-2">
                          <input type="checkbox" checked={sel.bgEnabled}
                            onChange={e => setBgRect(e.target.checked)}
                            className="rounded accent-indigo-600" />
                          Background Box
                        </label>
                        {sel.bgEnabled && (
                          <div className="grid grid-cols-3 gap-2 pl-4">
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-0.5">Color</label>
                              <input type="color" value={sel.bgFill}
                                onChange={e => setBgRect(true, { bgFill: e.target.value })}
                                className="w-full h-7 border border-gray-200 rounded p-0.5 cursor-pointer" />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-0.5">Pad</label>
                              <input type="number" min={0} max={80} value={sel.bgPadding}
                                onChange={e => setBgRect(true, { bgPadding: parseInt(e.target.value) || 0 })}
                                className="w-full border border-gray-200 rounded-lg px-1.5 py-1 text-xs outline-none" />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-0.5">Radius</label>
                              <input type="number" min={0} max={80} value={sel.bgRx}
                                onChange={e => setBgRect(true, { bgRx: parseInt(e.target.value) || 0 })}
                                className="w-full border border-gray-200 rounded-lg px-1.5 py-1 text-xs outline-none" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Layer order + Delete */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-1">Layer order</p>
                    <p className="text-[10px] text-gray-400 mb-2">Move this text in front of or behind other text layers.</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={bringForward}
                        title="Bring layer forward (in front of other text)"
                        className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-100 transition">
                        ↑ Bring Forward
                      </button>
                      <button onClick={sendBack}
                        title="Send layer backward (behind other text)"
                        className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-100 transition">
                        ↓ Send Back
                      </button>
                      <button onClick={deleteSelected}
                        className="text-xs font-semibold border border-red-200 rounded-lg px-3 py-1.5 text-red-600 hover:bg-red-50 transition">
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}

              {!sel && layerList.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">
                  Add a text layer using the presets above.
                </p>
              )}
              {!sel && layerList.length > 0 && (
                <p className="text-xs text-gray-400 text-center py-2">
                  Click a text layer to edit its properties.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <p className="text-[10px] text-gray-400">
            Changes save automatically
          </p>
          <button
            onClick={handleDone}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition uppercase tracking-wide"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
