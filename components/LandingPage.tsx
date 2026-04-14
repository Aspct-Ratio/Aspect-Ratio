'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LogoMark from '@/components/LogoMark'

// ── Helpers for crop demo animation ────────────────────────
function easeIO(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function ep(elapsed: number, startMs: number, endMs: number) {
  return easeIO(Math.max(0, Math.min(1, (elapsed - startMs) / (endMs - startMs))))
}

function MockupCropDemo() {
  const [anim, setAnim] = useState({
    cursorX: 60, cursorY: 44, panX: 0, panY: 0, zoom: 100, pressing: false, visible: false,
  })

  useEffect(() => {
    // Sequence: appear → move to slider → zoom up → move to image → drag pan → release → reset
    // Pan only happens AFTER zoom > 100%, so the image always fully covers the frame.
    const LOOP = 12000
    const t0 = Date.now()
    const id = setInterval(() => {
      const e = (Date.now() - t0) % LOOP

      // ── Cursor ───────────────────────────────────────────
      let cx = 60, cy = 44
      if (e < 800)                     { cx = 60;  cy = 44 }                                                               // appear
      else if (e < 1700)               { cx = lerp(60, 88, ep(e, 800, 1700));  cy = lerp(44, 86, ep(e, 800, 1700)) }      // arc to slider
      else if (e < 6200)               { cx = 88;  cy = 86 }                                                               // hold on slider while zoom increases
      else if (e < 7000)               { cx = lerp(88, 52, ep(e, 6200, 7000)); cy = lerp(86, 42, ep(e, 6200, 7000)) }     // arc back to image
      else if (e < 9800)               { cx = lerp(52, 28, ep(e, 7000, 9800)); cy = lerp(42, 60, ep(e, 7000, 9800)) }     // drag left-down
      else if (e < 10500)              { cx = lerp(28, 68, ep(e, 9800, 10500)); cy = lerp(60, 46, ep(e, 9800, 10500)) }   // drag back right
      else if (e < 11200)              { cx = lerp(68, 88, ep(e, 10500, 11200)); cy = lerp(46, 86, ep(e, 10500, 11200)) } // arc to slider to reset
      else                             { cx = 88;  cy = 86 }

      // ── Pressing ─────────────────────────────────────────
      const pressing = e >= 7000 && e < 10500

      // ── Zoom: 100 → 175 → 100 ────────────────────────────
      // Zoom happens FIRST so panning is always safe
      let zoom = 100
      if (e >= 1700 && e < 6200)       { zoom = lerp(100, 175, ep(e, 1700, 6200)) }
      else if (e >= 6200 && e < 11200) { zoom = 175 }
      else if (e >= 11200)             { zoom = lerp(175, 100, ep(e, 11200, 12000)) }

      // ── Pan: only after zoom is up ────────────────────────
      // maxSafePan(z) = (z-1)/(2z)*100 — the furthest % we can translate
      // without revealing any background behind the image edge.
      const z = zoom / 100
      const maxSafe = z > 1 ? ((z - 1) / (2 * z)) * 100 : 0

      let rawPanX = 0, rawPanY = 0
      if (e >= 7000 && e < 9800)       { rawPanX = lerp(0, -14, ep(e, 7000, 9800));  rawPanY = lerp(0, 6, ep(e, 7000, 9800)) }
      else if (e >= 9800 && e < 11200) { rawPanX = lerp(-14, 0, ep(e, 9800, 11200)); rawPanY = lerp(6, 0, ep(e, 9800, 11200)) }

      // Hard clamp — image never reveals empty space regardless of float drift
      const panX = Math.max(-maxSafe, Math.min(maxSafe, rawPanX))
      const panY = Math.max(-maxSafe, Math.min(maxSafe, rawPanY))

      setAnim({ cursorX: cx, cursorY: cy, panX, panY, zoom: Math.round(zoom), pressing, visible: e > 300 && e < 11800 })
    }, 33)
    return () => clearInterval(id)
  }, [])

  const { cursorX, cursorY, panX, panY, zoom, pressing, visible } = anim
  // 100→175 maps to 0→100% on the slider track
  const sliderPct = Math.round(Math.max(0, Math.min(100, (zoom - 100) / 75 * 100)))

  return (
    <div className="flex flex-col items-center px-4 py-4">
      {/* Crop viewport — 270×480 (9:16), overflow-hidden clips the image to frame at all times */}
      <div className="relative rounded-lg overflow-hidden" style={{ width: 270, height: 480 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/Imag2.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: `scale(${zoom / 100}) translate(${panX}%, ${panY}%)`, transformOrigin: 'center center' }}
        />
        {/* Crop border + handles */}
        <div className="absolute inset-0 border-2 border-indigo-600 pointer-events-none">
          {([['top-[-1px]','left-[-1px]'],['top-[-1px]','right-[-1px]'],['bottom-[-1px]','left-[-1px]'],['bottom-[-1px]','right-[-1px]']] as const).map(([t,l],i) => (
            <div key={i} className={`absolute w-3 h-3 border-2 border-indigo-600 bg-white rounded-[2px] ${t} ${l}`} />
          ))}
        </div>
        {/* Dimension badge */}
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded pointer-events-none">1080 × 1920</div>
        {/* Cursor */}
        {visible && (
          <div className="absolute pointer-events-none z-10" style={{ left: `${cursorX}%`, top: `${cursorY}%`, transform: 'translate(-2px, -2px)' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3.5 2.5l14.5 9-7 1.5L9 20 3.5 2.5z" fill={pressing ? '#6366f1' : 'white'} stroke={pressing ? '#3730a3' : '#1f2937'} strokeWidth="1.6" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
      {/* Zoom control */}
      <div className="flex items-center gap-3 mt-3" style={{ width: 270 }}>
        <span className="text-xs text-gray-400 flex-shrink-0">⊕</span>
        <div className="flex-1 h-[5px] bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${sliderPct}%` }} />
        </div>
        <span className="text-[12px] font-mono font-bold text-indigo-600 min-w-[40px] text-right">{zoom}%</span>
      </div>
    </div>
  )
}

const FAQ_ITEMS = [
  {
    q: 'How does the free trial work?',
    a: 'You get 7 days free with full access to all features. No credit card required to start. Cancel anytime before the trial ends and you won\'t be charged.',
  },
  {
    q: 'What file types can I upload?',
    a: 'We support JPG, PNG, WebP, GIF, MP4, MOV, and WebM. Upload up to 50 files per session depending on your plan.',
  },
  {
    q: 'Do I need design skills to use Aspct Ratio?',
    a: 'Not at all. If you can drag and drop a file, you can use Aspct Ratio. The tool handles all the technical resizing — you just adjust the crop if needed.',
  },
  {
    q: 'Can I use my own naming conventions?',
    a: 'Yes. You can set your brand name, campaign name, and the tool builds the filename automatically using your inputs. The folder structure is also organized by channel, platform, and section automatically.',
  },
  {
    q: 'What happens to my files after export?',
    a: 'Your files are processed securely and not stored after your session. Once you download your ZIP, the files are cleared.',
  },
  {
    q: 'Can my whole team use this?',
    a: 'Yes — our Studio and Agency plans are built for teams. Multiple users can access the tool under one account.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'You can cancel anytime directly from your account page. No need to contact support.',
  },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-[720px] mx-auto">
        <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-3">Frequently asked questions</p>
        <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-1.2px] text-gray-900 leading-[1.15] mb-12">Got questions?</h2>
        <div className="divide-y divide-gray-100">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 py-5 text-left group"
              >
                <span className="text-[15px] font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug">{item.q}</span>
                <span className={`flex-shrink-0 w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-indigo-300 group-hover:text-indigo-500 transition-colors text-sm font-bold ${open === i ? 'bg-indigo-50 border-indigo-200 text-indigo-500' : ''}`}>
                  {open === i ? '−' : '+'}
                </span>
              </button>
              {open === i && (
                <p className="pb-5 text-[15px] text-gray-500 leading-[1.7]">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

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
        <div className="grid h-[72px] sm:h-[80px] px-5 sm:px-10" style={{ gridTemplateColumns: '1fr auto 1fr' }}>

          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" className="no-underline flex-shrink-0">
              <LogoMark height={75} />
            </Link>
          </div>

          {/* Center nav links — desktop only, truly centered */}
          <div className="hidden md:flex items-center gap-7">
            <a href="#how-it-works" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors no-underline tracking-wide">HOW IT WORKS</a>
            <a href="#features" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors no-underline tracking-wide">FEATURES</a>
            <a href="#channels" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors no-underline tracking-wide">CHANNELS</a>
            <a href="#pricing" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors no-underline tracking-wide">SEE PLANS</a>
          </div>

          {/* Right: auth actions — desktop only */}
          <div className="hidden md:flex items-center justify-end gap-2">
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

          {/* Hamburger — mobile only (sits in right column) */}
          <div className="md:hidden flex items-center justify-end col-start-3">
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
          One upload. Every format. Ready in minutes.
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

      {/* ── PROOF BAR ───────────────────────────────────────── */}
      <div className="border-t border-b border-gray-100 bg-white py-6 px-6">
        <div className="max-w-[900px] mx-auto flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-[0.8px]">Brands · Agencies · Studios · Creatives</span>
        </div>
      </div>

      {/* ── APP PREVIEW ─────────────────────────────────────── */}
      <section className="pt-20 pb-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-[900px] mx-auto">
          <p className="text-base text-gray-500 leading-[1.75] max-w-[560px] mx-auto text-center mb-10">Every decision was made by people who&apos;ve run asset production at global brands — not by engineers guessing at marketing workflows.</p>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Window chrome */}
            <div className="h-9 sm:h-11 bg-gray-50 border-b border-gray-200 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FC625D] flex-shrink-0" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FDBC40] flex-shrink-0" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#34C749] flex-shrink-0" />
              <div className="ml-2 sm:ml-3 flex-1 bg-gray-100 rounded-md h-[22px] sm:h-[26px] flex items-center px-2 sm:px-3 text-[10px] sm:text-xs text-gray-500 truncate">app.aspctratio.com / adjust</div>
            </div>
            {/* Mock UI */}
            <div className="p-4 sm:p-8">
              {/* Step pills */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-5 sm:mb-7">
                {[
                  { label: '① Upload', state: 'done' },
                  { label: '② Formats', state: 'done' },
                  { label: '③ Adjust crops', state: 'active' },
                  { label: '④ Export', state: 'todo' },
                ].map(({ label, state }) => (
                  <div key={label} className={[
                    'h-6 sm:h-7 px-2.5 sm:px-3.5 rounded-md text-[10px] sm:text-xs font-semibold flex items-center flex-shrink-0',
                    state === 'active' ? 'bg-indigo-600 text-white' :
                    state === 'done' ? 'bg-gray-100 text-gray-400' :
                    'bg-gray-50 border border-gray-200 text-gray-300',
                  ].join(' ')}>{label}</div>
                ))}
              </div>

              {/* Panels — stacked on mobile, side-by-side on md+ */}
              <div className="flex flex-col md:grid gap-4 sm:gap-5" style={{ gridTemplateColumns: '1fr 280px', alignItems: 'start' }}>
                {/* Left: mock crop card */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-3 sm:px-3.5 py-2 sm:py-2.5 bg-white border-b border-gray-100 flex items-center justify-between text-[10px] sm:text-xs font-semibold text-gray-700 gap-2">
                    <span className="truncate">BrandName_SpringCampaign_Hero.jpg</span>
                    <span className="text-gray-400 font-normal flex-shrink-0">1080 × 1920</span>
                  </div>
                  <MockupCropDemo />
                </div>

                {/* Right: mock sidebar — full width on mobile */}
                <div className="w-full bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-3.5 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-700">
                    <span>All formats</span><span className="text-indigo-600">12 selected</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-3">
                    {[
                      { label: 'Feed Sq', cls: 'aspect-square', pos: '50% 40%' },
                      { label: 'Story', cls: 'aspect-[9/16]', pos: '50% 30%' },
                      { label: 'YT Cover', cls: 'aspect-video', pos: '50% 35%' },
                      { label: 'PDP Hero', cls: 'aspect-square', pos: '60% 40%' },
                      { label: 'Banner', cls: 'aspect-video', pos: '50% 45%' },
                      { label: 'TikTok', cls: 'aspect-[9/16]', pos: '45% 30%' },
                    ].map(({ label, cls, pos }) => (
                      <div key={label} className={`rounded-md overflow-hidden relative bg-gray-100 w-full ${cls}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/Imag2.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: pos }} />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] font-semibold px-1.5 py-0.5">{label}</div>
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

      {/* ── HERO FEATURE CARDS ──────────────────────────────── */}
      <section id="features" className="py-16 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[1100px] mx-auto">
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
                  'Up to 150 files per project',
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
                  'Unlimited files per project',
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

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <FAQ />

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-gray-900 border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <Link href="/" className="no-underline">
            <LogoMark height={75} dark />
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
