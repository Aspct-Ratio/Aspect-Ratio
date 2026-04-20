import Link from 'next/link'
import LogoMark from '@/components/LogoMark'

export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 border-t border-white/[0.06] py-14 px-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <div>
            <Link href="/" className="no-underline">
              <LogoMark height={75} dark />
            </Link>
            <p className="text-[13px] text-gray-500 mt-3 leading-relaxed">
              Upload once. Export every format, named and sorted, in minutes.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-3">Tools</p>
            <div className="flex flex-col gap-2">
              <Link href="/tools/asset-resizing" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Asset Resizing</Link>
              <Link href="/tools/image-cropping" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Image Cropping</Link>
              <Link href="/tools/social-media-image-resizer" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Social Media Resizer</Link>
              <Link href="/tools/content-creator-image-resizer" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Content Creator Resizer</Link>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-3">Guides</p>
            <div className="flex flex-col gap-2">
              <Link href="/guides/how-to-resize-images-for-social-media" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">How to Resize for Social</Link>
              <Link href="/guides/image-sizes-for-every-social-platform" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Image Sizes Reference</Link>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-gray-400 mb-3">Company</p>
            <div className="flex flex-col gap-2">
              <Link href="/privacy" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Privacy Policy</Link>
              <Link href="/terms" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Terms of Service</Link>
              <a href="mailto:hello@aspctratio.com" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors no-underline">Contact</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/[0.06] pt-6">
          <span className="text-[12px] text-gray-600">&copy; {new Date().getFullYear()} ASPCT RATIO LLC. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
