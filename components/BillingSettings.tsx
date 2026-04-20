'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PLAN_LABELS: Record<string, string> = {
  free:       'Free',
  creator:    'Creator',
  freelancer: 'Freelancer',
  studio:     'Studio',
  agency:     'Agency',
  enterprise: 'Enterprise',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active:    { label: 'Active',    color: 'text-green-700 bg-green-50 border-green-200' },
  trialing:  { label: 'Trial',     color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  canceling: { label: 'Canceling', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  past_due:  { label: 'Past due',  color: 'text-red-700 bg-red-50 border-red-200' },
  canceled:  { label: 'Canceled',  color: 'text-gray-600 bg-gray-50 border-gray-200' },
}

interface Subscription {
  plan: string
  status: string
  current_period_end: string | null
  trial_end: string | null
  cancel_at: string | null
  cancel_at_period_end: boolean
}

interface Props {
  subscription: Subscription | null
  userEmail: string
}

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function BillingSettings({ subscription, userEmail }: Props) {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canceled, setCanceled] = useState(false)
  const [cancelAt, setCancelAt] = useState<string | null>(subscription?.cancel_at ?? null)

  const sub = subscription
  const statusMeta = STATUS_LABELS[sub?.status ?? ''] ?? STATUS_LABELS['canceled']
  const planLabel = PLAN_LABELS[sub?.plan ?? ''] ?? '—'
  const periodEnd = sub?.current_period_end ?? null
  const trialEnd = sub?.trial_end ?? null
  const isTrialing = sub?.status === 'trialing'
  const isCanceling = sub?.status === 'canceling' || canceled

  async function confirmCancel() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
        return
      }
      setCanceled(true)
      setCancelAt(data.cancel_at)
      setShowDialog(false)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-[15px] font-bold text-gray-900 mb-4">Billing & Subscription</h2>

      {!sub ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-sm text-gray-500">
          No active subscription.{' '}
          <a href="/#pricing" className="text-indigo-600 font-medium hover:underline">View plans →</a>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 shadow-sm">

          {/* Plan row */}
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Plan</p>
              <p className="text-sm font-semibold text-gray-900">{planLabel}</p>
            </div>
            <a href="/#pricing" className="text-xs font-semibold text-indigo-600 hover:underline">
              Change plan →
            </a>
          </div>

          {/* Status row */}
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Status</p>
              <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${isCanceling ? STATUS_LABELS['canceling'].color : statusMeta.color}`}>
                {isCanceling ? STATUS_LABELS['canceling'].label : statusMeta.label}
              </span>
            </div>
          </div>

          {/* Trial end (if trialing) */}
          {isTrialing && trialEnd && (
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Trial ends</p>
              <p className="text-sm text-gray-700">{fmt(trialEnd)}</p>
              <p className="text-xs text-gray-400 mt-0.5">Your card won't be charged until then.</p>
            </div>
          )}

          {/* Renewal / expiry row */}
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
              {isCanceling ? 'Access expires' : 'Next renewal'}
            </p>
            <p className="text-sm text-gray-700">{fmt(isCanceling ? (cancelAt ?? periodEnd) : periodEnd)}</p>
            {isCanceling && (
              <p className="text-xs text-amber-600 mt-1">
                Your subscription is scheduled to cancel. You'll keep access until this date.
              </p>
            )}
          </div>

          {/* Account row */}
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Account</p>
            <p className="text-sm text-gray-700">{userEmail}</p>
          </div>

          {/* Cancel button */}
          {!isCanceling && sub.status !== 'canceled' && (
            <div className="px-5 py-4">
              <button
                onClick={() => setShowDialog(true)}
                className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
              >
                Cancel subscription
              </button>
            </div>
          )}

        </div>
      )}

      {/* ── Confirmation dialog ───────────────────────────────── */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !loading && setShowDialog(false)}
          />

          {/* Panel */}
          <div className="relative bg-white rounded-2xl shadow-xl p-7 w-full max-w-md mx-4 z-10">
            <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center mb-4">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 2C6.03 2 2 6.03 2 11s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 13.5a1 1 0 110-2 1 1 0 010 2zm1-4.5h-2V6h2v5z" fill="#DC2626"/>
              </svg>
            </div>

            <h3 className="text-[17px] font-bold text-gray-900 mb-2">Cancel your subscription?</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-2">
              Your <strong>{planLabel}</strong> subscription will remain active until{' '}
              <strong>{fmt(periodEnd)}</strong>. After that date you'll lose access to paid features.
            </p>
            <p className="text-sm text-gray-400 mb-6">You won't be charged again.</p>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <div className="flex gap-2.5">
              <button
                onClick={() => setShowDialog(false)}
                disabled={loading}
                className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Keep subscription
              </button>
              <button
                onClick={confirmCancel}
                disabled={loading}
                className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60 disabled:cursor-wait"
              >
                {loading ? 'Canceling…' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
