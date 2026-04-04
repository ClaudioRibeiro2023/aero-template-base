'use client'

import { useAuth } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  ChevronRight,
  Sliders,
  Paintbrush,
  Bell,
  Plug,
  Menu,
  ToggleLeft,
  ShieldAlert,
} from 'lucide-react'

const SECTION_DEFS = [
  {
    id: 'geral',
    titleKey: 'general',
    descKey: 'generalDesc',
    icon: Sliders,
    path: '/admin/config/geral',
  },
  {
    id: 'aparencia',
    titleKey: 'appearance',
    descKey: 'appearanceDesc',
    icon: Paintbrush,
    path: '/admin/config/aparencia',
  },
  {
    id: 'notificacoes',
    titleKey: 'notifications',
    descKey: 'notificationsDesc',
    icon: Bell,
    path: '/admin/config/notificacoes',
  },
  {
    id: 'integracoes',
    titleKey: 'integrations',
    descKey: 'integrationsDesc',
    icon: Plug,
    path: '/admin/config/integracoes',
  },
  {
    id: 'navegacao',
    titleKey: 'navigation',
    descKey: 'navigationDesc',
    icon: Menu,
    path: '/admin/config/navegacao',
  },
  {
    id: 'feature-flags',
    titleKey: 'featureFlags',
    descKey: 'featureFlagsDesc',
    icon: ToggleLeft,
    path: '/admin/config/feature-flags',
  },
] as const

export default function ConfigPage() {
  const { hasRole } = useAuth()
  const t = useTranslations('config')
  const tUsers = useTranslations('users')
  const isAdmin = hasRole('ADMIN') || hasRole('GESTOR')

  if (!isAdmin) {
    return (
      <main className="page-enter ambient-gradient max-w-3xl mx-auto p-4 sm:p-8">
        <div className="relative z-10 glass-panel p-8 flex flex-col items-center text-center">
          <div className="p-3 rounded-2xl bg-rose-500/10 mb-4">
            <ShieldAlert size={28} className="text-rose-400" />
          </div>
          <h1 className="text-xl font-bold text-rose-400">{tUsers('accessDenied')}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-md">
            {tUsers('adminRequired')}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="page-enter ambient-gradient max-w-3xl mx-auto p-4 sm:p-8">
      <div className="relative z-10 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{t('manageSettings')}</p>
      </div>

      <div className="relative z-10 space-y-3">
        {SECTION_DEFS.map(section => {
          const Icon = section.icon
          return (
            <Link
              key={section.id}
              href={section.path}
              className="group flex items-center gap-4 p-4 glass-panel transition-all duration-300 hover:-translate-y-[1px] hover:border-[var(--glass-border-hover)]"
            >
              {/* Glow on hover */}
              <div
                className="absolute inset-0 rounded-[var(--radius-lg)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: '0 0 20px var(--glow-brand)' }}
              />

              <div className="relative p-2.5 rounded-xl bg-[var(--brand-primary)]/10 flex-shrink-0 group-hover:bg-[var(--brand-primary)]/20 transition-colors">
                <Icon size={20} className="text-[var(--brand-primary)]" aria-hidden="true" />
              </div>
              <div className="relative flex-1 min-w-0">
                <p className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                  {t(section.titleKey)}
                </p>
                <p className="text-sm text-[var(--text-muted)] truncate">{t(section.descKey)}</p>
              </div>
              <ChevronRight
                size={18}
                className="relative text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] group-hover:translate-x-0.5 transition-all flex-shrink-0"
                aria-hidden="true"
              />
            </Link>
          )
        })}
      </div>
    </main>
  )
}
