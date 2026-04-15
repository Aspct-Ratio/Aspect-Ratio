import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  // Auth — must be signed in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  try {
    // 1. Fetch any active subscription
    const { data: sub } = await admin
      .from('subscriptions')
      .select('stripe_subscription_id, status')
      .eq('user_id', user.id)
      .not('status', 'eq', 'canceled')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // 2. Cancel in Stripe (if subscription exists and isn't already canceled)
    if (sub?.stripe_subscription_id) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
        await stripe.subscriptions.cancel(sub.stripe_subscription_id)
      } catch (stripeErr) {
        // Log but don't block deletion — subscription may already be canceled
        console.error('Stripe cancel on delete:', stripeErr)
      }
    }

    // 3. Delete subscription rows for this user
    await admin
      .from('subscriptions')
      .delete()
      .eq('user_id', user.id)

    // 4. Delete the user from Supabase Auth
    const { error: deleteErr } = await admin.auth.admin.deleteUser(user.id)
    if (deleteErr) throw deleteErr

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Delete account error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete account' },
      { status: 500 },
    )
  }
}
