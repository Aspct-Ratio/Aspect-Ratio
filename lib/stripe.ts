import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
})

export const PLANS = {
  free: {
    name: 'Free',
    exports: 25,       // exports / month
    maxFiles: 5,
    maxFormats: 10,
  },
  pro: {
    name: 'Pro',
    exports: Infinity,
    maxFiles: 50,
    maxFormats: Infinity,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? '',
  },
} as const
