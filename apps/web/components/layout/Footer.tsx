'use client'

import { Settings, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { Tooltip } from '@template/design-system'
import { env } from '@/lib/env'

const APP_YEAR = new Date().getFullYear()

export function Footer() {
  const appName = env.APP_NAME || 'Template Platform'
  const appVersion = env.APP_VERSION || '1.0.0'

  return (
    <footer className="border-t border-border-default bg-surface-base mt-auto">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <p className="text-xs text-text-muted truncate">
              © {APP_YEAR} <span className="text-text-secondary font-medium">{appName}</span>
            </p>
            <span className="text-xs px-1.5 py-0.5 rounded bg-surface-raised text-text-muted font-mono border border-border-default hidden sm:inline">
              v{appVersion}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Tooltip content="Documentação">
              <a
                href="/docs"
                className="p-2 rounded-lg hover:bg-surface-muted text-text-secondary transition-colors"
                aria-label="Documentação"
              >
                <BookOpen className="w-4 h-4" />
              </a>
            </Tooltip>
            <Tooltip content="Configurações">
              <Link
                href="/admin/config"
                className="p-2 rounded-lg hover:bg-surface-muted text-text-secondary transition-colors"
                aria-label="Configurações"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </Tooltip>
          </div>
        </div>
      </div>
    </footer>
  )
}
