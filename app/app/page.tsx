import { createClient } from '@/lib/supabase/server'
import SlicerApp from '@/components/slicer/SlicerApp'
import type { UserPlan } from '@/components/slicer/Step1Upload'

const VALID_PLANS: UserPlan[] = ['freelancer', 'studio', 'agency', 'enterprise']

export default async function AppPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Read plan from user metadata — falls back to 'freelancer' until Stripe is wired
  const rawPlan = user?.user_metadata?.plan as string | undefined
  const userPlan: UserPlan = VALID_PLANS.includes(rawPlan as UserPlan)
    ? (rawPlan as UserPlan)
    : 'freelancer'

  return <SlicerApp userPlan={userPlan} />
}
