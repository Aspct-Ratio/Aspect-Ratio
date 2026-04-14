import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })

    const PRICE_MAP: Record<string, string | undefined> = {
      freelancer: process.env.STRIPE_FREELANCER_PRICE_ID,
      studio:     process.env.STRIPE_STUDIO_PRICE_ID,
      agency:     process.env.STRIPE_AGENCY_PRICE_ID,
    }

    const { plan, email } = await req.json() as { plan: string; email?: string }

    const priceId = PRICE_MAP[plan]
    if (!priceId) {
      return NextResponse.json({ error: `Unknown plan: ${plan}` }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 7 },
      ...(email ? { customer_email: email } : {}),
      success_url: `${baseUrl}/dashboard`,
      cancel_url:  `${baseUrl}/checkout/confirm?plan=${plan}`,
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
