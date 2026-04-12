'use client'

import { useState, useEffect } from 'react'
import { CHANNELS } from '@/lib/formats'
import { useSlicer } from './SlicerContext'
import type { FormatDef } from '@/types/slicer'

interface SavedDim {
  id: string
  label: string
  group: string | null
  width: number
  height: number
  created_at: string
}

const TAG_CLASSES: Record<string, string> = {
  't-soc': 'bg-indigo-50 text-indigo-600',
  't-eco': 'bg-green-50 text-green-700',
  't-pai': 'bg-amber-50 text-amber-600 border border-yellow-200',
  't-ret': 'bg-red-50 text-red-600 border border-red-100',
}

export default function ChannelAccordion() {
  const { state, dispatch } = useSlicer()
  const [open, setOpen] = useState<Set<string>>(new Set(['social']))

  function toggle(k: string) {
    setOpen(prev => {
      const next = new Set(prev)
      next.has(k) ? next.delete(k) : next.add(k)
      return next
    })
  }

  const allFmts = Object.entries(CHANNELS).flatMap(([, ch]) =>
    Object.values(ch.plats).flatMap(p => p.fmts),
  )
  const totalSel = allFmts.filter(f => state.selected.has(f.id)).length

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.7px]">Channels &amp; Formats</div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => dispatch({ type: 'SELECT_ALL' })} className="text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded transition">Select all</button>
          <button onClick={() => dispatch({ type: 'SELECT_NONE' })} className="text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded transition">Clear</button>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${totalSel > 0 ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
            {totalSel} selected
          </span>
        </div>
      </div>

      {/* Channel accordions */}
      {Object.entries(CHANNELS).map(([ck, ch]) => {
        const chFmts = Object.values(ch.plats).flatMap(p => p.fmts)
        const nSel = chFmts.filter(f => state.selected.has(f.id)).length
        const isOpen = open.has(ck)
        return (
          <div key={ck} className="border border-gray-200 rounded-xl overflow-hidden mb-2 bg-white shadow-sm">
            {/* Channel header */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer bg-white hover:bg-gray-50 transition-colors select-none"
              onClick={() => toggle(ck)}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{ch.icon}</span>
                <h3 className="text-[13px] font-bold text-gray-800">{ch.label}</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ml-1 ${nSel > 0 ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                  {nSel}/{chFmts.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 px-2 py-0.5 rounded transition"
                  onClick={e => { e.stopPropagation(); dispatch({ type: 'TOGGLE_CHANNEL_ALL', channelKey: ck }) }}
                >
                  {nSel === chFmts.length ? 'Deselect' : 'Select'} all
                </button>
                <span className={`text-[10px] text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
              </div>
            </div>

            {/* Platform groups */}
            {isOpen && (
              <div className="px-4 pb-4 pt-3 border-t border-gray-100">
                {Object.entries(ch.plats).map(([pk, pl]) => (
                  <div key={pk} className="mb-3.5 last:mb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-gray-500 tracking-[0.2px]">{pl.label}</span>
                      <button
                        className="text-xs text-gray-400 hover:text-gray-700 px-1 rounded transition"
                        onClick={() => dispatch({ type: 'TOGGLE_PLATFORM_ALL', channelKey: ck, platformKey: pk })}
                      >
                        {pl.fmts.every(f => state.selected.has(f.id)) ? '− all' : '+ all'}
                      </button>
                    </div>
                    <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
                      {pl.fmts.map(fmt => {
                        const sel = state.selected.has(fmt.id)
                        return (
                          <div
                            key={fmt.id}
                            onClick={() => dispatch({ type: 'TOGGLE_FORMAT', id: fmt.id })}
                            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-pointer transition-all ${sel ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50'}`}
                          >
                            <div className={`w-[15px] h-[15px] rounded-[4px] border-[1.5px] flex items-center justify-center flex-shrink-0 text-[8px] text-white transition-all ${sel ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                              {sel && '✓'}
                            </div>
                            <div>
                              <div className="text-[11px] font-medium text-gray-800 leading-tight">{fmt.n}</div>
                              <div className="text-[10px] text-gray-400 mt-0.5">{fmt.w}×{fmt.h}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Custom dimensions */}
      <CustomDimensions />
    </div>
  )
}

function CustomDimensions() {
  const { state, dispatch } = useSlicer()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [group, setGroup] = useState('')
  const [w, setW] = useState('')
  const [h, setH] = useState('')

  // Saved dimensions from Supabase
  const [savedDims, setSavedDims] = useState<SavedDim[]>([])
  const [loadingSaved, setLoadingSaved] = useState(false)

  // Inline save UX: which session chip is in "name + save" mode
  const [savingId, setSavingId] = useState<string | null>(null)
  const [saveLabel, setSaveLabel] = useState('')
  const [savePending, setSavePending] = useState(false)

  // Load saved dims when the panel opens
  useEffect(() => {
    if (!open) return
    setLoadingSaved(true)
    fetch('/api/custom-dimensions')
      .then(r => r.json())
      .then((data: unknown) => { if (Array.isArray(data)) setSavedDims(data as SavedDim[]) })
      .catch(() => {})
      .finally(() => setLoadingSaved(false))
  }, [open])

  function add() {
    if (!name || !w || !h) return
    const id = 'c-' + Math.random().toString(36).slice(2, 8)
    dispatch({
      type: 'ADD_CUSTOM',
      fmt: { id, n: name, zf: name.replace(/\s+/g, '-'), platform: group || 'Custom', w: parseInt(w), h: parseInt(h) },
    })
    setName(''); setGroup(''); setW(''); setH('')
  }

  async function handleSave(fmt: FormatDef) {
    setSavePending(true)
    try {
      const res = await fetch('/api/custom-dimensions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: saveLabel.trim() || fmt.n, group: fmt.platform, width: fmt.w, height: fmt.h }),
      })
      const data = await res.json() as SavedDim
      if (res.ok) {
        setSavedDims(prev => [data, ...prev])
        setSavingId(null)
        setSaveLabel('')
      }
    } finally {
      setSavePending(false)
    }
  }

  async function deleteSaved(id: string) {
    setSavedDims(prev => prev.filter(d => d.id !== id))
    await fetch(`/api/custom-dimensions/${id}`, { method: 'DELETE' })
  }

  function useSaved(dim: SavedDim) {
    const id = 'c-' + Math.random().toString(36).slice(2, 8)
    dispatch({
      type: 'ADD_CUSTOM',
      fmt: { id, n: dim.label, zf: dim.label.replace(/\s+/g, '-'), platform: dim.group ?? 'Custom', w: dim.width, h: dim.height },
    })
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-2 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition select-none" onClick={() => setOpen(p => !p)}>
        <div className="flex items-center gap-2">
          <span className="text-base">✏️</span>
          <h3 className="text-[13px] font-bold text-gray-800">Custom Dimensions</h3>
          {state.custom.length > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 ml-1">{state.custom.length}</span>
          )}
        </div>
        <span className={`text-[10px] text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-gray-100">

          {/* ── Saved dimensions ──────────────────────────────── */}
          {loadingSaved && (
            <p className="text-[11px] text-gray-400 mb-3">Loading saved dimensions…</p>
          )}
          {!loadingSaved && savedDims.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.6px] mb-2">Saved Dimensions</div>
              <div className="flex flex-wrap gap-1.5">
                {savedDims.map(dim => (
                  <span key={dim.id} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-[11px] font-medium text-indigo-700">
                    <span>{dim.label}</span>
                    <span className="text-indigo-400 font-normal">{dim.width}×{dim.height}</span>
                    <button
                      onClick={() => useSaved(dim)}
                      title="Add to this session"
                      className="text-[10px] font-semibold text-indigo-500 hover:text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-1.5 py-0.5 rounded transition"
                    >
                      + Use
                    </button>
                    <button
                      onClick={() => deleteSaved(dim.id)}
                      title="Delete saved dimension"
                      className="text-indigo-300 hover:text-red-500 transition leading-none"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Add new ───────────────────────────────────────── */}
          <p className="text-xs text-gray-500 mb-3">Add any dimensions not covered above — print specs, retail signage, bespoke placements.</p>
          <div className="flex gap-2 flex-wrap items-end">
            {[
              { label: 'Name', val: name, set: setName, ph: 'Store Window', w: '140px' },
              { label: 'Group', val: group, set: setGroup, ph: 'Retail', w: '100px' },
            ].map(({ label, val, set, ph, w: fw }) => (
              <div key={label} className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4px]">{label}</label>
                <input
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                  style={{ width: fw }}
                  placeholder={ph}
                  value={val}
                  onChange={e => set(e.target.value)}
                />
              </div>
            ))}
            {[
              { label: 'W (px)', val: w, set: setW, ph: '1080' },
              { label: 'H (px)', val: h, set: setH, ph: '1920' },
            ].map(({ label, val, set, ph }) => (
              <div key={label} className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4px]">{label}</label>
                <input
                  type="number"
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition w-20"
                  placeholder={ph}
                  value={val}
                  onChange={e => set(e.target.value)}
                />
              </div>
            ))}
            <button onClick={add} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition h-[34px]">+ Add</button>
          </div>

          {/* ── Session chips with inline save ────────────────── */}
          {state.custom.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {state.custom.map(f => {
                const isSaving = savingId === f.id
                const alreadySaved = savedDims.some(d => d.width === f.w && d.height === f.h && d.label === f.n)
                return isSaving ? (
                  // Inline label input for saving
                  <span key={f.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-400 text-[11px] font-medium text-indigo-700">
                    <input
                      autoFocus
                      value={saveLabel}
                      onChange={e => setSaveLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSave(f); if (e.key === 'Escape') { setSavingId(null); setSaveLabel('') } }}
                      placeholder={f.n}
                      className="bg-transparent outline-none border-b border-indigo-300 w-28 text-[11px] placeholder-indigo-300"
                    />
                    <button
                      onClick={() => handleSave(f)}
                      disabled={savePending}
                      title="Confirm save"
                      className="text-indigo-500 hover:text-indigo-700 font-bold transition disabled:opacity-50"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => { setSavingId(null); setSaveLabel('') }}
                      title="Cancel"
                      className="text-indigo-300 hover:text-red-400 transition"
                    >
                      ✕
                    </button>
                  </span>
                ) : (
                  <span key={f.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200 text-[11px] font-medium text-gray-700">
                    {f.n} <span className="text-gray-400">{f.w}×{f.h}</span>
                    {/* Save for future use */}
                    {!alreadySaved && (
                      <button
                        onClick={() => { setSavingId(f.id); setSaveLabel(f.n) }}
                        title="Save for future use"
                        className="text-gray-400 hover:text-indigo-500 transition text-xs leading-none"
                      >
                        🔖
                      </button>
                    )}
                    {alreadySaved && (
                      <span title="Already saved" className="text-indigo-400 text-xs leading-none">🔖</span>
                    )}
                    <button onClick={() => dispatch({ type: 'REMOVE_CUSTOM', id: f.id })} className="text-gray-400 hover:text-red-500 ml-0.5 text-xs leading-none">✕</button>
                  </span>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
