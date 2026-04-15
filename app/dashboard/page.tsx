import { redirect } from 'next/navigation'

// /dashboard has been consolidated into /account
export default function DashboardPage() {
  redirect('/account')
}
