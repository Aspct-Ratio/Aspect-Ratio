'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SlicerProvider, useSlicer } from './SlicerContext'
import Step2Formats from './Step2Formats'
import Step3Adjust from './Step3Adjust'
import type { SlicerFile } from '@/types/slicer'

// ── Step indicator ─────────────────────────────────────────────

const STEPS = ['Choose Formats', 'Adjust Crops', 'Export']

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const n = i + 1
        const active = n === current
        const done = n < current
        return (
          <div key={n} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={[
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors',
                active ? 'bg-indigo-600 text-white' :
                done   ? 'bg-indigo-100 text-indigo-600' :
                         'bg-gray-100 text-gray-400',
              ].join(' ')}>
                {done ? '✓' : n}
              </div>
              <span className={[
                'text-xs font-semibold whitespace-nowrap transition-colors',
                active ? 'text-gray-900' : 'text-gray-400',
              ].join(' ')}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={['mx-3 h-px w-8 flex-shrink-0 transition-colors', done ? 'bg-indigo-300' : 'bg-gray-200'].join(' ')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Export CTA (step 3) ────────────────────────────────────────

function ExportCTA({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-up">
      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5 border border-indigo-100">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </div>
      <h3 className="text-[clamp(20px,2.5vw,28px)] font-extrabold text-gray-900 tracking-[-0.5px] mb-3">
        Ready to export your own assets?
      </h3>
      <p className="text-sm text-gray-500 max-w-[360px] mb-8 leading-[1.75]">
        Start your 7-day free trial to upload your files and download production-ready assets in every format.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/signup"
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition no-underline shadow-sm"
        >
          Start free trial →
        </Link>
        <Link
          href="/#pricing"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition no-underline"
        >
          View pricing
        </Link>
      </div>
      <button
        onClick={onBack}
        className="mt-7 text-xs text-gray-400 hover:text-gray-600 transition"
      >
        ← Back to crops
      </button>
    </div>
  )
}

// ── Inner (must be inside SlicerProvider) ──────────────────────

function DemoSlicerInner() {
  const { dispatch } = useSlicer()
  const [step, setStep] = useState(1)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let objectUrl = ''

    async function loadSampleImage() {
      try {
        const resp = await fetch('/images/Imag2.jpg')
        if (!resp.ok) throw new Error('fetch failed')
        const blob = await resp.blob()
        objectUrl = URL.createObjectURL(blob)

        const img = new window.Image()
        img.onload = () => {
          const file: SlicerFile = {
            id: 'demo-sample',
            name: 'SampleCampaignAsset.jpg',
            img,
            thumb: objectUrl,
            w: img.naturalWidth,
            h: img.naturalHeight,
            isV: false,
          }
          dispatch({ type: 'ADD_FILES', files: [file] })
          setLoaded(true)
        }
        img.onerror = () => setError(true)
        img.src = objectUrl
      } catch {
        setError(true)
      }
    }

    loadSampleImage()

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-sm text-gray-400 gap-2">
        <span>⚠️</span>
        <span>Demo image couldn&apos;t load.</span>
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-sm text-gray-400">
        <svg className="animate-spin w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Loading demo…
      </div>
    )
  }

  return (
    <div>
      <StepIndicator current={step} />
      {step === 1 && (
        <Step2Formats
          onBack={() => {/* no-op: no upload step in demo */}}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <Step3Adjust
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <ExportCTA onBack={() => setStep(2)} />
      )}
    </div>
  )
}

// ── Public export ──────────────────────────────────────────────

export default function DemoSlicer() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Browser chrome */}
      <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center gap-1.5 px-4 flex-shrink-0">
        <div className="w-3 h-3 rounded-full bg-[#FC625D] flex-shrink-0" />
        <div className="w-3 h-3 rounded-full bg-[#FDBC40] flex-shrink-0" />
        <div className="w-3 h-3 rounded-full bg-[#34C749] flex-shrink-0" />
        <div className="ml-3 flex-1 bg-gray-100 rounded-md h-[26px] flex items-center px-3 text-xs text-gray-400 truncate">
          app.aspctratio.com — <span className="text-indigo-500 font-medium ml-1">Interactive Demo</span>
        </div>
        <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-50 border border-indigo-100 rounded px-2 py-0.5 ml-2 flex-shrink-0 hidden sm:block">
          TRY IT FREE
        </span>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8">
        <SlicerProvider>
          <DemoSlicerInner />
        </SlicerProvider>
      </div>
    </div>
  )
}
