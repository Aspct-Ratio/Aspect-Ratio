'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DeleteAccount() {
  const [showDialog, setShowDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      // Sign out client-side then redirect to homepage
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      {/* Danger zone card */}
      <div className="mt-10 border border-red-200 rounded-xl overflow-hidden">
        <div className="bg-red-50 px-5 py-3 border-b border-red-200">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">Danger Zone</p>
        </div>
        <div className="px-5 py-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Delete account</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Permanently removes your account, all data, and cancels any active subscription. This cannot be undone.
            </p>
          </div>
          <button
            onClick={() => setShowDialog(true)}
            className="flex-shrink-0 text-sm font-semibold text-red-600 border border-red-300 hover:bg-red-50 px-4 py-2 rounded-lg transition"
          >
            Delete account
          </button>
        </div>
      </div>

      {/* Confirmation dialog */}
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

            <h3 className="text-[17px] font-bold text-gray-900 mb-2">Delete your account?</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Are you sure? This will <strong>permanently delete your account</strong> and cancel any active subscription. All your data will be removed and this action <strong>cannot be undone</strong>.
            </p>

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
                Keep account
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60 disabled:cursor-wait"
              >
                {loading ? 'Deleting…' : 'Yes, delete forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
