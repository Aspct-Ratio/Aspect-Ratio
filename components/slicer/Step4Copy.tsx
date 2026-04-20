'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useSlicer } from './SlicerContext'
import { getSelectedFormats } from '@/lib/formats'
import { renderToCanvas, renderToCanvasWithText } from '@/lib/crop'
import TextEditor from './TextEditor'
import type { FormatDef, TextLayer } from '@/types/slicer'

const TAG_CLASSES: Record<string, string> = {
  't-soc': 'bg-indigo-50 text-indigo-600',
  't-eco': 'bg-green-50 text-green-700',
  't-pai': 'bg-amber-50 text-amber-600',
  't-ret': 'bg-red-50 text-red-600',
}

const CHANNEL_ORDER  = ['social', 'ecomm', 'paid', 'retail']
const CHANNEL_LABELS: Record<string, string> = {
  social: 'Social Media', ecomm: 'Ecommerce',
  paid: 'Paid Media',     retail: 'Retail / OOH', other: 'Custom',
}

const CARD_MAX_W = 240
const CARD_MAX_H = 200

interface Props {
  onBack: () => void
  onNext: () => void
  onSkip: () => void
}

// ── Tiny canvas card preview ────────────────────────────────────

function TextPreviewCard({ fmt }: { fmt: FormatDef }) {
  const { state } = useSlicer()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const ar = fmt.w / fmt.h
  let pw: number, ph: number
  if (ar >= 1) { pw = CARD_MAX_W; ph = Math.round(pw / ar); if (ph > CARD_MAX_H) { ph = CARD_MAX_H; pw = Math.round(ph * ar) } }
  else         { ph = CARD_MAX_H; pw = Math.round(ph * ar);  if (pw > CARD_MAX_W) { pw = CARD_MAX_W; ph = Math.round(pw / ar) } }
  pw = Math.max(pw, 40); ph = Math.max(ph, 28)

  const file  = state.files[state.activeFile]
  const crop  = file ? state.crops[file.id]?.[fmt.id] : null
  const layers = file ? (state.textLayers[file.id]?.[fmt.id] ?? []) : []

  useEffect(() => {
    if (!canvasRef.current || !file || !crop) return
    const offscreen = document.createElement('canvas')
    renderToCanvasWithText(offscreen, fmt, file, crop, layers)
    const c = canvasRef.current
    c.width  = pw
    c.height = ph
    c.getContext('2d')?.drawImage(offscreen, 0, 0, pw, ph)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fmt.id, file?.id, JSON.stringify(crop), JSON.stringify(layers), pw, ph])

  return (
    <canvas
      ref={canvasRef}
      width={pw}
      height={ph}
      className="block"
      style={{ width: pw, height: ph }}
    />
  )
}

// ── Apply-to dropdown (stackable filters) ──────────────────────

interface ApplyDropdownProps {
  fmts: FormatDef[]
  sourceFmt: FormatDef
  fileId: string
  onClose: () => void
}

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

function ApplyDropdown({ fmts, sourceFmt, fileId, onClose }: ApplyDropdownProps) {
  const { state, dispatch } = useSlicer()
  const [orientations, setOrientations] = useState<Set<string>>(new Set())
  const [channels, setChannels] = useState<Set<string>>(new Set())

  function toggleOrientation(key: string) {
    setOrientations(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function toggleChannel(key: string) {
    setChannels(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const targets = applyFilters(fmts, sourceFmt.id, orientations, channels)

  function apply() {
    const sourceLayers = state.textLayers[fileId]?.[sourceFmt.id] ?? []
    if (sourceLayers.length === 0 || targets.length === 0) { onClose(); return }
    dispatch({
      type: 'APPLY_TEXT_TO_FORMATS',
      fileId,
      sourceFormatId: sourceFmt.id,
      sourceDims: { w: sourceFmt.w, h: sourceFmt.h },
      targets: targets.map(f => ({ formatId: f.id, w: f.w, h: f.h })),
    })
    onClose()
  }

  return (
    <div className="absolute left-0 bottom-full mb-1 z-40 bg-white border border-gray-200 rounded-xl shadow-xl w-64 p-3 space-y-3">
      {/* Orientation filters */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.6px] text-gray-400 mb-1.5">Orientation</p>
        <div className="flex flex-wrap gap-1.5">
          {ORIENTATION_FILTERS.map(f => (
            <button key={f.key} onClick={() => toggleOrientation(f.key)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                orientations.has(f.key)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-200 hover:text-indigo-600'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {/* Channel filters */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.6px] text-gray-400 mb-1.5">Channel</p>
        <div className="flex flex-wrap gap-1.5">
          {CHANNEL_FILTERS.map(f => (
            <button key={f.key} onClick={() => toggleChannel(f.key)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                channels.has(f.key)
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
          {orientations.size === 0 && channels.size === 0
            ? `${targets.length} formats (all)`
            : `${targets.length} format${targets.length !== 1 ? 's' : ''} matched`}
        </span>
        <div className="flex gap-1.5">
          <button onClick={onClose}
            className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-700 transition">
            Cancel
          </button>
          <button onClick={apply} disabled={targets.length === 0}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-lg transition disabled:opacity-40">
            Apply to {targets.length}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Remove-from dropdown (stackable filters) ───────────────────

interface RemoveDropdownProps {
  fmts: FormatDef[]
  fileId: string
  onClose: () => void
}

function RemoveDropdown({ fmts, fileId, onClose }: RemoveDropdownProps) {
  const { state, dispatch } = useSlicer()
  const [orientations, setOrientations] = useState<Set<string>>(new Set())
  const [channels, setChannels] = useState<Set<string>>(new Set())

  function toggleOrientation(key: string) {
    setOrientations(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function toggleChannel(key: string) {
    setChannels(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  // Only show formats that have text
  const withText = fmts.filter(f => (state.textLayers[fileId]?.[f.id] ?? []).length > 0)
  const targets = applyFilters(withText, '', orientations, channels)

  function remove() {
    if (targets.length === 0) { onClose(); return }
    dispatch({
      type: 'CLEAR_TEXT_LAYERS_BATCH',
      fileId,
      formatIds: targets.map(f => f.id),
    })
    onClose()
  }

  return (
    <div className="absolute left-0 top-full mt-1 z-40 bg-white border border-gray-200 rounded-xl shadow-xl w-64 p-3 space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.6px] text-gray-400 mb-1.5">Orientation</p>
        <div className="flex flex-wrap gap-1.5">
          {ORIENTATION_FILTERS.map(f => (
            <button key={f.key} onClick={() => toggleOrientation(f.key)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                orientations.has(f.key)
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-red-200 hover:text-red-600'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.6px] text-gray-400 mb-1.5">Channel</p>
        <div className="flex flex-wrap gap-1.5">
          {CHANNEL_FILTERS.map(f => (
            <button key={f.key} onClick={() => toggleChannel(f.key)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                channels.has(f.key)
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-red-200 hover:text-red-600'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-[11px] text-gray-400">
          {orientations.size === 0 && channels.size === 0
            ? `${targets.length} with text`
            : `${targets.length} matched`}
        </span>
        <div className="flex gap-1.5">
          <button onClick={onClose}
            className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-700 transition">
            Cancel
          </button>
          <button onClick={remove} disabled={targets.length === 0}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold rounded-lg transition disabled:opacity-40">
            Remove from {targets.length}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Format card ─────────────────────────────────────────────────

function CopyCard({
  fmt,
  fileId,
  fmts,
  onEdit,
}: {
  fmt: FormatDef
  fileId: string
  fmts: FormatDef[]
  onEdit: (fmt: FormatDef) => void
}) {
  const { state, dispatch } = useSlicer()
  const [applyOpen, setApplyOpen] = useState(false)
  const layers = state.textLayers[fileId]?.[fmt.id] ?? []
  const hasText = layers.length > 0

  function clearLayers() {
    dispatch({ type: 'CLEAR_TEXT_LAYERS', fileId, formatId: fmt.id })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-md transition-shadow relative">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-gray-100 flex items-start justify-between gap-2 rounded-t-xl">
        <div>
          <div className="text-sm font-bold text-gray-800 leading-tight">{fmt.n}</div>
          <div className="text-xs text-gray-400 mt-0.5">{fmt.w}×{fmt.h}</div>
        </div>
        <div className="flex items-center gap-1.5">
          {hasText && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-600">Aa</span>
          )}
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${TAG_CLASSES[fmt.pc ?? 't-soc'] ?? ''}`}>
            {fmt.pf}
          </span>
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center justify-center bg-gray-100 min-h-[80px]">
        <TextPreviewCard fmt={fmt} />
      </div>

      {/* Controls */}
      <div className="px-3.5 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => onEdit(fmt)}
          className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition whitespace-nowrap"
        >
          ✎ Edit
        </button>
        {hasText && (
          <>
            <div className="relative">
              <button
                onClick={() => setApplyOpen(o => !o)}
                className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white hover:bg-gray-100 transition whitespace-nowrap"
              >
                Apply to… ▾
              </button>
              {applyOpen && (
                <ApplyDropdown
                  fmts={fmts}
                  sourceFmt={fmt}
                  fileId={fileId}
                  onClose={() => setApplyOpen(false)}
                />
              )}
            </div>
            <button
              onClick={clearLayers}
              className="text-xs font-semibold border border-gray-200 rounded-lg px-2 py-1.5 text-red-500 bg-white hover:bg-red-50 transition"
              title="Clear text layers"
            >
              ✕
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main step ───────────────────────────────────────────────────

export default function Step4Copy({ onBack, onNext, onSkip }: Props) {
  const { state } = useSlicer()
  const [editingFmt, setEditingFmt] = useState<FormatDef | null>(null)
  const [removeOpen, setRemoveOpen] = useState(false)

  const fmts = getSelectedFormats(state.selected, state.custom)
  const file = state.files[state.activeFile]

  // Group by channel
  const byChannel: Record<string, FormatDef[]> = {}
  for (const f of fmts) {
    const key = f.ck ?? 'other'
    ;(byChannel[key] ??= []).push(f)
  }
  const groups = [...CHANNEL_ORDER, 'other']
    .filter(k => byChannel[k])
    .map(k => ({ ck: k, label: CHANNEL_LABELS[k] ?? k, fmts: byChannel[k] }))

  const closeEditor = useCallback(() => setEditingFmt(null), [])

  if (!file) return null

  const totalWithText = fmts.filter(f =>
    (state.textLayers[file.id]?.[f.id] ?? []).length > 0
  ).length

  return (
    <>
      <div className="animate-fade-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-2 flex-wrap gap-3">
          <div>
            <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">ADD COPY TO YOUR ASSETS</h1>
            <p className="text-sm text-gray-500 mt-1">
              Add headlines, subheaders, and CTAs. This step is optional — you can skip it.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {totalWithText > 0 && (
              <>
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-1">
                  {totalWithText} format{totalWithText !== 1 ? 's' : ''} with copy
                </span>
                <div className="relative">
                  <button
                    onClick={() => setRemoveOpen(o => !o)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                  >
                    Remove from… ▾
                  </button>
                  {removeOpen && (
                    <RemoveDropdown
                      fmts={fmts}
                      fileId={file.id}
                      onClose={() => setRemoveOpen(false)}
                    />
                  )}
                </div>
              </>
            )}
            <button
              onClick={onSkip}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition uppercase tracking-wide"
            >
              Skip — export without copy →
            </button>
          </div>
        </div>

        {/* File switcher (multi-file) */}
        {state.files.length > 1 && (
          <div className="mb-5">
            <p className="text-[11px] text-gray-500 font-semibold mb-2">Editing asset:</p>
            <div className="flex gap-1.5 flex-wrap">
              {state.files.map((f, i) => {
                const isActive = i === state.activeFile
                return (
                  <div
                    key={f.id}
                    className={`rounded-xl overflow-hidden border-2 cursor-pointer transition-all flex-shrink-0 w-[68px] ${
                      isActive ? 'border-indigo-500 shadow-[0_0_0_3px_rgba(79,70,229,0.15)]' : 'border-gray-200 hover:border-indigo-200'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.thumb} alt={f.name} className="w-full aspect-square object-cover" />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Format cards grouped by channel */}
        <div className="space-y-8">
          {groups.map(({ ck, label, fmts: groupFmts }) => (
            <div key={ck}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.7px]">{label}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))' }}>
                {groupFmts.map(fmt => (
                  <CopyCard
                    key={fmt.id}
                    fmt={fmt}
                    fileId={file.id}
                    fmts={fmts}
                    onEdit={setEditingFmt}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Nav */}
        <div className="flex justify-between items-center mt-9 pt-5 border-t border-gray-200">
          <button onClick={onBack} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition uppercase tracking-wide">
            ← Back
          </button>
          <button onClick={onNext} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition uppercase tracking-wide">
            Continue to Export →
          </button>
        </div>
      </div>

      {/* Text editor modal */}
      {editingFmt && (
        <TextEditor
          key={editingFmt.id}
          fmt={editingFmt}
          file={file}
          crop={state.crops[file.id]?.[editingFmt.id]}
          initialLayers={state.textLayers[file.id]?.[editingFmt.id] ?? []}
          allFmts={fmts}
          selectedFmts={fmts}
          fileId={file.id}
          onClose={closeEditor}
          onSwitchFormat={setEditingFmt}
        />
      )}
    </>
  )
}
