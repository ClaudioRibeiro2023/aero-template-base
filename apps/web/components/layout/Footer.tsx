'use client'

import { memo } from 'react'
import { Settings, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Tooltip } from '@template/design-system'
import { env } from '@/lib/env'

// Year computed at module load — same value for SSR and client hydration.
// suppressHydrationWarning is added to the element that renders this value.
const APP_YEAR = new Date().getFullYear()

export const Footer = memo(function Footer({ className }: { className?: string }) {
  const t = useTranslations('footer')
  const appName = env.APP_NAME || 'Template Platform'
  const appVersion = env.APP_VERSION || '1.0.0'

  return (
    <footer
      className={`border-t border-[rgba(255,255,255,0.06)] bg-transparent mt-auto${className ? ` ${className}` : ''}`}
    >
      <div className="px-5 py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <p className="text-[11px] text-[var(--text-muted)] truncate" suppressHydrationWarning>
              © {APP_YEAR}{' '}
              <span className="text-[var(--text-secondary)] font-medium">{appName}</span>
            </p>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.03] text-[var(--text-muted)] font-mono border border-[rgba(255,255,255,0.06)] hidden sm:inline">
              v{appVersion}
            </span>
          </div>

          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Tooltip content={t('docs')}>
              <a
                href="/docs"
                className="p-1.5 rounded-lg hover:bg-white/[0.04] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={t('docs')}
              >
                <BookOpen className="w-3.5 h-3.5" />
              </a>
            </Tooltip>
            <Tooltip content={t('settings')}>
              <Link
                href="/admin/config"
                className="p-1.5 rounded-lg hover:bg-white/[0.04] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={t('settings')}
              >
                <Settings className="w-3.5 h-3.5" />
              </Link>
            </Tooltip>
          </div>
        </div>
      </div>
    </footer>
  )
})
