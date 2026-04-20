'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// ── Constants ──────────────────────────────────────────────────

const PLAN_LABELS: Record<string, string> = {
  free:       'Free',
  creator:    'Creator',
  freelancer: 'Freelancer',
  studio:     'Studio',
  agency:     'Agency',
  enterprise: 'Enterprise',
}

const PLAN_EXPORTS: Record<string, string> = {
  free:       '10 / month',
  creator:    '200 / month',
  freelancer: '750 / month',
  studio:     '3,000 / month',
  agency:     'Unlimited',
  enterprise: 'Unlimited',
}

const PLAN_IMAGES: Record<string, string> = {
  free:       '2 per session',
  creator:    '10 per session',
  freelancer: '50 per session',
  studio:     '150 per session',
  agency:     'Unlimited',
  enterprise: 'Unlimited',
}

const PLAN_SEATS: Record<string, string> = {
  free:       '1',
  creator:    '1',
  freelancer: '1',
  studio:     '5',
  agency:     '20',
  enterprise: 'Unlimited',
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  active:    { label: 'Active',    color: 'text-green-700 bg-green-50 border-green-200' },
  trialing:  { label: 'Trial',     color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  canceling: { label: 'Canceling', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  past_due:  { label: 'Past due',  color: 'text-red-700 bg-red-50 border-red-200' },
  canceled:  { label: 'Canceled',  color: 'text-gray-500 bg-gray-50 border-gray-200' },
}

// ── Types ──────────────────────────────────────────────────────

interface Subscription {
  plan: string
  status: string
  current_period_end: string | null
  trial_end: string | null
  cancel_at: string | null
  cancel_at_period_end: boolean
  stripe_customer_id?: string
}

interface Props {
  userEmail: string
  userName: string
  subscription: Subscription | null
  cardLast4: string | null
}

// ── Helpers ────────────────────────────────────────────────────

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-[11px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-4">{title}</h2>
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="text-sm font-medium text-gray-900 text-right">{children}</div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────

export default function DashboardClient({ userEmail, userName, subscription, cardLast4 }: Props) {
  const router = useRouter()

  // Profile state
  const [name, setName] = useState(userName)
  const [email, setEmail] = useState(userEmail)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  // Billing state
  const [portalLoading, setPortalLoading] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [localCanceled, setLocalCanceled] = useState(false)
  const [localCancelAt, setLocalCancelAt] = useState<string | null>(subscription?.cancel_at ?? null)

  // Derived subscription values
  const plan = subscription?.plan ?? null
  const status = subscription?.status ?? null
  const isCanceling = status === 'canceling' || localCanceled
  const isTrialing = status === 'trialing'
  const hasActive = !!subscription && status !== 'canceled'
  const meta = STATUS_META[status ?? ''] ?? STATUS_META['canceled']
  const periodEnd = subscription?.current_period_end ?? null
  const trialEnd = subscription?.trial_end ?? null

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileError(''); setProfileSuccess('')

    if (password && password !== confirm) {
      setProfileError('Passwords do not match.')
      return
    }
    if (password && password.length < 6) {
      setProfileError('Password must be at least 6 characters.')
      return
    }

    const body: Record<string, string> = {}
    if (name !== userName) body.name = name
    if (email !== userEmail) body.email = email
    if (password) body.password = password

    if (Object.keys(body).length === 0) {
      setProfileError('No changes to save.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setProfileError(data.error ?? 'Failed to save.'); return }

      setProfileSuccess(email !== userEmail
        ? 'Check your new email address for a confirmation link.'
        : 'Profile updated successfully.')
      setPassword(''); setConfirm('')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function openPortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setPortalLoading(false)
    }
  }

  async function confirmCancel() {
    setCanceling(true); setCancelError('')
    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setCancelError(data.error ?? 'Something went wrong.'); return }
      setLocalCanceled(true)
      setLocalCancelAt(data.cancel_at)
      setShowCancel(false)
      router.refresh()
    } catch {
      setCancelError('Network error. Please try again.')
    } finally {
      setCanceling(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Profile ──────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <form onSubmit={saveProfile}>

          {/* Name */}
          <div className="px-6 py-5 border-b border-gray-100">
            <SectionHeader title="Display Name" />
            <p className="text-xs text-gray-400 mb-3">This is how your name appears across the app.</p>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

          {/* Email */}
          <div className="px-6 py-5 border-b border-gray-100">
            <SectionHeader title="Email Address" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

          {/* Password */}
          <div className="px-6 py-5 border-b border-gray-100">
            <SectionHeader title="Password" />
            <p className="text-xs text-gray-400 mb-3">Leave blank to keep your current password.</p>
            <div className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="New password"
                minLength={6}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {profileError && <p className="text-xs text-red-600">{profileError}</p>}
            {profileSuccess && <p className="text-xs text-green-700">{profileSuccess}</p>}
          </div>

        </form>
      </div>

      {/* ── Plan & Billing ────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <SectionHeader title="Plan & Billing" />

        {!hasActive ? (
          <div className="text-sm text-gray-500 py-2">
            No active subscription.{' '}
            <a href="/#pricing" className="text-indigo-600 font-medium hover:underline">View plans →</a>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100 -mx-6 px-6">
              <Row label="Plan">
                <span className="font-semibold">{PLAN_LABELS[plan!] ?? '—'}</span>
              </Row>
              <Row label="Status">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${isCanceling ? STATUS_META['canceling'].color : meta.color}`}>
                  {isCanceling ? 'Canceling' : meta.label}
                </span>
              </Row>
              <Row label="Exports">{PLAN_EXPORTS[plan!] ?? '—'}</Row>
              <Row label="Images / session">{PLAN_IMAGES[plan!] ?? '—'}</Row>
              <Row label="Team seats">{PLAN_SEATS[plan!] ?? '—'}</Row>
              <Row label="Exports">{plan === 'free' ? 'JPG (watermarked)' : plan === 'creator' || plan === 'freelancer' ? 'JPG, PNG, WebP' : 'All types'}</Row>
              {isTrialing && trialEnd && (
                <Row label="Trial ends">{fmt(trialEnd)}</Row>
              )}
              <Row label={isCanceling ? 'Access until' : 'Next billing date'}>
                <span className={isCanceling ? 'text-amber-700' : ''}>
                  {fmt(isCanceling ? (localCancelAt ?? periodEnd) : periodEnd)}
                </span>
              </Row>
              {cardLast4 && (
                <Row label="Payment method">
                  <span className="font-mono">•••• {cardLast4}</span>
                </Row>
              )}
            </div>

            {isCanceling && (
              <p className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Scheduled to cancel. You'll keep full access until {fmt(localCancelAt ?? periodEnd)}.
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3 items-center">
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
              >
                {portalLoading ? 'Opening…' : 'Manage Billing'}
              </button>
              {(plan === 'free' || plan === 'creator' || plan === 'freelancer') && !isCanceling && (
                <a href="/#pricing" className="text-sm font-semibold text-indigo-600 hover:underline">
                  Upgrade plan →
                </a>
              )}
              {!isCanceling && (
                <button
                  onClick={() => setShowCancel(true)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline ml-auto"
                >
                  Cancel subscription
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Cancel confirmation dialog ─────────────────────────── */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !canceling && setShowCancel(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-7 w-full max-w-md mx-4 z-10">
            <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center mb-4">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 2C6.03 2 2 6.03 2 11s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 13.5a1 1 0 110-2 1 1 0 010 2zm1-4.5h-2V6h2v5z" fill="#DC2626"/>
              </svg>
            </div>
            <h3 className="text-[17px] font-bold text-gray-900 mb-2">Cancel subscription?</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-1">
              Your <strong>{PLAN_LABELS[plan!]}</strong> plan stays active until <strong>{fmt(periodEnd)}</strong>. After that you'll lose access to paid features.
            </p>
            <p className="text-sm text-gray-400 mb-6">You won't be charged again.</p>
            {cancelError && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{cancelError}</p>}
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowCancel(false)}
                disabled={canceling}
                className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Keep subscription
              </button>
              <button
                onClick={confirmCancel}
                disabled={canceling}
                className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60 disabled:cursor-wait"
              >
                {canceling ? 'Canceling…' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
