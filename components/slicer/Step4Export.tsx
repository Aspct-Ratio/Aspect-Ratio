'use client'

import { useState, useRef } from 'react'
import { useSlicer } from './SlicerContext'
import { getSelectedFormats } from '@/lib/formats'
import { renderToCanvasWithText, canvasToBlob, buildFilename, getFolderParts } from '@/lib/crop'
import FolderStructure from './FolderStructure'
import type { FormatDef, ExportFormat } from '@/types/slicer'

const EXPORT_FORMATS: { f: ExportFormat; label: string }[] = [
  { f: 'jpeg', label: 'JPG' },
  { f: 'png',  label: 'PNG' },
  { f: 'webp', label: 'WebP' },
  { f: 'pdf',  label: 'PDF' },
  { f: 'tiff', label: 'TIFF*' },
]

const TAG_CLASSES: Record<string, string> = {
  't-soc': 'bg-indigo-50 text-indigo-600',
  't-eco': 'bg-green-50 text-green-700',
  't-pai': 'bg-amber-50 text-amber-600',
  't-ret': 'bg-red-50 text-red-600',
}

function dlBlob(blob: Blob, name: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
}

interface Props {
  onBack: () => void
  onReset: () => void
}

export default function Step4Export({ onBack, onReset }: Props) {
  const { state, dispatch } = useSlicer()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [exporting, setExporting] = useState(false)
  const [done, setDone] = useState(false)
  const [outputOpen, setOutputOpen] = useState(false)

  const fmts = getSelectedFormats(state.selected, state.custom)
  const efArr = Array.from(state.exportFormats)
  const total = state.files.length * fmts.length * efArr.length

  const root = state.rootFolderName.trim()
    ? state.rootFolderName.trim().replace(/\s+/g, '-')
    : (state.clientName || 'Brand').replace(/\s+/g, '-') + '-assets'

  // Preview pairs (first 50)
  const pairs: { file: typeof state.files[0]; fmt: FormatDef; ef: string }[] = []
  for (const file of state.files) {
    for (const fmt of fmts) {
      for (const ef of efArr) {
        pairs.push({ file, fmt, ef })
      }
    }
  }

  // Folder tree
  const treeLines: string[] = [`📁 ${root}/`]
  const grouped: Record<string, Record<string, FormatDef[]>> = {}
  for (const fmt of fmts) {
    const parts = getFolderParts(fmt, state.folderLevels)
    let node = grouped as Record<string, unknown>
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]]) (node as Record<string, unknown>)[parts[i]] = {}
      node = (node as Record<string, Record<string, unknown>>)[parts[i]]
    }
    const last = parts[parts.length - 1] ?? '__root'
    if (!node[last]) (node as Record<string, unknown[]>)[last] = []
    ;(node as Record<string, unknown[]>)[last].push(fmt)
  }

  function renderTree(obj: Record<string, unknown>, depth: number) {
    const ind = '  '.repeat(depth)
    for (const [k, v] of Object.entries(obj)) {
      treeLines.push(`${ind}📁 ${k}/`)
      if (Array.isArray(v)) {
        const fileInd = '  '.repeat(depth + 1)
        const fmt = v[0] as FormatDef | undefined
        for (const ef of efArr) {
          const ext = ef === 'jpeg' ? 'jpg' : ef === 'tiff' ? 'png' : ef
          const fn = fmt
            ? buildFilename({ pattern: state.namingPattern, clientName: state.clientName, campaignName: state.campaignName, fmt, assetName: 'filename' }) + '.' + ext
            : `filename.${ext}`
          treeLines.push(`${fileInd}📄 ${fn}`)
        }
      } else {
        renderTree(v as Record<string, unknown>, depth + 1)
      }
    }
  }
  renderTree(grouped, 1)

  async function dlSingle(fileId: string, fmtId: string, ef: string) {
    const file = state.files.find(f => f.id === fileId)
    const fmt = fmts.find(f => f.id === fmtId)
    if (!file || !fmt || !canvasRef.current) return
    const canvas = renderToCanvasWithText(canvasRef.current, fmt, file, state.crops[file.id][fmt.id], state.textLayers[file.id]?.[fmt.id] ?? [])
    const ext = ef === 'jpeg' ? 'jpg' : ef === 'tiff' ? 'png' : ef
    const fn = buildFilename({ pattern: state.namingPattern, clientName: state.clientName, campaignName: state.campaignName, fmt, assetName: file.name }) + '.' + ext
    if (ef === 'pdf') { await exportPDF(canvas, fn, fmt); return }
    const blob = await canvasToBlob(canvas, ef === 'tiff' ? 'png' : ef, state.quality)
    dlBlob(blob, fn)
  }

  async function exportPDF(canvas: HTMLCanvasElement, fn: string, fmt: FormatDef) {
    const { jsPDF } = await import('jspdf')
    const or = fmt.w >= fmt.h ? 'l' : 'p'
    const pdf = new jsPDF({ orientation: or, unit: 'px', format: [fmt.w, fmt.h], hotfixes: ['px_scaling'] } as object)
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, fmt.w, fmt.h)
    pdf.save(fn)
  }

  async function dlAll() {
    if (!canvasRef.current) return
    setExporting(true); setDone(false); setProgress(0)
    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()
    const rootFolder = zip.folder(root)!
    let done = 0

    for (const file of state.files) {
      for (const fmt of fmts) {
        const crop = state.crops[file.id]?.[fmt.id]
        if (!crop) continue
        const canvas = renderToCanvasWithText(canvasRef.current, fmt, file, crop, state.textLayers[file.id]?.[fmt.id] ?? [])
        for (const ef of efArr) {
          const ext = ef === 'jpeg' ? 'jpg' : ef === 'tiff' ? 'png' : ef
          const fn = buildFilename({ pattern: state.namingPattern, clientName: state.clientName, campaignName: state.campaignName, fmt, assetName: file.name }) + '.' + ext
          const parts = getFolderParts(fmt, state.folderLevels)
          let folder = rootFolder
          for (const part of parts) { folder = folder.folder(part)! }

          let blob: Blob
          if (ef === 'pdf') {
            const { jsPDF } = await import('jspdf')
            const or = fmt.w >= fmt.h ? 'l' : 'p'
            const pdf = new jsPDF({ orientation: or, unit: 'px', format: [fmt.w, fmt.h], hotfixes: ['px_scaling'] } as object)
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, fmt.w, fmt.h)
            blob = pdf.output('blob')
          } else {
            blob = await canvasToBlob(canvas, ef === 'tiff' ? 'png' : ef, state.quality)
          }

          folder.file(fn, blob)
          done++
          setProgress(Math.round(done / total * 100))
          setProgressLabel(`Processing ${done} of ${total}…`)
          await new Promise(r => setTimeout(r, 0))
        }
      }
    }

    setProgressLabel('Packaging ZIP…')
    const zb = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
    dlBlob(zb, root + '.zip')
    setDone(true); setProgressLabel('Done!')
    setExporting(false)
  }

  const activeLevels = state.folderLevels.filter(l => l.enabled).map(l => l.label)
  const folderNote = activeLevels.length
    ? `Nested: ${[root, ...activeLevels].join(' → ')}`
    : 'Root folder only — no subfolders'

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-gray-900 mb-1 tracking-tight">Ready to export</h1>
        <p className="text-sm text-gray-500">
          {state.files.length} asset{state.files.length !== 1 ? 's' : ''} × {fmts.length} format{fmts.length !== 1 ? 's' : ''} × {efArr.length} file type{efArr.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Summary + primary download CTA */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-6 py-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-base font-bold text-indigo-900">All set! Your {total} file{total !== 1 ? 's' : ''} are ready.</p>
          <p className="text-sm text-indigo-600 mt-0.5">{folderNote}</p>
        </div>
        <button
          onClick={dlAll}
          disabled={exporting}
          className={`flex items-center gap-2 px-5 py-2.5 font-semibold text-sm rounded-xl transition flex-shrink-0 uppercase tracking-wide ${done ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} disabled:opacity-50`}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 10.5L3 6h3V1.5h3V6h3L7.5 10.5z" fill="currentColor"/><rect x="1.5" y="12" width="12" height="1.5" rx="0.75" fill="currentColor"/></svg>
          {done ? 'Downloaded ✓' : exporting ? 'Building ZIP…' : 'Download all as ZIP'}
        </button>
      </div>

      {/* Progress */}
      {(exporting || done) && (
        <div className="mb-5">
          <div className="h-[3px] bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">{progressLabel}</p>
        </div>
      )}

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-[1fr_340px]">
        {/* Left: file list */}
        <div>
          <div className="text-sm font-bold text-gray-700 mb-3">Your exports</div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden max-h-[420px] overflow-y-auto">
            {pairs.slice(0, 50).map(({ file, fmt, ef }, i) => {
              const ext = ef === 'jpeg' ? 'jpg' : ef === 'tiff' ? 'png' : ef
              const fn = buildFilename({ pattern: state.namingPattern, clientName: state.clientName, campaignName: state.campaignName, fmt, assetName: file.name }) + '.' + ext
              return (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-800 flex-1 truncate">{fn}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ${TAG_CLASSES[fmt.pc ?? 't-soc'] ?? ''}`}>{fmt.pf}</span>
                  <button
                    onClick={() => dlSingle(file.id, fmt.id, ef)}
                    className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1 text-gray-600 bg-white hover:bg-gray-50 transition flex-shrink-0 flex items-center gap-1"
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 7.5L2 4h2V1h3v3h2L5.5 7.5z" fill="currentColor"/><rect x="1" y="9" width="9" height="1" rx="0.5" fill="currentColor"/></svg>
                    Download
                  </button>
                </div>
              )
            })}
            {pairs.length > 50 && (
              <div className="px-4 py-3 text-sm text-gray-400">…and {pairs.length - 50} more included in ZIP</div>
            )}
          </div>
        </div>

        {/* Right: export settings + folder config + output preview + download */}
        <div>
          {/* Export file formats */}
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

          {/* Quality */}
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.7px] mb-2">Quality</div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-3.5">
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

          <FolderStructure />

          {/* Output Preview — collapsible */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 mb-3.5 mt-1">
            <button
              onClick={() => setOutputOpen(o => !o)}
              className="w-full flex items-center justify-between group"
            >
              <span className="flex items-center gap-1 text-xs font-semibold text-gray-600">
                Show output preview
                <span className="group/tip relative inline-flex items-center ml-1">
                  <span className="w-[14px] h-[14px] rounded-full bg-gray-200 text-gray-500 text-[9px] font-bold flex items-center justify-center cursor-default select-none">?</span>
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-48 bg-gray-900 text-white text-[11px] leading-snug rounded-lg px-2.5 py-1.5 opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity whitespace-normal">
                    Preview your complete folder structure before exporting
                  </span>
                </span>
              </span>
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                className={`text-gray-400 transition-transform duration-200 ${outputOpen ? 'rotate-180' : ''}`}
              >
                <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {outputOpen && (
              <div className="mt-3 bg-gray-50 rounded-lg border border-gray-200 px-3 py-3 max-h-[260px] overflow-y-auto">
                {treeLines.map((line, i) => {
                  const trimmed = line.trimStart()
                  const depth = (line.length - trimmed.length) / 2
                  const isFile = trimmed.startsWith('📄')
                  const name = trimmed.replace(/^📁 |^📄 /, '').replace(/\/$/, '')
                  return (
                    <div key={i} className="flex items-center gap-1.5 py-[3px]" style={{ paddingLeft: depth * 16 }}>
                      {isFile ? (
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="flex-shrink-0 text-gray-300">
                          <rect x="1" y="1" width="8" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                          <path d="M3.5 4.5h5M3.5 6.5h5M3.5 8.5h3" stroke="currentColor" strokeWidth="1"/>
                        </svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="flex-shrink-0 text-indigo-400">
                          <path d="M1 3.5C1 2.67 1.67 2 2.5 2h2.62c.35 0 .68.14.92.4l.76.82H10.5c.83 0 1.5.67 1.5 1.5V10c0 .83-.67 1.5-1.5 1.5h-8C1.67 11.5 1 10.83 1 10V3.5z" fill="#EEF2FF" stroke="#818CF8" strokeWidth="1"/>
                        </svg>
                      )}
                      <span className={isFile
                        ? 'text-[11px] text-gray-400 font-mono'
                        : depth === 0
                          ? 'text-[12px] font-bold text-gray-800'
                          : 'text-[11px] font-semibold text-gray-700'
                      }>
                        {name}{!isFile ? '/' : ''}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <button
            onClick={dlAll}
            disabled={exporting}
            className={`w-full py-3 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 uppercase tracking-wide ${done ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} disabled:opacity-50`}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 10.5L3 6h3V1.5h3V6h3L7.5 10.5z" fill="currentColor"/><rect x="1.5" y="12" width="12" height="1.5" rx="0.75" fill="currentColor"/></svg>
            {done ? 'Downloaded ✓' : exporting ? 'Building ZIP…' : 'Download all as ZIP'}
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mt-9 pt-5 border-t border-gray-200">
        <button onClick={onBack} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition uppercase tracking-wide">← Back</button>
        <button onClick={onReset} className="text-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg transition uppercase tracking-wide">+ New Project</button>
      </div>

      {/* Hidden canvas for rendering */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
