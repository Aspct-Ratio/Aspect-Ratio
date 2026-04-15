'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import LogoMark from '@/components/LogoMark'

export default function SignupPage() {
  return <Suspense><SignupForm /></Suspense>
}

function SignupForm() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectTo = searchParams.get('redirectTo') ?? '/'
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}` },
    })

    if (error) { setError(error.message); setLoading(false); return }

    // Add to waitlist if not already there
    if (email) {
      await supabase.from('waitlist').upsert({ email }, { onConflict: 'email', ignoreDuplicates: true })
    }

    // If email confirmation is disabled, user is immediately active — redirect
    if (data.session) {
      router.push(redirectTo)
      router.refresh()
      return
    }

    // Otherwise show confirmation message
    setDone(true)
    setLoading(false)
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}` },
    })
    if (error) setError(error.message)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Link href="/" className="mb-8 flex items-center gap-3 no-underline">
          <LogoMark height={45} />
          <span className="font-bold text-[15px] tracking-tight text-gray-900">ASPCT RATIO</span>
        </Link>
        <div className="bg-white border border-gray-200 rounded-xl shadow p-8 w-full max-w-sm text-center">
          <div className="text-3xl mb-3">📬</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-sm text-gray-500">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and get started.
          </p>
          <Link href="/login" className="block mt-6 text-sm text-indigo-600 font-medium hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 flex items-center gap-3 no-underline">
        <LogoMark height={45} />
        <span className="font-bold text-[15px] tracking-tight text-gray-900">ASPCT RATIO</span>
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl shadow p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">Start slicing your assets for free.</p>

        <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition mb-4">
          <GoogleIcon /> Continue with Google
        </button>

        <div className="relative mb-4">
          <hr className="border-gray-200" />
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white px-2 text-[11px] text-gray-400">or</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition" />
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg py-2.5 text-sm transition disabled:opacity-50">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <path d="M15.68 8.18c0-.57-.05-1.12-.14-1.64H8v3.1h4.31a3.68 3.68 0 0 1-1.6 2.42v2h2.58c1.51-1.39 2.39-3.44 2.39-5.88z" fill="#4285F4"/>
      <path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.58-2c-.72.48-1.64.76-2.72.76-2.09 0-3.86-1.41-4.49-3.31H.84v2.07A8 8 0 0 0 8 16z" fill="#34A853"/>
      <path d="M3.51 9.51A4.8 4.8 0 0 1 3.26 8c0-.52.09-1.03.25-1.51V4.42H.84A8 8 0 0 0 0 8c0 1.29.31 2.51.84 3.58l2.67-2.07z" fill="#FBBC05"/>
      <path d="M8 3.18c1.18 0 2.23.41 3.06 1.2l2.29-2.29A8 8 0 0 0 8 0 8 8 0 0 0 .84 4.42l2.67 2.07C4.14 4.59 5.91 3.18 8 3.18z" fill="#EA4335"/>
    </svg>
  )
}
