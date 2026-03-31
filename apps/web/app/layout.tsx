import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { fontSans, fontMono } from './fonts'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Template Platform'

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },
  description: 'Built with Aero Studio Template v2.0',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable}`}
    >
      <body className={fontSans.className}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-brand-primary focus:rounded"
        >
          Pular para conteudo
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
