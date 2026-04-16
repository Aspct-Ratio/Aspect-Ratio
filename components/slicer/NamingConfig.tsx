'use client'

import { useState } from 'react'
import { useSlicer } from './SlicerContext'
import { getSelectedFormats } from '@/lib/formats'
import { buildFilename, getFolderParts } from '@/lib/crop'

const NAMING_PRESETS = [
  { value: '{client}_{dimension}',                     label: 'Short — Brand_Dimension' },
  { value: '{client}_{platform}_{dimension}',          label: 'Standard — Brand_Platform_Dimension' },
  { value: '{client}_{channel}_{platform}_{dimension}',label: 'Verbose — Brand_Channel_Platform_Dimension' },
  { value: '{client}_{assetname}_{dimension}',         label: 'Asset — Brand_AssetName_Dimension' },
  { value: 'custom',                                    label: 'Custom pattern…' },
]

const PRESET_VALUES = new Set(NAMING_PRESETS.slice(0, -1).map(p => p.value))

const TOKENS = [
  { t: '{brand}',       dim: false, title: 'Brand / client name' },
  { t: '{campaign}',    dim: false, title: 'Campaign name' },
  { t: '{format}',      dim: false, title: 'Platform format (e.g. Instagram, TikTok)' },
  { t: '{dimension}',   dim: true,  title: 'Width × Height e.g. 1080x1920' },
  { t: '{asset}',       dim: false, title: 'Source asset filename' },
  { t: '{channel}',     dim: false, title: 'Channel folder name (e.g. Social-Media)' },
  { t: '{date}',        dim: false, title: 'Date as YYYYMMDD' },
]


export default function NamingConfig() {
  const { state, dispatch } = useSlicer()
  const [customMode, setCustomMode] = useState(() => !PRESET_VALUES.has(state.namingPattern))

  const selectedFmts = getSelectedFormats(state.selected, state.custom)
  const sampleFmt = selectedFmts[0]
  const firstExt = Array.from(state.exportFormats)[0]
  const ext = firstExt === 'jpeg' ? 'jpg' : firstExt
  const previewName = sampleFmt
    ? buildFilename({ pattern: state.namingPattern, clientName: state.clientName, campaignName: state.campaignName, fmt: sampleFmt, assetName: 'hero-image' }) + '.' + ext
    : 'Brand_1080x1080.jpg'

  const pathParts = sampleFmt ? getFolderParts(sampleFmt, state.folderLevels) : []
  const root = state.rootFolderName.trim()
    ? state.rootFolderName.trim().replace(/\s+/g, '-')
    : (state.clientName || 'Brand').replace(/\s+/g, '-') + '-assets'
  const pathPreview = root + '/' + (pathParts.length ? pathParts.join('/') + '/' : '') + 'filename.' + ext

  function onPresetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value
    if (v === 'custom') {
      setCustomMode(true)
      // Keep current pattern as starting point so the preview stays meaningful
    } else {
      setCustomMode(false)
      dispatch({ type: 'SET_NAMING_PATTERN', pattern: v })
    }
  }

  function toggleToken(t: string) {
    const current = state.namingPattern
    if (current.includes(t)) {
      // Remove the token plus any adjacent underscore separator
      const cleaned = current
        .replace(new RegExp(`_?${t.replace(/[{}]/g, '\\$&')}_?`, 'g'), '_')
        .replace(/_+/g, '_')       // collapse double underscores
        .replace(/^_|_$/g, '')     // trim leading/trailing underscores
      dispatch({ type: 'SET_NAMING_PATTERN', pattern: cleaned || '{brand}' })
    } else {
      // Append with underscore separator
      const next = current ? `${current}_${t}` : t
      dispatch({ type: 'SET_NAMING_PATTERN', pattern: next })
    }
  }

  return (
    <>
      {/* ── Naming ── */}
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.7px] mb-2">File Naming</div>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-3.5">
        <div className="mb-3.5">
          <label className="block text-xs font-medium text-gray-700 mb-1">Brand / Client Name</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            placeholder="e.g. UGG, Nike, Adidas"
            value={state.clientName}
            onChange={e => dispatch({ type: 'SET_CLIENT_NAME', name: e.target.value })}
          />
        </div>

        <div className="mb-3.5">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Campaign Name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            placeholder="e.g. FY26-Tech-Fleece"
            value={state.campaignName}
            onChange={e => dispatch({ type: 'SET_CAMPAIGN_NAME', name: e.target.value })}
          />
          <p className="text-[10px] text-gray-400 mt-1">When filled, outputs as Brand_Campaign_… in the filename.</p>
        </div>

        <div className="mb-3.5">
          <label className="block text-xs font-medium text-gray-700 mb-1">Naming Pattern</label>
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition bg-white cursor-pointer appearance-none"
            value={customMode ? 'custom' : state.namingPattern}
            onChange={onPresetChange}
          >
            {NAMING_PRESETS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <p className="text-[11px] text-gray-400 mt-1">Folder structure handles full organization — filename stays clean.</p>
        </div>

        {/* Custom pattern */}
        {customMode && (
          <div className="mb-4 bg-gray-50 border border-gray-200 rounded-xl p-3.5">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Custom pattern</label>

            {/* Token buttons */}
            <p className="text-[11px] text-gray-500 mb-2">Click to toggle a token on or off. Active tokens are highlighted.</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {TOKENS.map(({ t, title }) => {
                const active = state.namingPattern.includes(t)
                return (
                  <button
                    key={t}
                    title={title}
                    onClick={() => toggleToken(t)}
                    className={`font-mono text-[11px] font-semibold px-2 py-1 rounded-[5px] border transition cursor-pointer select-none ${
                      active
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-gray-200 text-indigo-500 hover:bg-indigo-50 hover:border-indigo-300'
                    }`}
                  >{t}</button>
                )
              })}
            </div>

            {/* Free-text input */}
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition bg-white"
              placeholder="{brand}_{format}_{dimension}"
              value={state.namingPattern}
              onChange={e => dispatch({ type: 'SET_NAMING_PATTERN', pattern: e.target.value })}
            />

            {/* Placeholder reference */}
            <div className="mt-2.5 text-[11px] text-gray-500 leading-relaxed">
              <p className="font-semibold text-gray-600 mb-1">Available placeholders:</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                <span><code className="bg-gray-200 px-1 rounded text-[10px]">{'{brand}'}</code> — brand / client name</span>
                <span><code className="bg-gray-200 px-1 rounded text-[10px]">{'{campaign}'}</code> — campaign name</span>
                <span><code className="bg-gray-200 px-1 rounded text-[10px]">{'{format}'}</code> — platform (Instagram…)</span>
                <span><code className="bg-gray-200 px-1 rounded text-[10px]">{'{dimension}'}</code> — e.g. 1080x1920</span>
                <span><code className="bg-gray-200 px-1 rounded text-[10px]">{'{asset}'}</code> — source filename</span>
                <span><code className="bg-gray-200 px-1 rounded text-[10px]">{'{date}'}</code> — YYYYMMDD</span>
              </div>
              <p className="mt-1.5 text-gray-400">Use <code className="bg-gray-200 px-1 rounded text-[10px]">_</code> or <code className="bg-gray-200 px-1 rounded text-[10px]">-</code> between tokens. Spaces are auto-converted to hyphens.</p>
            </div>
          </div>
        )}

        {/* Preview */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Filename Preview</label>
          <div className="font-mono text-xs px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-indigo-600 break-all leading-relaxed">
            {previewName}
          </div>
          <div className="text-[10px] text-gray-400 mt-1.5 font-mono">Path: {pathPreview}</div>
        </div>
      </div>

    </>
  )
}
