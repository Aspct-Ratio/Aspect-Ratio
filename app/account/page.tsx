import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import LogoMark from '@/components/LogoMark'
import BillingSettings from '@/components/BillingSettings'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/account')

  // Fetch subscription — use admin client so RLS doesn't block server reads
  const admin = createAdminClient()
  const { data: subscription } = await admin
    .from('subscriptions')
    .select('plan, status, current_period_end, trial_end, cancel_at, cancel_at_period_end')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-7 h-[64px] flex items-center justify-between">
        <Link href="/" className="no-underline">
          <LogoMark height={75} />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/app" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition no-underline">
            ← Back to app
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[600px] mx-auto px-6 py-12">
        <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight mb-1">ACCOUNT SETTINGS</h1>
        <p className="text-sm text-gray-500 mb-8">Manage your subscription and account details.</p>

        <BillingSettings
          subscription={subscription ?? null}
          userEmail={user.email ?? ''}
        />
      </main>
    </div>
  )
}
