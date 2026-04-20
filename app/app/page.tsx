import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import SlicerApp from '@/components/slicer/SlicerApp'
import AppHeader from '@/components/slicer/AppHeader'
import type { UserPlan } from '@/components/slicer/Step1Upload'

const VALID_PLANS: UserPlan[] = ['free', 'creator', 'freelancer', 'studio', 'agency', 'enterprise']

export default async function AppPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check for an active subscription in the subscriptions table
  const admin = createAdminClient()
  const { data: subscription } = await admin
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', user!.id)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // No active subscription — show paywall
  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader step={1} />

        <main className="max-w-[1100px] mx-auto px-6 py-16">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-2">Subscription required</p>
            <h1 className="text-[clamp(24px,3.5vw,36px)] font-extrabold tracking-tight text-gray-900 mb-3">
              Start your free trial to get started
            </h1>
            <p className="text-base text-gray-500 max-w-md leading-relaxed">
              Start with a 7-day free trial, then pick the plan that fits your workflow.
            </p>
          </div>

          {/* Plan cards — matches landing page pricing section */}
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>

            {/* Freelancer */}
            <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col">
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-900 mb-1">Freelancer</p>
                <div className="flex items-end gap-1.5 mb-4">
                  <span className="text-[40px] font-extrabold tracking-[-2px] text-gray-900">$59</span>
                  <span className="text-sm text-gray-400 mb-2">/mo</span>
                </div>
                <p className="text-sm text-gray-500">For independent creatives running campaigns solo.</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  '750 exports / month',
                  '50 images per session',
                  'All platform formats',
                  'JPG, PNG, WebP export',
                  'Custom naming conventions',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-indigo-500 mt-0.5 flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <a
                href="/checkout/confirm?plan=freelancer"
                className="w-full h-10 flex items-center justify-center text-sm font-semibold border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors no-underline"
              >
                Start free trial
              </a>
            </div>

            {/* Studio — Most Popular */}
            <div className="bg-indigo-600 border border-indigo-600 rounded-2xl p-7 shadow-[0_8px_30px_rgba(79,70,229,0.25)] flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-gray-900 text-[11px] font-bold tracking-[0.5px] uppercase px-3 py-1 rounded-full whitespace-nowrap">
                Most Popular
              </div>
              <div className="mb-6">
                <p className="text-sm font-bold text-white mb-1">Studio</p>
                <div className="flex items-end gap-1.5 mb-4">
                  <span className="text-[40px] font-extrabold tracking-[-2px] text-white">$199</span>
                  <span className="text-sm text-indigo-300 mb-2">/mo</span>
                </div>
                <p className="text-sm text-indigo-200">For small studios and in-house teams with regular campaign output.</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  '3,000 exports / month',
                  '150 images per session',
                  'All export types — JPG, PNG, WebP, PDF, TIFF',
                  'Custom naming & folder structure',
                  '5 team seats',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-indigo-100">
                    <span className="text-indigo-300 mt-0.5 flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <a
                href="/checkout/confirm?plan=studio"
                className="w-full h-10 flex items-center justify-center text-sm font-semibold bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors no-underline"
              >
                Start free trial
              </a>
            </div>

            {/* Agency */}
            <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col">
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-900 mb-1">Agency</p>
                <div className="flex items-end gap-1.5 mb-4">
                  <span className="text-[40px] font-extrabold tracking-[-2px] text-gray-900">$599</span>
                  <span className="text-sm text-gray-400 mb-2">/mo</span>
                </div>
                <p className="text-sm text-gray-500">For agencies running production at volume across multiple clients.</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  'Unlimited exports',
                  'Unlimited images per session',
                  'All export types',
                  'API access',
                  '20 team seats',
                  'Priority support',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-indigo-500 mt-0.5 flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <a
                href="/checkout/confirm?plan=agency"
                className="w-full h-10 flex items-center justify-center text-sm font-semibold border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors no-underline"
              >
                Start free trial
              </a>
            </div>

            {/* Enterprise */}
            <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col">
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-900 mb-1">Enterprise</p>
                <div className="mb-4 pt-2">
                  <span className="text-[28px] font-extrabold tracking-[-1px] text-gray-900">Custom pricing</span>
                </div>
                <p className="text-sm text-gray-500">For enterprise teams with bespoke production requirements.</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  'Custom project volumes',
                  'Unlimited file sizes',
                  'White-labeling',
                  'SLA & dedicated onboarding',
                  'Annual contracts',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-indigo-500 mt-0.5 flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:hello@aspctratio.com"
                className="w-full h-10 flex items-center justify-center text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors no-underline"
              >
                Talk to us →
              </a>
            </div>

          </div>

          {/* Footer link */}
          <div className="text-center mt-8">
            <a href="/#pricing" className="text-sm text-gray-400 hover:text-gray-600 transition no-underline">
              Compare all plans
            </a>
          </div>
        </main>
      </div>
    )
  }

  // Active subscription — determine plan and load the slicer
  const rawPlan = subscription.plan as string
  const userPlan: UserPlan = VALID_PLANS.includes(rawPlan as UserPlan)
    ? (rawPlan as UserPlan)
    : 'free'

  return <SlicerApp userPlan={userPlan} />
}
