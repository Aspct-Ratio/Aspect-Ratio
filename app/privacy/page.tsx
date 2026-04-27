import Link from 'next/link'
import LogoMark from '@/components/LogoMark'

export const metadata = {
  title: 'Privacy Policy',
  description: 'How ASPCT RATIO collects, uses, and protects your data. Read our full privacy policy.',
  alternates: { canonical: 'https://aspctratio.com/privacy' },
}

const sections = [
  {
    n: '1',
    title: 'Information We Collect',
    body: 'We collect the following information when you use our Service:',
    items: [
      'Account information: your name, email address, and profile picture when you sign up directly or via Google OAuth.',
      'Payment information: processed securely by Stripe. We do not store your credit card number or banking details on our servers. We receive and store your Stripe customer ID and subscription status.',
      'Usage data: uploaded image files (processed in memory and not permanently stored), saved campaigns, custom dimension presets, export history, and session activity.',
      'Technical data: IP address, browser type, device information, and referring URLs collected automatically through server logs.',
    ],
  },
  {
    n: '2',
    title: 'How We Use Your Information',
    items: [
      'To provide, operate, and maintain the Service, including processing your image files and delivering exports.',
      'To manage your account, subscriptions, and billing.',
      'To send service-related communications such as confirmations, invoices, security alerts, and product updates.',
      'To monitor and analyze usage trends to improve the Service.',
      'To detect, prevent, and address fraud, abuse, or technical issues.',
    ],
  },
  {
    n: '3',
    title: 'Google OAuth',
    body: 'If you sign in using Google, we receive your name, email address, and profile picture from Google. We use this information solely to create and manage your account. We do not access your Google Drive, Gmail, contacts, or any other Google services. You can revoke access at any time through your Google account security settings.',
  },
  {
    n: '4',
    title: 'Cookies and Tracking',
    body: 'We use essential cookies required for the Service to function, including authentication session cookies managed by Supabase. We do not use third-party advertising cookies or tracking pixels. We do not sell your data to advertisers. Analytics, if used, are limited to aggregate, non-personally-identifiable usage metrics.',
  },
  {
    n: '5',
    title: 'Third-Party Services',
    body: 'We share data with the following third-party service providers, each of which has its own privacy policy:',
    items: [
      'Stripe — payment processing and subscription management.',
      'Supabase — authentication, database, and data storage.',
      'Vercel — application hosting and edge delivery.',
    ],
  },
  {
    n: '6',
    title: 'Data Retention',
    items: [
      'Uploaded files: processed in memory during your session and not permanently stored on our servers. Exported files are delivered to your browser for download and are not retained.',
      'Account data: retained for as long as your account is active. Upon account deletion, your personal data is removed within 30 days, except where retention is required by law (e.g., billing records).',
      'Server logs: retained for up to 90 days for security and debugging purposes, then automatically deleted.',
    ],
  },
  {
    n: '7',
    title: 'Data Security',
    body: 'We implement industry-standard security measures to protect your data, including encrypted connections (TLS/SSL), secure authentication, and access controls. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.',
  },
  {
    n: '8',
    title: 'Your Rights',
    body: 'Depending on your location, you may have the following rights regarding your personal data:',
    items: [
      'Access: request a copy of the personal data we hold about you.',
      'Correction: request that we correct inaccurate or incomplete data.',
      'Deletion: request that we delete your personal data. You can delete your account directly from the Account page in the app, or by contacting us.',
      'Portability: request a machine-readable copy of your data.',
      'Objection: object to our processing of your personal data in certain circumstances.',
    ],
  },
  {
    n: '9',
    title: 'GDPR (European Economic Area)',
    body: 'If you are located in the European Economic Area (EEA), we process your personal data under the following legal bases: (a) your consent, which you may withdraw at any time; (b) performance of our contract with you to provide the Service; and (c) our legitimate interests in operating and improving the Service, provided those interests are not overridden by your rights. You have the right to lodge a complaint with your local data protection authority.',
  },
  {
    n: '10',
    title: 'CCPA (California Residents)',
    body: 'If you are a California resident, you have the right to: (a) know what personal information we collect and how it is used; (b) request deletion of your personal information; (c) opt out of the sale of your personal information — we do not sell your personal information; and (d) not be discriminated against for exercising your privacy rights. To exercise these rights, contact us at hello@aspctratio.com.',
  },
  {
    n: '11',
    title: 'International Data Transfers',
    body: 'Your information may be transferred to and processed in the United States or other countries where our service providers operate. By using the Service, you consent to the transfer of your data to jurisdictions that may have different data protection laws than your country of residence. Where required, we ensure appropriate safeguards are in place for such transfers.',
  },
  {
    n: '12',
    title: "Children's Privacy",
    body: 'The Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we learn that we have collected personal information from a child under 18, we will take steps to delete that information promptly. If you believe a child has provided us with personal information, please contact us at hello@aspctratio.com.',
  },
  {
    n: '13',
    title: 'Do Not Sell My Information',
    body: 'We do not sell, rent, or trade your personal information to third parties for monetary or other valuable consideration. This applies to all users regardless of location.',
  },
  {
    n: '14',
    title: 'Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a notice on the Service. The "Effective Date" at the top of this page indicates when this policy was last revised.',
  },
  {
    n: '15',
    title: 'Contact',
    body: 'For privacy-related questions or to exercise your data rights, contact us at:',
    email: 'hello@aspctratio.com',
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 md:px-10 h-[80px] flex items-center justify-between">
        <Link href="/" className="no-underline">
          <LogoMark height={75} />
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
        <p className="text-sm text-gray-400 mb-12">Effective Date: April 27, 2026</p>

        <div className="space-y-10">
          {sections.map(s => (
            <div key={s.n}>
              <h2 className="text-[15px] font-bold text-gray-900 mb-2">
                {s.n}. {s.title}
              </h2>
              {'body' in s && s.body && (
                <p className="text-[15px] text-gray-600 leading-[1.75] mb-2">
                  {s.body}
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
              {'items' in s && s.items && (
                <ul className="space-y-2">
                  {s.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[15px] text-gray-600 leading-[1.7]">
                      <span className="text-indigo-400 mt-1 flex-shrink-0">–</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4 text-sm text-gray-400">
          <span>© {new Date().getFullYear()} ASPCT RATIO LLC</span>
          <Link href="/terms" className="hover:text-gray-700 transition no-underline">Terms of Service →</Link>
        </div>
      </main>
    </div>
  )
}
