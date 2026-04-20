import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'How It Works — Upload, Choose Formats, Adjust, Export',
  description:
    'See how ASPCT RATIO works in four simple steps. Upload your images, select the formats you need, adjust each crop, add copy, and export a perfectly organized ZIP file.',
  alternates: { canonical: 'https://aspctratio.com/product/how-it-works' },
}

export default function HowItWorksPage() {
  return (
    <div className="bg-white text-gray-800 antialiased leading-relaxed">
      <SiteNav />

      <header className="py-20 px-6 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-4">How It Works</p>
          <h1 className="text-[clamp(30px,5vw,48px)] font-extrabold tracking-[-1.5px] text-gray-900 leading-[1.1] mb-6">
            From Upload to Export in Minutes
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            No design skills required. ASPCT RATIO handles the technical work — you focus on making sure everything looks right.
          </p>
        </div>
      </header>

      <main className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-14">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 1 — Upload Your Images</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Drag and drop your source images into the browser or click to browse your file system. ASPCT RATIO accepts
              JPG, PNG, and WebP files. You can upload multiple images per session and process them all at once — no need
              to repeat the workflow for each file.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              There is no software to install. Everything runs in your browser, and your files are processed securely
              without being stored after your session ends.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 2 — Choose Your Formats</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Browse the format catalogue organized by platform and channel — social media, e-commerce, paid media, retail,
              and more. Select as many formats as you need. Instagram feed post, YouTube thumbnail, Amazon product image,
              Google display ad — pick them all and they show up as preview cards instantly.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              If your project calls for a custom dimension that is not in the library, add it manually with any width and
              height. Custom formats are included in your export alongside the presets.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 3 — Adjust Your Crops</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              The smart crop engine automatically detects the focal point of your image and positions it in the center of
              each output format. For most images, this is all you need — the default crop looks great out of the box.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              When you want more control, drag to reposition any individual crop. Use the zoom slider to tighten or
              loosen the frame. Each format adjusts independently, so your landscape banner can show more background while
              your portrait story crop stays tight on the subject.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 4 — Add Copy</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Need text on your assets? Add headlines, subheaders, CTAs, promo codes, or body copy directly in the editor.
              You get full control over font family, size, weight, color, alignment, shadow, and background box — everything
              you need to make text look intentional rather than slapped on.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              Once you set up the copy on one format, apply it to every other format with one click. The tool scales and
              repositions text proportionally so it fits naturally on each crop size.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 5 — Export Everything</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Hit export and ASPCT RATIO packages every resized, cropped, and captioned image into a single ZIP file. The
              folder structure is organized by channel, platform, and placement with descriptive file names — so your team
              knows exactly where each asset belongs without opening every file.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              You can also configure naming conventions with your brand name and campaign name. The tool builds filenames
              automatically using your inputs, keeping everything consistent across the entire export.
            </p>
          </section>

          <section className="text-center py-12 px-6 bg-indigo-50 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">See It in Action</h2>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              Try the interactive demo on our homepage or start your free trial to run a full export.
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
