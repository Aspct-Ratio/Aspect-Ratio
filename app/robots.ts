import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/app/', '/account/', '/dashboard/', '/checkout/', '/auth/', '/api/'],
      },
    ],
    sitemap: 'https://aspctratio.com/sitemap.xml',
  }
}
