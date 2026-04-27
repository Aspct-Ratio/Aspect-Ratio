import Link from 'next/link'
import LogoMark from '@/components/LogoMark'

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for using ASPCT RATIO, the bulk image resizing and asset slicing platform.',
  alternates: { canonical: 'https://aspctratio.com/terms' },
}

const sections = [
  {
    n: '1',
    title: 'Agreement to Terms',
    body: 'By accessing or using ASPCT RATIO, operated by Aspect Ratio LLC (d/b/a ASPCT RATIO) ("we," "us," or "the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.',
  },
  {
    n: '2',
    title: 'Description of Service',
    body: 'ASPCT RATIO is a SaaS web application that allows marketing teams, creative agencies, and brand managers to upload master image assets and automatically resize and reformat them into platform-specific dimensions for advertising, e-commerce, and social media. Users can customize file naming conventions, organize exports into folder structures, and download formatted assets as a ZIP file.',
  },
  {
    n: '3',
    title: 'Eligibility',
    body: 'You must be at least 18 years of age to use the Service. By using the Service, you represent and warrant that you meet this age requirement and have the legal capacity to enter into a binding agreement.',
  },
  {
    n: '4',
    title: 'Account Registration',
    body: 'You must create an account to use the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized access to or use of your account.',
  },
  {
    n: '5',
    title: 'Subscriptions and Billing',
    body: 'The Service is offered on a subscription basis. Plans are billed monthly. A 7-day free trial is available for new users. After the trial period, your selected plan will be charged automatically. You may cancel at any time through your account settings. Cancellations take effect at the end of the current billing period. No refunds are issued for partial billing periods.',
  },
  {
    n: '6',
    title: 'Acceptable Use',
    items: [
      'You agree not to upload or process files that infringe on third-party intellectual property rights or copyrights.',
      'You agree not to use the Service for any unlawful purpose or in violation of any applicable law or regulation.',
      'You agree not to attempt to gain unauthorized access to the Service, other accounts, or any related systems or networks.',
      'You agree not to interfere with or disrupt the integrity or performance of the Service.',
      'You agree not to sell, resell, or transfer your account to another party without our prior written consent.',
      'You agree not to use the Service to distribute malware, viruses, or any other harmful code.',
      'You agree not to reverse-engineer, decompile, or disassemble any part of the Service.',
    ],
  },
  {
    n: '7',
    title: 'User Content',
    body: 'You retain full ownership of all files you upload. Aspect Ratio LLC does not claim any rights to your uploaded content. You are solely responsible for ensuring you have the rights to upload and process any files submitted to the Service. By uploading content, you grant us a limited, non-exclusive license to process your files solely for the purpose of delivering the Service.',
  },
  {
    n: '8',
    title: 'Intellectual Property',
    body: 'The Service, including its design, features, and technology, is owned by Aspect Ratio LLC and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works based on the Service without our prior written consent.',
  },
  {
    n: '9',
    title: 'Copyright Infringement and DMCA',
    body: 'We respect the intellectual property rights of others. If you believe that content available through the Service infringes your copyright, please send a notice to hello@aspctratio.com with the following information: a description of the copyrighted work, the location of the infringing material, your contact information, a statement that you have a good-faith belief the use is unauthorized, and a statement under penalty of perjury that the information is accurate and you are the copyright owner or authorized to act on their behalf.',
  },
  {
    n: '10',
    title: 'Privacy',
    body: 'Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference.',
  },
  {
    n: '11',
    title: 'Payment Processing',
    body: "Payments are processed securely through Stripe. Aspect Ratio LLC does not store your payment information. By subscribing you agree to Stripe's terms of service.",
  },
  {
    n: '12',
    title: 'Account Termination and Suspension',
    body: 'We reserve the right to suspend or terminate your account at any time, with or without notice, if we reasonably believe you have violated these Terms. Upon termination, your right to use the Service will immediately cease. We are not liable to you or any third party for any termination of your access to the Service.',
  },
  {
    n: '13',
    title: 'Disclaimer of Warranties',
    body: 'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.',
  },
  {
    n: '14',
    title: 'Limitation of Liability',
    body: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, ASPECT RATIO LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM YOUR USE OF THE SERVICE IS LIMITED TO THE AMOUNT YOU PAID US IN THE SIX MONTHS PRIOR TO THE CLAIM.",
  },
  {
    n: '15',
    title: 'Indemnification',
    body: 'You agree to indemnify, defend, and hold harmless Aspect Ratio LLC, its officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, and expenses (including reasonable attorneys\' fees) arising out of or related to your use of the Service, your violation of these Terms, or your infringement of any third-party rights.',
  },
  {
    n: '16',
    title: 'Governing Law',
    body: 'These Terms shall be governed by and construed in accordance with the laws of the State of Oregon, United States, without regard to its conflict of law provisions.',
  },
  {
    n: '17',
    title: 'Dispute Resolution',
    body: 'Any disputes shall first be addressed through informal negotiation for a period of 30 days. If unresolved, disputes shall be submitted to binding arbitration in the state of Oregon, administered under the rules of the American Arbitration Association. You have one year from the date a dispute arises to file a claim. You agree that any arbitration shall be conducted on an individual basis and not as a class, consolidated, or representative action.',
  },
  {
    n: '18',
    title: 'Severability',
    body: 'If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.',
  },
  {
    n: '19',
    title: 'Changes to Terms',
    body: 'We reserve the right to update these Terms at any time. We will notify users of material changes by email or by posting a notice on the Service. Continued use of the Service after changes constitutes acceptance of the new Terms.',
  },
  {
    n: '20',
    title: 'Contact',
    body: 'For questions about these Terms contact us at:',
    email: 'hello@aspctratio.com',
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 md:px-10 h-[80px] flex items-center justify-between">
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
        <p className="text-sm text-gray-400 mb-12">Effective Date: April 27, 2026</p>

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
          <span>© {new Date().getFullYear()} ASPCT RATIO LLC</span>
          <Link href="/privacy" className="hover:text-gray-700 transition no-underline">Privacy Policy →</Link>
        </div>
      </main>
    </div>
  )
}
