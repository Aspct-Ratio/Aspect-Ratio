import type { Metadata } from 'next'
import Link from 'next/link'
import LogoMark from '@/components/LogoMark'

export const metadata: Metadata = {
  title: 'Free Asset Resizing Tool — Resize Images for Every Format',
  description:
    'Resize images for ads, social media, and e-commerce in bulk. ASPCT RATIO is the fastest asset resizing tool for marketing teams — upload once, export every size instantly.',
  alternates: { canonical: 'https://aspctratio.com/tools/asset-resizing' },
}

export default function AssetResizingPage() {
  return (
    <div className="bg-white text-gray-800 antialiased leading-relaxed">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between h-[72px] px-6 md:px-10 max-w-5xl mx-auto">
          <Link href="/" className="no-underline flex-shrink-0">
            <LogoMark height={60} />
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition-colors no-underline tracking-wide"
          >
            Try Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="py-20 px-6 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-4">Asset Resizing Tool</p>
          <h1 className="text-[clamp(30px,5vw,48px)] font-extrabold tracking-[-1.5px] text-gray-900 leading-[1.1] mb-6">
            Resize Images for Every Ad, Social, and E-Commerce Format
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Stop wasting hours in Photoshop manually resizing creatives. ASPCT RATIO lets you upload a single image and
            export perfectly cropped versions for more than 60 formats — all at once.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-14">
          {/* What is asset resizing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is Asset Resizing?</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Asset resizing is the process of adapting a single source image into multiple dimensions required by
              different advertising platforms, social networks, and online marketplaces. A hero image designed for your
              website might need to become a 1080 x 1080 Instagram post, a 1200 x 628 Facebook link preview, a
              300 x 250 display ad, and a 1500 x 500 X/Twitter header — all from the same creative.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              Without a dedicated tool, designers and marketers end up opening the same file dozens of times, adjusting
              canvas sizes, repositioning subjects, and exporting each variant by hand. That workflow does not scale when
              you are launching campaigns across five or ten channels simultaneously.
            </p>
          </section>

          {/* Why it matters */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Marketing Teams Need Bulk Image Resizing</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Creative production is one of the biggest bottlenecks in digital marketing. Agencies and in-house teams
              routinely spend entire afternoons slicing a single set of campaign assets into the correct dimensions for
              each channel. The problem multiplies when you factor in A/B variants, seasonal refreshes, and
              market-specific adaptations.
            </p>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Bulk image resizing eliminates that bottleneck. Instead of touching each output file individually, you
              configure your desired formats once and let the software handle every resize and crop automatically. That
              means fewer errors, faster turnaround, and more time to spend on strategy and creative ideation rather
              than pixel-pushing.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              For e-commerce brands managing hundreds of product SKUs, the impact is even more dramatic. Every product
              image needs a main listing photo, a thumbnail, a comparison-shopping feed image, and social ad variants.
              Automating that pipeline saves days of work every product launch cycle.
            </p>
          </section>

          {/* How ASPCT RATIO solves it */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How ASPCT RATIO Makes Asset Resizing Effortless</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              ASPCT RATIO was built specifically for this workflow. You upload your source images, choose the platforms
              and formats you need, fine-tune each crop if necessary, and export a neatly organized ZIP file — all from
              a single browser tab, with no software to install.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              The tool uses smart cropping to detect the focal point of your image and keep it centered in every output
              dimension. If the automatic crop does not look right, you can drag to adjust individually per format. Once
              you are happy, one click exports everything with clean file names sorted into folders by platform and
              placement.
            </p>
          </section>

          {/* Supported formats */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Supported Platforms and Formats</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              ASPCT RATIO ships with presets for every major advertising and social media platform. That includes
              Instagram feed posts, stories, and reels. TikTok in-feed and spark ads. Facebook feed images, cover
              photos, carousel ads, and link previews. YouTube thumbnails and channel banners. Pinterest standard and
              long pins. LinkedIn single-image ads and company page covers. X/Twitter posts and header images.
            </p>
            <p className="text-gray-600 leading-[1.8] mb-4">
              On the e-commerce side, you will find presets for Amazon product images, Shopify collection banners,
              Google Merchant Center feeds, and general marketplace thumbnails. Display advertising formats cover the
              full IAB standard suite including leaderboard, medium rectangle, skyscraper, and half-page units.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              If your campaign calls for a custom dimension that is not in the preset library, you can add it manually
              and save it for future projects. Every format you select becomes part of your export bundle.
            </p>
          </section>

          {/* Step by step */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works — Step by Step</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              First, upload one or more source images by dragging them into the browser or clicking to browse your file
              system. ASPCT RATIO accepts JPG, PNG, and WebP files. You can upload up to 50 images per session
              depending on your plan.
            </p>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Second, choose the output formats you need. Browse by platform or search by dimension. Select as many as
              you like — Instagram Story, Facebook Feed, YouTube Thumbnail, Amazon Main Image, and so on. Each selected
              format appears as a preview card so you can see exactly how your image will look at that size.
            </p>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Third, review and adjust. The smart crop engine positions your subject automatically, but you can drag to
              reposition any individual crop. You can also add text overlays with per-format copy if you want to
              customize messaging for each channel.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              Finally, hit export. ASPCT RATIO packages every resized image into a single ZIP file with a clean folder
              structure — organized by channel, platform, and placement — with descriptive file names so your team knows
              exactly where each asset belongs.
            </p>
          </section>

          {/* CTA */}
          <section className="text-center py-12 px-6 bg-indigo-50 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Start Resizing Assets in Seconds</h2>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              Join thousands of marketers, designers, and e-commerce teams who save hours every week with ASPCT RATIO.
              Start your free trial today — no credit card required.
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
      <footer className="py-10 px-6 border-t border-gray-100 text-center text-sm text-gray-400">
        <p>&copy; {new Date().getFullYear()} ASPCT RATIO. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <Link href="/privacy" className="hover:text-gray-600 no-underline">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-600 no-underline">Terms</Link>
        </div>
      </footer>
    </div>
  )
}
