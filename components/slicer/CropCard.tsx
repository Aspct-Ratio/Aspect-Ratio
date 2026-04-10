'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useSlicer } from './SlicerContext'
import { getScale, clampCrop, smartCrop, calcCrop, buildFilename, renderToCanvas } from '@/lib/crop'
import type { FormatDef, SlicerFile, CropState } from '@/types/slicer'

const TAG_CLASSES: Record<string, string> = {
  't-soc': 'bg-indigo-50 text-indigo-600',
  't-eco': 'bg-green-50 text-green-700',
  't-pai': 'bg-amber-50 text-amber-600',
  't-ret': 'bg-red-50 text-red-600',
}

const MAX_W = 220
const MAX_H = 180

interface Props {
  fmt: FormatDef
  file: SlicerFile
}

export default function CropCard({ fmt, file }: Props) {
  const { state, dispatch } = useSlicer()
  const vpRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const crop = state.crops[file.id]?.[fmt.id]

  // Compute preview viewport size
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

  function setCrop(c: CropState) {
    dispatch({ type: 'UPDATE_CROP', fileId: file.id, formatId: fmt.id, crop: { ...c } })
  }

  // Render image in viewport
  useEffect(() => {
    if (!imgRef.current || !crop) return
    const s = getScale(crop)
    const ds = pw / fmt.w
    const el = imgRef.current
    el.style.width = `${(file.w / s) * ds}px`
    el.style.height = `${(file.h / s) * ds}px`
    el.style.left = `${(-crop.x / s) * ds}px`
    el.style.top = `${(-crop.y / s) * ds}px`
  }, [crop, pw, fmt.w, fmt.h, file.w, file.h])

  // Drag to pan
  useEffect(() => {
    const vp = vpRef.current
    if (!vp || !crop) return

    let dragging = false
    let sx = 0, sy = 0, scx = 0, scy = 0

    function startDrag(cx: number, cy: number) {
      dragging = true; sx = cx; sy = cy
      scx = state.crops[file.id][fmt.id].x
      scy = state.crops[file.id][fmt.id].y
    }
    function moveDrag(cx: number, cy: number) {
      if (!dragging) return
      const c = { ...state.crops[file.id][fmt.id] }
      const s = getScale(c)
      const dx = (cx - sx) * (fmt.w / pw) * s
      const dy = (cy - sy) * (fmt.h / ph) * s
      c.x = scx - dx; c.y = scy - dy
      clampCrop(c, fmt, file)
      setCrop(c)
    }

    const onMouseDown = (e: MouseEvent) => { startDrag(e.clientX, e.clientY); e.preventDefault() }
    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY)
    const onMouseUp = () => { dragging = false }
    const onTouchStart = (e: TouchEvent) => { startDrag(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault() }
    const onTouchMove = (e: TouchEvent) => moveDrag(e.touches[0].clientX, e.touches[0].clientY)
    const onTouchEnd = () => { dragging = false }

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.id, fmt.id, pw, ph])

  if (!crop) return null

  const filename = buildFilename({
    pattern: state.namingPattern,
    clientName: state.clientName,
    fmt,
    assetName: file.name,
  })

  function onZoom(val: number) {
    const c = { ...crop, zoom: Math.max(1, val / 100) }
    clampCrop(c, fmt, file)
    setCrop(c)
  }

  function doSmartCrop() {
    const c = { ...crop }
    smartCrop(c, fmt, file)
    setCrop(c)
  }

  function doReset() {
    setCrop(calcCrop(fmt, file))
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-gray-100 flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-bold text-gray-800 leading-tight">{fmt.n}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">{fmt.w}×{fmt.h} · {fmt.pl}</div>
        </div>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${TAG_CLASSES[fmt.pc ?? 't-soc'] ?? ''}`}>
          {fmt.pf}
        </span>
      </div>

      {/* Viewport */}
      <div
        ref={vpRef}
        className="relative overflow-hidden cursor-grab active:cursor-grabbing bg-gray-100 select-none mx-auto block"
        style={{ width: pw, height: ph }}
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

      {/* Controls */}
      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
        {/* Zoom */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs text-gray-400">⊕</span>
          <input
            type="range" min={100} max={400} value={Math.round(crop.zoom * 100)}
            onChange={e => onZoom(parseInt(e.target.value))}
            className="flex-1 cursor-pointer"
          />
          <span className="text-[10px] font-mono text-gray-500 min-w-[30px] text-right">{Math.round(crop.zoom * 100)}%</span>
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-1.5">
          <div className="text-[9px] font-mono text-gray-400 flex-1 truncate">{filename}</div>
          <button onClick={doSmartCrop} title="Smart Crop" className="text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-200 px-1.5 py-0.5 rounded transition">✦</button>
          <button onClick={doReset} title="Reset" className="text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-200 px-1.5 py-0.5 rounded transition">↺</button>
        </div>
      </div>
    </div>
  )
}
