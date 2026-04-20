import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'Features — Smart Crop, Text Overlays, Bulk Export & More',
  description:
    'Explore ASPCT RATIO features: smart focal-point cropping, text overlays with full typography controls, bulk multi-format export, organized ZIP downloads, and custom format support.',
  alternates: { canonical: 'https://aspctratio.com/product/features' },
}

export default function FeaturesPage() {
  return (
    <div className="bg-white text-gray-800 antialiased leading-relaxed">
      <SiteNav />

      <header className="py-20 px-6 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-4">Features</p>
          <h1 className="text-[clamp(30px,5vw,48px)] font-extrabold tracking-[-1.5px] text-gray-900 leading-[1.1] mb-6">
            Everything You Need to Slice Assets Fast
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Built for speed without sacrificing control. Every feature exists to save you time on the tedious parts of
            creative production.
          </p>
        </div>
      </header>

      <main className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-14">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Smart Focal-Point Cropping</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              ASPCT RATIO analyzes your image to detect the primary subject and positions it optimally in every output
              format. A portrait photo stays centered in a square crop. A product shot keeps the hero item visible in a
              wide banner. The algorithm handles the math — you just confirm it looks right.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              When the automatic crop needs a nudge, drag to reposition and use the zoom slider to tighten or loosen the
              frame. Each format is independent, so adjusting one does not affect the others.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Text Overlays with Full Typography Controls</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Add headlines, subheaders, eyebrow text, body copy, and CTA buttons directly onto your assets. The text
              editor supports over 40 Google Fonts plus system fonts, with full control over weight (100–900), size,
              color, alignment, letter spacing, line height, opacity, and text shadow.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              You can also add a background box behind your text with customizable color, padding, and corner radius —
              perfect for CTA buttons or ensuring legibility over busy backgrounds. Import your own brand fonts too.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Apply Copy Across Formats</h2>
            <p className="text-gray-600 leading-[1.8]">
              Set up your text layers on one format and apply them to every other format with a single click. The tool
              scales font sizes and repositions layers proportionally, so a headline that looks great on a 1080 x 1350
              feed post still looks intentional on a 300 x 250 display ad. You can filter by orientation or channel to
              apply only to specific subsets — verticals only, social only, or any combination.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bulk Multi-Image Processing</h2>
            <p className="text-gray-600 leading-[1.8]">
              Upload multiple source images and apply the same set of formats to all of them in a single session. Switch
              between images to adjust crops individually, and export everything together. This is especially powerful for
              product photography, seasonal campaigns, or content batching where you are working with a set of related
              images that all need the same output sizes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Organized ZIP Export with Smart Naming</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Every export is packaged into a single ZIP file with a clean folder structure organized by channel, platform,
              and placement. File names are descriptive and consistent — no more renaming files after export or guessing
              which version is which.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              Set your brand name and campaign name, and the tool builds filenames automatically. Your team or clients
              receive a ready-to-upload package that maps directly to the platforms they are publishing on.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">60+ Built-In Format Presets</h2>
            <p className="text-gray-600 leading-[1.8]">
              The format catalogue covers every major platform: Instagram, TikTok, YouTube, Facebook, Pinterest, LinkedIn,
              X/Twitter, Amazon, Shopify, Google Merchant Center, IAB display ads, and more. Dimensions stay current so
              you do not have to look up specs every time a platform updates its layout. Need a size that is not in the
              library? Add custom dimensions and they become part of your export bundle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Software to Install</h2>
            <p className="text-gray-600 leading-[1.8]">
              ASPCT RATIO runs entirely in your browser. There is nothing to download, no plugins to manage, and no
              system requirements beyond a modern web browser. Your files are processed securely and are not stored after
              your session ends.
            </p>
          </section>

          <section className="text-center py-12 px-6 bg-indigo-50 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to Save Hours on Asset Production?</h2>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              Start your free trial and see every feature in action. No credit card required.
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

      <SiteFooter />
    </div>
  )
}
