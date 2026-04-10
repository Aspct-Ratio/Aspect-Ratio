import Link from 'next/link'
import LogoMark from '@/components/LogoMark'

export const metadata = {
  title: 'Privacy Policy — ASPCT RATIO',
}

const sections = [
  {
    n: '1',
    title: 'Information We Collect',
    body: 'We collect your email address when you create an account. Payment information is processed by Stripe and is not stored on our servers. We collect uploaded image and video files solely for the purpose of processing and making them available for download.',
  },
  {
    n: '2',
    title: 'How We Use Your Information',
    items: [
      'We use your email to manage your account and send service-related communications.',
      'We use uploaded files only to perform the resizing and reformatting services you request.',
      'We do not sell or share your personal information with third parties.',
    ],
  },
  {
    n: '3',
    title: 'Third Party Services',
    body: 'We use Stripe for payment processing and Supabase for data storage. These services have their own privacy policies governing the data they handle.',
  },
  {
    n: '4',
    title: 'Data Retention',
    body: 'Uploaded files are processed and made available for download. We do not permanently store your uploaded creative files beyond what is necessary to deliver the Service.',
  },
  {
    n: '5',
    title: 'Security',
    body: 'We implement industry-standard security measures to protect your data. However no method of transmission over the internet is 100% secure.',
  },
  {
    n: '6',
    title: 'Your Rights',
    body: 'You may request deletion of your account and associated data at any time by contacting us at:',
    email: 'kirkdyer85@gmail.com',
  },
  {
    n: '7',
    title: 'Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We will notify you of significant changes by email.',
  },
  {
    n: '8',
    title: 'Contact',
    body: 'For privacy-related questions contact us at:',
    email: 'kirkdyer85@gmail.com',
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Nav */}
      <header className="border-b border-gray-100 px-6 h-[64px] flex items-center justify-between">
        <Link href="/" className="no-underline">
          <LogoMark height={38} />
        </Link>
        <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900 transition no-underline">
          Terms of Service →
        </Link>
      </header>

      {/* Content */}
      <main className="max-w-[720px] mx-auto px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-3">Legal</p>
        <h1 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-1px] text-gray-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-400 mb-12">Effective Date: April 9, 2026</p>

        <div className="space-y-10">
          {sections.map(s => (
            <div key={s.n}>
              <h2 className="text-[15px] font-bold text-gray-900 mb-2">
                {s.n}. {s.title}
              </h2>
              {'items' in s && s.items ? (
                <ul className="space-y-2">
                  {s.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[15px] text-gray-600 leading-[1.7]">
                      <span className="text-indigo-400 mt-1 flex-shrink-0">–</span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[15px] text-gray-600 leading-[1.75]">
                  {'body' in s && s.body}
                  {'email' in s && s.email && (
                    <>
                      {' '}
                      <a href={`mailto:${s.email}`} className="text-indigo-600 hover:underline">
                        {s.email}
                      </a>
                    </>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4 text-sm text-gray-400">
          <span>© 2026 ASPCT RATIO LLC</span>
          <Link href="/terms" className="hover:text-gray-700 transition no-underline">Terms of Service →</Link>
        </div>
      </main>
    </div>
  )
}
