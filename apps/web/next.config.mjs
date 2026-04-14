import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  eslint: {
    ignoreDuringBuilds: true, // Lint runs as separate CI step
  },
  transpilePackages: ['@template/design-system', '@template/shared', '@template/types', '@template/data'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            // CSP: 'unsafe-inline' kept in style-src (required for styled-jsx/Tailwind).
            // script-src: 'strict-dynamic' delegates trust to scripts loaded by Next.js bootstrap.
            // 'unsafe-inline' is ignored when 'strict-dynamic' is present (spec behavior).
            // For full nonce-based CSP, see: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'strict-dynamic' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https://*.supabase.co",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
