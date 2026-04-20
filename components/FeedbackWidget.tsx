'use client'

import { useState, useRef } from 'react'

export default function FeedbackWidget() {
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return

    setSending(true)

    // For now, send via mailto fallback. Can be replaced with a Supabase insert or API route later.
    const subject = encodeURIComponent('ASPCT RATIO Feedback')
    const body = encodeURIComponent(`${message}\n\n— ${email || 'Anonymous'}`)
    window.open(`mailto:hello@aspctratio.com?subject=${subject}&body=${body}`, '_blank')

    setSending(false)
    setSent(true)
    setMessage('')
    setEmail('')

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setSent(false), 4000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-3">Feedback</p>
      <p className="text-[13px] text-gray-500 leading-relaxed">
        We are actively building and would love to hear from you. What would make this tool better?
      </p>
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Tell us what you think..."
        rows={3}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-[13px] text-gray-300 placeholder-gray-600 outline-none focus:border-indigo-500 resize-none"
      />
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email (optional)"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-[13px] text-gray-300 placeholder-gray-600 outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-[12px] font-semibold rounded-lg transition-colors tracking-wide flex-shrink-0"
        >
          {sent ? 'Thanks!' : sending ? 'Sending...' : 'Send Feedback'}
        </button>
      </div>
    </form>
  )
}
