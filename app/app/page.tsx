import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import SlicerApp from '@/components/slicer/SlicerApp'
import AppHeader from '@/components/slicer/AppHeader'
import Link from 'next/link'
import type { UserPlan } from '@/components/slicer/Step1Upload'

const VALID_PLANS: UserPlan[] = ['freelancer', 'studio', 'agency', 'enterprise']

const PLANS = [
  {
    key: 'freelancer',
    label: 'Freelancer',
    price: '$59',
    description: '1 user · 50 files per project',
  },
  {
    key: 'studio',
    label: 'Studio',
    price: '$199',
    description: '5 team seats · 150 files per project',
  },
  {
    key: 'agency',
    label: 'Agency',
    price: '$599',
    description: '20 team seats · unlimited',
  },
]

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

        <main className="max-w-2xl mx-auto px-6 py-20 flex flex-col items-center text-center">
          {/* Lock icon */}
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Start your free trial to get started
          </h1>
          <p className="text-gray-500 text-base mb-10 max-w-md">
            Start with a 7-day free trial, then pick the plan that fits your workflow.
          </p>

          {/* Plan cards */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PLANS.map((plan) => (
              <Link
                key={plan.key}
                href={`/checkout/confirm?plan=${plan.key}`}
                className="no-underline group"
              >
                <div className="bg-white border border-gray-200 group-hover:border-indigo-400 group-hover:shadow-md rounded-2xl p-5 text-left transition-all">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-1">{plan.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{plan.price}<span className="text-sm font-normal text-gray-400">/mo</span></p>
                  <p className="text-xs text-gray-500">{plan.description}</p>
                  <div className="mt-4 text-xs font-semibold text-indigo-600 group-hover:underline">
                    Start free trial →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/#pricing"
            className="text-sm text-gray-400 hover:text-gray-600 transition no-underline"
          >
            Compare all plans
          </Link>
        </main>
      </div>
    )
  }

  // Active subscription — determine plan and load the slicer
  const rawPlan = subscription.plan as string
  const userPlan: UserPlan = VALID_PLANS.includes(rawPlan as UserPlan)
    ? (rawPlan as UserPlan)
    : 'freelancer'

  return <SlicerApp userPlan={userPlan} />
}
