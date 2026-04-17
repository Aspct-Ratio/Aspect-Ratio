import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'Smart Image Cropping Tool — Auto-Crop for Every Platform',
  description:
    'Automatically crop images for every social media, ad, and e-commerce platform. ASPCT RATIO detects focal points and adjusts crops per format — no manual work required.',
  alternates: { canonical: 'https://aspctratio.com/tools/image-cropping' },
}

export default function ImageCroppingPage() {
  return (
    <div className="bg-white text-gray-800 antialiased leading-relaxed">
      <SiteNav />

      {/* Hero */}
      <header className="py-20 px-6 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-4">Image Cropping Tool</p>
          <h1 className="text-[clamp(30px,5vw,48px)] font-extrabold tracking-[-1.5px] text-gray-900 leading-[1.1] mb-6">
            Smart Image Cropping That Knows Where to Cut
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Cropping images for multiple platforms is tedious when you do it by hand. ASPCT RATIO auto-detects your
            subject and delivers pixel-perfect crops for every format — in seconds, not hours.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-14">
          {/* Smart vs manual */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Smart Cropping vs. Manual Cropping</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Manual cropping means opening each image in an editor, selecting the area you want to keep, resizing the
              canvas, and saving. Repeat that for every platform and every creative in your campaign and you are looking
              at hours of repetitive work. Worse, manual cropping is error-prone — it is surprisingly easy to
              accidentally clip a product, cut off a headline, or leave awkward negative space.
            </p>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Smart cropping automates the decision of where to cut. The software analyzes your image to identify the
              primary subject — a person, a product, a logo, or any other focal element — and positions that subject
              within each output dimension so it stays visible and well-composed.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              The result is a batch of cropped images that look intentional rather than mechanically trimmed. You get the
              speed of automation with a level of compositional awareness that previously required a human eye on every
              single variant.
            </p>
          </section>

          {/* How auto-detect works */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How ASPCT RATIO Detects Focal Points</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              When you upload an image, ASPCT RATIO analyzes contrast, color distribution, and edge density to estimate
              the most visually important region. That region becomes the anchor point for every crop. Whether you are
              going from a wide landscape to a tall portrait or from a square to a narrow banner, the algorithm keeps
              your focal content centered and visible.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              For product photography, this means the product stays front and center. For lifestyle imagery, faces and
              key visual elements remain in frame. For graphic designs with text, the text block is preserved as much as
              the aspect ratio allows. The detection runs entirely in your browser using the Canvas API, so your images
              never leave your machine until you explicitly export.
            </p>
          </section>

          {/* Per-format adjustment */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Per-Format Crop Adjustment</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Automatic cropping gets you 90 percent of the way there, but sometimes a specific format needs a slight
              nudge. Maybe your Instagram Story version looks better with the subject shifted slightly left, or your
              YouTube thumbnail needs the product moved up to leave room for a title. ASPCT RATIO lets you drag to
              reposition the crop on any individual format without affecting the others.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              This hybrid approach — automatic smart crop as a starting point, with manual override when you need it —
              gives you the best balance between speed and precision. Most formats will look great without any
              adjustment. The few that need tweaking take only a second or two instead of a full round-trip through
              Photoshop.
            </p>
          </section>

          {/* Batch workflow */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Batch Cropping for Entire Campaigns</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              ASPCT RATIO is not limited to one image at a time. You can upload an entire set of campaign creatives and
              apply the same format selection to all of them. Each image gets its own smart crop analysis, so a hero
              shot and a flat-lay product image are both handled intelligently even though they have completely different
              compositions.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              After reviewing the crops across your batch, you export everything as a single ZIP. The folder structure
              groups assets by platform and placement, with descriptive file names that include your brand and campaign
              identifiers. Hand that ZIP to your media buyer or upload it directly to your ad manager — every file is
              sized, named, and sorted.
            </p>
          </section>

          {/* Export workflow */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Export Workflow and File Organization</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              The export step is where ASPCT RATIO really differentiates itself from basic image editors. Instead of
              producing a flat list of unnamed files, it builds a clean folder hierarchy. At the top level, assets are
              grouped by channel — social, display, e-commerce. Within each channel, subfolders organize images by
              platform and then by placement type.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              File names follow a consistent pattern that includes the brand name, campaign identifier, platform, and
              dimensions. This means your team never has to guess which file goes where, and your project management
              tools can index assets predictably. You can export as JPEG, PNG, WebP, TIFF, or PDF depending on the
              destination requirements.
            </p>
          </section>

          {/* CTA */}
          <section className="text-center py-12 px-6 bg-indigo-50 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Crop Smarter, Not Harder</h2>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              Let ASPCT RATIO handle the tedious cropping work so your team can focus on creative that converts. Start
              your free trial — no credit card required.
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
