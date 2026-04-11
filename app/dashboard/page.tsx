import { redirect } from 'next/navigation'
import Link from 'next/link'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import LogoMark from '@/components/LogoMark'
import DashboardClient from '@/components/DashboardClient'

export const metadata = { title: 'Account — ASPCT RATIO' }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })

async function getCardLast4(customerId: string | undefined): Promise<string | null> {
  if (!customerId) return null
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
      limit: 1,
    })
    return paymentMethods.data[0]?.card?.last4 ?? null
  } catch {
    return null
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/dashboard')

  const admin = createAdminClient()
  const { data: subscription } = await admin
    .from('subscriptions')
    .select('plan, status, current_period_end, trial_end, cancel_at, cancel_at_period_end, stripe_customer_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const cardLast4 = await getCardLast4(subscription?.stripe_customer_id)

  const userName = (user.user_metadata?.full_name as string) ?? ''

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-7 h-[64px] flex items-center justify-between">
        <Link href="/" className="no-underline">
          <LogoMark height={38} />
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition no-underline">
            Home
          </Link>
          <Link href="/app" className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition no-underline">
            GO TO APP →
          </Link>
        </div>
      </header>

      <main className="max-w-[640px] mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-1">Account</p>
          <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight">
            Welcome back{userName ? `, ${userName.split(' ')[0]}` : user.email ? `, ${user.email.split('@')[0]}` : ''}.
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your profile, plan, and billing.</p>
        </div>

        <DashboardClient
          userEmail={user.email ?? ''}
          userName={userName}
          subscription={subscription ?? null}
          cardLast4={cardLast4}
        />
      </main>
    </div>
  )
}
