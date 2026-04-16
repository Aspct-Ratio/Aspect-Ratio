'use client'

import { useEffect, useState } from 'react'
import { SlicerProvider, useSlicer } from './SlicerContext'
import AppHeader from './AppHeader'
import Step1Upload, { type UserPlan } from './Step1Upload'
import Step2Formats from './Step2Formats'
import Step3Adjust from './Step3Adjust'
import Step4Copy from './Step4Copy'
import Step4Export from './Step4Export'

type Step = 1 | 2 | 3 | 4 | 5

function SlicerInner({ userPlan }: { userPlan?: UserPlan }) {
  const [step, setStep] = useState<Step>(1)
  const { state, hydrating, resetAll } = useSlicer()
  const [restoredBanner, setRestoredBanner] = useState(false)

  // After hydration, if we recovered files from a previous session, jump the
  // user straight to the format/adjust step and flash a banner so they know
  // their work was restored.
  useEffect(() => {
    if (hydrating) return
    if (state.files.length > 0) {
      setStep(prev => (prev === 1 ? 2 : prev))
      setRestoredBanner(true)
      const t = setTimeout(() => setRestoredBanner(false), 5000)
      return () => clearTimeout(t)
    }
  }, [hydrating, state.files.length])

  async function reset() {
    await resetAll()
    setStep(1)
  }

  if (hydrating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <svg className="animate-spin w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Restoring your work…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader step={step} />
      <main className="max-w-[1100px] mx-auto px-6 pt-28 pb-24">
        {restoredBanner && (
          <div className="mb-5 flex items-center justify-between gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span>
              <p className="text-sm font-medium text-emerald-800">
                Restored your previous session — {state.files.length} file{state.files.length === 1 ? '' : 's'} and all settings.
              </p>
            </div>
            <button
              onClick={() => { reset() }}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
            >
              Start fresh
            </button>
          </div>
        )}
        {step === 1 && <Step1Upload onNext={() => setStep(2)} userPlan={userPlan} />}
        {step === 2 && <Step2Formats onBack={() => setStep(1)} onNext={() => setStep(3)} />}
        {step === 3 && <Step3Adjust onBack={() => setStep(2)} onNext={() => setStep(4)} />}
        {step === 4 && <Step4Copy onBack={() => setStep(3)} onNext={() => setStep(5)} onSkip={() => setStep(5)} />}
        {step === 5 && <Step4Export onBack={() => setStep(4)} onReset={reset} />}
      </main>
    </div>
  )
}

export default function SlicerApp({ userPlan }: { userPlan?: UserPlan }) {
  return (
    <SlicerProvider>
      <SlicerInner userPlan={userPlan} />
    </SlicerProvider>
  )
}
