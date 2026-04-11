'use client'

/**
 * DashboardCharts — Seção de gráfico de atividade e ações rápidas.
 * Extraído de DashboardClient.tsx (Sprint 5 refactor).
 */
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useReducedMotion } from '@/hooks/useA11y'
import { TrendingUp, ArrowUpRight, Zap } from 'lucide-react'

function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`shimmer rounded-lg ${className}`} style={style} aria-hidden="true" />
}

// ── Chart data ──
const CHART_DATA = [
  { label: 'Jan', pct: 65 },
  { label: 'Fev', pct: 45 },
  { label: 'Mar', pct: 80 },
  { label: 'Abr', pct: 55 },
  { label: 'Mai', pct: 70 },
  { label: 'Jun', pct: 90 },
]

function MiniBarChart() {
  const prefersReduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className="flex items-end gap-3 h-36"
      role="img"
      aria-label="Gráfico de atividade mensal dos últimos 6 meses"
    >
      {CHART_DATA.map((d, index) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
          <div
            className="w-full rounded-t-md transition-all duration-700 ease-out cursor-default relative overflow-hidden"
            style={{
              height: mounted || prefersReduced ? `${d.pct}%` : '0%',
              transitionDelay: prefersReduced ? '0ms' : `${index * 100}ms`,
              background: `linear-gradient(to top, var(--brand-primary), var(--brand-secondary))`,
            }}
            title={`${d.label}: ${d.pct}%`}
          >
            <div
              className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10"
              aria-hidden="true"
            />
          </div>
          <span className="text-[10px] font-medium text-[var(--text-muted)]">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

interface QuickAction {
  label: string
  path: string
  description: string
  icon: React.ElementType
}

interface DashboardChartsProps {
  loading: boolean
  quickActions: QuickAction[]
}

export function DashboardCharts({ loading, quickActions }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Chart card — spans 3 cols */}
      <div className="lg:col-span-3 glass-panel p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Atividade Mensal</h2>
            <p className="text-xs text-[var(--text-muted)]">Últimos 6 meses</p>
          </div>
          <div className="p-2 rounded-lg bg-[var(--brand-primary)]/10" aria-hidden="true">
            <TrendingUp size={16} className="text-[var(--brand-primary)]" />
          </div>
        </div>
        {loading ? (
          <div className="h-36 flex items-end gap-3" aria-label="Carregando gráfico">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-t-md"
                style={{ height: `${40 + i * 10}%` }}
              />
            ))}
          </div>
        ) : (
          <MiniBarChart />
        )}
      </div>

      {/* Quick Actions — spans 2 cols */}
      <div className="lg:col-span-2 glass-panel p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Ações Rápidas</h2>
          <div className="p-2 rounded-lg bg-[var(--accent-purple)]/10" aria-hidden="true">
            <Zap size={16} className="text-[var(--accent-purple)]" />
          </div>
        </div>
        <div className="space-y-2">
          {quickActions.map(action => {
            const ActionIcon = action.icon
            return (
              <Link
                key={action.path}
                href={action.path}
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/[0.03] group"
              >
                <div className="p-2 rounded-lg bg-[var(--brand-primary)]/10 flex-shrink-0 group-hover:bg-[var(--brand-primary)]/20 transition-colors">
                  <ActionIcon
                    size={14}
                    className="text-[var(--brand-primary)]"
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                    {action.label}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{action.description}</p>
                </div>
                <ArrowUpRight
                  size={14}
                  className="flex-shrink-0 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-hidden="true"
                />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
