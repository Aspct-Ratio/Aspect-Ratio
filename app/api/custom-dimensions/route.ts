import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Return empty array (not an error) if not logged in — component handles gracefully
  if (!user) return NextResponse.json([])

  const { data, error } = await supabase
    .from('custom_dimensions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { label, group, width, height } = await req.json() as {
    label: string
    group?: string
    width: number
    height: number
  }

  if (!label || !width || !height) {
    return NextResponse.json({ error: 'label, width, and height are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('custom_dimensions')
    .insert({ user_id: user.id, label, group: group ?? null, width, height })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
