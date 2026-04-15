import Link from 'next/link'
import LogoMark from '@/components/LogoMark'

export const metadata = {
  title: 'Terms of Service — ASPCT RATIO',
}

const sections = [
  {
    n: '1',
    title: 'Agreement to Terms',
    body: 'By accessing or using Aspect Ratio LLC ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.',
  },
  {
    n: '2',
    title: 'Description of Service',
    body: 'Aspect Ratio LLC is a SaaS web application that allows marketing teams, creative agencies, and brand managers to upload master image and video assets and automatically resize and reformat them into platform-specific dimensions. Users can customize file naming conventions, organize exports into folder structures, and download formatted assets as a ZIP file.',
  },
  {
    n: '3',
    title: 'Subscriptions and Billing',
    body: 'The Service is offered on a subscription basis. Plans are billed monthly. A 14-day free trial is available for new users. After the trial period, your selected plan will be charged automatically. You may cancel at any time through your account settings. Cancellations take effect at the end of the current billing period. No refunds are issued for partial billing periods.',
  },
  {
    n: '4',
    title: 'Acceptable Use',
    items: [
      'You agree not to use the Service to upload or process files that infringe on third-party intellectual property rights or copyrights.',
      'You agree not to use the Service to advertise or sell goods and services.',
      'You agree not to sell or transfer your account to another party.',
    ],
  },
  {
    n: '5',
    title: 'User Content',
    body: 'You retain full ownership of all files you upload. Aspect Ratio LLC does not claim any rights to your uploaded content. You are solely responsible for ensuring you have the rights to upload and process any files submitted to the Service.',
  },
  {
    n: '6',
    title: 'Privacy',
    body: 'Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference.',
  },
  {
    n: '7',
    title: 'Payment Processing',
    body: "Payments are processed securely through Stripe. Aspect Ratio LLC does not store your payment information. By subscribing you agree to Stripe's terms of service.",
  },
  {
    n: '8',
    title: 'Limitation of Liability',
    body: "To the maximum extent permitted by law, Aspect Ratio LLC's liability to you for any claims arising from your use of the Service is limited to the amount you paid us in the six months prior to the claim.",
  },
  {
    n: '9',
    title: 'Dispute Resolution',
    body: 'Any disputes shall first be addressed through informal negotiation for a period of 30 days. If unresolved, disputes shall be submitted to binding arbitration in the state of Oregon. You have one year from the date a dispute arises to file a claim.',
  },
  {
    n: '10',
    title: 'Changes to Terms',
    body: 'We reserve the right to update these Terms at any time. We will notify users of material changes by email. Continued use of the Service after changes constitutes acceptance of the new Terms.',
  },
  {
    n: '11',
    title: 'Contact',
    body: 'For questions about these Terms contact us at:',
    email: 'hello@aspctratio.com',
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-10 h-[80px] flex items-center justify-between">
        <Link href="/" className="no-underline">
          <LogoMark height={75} />
        </Link>
        <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900 transition no-underline">
          Privacy Policy →
        </Link>
      </header>

      {/* Content */}
      <main className="max-w-[720px] mx-auto px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-3">Legal</p>
        <h1 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-1px] text-gray-900 mb-2">
          Terms of Service
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
          <Link href="/privacy" className="hover:text-gray-700 transition no-underline">Privacy Policy →</Link>
        </div>
      </main>
    </div>
  )
}
