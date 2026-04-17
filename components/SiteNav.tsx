'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LogoMark from '@/components/LogoMark'

const RESOURCE_LINKS = [
  { label: 'Asset Resizing', href: '/tools/asset-resizing' },
  { label: 'Image Cropping', href: '/tools/image-cropping' },
  { label: 'Social Media Resizer', href: '/tools/social-media-image-resizer' },
  { label: 'How to Resize for Social', href: '/guides/how-to-resize-images-for-social-media' },
  { label: 'Image Sizes Reference', href: '/guides/image-sizes-for-every-social-platform' },
]

export default function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hasActiveSub, setHasActiveSub] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsLoggedIn(true)
        const plan = user.user_metadata?.plan
        const PAID_PLANS = ['freelancer', 'studio', 'agency', 'enterprise']
        setHasActiveSub(typeof plan === 'string' && PAID_PLANS.includes(plan))
      }
    })
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  function closeMenu() { setMenuOpen(false) }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      {/* Desktop & mobile top bar */}
      <div className="flex md:grid items-center h-[80px] px-10 justify-between" style={{ gridTemplateColumns: '1fr auto 1fr' }}>

        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/" className="no-underline flex-shrink-0">
            <LogoMark height={75} />
          </Link>
        </div>

        {/* Center nav links — desktop only */}
        <div className="hidden md:flex items-center gap-7">
          <Link href="/#how-it-works" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors no-underline tracking-wide">HOW IT WORKS</Link>
          <Link href="/#features" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors no-underline tracking-wide">FEATURES</Link>
          <Link href="/#channels" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors no-underline tracking-wide">CHANNELS</Link>
          <Link href="/#pricing" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors no-underline tracking-wide">SEE PLANS</Link>
          <div
            className="relative"
            onMouseEnter={() => setResourcesOpen(true)}
            onMouseLeave={() => setResourcesOpen(false)}
          >
            <button className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors tracking-wide flex items-center gap-1">
              RESOURCES
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform ${resourcesOpen ? 'rotate-180' : ''}`}>
                <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {resourcesOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg py-2 min-w-[220px]">
                  <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.8px] text-gray-400">Tools</p>
                  {RESOURCE_LINKS.slice(0, 3).map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors no-underline"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="my-1.5 border-t border-gray-100" />
                  <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.8px] text-gray-400">Guides</p>
                  {RESOURCE_LINKS.slice(3).map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors no-underline"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: auth actions — desktop only */}
        <div className="hidden md:flex items-center justify-end gap-2">
          {isLoggedIn ? (
            <>
              <Link href={hasActiveSub ? '/app' : '/#pricing'} className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors no-underline tracking-wide">
                {hasActiveSub ? 'START PROJECT →' : 'START FREE TRIAL'}
              </Link>
              <Link href="/account" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 no-underline tracking-wide">
                ACCOUNT
              </Link>
              <button onClick={signOut} className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 tracking-wide">
                SIGN OUT
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 no-underline tracking-wide">
                SIGN IN
              </Link>
              <Link href="/signup" className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors no-underline tracking-wide">
                START FREE TRIAL
              </Link>
            </>
          )}
        </div>

        {/* Hamburger — mobile only */}
        <div className="md:hidden flex items-center justify-end">
          <button
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 py-4 flex flex-col gap-1">
          <Link href="/#how-it-works" onClick={closeMenu} className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors no-underline tracking-wide px-3 py-3 rounded-lg">HOW IT WORKS</Link>
          <Link href="/#features" onClick={closeMenu} className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors no-underline tracking-wide px-3 py-3 rounded-lg">FEATURES</Link>
          <Link href="/#pricing" onClick={closeMenu} className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors no-underline tracking-wide px-3 py-3 rounded-lg">SEE PLANS</Link>

          {/* Resources sub-links */}
          <div className="my-2 border-t border-gray-100" />
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.8px] text-gray-400">Resources</p>
          {RESOURCE_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors no-underline px-3 py-2.5 rounded-lg block"
            >
              {link.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="my-2 border-t border-gray-100" />

          {/* Auth actions */}
          {isLoggedIn ? (
            <>
              <Link href={hasActiveSub ? '/app' : '/#pricing'} onClick={closeMenu} className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg transition-colors no-underline tracking-wide text-center">
                {hasActiveSub ? 'START PROJECT →' : 'START FREE TRIAL'}
              </Link>
              <Link href="/account" onClick={closeMenu} className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors no-underline tracking-wide px-3 py-3 rounded-lg">
                ACCOUNT
              </Link>
              <button onClick={() => { closeMenu(); signOut() }} className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors tracking-wide px-3 py-3 rounded-lg text-left">
                SIGN OUT
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={closeMenu} className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors no-underline tracking-wide px-3 py-3 rounded-lg">
                SIGN IN
              </Link>
              <Link href="/signup" onClick={closeMenu} className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg transition-colors no-underline tracking-wide text-center">
                START FREE TRIAL
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
