import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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
