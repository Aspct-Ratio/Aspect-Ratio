import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'ASPCT RATIO',
  description: 'Upload once. Export every format, named and sorted, in minutes.',
  metadataBase: new URL('https://aspctratio.com'),
  openGraph: {
    title: 'ASPCT RATIO',
    description: 'Upload once. Export every format, named and sorted, in minutes.',
    url: 'https://aspctratio.com',
    siteName: 'ASPCT RATIO',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ASPCT RATIO — Asset Slicing Tool',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ASPCT RATIO',
    description: 'Upload once. Export every format, named and sorted, in minutes.',
    images: ['/images/og-image.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gray-50 text-gray-800 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
