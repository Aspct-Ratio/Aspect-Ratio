'use client'

import { useState } from 'react'
import { SlicerProvider, useSlicer } from './SlicerContext'
import AppHeader from './AppHeader'
import Step1Upload, { type UserPlan } from './Step1Upload'
import Step2Formats from './Step2Formats'
import Step3Adjust from './Step3Adjust'
import Step4Export from './Step4Export'

type Step = 1 | 2 | 3 | 4

function SlicerInner({ userPlan }: { userPlan?: UserPlan }) {
  const [step, setStep] = useState<Step>(1)
  const { dispatch } = useSlicer()

  function reset() {
    dispatch({ type: 'RESET' })
    setStep(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader step={step} />
      <main className="max-w-[1100px] mx-auto px-6 py-8 pb-20">
        {step === 1 && <Step1Upload onNext={() => setStep(2)} userPlan={userPlan} />}
        {step === 2 && <Step2Formats onBack={() => setStep(1)} onNext={() => setStep(3)} />}
        {step === 3 && <Step3Adjust onBack={() => setStep(2)} onNext={() => setStep(4)} />}
        {step === 4 && <Step4Export onBack={() => setStep(3)} onReset={reset} />}
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
