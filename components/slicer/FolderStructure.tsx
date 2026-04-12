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

  return (
    <>
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.7px] mb-2">Folder Structure</div>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-3.5">
        <p className="text-xs text-gray-500 mb-3">Toggle, reorder, and rename the folder levels inside your ZIP.</p>

        {/* Root folder */}
        <div className="flex items-center gap-2 mb-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 text-indigo-400">
            <path d="M1 3.5C1 2.67 1.67 2 2.5 2h2.62c.35 0 .68.14.92.4l.76.82H10.5c.83 0 1.5.67 1.5 1.5V10c0 .83-.67 1.5-1.5 1.5h-8C1.67 11.5 1 10.83 1 10V3.5z" fill="#EEF2FF" stroke="#818CF8" strokeWidth="1"/>
          </svg>
          <label className="text-xs font-medium text-gray-700 flex-1">Root folder name</label>
          <input
            className="border border-gray-200 rounded-md px-2 py-1 text-[11px] font-mono outline-none focus:border-indigo-500 transition w-32"
            placeholder="brand-assets"
            value={state.rootFolderName}
            onChange={e => dispatch({ type: 'SET_ROOT_FOLDER', name: e.target.value })}
          />
        </div>
        <p className="text-[10px] text-gray-400 mb-3">Leave blank to use <em>BrandName-assets</em> automatically</p>

        <hr className="border-gray-100 mb-3" />

        {/* Folder levels */}
        <div className="flex flex-col gap-1.5">
          {state.folderLevels.map((lv, idx) => {
            const exVal = lv.customName.trim()
              ? lv.customName
              : sampleFmt ? (sampleFmt[lv.key] as string) ?? lv.exampleDefault : lv.exampleDefault
            return (
              <div
                key={lv.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-[1.5px] transition ${lv.enabled ? 'bg-white border-indigo-200' : 'bg-gray-50 border-gray-200'}`}
              >
                <button
                  onClick={() => updateLevel(idx, { enabled: !lv.enabled })}
                  className={`w-[30px] h-[17px] rounded-full border-none cursor-pointer relative transition-colors flex-shrink-0 ${lv.enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <span className={`absolute w-[13px] h-[13px] bg-white rounded-full shadow top-[2px] left-[2px] transition-transform ${lv.enabled ? 'translate-x-[13px]' : ''}`} />
                </button>
                <span className="text-xs font-semibold text-gray-700 flex-1">
                  {lv.label}{' '}
                  <small className="font-normal text-gray-400">{lv.enabled ? exVal : '—'}</small>
                </span>
                <input
                  className="border border-gray-200 rounded-md px-2 py-1 text-[11px] font-mono outline-none focus:border-indigo-500 transition w-28"
                  placeholder={lv.exampleDefault}
                  value={lv.customName}
                  onChange={e => updateLevel(idx, { customName: e.target.value })}
                />
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button onClick={() => moveLevel(idx, -1)} disabled={idx === 0} className="w-[18px] h-[14px] border-none bg-transparent cursor-pointer text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded text-[9px] flex items-center justify-center disabled:opacity-30">▲</button>
                  <button onClick={() => moveLevel(idx, 1)} disabled={idx === state.folderLevels.length - 1} className="w-[18px] h-[14px] border-none bg-transparent cursor-pointer text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded text-[9px] flex items-center justify-center disabled:opacity-30">▼</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
