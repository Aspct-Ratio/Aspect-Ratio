import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })

export async function POST(req: NextRequest) {
  // Auth check — must be logged in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch the user's active subscription from Supabase
  const admin = createAdminClient()
  const { data: sub, error: fetchError } = await admin
    .from('subscriptions')
    .select('stripe_subscription_id, status, current_period_end')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (fetchError || !sub) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
  }

  if (sub.status === 'canceling') {
    return NextResponse.json({ error: 'Subscription is already scheduled to cancel' }, { status: 409 })
  }

  try {
    // Tell Stripe to cancel at end of current period — not immediately
    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    // Update Supabase to reflect 'canceling' state
    await admin
      .from('subscriptions')
      .update({
        status:               'canceling',
        cancel_at_period_end: true,
        cancel_at:            sub.current_period_end,
        updated_at:           new Date().toISOString(),
      })
      .eq('stripe_subscription_id', sub.stripe_subscription_id)

    return NextResponse.json({
      ok: true,
      cancel_at: sub.current_period_end,
    })
  } catch (err) {
    console.error('Stripe cancel error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to cancel subscription' },
      { status: 500 },
    )
  }
}
