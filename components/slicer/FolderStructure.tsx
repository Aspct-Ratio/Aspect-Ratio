'use client'

import { useSlicer } from './SlicerContext'
import { getSelectedFormats } from '@/lib/formats'
import type { FolderLevel } from '@/types/slicer'

export default function FolderStructure() {
  const { state, dispatch } = useSlicer()

  const root = state.rootFolderName.trim()
    ? state.rootFolderName.trim().replace(/\s+/g, '-')
    : (state.clientName || 'Brand').replace(/\s+/g, '-') + '-assets'

  const sampleFmt = getSelectedFormats(state.selected, state.custom)[0]
  const ext = Array.from(state.exportFormats)[0] === 'jpeg' ? 'jpg' : Array.from(state.exportFormats)[0]

  function updateLevel(idx: number, patch: Partial<FolderLevel>) {
    const next = state.folderLevels.map((l, i) => i === idx ? { ...l, ...patch } : l)
    dispatch({ type: 'UPDATE_FOLDER_LEVELS', levels: next })
  }

  function moveLevel(idx: number, dir: -1 | 1) {
    const next = [...state.folderLevels]
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= next.length) return
    ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
    dispatch({ type: 'UPDATE_FOLDER_LEVELS', levels: next })
  }

  // Folder preview lines
  const lines = [`📁 ${root}/`]
  let indent = '  '
  state.folderLevels.filter(l => l.enabled).forEach(l => {
    const name = l.customName.trim()
      ? l.customName.trim()
      : sampleFmt
        ? (sampleFmt[l.key] as string) ?? l.exampleDefault
        : l.exampleDefault
    lines.push(`${indent}📁 ${name}/`)
    indent += '  '
  })
  lines.push(`${indent}📄 filename.${ext}`)

  return (
    <>
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.7px] mb-2">Folder Structure</div>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-3.5">
        <p className="text-xs text-gray-500 mb-3">Toggle, reorder, and rename the folder levels inside your ZIP.</p>

        {/* Root folder */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">📁</span>
          <label className="text-xs font-medium text-gray-700 flex-1">Root folder name</label>
          <input
            className="border border-gray-200 rounded-md px-2 py-1 text-[11px] font-mono outline-none focus:border-indigo-500 transition w-32"
            placeholder="brand-assets"
            value={state.rootFolderName}
            onChange={e => dispatch({ type: 'SET_ROOT_FOLDER', name: e.target.value })}
          />
        </div>
        <p className="text-[10px] text-gray-400 mb-3">Leave blank to use <em>BrandName-assets</em> automatically</p>

        <hr className="border-gray-200 mb-3" />

        {/* Folder levels */}
        <div className="flex flex-col gap-1.5">
          {state.folderLevels.map((lv, idx) => {
            const exVal = lv.customName.trim()
              ? lv.customName
              : sampleFmt
                ? (sampleFmt[lv.key] as string) ?? lv.exampleDefault
                : lv.exampleDefault
            return (
              <div
                key={lv.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-[1.5px] transition ${lv.enabled ? 'bg-white border-indigo-200' : 'bg-gray-50 border-gray-200'}`}
              >
                {/* Toggle */}
                <button
                  onClick={() => updateLevel(idx, { enabled: !lv.enabled })}
                  className={`w-[30px] h-[17px] rounded-full border-none cursor-pointer relative transition-colors flex-shrink-0 ${lv.enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <span className={`absolute w-[13px] h-[13px] bg-white rounded-full shadow top-[2px] left-[2px] transition-transform ${lv.enabled ? 'translate-x-[13px]' : ''}`} />
                </button>

                {/* Label */}
                <span className="text-xs font-semibold text-gray-700 flex-1">
                  {lv.label}{' '}
                  <small className="font-normal text-gray-400">{lv.enabled ? exVal : '—'}</small>
                </span>

                {/* Rename */}
                <input
                  className="border border-gray-200 rounded-md px-2 py-1 text-[11px] font-mono outline-none focus:border-indigo-500 transition w-28"
                  placeholder={lv.exampleDefault}
                  value={lv.customName}
                  onChange={e => updateLevel(idx, { customName: e.target.value })}
                />

                {/* Reorder */}
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button onClick={() => moveLevel(idx, -1)} disabled={idx === 0} className="w-[18px] h-[14px] border-none bg-transparent cursor-pointer text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded text-[9px] flex items-center justify-center disabled:opacity-30">▲</button>
                  <button onClick={() => moveLevel(idx, 1)} disabled={idx === state.folderLevels.length - 1} className="w-[18px] h-[14px] border-none bg-transparent cursor-pointer text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded text-[9px] flex items-center justify-center disabled:opacity-30">▼</button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Path preview */}
        <label className="block text-xs font-medium text-gray-700 mt-3 mb-1">Path Preview</label>
        <pre className="font-mono text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 leading-[1.9] overflow-x-auto">{lines.join('\n')}</pre>
      </div>
    </>
  )
}
