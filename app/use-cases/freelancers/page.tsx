import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'ASPCT RATIO for Freelancers — Deliver Client Assets Faster',
  description:
    'Freelance designers and marketers use ASPCT RATIO to resize and export client assets in minutes instead of hours. More deliverables, less busywork, better margins.',
  alternates: { canonical: 'https://aspctratio.com/use-cases/freelancers' },
}

export default function FreelancersPage() {
  return (
    <div className="bg-white text-gray-800 antialiased leading-relaxed">
      <SiteNav />

      <header className="py-20 px-6 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-4">For Freelancers</p>
          <h1 className="text-[clamp(30px,5vw,48px)] font-extrabold tracking-[-1.5px] text-gray-900 leading-[1.1] mb-6">
            Take On More Clients Without Burning Out
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            When you are a team of one, every hour matters. ASPCT RATIO handles the tedious resizing and exporting so you
            can spend your time on the creative work that wins clients — and the business development that grows your pipeline.
          </p>
        </div>
      </header>

      <main className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-14">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Time Is Your Revenue</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              As a freelancer, you do not have a production team to hand off resizing work to. Every asset variant you
              create comes out of the same hours you use for design, client communication, and prospecting. When a client
              needs their campaign hero image in 15 different sizes, that is an entire afternoon gone — and you are not
              getting paid a premium for the mechanical work.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              ASPCT RATIO turns that afternoon into a 10-minute task. Upload the approved creative, select the formats,
              adjust crops where needed, and export. You get back hours that can go toward billable creative work or simply
              toward having a life outside of your laptop.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Look Like a Bigger Operation</h2>
            <p className="text-gray-600 leading-[1.8]">
              When you deliver a perfectly organized ZIP file with every format named, sorted by channel, and ready to
              upload — clients notice. That level of polish is what they expect from a full-service agency, and it sets
              you apart from freelancers who send a folder of loosely named files. ASPCT RATIO makes your output look
              like it came from a production team, even when it is just you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Handle Multi-Channel Clients</h2>
            <p className="text-gray-600 leading-[1.8]">
              The clients who pay the best rates tend to need assets across the most channels. Instead of turning down
              work because the format list is too long, you can take it on confidently. Select every size the client needs,
              let the smart crop handle initial positioning, and fine-tune the ones that matter. More formats per client
              means more value delivered without proportionally more effort.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Overhead, No Learning Curve</h2>
            <p className="text-gray-600 leading-[1.8]">
              ASPCT RATIO runs in your browser — no software to install, no subscriptions to manage alongside your Adobe
              suite, no complex setup. If you can drag and drop a file, you can use it. The interface is designed to be
              fast and obvious, so you are productive on your first session.
            </p>
          </section>

          <section className="text-center py-12 px-6 bg-indigo-50 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Get Your Hours Back</h2>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              Start a free trial and see how fast you can deliver a multi-format asset package to your next client.
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
