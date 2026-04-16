import type { Metadata } from 'next'
import Link from 'next/link'
import LogoMark from '@/components/LogoMark'

export const metadata: Metadata = {
  title: 'Image Sizes for Every Social Media Platform (2026) — Complete Reference',
  description:
    'Complete 2026 reference for social media image sizes. Instagram, TikTok, Facebook, YouTube, Pinterest, LinkedIn, and X/Twitter dimensions for every placement — feed, story, cover, ad, and more.',
  alternates: { canonical: 'https://aspctratio.com/guides/image-sizes-for-every-social-platform' },
}

function PlatformSection({
  platform,
  children,
}: {
  platform: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-5">{platform}</h2>
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
    </section>
  )
}

function SizeCard({
  placement,
  dimensions,
  ratio,
  note,
}: {
  placement: string
  dimensions: string
  ratio: string
  note?: string
}) {
  return (
    <div className="border border-gray-100 rounded-xl p-5 hover:border-indigo-200 transition-colors">
      <p className="font-semibold text-gray-900 text-sm mb-1">{placement}</p>
      <p className="text-indigo-600 font-bold text-lg tracking-tight">{dimensions}</p>
      <p className="text-gray-400 text-sm mt-1">Ratio: {ratio}</p>
      {note && <p className="text-gray-400 text-sm mt-0.5">{note}</p>}
    </div>
  )
}

export default function ImageSizesReferencePage() {
  return (
    <div className="bg-white text-gray-800 antialiased leading-relaxed">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between h-[80px] px-10">
          <Link href="/" className="no-underline flex-shrink-0">
            <LogoMark height={75} />
          </Link>
          <div className="hidden md:flex items-center gap-7">
            <Link href="/#how-it-works" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors no-underline tracking-wide">HOW IT WORKS</Link>
            <Link href="/#features" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors no-underline tracking-wide">FEATURES</Link>
            <Link href="/#pricing" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors no-underline tracking-wide">SEE PLANS</Link>
          </div>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors no-underline tracking-wide"
          >
            START FREE TRIAL
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="py-20 px-6 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-4">Reference Guide</p>
          <h1 className="text-[clamp(28px,5vw,44px)] font-extrabold tracking-[-1.5px] text-gray-900 leading-[1.1] mb-6">
            Image Sizes for Every Social Media Platform in 2026
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            The definitive reference for social media image dimensions. Bookmark this page and never guess at the right
            size again — every platform, every placement, updated for 2026.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-16">
          {/* Intro */}
          <section>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Social media platforms update their image specifications regularly, and using outdated dimensions can result
              in blurry uploads, unexpected crops, or rejected ad creatives. This guide covers the current recommended
              image sizes for every major platform and placement type as of 2026. Whether you are designing organic
              posts, paid ads, or profile assets, you will find the exact pixel dimensions and aspect ratios below.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              For every size listed, ASPCT RATIO includes a built-in preset — upload your image, select the formats you
              need, and export perfectly cropped versions in seconds.
            </p>
          </section>

          {/* Instagram */}
          <PlatformSection platform="Instagram Image Sizes">
            <SizeCard placement="Feed Post (Square)" dimensions="1080 x 1080 px" ratio="1:1" note="Most common feed format" />
            <SizeCard placement="Feed Post (Portrait)" dimensions="1080 x 1350 px" ratio="4:5" note="Maximum feed real estate" />
            <SizeCard placement="Feed Post (Landscape)" dimensions="1080 x 566 px" ratio="1.91:1" note="Less common, less engagement" />
            <SizeCard placement="Story / Reel Cover" dimensions="1080 x 1920 px" ratio="9:16" note="Full-screen vertical" />
            <SizeCard placement="Carousel Slide" dimensions="1080 x 1080 px" ratio="1:1" note="Consistent across slides" />
            <SizeCard placement="Profile Photo" dimensions="320 x 320 px" ratio="1:1" note="Displays as circle" />
          </PlatformSection>

          {/* TikTok */}
          <PlatformSection platform="TikTok Image Sizes">
            <SizeCard placement="In-Feed Photo Post" dimensions="1080 x 1920 px" ratio="9:16" note="Full-screen vertical" />
            <SizeCard placement="Video Cover Image" dimensions="1080 x 1920 px" ratio="9:16" note="First impression on profile grid" />
            <SizeCard placement="Profile Photo" dimensions="200 x 200 px" ratio="1:1" note="Minimum recommended" />
            <SizeCard placement="Spark Ads" dimensions="1080 x 1920 px" ratio="9:16" note="Matches organic format" />
          </PlatformSection>

          {/* Facebook */}
          <PlatformSection platform="Facebook Image Sizes">
            <SizeCard placement="Feed Image" dimensions="1200 x 630 px" ratio="1.91:1" note="Landscape, link share optimized" />
            <SizeCard placement="Feed Image (Square)" dimensions="1200 x 1200 px" ratio="1:1" note="Higher engagement in some tests" />
            <SizeCard placement="Cover Photo" dimensions="1640 x 624 px" ratio="2.63:1" note="Displays differently on mobile" />
            <SizeCard placement="Story" dimensions="1080 x 1920 px" ratio="9:16" note="Full-screen vertical" />
            <SizeCard placement="Event Cover" dimensions="1920 x 1005 px" ratio="1.91:1" note="Wide landscape format" />
            <SizeCard placement="Ad — Single Image" dimensions="1200 x 628 px" ratio="1.91:1" note="Recommended by Meta Ads" />
          </PlatformSection>

          {/* YouTube */}
          <PlatformSection platform="YouTube Image Sizes">
            <SizeCard placement="Video Thumbnail" dimensions="1280 x 720 px" ratio="16:9" note="Critical for click-through rate" />
            <SizeCard placement="Channel Banner" dimensions="2560 x 1440 px" ratio="16:9" note="Safe area: 1546 x 423 px center" />
            <SizeCard placement="Channel Profile Photo" dimensions="800 x 800 px" ratio="1:1" note="Displays as circle" />
            <SizeCard placement="Community Post Image" dimensions="1200 x 1200 px" ratio="1:1" note="Square works best" />
          </PlatformSection>

          {/* Pinterest */}
          <PlatformSection platform="Pinterest Image Sizes">
            <SizeCard placement="Standard Pin" dimensions="1000 x 1500 px" ratio="2:3" note="Best performing ratio" />
            <SizeCard placement="Long Pin" dimensions="1000 x 2100 px" ratio="1:2.1" note="May be truncated in feed" />
            <SizeCard placement="Square Pin" dimensions="1000 x 1000 px" ratio="1:1" note="Less common, lower visibility" />
            <SizeCard placement="Board Cover" dimensions="600 x 600 px" ratio="1:1" note="Thumbnail display" />
          </PlatformSection>

          {/* LinkedIn */}
          <PlatformSection platform="LinkedIn Image Sizes">
            <SizeCard placement="Single Image Post" dimensions="1200 x 1200 px" ratio="1:1" note="Square maximizes feed space" />
            <SizeCard placement="Link Share Preview" dimensions="1200 x 627 px" ratio="1.91:1" note="Landscape, auto-generated from URL" />
            <SizeCard placement="Company Page Cover" dimensions="1128 x 191 px" ratio="5.9:1" note="Ultra-wide, keep text centered" />
            <SizeCard placement="Profile Background" dimensions="1584 x 396 px" ratio="4:1" note="Personal profile banner" />
            <SizeCard placement="Sponsored Content" dimensions="1200 x 628 px" ratio="1.91:1" note="Landscape ad format" />
            <SizeCard placement="Profile Photo" dimensions="400 x 400 px" ratio="1:1" note="Displays as circle" />
          </PlatformSection>

          {/* X / Twitter */}
          <PlatformSection platform="X / Twitter Image Sizes">
            <SizeCard placement="In-Stream Post" dimensions="1600 x 900 px" ratio="16:9" note="Landscape, displays in timeline" />
            <SizeCard placement="Header Photo" dimensions="1500 x 500 px" ratio="3:1" note="Profile banner" />
            <SizeCard placement="Profile Photo" dimensions="400 x 400 px" ratio="1:1" note="Displays as circle" />
            <SizeCard placement="Card Image (Summary)" dimensions="800 x 418 px" ratio="1.91:1" note="Link preview card" />
          </PlatformSection>

          {/* Tips */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">General Best Practices</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Always upload at the recommended resolution or higher. Platforms will compress your image on upload, so
              starting with a high-quality source ensures the best possible output. Avoid upscaling small images to meet
              these dimensions — the result will be visibly blurry.
            </p>
            <p className="text-gray-600 leading-[1.8] mb-4">
              For images with text, keep all important copy within the center 80 percent of the canvas. Profile banners
              and cover photos in particular display differently on desktop and mobile, and content near the edges is
              often cropped on smaller screens.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              Use JPEG for photographic content and PNG for graphics with text, logos, or transparency. Keep file sizes
              under 20 MB as a general rule — most platforms accept larger files, but smaller uploads process faster and
              display more reliably.
            </p>
          </section>

          {/* CTA */}
          <section className="text-center py-12 px-6 bg-indigo-50 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Resize for Every Platform Automatically</h2>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              ASPCT RATIO has built-in presets for every dimension on this page. Upload your image, select the platforms
              you need, and export a perfectly organized ZIP in seconds. Try it free today.
            </p>
            <Link
              href="/signup"
              className="inline-block text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg transition-colors no-underline tracking-wide"
            >
              Try ASPCT RATIO Free
            </Link>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-white/[0.06] py-14 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            <div>
              <Link href="/" className="no-underline">
                <LogoMark height={75} dark />
              </Link>
              <p className="text-[13px] text-gray-500 mt-3 leading-relaxed">Upload once. Export every format, named and sorted, in minutes.</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-3">Tools</p>
              <div className="flex flex-col gap-2">
                <Link href="/tools/asset-resizing" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Asset Resizing</Link>
                <Link href="/tools/image-cropping" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Image Cropping</Link>
                <Link href="/tools/social-media-image-resizer" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Social Media Resizer</Link>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-3">Guides</p>
              <div className="flex flex-col gap-2">
                <Link href="/guides/how-to-resize-images-for-social-media" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">How to Resize for Social</Link>
                <Link href="/guides/image-sizes-for-every-social-platform" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Image Sizes Reference</Link>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-3">Company</p>
              <div className="flex flex-col gap-2">
                <Link href="/privacy" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Privacy Policy</Link>
                <Link href="/terms" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Terms of Service</Link>
                <a href="mailto:hello@aspctratio.com" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Contact</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-6">
            <span className="text-[12px] text-gray-600">&copy; {new Date().getFullYear()} ASPCT RATIO LLC. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
