'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LogoMark from '@/components/LogoMark'

export default function LandingPage({ isLoggedIn = false, userEmail }: { isLoggedIn?: boolean; userEmail?: string }) {
  const [annual, setAnnual] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  function goToConfirm(plan: string) {
    router.push(`/checkout/confirm?plan=${plan}`)
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  function closeMenu() { setMenuOpen(false) }

  return (
    <div className="bg-white text-gray-800 antialiased leading-relaxed">

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        {/* ── Desktop & mobile top bar ── */}
        <div className="flex items-center justify-between h-[72px] sm:h-[80px] px-5 sm:px-10">

          {/* Logo */}
          <Link href="/" className="no-underline flex-shrink-0">
            <LogoMark height={38} />
          </Link>

          {/* Center nav links — desktop only */}
          <div className="hidden md:flex items-center gap-7">
            <a href="#how-it-works" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors no-underline tracking-wide">HOW IT WORKS</a>
            <a href="#features" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors no-underline tracking-wide">FEATURES</a>
            <a href="#channels" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors no-underline tracking-wide">CHANNELS</a>
            <a href="#pricing" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors no-underline tracking-wide">SEE PLANS</a>
          </div>

          {/* Right auth actions — desktop only */}
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link href="/app" className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors no-underline tracking-wide">
                  GO TO APP →
                </Link>
                <Link href="/dashboard" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 no-underline tracking-wide">
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
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
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

        {/* ── Mobile dropdown menu ── */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-5 py-4 flex flex-col gap-1">
            {/* Nav links */}
            <a href="#how-it-works" onClick={closeMenu} className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors no-underline tracking-wide px-3 py-3 rounded-lg">HOW IT WORKS</a>
            <a href="#features" onClick={closeMenu} className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors no-underline tracking-wide px-3 py-3 rounded-lg">FEATURES</a>
            <a href="#channels" onClick={closeMenu} className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors no-underline tracking-wide px-3 py-3 rounded-lg">CHANNELS</a>
            <a href="#pricing" onClick={closeMenu} className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors no-underline tracking-wide px-3 py-3 rounded-lg">SEE PLANS</a>

            {/* Divider */}
            <div className="my-2 border-t border-gray-100" />

            {/* Auth actions */}
            {isLoggedIn ? (
              <>
                <Link href="/app" onClick={closeMenu} className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg transition-colors no-underline tracking-wide text-center">
                  GO TO APP →
                </Link>
                <Link href="/dashboard" onClick={closeMenu} className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors no-underline tracking-wide px-3 py-3 rounded-lg">
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

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="pt-24 pb-20 px-6 text-center bg-gradient-to-b from-white to-gray-50">
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-[0.5px] uppercase px-3 py-1.5 rounded-full mb-7">
          <span>✦</span> Now live · Free to start
        </div>
        <h1 className="text-[clamp(40px,6vw,68px)] font-extrabold leading-[1.1] tracking-[-2px] text-gray-900 max-w-[900px] mx-auto mb-5">
          BUILT FOR THE WAY<br />
          <em className="not-italic bg-gradient-to-br from-indigo-600 to-indigo-400 bg-clip-text text-transparent">CAMPAIGNS ACTUALLY WORK.</em>
        </h1>
        <p className="text-[18px] text-gray-500 max-w-[560px] mx-auto mb-11 leading-[1.7] font-normal">
          Upload once. Export every format, named and sorted, in minutes.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href={isLoggedIn ? '/#pricing' : '/signup?redirectTo=%2F%23pricing'}
            className="h-12 px-7 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-[15px] font-semibold rounded-[10px] transition-all whitespace-nowrap flex items-center no-underline"
          >
            Start free trial →
          </Link>
          <a href="#how-it-works" className="h-12 px-7 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-[15px] font-semibold rounded-[10px] transition-all whitespace-nowrap flex items-center no-underline">
            See how it works
          </a>
        </div>
      </section>

      {/* ── HERO FEATURE CARDS ──────────────────────────────── */}
      <section id="features" className="py-16 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-base text-gray-500 leading-[1.75] max-w-[560px] mx-auto text-center mb-10">Every decision was made by people who&apos;ve run asset production at global brands — not by engineers guessing at marketing workflows.</p>
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-gray-400">What you get</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {[
              { title: '60+ platform formats', body: 'Instagram, TikTok, YouTube, X, Snapchat, Pinterest, LinkedIn, PDP, homepage, email, IAB display, in-store, OOH, and more — all preloaded.' },
              { title: 'Custom naming conventions', body: 'Build tokens from client name, channel, dimension, platform, asset name, and date. Your file naming system — your rules.' },
              { title: 'Batch multi-asset upload', body: 'Upload up to 50 images and videos at once. Apply a crop adjustment to one file, or fine-tune every asset individually.' },
              { title: 'Interactive crop adjustment', body: 'Pan and zoom each crop independently. Smart upper-center bias gets you 80% of the way there on hero product imagery.' },
              { title: 'Multi-format export', body: 'Export as JPG, PNG, WebP, PDF, or TIFF. Select multiple simultaneously. Full-resolution output in every format.' },
              { title: 'Nested folder structure', body: 'Every ZIP is organized by Channel → Platform → Section. The right person gets the right files instantly, no guesswork.' },
            ].map(({ title, body }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
                <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <div className="w-5 h-5 rounded bg-indigo-600 opacity-70" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 tracking-[-0.3px]">{title}</h3>
                <p className="text-sm text-gray-500 leading-[1.7]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROOF BAR ───────────────────────────────────────── */}
      <div className="border-t border-b border-gray-100 bg-white py-5 px-6">
        <div className="max-w-[900px] mx-auto flex items-center justify-center gap-10 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-[0.8px] whitespace-nowrap">Built for teams at</span>
          <div className="flex items-center gap-8 flex-wrap">
            {['NIKE', 'WIEDEN+KENNEDY', 'UGG', 'R/GA', 'HUGE', 'PUBLICIS'].map(b => (
              <span key={b} className="text-[13px] font-bold tracking-tight text-gray-300 whitespace-nowrap">{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── APP PREVIEW ─────────────────────────────────────── */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-[900px] mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Window chrome */}
            <div className="h-11 bg-gray-50 border-b border-gray-200 flex items-center gap-2 px-4">
              <div className="w-3 h-3 rounded-full bg-[#FC625D]" />
              <div className="w-3 h-3 rounded-full bg-[#FDBC40]" />
              <div className="w-3 h-3 rounded-full bg-[#34C749]" />
              <div className="ml-3 flex-1 bg-gray-100 rounded-md h-[26px] max-w-[340px] flex items-center px-3 text-xs text-gray-500">app.aspct.io / adjust</div>
            </div>
            {/* Mock UI */}
            <div className="p-8">
              {/* Step pills */}
              <div className="flex gap-2 mb-7">
                {[
                  { label: '① Upload', state: 'done' },
                  { label: '② Formats', state: 'done' },
                  { label: '③ Adjust crops', state: 'active' },
                  { label: '④ Export', state: 'todo' },
                ].map(({ label, state }) => (
                  <div key={label} className={[
                    'h-7 px-3.5 rounded-md text-xs font-semibold flex items-center flex-shrink-0',
                    state === 'active' ? 'bg-indigo-600 text-white' :
                    state === 'done' ? 'bg-gray-100 text-gray-400' :
                    'bg-gray-50 border border-gray-200 text-gray-300',
                  ].join(' ')}>{label}</div>
                ))}
              </div>

              <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 280px' }}>
                {/* Left: mock crop card */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-3.5 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-700">
                    <span>UGG_SpringCampaign_Hero.jpg</span>
                    <span className="text-gray-400 font-normal">Instagram Story · 1080 × 1920</span>
                  </div>
                  <div className="h-44 flex items-center justify-center">
                    <div className="w-28 h-40 bg-gray-200 rounded relative overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-indigo-200 via-indigo-300 to-indigo-400 opacity-70" />
                      <div className="absolute inset-0 border-2 border-indigo-600">
                        {[['top-[-1px]','left-[-1px]'],['top-[-1px]','right-[-1px]'],['bottom-[-1px]','left-[-1px]'],['bottom-[-1px]','right-[-1px]']].map(([t,l],i) => (
                          <div key={i} className={`absolute w-2 h-2 border-2 border-indigo-600 bg-white rounded-[1px] ${t} ${l}`} />
                        ))}
                      </div>
                      <div className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">1080 × 1920</div>
                    </div>
                  </div>
                </div>

                {/* Right: mock sidebar */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-3.5 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-700">
                    <span>All formats</span><span className="text-indigo-600">12 selected</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-3">
                    {[
                      { label: 'Feed Sq', cls: 'aspect-square' },
                      { label: 'Story', cls: 'aspect-[9/16]' },
                      { label: 'YT Cover', cls: 'aspect-video' },
                      { label: 'PDP Hero', cls: 'aspect-square' },
                      { label: 'Banner', cls: 'aspect-video' },
                      { label: 'TikTok', cls: 'aspect-[9/16]' },
                    ].map(({ label, cls }) => (
                      <div key={label} className="rounded-md overflow-hidden relative bg-gray-100">
                        <div className={`w-full ${cls} bg-gradient-to-br from-indigo-100 to-indigo-200`} />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] font-semibold px-1 py-0.5">{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="px-3.5 pb-3.5 flex flex-col gap-3">
                    <div>
                      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.6px] mb-1.5">Channels</div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">Social</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-green-50 text-green-700">Ecomm</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-600">Paid</span>
                      </div>
                    </div>
                    <div className="w-full h-9 bg-indigo-600 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 9L2.5 5h3V1.5h2V5h3L6.5 9z" fill="white"/><rect x="1.5" y="10" width="10" height="1.5" rx="0.75" fill="white"/></svg>
                      Export ZIP
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ─────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-3">The problem</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-1.2px] text-gray-900 leading-[1.15] max-w-[620px] mb-4">
            Asset slicing is a time sink that shouldn&apos;t exist
          </h2>
          <p className="text-base text-gray-500 leading-[1.75] max-w-[560px] mb-12">
            Whether you&apos;re in-house or at an agency, your team is spending days on work that should take minutes. It&apos;s repetitive, error-prone, and completely solvable.
          </p>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {[
              { icon: '⏳', bg: 'bg-red-50', title: 'Days of turnaround', body: 'A single campaign launch can require 60–100 individual format variants. Agencies charge by the hour. Teams wait days for delivery.' },
              { icon: '💸', bg: 'bg-amber-50', title: 'Hours lost to mechanical work', body: 'Your team\'s time is worth more than resizing. Every hour spent manually slicing assets is an hour not spent on strategy, concepting, or client work that actually moves the needle.' },
              { icon: '🗂️', bg: 'bg-orange-50', title: 'Inconsistent naming & structure', body: 'Files land in inboxes with random names. Teams spend extra hours renaming, sorting, and distributing assets to the right channel owners.' },
            ].map(({ icon, bg, title, body }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className={`w-10 h-10 ${bg} rounded-[10px] flex items-center justify-center text-xl mb-3.5`}>{icon}</div>
                <h3 className="text-[15px] font-bold text-gray-900 mb-1.5 tracking-[-0.2px]">{title}</h3>
                <p className="text-sm text-gray-500 leading-[1.6]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-gray-100" />

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-6 bg-gray-50">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-3">How it works</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-1.2px] text-gray-900 leading-[1.15] max-w-[620px] mb-4">From upload to ZIP in four steps</h2>
          <p className="text-base text-gray-500 leading-[1.75] max-w-[560px] mb-12">What used to take days — or an agency invoice — now takes minutes. No technical skills required.</p>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {[
              { n: '1', title: 'Upload your master', body: 'Drop in up to 50 image files or video assets. ASPCT RATIO reads every dimension automatically.' },
              { n: '2', title: 'Select channels & formats', body: 'Choose from 60+ prebuilt formats across social, ecomm, paid media, and retail — or define custom dimensions.' },
              { n: '3', title: 'Adjust each crop', body: 'Smart cropping does the heavy lifting. Shift and zoom any individual crop to nail the framing for each format.' },
              { n: '4', title: 'Download organized ZIP', body: 'Every asset is named to your convention and sorted into deeply nested folders by channel, platform, and section.' },
            ].map(({ n, title, body }) => (
              <div key={n} className="px-7 py-8 relative">
                <div className="w-9 h-9 rounded-[10px] bg-indigo-600 text-white text-sm font-extrabold flex items-center justify-center mb-4">{n}</div>
                <h3 className="text-base font-bold text-gray-900 mb-2 tracking-[-0.3px]">{title}</h3>
                <p className="text-sm text-gray-500 leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── CHANNELS ─────────────────────────────────────────── */}
      <section id="channels" className="py-20 px-6 bg-indigo-600">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-300 mb-3">Coverage</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-1.2px] text-white leading-[1.15] mb-4">Every channel. Every format.</h2>
          <p className="text-base text-indigo-300 leading-[1.75] mb-12">60+ formats across social, ecommerce, paid media, and retail. Custom dimensions for anything we haven&apos;t thought of yet.</p>
          <div className="flex flex-wrap gap-2.5">
            {[
              { icon: '📱', name: 'Social Media', count: 'Instagram · TikTok · YouTube · X · Snapchat · Pinterest · LinkedIn' },
              { icon: '🛍️', name: 'Ecommerce', count: 'Homepage · PDP · Category · Email' },
              { icon: '📢', name: 'Paid Media', count: 'IAB Display · IAB Mobile · Google Ads' },
              { icon: '🏬', name: 'Retail & OOH', count: 'In-Store · Digital Signage · Out-of-Home' },
              { icon: '✏️', name: 'Custom Dimensions', count: 'Define any width × height' },
            ].map(({ icon, name, count }) => (
              <div key={name} className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 flex items-center gap-2.5 hover:bg-white/[0.18] transition-colors">
                <span className="text-lg">{icon}</span>
                <div>
                  <div className="text-[13px] font-semibold text-white">{name}</div>
                  <div className="text-[11px] text-indigo-300">{count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTES ───────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-3">Early feedback</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-1.2px] text-gray-900 leading-[1.15] max-w-[620px] mb-4">People who&apos;ve lived this problem</h2>
          <p className="text-base text-gray-500 leading-[1.75] max-w-[560px] mb-12">Reactions from marketing professionals who&apos;ve spent careers managing creative production at global brands.</p>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {[
              { initial: 'J', name: 'Jordan M.', role: 'Senior Brand Manager, Footwear', quote: '"We\'d send a spec sheet to the agency and wait 3 days. If there was a change? Another 3 days. A tool like this would have saved us weeks every campaign cycle."' },
              { initial: 'A', name: 'Alyssa T.', role: 'Digital Production Lead, Agency', quote: '"The naming convention piece alone would be a game-changer. We spend more time arguing about file names than actually doing the work."' },
              { initial: 'R', name: 'Ryan C.', role: 'VP Marketing, DTC Brand', quote: '"Our retainer with the production studio is basically just for resizing. This kind of tool makes that a rounding error on the budget."' },
            ].map(({ initial, name, role, quote }) => (
              <div key={name} className="bg-white border border-gray-200 rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="text-amber-400 text-sm mb-3.5">★★★★★</div>
                <p className="text-[15px] text-gray-700 leading-[1.7] mb-5 italic">{quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold flex items-center justify-center flex-shrink-0">{initial}</div>
                  <div>
                    <div className="text-[13px] font-semibold text-gray-900">{name}</div>
                    <div className="text-xs text-gray-400">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6 bg-gray-50">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-3">Pricing</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-1.2px] text-gray-900 leading-[1.15] max-w-[620px] mb-4">Simple, project-based pricing</h2>
          <p className="text-base text-gray-500 leading-[1.75] max-w-[560px] mb-8">One project = one batch upload session. Pay for what you actually use.</p>

          {/* Toggle */}
          <div className="flex items-center gap-3 mb-12">
            <span className={`text-sm font-medium ${!annual ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(a => !a)}
              className={`relative w-11 h-6 rounded-full transition-colors ${annual ? 'bg-indigo-600' : 'bg-gray-200'}`}
              aria-label="Toggle annual billing"
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${annual ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-gray-900' : 'text-gray-400'}`}>
              Annual <span className="ml-1 text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">Save ~17%</span>
            </span>
          </div>

          {/* Cards */}
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>

            {/* Freelancer */}
            <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col">
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-900 mb-1">Freelancer</p>
                <div className="flex items-end gap-1.5 mb-4">
                  <span className="text-[40px] font-extrabold tracking-[-2px] text-gray-900">{annual ? '$590' : '$59'}</span>
                  <span className="text-sm text-gray-400 mb-2">{annual ? '/year' : '/mo'}</span>
                </div>
                <p className="text-sm text-gray-500">For independent creatives running campaigns solo.</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  '3 projects / month',
                  'Up to 50 files per project',
                  'All platform formats',
                  'JPG, PNG, WebP export',
                  'Custom naming conventions',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-indigo-500 mt-0.5 flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => goToConfirm('freelancer')}
                className="w-full h-10 flex items-center justify-center text-sm font-semibold border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Start free trial
              </button>
            </div>

            {/* Studio — Most Popular */}
            <div className="bg-indigo-600 border border-indigo-600 rounded-2xl p-7 shadow-[0_8px_30px_rgba(79,70,229,0.25)] flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-gray-900 text-[11px] font-bold tracking-[0.5px] uppercase px-3 py-1 rounded-full whitespace-nowrap">
                Most Popular
              </div>
              <div className="mb-6">
                <p className="text-sm font-bold text-white mb-1">Studio</p>
                <div className="flex items-end gap-1.5 mb-4">
                  <span className="text-[40px] font-extrabold tracking-[-2px] text-white">{annual ? '$1,990' : '$199'}</span>
                  <span className="text-sm text-indigo-300 mb-2">{annual ? '/year' : '/mo'}</span>
                </div>
                <p className="text-sm text-indigo-200">For small studios and in-house teams with regular campaign output.</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  '15 projects / month',
                  'Up to 50 files per project',
                  'All export types — JPG, PNG, WebP, PDF, TIFF',
                  'Custom naming & folder structure',
                  '5 team seats',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-indigo-100">
                    <span className="text-indigo-300 mt-0.5 flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => goToConfirm('studio')}
                className="w-full h-10 flex items-center justify-center text-sm font-semibold bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Start free trial
              </button>
            </div>

            {/* Agency */}
            <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col">
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-900 mb-1">Agency</p>
                <div className="flex items-end gap-1.5 mb-4">
                  <span className="text-[40px] font-extrabold tracking-[-2px] text-gray-900">{annual ? '$5,990' : '$599'}</span>
                  <span className="text-sm text-gray-400 mb-2">{annual ? '/year' : '/mo'}</span>
                </div>
                <p className="text-sm text-gray-500">For agencies running production at volume across multiple clients.</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  'Unlimited projects',
                  'Up to 50 files per project',
                  'All export types',
                  'API access',
                  '20 team seats',
                  'Priority support',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-indigo-500 mt-0.5 flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => goToConfirm('agency')}
                className="w-full h-10 flex items-center justify-center text-sm font-semibold border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Start free trial
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col">
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-900 mb-1">Enterprise</p>
                <div className="mb-4 pt-2">
                  <span className="text-[28px] font-extrabold tracking-[-1px] text-gray-900">Custom pricing</span>
                </div>
                <p className="text-sm text-gray-500">For enterprise teams with bespoke production requirements.</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  'Custom project volumes',
                  'Unlimited file sizes',
                  'White-labeling',
                  'SLA & dedicated onboarding',
                  'Annual contracts',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-indigo-500 mt-0.5 flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@aspctratio.com" className="w-full h-10 flex items-center justify-center text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors no-underline">
                Talk to us →
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center bg-gray-900">
        <div className="inline-flex items-center gap-1.5 bg-indigo-600/20 text-indigo-300 text-xs font-semibold tracking-[0.5px] uppercase px-3 py-1.5 rounded-full mb-7">
          <span>✦</span> Free to start
        </div>
        <h2 className="text-[clamp(32px,5vw,52px)] font-extrabold tracking-[-1.5px] text-white mb-4 leading-[1.1]">Start slicing in minutes.</h2>
        <p className="text-lg text-gray-400 max-w-[480px] mx-auto mb-10 leading-[1.7]">
          No agency. No waiting. Upload your first asset and see every format ready to download.
        </p>
        <div className="flex justify-center mb-5">
          <Link href="/signup" className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-[15px] font-semibold rounded-[10px] transition-all whitespace-nowrap flex items-center no-underline">
            Get started free →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-gray-900 border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <Link href="/" className="no-underline">
            <LogoMark height={36} dark />
          </Link>
          <span className="text-[13px] text-gray-600">© 2026 ASPCT RATIO LLC. All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="text-[13px] text-gray-600 hover:text-gray-400 transition-colors no-underline">Privacy</Link>
            <Link href="/terms" className="text-[13px] text-gray-600 hover:text-gray-400 transition-colors no-underline">Terms</Link>
            <a href="mailto:hello@aspctratio.com" className="text-[13px] text-gray-600 hover:text-gray-400 transition-colors no-underline">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
