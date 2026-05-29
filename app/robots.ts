import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gearforge.store'
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/checkout', '/orders', '/account'] },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  }
}
