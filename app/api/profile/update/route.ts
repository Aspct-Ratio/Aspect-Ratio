import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, email, password } = await req.json() as {
    name?: string
    email?: string
    password?: string
  }

  const updates: Record<string, unknown> = {}
  if (name !== undefined) updates.data = { full_name: name }
  if (email && email !== user.email) updates.email = email
  if (password) updates.password = password

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const { error } = await supabase.auth.updateUser(updates)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
