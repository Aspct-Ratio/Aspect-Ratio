import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([])

  const { data, error } = await supabase
    .from('saved_campaigns')
    .select('id, campaign_name, selected_formats, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { campaign_name, selected_formats } = await req.json() as {
    campaign_name: string
    selected_formats: string[]
  }

  if (!campaign_name || !Array.isArray(selected_formats)) {
    return NextResponse.json({ error: 'campaign_name and selected_formats are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('saved_campaigns')
    .insert({ user_id: user.id, campaign_name, selected_formats })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
