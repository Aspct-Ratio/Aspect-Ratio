'use client'

import { useRef, useCallback, useState } from 'react'
import { useSlicer } from './SlicerContext'
import type { SlicerFile } from '@/types/slicer'

export type UserPlan = 'freelancer' | 'studio' | 'agency' | 'enterprise'

const PLAN_LIMITS: Record<UserPlan, number> = {
  freelancer: 50,
  studio: 150,
  agency: 300,
  enterprise: Infinity,
}

const PLAN_LABELS: Record<UserPlan, string> = {
  freelancer: 'Freelancer',
  studio: 'Studio',
  agency: 'Agency',
  enterprise: 'Enterprise',
}

const UPGRADE_TO: Record<UserPlan, UserPlan | null> = {
  freelancer: 'studio',
  studio: 'agency',
  agency: 'enterprise',
  enterprise: null,
}

function uid() { return Math.random().toString(36).slice(2, 8) }

function loadImg(file: File): Promise<{ img: HTMLImageElement; w: number; h: number }> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => res({ img, w: img.naturalWidth, h: img.naturalHeight })
    img.onerror = rej
    img.src = url
  })
}

function captureVideo(file: File): Promise<{ img: HTMLImageElement; w: number; h: number }> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file)
    const vid = document.createElement('video')
    vid.src = url
    vid.preload = 'metadata'
    vid.muted = true
    vid.addEventListener('loadedmetadata', () => { vid.currentTime = Math.min(0.5, vid.duration * 0.1) })
    vid.onseeked = () => {
      const c = document.createElement('canvas')
      c.width = vid.videoWidth; c.height = vid.videoHeight
      c.getContext('2d')!.drawImage(vid, 0, 0)
      const img = new Image()
      img.src = c.toDataURL('image/jpeg', 0.8)
      img.onload = () => res({ img, w: vid.videoWidth, h: vid.videoHeight })
    }
    vid.onerror = rej
  })
}

interface Props {
  onNext: () => void
  userPlan?: UserPlan
}

export default function Step1Upload({ onNext, userPlan = 'freelancer' }: Props) {
  const { state, dispatch } = useSlicer()
  const inputRef = useRef<HTMLInputElement>(null)
  const [limitError, setLimitError] = useState<{ attempted: number; limit: number; upgradeTo: UserPlan | null } | null>(null)

  const limit = PLAN_LIMITS[userPlan]
  const limitLabel = limit === Infinity ? 'unlimited' : `${limit}`
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - state.files.length)

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList)
    const canAdd = limit === Infinity ? incoming.length : remaining
    const toProcess = incoming.slice(0, canAdd)
    const wouldExceed = incoming.length > canAdd

    if (wouldExceed) {
      setLimitError({
        attempted: incoming.length,
        limit,
        upgradeTo: UPGRADE_TO[userPlan],
      })
      setTimeout(() => setLimitError(null), 6000)
    }

    const loaded: SlicerFile[] = []
    for (const f of toProcess) {
      const isV = f.type.startsWith('video/')
      try {
        const { img, w, h } = isV ? await captureVideo(f) : await loadImg(f)
        loaded.push({ id: uid(), name: f.name, img, thumb: img.src, w, h, isV })
      } catch { /* skip bad files */ }
    }
    if (loaded.length) dispatch({ type: 'ADD_FILES', files: loaded })
  }, [remaining, limit, userPlan, dispatch])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const imgs = state.files.filter(f => !f.isV).length
  const vids = state.files.filter(f => f.isV).length
  const atLimit = limit !== Infinity && state.files.length >= limit

  return (
    <div className="animate-fade-up">
      <h1 className="text-[22px] font-extrabold text-gray-900 mb-1 tracking-tight">UPLOAD YOUR ASSETS</h1>
      <p className="text-sm text-gray-500 mb-7">
        Drop up to{' '}
        <span className="font-semibold text-gray-700">{limitLabel} files</span> per session
        {limit !== Infinity && (
          <span className="ml-1.5 text-[11px] font-semibold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full">
            {PLAN_LABELS[userPlan]} plan
          </span>
        )}
        . All selected formats apply to every asset.
      </p>

      {/* Limit error banner */}
      {limitError && (
        <div className="mb-5 flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="text-amber-500 text-lg flex-shrink-0">⚠</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Upload limit reached — {limitError.limit} files per session on the {PLAN_LABELS[userPlan]} plan
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              You selected {limitError.attempted} files but only {limitError.limit} were added.
              {limitError.upgradeTo ? (
                <> Upgrade to <span className="font-semibold">{PLAN_LABELS[limitError.upgradeTo]}</span> to upload up to {PLAN_LIMITS[limitError.upgradeTo] === Infinity ? 'unlimited files' : `${PLAN_LIMITS[limitError.upgradeTo]} files`} per session.</>
              ) : null}
            </p>
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault() }}
        onDrop={atLimit ? undefined : onDrop}
        onClick={atLimit ? undefined : () => inputRef.current?.click()}
        className={[
          'border-[1.5px] border-dashed rounded-xl bg-white transition-all text-center',
          atLimit
            ? 'border-gray-200 cursor-not-allowed opacity-60'
            : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer',
          state.files.length ? 'px-6 py-4' : 'px-10 py-14',
        ].join(' ')}
      >
        {state.files.length === 0 && (
          <>
            <div className="w-13 h-13 bg-gray-100 rounded-[14px] flex items-center justify-center mx-auto mb-4.5 text-[22px]">📁</div>
            <h2 className="text-[17px] font-bold text-gray-900 mb-1.5">Drop files here, or click to browse</h2>
            <p className="text-sm text-gray-500 mb-3.5">
              JPG · PNG · WebP · GIF · MP4 · MOV · WebM &nbsp;·&nbsp; Up to {limitLabel} files
            </p>
          </>
        )}
        {atLimit && state.files.length > 0 && (
          <p className="text-xs text-gray-400 py-1">
            Session limit reached ({limit} files). Remove files to add different ones.
          </p>
        )}
        <input
          ref={inputRef} type="file" multiple accept="image/*,video/*"
          className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)}
          disabled={atLimit}
        />
      </div>

      {/* Thumbnail grid */}
      {state.files.length > 0 && (
        <div className="grid mt-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
          {state.files.map(f => (
            <div key={f.id} className="relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.thumb} alt={f.name} className="w-full h-[72px] object-cover block" />
              {f.isV && <span className="absolute top-1 left-1 bg-black/60 text-white text-[8px] font-bold px-1 py-0.5 rounded">▶ VIDEO</span>}
              <div className="px-2 py-1.5">
                <div className="text-[10px] font-medium text-gray-700 truncate">{f.name}</div>
                <div className="text-[9px] text-gray-400 mt-0.5">{f.w}×{f.h}</div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); dispatch({ type: 'REMOVE_FILE', id: f.id }) }}
                className="absolute top-1 right-1 w-[18px] h-[18px] rounded-full bg-black/50 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer"
              >✕</button>
            </div>
          ))}
          {/* Add more tile */}
          {!atLimit && (
            <div
              onClick={() => inputRef.current?.click()}
              className="flex items-center justify-center h-[104px] cursor-pointer bg-gray-50 border-[1.5px] border-dashed border-gray-300 rounded-lg hover:border-indigo-400 transition"
            >
              <div className="text-center text-gray-400">
                <div className="text-xl">+</div>
                <div className="text-[10px] mt-0.5">Add more</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats bar */}
      {state.files.length > 0 && (
        <div className="flex items-center gap-3 mt-3 px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold border border-green-100">
            {state.files.length} file{state.files.length !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-gray-500">
            {[imgs && `${imgs} image${imgs !== 1 ? 's' : ''}`, vids && `${vids} video${vids !== 1 ? 's' : ''}`].filter(Boolean).join(' · ')}
          </span>
          {limit !== Infinity && (
            <span className="text-[11px] text-gray-400">
              {remaining} of {limit} remaining
            </span>
          )}
          <button
            onClick={() => dispatch({ type: 'CLEAR_FILES' })}
            className="ml-auto text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition"
          >Clear all</button>
        </div>
      )}

      {/* Nav */}
      <div className="flex justify-between items-center mt-9 pt-5 border-t border-gray-200">
        <div />
        <button
          onClick={onNext}
          disabled={state.files.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
        >Continue to Formats →</button>
      </div>
    </div>
  )
}
