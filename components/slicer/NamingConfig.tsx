'use client'

import { useSlicer } from './SlicerContext'
import { getSelectedFormats } from '@/lib/formats'
import { buildFilename, getFolderParts } from '@/lib/crop'
import type { ExportFormat } from '@/types/slicer'

const NAMING_PRESETS = [
  { value: '{client}_{dimension}',                    label: 'Short — Brand_Dimension' },
  { value: '{client}_{platform}_{dimension}',         label: 'Standard — Brand_Platform_Dimension' },
  { value: '{client}_{channel}_{platform}_{dimension}',label: 'Verbose — Brand_Channel_Platform_Dimension' },
  { value: '{client}_{assetname}_{dimension}',        label: 'Asset — Brand_AssetName_Dimension' },
  { value: 'custom',                                   label: 'Custom pattern…' },
]

const TOKENS = [
  { t: '{client}', dim: false },
  { t: '{channel}', dim: false },
  { t: '{platform}', dim: false },
  { t: '{dimension}', dim: true, title: 'Outputs as WxH e.g. 1080x1920' },
  { t: '{width}x{height}', dim: true, title: 'Width × Height with automatic x separator' },
  { t: '{assetname}', dim: false },
  { t: '{date}', dim: false },
]

const EXPORT_FORMATS: { f: ExportFormat; label: string }[] = [
  { f: 'jpeg', label: 'JPG' },
  { f: 'png',  label: 'PNG' },
  { f: 'webp', label: 'WebP' },
  { f: 'pdf',  label: 'PDF' },
  { f: 'tiff', label: 'TIFF*' },
]

export default function NamingConfig() {
  const { state, dispatch } = useSlicer()

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

  const isCustom = !NAMING_PRESETS.slice(0, -1).some(p => p.value === state.namingPattern)

  function onPresetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value
    if (v !== 'custom') dispatch({ type: 'SET_NAMING_PATTERN', pattern: v })
  }

  function insertToken(t: string) {
    dispatch({ type: 'SET_NAMING_PATTERN', pattern: state.namingPattern + t })
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
            value={isCustom ? 'custom' : state.namingPattern}
            onChange={onPresetChange}
          >
            {NAMING_PRESETS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <p className="text-[11px] text-gray-400 mt-1">Folder structure handles full organization — filename stays clean.</p>
        </div>

        {/* Custom pattern */}
        {isCustom && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Build your pattern</label>
            <p className="text-[11px] text-gray-500 mb-2">Click tokens to insert · Use <code className="bg-gray-100 px-1 rounded text-[10px]">_</code> between sections</p>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {TOKENS.map(({ t, dim, title }) => (
                <button
                  key={t}
                  title={title}
                  onClick={() => insertToken(t)}
                  className={`font-mono text-[11px] font-medium px-2 py-1 rounded-[5px] border transition cursor-pointer text-indigo-600 ${dim ? 'bg-indigo-50 border-indigo-200 font-bold' : 'bg-gray-100 border-gray-200 hover:bg-indigo-50 hover:border-indigo-200'}`}
                >{t}</button>
              ))}
            </div>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition mt-2"
              placeholder="{client}_{dimension}"
              value={state.namingPattern}
              onChange={e => dispatch({ type: 'SET_NAMING_PATTERN', pattern: e.target.value })}
            />
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

      {/* ── Export formats ── */}
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.7px] mb-2">Export File Formats</div>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-3.5">
        <p className="text-xs text-gray-500 mb-2">All selected types export for every slice.</p>
        <div className="flex flex-wrap gap-1.5">
          {EXPORT_FORMATS.map(({ f, label }) => {
            const on = state.exportFormats.has(f)
            return (
              <button
                key={f}
                onClick={() => dispatch({ type: 'TOGGLE_EXPORT_FORMAT', fmt: f })}
                className={`px-3.5 py-1 rounded-full border-[1.5px] text-xs font-semibold transition ${on ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
              >{label}</button>
            )
          })}
        </div>
        <p className="text-[10px] text-gray-400 mt-2">*TIFF exports as PNG (browser limitation).</p>
      </div>

      {/* ── Quality ── */}
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.7px] mb-2">Quality</div>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 font-medium">JPG / WebP Quality</span>
          <span className="text-sm font-bold text-indigo-600">{state.quality}%</span>
        </div>
        <input
          type="range" min={60} max={100} value={state.quality}
          onChange={e => dispatch({ type: 'SET_QUALITY', value: parseInt(e.target.value) })}
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>Smaller file</span><span>Higher quality</span>
        </div>
      </div>
    </>
  )
}
