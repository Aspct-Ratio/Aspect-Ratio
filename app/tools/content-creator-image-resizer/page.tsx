import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'Content Creator Image Resizer — Repurpose One Photo Everywhere',
  description:
    'Resize and crop your photos for every platform in one session. ASPCT RATIO helps content creators and influencers repurpose a single image for Instagram, TikTok, YouTube, Pinterest, X, and more — instantly.',
  keywords: [
    'content creator image resizer',
    'influencer image tool',
    'resize images for Instagram',
    'resize images for TikTok',
    'YouTube thumbnail resizer',
    'Pinterest pin resizer',
    'repurpose content for social media',
    'cross-post image resizer',
    'creator tools',
    'social media content repurposing',
  ],
  alternates: { canonical: 'https://aspctratio.com/tools/content-creator-image-resizer' },
}

export default function ContentCreatorResizerPage() {
  return (
    <div className="bg-white text-gray-800 antialiased leading-relaxed">
      <SiteNav />

      {/* Hero */}
      <header className="py-20 px-6 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-4">For Content Creators</p>
          <h1 className="text-[clamp(30px,5vw,48px)] font-extrabold tracking-[-1.5px] text-gray-900 leading-[1.1] mb-6">
            One Photo. Every Platform. Done in Minutes.
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            You shoot great content — but resizing it for Instagram, TikTok, YouTube, Pinterest, and X eats up your
            entire afternoon. ASPCT RATIO lets you crop and resize a single image for every platform you post on, all at once.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-14">

          {/* The real problem */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Cross-Posting Problem Every Creator Knows</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              You take one killer photo — maybe it is a flat lay, an outfit shot, a recipe, or a product you are
              partnering with — and now you need it everywhere. Instagram feed post at 1080 x 1350. Instagram Story at
              1080 x 1920. A YouTube thumbnail at 1280 x 720. A Pinterest pin at 1000 x 1500. An X post at 1600 x 900.
              Maybe a LinkedIn banner too.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              That is easily eight or more crops from a single image, and each one needs different framing. Your subject
              that looks perfect in portrait gets awkwardly clipped in landscape. The text overlay you added for Stories
              gets cut off in a square crop. Most creators end up opening Canva or Photoshop eight separate times, nudging
              the frame each time, and exporting one file at a time. It works, but it is painfully slow — especially when
              you are doing this for every single post.
            </p>
          </section>

          {/* How ASPCT RATIO helps */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How ASPCT RATIO Fits Into Your Creator Workflow</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Instead of resizing each crop individually, you upload your image once and select every platform size you
              need. ASPCT RATIO uses smart cropping to keep your subject centered in each frame automatically. If a
              particular crop needs tweaking — maybe you want more headroom in the YouTube thumbnail or tighter framing on
              the Pinterest pin — just drag to reposition. Every format updates independently.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              When you are done adjusting, hit export. You get a single ZIP file with every version named and organized by
              platform. No more guessing which file is the Story version and which one is the feed post. Upload to each
              platform and you are done — what used to take 30 minutes now takes about two.
            </p>
          </section>

          {/* Text overlays for creators */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Copy That Adapts to Every Size</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Running a product launch, collab announcement, or promo? Add text overlays directly in ASPCT RATIO — headlines,
              CTAs, promo codes, whatever your post needs. The text editor gives you full control over font, size, color,
              shadow, and positioning, and you can customize copy per format so your Story version says something different
              than your feed post.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              Once you have the copy set on one size, apply it to every other format with one click. The tool scales and
              repositions text proportionally so it looks intentional on every crop — not like an afterthought.
            </p>
          </section>

          {/* Platform coverage */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Every Platform You Post On, Covered</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              ASPCT RATIO ships with built-in presets for the platforms creators actually use: Instagram (feed, Story, Reel
              cover, profile), TikTok (in-feed, profile), YouTube (thumbnail, channel banner, community post), Pinterest
              (standard pin, long pin, board cover), X/Twitter (post, header), LinkedIn (post, banner, article cover), and
              Facebook (feed, cover photo, event banner).
            </p>
            <p className="text-gray-600 leading-[1.8]">
              Dimensions stay current so you do not have to Google the latest specs every time a platform updates its
              layout. And if you need a custom size — maybe for your newsletter header, media kit, or a brand
              partner&apos;s specific requirements — you can add any dimension manually.
            </p>
          </section>

          {/* Batch for multiple images */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Batch Content Days Without the Bottleneck</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Content batching only works if your post-production keeps pace with your shooting. If you batch-shoot 10
              photos on Sunday but it takes all week to resize and export them for every platform, the time you saved
              shooting gets eaten up in editing.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              ASPCT RATIO lets you upload multiple images per session and apply the same set of formats to all of them.
              Shoot your content, upload the batch, select your platforms, adjust crops where needed, and export everything
              in one go. Your entire week of content — resized, named, and sorted — in a single session.
            </p>
          </section>

          {/* Who this is for */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Built for Creators Who Post Everywhere</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Whether you are a lifestyle influencer repurposing outfit photos across five apps, a food creator who needs
              recipe shots in every aspect ratio, a UGC creator delivering assets to brand partners in specific
              dimensions, or a podcaster who needs episode art resized for every distribution channel — ASPCT RATIO
              removes the manual grunt work so you can focus on what you are actually good at: creating.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              No design experience needed. If you can drag and drop a photo, you can use it. The smart crop handles the
              technical framing — you just make sure it looks the way you want.
            </p>
          </section>

          {/* CTA */}
          <section className="text-center py-12 px-6 bg-indigo-50 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Stop Resizing the Same Photo Eight Times</h2>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              Upload your content, pick your platforms, and export everything — cropped, named, and ready to post — in
              one session. Free to start, no credit card required.
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
