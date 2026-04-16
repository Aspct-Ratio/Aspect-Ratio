'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'

// ── Demo format definitions (self-contained, no lib/formats import) ────

interface DemoFormat {
  id: string
  name: string
  w: number
  h: number
}

const DEMO_FORMATS: DemoFormat[] = [
  { id: 'ig-feed',  name: 'Instagram Feed',     w: 1080, h: 1080 },
  { id: 'ig-story', name: 'Instagram Story',    w: 1080, h: 1920 },
  { id: 'fb-feed',  name: 'Facebook Feed',      w: 1200, h: 628  },
  { id: 'tt-feed',  name: 'TikTok Feed',        w: 1080, h: 1920 },
  { id: 'yt-thumb', name: 'YouTube Thumbnail',  w: 1280, h: 720  },
  { id: 'li-post',  name: 'LinkedIn Post',      w: 1200, h: 627  },
  { id: 'x-post',   name: 'X / Twitter Post',  w: 1200, h: 675  },
  { id: 'pin-pin',  name: 'Pinterest Pin',      w: 1000, h: 1500 },
]

const DEFAULT_SELECTED = new Set(['ig-feed', 'ig-story', 'fb-feed'])

// ── Loaded image state ──────────────────────────────────────────────────

interface LoadedImage {
  src: string   // object URL or /images/... path
  name: string
  w: number
  h: number
}

// ── Step indicator ──────────────────────────────────────────────────────

const STEP_LABELS = ['Upload', 'Formats', 'Adjust', 'Copy', 'Export']

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-6 flex-shrink-0">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1
        const active = n === current
        const done   = n < current
        return (
          <div key={n} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <div className={[
                'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all duration-300',
                active ? 'bg-indigo-600 text-white scale-110' :
                done   ? 'bg-indigo-100 text-indigo-600' :
                         'bg-gray-100 text-gray-400',
              ].join(' ')}>
                {done ? '✓' : n}
              </div>
              <span className={[
                'text-[11px] font-semibold whitespace-nowrap transition-colors duration-300 hidden sm:block',
                active ? 'text-gray-900' : 'text-gray-400',
              ].join(' ')}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={[
                'mx-2 sm:mx-3 h-px w-5 sm:w-8 flex-shrink-0 transition-colors duration-500',
                done ? 'bg-indigo-300' : 'bg-gray-200',
              ].join(' ')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Shared nav buttons ──────────────────────────────────────────────────

function NavBar({
  onBack,
  onNext,
  backLabel = '← Back',
  nextLabel = 'Continue →',
  nextDisabled = false,
  badge,
}: {
  onBack?: () => void
  onNext?: () => void
  backLabel?: string
  nextLabel?: string
  nextDisabled?: boolean
  badge?: string
}) {
  return (
    <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100 flex-shrink-0">
      {onBack ? (
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition uppercase tracking-wide"
        >
          {backLabel}
        </button>
      ) : <div />}
      <div className="flex items-center gap-3">
        {badge && (
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-1">
            {badge}
          </span>
        )}
        {onNext && (
          <button
            onClick={onNext}
            disabled={nextDisabled}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition uppercase tracking-wide"
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Step 1: Upload ──────────────────────────────────────────────────────

function UploadStep({ onImage }: { onImage: (img: LoadedImage) => void }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function loadFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image (JPG, PNG, or WebP).')
      return
    }
    setError('')
    setLoading(true)
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      onImage({ src: url, name: file.name, w: img.naturalWidth, h: img.naturalHeight })
      setLoading(false)
    }
    img.onerror = () => { setError('Failed to load image.'); setLoading(false) }
    img.src = url
  }

  function loadSample() {
    setLoading(true)
    setError('')
    const img = new window.Image()
    img.onload = () => {
      onImage({ src: '/images/demo-asset.jpg', name: 'demo-asset.jpg', w: img.naturalWidth, h: img.naturalHeight })
      setLoading(false)
    }
    img.onerror = () => { setError('Sample image unavailable.'); setLoading(false) }
    img.src = '/images/demo-asset.jpg'
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) loadFile(file)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f) }}
      />

      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={[
          'w-full max-w-[480px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 select-none',
          loading ? 'py-12 border-indigo-300 bg-indigo-50/40' :
          dragging ? 'py-12 border-indigo-400 bg-indigo-50 scale-[1.01]' :
                     'py-12 border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/30',
        ].join(' ')}
      >
        {loading ? (
          <>
            <svg className="animate-spin w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-sm text-indigo-500 font-medium">Loading image…</span>
          </>
        ) : (
          <>
            <div className="w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">Drop an image here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, or WebP</p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        onClick={loadSample}
        disabled={loading}
        className="mt-4 text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium transition disabled:opacity-40"
      >
        or try with our sample image
      </button>
    </div>
  )
}

// ── Step 2: Pick Formats ────────────────────────────────────────────────

function FormatsStep({
  image,
  selected,
  setSelected,
  onBack,
  onNext,
}: {
  image: LoadedImage
  selected: Set<string>
  setSelected: (s: Set<string>) => void
  onBack: () => void
  onNext: () => void
}) {
  function toggle(id: string) {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  return (
    <div className="flex flex-col min-h-0">
      {/* Uploaded image preview */}
      <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 border border-gray-100 rounded-xl flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt=""
          className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">{image.name}</p>
          <p className="text-[11px] text-gray-400">{image.w} × {image.h}px</p>
        </div>
        <span className="ml-auto text-[10px] font-semibold text-green-700 bg-green-50 border border-green-100 rounded-full px-2 py-0.5 flex-shrink-0">
          Loaded
        </span>
      </div>

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.6px] mb-3 flex-shrink-0">
        Select the formats you need
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 overflow-y-auto pb-1" style={{ maxHeight: 260 }}>
        {DEMO_FORMATS.map(fmt => {
          const sel = selected.has(fmt.id)
          const ratio = fmt.h / fmt.w
          const previewH = Math.round(56 * Math.min(ratio, 2))
          return (
            <button
              key={fmt.id}
              onClick={() => toggle(fmt.id)}
              className={[
                'relative flex flex-col items-center p-3 rounded-xl border-2 text-center transition-all duration-150 cursor-pointer hover:shadow-sm focus:outline-none',
                sel
                  ? 'border-indigo-500 bg-indigo-50 shadow-[0_0_0_3px_rgba(99,102,241,0.12)]'
                  : 'border-gray-200 bg-white hover:border-indigo-200',
              ].join(' ')}
            >
              {/* Aspect ratio thumbnail */}
              <div
                className={[
                  'mb-2 rounded border flex-shrink-0 transition-colors',
                  sel ? 'border-indigo-300 bg-indigo-100' : 'border-gray-200 bg-gray-100',
                ].join(' ')}
                style={{ width: 40, height: Math.max(previewH, 24) }}
              />
              <p className={['text-[11px] font-semibold leading-tight', sel ? 'text-indigo-700' : 'text-gray-700'].join(' ')}>
                {fmt.name}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{fmt.w}×{fmt.h}</p>
              {sel && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4l1.8 1.8L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <NavBar
        onBack={onBack}
        onNext={selected.size > 0 ? onNext : undefined}
        nextDisabled={selected.size === 0}
        badge={selected.size > 0 ? `${selected.size} selected` : undefined}
      />
    </div>
  )
}

// ── Step 3: Adjust Crops ────────────────────────────────────────────────

interface CropState {
  x: number   // pan offset in px
  y: number
  zoom: number // 1 = fit, up to 2
}

function AdjustCard({
  image,
  fmt,
  cardW,
}: {
  image: LoadedImage
  fmt: DemoFormat
  cardW: number
}) {
  const ratio = fmt.h / fmt.w
  const cardH = Math.round(cardW * Math.min(ratio, 1.8))
  const [crop, setCrop] = useState<CropState>({ x: 0, y: 0, zoom: 1 })
  const [dragging, setDragging] = useState(false)
  const startRef = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null)

  // Clamp pan so image edges stay within the container.
  // background-size: zoom*100% means the image is zoom times the container's
  // covering dimension. Extra pixels on each axis = (renderedDim - containerDim) / 2.
  function clampPan(x: number, y: number, zoom: number) {
    // Figure out the rendered image dimensions at this zoom
    const imgAspect = image.w / image.h
    const cardAspect = cardW / cardH
    let renderedW: number, renderedH: number
    if (imgAspect > cardAspect) {
      // Image wider than card → height-fit at 100%, so rendered height = cardH * zoom
      renderedH = cardH * zoom
      renderedW = renderedH * imgAspect
    } else {
      // Image taller than card → width-fit at 100%, so rendered width = cardW * zoom
      renderedW = cardW * zoom
      renderedH = renderedW / imgAspect
    }
    const maxX = Math.max(0, (renderedW - cardW) / 2)
    const maxY = Math.max(0, (renderedH - cardH) / 2)
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    }
  }

  function handlePointerDown(e: React.PointerEvent) {
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    setDragging(true)
    startRef.current = { x: e.clientX, y: e.clientY, cx: crop.x, cy: crop.y }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging || !startRef.current) return
    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y
    const { x, y } = clampPan(startRef.current.cx + dx, startRef.current.cy + dy, crop.zoom)
    setCrop(c => ({ ...c, x, y }))
  }

  function handlePointerUp() {
    setDragging(false)
    startRef.current = null
  }

  function handleZoom(delta: number) {
    setCrop(c => {
      const zoom = Math.max(1, Math.min(2, +(c.zoom + delta).toFixed(1)))
      const { x, y } = clampPan(c.x, c.y, zoom)
      return { zoom, x, y }
    })
  }

  return (
    <div className="flex flex-col items-center">
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={[
          'w-full rounded-xl overflow-hidden border shadow-sm bg-gray-100 flex-shrink-0 select-none',
          dragging ? 'cursor-grabbing border-indigo-300' : 'cursor-grab border-gray-200 hover:border-indigo-200',
        ].join(' ')}
        style={{
          height: cardH,
          touchAction: 'none',
          backgroundImage: `url(${image.src})`,
          backgroundSize: `${crop.zoom * 100}%`,
          backgroundPosition: `calc(50% + ${crop.x}px) calc(50% + ${crop.y}px)`,
          backgroundRepeat: 'no-repeat',
          transition: dragging ? 'none' : 'background-size 0.15s ease, background-position 0.15s ease',
        }}
      />
      {/* Zoom controls */}
      <div className="flex items-center gap-1 mt-1.5">
        <button
          onClick={() => handleZoom(-0.2)}
          disabled={crop.zoom <= 1}
          className="w-5 h-5 flex items-center justify-center rounded border border-gray-200 text-[10px] font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition"
        >
          −
        </button>
        <span className="text-[9px] text-gray-400 font-medium w-8 text-center">{Math.round(crop.zoom * 100)}%</span>
        <button
          onClick={() => handleZoom(0.2)}
          disabled={crop.zoom >= 2}
          className="w-5 h-5 flex items-center justify-center rounded border border-gray-200 text-[10px] font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition"
        >
          +
        </button>
      </div>
      <p className="text-[11px] font-semibold text-gray-700 mt-1 text-center leading-tight">
        {fmt.name}
      </p>
      <p className="text-[10px] text-gray-400">{fmt.w}×{fmt.h}</p>
    </div>
  )
}

function AdjustStep({
  image,
  selected,
  onBack,
  onNext,
}: {
  image: LoadedImage
  selected: Set<string>
  onBack: () => void
  onNext: () => void
}) {
  const formats = DEMO_FORMATS.filter(f => selected.has(f.id))
  const CARD_W = 140

  return (
    <div className="flex flex-col min-h-0">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.6px] mb-4 flex-shrink-0">
        Drag to reposition · zoom to refine each crop
      </p>

      <div
        className="grid gap-3 overflow-y-auto pb-1"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${CARD_W}px, 1fr))`,
          maxHeight: 360,
        }}
      >
        {formats.map(fmt => (
          <AdjustCard key={fmt.id} image={image} fmt={fmt} cardW={CARD_W} />
        ))}
      </div>

      <NavBar onBack={onBack} onNext={onNext} nextLabel="Add Copy →" />
    </div>
  )
}

// ── Step 4: Add Copy (simplified) ───────────────────────────────────────

interface DemoTextLayer {
  text: string
  fontSize: number
  fontWeight: number
  color: string
  xPct: number  // horizontal position as percentage (0-100)
  yPct: number  // vertical position as percentage (0-100)
}

const DEMO_PRESETS: { label: string; layer: DemoTextLayer }[] = [
  { label: '+ Headline',  layer: { text: 'Your Headline', fontSize: 32, fontWeight: 700, color: '#ffffff', xPct: 50, yPct: 70 } },
  { label: '+ Subheader', layer: { text: 'Subheader goes here', fontSize: 18, fontWeight: 500, color: '#ffffff', xPct: 50, yPct: 82 } },
  { label: '+ CTA',       layer: { text: 'Shop Now', fontSize: 16, fontWeight: 700, color: '#ffffff', xPct: 50, yPct: 92 } },
]

function CopyStep({
  image,
  selected,
  onBack,
  onNext,
}: {
  image: LoadedImage
  selected: Set<string>
  onBack: () => void
  onNext: () => void
}) {
  const formats = DEMO_FORMATS.filter(f => selected.has(f.id))
  const [activeFmt, setActiveFmt] = useState(formats[0]?.id ?? '')
  const [layers, setLayers] = useState<DemoTextLayer[]>([])
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [dragging, setDragging] = useState<number | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const fmt = formats.find(f => f.id === activeFmt) ?? formats[0]
  const PREVIEW_W = 320
  const ratio = fmt ? fmt.h / fmt.w : 1
  const previewH = Math.round(PREVIEW_W * Math.min(ratio, 1.6))

  function addPreset(preset: DemoTextLayer) {
    setLayers(prev => [...prev, { ...preset }])
    setEditIdx(layers.length)
  }

  // Drag-to-move handler
  function handlePointerDown(e: React.PointerEvent, idx: number) {
    e.preventDefault()
    e.stopPropagation()
    setEditIdx(idx)
    setDragging(idx)
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (dragging === null || !previewRef.current) return
    const rect = previewRef.current.getBoundingClientRect()
    const xPct = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100))
    const yPct = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100))
    updateLayer(dragging, { xPct, yPct })
  }

  function handlePointerUp() {
    setDragging(null)
  }

  function updateLayer(idx: number, updates: Partial<DemoTextLayer>) {
    setLayers(prev => prev.map((l, i) => i === idx ? { ...l, ...updates } : l))
  }

  function removeLayer(idx: number) {
    setLayers(prev => prev.filter((_, i) => i !== idx))
    setEditIdx(null)
  }

  return (
    <div className="flex flex-col min-h-0">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.6px] mb-4 flex-shrink-0">
        Add text to your assets
      </p>

      <div className="flex gap-4 min-h-0" style={{ maxHeight: 360 }}>
        {/* Left: format thumbnails */}
        <div className="flex flex-col gap-1.5 overflow-y-auto flex-shrink-0 w-16">
          {formats.map(f => {
            const ar = f.h / f.w
            const th = Math.round(48 * Math.min(ar, 1.5))
            return (
              <button
                key={f.id}
                onClick={() => setActiveFmt(f.id)}
                className={[
                  'flex flex-col items-center gap-0.5 p-1 rounded-lg border transition',
                  f.id === activeFmt
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-transparent hover:bg-gray-50',
                ].join(' ')}
              >
                <div
                  className="w-12 rounded overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0"
                  style={{ height: th }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.src} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-[8px] text-gray-500 font-medium">{f.w}×{f.h}</span>
              </button>
            )
          })}
        </div>

        {/* Center: preview with text overlays */}
        <div className="flex-1 flex flex-col items-center min-w-0">
          <div
            ref={previewRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 flex-shrink-0 select-none"
            style={{ width: PREVIEW_W, height: previewH, touchAction: 'none' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt=""
              className="w-full h-full object-cover pointer-events-none"
              style={{ objectPosition: 'center 30%' }}
              draggable={false}
            />
            {/* Text overlays */}
            {layers.map((layer, i) => (
              <div
                key={i}
                onPointerDown={e => handlePointerDown(e, i)}
                className={[
                  'absolute text-center px-2 py-0.5 rounded',
                  dragging === i ? 'cursor-grabbing ring-2 ring-indigo-400 ring-offset-1' :
                  editIdx === i ? 'cursor-grab ring-2 ring-indigo-400 ring-offset-1' :
                  'cursor-grab hover:ring-1 hover:ring-white/50',
                ].join(' ')}
                style={{
                  left: `${layer.xPct}%`,
                  top: `${layer.yPct}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: layer.fontSize,
                  fontWeight: layer.fontWeight,
                  color: layer.color,
                  textShadow: '0 1px 8px rgba(0,0,0,0.5)',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  userSelect: 'none',
                }}
              >
                {layer.text}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">Click to edit · drag to move</p>
        </div>

        {/* Right: controls */}
        <div className="w-44 flex-shrink-0 overflow-y-auto">
          {/* Presets */}
          <p className="text-[10px] font-bold uppercase tracking-[0.6px] text-gray-400 mb-1.5">Add Text</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {DEMO_PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => addPreset(p.layer)}
                className="px-2 py-1 border border-gray-200 rounded-lg text-[10px] font-semibold text-gray-600 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Layer list */}
          {layers.length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.6px] text-gray-400 mb-1.5">Layers</p>
              <div className="space-y-1 mb-3">
                {layers.map((l, i) => (
                  <div
                    key={i}
                    onClick={() => setEditIdx(i)}
                    className={[
                      'flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer border text-[10px] transition',
                      editIdx === i ? 'border-indigo-300 bg-indigo-50' : 'border-transparent hover:bg-gray-50',
                    ].join(' ')}
                  >
                    <span className="text-gray-700 truncate flex-1">{l.text}</span>
                    <button
                      onClick={e => { e.stopPropagation(); removeLayer(i) }}
                      className="text-gray-300 hover:text-red-500 flex-shrink-0"
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Edit selected layer */}
          {editIdx !== null && layers[editIdx] && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.6px] text-gray-400 mb-1.5">Edit</p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={layers[editIdx].text}
                  onChange={e => updateLayer(editIdx, { text: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1 text-[11px] outline-none focus:border-indigo-400"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[9px] text-gray-400 block mb-0.5">Size</label>
                    <input
                      type="number"
                      min={10}
                      max={72}
                      value={layers[editIdx].fontSize}
                      onChange={e => updateLayer(editIdx, { fontSize: parseInt(e.target.value) || 16 })}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1 text-[11px] outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] text-gray-400 block mb-0.5">Color</label>
                    <input
                      type="color"
                      value={layers[editIdx].color}
                      onChange={e => updateLayer(editIdx, { color: e.target.value })}
                      className="w-full h-7 border border-gray-200 rounded p-0.5 cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] text-gray-400 block mb-0.5">Weight</label>
                  <select
                    value={layers[editIdx].fontWeight}
                    onChange={e => updateLayer(editIdx, { fontWeight: parseInt(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1 text-[11px] outline-none"
                  >
                    <option value={400}>Regular</option>
                    <option value={500}>Medium</option>
                    <option value={600}>Semibold</option>
                    <option value={700}>Bold</option>
                    <option value={900}>Black</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {layers.length === 0 && (
            <p className="text-[10px] text-gray-400 text-center py-2">
              Add text using presets above
            </p>
          )}
        </div>
      </div>

      <NavBar onBack={onBack} onNext={onNext} nextLabel="Export →" />
    </div>
  )
}

// ── Step 5: Export CTA ──────────────────────────────────────────────────

function ExportCTA({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5 border border-indigo-100">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </div>
      <h3 className="text-[clamp(18px,2.5vw,24px)] font-extrabold text-gray-900 tracking-[-0.5px] mb-2">
        Ready to export your own assets?
      </h3>
      <p className="text-sm text-gray-500 max-w-[340px] mb-7 leading-[1.75]">
        Start your 7-day free trial to upload your files and download production-ready assets in every format.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/signup"
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition no-underline shadow-sm"
        >
          Start free trial →
        </Link>
        <Link
          href="/#pricing"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition no-underline"
        >
          View pricing
        </Link>
      </div>
      <button
        onClick={onBack}
        className="mt-6 text-xs text-gray-400 hover:text-gray-600 transition"
      >
        ← Back to preview
      </button>
    </div>
  )
}

// ── Fade wrapper ────────────────────────────────────────────────────────

function FadeStep({ children, stepKey }: { children: React.ReactNode; stepKey: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div
      key={stepKey}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
      }}
    >
      {children}
    </div>
  )
}

// ── Main DemoSlicer ─────────────────────────────────────────────────────

export default function DemoSlicer() {
  const [step, setStep] = useState(1)
  const [image, setImage] = useState<LoadedImage | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set(DEFAULT_SELECTED))

  function handleImage(img: LoadedImage) {
    setImage(img)
    // Brief pause so user sees the loading state, then advance
    setTimeout(() => setStep(2), 300)
  }

  function goBack() { setStep(s => Math.max(1, s - 1)) }
  function goNext() { setStep(s => Math.min(5, s + 1)) }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Browser chrome */}
      <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center gap-1.5 px-4 flex-shrink-0">
        <div className="w-3 h-3 rounded-full bg-[#FC625D] flex-shrink-0" />
        <div className="w-3 h-3 rounded-full bg-[#FDBC40] flex-shrink-0" />
        <div className="w-3 h-3 rounded-full bg-[#34C749] flex-shrink-0" />
        <div className="ml-3 flex-1 bg-gray-100 rounded-md h-[26px] flex items-center px-3 text-xs text-gray-400 truncate">
          app.aspctratio.com
          <span className="text-indigo-500 font-medium ml-1 hidden sm:inline">— Interactive Demo</span>
        </div>
        <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-50 border border-indigo-100 rounded px-2 py-0.5 ml-2 flex-shrink-0 hidden sm:block">
          TRY IT FREE
        </span>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-7" style={{ minHeight: 420 }}>
        <StepIndicator current={step} />

        <FadeStep stepKey={step}>
          {step === 1 && (
            <UploadStep onImage={handleImage} />
          )}
          {step === 2 && image && (
            <FormatsStep
              image={image}
              selected={selected}
              setSelected={setSelected}
              onBack={goBack}
              onNext={goNext}
            />
          )}
          {step === 3 && image && (
            <AdjustStep
              image={image}
              selected={selected}
              onBack={goBack}
              onNext={goNext}
            />
          )}
          {step === 4 && image && (
            <CopyStep
              image={image}
              selected={selected}
              onBack={goBack}
              onNext={goNext}
            />
          )}
          {step === 5 && (
            <ExportCTA onBack={goBack} />
          )}
        </FadeStep>
      </div>
    </div>
  )
}
