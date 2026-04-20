import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'Supported Channels & Platforms — 60+ Format Presets',
  description:
    'ASPCT RATIO supports 60+ format presets across Instagram, TikTok, YouTube, Facebook, Pinterest, LinkedIn, X/Twitter, Amazon, Shopify, Google Display, and more.',
  alternates: { canonical: 'https://aspctratio.com/product/supported-channels' },
}

export default function SupportedChannelsPage() {
  return (
    <div className="bg-white text-gray-800 antialiased leading-relaxed">
      <SiteNav />

      <header className="py-20 px-6 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-4">Supported Channels</p>
          <h1 className="text-[clamp(30px,5vw,48px)] font-extrabold tracking-[-1.5px] text-gray-900 leading-[1.1] mb-6">
            Every Platform Your Team Publishes On
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            ASPCT RATIO ships with built-in presets for 60+ formats across social media, e-commerce, paid media, and
            retail. Dimensions stay current so you never have to Google the latest specs.
          </p>
        </div>
      </header>

      <main className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-14">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Social Media</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Instagram feed posts (1080 x 1350, 1080 x 1080), Stories and Reels covers (1080 x 1920), profile photos,
              and carousel slides. TikTok in-feed video covers and profile images. Facebook feed images, cover photos,
              event banners, carousel ads, and link preview images. YouTube thumbnails (1280 x 720), channel banners
              (2560 x 1440), and community post images.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              Pinterest standard pins (1000 x 1500), long pins, and board covers. LinkedIn single-image posts, company
              page banners, and article cover images. X/Twitter post images and header banners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">E-Commerce</h2>
            <p className="text-gray-600 leading-[1.8]">
              Amazon product main images, comparison-shopping feed images, and A+ content modules. Shopify collection
              banners, product thumbnails, and featured images. Google Merchant Center product feed images. General
              marketplace thumbnails and hero banners for DTC storefronts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Paid Media & Display</h2>
            <p className="text-gray-600 leading-[1.8]">
              The full IAB standard display suite: leaderboard (728 x 90), medium rectangle (300 x 250), wide skyscraper
              (160 x 600), half-page (300 x 600), billboard (970 x 250), and large rectangle (336 x 280). Plus
              platform-specific ad formats for Meta, Google, TikTok, Pinterest, and LinkedIn campaign managers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Retail & Out of Home</h2>
            <p className="text-gray-600 leading-[1.8]">
              In-store signage formats, shelf talkers, end cap displays, and digital out-of-home screen ratios. These
              presets cover the most common physical media dimensions that brands and agencies produce alongside their
              digital campaigns.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Custom Formats</h2>
            <p className="text-gray-600 leading-[1.8]">
              If your project calls for a dimension that is not in the preset library — a newsletter header, a media kit
              cover, a partner&apos;s proprietary ad unit — add it manually with any width and height. Custom formats
              appear alongside presets in your crop grid and are included in the final export.
            </p>
          </section>

          <section className="text-center py-12 px-6 bg-indigo-50 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Every Format, One Export</h2>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              Select the platforms you need, adjust your crops, and download everything in a single organized ZIP.
            </p>
            <Link
              href="/signup"
              className="inline-block text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg transition-colors no-underline tracking-wide"
            >
              Try ASPCT RATIO Free
            </Link>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
