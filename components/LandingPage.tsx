'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LogoMark from '@/components/LogoMark'
import FeedbackWidget from '@/components/FeedbackWidget'

// ── Helpers for crop demo animation ────────────────────────
function easeIO(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function ep(elapsed: number, startMs: number, endMs: number) {
  return easeIO(Math.max(0, Math.min(1, (elapsed - startMs) / (endMs - startMs))))
}

const DEMO_TEXT = 'ASPCT RATIO'

function MockupCropDemo() {
  const [anim, setAnim] = useState({
    cursorX: 60, cursorY: 44, panX: 0, panY: 0, zoom: 100,
    pressing: false, visible: false,
    typedLen: 0, textX: 50, textY: 38, textVisible: false, textDragging: false,
  })

  useEffect(() => {
    // Timeline (18s loop):
    //  0–800      cursor appears
    //  800–1700   cursor → zoom slider
    //  1700–4500  zoom 100→150
    //  4500–5200  cursor → image center
    //  5200–7500  drag pan
    //  7500–8200  cursor → text area (move off image, prepare for copy phase)
    //  8200–11000 text types in letter by letter ("ASPCT RATIO")
    //  11000–11500 cursor moves to the text
    //  11500–14000 cursor drags text from center-top to lower-right
    //  14000–14700 cursor to slider
    //  14700–15500 zoom resets
    //  15500–16500 text fades, pause
    //  16500–18000 reset
    const LOOP = 18000
    const t0 = Date.now()
    const id = setInterval(() => {
      const e = (Date.now() - t0) % LOOP

      // ── Cursor position ────────────────────────────────
      let cx = 60, cy = 44
      if (e < 800)            { cx = 60; cy = 44 }
      else if (e < 1700)      { cx = lerp(60, 88, ep(e, 800, 1700));  cy = lerp(44, 86, ep(e, 800, 1700)) }
      else if (e < 4500)      { cx = 88; cy = 86 }
      else if (e < 5200)      { cx = lerp(88, 52, ep(e, 4500, 5200)); cy = lerp(86, 42, ep(e, 4500, 5200)) }
      else if (e < 7500)      { cx = lerp(52, 68, ep(e, 5200, 7500)); cy = lerp(42, 58, ep(e, 5200, 7500)) }
      else if (e < 8200)      { cx = lerp(68, 50, ep(e, 7500, 8200)); cy = lerp(58, 32, ep(e, 7500, 8200)) }
      // typing phase — cursor sits near text
      else if (e < 11000)     { cx = 65; cy = 40 }
      // move cursor to text to grab it
      else if (e < 11500)     { cx = lerp(65, 50, ep(e, 11000, 11500)); cy = lerp(40, 38, ep(e, 11000, 11500)) }
      // drag text
      else if (e < 14000)     { cx = lerp(50, 60, ep(e, 11500, 14000)); cy = lerp(38, 72, ep(e, 11500, 14000)) }
      // move to slider
      else if (e < 14700)     { cx = lerp(60, 88, ep(e, 14000, 14700)); cy = lerp(72, 86, ep(e, 14000, 14700)) }
      else                    { cx = 88; cy = 86 }

      // ── Pressing (pan drag + text drag) ─────────────────
      const pressing = (e >= 5200 && e < 7500) || (e >= 11500 && e < 14000)

      // ── Zoom ──────────────────────────────────────────
      let zoom = 100
      if (e >= 1700 && e < 4500)        { zoom = lerp(100, 150, ep(e, 1700, 4500)) }
      else if (e >= 4500 && e < 14700)  { zoom = 150 }
      else if (e >= 14700 && e < 15500) { zoom = lerp(150, 100, ep(e, 14700, 15500)) }

      // ── Pan ───────────────────────────────────────────
      const z = zoom / 100
      const maxSafe = z > 1 ? ((z - 1) / (2 * z)) * 100 : 0
      let rawPanX = 0, rawPanY = 0
      if (e >= 5200 && e < 7500)        { rawPanX = lerp(0, 3, ep(e, 5200, 7500));  rawPanY = lerp(0, -4, ep(e, 5200, 7500)) }
      else if (e >= 7500 && e < 14700)  { rawPanX = 3; rawPanY = -4 }
      else if (e >= 14700 && e < 15500) { rawPanX = lerp(3, 0, ep(e, 14700, 15500)); rawPanY = lerp(-4, 0, ep(e, 14700, 15500)) }
      const panX = Math.max(-maxSafe, Math.min(maxSafe, rawPanX))
      const panY = Math.max(-maxSafe, Math.min(maxSafe, rawPanY))

      // ── Text typing ───────────────────────────────────
      let typedLen = 0
      let textVisible = false
      if (e >= 8200 && e < 16500) {
        textVisible = true
        const typeProgress = Math.min(1, (e - 8200) / 2500) // 2.5s to type all chars
        typedLen = Math.floor(typeProgress * DEMO_TEXT.length)
      }

      // ── Text position (dragging) ──────────────────────
      let textX = 50, textY = 38
      const textDragging = e >= 11500 && e < 14000
      if (e >= 11500 && e < 14000) {
        textX = lerp(50, 60, ep(e, 11500, 14000))
        textY = lerp(38, 72, ep(e, 11500, 14000))
      } else if (e >= 14000 && e < 16500) {
        textX = 60; textY = 72
      }

      setAnim({
        cursorX: cx, cursorY: cy, panX, panY, zoom: Math.round(zoom),
        pressing, visible: e > 300 && e < 17500,
        typedLen, textX, textY, textVisible, textDragging,
      })
    }, 33)
    return () => clearInterval(id)
  }, [])

  const { cursorX, cursorY, panX, panY, zoom, pressing, visible, typedLen, textX, textY, textVisible, textDragging } = anim
  const sliderPct = Math.round(Math.max(0, Math.min(100, (zoom - 100) / 50 * 100)))

  return (
    <div className="flex flex-col items-center px-4 py-4">
      <div className="relative rounded-lg overflow-hidden" style={{ width: 270, height: 480 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/demo-hero.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: `scale(${zoom / 100}) translate(${panX}%, ${panY}%)`, transformOrigin: 'center center' }}
        />
        {/* Text overlay */}
        {textVisible && typedLen > 0 && (
          <div
            className="absolute pointer-events-none z-[5] transition-opacity duration-300"
            style={{
              left: `${textX}%`, top: `${textY}%`,
              transform: 'translate(-50%, -50%)',
              opacity: textVisible ? 1 : 0,
            }}
          >
            <span
              className="text-white font-extrabold tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
              style={{ fontSize: 22, letterSpacing: '0.08em' }}
            >
              {DEMO_TEXT.slice(0, typedLen)}
            </span>
            {typedLen < DEMO_TEXT.length && (
              <span className="inline-block w-[2px] h-[18px] bg-white ml-[1px] animate-pulse align-middle" />
            )}
            {textDragging && (
              <div className="absolute -inset-1.5 border border-dashed border-white/60 rounded pointer-events-none" />
            )}
          </div>
        )}
        <div className="absolute inset-0 border-2 border-indigo-600 pointer-events-none">
          {([['top-[-1px]','left-[-1px]'],['top-[-1px]','right-[-1px]'],['bottom-[-1px]','left-[-1px]'],['bottom-[-1px]','right-[-1px]']] as const).map(([t,l],i) => (
            <div key={i} className={`absolute w-3 h-3 border-2 border-indigo-600 bg-white rounded-[2px] ${t} ${l}`} />
          ))}
        </div>
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded pointer-events-none">1080 × 1920</div>
        {visible && (
          <div className="absolute pointer-events-none z-10" style={{ left: `${cursorX}%`, top: `${cursorY}%`, transform: 'translate(-2px, -2px)' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3.5 2.5l14.5 9-7 1.5L9 20 3.5 2.5z" fill={pressing ? '#6366f1' : 'white'} stroke={pressing ? '#3730a3' : '#1f2937'} strokeWidth="1.6" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 mt-3" style={{ width: 270 }}>
        <span className="text-xs text-gray-400 flex-shrink-0">&#8853;</span>
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
    a: 'Paid plans include a 7-day free trial with full access. Cancel anytime before the trial ends and you won\'t be charged. There\'s also a free-forever plan with 10 exports per month.',
  },
  {
    q: 'What file types can I upload?',
    a: 'We support JPG, PNG, WebP, GIF, MP4, MOV, and WebM. Upload limits vary by plan — from 2 images per session on Free up to unlimited on Agency.',
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

const PRODUCT_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Supported Channels', href: '#channels' },
]

const USE_CASE_LINKS = [
  { label: 'For Agencies', href: '/use-cases/agencies' },
  { label: 'For Brands', href: '/use-cases/brands' },
  { label: 'For Studios', href: '/use-cases/studios' },
  { label: 'For Freelancers', href: '/use-cases/freelancers' },
  { label: 'For Content Creators', href: '/use-cases/content-creators' },
]

const RESOURCE_LINKS = [
  { label: 'Asset Resizing', href: '/tools/asset-resizing', group: 'Tools' },
  { label: 'Image Cropping', href: '/tools/image-cropping', group: 'Tools' },
  { label: 'Social Media Resizer', href: '/tools/social-media-image-resizer', group: 'Tools' },
  { label: 'Content Creator Resizer', href: '/tools/content-creator-image-resizer', group: 'Tools' },
  { label: 'How to Resize for Social', href: '/guides/how-to-resize-images-for-social-media', group: 'Guides' },
  { label: 'Image Sizes Reference', href: '/guides/image-sizes-for-every-social-platform', group: 'Guides' },
]

export default function LandingPage({ isLoggedIn = false, userEmail }: { isLoggedIn?: boolean; userEmail?: string }) {
  const [annual, setAnnual] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hasActiveSub, setHasActiveSub] = useState(false)
  const [productOpen, setProductOpen] = useState(false)
  const [useCasesOpen, setUseCasesOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const router = useRouter()

  // Read plan from user_metadata — stamped by the Stripe webhook on subscription events.
  // Avoids a table query and RLS issues; null means no active subscription.
  useEffect(() => {
    if (!isLoggedIn) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      const plan = user?.user_metadata?.plan
      const PAID_PLANS = ['creator', 'freelancer', 'studio', 'agency', 'enterprise']
      setHasActiveSub(typeof plan === 'string' && PAID_PLANS.includes(plan))
    })
  }, [isLoggedIn])

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
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        {/* ── Desktop & mobile top bar ── */}
        <div className="flex md:grid items-center h-[80px] px-4 sm:px-6 md:px-10 justify-between" style={{ gridTemplateColumns: '1fr auto 1fr' }}>

          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" className="no-underline flex-shrink-0">
              <LogoMark height={75} />
            </Link>
          </div>

          {/* Center nav links — desktop only, truly centered */}
          <div className="hidden md:flex items-center gap-7">

            {/* Product dropdown — anchor links on homepage */}
            <div className="relative" onMouseEnter={() => setProductOpen(true)} onMouseLeave={() => setProductOpen(false)}>
              <button className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors tracking-wide flex items-center gap-1">
                PRODUCT
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform ${productOpen ? 'rotate-180' : ''}`}>
                  <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {productOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-lg py-2 min-w-[220px]">
                    {PRODUCT_LINKS.map(link => (
                      <a key={link.href} href={link.href} className="block px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors no-underline">
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Use Cases dropdown */}
            <div className="relative" onMouseEnter={() => setUseCasesOpen(true)} onMouseLeave={() => setUseCasesOpen(false)}>
              <button className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors tracking-wide flex items-center gap-1">
                USE CASES
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform ${useCasesOpen ? 'rotate-180' : ''}`}>
                  <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {useCasesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-lg py-2 min-w-[220px]">
                    {USE_CASE_LINKS.map(link => (
                      <Link key={link.href} href={link.href} className="block px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors no-underline">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resources dropdown */}
            <div className="relative" onMouseEnter={() => setResourcesOpen(true)} onMouseLeave={() => setResourcesOpen(false)}>
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
                    {RESOURCE_LINKS.filter(l => l.group === 'Tools').map(link => (
                      <Link key={link.href} href={link.href} className="block px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors no-underline">
                        {link.label}
                      </Link>
                    ))}
                    <div className="my-1.5 border-t border-gray-100" />
                    <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.8px] text-gray-400">Guides</p>
                    {RESOURCE_LINKS.filter(l => l.group === 'Guides').map(link => (
                      <Link key={link.href} href={link.href} className="block px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors no-underline">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing — direct link */}
            <a href="#pricing" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors no-underline tracking-wide">PRICING</a>
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

        {/* ── Mobile dropdown menu ── */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-5 py-4 flex flex-col gap-1 max-h-[80vh] overflow-y-auto">

            {/* Product */}
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.8px] text-gray-400 mt-1">Product</p>
            {PRODUCT_LINKS.map(link => (
              <a key={link.href} href={link.href} onClick={closeMenu}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors no-underline px-3 py-2.5 rounded-lg block">
                {link.label}
              </a>
            ))}

            <div className="my-2 border-t border-gray-100" />

            {/* Use Cases */}
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.8px] text-gray-400">Use Cases</p>
            {USE_CASE_LINKS.map(link => (
              <Link key={link.href} href={link.href} onClick={closeMenu}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors no-underline px-3 py-2.5 rounded-lg block">
                {link.label}
              </Link>
            ))}

            <div className="my-2 border-t border-gray-100" />

            {/* Resources */}
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.8px] text-gray-400">Resources</p>
            {RESOURCE_LINKS.map(link => (
              <Link key={link.href} href={link.href} onClick={closeMenu}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors no-underline px-3 py-2.5 rounded-lg block">
                {link.label}
              </Link>
            ))}

            <div className="my-2 border-t border-gray-100" />

            {/* Pricing */}
            <a href="#pricing" onClick={closeMenu} className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors no-underline tracking-wide px-3 py-3 rounded-lg">PRICING</a>

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

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="pt-24 pb-20 px-6 text-center bg-gradient-to-b from-white to-gray-50">
        <h1 className="text-[clamp(40px,6vw,68px)] font-extrabold leading-[1.1] tracking-[-2px] max-w-[800px] mx-auto mb-5 uppercase">
          THE ASSET RESIZING PLATFORM FOR{' '}
          <em className="not-italic bg-gradient-to-br from-indigo-600 to-indigo-400 bg-clip-text text-transparent">CREATIVE TEAMS.</em>
        </h1>
        <p className="text-[18px] text-gray-500 max-w-[560px] mx-auto mb-11 leading-[1.7] font-normal">
          One upload. Every format. Ready in minutes.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href={hasActiveSub ? '/app' : isLoggedIn ? '/#pricing' : '/signup?redirectTo=%2F%23pricing'}
            className="h-12 px-7 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-[15px] font-semibold rounded-[10px] transition-all whitespace-nowrap flex items-center no-underline"
          >
            {hasActiveSub ? 'START PROJECT →' : 'START FREE TRIAL →'}
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

      {/* ── APP PREVIEW / INTERACTIVE DEMO ──────────────────── */}
      <section className="pt-20 pb-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-3">The Solution</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-1.2px] text-gray-900 leading-[1.15] max-w-[620px] mb-10">
            Built for the way campaigns actually work.
          </h2>
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
                  { label: '\u2460 Upload', state: 'done' },
                  { label: '\u2461 Formats', state: 'done' },
                  { label: '\u2462 Adjust crops', state: 'active' },
                  { label: '\u2463 Copy', state: 'active' },
                  { label: '\u2464 Export', state: 'todo' },
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

                {/* Right: mock sidebar */}
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
                        <img src="/images/demo-hero.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: pos }} />
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
          <p className="text-base text-gray-500 leading-[1.75] max-w-[560px] mx-auto text-center mt-10">Every decision was made by people who&apos;ve run asset production at global brands — not by engineers guessing at marketing workflows.</p>
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
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))' }}>
            {[
              { title: '60+ platform formats', body: 'Instagram, TikTok, YouTube, X, Snapchat, Pinterest, LinkedIn, PDP, homepage, email, IAB display, in-store, OOH, and more — all preloaded.' },
              { title: 'Custom naming conventions', body: 'Build tokens from client name, channel, dimension, platform, asset name, and date. Your file naming system — your rules.' },
              { title: 'Batch multi-asset upload', body: 'Upload multiple images and videos at once — limits scale with your plan. Apply a crop adjustment to one file, or fine-tune every asset individually.' },
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
          <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-1.2px] text-gray-900 leading-[1.15] max-w-[620px] mb-4">Simple, export-based pricing</h2>
          <p className="text-base text-gray-500 leading-[1.75] max-w-[560px] mb-8">One export = one image at one format size. Pay for what you actually produce.</p>

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
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 210px), 1fr))' }}>

            {/* Free */}
            <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col">
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-900 mb-1">Free</p>
                <div className="flex items-end gap-1.5 mb-4">
                  <span className="text-[40px] font-extrabold tracking-[-2px] text-gray-900">$0</span>
                  <span className="text-sm text-gray-400 mb-2">forever</span>
                </div>
                <p className="text-sm text-gray-500">Try the core workflow — no credit card, no time limit.</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  '10 exports / month',
                  '2 images per session',
                  '5 formats per session',
                  'Smart crop & adjust',
                  'Watermarked exports',
                  'JPG export only',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-indigo-500 mt-0.5 flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="w-full h-10 flex items-center justify-center text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors no-underline"
              >
                Get started
              </Link>
            </div>

            {/* Creator */}
            <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col">
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-900 mb-1">Creator</p>
                <div className="flex items-end gap-1.5 mb-4">
                  <span className="text-[40px] font-extrabold tracking-[-2px] text-gray-900">{annual ? '$290' : '$29'}</span>
                  <span className="text-sm text-gray-400 mb-2">{annual ? '/year' : '/mo'}</span>
                </div>
                <p className="text-sm text-gray-500">For content creators and social media managers posting across platforms.</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  '200 exports / month',
                  '10 images per session',
                  'All platform formats',
                  'Text overlays',
                  'JPG, PNG, WebP export',
                  'No watermark',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-indigo-500 mt-0.5 flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => goToConfirm('creator')}
                className="w-full h-10 flex items-center justify-center text-sm font-semibold border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Start free trial
              </button>
            </div>

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
                  '750 exports / month',
                  '50 images per session',
                  'All platform formats',
                  'Text overlays',
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
                  '3,000 exports / month',
                  '150 images per session',
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
                  'Unlimited exports',
                  'Unlimited images per session',
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

          </div>

          {/* Enterprise callout */}
          <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">Enterprise</p>
              <p className="text-sm text-gray-500">Custom volumes, white-labeling, SLA, dedicated onboarding, and annual contracts.</p>
            </div>
            <a href="mailto:hello@aspctratio.com" className="flex-shrink-0 h-10 px-6 flex items-center justify-center text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors no-underline">
              Talk to us →
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center bg-gray-900">
        <h2 className="text-[clamp(32px,5vw,52px)] font-extrabold tracking-[-1.5px] text-white mb-4 leading-[1.1]">Start slicing in minutes.</h2>
        <p className="text-lg text-gray-400 max-w-[480px] mx-auto mb-10 leading-[1.7]">
          Upload your assets, pick your formats, and export everything — cropped, named, and sorted — in one session.
        </p>
        <div className="flex justify-center mb-5">
          <Link href="/signup" className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-[15px] font-semibold rounded-[10px] transition-all whitespace-nowrap flex items-center no-underline">
            Get started for free →
          </Link>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <FAQ />

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-gray-900 border-t border-white/[0.06] py-14 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 mb-10">
            {/* Brand */}
            <div>
              <Link href="/" className="no-underline">
                <LogoMark height={75} dark />
              </Link>
              <p className="text-[13px] text-gray-500 mt-3 leading-relaxed">
                Upload once. Export every format, named and sorted, in minutes.
              </p>
            </div>

            {/* Use Cases */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-3">Use Cases</p>
              <div className="flex flex-col gap-2">
                <Link href="/use-cases/agencies" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">For Agencies</Link>
                <Link href="/use-cases/brands" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">For Brands</Link>
                <Link href="/use-cases/studios" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">For Studios</Link>
                <Link href="/use-cases/freelancers" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">For Freelancers</Link>
                <Link href="/use-cases/content-creators" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">For Content Creators</Link>
              </div>
            </div>

            {/* Resources */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-3">Resources</p>
              <div className="flex flex-col gap-2">
                <Link href="/tools/asset-resizing" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Asset Resizing</Link>
                <Link href="/tools/image-cropping" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Image Cropping</Link>
                <Link href="/tools/social-media-image-resizer" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Social Media Resizer</Link>
                <Link href="/tools/content-creator-image-resizer" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Content Creator Resizer</Link>
              </div>
            </div>

            {/* Guides */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-3">Guides</p>
              <div className="flex flex-col gap-2">
                <Link href="/guides/how-to-resize-images-for-social-media" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">How to Resize for Social</Link>
                <Link href="/guides/image-sizes-for-every-social-platform" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Image Sizes Reference</Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-3">Company</p>
              <div className="flex flex-col gap-2">
                <Link href="/privacy" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Privacy Policy</Link>
                <Link href="/terms" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Terms of Service</Link>
                <a href="mailto:hello@aspctratio.com" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Contact</a>
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="border-t border-white/[0.06] pt-8 mb-8 max-w-md">
            <FeedbackWidget />
          </div>

          <div className="border-t border-white/[0.06] pt-6">
            <span className="text-[12px] text-gray-600">© 2026 ASPCT RATIO LLC. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
