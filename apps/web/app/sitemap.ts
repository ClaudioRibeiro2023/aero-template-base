import type { MetadataRoute } from 'next'

/**
 * BASE_URL resolution:
 *  1. NEXT_PUBLIC_APP_URL (canonical, set per-deploy)
 *  2. VERCEL_PROJECT_PRODUCTION_URL (prod deploy on Vercel, sem scheme)
 *  3. VERCEL_URL (preview deploy on Vercel, sem scheme)
 *  4. http://localhost:3000 (dev local)
 */
function resolveBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

const BASE_URL = resolveBaseUrl()

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
