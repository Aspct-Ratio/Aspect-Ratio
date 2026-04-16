import type { Metadata } from 'next'
import Link from 'next/link'
import LogoMark from '@/components/LogoMark'

export const metadata: Metadata = {
  title: 'How to Resize Images for Social Media in 2026 — Complete Guide',
  description:
    'Learn how to resize images for Instagram, TikTok, Facebook, YouTube, and every other social platform. Step-by-step guide with exact dimensions, common mistakes, and pro tips.',
  alternates: { canonical: 'https://aspctratio.com/guides/how-to-resize-images-for-social-media' },
}

export default function HowToResizeGuide() {
  return (
    <div className="bg-white text-gray-800 antialiased leading-relaxed">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between h-[72px] px-6 md:px-10 max-w-5xl mx-auto">
          <Link href="/" className="no-underline flex-shrink-0">
            <LogoMark height={60} />
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition-colors no-underline tracking-wide"
          >
            Try Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="py-20 px-6 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[1px] text-indigo-600 mb-4">Guide</p>
          <h1 className="text-[clamp(28px,5vw,44px)] font-extrabold tracking-[-1.5px] text-gray-900 leading-[1.1] mb-6">
            How to Resize Images for Social Media in 2026
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            A practical, step-by-step guide to getting your images sized correctly for every major social platform —
            so your content looks sharp, professional, and algorithm-friendly.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-14">
          {/* Why dimensions matter */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Image Dimensions Matter More Than You Think</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Social media platforms are not forgiving when it comes to image sizes. Upload a photo that does not match
              the expected dimensions and the platform will either crop it automatically — often cutting off critical
              content — or compress and letterbox it, leaving ugly borders that scream "this creator did not bother to
              format their content properly."
            </p>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Beyond aesthetics, there are real performance implications. Platforms like Instagram and TikTok prioritize
              content that fills the screen. A properly sized Story or Reel takes up the maximum amount of real estate
              on someone's phone, which means more visual impact and longer view times. Undersized or oddly cropped
              content gets less engagement because it physically occupies less attention.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              For paid social advertising, incorrect dimensions can actually prevent your ads from running. Meta's ad
              platform, for example, will reject creatives that fall outside their recommended aspect ratios, or serve
              them with reduced distribution. Getting the sizes right from the start avoids wasted ad spend and
              delayed launches.
            </p>
          </section>

          {/* Step 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 1 — Start with the Highest Resolution Source</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Always begin with the largest, highest-quality version of your image. You can scale down without losing
              quality, but you cannot scale up without introducing blur and artifacts. If you are working with
              photography, use the original camera file or the full-resolution export from your editor. If you are
              working with graphic designs, export from your design tool at 2x or 3x resolution before resizing.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              A good rule of thumb is to make sure your source image is at least 2000 pixels on its shortest side. This
              gives you enough room to crop into portrait, landscape, and square formats without any single output
              falling below the minimum resolution that platforms require.
            </p>
          </section>

          {/* Step 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 2 — Identify Every Platform and Placement You Need</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Before you start resizing, make a list of every platform and placement where this image will appear. A
              single campaign post might need an Instagram feed version at 1080 x 1080, an Instagram Story at 1080 x
              1920, a Facebook feed image at 1200 x 630, a Pinterest pin at 1000 x 1500, and a LinkedIn post at
              1200 x 1200. Knowing the full list upfront prevents rework later.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              Keep in mind that some platforms have multiple placements with different size requirements. Facebook alone
              has distinct dimensions for feed images, cover photos, event covers, group covers, and ad units. YouTube
              needs separate sizes for thumbnails, channel banners, and video end screens. Map out everything before you
              open your resizing tool.
            </p>
          </section>

          {/* Step 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 3 — Resize and Crop with the Subject in Mind</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              When you resize from one aspect ratio to another, some parts of the image will inevitably be cropped out.
              The key is controlling what gets cut. If your image features a person, make sure their face stays in frame
              across all formats. If it is a product shot, keep the entire product visible. If it is a graphic with
              text, ensure the text remains readable and does not get clipped at the edges.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              This is where smart cropping tools shine. Instead of manually repositioning for each format, a tool like
              ASPCT RATIO detects the focal point of your image and automatically centers it within each crop. You
              review the previews and nudge any that need adjustment — a process that takes seconds compared to the
              minutes you would spend per format in a manual editor.
            </p>
          </section>

          {/* Step 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 4 — Export in the Right File Format</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Most social platforms accept JPEG and PNG, and increasingly WebP. For photographic content, JPEG at 80 to
              90 percent quality offers the best balance between file size and visual fidelity. For graphics with sharp
              text, flat colors, or transparency, PNG is the better choice. WebP delivers smaller file sizes than either
              but is not universally supported in all upload workflows.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              Pay attention to file size limits as well. Instagram limits uploads to around 30 MB. Pinterest recommends
              keeping images under 20 MB. If your exports are too large, reduce quality slightly or switch from PNG to
              JPEG. Oversized files can also cause slower uploads and processing delays on the platform side.
            </p>
          </section>

          {/* Step 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 5 — Organize and Name Your Files Consistently</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              When you are producing dozens of resized images per campaign, file organization becomes critical. A naming
              convention like "brand-campaign-platform-placement-dimensions.jpg" makes it easy for anyone on your team
              to find the right file instantly. Grouping files into folders by platform or channel adds another layer
              of clarity.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              ASPCT RATIO handles this automatically. When you export, the ZIP file contains a folder structure organized
              by channel and platform, with each image named descriptively. This saves time during the upload process
              and eliminates the confusion of sifting through a folder full of identically named image files.
            </p>
          </section>

          {/* Common mistakes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Mistakes to Avoid</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              One of the most common mistakes is upscaling a low-resolution image. If your source file is only 600
              pixels wide, stretching it to 1200 pixels will produce a blurry, unprofessional result. Always start with
              the highest resolution available and scale down.
            </p>
            <p className="text-gray-600 leading-[1.8] mb-4">
              Another frequent error is ignoring safe zones. Platform cover photos and banners display differently on
              desktop and mobile. Content near the edges of a YouTube channel banner, for example, may be visible on a
              desktop browser but cropped on a phone. Always preview your crops at mobile dimensions before exporting.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              Finally, many teams forget to account for text readability at smaller sizes. A headline that looks great
              on a 1200-pixel-wide Facebook image might become illegible when that image appears as a small thumbnail
              in a news feed on a mobile device. If your image includes text, test it at the smallest display size the
              platform will use.
            </p>
          </section>

          {/* Platform tips */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform-Specific Tips</h2>
            <p className="text-gray-600 leading-[1.8] mb-4">
              For Instagram, vertical images in the 4:5 ratio (1080 x 1350) take up more feed real estate than square
              images and tend to generate higher engagement. Use square for carousel posts and vertical for single-image
              posts when possible.
            </p>
            <p className="text-gray-600 leading-[1.8] mb-4">
              For YouTube thumbnails, remember that the bottom-right corner will be covered by the video timestamp. Avoid
              placing important elements there. High-contrast images with large, readable text consistently outperform
              subtle or text-heavy designs.
            </p>
            <p className="text-gray-600 leading-[1.8] mb-4">
              For Pinterest, taller pins get more visibility in the feed. The 2:3 ratio (1000 x 1500) is the sweet spot
              — tall enough to stand out without being so long that Pinterest truncates it with a "see more" overlay.
            </p>
            <p className="text-gray-600 leading-[1.8]">
              For LinkedIn, square images (1200 x 1200) dominate more feed space than landscape formats. If you are
              promoting content or driving clicks, the landscape link preview format (1200 x 627) performs well for
              articles and blog posts.
            </p>
          </section>

          {/* CTA */}
          <section className="text-center py-12 px-6 bg-indigo-50 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Skip the Manual Work</h2>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              ASPCT RATIO automates every step in this guide — upload once, select your platforms, review smart crops,
              and export a perfectly organized ZIP. Try it free today.
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

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-100 text-center text-sm text-gray-400">
        <p>&copy; {new Date().getFullYear()} ASPCT RATIO. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <Link href="/privacy" className="hover:text-gray-600 no-underline">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-600 no-underline">Terms</Link>
        </div>
      </footer>
    </div>
  )
}
