'use client'

import { BarChart3, Plus, FileText, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function RelatoriosPage() {
  const t = useTranslations('reports')

  return (
    <main className="page-enter ambient-gradient max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="relative z-10">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{t('subtitle')}</p>
      </div>

      {/* Empty State — Glass Premium */}
      <div className="relative z-10 glass-panel flex flex-col items-center justify-center py-20 px-6">
        {/* Decorative glow */}
        <div
          className="absolute inset-0 rounded-[var(--radius-lg)] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 40% at 50% 40%, var(--glow-brand), transparent)',
            opacity: 0.15,
          }}
        />

        <div className="relative p-4 rounded-2xl bg-[var(--brand-primary)]/10 mb-5">
          <BarChart3 className="w-10 h-10 text-[var(--brand-primary)]" aria-hidden="true" />
        </div>

        <h2 className="relative text-lg font-semibold text-[var(--text-primary)] mb-2">
          {t('empty')}
        </h2>
        <p className="relative text-sm text-[var(--text-muted)] mb-8 text-center max-w-md leading-relaxed">
          {t('emptyDescription')}
        </p>

        <button
          className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white font-medium text-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          style={{ boxShadow: '0 0 20px var(--glow-brand)' }}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {t('createReport')}
        </button>
      </div>

      {/* Quick Stats Row */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: t('totalGenerated'), value: '0', icon: FileText },
          { label: t('thisMonth'), value: '0', icon: BarChart3 },
          { label: t('trend'), value: '--', icon: TrendingUp },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="glass-panel p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--brand-primary)]/10">
                  <Icon size={16} className="text-[var(--brand-primary)]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xl font-bold font-mono text-[var(--text-primary)]">
                    {stat.value}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
