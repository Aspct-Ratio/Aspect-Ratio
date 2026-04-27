import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

const limiter = rateLimit({ windowMs: 60_000, max: 5 })

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed } = limiter.check(ip)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const { email } = await request.json()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('waitlist')
      .upsert({ email }, { onConflict: 'email', ignoreDuplicates: true })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[/api/waitlist]', err)
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
  }
}
