import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'Social Media Image Resizer — Perfect Sizes for Every Platform',
  description:
    'Resize images for Instagram, TikTok, Facebook, YouTube, Pinterest, LinkedIn, and X in one click. ASPCT RATIO is the fastest social media image resizer for teams and creators.',
  alternates: { canonical: 'https://aspctratio.com/tools/social-media-image-resizer' },
}

const PLATFORMS = [
  { name: 'Instagram Feed Post', dimensions: '1080 x 1080 px', note: 'Square format, highest engagement' },
  { name: 'Instagram Story / Reel', dimensions: '1080 x 1920 px', note: '9:16 vertical, full-screen' },
  { name: 'TikTok In-Feed Video Cover', dimensions: '1080 x 1920 px', note: '9:16, matches story format' },
  { name: 'Facebook Feed Image', dimensions: '1200 x 630 px', note: 'Landscape, optimized for link shares' },
  { name: 'Facebook Cover Photo', dimensions: '1640 x 624 px', note: 'Wide banner, displays differently on mobile' },
  { name: 'YouTube Thumbnail', dimensions: '1280 x 720 px', note: '16:9, critical for click-through rate' },
  { name: 'YouTube Channel Banner', dimensions: '2560 x 1440 px', note: 'Safe area varies by device' },
  { name: 'Pinterest Standard Pin', dimensions: '1000 x 1500 px', note: '2:3 ratio, performs best in feed' },
  { name: 'LinkedIn Single Image Post', dimensions: '1200 x 1200 px', note: 'Square format for maximum real estate' },
  { name: 'LinkedIn Company Cover', dimensions: '1128 x 191 px', note: 'Ultra-wide, text must be centered' },
  { name: 'X / Twitter Post', dimensions: '1600 x 900 px', note: '16:9, displays in-stream' },
  { name: 'X / Twitter Header', dimensions: '1500 x 500 px', note: '3:1 ratio, profile banner' },
]

export default function SocialMediaImageResizerPage() {
  return (
    <div className="bg-white text-gray-800 antialiased leading-relaxed">
      <SiteNav />

      {/* Hero */}
      <header className="py-20 px-6 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-4">Social Media Image Resizer</p>
          <h1 className="text-[clamp(30px,5vw,48px)] font-extrabold tracking-[-1.5px] text-gray-900 leading-[1.1] mb-6">
            Resize Images for Every Social Platform — Instantly
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Every social network demands different image dimensions. ASPCT RATIO takes a single image and produces
            perfectly sized versions for Instagram, TikTok, Facebook, YouTube, Pinterest, LinkedIn, and X — all at once.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-14">
          {/* The pain */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Problem with Resizing for Social Media</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              If you manage social media for a brand, agency, or your own business, you already know the frustration.
              You finish a beautiful creative, and then you realize it needs to exist in six different sizes before you
              can publish it anywhere. Instagram wants a square. TikTok wants a tall vertical. Facebook wants a
              landscape. YouTube wants 16:9. Pinterest wants 2:3. LinkedIn wants yet another dimension.
            </p>
            <p className="text-gray-600 leading-[1.8] mb-4">
              The typical workflow involves opening your design tool, duplicating the file, changing the canvas size,
              repositioning elements, exporting, and repeating. For a single image across seven platforms, that is
              easily 20 to 30 minutes of tedious manual work. Multiply that by a week of daily posts and you have lost
              an entire day to resizing alone.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              Posting an image at the wrong size is not just an aesthetic issue — platforms will crop it unpredictably,
              cutting off text, products, or faces. Properly sized images look more professional, perform better in
              algorithms, and generate higher engagement rates.
            </p>
          </section>

          {/* Platform dimensions grid */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Dimensions at a Glance</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {PLATFORMS.map((p) => (
                <div
                  key={p.name}
                  className="border border-gray-100 rounded-xl p-5 hover:border-indigo-200 transition-colors"
                >
                  <p className="font-semibold text-gray-900 text-sm mb-1">{p.name}</p>
                  <p className="text-indigo-600 font-bold text-lg tracking-tight">{p.dimensions}</p>
                  <p className="text-gray-400 text-sm mt-1">{p.note}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How ASPCT RATIO handles it */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How ASPCT RATIO Handles All of Them at Once</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              With ASPCT RATIO, you upload your source image once. Then you select every platform and placement you
              need from the format panel. The tool instantly generates a preview of each output so you can see exactly
              how the image will appear at that size — before you export anything.
            </p>
            <p className="text-gray-600 leading-[1.8] mb-4">
              The smart crop engine analyzes your image and positions the most important content within each frame
              automatically. If a particular crop does not look right, you can drag to reposition it. That means your
              Instagram square keeps the product centered while your YouTube thumbnail shifts the composition to leave
              room for text — all from the same source file with no duplicating or manual resizing.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              When you are satisfied with every preview, a single export generates all your resized images in a neatly
              organized ZIP file. Each image is named with the platform and placement type, and sorted into folders so
              your social media manager or content scheduler knows exactly which file goes where. The entire process
              takes seconds instead of half an hour.
            </p>
          </section>

          {/* Who it is for */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Built for Social Media Managers, Creators, and Agencies</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Whether you are a solo creator posting daily or an agency managing dozens of client accounts, ASPCT RATIO
              scales with your workload. Solo creators save time by eliminating the most tedious part of their content
              pipeline. Agencies save money by reducing the hours designers spend on mechanical resizing tasks.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              The tool runs entirely in your browser — there is nothing to download or install, and your images are
              processed locally so sensitive brand assets stay secure. Plans are available for individuals, small teams,
              and large organizations, all with a free trial so you can test the workflow with your own content before
              committing.
            </p>
          </section>

          {/* CTA */}
          <section className="text-center py-12 px-6 bg-indigo-50 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Resize for Every Platform in One Click</h2>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              Stop wasting time resizing the same image over and over. Try ASPCT RATIO free and see how fast your social
              media workflow can be.
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
