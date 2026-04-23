'use client'

import { memo } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { env } from '@/lib/env'

const APP_YEAR = new Date().getFullYear()

/**
 * ZenFooter — footer 36px, 1 linha centralizada, minimalista.
 * Design validado 2026-04-22 (Proposta C — Zen Minimal).
 */
export const ZenFooter = memo(function ZenFooter({ className }: { className?: string }) {
  const t = useTranslations('footer')
  const appName = env.APP_NAME || 'Template Platform'
  const appVersion = env.APP_VERSION || '1.0.0'

  return (
    <footer className={`zen-footer px-4${className ? ` ${className}` : ''}`}>
      <span suppressHydrationWarning>
        © {APP_YEAR} <span className="text-[var(--text-secondary)]">{appName}</span>
      </span>
      <span className="zen-dot" aria-hidden="true" />
      <span className="font-mono text-[10px] opacity-80" suppressHydrationWarning>
        v{appVersion}
      </span>
      <span className="zen-dot" aria-hidden="true" />
      <Link href="/docs" className="hover:underline">
        {t('docs')}
      </Link>
      <span className="zen-dot" aria-hidden="true" />
      <Link href="/admin/config" className="hover:underline">
        {t('settings')}
      </Link>
    </footer>
  )
})
