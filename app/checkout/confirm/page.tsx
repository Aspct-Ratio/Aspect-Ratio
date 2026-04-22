'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import LogoMark from '@/components/LogoMark'

const PLAN_INFO: Record<string, {
  label: string
  monthlyPrice: string
  annualPrice: string
  description: string
  features: string[]
}> = {
  creator: {
    label: 'Creator',
    monthlyPrice: '$29 / month',
    annualPrice: '$290 / year',
    description: 'For content creators posting across multiple platforms.',
    features: ['200 exports / month', '10 images per session', 'All platform formats', 'Text overlays', 'JPG, PNG, WebP export'],
  },
  freelancer: {
    label: 'Freelancer',
    monthlyPrice: '$59 / month',
    annualPrice: '$590 / year',
    description: 'For independent creatives running campaigns solo.',
    features: ['750 exports / month', '50 images per session', 'All platform formats', 'JPG, PNG, WebP export', 'Custom naming conventions'],
  },
  studio: {
    label: 'Studio',
    monthlyPrice: '$199 / month',
    annualPrice: '$1,990 / year',
    description: 'For small studios and in-house teams with regular campaign output.',
    features: ['3,000 exports / month', '150 images per session', 'All export types — JPG, PNG, WebP, PDF, TIFF', 'Custom naming & folder structure', '5 team seats'],
  },
  agency: {
    label: 'Agency',
    monthlyPrice: '$599 / month',
    annualPrice: '$5,990 / year',
    description: 'For agencies running production at volume across multiple clients.',
    features: ['Unlimited exports', 'Unlimited images per session', 'All export types', 'API access', '20 team seats', 'Priority support'],
  },
}

export default function CheckoutConfirmPage() {
  return <Suspense><CheckoutConfirmForm /></Suspense>
}

function CheckoutConfirmForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planKey = searchParams.get('plan') ?? ''
  const plan = PLAN_INFO[planKey]

  const wasCanceled = searchParams.get('canceled') === 'true'

  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if invalid plan
  useEffect(() => {
    if (!plan) router.replace('/#pricing')
  }, [plan, router])

  if (!plan) return null

  async function handleContinue() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to create checkout session')
        setLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error — please try again')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 md:px-10 h-[80px] flex items-center justify-between flex-shrink-0">
        <Link href="/" className="no-underline">
          <LogoMark height={75} />
        </Link>
        <Link href="/#pricing" className="text-sm text-gray-500 hover:text-gray-800 transition no-underline">
          ← Back to plans
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[480px]">

          {/* Canceled banner */}
          {wasCanceled && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-2.5">
              <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800">Payment was not completed</p>
                <p className="text-xs text-amber-700 mt-0.5">No charge was made. Please try again when you're ready.</p>
              </div>
            </div>
          )}

          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-3">Almost there</p>
          <h1 className="text-[26px] font-extrabold text-gray-900 tracking-tight mb-1">
            Review your plan
          </h1>
          <p className="text-sm text-gray-500 mb-8">Confirm the details below before heading to checkout.</p>

          {/* Plan summary card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

            {/* Plan header */}
            <div className="bg-indigo-600 px-6 py-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg font-extrabold text-white tracking-tight">{plan.label}</span>
                <span className="text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full">
                  7-day free trial
                </span>
              </div>
              <p className="text-sm text-indigo-200">{plan.description}</p>
            </div>

            {/* Pricing */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Price after trial</span>
                <span className="font-bold text-gray-900">{plan.monthlyPrice}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1.5">
                <span className="text-gray-400 text-xs">Annual billing</span>
                <span className="text-gray-400 text-xs">{plan.annualPrice}</span>
              </div>
            </div>

            {/* Trial callout */}
            <div className="px-6 py-4 bg-green-50 border-b border-gray-100 flex items-start gap-2.5">
              <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
              <div>
                <p className="text-sm font-semibold text-green-800">Free for 7 days</p>
                <p className="text-xs text-green-700 mt-0.5">No charge until your trial ends. Cancel anytime before then.</p>
              </div>
            </div>

            {/* Features */}
            <div className="px-6 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-gray-400 mb-3">What's included</p>
              <ul className="space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-indigo-500 flex-shrink-0 mt-0.5">✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ToS checkbox */}
          <label className="flex items-start gap-3 cursor-pointer mb-5 select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 flex-shrink-0 w-4 h-4 accent-indigo-600"
            />
            <span className="text-sm text-gray-600 leading-[1.55]">
              I have read and agree to the{' '}
              <Link href="/terms" target="_blank" className="text-indigo-600 hover:underline font-medium">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" target="_blank" className="text-indigo-600 hover:underline font-medium">
                Privacy Policy
              </Link>
            </span>
          </label>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <p className="text-sm text-red-700 font-medium">Checkout error</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleContinue}
            disabled={!agreed || loading}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white text-[15px] font-semibold rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Redirecting to Stripe…' : 'Continue to checkout →'}
          </button>

          <p className="text-xs text-gray-400 text-center mt-4">
            Secure payment powered by Stripe. You won't be charged during your trial.
          </p>
        </div>
      </div>
    </div>
  )
}
