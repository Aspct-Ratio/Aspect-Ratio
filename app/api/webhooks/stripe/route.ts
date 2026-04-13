import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })
}

function getPriceToPlан(): Record<string, string> {
  return {
    [process.env.STRIPE_FREELANCER_PRICE_ID!]: 'freelancer',
    [process.env.STRIPE_STUDIO_PRICE_ID!]:     'studio',
    [process.env.STRIPE_AGENCY_PRICE_ID!]:     'agency',
  }
}

// ── Helpers ────────────────────────────────────────────────────

async function upsertSubscription(data: {
  stripe_customer_id: string
  stripe_subscription_id: string
  plan: string
  status: string
  current_period_end: string | null
  trial_end: string | null
  user_id?: string
}) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('subscriptions')
    .upsert(data, { onConflict: 'stripe_subscription_id' })
  if (error) throw error
}

async function updateSubscriptionStatus(subscriptionId: string, status: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('subscriptions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', subscriptionId)
  if (error) throw error
}

async function getUserIdByEmail(email: string): Promise<string | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('auth.users')
    .select('id')
    .eq('email', email)
    .single()
  return data?.id ?? null
}

async function getUserIdByCustomer(customerId: string): Promise<string | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()
  return data?.user_id ?? null
}

function planFromSubscription(subscription: Stripe.Subscription): string {
  const priceId = subscription.items.data[0]?.price?.id ?? ''
  return getPriceToPlан()[priceId] ?? 'freelancer'
}

function toIso(ts: number | null | undefined): string | null {
  return ts ? new Date(ts * 1000).toISOString() : null
}

// ── Event handlers ─────────────────────────────────────────────

async function handleCheckoutCompleted(event: Stripe.CheckoutSessionCompletedEvent) {
  const session = event.data.object
  if (session.mode !== 'subscription') return

  const subscriptionId = session.subscription as string
  const customerId = session.customer as string
  const customerEmail = session.customer_details?.email ?? session.customer_email ?? null

  const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
  const plan = planFromSubscription(subscription)

  // Resolve user — try email first, fall back to existing customer record
  let userId: string | null = null
  if (customerEmail) userId = await getUserIdByEmail(customerEmail)
  if (!userId) userId = await getUserIdByCustomer(customerId)

  await upsertSubscription({
    stripe_customer_id:    customerId,
    stripe_subscription_id: subscriptionId,
    plan,
    status:             subscription.status,
    current_period_end: toIso(subscription.current_period_end),
    trial_end:          toIso(subscription.trial_end ?? null),
    ...(userId ? { user_id: userId } : {}),
  })

  // Stamp plan on user metadata for fast reads in the app
  if (userId) {
    const supabase = createAdminClient()
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { plan },
    })
  }
}

async function handlePaymentSucceeded(event: Stripe.InvoicePaymentSucceededEvent) {
  const invoice = event.data.object
  const subscriptionId = invoice.subscription as string | null
  if (!subscriptionId) return

  const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
  const plan = planFromSubscription(subscription)
  const customerId = subscription.customer as string

  const supabase = createAdminClient()
  await supabase
    .from('subscriptions')
    .upsert({
      stripe_customer_id:     customerId,
      stripe_subscription_id: subscriptionId,
      plan,
      status:             subscription.status,
      current_period_end: toIso(subscription.current_period_end),
      trial_end:          toIso(subscription.trial_end ?? null),
      updated_at:         new Date().toISOString(),
    }, { onConflict: 'stripe_subscription_id' })

  // Keep user metadata in sync
  const userId = await getUserIdByCustomer(customerId)
  if (userId) {
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { plan },
    })
  }
}

async function handlePaymentFailed(event: Stripe.InvoicePaymentFailedEvent) {
  const invoice = event.data.object
  const subscriptionId = invoice.subscription as string | null
  if (!subscriptionId) return
  await updateSubscriptionStatus(subscriptionId, 'past_due')
}

async function handleSubscriptionUpdated(event: Stripe.CustomerSubscriptionUpdatedEvent) {
  const subscription = event.data.object
  const customerId = subscription.customer as string
  const cancelAtPeriodEnd = subscription.cancel_at_period_end

  const status = cancelAtPeriodEnd ? 'canceling' : subscription.status

  const supabase = createAdminClient()
  await supabase
    .from('subscriptions')
    .update({
      status,
      cancel_at_period_end: cancelAtPeriodEnd,
      cancel_at:            toIso(subscription.cancel_at ?? null),
      current_period_end:   toIso(subscription.current_period_end),
      updated_at:           new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  // If user reactivated (cancel_at_period_end flipped back to false), sync plan back
  if (!cancelAtPeriodEnd && subscription.status === 'active') {
    const userId = await getUserIdByCustomer(customerId)
    const plan = planFromSubscription(subscription)
    if (userId) {
      await supabase.auth.admin.updateUserById(userId, { user_metadata: { plan } })
    }
  }
}

async function handleSubscriptionDeleted(event: Stripe.CustomerSubscriptionDeletedEvent) {
  const subscription = event.data.object
  const subscriptionId = subscription.id
  const customerId = subscription.customer as string

  await updateSubscriptionStatus(subscriptionId, 'canceled')

  // Revert user metadata to free tier
  const userId = await getUserIdByCustomer(customerId)
  if (userId) {
    const supabase = createAdminClient()
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { plan: 'freelancer' },
    })
  }
}

// ── Route handler ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event as Stripe.CheckoutSessionCompletedEvent)
        break
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event as Stripe.InvoicePaymentSucceededEvent)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event as Stripe.InvoicePaymentFailedEvent)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event as Stripe.CustomerSubscriptionUpdatedEvent)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event as Stripe.CustomerSubscriptionDeletedEvent)
        break
      default:
        // Ignore unhandled events
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
