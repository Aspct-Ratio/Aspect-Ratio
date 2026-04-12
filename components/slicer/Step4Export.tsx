'use client'

import { useState, useRef } from 'react'
import { useSlicer } from './SlicerContext'
import { getSelectedFormats } from '@/lib/formats'
import { renderToCanvas, canvasToBlob, buildFilename, getFolderParts } from '@/lib/crop'
import FolderStructure from './FolderStructure'
import type { FormatDef } from '@/types/slicer'

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
  const { state } = useSlicer()
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
        for (const ef of efArr) {
          const ext = ef === 'jpeg' ? 'jpg' : ef === 'tiff' ? 'png' : ef
          treeLines.push(`${fileInd}📄 [filename].${ext}`)
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
    const canvas = renderToCanvas(canvasRef.current, fmt, file, state.crops[file.id][fmt.id])
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
        const canvas = renderToCanvas(canvasRef.current, fmt, file, crop)
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
      <h1 className="text-[22px] font-extrabold text-gray-900 mb-1 tracking-tight">EXPORT YOUR ASSETS</h1>
      <p className="text-sm text-gray-500 mb-1">
        {total} file{total !== 1 ? 's' : ''} ready — {state.files.length} asset{state.files.length !== 1 ? 's' : ''} × {fmts.length} format{fmts.length !== 1 ? 's' : ''} × {efArr.length} type{efArr.length !== 1 ? 's' : ''}
      </p>

      {/* Progress */}
      {(exporting || done) && (
        <div className="mt-3">
          <div className="h-[3px] bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">{progressLabel}</p>
        </div>
      )}

      <div className="grid gap-5 mt-4.5" style={{ gridTemplateColumns: '1fr 340px' }}>
        {/* Left: file list */}
        <div>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.7px] mb-2">Files Ready</div>
          <div className="max-h-[400px] overflow-y-auto">
            {pairs.slice(0, 50).map(({ file, fmt, ef }, i) => {
              const ext = ef === 'jpeg' ? 'jpg' : ef === 'tiff' ? 'png' : ef
              const fn = buildFilename({ pattern: state.namingPattern, clientName: state.clientName, campaignName: state.campaignName, fmt, assetName: file.name }) + '.' + ext
              return (
                <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-gray-50 transition">
                  <span className="text-[13px] text-gray-400">◻</span>
                  <span className="font-mono text-[11px] text-gray-700 flex-1 truncate">{fn}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${TAG_CLASSES[fmt.pc ?? 't-soc'] ?? ''}`}>{fmt.pf}</span>
                  <button onClick={() => dlSingle(file.id, fmt.id, ef)} className="text-xs border border-gray-200 rounded px-2 py-0.5 font-medium text-gray-600 hover:bg-gray-50 transition flex-shrink-0">↓</button>
                </div>
              )
            })}
            {pairs.length > 50 && (
              <div className="px-2.5 py-2 text-xs text-gray-400">…and {pairs.length - 50} more included in ZIP</div>
            )}
          </div>
        </div>

        {/* Right: folder config + output preview + download */}
        <div>
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
            className={`w-full py-3 font-semibold text-sm rounded-lg transition ${done ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} disabled:opacity-50`}
          >
            {done ? '✓ Downloaded' : exporting ? 'Building ZIP…' : '↓  Download All as ZIP'}
          </button>
          <p className="text-[11px] text-gray-400 text-center mt-2">{folderNote}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-9 pt-5 border-t border-gray-200">
        <button onClick={onBack} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition">← Back</button>
        <button onClick={onReset} className="text-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg transition">+ New Project</button>
      </div>

      {/* Hidden canvas for rendering */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
