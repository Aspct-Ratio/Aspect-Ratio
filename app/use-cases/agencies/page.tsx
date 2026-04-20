import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'ASPCT RATIO for Agencies — Faster Asset Delivery for Every Client',
  description:
    'Agencies use ASPCT RATIO to eliminate hours of manual resizing and deliver campaign-ready assets faster. Upload once, export every format your clients need.',
  alternates: { canonical: 'https://aspctratio.com/use-cases/agencies' },
}

export default function AgenciesPage() {
  return (
    <div className="bg-white text-gray-800 antialiased leading-relaxed">
      <SiteNav />

      <header className="py-20 px-6 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-4">For Agencies</p>
          <h1 className="text-[clamp(30px,5vw,48px)] font-extrabold tracking-[-1.5px] text-gray-900 leading-[1.1] mb-6">
            Deliver Campaign Assets in Minutes, Not Days
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Your creative team should be designing — not spending afternoons manually resizing the same image for 30
            different placements. ASPCT RATIO handles the production grunt work so your team can focus on the work that
            actually moves the needle for clients.
          </p>
        </div>
      </header>

      <main className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-14">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Asset Production Bottleneck</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Every campaign launch follows the same pattern: creative approves a hero image, and then someone on the team
              spends hours slicing it into every format the media plan calls for. Facebook feed, Instagram Story, YouTube
              pre-roll companion, display banners in five sizes, Amazon product images, and whatever the client&apos;s
              retail partners need. Multiply that by A/B variants, market localizations, and seasonal refreshes, and asset
              production becomes a full-time job.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              That is time your team could spend on strategy, creative development, or pitching new business. ASPCT RATIO
              collapses the slicing step from hours to minutes — upload once, select your formats, adjust crops, and export
              a single ZIP with everything named and sorted.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Built for Multi-Client Workflows</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Different clients need different channel mixes. One brand might live on Instagram and TikTok. Another runs
              heavy display and Amazon. ASPCT RATIO lets you select exactly the formats each client needs and export
              tailored packages — no extra effort, no wasted assets.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              The naming convention system lets you stamp each export with the client&apos;s brand name and campaign name,
              so files arrive ready to upload without renaming. Your account team hands the ZIP to the client or media
              buyer and the job is done.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reclaim Billable Hours</h2>
            <p className="text-gray-600 leading-[1.8]">
              Asset resizing is necessary work, but it is not the kind of work clients want to pay premium rates for. By
              automating the most repetitive part of creative production, your team reclaims hours that can go toward
              higher-value deliverables — or simply toward getting more done in less time. Faster turnaround, happier
              clients, and a team that stays energized instead of burned out on pixel-pushing.
            </p>
          </section>

          <section className="text-center py-12 px-6 bg-indigo-50 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Give Your Team Its Afternoons Back</h2>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              Start a free trial and run your next campaign&apos;s asset slicing through ASPCT RATIO. See how much time
              you save on the first export.
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
