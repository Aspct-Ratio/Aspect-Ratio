import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

const limiter = rateLimit({ windowMs: 60_000, max: 10 })

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed } = limiter.check(ip)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // Auth — must be signed in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const PRICE_MAP: Record<string, string | undefined> = {
      creator:    process.env.STRIPE_CREATOR_PRICE_ID,
      freelancer: process.env.STRIPE_FREELANCER_PRICE_ID,
      studio:     process.env.STRIPE_STUDIO_PRICE_ID,
      agency:     process.env.STRIPE_AGENCY_PRICE_ID,
    }

    const { plan } = await req.json() as { plan: string }

    const priceId = PRICE_MAP[plan]
    if (!priceId) {
      return NextResponse.json({ error: `Unknown plan: ${plan}` }, { status: 400 })
    }

    // NOTE: NEXT_PUBLIC_APP_URL must be set to https://www.aspctratio.com (with www)
    // in Vercel — the non-www domain issues a 307 redirect that breaks Stripe callbacks.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 7 },
      customer_email: user.email,
      success_url: `${baseUrl}/app`,
      cancel_url:  `${baseUrl}/checkout/confirm?plan=${plan}&canceled=true`,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create session' },
      { status: 500 },
    )
  }
}
