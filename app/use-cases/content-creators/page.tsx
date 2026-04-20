import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'ASPCT RATIO for Content Creators — Repurpose Content Everywhere',
  description:
    'Content creators and influencers use ASPCT RATIO to resize one photo for every platform they post on — Instagram, TikTok, YouTube, Pinterest, X, and more — in a single session.',
  alternates: { canonical: 'https://aspctratio.com/use-cases/content-creators' },
}

export default function ContentCreatorsPage() {
  return (
    <div className="bg-white text-gray-800 antialiased leading-relaxed">
      <SiteNav />

      <header className="py-20 px-6 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-4">For Content Creators</p>
          <h1 className="text-[clamp(30px,5vw,48px)] font-extrabold tracking-[-1.5px] text-gray-900 leading-[1.1] mb-6">
            One Photo. Every Platform. Done in Minutes.
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            You shoot great content — but resizing it for every platform eats up your afternoon. ASPCT RATIO lets you
            crop and resize a single image for Instagram, TikTok, YouTube, Pinterest, and X all at once.
          </p>
        </div>
      </header>

      <main className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-14">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Cross-Posting Problem</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              You take one great photo and now you need it everywhere — Instagram feed at 1080 x 1350, Story at
              1080 x 1920, YouTube thumbnail at 1280 x 720, Pinterest pin at 1000 x 1500, X post at 1600 x 900. That is
              easily eight or more crops from a single image, and each one needs different framing. Most creators end up
              doing this one at a time in Canva or Photoshop, which works but takes forever.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              ASPCT RATIO lets you upload once, select every platform size you need, adjust each crop, and export
              everything in a single ZIP — named and sorted so you know exactly which file goes where.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Text That Adapts to Every Size</h2>
            <p className="text-gray-600 leading-[1.8]">
              Running a product collab, drop announcement, or promo? Add headlines, CTAs, and promo codes directly in the
              editor with full typography controls. Set up your copy on one size and apply it to every other format with
              one click — the tool scales and repositions text proportionally so it looks intentional on every crop.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Batch Your Content Days</h2>
            <p className="text-gray-600 leading-[1.8]">
              Content batching only works if your post-production keeps pace. Upload your entire batch of photos, apply
              the same platform formats to all of them, adjust crops where needed, and export everything in one session.
              Your entire week of content — resized, named, and sorted — ready to schedule.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Built for How Creators Actually Work</h2>
            <p className="text-gray-600 leading-[1.8]">
              Whether you are a lifestyle influencer, food creator, UGC creator delivering assets to brand partners, or a
              podcaster resizing episode art — ASPCT RATIO removes the manual grunt work. No design experience needed. If
              you can drag and drop a photo, you can use it.
            </p>
          </section>

          <section className="text-center py-12 px-6 bg-indigo-50 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Stop Resizing the Same Photo Eight Times</h2>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              Upload your content, pick your platforms, and export everything — cropped, named, and ready to post.
              Free to start, no credit card required.
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
