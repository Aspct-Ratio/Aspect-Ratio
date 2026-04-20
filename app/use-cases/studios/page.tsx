import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'ASPCT RATIO for Studios — Deliver Client Assets at Scale',
  description:
    'Creative and production studios use ASPCT RATIO to batch-process client assets across every format — faster delivery, cleaner handoffs, and more time for creative work.',
  alternates: { canonical: 'https://aspctratio.com/use-cases/studios' },
}

export default function StudiosPage() {
  return (
    <div className="bg-white text-gray-800 antialiased leading-relaxed">
      <SiteNav />

      <header className="py-20 px-6 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-4">For Studios</p>
          <h1 className="text-[clamp(30px,5vw,48px)] font-extrabold tracking-[-1.5px] text-gray-900 leading-[1.1] mb-6">
            Deliver More Assets Without Growing Your Team
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Production studios juggle multiple clients, tight deadlines, and growing format requirements. ASPCT RATIO
            automates the resizing and packaging step so your team can focus on the creative work clients are paying for.
          </p>
        </div>
      </header>

      <main className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-14">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Production Scaling Problem</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Studios thrive when utilization is high — every artist billing hours on creative work that moves projects
              forward. But as client channel lists grow, so does the volume of mechanical resizing. A shoot that produces
              20 hero images might need 400 individual exports once you factor in every platform, placement, and variant.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              That production overhead either eats into margins or forces you to hire junior staff just to push pixels.
              ASPCT RATIO eliminates that bottleneck — your artists finish the hero creative, and the resizing step
              collapses from a day-long task into a short session.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Batch Processing for High-Volume Shoots</h2>
            <p className="text-gray-600 leading-[1.8]">
              Upload an entire shoot&apos;s worth of selects, apply the client&apos;s required format set to all of them,
              and export everything in one go. The smart crop engine handles initial positioning automatically, and you
              can fine-tune individual crops where needed. Exports come packaged in a ZIP with folder structure and naming
              conventions that map directly to the client&apos;s delivery spec.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Clean Client Handoffs</h2>
            <p className="text-gray-600 leading-[1.8]">
              No more emailing individual files or managing shared drives full of ambiguously named assets. ASPCT RATIO
              exports are organized by channel and platform with descriptive file names. Your client receives a single
              package that their media team or marketing department can use immediately — no renaming, no guessing which
              file goes where.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Protect Your Margins</h2>
            <p className="text-gray-600 leading-[1.8]">
              Asset resizing is often bundled into a flat project fee, which means every hour spent on it comes directly
              out of your margin. By automating the most repetitive step in the production pipeline, your team delivers
              the same (or greater) output volume while keeping more of each project&apos;s revenue as profit.
            </p>
          </section>

          <section className="text-center py-12 px-6 bg-indigo-50 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Automate the Grunt Work</h2>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              Start a free trial and run your next client delivery through ASPCT RATIO. See the difference on your first
              export.
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
