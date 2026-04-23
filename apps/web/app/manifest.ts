import type { MetadataRoute } from 'next'

/**
 * PWA manifest — Next.js Metadata API.
 * Serves /manifest.webmanifest with correct MIME type.
 * Replaces legacy public/manifest.json (still kept as fallback for older clients).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Template Platform',
    short_name: 'Template',
    description: 'Plataforma de gestão empresarial',
    start_url: '/dashboard',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0c1929',
    theme_color: '#0087A8',
    lang: 'pt-BR',
    scope: '/',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
