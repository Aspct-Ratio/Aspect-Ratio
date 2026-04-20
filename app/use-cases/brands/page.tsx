import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'ASPCT RATIO for Brands — Empower Your Team to Move Faster',
  description:
    'In-house brand teams use ASPCT RATIO to handle day-to-day asset production faster — resizing, cropping, and exporting campaign images for every channel without slowing down.',
  alternates: { canonical: 'https://aspctratio.com/use-cases/brands' },
}

export default function BrandsPage() {
  return (
    <div className="bg-white text-gray-800 antialiased leading-relaxed">
      <SiteNav />

      <header className="py-20 px-6 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-4">For Brands</p>
          <h1 className="text-[clamp(30px,5vw,48px)] font-extrabold tracking-[-1.5px] text-gray-900 leading-[1.1] mb-6">
            Move Faster Without Adding Headcount
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Your team already has the creative vision. ASPCT RATIO handles the repetitive production work — resizing,
            cropping, and packaging — so your team can publish faster and stay focused on what matters.
          </p>
        </div>
      </header>

      <main className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-14">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Speed Up Day-to-Day Asset Production</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Every product launch, seasonal campaign, and social post requires images in multiple sizes. Your in-house
              team knows the drill — open Photoshop, resize, export, repeat. For a single hero image across all your
              channels, that can mean 10 to 20 individual exports, each one requiring manual cropping and renaming.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              ASPCT RATIO compresses that entire workflow into one session. Upload your approved creative, select every
              format you need, fine-tune each crop, and export a single ZIP with everything ready to go. What used to take
              an afternoon now takes minutes — and your team can move on to the next project.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Keep Your Creative Partners Focused on Strategy</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Whether you work with an agency, a freelance designer, or a production studio, their time is most valuable
              when they are developing creative concepts, refining brand direction, and building campaigns — not manually
              resizing approved assets into 30 different dimensions.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              ASPCT RATIO lets your internal team handle routine asset slicing independently, freeing up your creative
              partners to focus on the strategic and conceptual work that drives real results. Everyone stays in their lane,
              and nothing bottlenecks on production.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Consistency Across Every Channel</h2>
            <p className="text-gray-600 leading-[1.8]">
              When multiple team members are manually cropping the same image for different platforms, inconsistencies
              creep in — slightly different framing, misaligned subjects, varying file naming conventions. ASPCT RATIO
              ensures every output starts from the same source with smart focal-point cropping, and exports with a
              consistent naming structure. Your brand looks polished and intentional on every channel, every time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Scale Your Content Output</h2>
            <p className="text-gray-600 leading-[1.8]">
              As your brand grows into new channels and markets, asset volume grows with it. ASPCT RATIO scales with
              you — upload multiple images per session, apply the same format set to all of them, and batch-export
              everything. Whether you are launching on a new platform or running campaigns across multiple regions, the
              production workload stays manageable without adding headcount.
            </p>
          </section>

          <section className="text-center py-12 px-6 bg-indigo-50 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Empower Your Team to Ship Faster</h2>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              Start a free trial and see how much faster your team can go from approved creative to published assets.
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
