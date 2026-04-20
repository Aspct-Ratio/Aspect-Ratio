import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://aspctratio.com'
  const now = new Date().toISOString()

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    // Product pages
    { url: `${base}/product/how-it-works`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/product/features`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/product/supported-channels`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    // Use case pages
    { url: `${base}/use-cases/agencies`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/use-cases/brands`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/use-cases/studios`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/use-cases/freelancers`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/use-cases/content-creators`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    // SEO content pages
    { url: `${base}/tools/asset-resizing`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/tools/image-cropping`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/tools/social-media-image-resizer`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/tools/content-creator-image-resizer`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/guides/how-to-resize-images-for-social-media`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/guides/image-sizes-for-every-social-platform`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ]
}
