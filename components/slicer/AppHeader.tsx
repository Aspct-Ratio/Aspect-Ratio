'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LogoMark from '@/components/LogoMark'

type Step = 1 | 2 | 3 | 4
const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: 'UPLOAD' },
  { n: 2, label: 'FORMATS' },
  { n: 3, label: 'ADJUST' },
  { n: 4, label: 'EXPORT' },
]

interface Props {
  step: Step
}

export default function AppHeader({ step }: Props) {
  const supabase = createClient()
  const router = useRouter()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 h-[60px] flex items-center justify-between px-7 bg-white/90 backdrop-blur-md border-b border-gray-200">
      {/* Logo — links back to landing page */}
      <Link href="/" className="no-underline">
        <LogoMark height={38} />
      </Link>

      {/* Step nav */}
      <nav className="flex items-center gap-0.5">
        {STEPS.map((s, i) => {
          const done = s.n < step
          const active = s.n === step
          return (
            <div key={s.n} className="flex items-center">
              {i > 0 && <div className="w-5 h-px bg-gray-200 mx-0.5" />}
              <div className={[
                'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all',
                active ? 'bg-indigo-50 text-indigo-600' : done ? 'text-green-600' : 'text-gray-400',
              ].join(' ')}>
                <div className={[
                  'w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all',
                  active ? 'bg-indigo-600 text-white' : done ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500',
                ].join(' ')}>
                  {done ? '✓' : s.n}
                </div>
                {s.label}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Right: nav actions */}
      <div className="flex items-center gap-1">
        <Link
          href="/"
          className="text-xs font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-100 px-2.5 py-1.5 rounded-md transition no-underline"
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className="text-xs font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-100 px-2.5 py-1.5 rounded-md transition no-underline"
        >
          Account
        </Link>
        <button
          onClick={signOut}
          className="text-xs font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-100 px-2.5 py-1.5 rounded-md transition"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
