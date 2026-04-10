import { createClient } from '@/lib/supabase/server'
import LandingPage from '@/components/LandingPage'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <LandingPage isLoggedIn={!!user} userEmail={user?.email} />
}
