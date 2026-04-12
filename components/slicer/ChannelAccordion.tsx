'use client'

import { useState, useEffect, useRef } from 'react'
import { CHANNELS } from '@/lib/formats'
import { useSlicer } from './SlicerContext'
import type { FormatDef } from '@/types/slicer'

interface SavedCampaign {
  id: string
  campaign_name: string
  selected_formats: string[]
  created_at: string
}

export default function ChannelAccordion() {
  const { state, dispatch } = useSlicer()
  const [open, setOpen] = useState<Set<string>>(new Set(['social']))

  // ── Past campaigns ────────────────────────────────────────────
  const [showCampaigns, setShowCampaigns] = useState(false)
  const [campaigns, setCampaigns] = useState<SavedCampaign[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(false)
  const campaignRef = useRef<HTMLDivElement>(null)

  // ── Saved custom dim IDs (from Supabase, to distinguish from session-only) ──
  const [savedCustomIds, setSavedCustomIds] = useState<Set<string>>(new Set())

  // Load saved custom dims once on mount → dispatch LOAD_SAVED_CUSTOM
  const customLoadedRef = useRef(false)
  useEffect(() => {
    if (customLoadedRef.current) return
    customLoadedRef.current = true
    fetch('/api/custom-dimensions')
      .then(r => r.json())
      .then((data: unknown) => {
        if (!Array.isArray(data) || data.length === 0) return
        const fmts: FormatDef[] = (data as { id: string; name: string; group: string | null; width: number; height: number }[])
          .map(d => ({
            id: d.id,
            n: d.name,
            zf: d.name.replace(/\s+/g, '-'),
            platform: d.group ?? 'Custom',
            w: d.width,
            h: d.height,
          }))
        dispatch({ type: 'LOAD_SAVED_CUSTOM', fmts })
        setSavedCustomIds(new Set(fmts.map(f => f.id)))
      })
      .catch(() => {})
  }, [dispatch])

  // Load past campaigns when dropdown opens
  useEffect(() => {
    if (!showCampaigns) return
    setLoadingCampaigns(true)
    fetch('/api/saved-campaigns')
      .then(r => r.json())
      .then((data: unknown) => { if (Array.isArray(data)) setCampaigns(data as SavedCampaign[]) })
      .catch(() => {})
      .finally(() => setLoadingCampaigns(false))
  }, [showCampaigns])

  // Close campaign dropdown on outside click
  useEffect(() => {
    if (!showCampaigns) return
    function handler(e: MouseEvent) {
      if (campaignRef.current && !campaignRef.current.contains(e.target as Node)) {
        setShowCampaigns(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showCampaigns])

  function toggle(k: string) {
    setOpen(prev => {
      const next = new Set(prev)
      next.has(k) ? next.delete(k) : next.add(k)
      return next
    })
  }

  function restoreCampaign(c: SavedCampaign) {
    dispatch({ type: 'SET_SELECTION', ids: c.selected_formats })
    setShowCampaigns(false)
  }

  const allFmts = Object.entries(CHANNELS).flatMap(([, ch]) =>
    Object.values(ch.plats).flatMap(p => p.fmts),
  )
  // Include custom dims in total selected count
  const totalSel = [...allFmts, ...state.custom].filter(f => state.selected.has(f.id)).length

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.7px]">Channels &amp; Formats</div>
        <div className="flex items-center gap-1.5 flex-wrap">

          {/* Past campaigns dropdown */}
          <div className="relative" ref={campaignRef}>
            <button
              onClick={() => setShowCampaigns(p => !p)}
              className={`text-xs px-2 py-1 rounded transition flex items-center gap-1 ${showCampaigns ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
            >
              🕐 Past campaigns
            </button>
            {showCampaigns && (
              <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-[260px] overflow-hidden">
                {loadingCampaigns && (
                  <p className="text-xs text-gray-400 px-3 py-3">Loading…</p>
                )}
                {!loadingCampaigns && campaigns.length === 0 && (
                  <div className="px-3 py-3">
                    <p className="text-[11px] text-gray-500 font-medium">No past campaigns yet.</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Your format selections are saved each time you proceed past this step.</p>
                  </div>
                )}
                {!loadingCampaigns && campaigns.map(c => (
                  <button
                    key={c.id}
                    onClick={() => restoreCampaign(c)}
                    className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 transition-colors flex items-start justify-between gap-3 group border-b border-gray-100 last:border-0"
                  >
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold text-gray-800 group-hover:text-indigo-700 truncate">{c.campaign_name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {c.selected_formats.length} formats · {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <span className="text-[11px] text-indigo-500 font-semibold mt-0.5 flex-shrink-0 group-hover:text-indigo-700">Use →</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-gray-200" />
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
      <CustomDimensions savedCustomIds={savedCustomIds} setSavedCustomIds={setSavedCustomIds} />
    </div>
  )
}

// ── Custom Dimensions panel ────────────────────────────────────

function CustomDimensions({
  savedCustomIds,
  setSavedCustomIds,
}: {
  savedCustomIds: Set<string>
  setSavedCustomIds: React.Dispatch<React.SetStateAction<Set<string>>>
}) {
  const { state, dispatch } = useSlicer()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [group, setGroup] = useState('')
  const [w, setW] = useState('')
  const [h, setH] = useState('')
  const [adding, setAdding] = useState(false)

  // Saved dims = those in state.custom whose IDs came from Supabase
  const savedDims = state.custom.filter(f => savedCustomIds.has(f.id))
  // Session-only dims = added this session but not saved (e.g. not logged in)
  const sessionDims = state.custom.filter(f => !savedCustomIds.has(f.id))

  async function add() {
    if (!name || !w || !h) return
    const width = parseInt(w), height = parseInt(h)
    if (isNaN(width) || isNaN(height)) return
    setAdding(true)
    try {
      const res = await fetch('/api/custom-dimensions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, group: group || null, width, height }),
      })
      if (res.ok) {
        const saved = await res.json() as { id: string }
        dispatch({
          type: 'ADD_CUSTOM',
          fmt: { id: saved.id, n: name, zf: name.replace(/\s+/g, '-'), platform: group || 'Custom', w: width, h: height },
        })
        setSavedCustomIds(prev => new Set([...prev, saved.id]))
      } else {
        // Not logged in or error — add with temp ID (session only)
        dispatch({
          type: 'ADD_CUSTOM',
          fmt: { id: 'c-' + Math.random().toString(36).slice(2, 8), n: name, zf: name.replace(/\s+/g, '-'), platform: group || 'Custom', w: width, h: height },
        })
      }
    } catch {
      dispatch({
        type: 'ADD_CUSTOM',
        fmt: { id: 'c-' + Math.random().toString(36).slice(2, 8), n: name, zf: name.replace(/\s+/g, '-'), platform: group || 'Custom', w: width, h: height },
      })
    } finally {
      setAdding(false)
      setName(''); setGroup(''); setW(''); setH('')
    }
  }

  async function deleteSaved(id: string) {
    // Optimistic remove
    dispatch({ type: 'REMOVE_CUSTOM', id })
    setSavedCustomIds(prev => { const next = new Set(prev); next.delete(id); return next })
    await fetch(`/api/custom-dimensions/${id}`, { method: 'DELETE' })
  }

  const totalCustom = state.custom.length

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-2 bg-white shadow-sm">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition select-none"
        onClick={() => setOpen(p => !p)}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">✏️</span>
          <h3 className="text-[13px] font-bold text-gray-800">Custom Dimensions</h3>
          {totalCustom > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 ml-1">{totalCustom}</span>
          )}
        </div>
        <span className={`text-[10px] text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-gray-100">

          {/* ── Saved custom dims as format cards ─────────────── */}
          {savedDims.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.6px] mb-2">Your saved dimensions</div>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
                {savedDims.map(fmt => {
                  const sel = state.selected.has(fmt.id)
                  return (
                    <div
                      key={fmt.id}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-all ${sel ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50'}`}
                    >
                      {/* Checkbox area */}
                      <div
                        onClick={() => dispatch({ type: 'TOGGLE_FORMAT', id: fmt.id })}
                        className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                      >
                        <div className={`w-[15px] h-[15px] rounded-[4px] border-[1.5px] flex items-center justify-center flex-shrink-0 text-[8px] text-white transition-all ${sel ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                          {sel && '✓'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium text-gray-800 leading-tight truncate">{fmt.n}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{fmt.w}×{fmt.h}</div>
                        </div>
                      </div>
                      {/* Trash icon — permanent delete */}
                      <button
                        onClick={() => deleteSaved(fmt.id)}
                        title="Permanently delete this saved dimension"
                        className="flex-shrink-0 text-gray-300 hover:text-red-500 transition leading-none text-sm"
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Session-only dims (not saved, e.g. logged-out user) ── */}
          {sessionDims.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {sessionDims.map(f => (
                <span key={f.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200 text-[11px] font-medium text-gray-700">
                  {f.n} <span className="text-gray-400">{f.w}×{f.h}</span>
                  <button onClick={() => dispatch({ type: 'REMOVE_CUSTOM', id: f.id })} className="text-gray-400 hover:text-red-500 ml-0.5 text-xs leading-none">✕</button>
                </span>
              ))}
            </div>
          )}

          {/* ── Add new dimension form ────────────────────────── */}
          <p className="text-xs text-gray-500 mb-3">Add any dimensions not covered above — print specs, retail signage, bespoke placements.</p>
          <div className="flex gap-2 flex-wrap items-end">
            {[
              { label: 'Name', val: name, set: setName, ph: 'Store Window', fw: '140px' },
              { label: 'Group', val: group, set: setGroup, ph: 'Retail', fw: '100px' },
            ].map(({ label, val, set, ph, fw }) => (
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
                  onKeyDown={e => { if (e.key === 'Enter') add() }}
                />
              </div>
            ))}
            <button
              onClick={add}
              disabled={adding || !name || !w || !h}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition h-[34px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? '…' : '+ Add'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
