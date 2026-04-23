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
  async rewrites() {
    // /favicon.ico é solicitado automaticamente por todos os browsers.
    // Como não temos um .ico binário, reescrevemos para /icon.svg (suportado em browsers modernos).
    return [
      { source: '/favicon.ico', destination: '/icon.svg' },
    ]
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production'
    // CSP NOTES
    // ---------
    // - 'unsafe-inline' é necessário em script-src para os bootstraps que o Next
    //   injeta em tempo de hidratação.
    // - 'unsafe-eval' é necessário APENAS em dev, porque o webpack usa
    //   `eval-source-map` → o bundle executa `eval(...)` pra expor sourcemaps.
    //   Sem isso, main-app.js falha em silêncio → React nunca hidrata → layout
    //   renderiza mas botões, dropdowns, logout, i18n ficam inertes.
    // - Em produção o bundle não usa eval — CSP mantém-se estrita.
    // - 'strict-dynamic' + nonce não é usado porque o Next 14 não injeta nonces
    //   por padrão (https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy).
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'"
    // connect-src em dev precisa aceitar ws://localhost pro HMR do Next.
    const connectSrc = isDev
      ? "connect-src 'self' ws://localhost:* http://localhost:* https://*.supabase.co wss://*.supabase.co https://api.open-meteo.com"
      : "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.open-meteo.com"

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
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              scriptSrc,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https://*.supabase.co",
              "font-src 'self' data: https://fonts.gstatic.com",
              connectSrc,
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
