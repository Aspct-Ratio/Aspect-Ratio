'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useSlicer } from './SlicerContext'
import { getScale, clampCrop, smartCrop, calcCrop, buildFilename } from '@/lib/crop'
import type { FormatDef, SlicerFile, CropState } from '@/types/slicer'

const TAG_CLASSES: Record<string, string> = {
  't-soc': 'bg-indigo-50 text-indigo-600',
  't-eco': 'bg-green-50 text-green-700',
  't-pai': 'bg-amber-50 text-amber-600',
  't-ret': 'bg-red-50 text-red-600',
}

const MAX_W = 280
const MAX_H = 220
const MODAL_MAX_W = 560
const MODAL_MAX_H = 460

// ── Viewport renderer ───────────────────────────────────────────

interface ViewportProps {
  fmt: FormatDef
  file: SlicerFile
  crop: CropState
  pw: number
  ph: number
  cropRef: React.MutableRefObject<CropState>
  onCropChange: (c: CropState) => void
  onDoubleClick?: () => void
}

function CropViewport({ fmt, file, crop, pw, ph, cropRef, onCropChange, onDoubleClick }: ViewportProps) {
  const vpRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // Render image position whenever crop or viewport size changes
  useEffect(() => {
    if (!imgRef.current || !crop) return
    const s = getScale(crop)
    const ds = pw / fmt.w
    const el = imgRef.current
    el.style.width = `${(file.w / s) * ds}px`
    el.style.height = `${(file.h / s) * ds}px`
    el.style.left = `${(-crop.x / s) * ds}px`
    el.style.top = `${(-crop.y / s) * ds}px`
  }, [crop, pw, ph, fmt.w, fmt.h, file.w, file.h])

  // Drag to pan — reads from cropRef so zoom is never stale
  useEffect(() => {
    const vp = vpRef.current
    if (!vp) return

    let dragging = false
    let sx = 0, sy = 0, scx = 0, scy = 0

    function startDrag(cx: number, cy: number) {
      dragging = true
      sx = cx; sy = cy
      scx = cropRef.current.x
      scy = cropRef.current.y
    }

    function moveDrag(cx: number, cy: number) {
      if (!dragging) return
      const c = { ...cropRef.current }
      const s = getScale(c)
      const dx = (cx - sx) * (fmt.w / pw) * s
      const dy = (cy - sy) * (fmt.h / ph) * s
      c.x = scx - dx
      c.y = scy - dy
      clampCrop(c, fmt, file)
      onCropChange(c)
    }

    const onMouseDown = (e: MouseEvent) => { startDrag(e.clientX, e.clientY); e.preventDefault() }
    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY)
    const onMouseUp   = () => { dragging = false }
    const onTouchStart = (e: TouchEvent) => { startDrag(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault() }
    const onTouchMove  = (e: TouchEvent) => moveDrag(e.touches[0].clientX, e.touches[0].clientY)
    const onTouchEnd   = () => { dragging = false }

    vp.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    vp.addEventListener('touchstart', onTouchStart, { passive: false })
    document.addEventListener('touchmove', onTouchMove)
    document.addEventListener('touchend', onTouchEnd)

    return () => {
      vp.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      vp.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  // pw/ph/fmt/file are stable refs for the lifetime of the card
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fmt.id, file.id, pw, ph])

  return (
    <div
      ref={vpRef}
      onDoubleClick={onDoubleClick}
      className="relative overflow-hidden cursor-grab active:cursor-grabbing bg-gray-100 select-none"
      style={{ width: pw, height: ph }}
      title={onDoubleClick ? 'Double-click for larger view' : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={file.img.src}
        alt=""
        className="absolute pointer-events-none max-w-none"
        draggable={false}
      />
    </div>
  )
}

// ── Zoom controls ────────────────────────────────────────────────

function ZoomControl({ crop, fmt, file, onCropChange }: {
  crop: CropState
  fmt: FormatDef
  file: SlicerFile
  onCropChange: (c: CropState) => void
}) {
  function onZoom(val: number) {
    const clamped = Math.max(100, Math.min(400, val))
    const c = { ...crop, zoom: clamped / 100 }
    clampCrop(c, fmt, file)
    onCropChange(c)
  }

  const pct = Math.round(crop.zoom * 100)

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">⊕</span>
      <input
        type="range" min={100} max={400} value={pct}
        onChange={e => onZoom(parseInt(e.target.value))}
        className="flex-1 cursor-pointer"
      />
      <input
        type="number"
        min={100} max={400}
        value={pct}
        onChange={e => onZoom(parseInt(e.target.value) || 100)}
        onBlur={e => onZoom(parseInt(e.target.value) || 100)}
        className="w-[50px] text-xs text-center border border-gray-200 rounded-md py-0.5 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 font-mono text-gray-600"
      />
      <span className="text-xs text-gray-400">%</span>
    </div>
  )
}

// ── Modal ────────────────────────────────────────────────────────

interface ModalProps {
  fmt: FormatDef
  file: SlicerFile
  crop: CropState
  cropRef: React.MutableRefObject<CropState>
  onCropChange: (c: CropState) => void
  onClose: () => void
}

function CropModal({ fmt, file, crop, cropRef, onCropChange, onClose }: ModalProps) {
  // Compute modal viewport size
  const ar = fmt.w / fmt.h
  let pw: number, ph: number
  if (ar >= 1) {
    pw = MODAL_MAX_W; ph = Math.round(pw / ar)
    if (ph > MODAL_MAX_H) { ph = MODAL_MAX_H; pw = Math.round(ph * ar) }
  } else {
    ph = MODAL_MAX_H; pw = Math.round(ph * ar)
    if (pw > MODAL_MAX_W) { pw = MODAL_MAX_W; ph = Math.round(pw / ar) }
  }
  pw = Math.max(pw, 120); ph = Math.max(ph, 80)

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function doSmartCrop() {
    const c = { ...crop }
    smartCrop(c, fmt, file)
    onCropChange(c)
  }

  function doReset() {
    onCropChange(calcCrop(fmt, file))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div>
            <p className="text-sm font-bold text-gray-900">{fmt.n}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{fmt.w}×{fmt.h} · {fmt.pl}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Viewport */}
        <div className="flex items-center justify-center bg-gray-100 p-4">
          <CropViewport
            fmt={fmt} file={file} crop={crop}
            pw={pw} ph={ph}
            cropRef={cropRef}
            onCropChange={onCropChange}
          />
        </div>

        {/* Controls */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 space-y-3">
          <ZoomControl crop={crop} fmt={fmt} file={file} onCropChange={onCropChange} />
          <div className="flex items-center gap-2">
            <button
              onClick={doSmartCrop}
              className="flex-1 h-8 text-xs font-semibold border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              ✦ Smart Crop
            </button>
            <button
              onClick={doReset}
              className="flex-1 h-8 text-xs font-semibold border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              ↺ Reset
            </button>
            <button
              onClick={onClose}
              className="flex-1 h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              Done
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center">Drag to pan · Scroll or use slider to zoom · Esc to close</p>
        </div>
      </div>
    </div>
  )
}

// ── Main CropCard ────────────────────────────────────────────────

interface Props {
  fmt: FormatDef
  file: SlicerFile
}

export default function CropCard({ fmt, file }: Props) {
  const { state, dispatch } = useSlicer()
  const [modalOpen, setModalOpen] = useState(false)

  const crop = state.crops[file.id]?.[fmt.id]

  // Always-current ref — fixes stale closure zoom bug
  const cropRef = useRef<CropState>(crop)
  useEffect(() => { cropRef.current = crop }, [crop])

  // Compute card viewport size
  const ar = fmt.w / fmt.h
  let pw: number, ph: number
  if (ar >= 1) {
    pw = MAX_W; ph = Math.round(pw / ar)
    if (ph > MAX_H) { ph = MAX_H; pw = Math.round(ph * ar) }
  } else {
    ph = MAX_H; pw = Math.round(ph * ar)
    if (pw > MAX_W) { pw = MAX_W; ph = Math.round(pw / ar) }
  }
  pw = Math.max(pw, 50); ph = Math.max(ph, 28)

  const setCrop = useCallback((c: CropState) => {
    dispatch({ type: 'UPDATE_CROP', fileId: file.id, formatId: fmt.id, crop: { ...c } })
  }, [dispatch, file.id, fmt.id])

  if (!crop) return null

  const filename = buildFilename({
    pattern: state.namingPattern,
    clientName: state.clientName,
    campaignName: state.campaignName,
    fmt,
    assetName: file.name,
  })

  function doSmartCrop() {
    const c = { ...crop }
    smartCrop(c, fmt, file)
    setCrop(c)
  }

  function doReset() {
    setCrop(calcCrop(fmt, file))
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="px-3.5 py-2.5 border-b border-gray-100 flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-bold text-gray-800 leading-tight">{fmt.n}</div>
            <div className="text-xs text-gray-400 mt-0.5">{fmt.w}×{fmt.h} · {fmt.pl}</div>
          </div>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${TAG_CLASSES[fmt.pc ?? 't-soc'] ?? ''}`}>
            {fmt.pf}
          </span>
        </div>

        {/* Viewport */}
        <div className="flex items-center justify-center bg-gray-100">
          <CropViewport
            fmt={fmt} file={file} crop={crop}
            pw={pw} ph={ph}
            cropRef={cropRef}
            onCropChange={setCrop}
            onDoubleClick={() => setModalOpen(true)}
          />
        </div>

        {/* Controls */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 space-y-2">
          <ZoomControl crop={crop} fmt={fmt} file={file} onCropChange={setCrop} />
          <div className="text-xs text-gray-500 truncate">{filename}</div>
          <div className="flex items-center gap-2 flex-nowrap">
            <button onClick={doSmartCrop} className="text-xs font-semibold border border-gray-200 rounded-lg px-2 py-1 text-gray-700 bg-white hover:bg-gray-100 transition whitespace-nowrap">✦ Smart Crop</button>
            <button onClick={doReset} className="text-xs font-semibold border border-gray-200 rounded-lg px-2 py-1 text-gray-700 bg-white hover:bg-gray-100 transition whitespace-nowrap">↺ Reset</button>
            <button onClick={() => setModalOpen(true)} className="text-xs font-semibold border border-gray-200 rounded-lg px-2 py-1 text-gray-700 bg-white hover:bg-gray-100 transition whitespace-nowrap">⤢ Expand</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <CropModal
          fmt={fmt}
          file={file}
          crop={crop}
          cropRef={cropRef}
          onCropChange={setCrop}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}
