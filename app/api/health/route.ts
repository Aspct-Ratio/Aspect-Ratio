import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Keep-alive / health endpoint.
// Runs a trivial database read so Supabase registers activity and does not
// pause the project (free tier pauses after ~7 days of DB inactivity).
// Pinged on a daily schedule. Kept lightweight: HEAD count, no rows returned.
export const dynamic = 'force-dynamic'

export async function GET() {
  const startedAt = Date.now()
  try {
    const admin = createAdminClient()
    // `head: true` returns only the count — no row data transferred.
    const { error } = await admin
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json(
        { ok: false, db: 'error', error: error.message },
        { status: 503 },
      )
    }

    return NextResponse.json({
      ok: true,
      db: 'reachable',
      ms: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json(
      { ok: false, db: 'error', error: err instanceof Error ? err.message : 'unknown' },
      { status: 503 },
    )
  }
}
