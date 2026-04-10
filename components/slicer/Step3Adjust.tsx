'use client'

import { useSlicer } from './SlicerContext'
import { getSelectedFormats } from '@/lib/formats'
import { calcCrop, smartCrop } from '@/lib/crop'
import CropCard from './CropCard'

interface Props {
  onBack: () => void
  onNext: () => void
}

export default function Step3Adjust({ onBack, onNext }: Props) {
  const { state, dispatch } = useSlicer()
  const fmts = getSelectedFormats(state.selected, state.custom)
  const file = state.files[state.activeFile]

  function doSmartAll() {
    if (!file) return
    for (const fmt of fmts) {
      const c = { ...state.crops[file.id][fmt.id] }
      smartCrop(c, fmt, file)
      dispatch({ type: 'UPDATE_CROP', fileId: file.id, formatId: fmt.id, crop: c })
    }
  }

  function doResetAll() {
    if (!file) return
    for (const fmt of fmts) {
      dispatch({ type: 'UPDATE_CROP', fileId: file.id, formatId: fmt.id, crop: calcCrop(fmt, file) })
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-start justify-between mb-2 flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">ADJUST YOUR CROPS</h1>
          <p className="text-sm text-gray-500">Drag to reposition · Zoom slider to tighten · Smart Crop for auto focal point</p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button onClick={doSmartAll} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition">✦ Smart Crop All</button>
          <button onClick={doResetAll} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition">↺ Reset All</button>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 text-[11px] font-semibold">
            {fmts.length} format{fmts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* File switcher */}
      {state.files.length > 1 && (
        <div className="mb-4">
          <p className="text-[11px] text-gray-500 font-semibold mb-2">Editing asset:</p>
          <div className="flex gap-1.5 flex-wrap">
            {state.files.map((f, i) => (
              <div
                key={f.id}
                onClick={() => dispatch({ type: 'SET_ACTIVE_FILE', index: i })}
                className={`rounded-xl overflow-hidden border-2 cursor-pointer transition-all flex-shrink-0 w-[68px] ${i === state.activeFile ? 'border-indigo-500 shadow-[0_0_0_3px_rgba(79,70,229,0.15)]' : 'border-gray-200 hover:border-indigo-200'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.thumb} alt={f.name} className="w-full h-[44px] object-cover block" />
                <div className="text-[8px] text-gray-500 px-1 py-0.5 truncate text-center bg-gray-50">{f.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crop grid */}
      {!file && (
        <div className="text-center py-12 text-sm text-gray-400">No files uploaded.</div>
      )}
      {file && fmts.length === 0 && (
        <div className="text-center py-12 text-sm text-gray-400">
          No formats selected.{' '}
          <button onClick={onBack} className="border border-gray-200 rounded-lg px-3 py-1 ml-2 text-xs font-medium hover:bg-gray-50 transition">← Configure</button>
        </div>
      )}
      {file && fmts.length > 0 && (
        <div className="grid gap-3.5 mt-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
          {fmts.map(fmt => <CropCard key={fmt.id} fmt={fmt} file={file} />)}
        </div>
      )}

      <div className="flex justify-between items-center mt-9 pt-5 border-t border-gray-200">
        <button onClick={onBack} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition">← Back</button>
        <button onClick={onNext} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition">Export Assets →</button>
      </div>
    </div>
  )
}
