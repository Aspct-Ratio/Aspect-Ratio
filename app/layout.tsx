import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'ASPCT RATIO — Bulk Image Resizing & Asset Slicing for Every Ad Format',
    template: '%s | ASPCT RATIO',
  },
  description:
    'Resize and crop images for every social media, e-commerce, and ad format in one click. Upload once, export every size — named, sorted, and ready to publish.',
  metadataBase: new URL('https://aspctratio.com'),
  keywords: [
    'asset slicing',
    'asset resizing',
    'bulk image resize',
    'image cropping tool',
    'social media image resizer',
    'ad creative resizing',
    'batch image resize',
    'aspect ratio tool',
    'image resize for Instagram',
    'image resize for TikTok',
    'resize images for ads',
    'creative asset management',
    'multi-format image export',
  ],
  authors: [{ name: 'ASPCT RATIO' }],
  creator: 'ASPCT RATIO',
  publisher: 'ASPCT RATIO',
  formatDetection: { telephone: false },
  alternates: { canonical: 'https://aspctratio.com' },
  openGraph: {
    title: 'ASPCT RATIO — Bulk Image Resizing & Asset Slicing',
    description:
      'Upload once, export every format. Resize and crop images for social media, e-commerce, and paid ads in seconds.',
    url: 'https://aspctratio.com',
    siteName: 'ASPCT RATIO',
    locale: 'en_US',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ASPCT RATIO — Bulk Asset Slicing & Resizing Tool',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ASPCT RATIO — Bulk Image Resizing & Asset Slicing',
    description:
      'Upload once, export every format. Resize and crop images for social, e-commerce, and paid ads in seconds.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

/* ── JSON-LD structured data ──────────────────────────────────────────── */

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ASPCT RATIO',
  url: 'https://aspctratio.com',
  logo: 'https://aspctratio.com/images/logo.jpg',
  description:
    'Bulk image resizing and asset slicing platform for creative teams, agencies, and e-commerce brands.',
  sameAs: [],
}

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ASPCT RATIO',
  url: 'https://aspctratio.com',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  description:
    'Upload images and export them in every social media, e-commerce, and ad format — cropped, named, and sorted automatically.',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: '29',
    highPrice: '149',
    offerCount: '3',
  },
  featureList: [
    'Bulk image resizing for 60+ ad and social formats',
    'Automatic smart-crop with manual adjustment',
    'Text overlay editor with per-format copy',
    'Organized folder structure and file naming',
    'Export as ZIP with JPEG, PNG, WebP, PDF, or TIFF',
  ],
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does the free trial work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You get 7 days free with full access to all features. No credit card required to start. Cancel anytime before the trial ends and you won\'t be charged.',
      },
    },
    {
      '@type': 'Question',
      name: 'What file types can I upload?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We support JPG, PNG, WebP, GIF, MP4, MOV, and WebM. Upload up to 50 files per session depending on your plan.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need design skills to use Aspct Ratio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Not at all. If you can drag and drop a file, you can use Aspct Ratio. The tool handles all the technical resizing — you just adjust the crop if needed.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use my own naming conventions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You can set your brand name, campaign name, and the tool builds the filename automatically using your inputs. The folder structure is also organized by channel, platform, and section automatically.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens to my files after export?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your files are processed securely and not stored after your session. Once you download your ZIP, the files are cleared.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can my whole team use this?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — our Studio and Agency plans are built for teams. Multiple users can access the tool under one account.',
      },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="bg-gray-50 text-gray-800 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
