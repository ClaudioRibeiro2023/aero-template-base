'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart3, TrendingUp, Users, Activity, ChevronLeft, Loader2 } from 'lucide-react'

interface PlatformMetric {
  id: string
  week_start: string
  active_users: number
  tickets_created: number
  tasks_completed: number
}

interface DashboardStats {
  users: number
  tasks: number
  tickets: number
  configItems: number
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<PlatformMetric[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [metricsRes, statsRes] = await Promise.all([
          fetch('/api/platform/metrics'),
          fetch('/api/dashboard/stats'),
        ])

        if (metricsRes.ok) {
          const json = await metricsRes.json()
          setMetrics(json.data?.metrics ?? [])
        }
        if (statsRes.ok) {
          const json = await statsRes.json()
          setStats(json.data ?? null)
        }
      } catch {
        // Fallback silencioso
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const latest = metrics[0]
  const previous = metrics[1]

  function calcChange(current?: number, prev?: number): { change: string; up: boolean } {
    if (!current || !prev || prev === 0) return { change: '--', up: true }
    const pct = Math.round(((current - prev) / prev) * 100)
    return { change: `${pct > 0 ? '+' : ''}${pct}%`, up: pct >= 0 }
  }

  const METRICS_CARDS = [
    {
      label: 'Usuarios Ativos (semana)',
      value: latest?.active_users ?? '--',
      ...calcChange(latest?.active_users, previous?.active_users),
      icon: Users,
    },
    {
      label: 'Tickets Criados',
      value: latest?.tickets_created ?? '--',
      ...calcChange(latest?.tickets_created, previous?.tickets_created),
      icon: BarChart3,
    },
    {
      label: 'Tasks Concluidas',
      value: latest?.tasks_completed ?? '--',
      ...calcChange(latest?.tasks_completed, previous?.tasks_completed),
      icon: TrendingUp,
    },
    {
      label: 'Total Usuarios',
      value: stats?.users ?? '--',
      change: '--',
      up: true,
      icon: Activity,
    },
  ]

  return (
    <main className="page-enter ambient-gradient max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="relative z-10 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-1.5 rounded-xl hover:bg-white/[0.03] transition-colors"
          aria-label="Voltar ao dashboard"
        >
          <ChevronLeft size={20} className="text-[var(--text-muted)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Metricas de uso da plataforma
          </p>
        </div>
      </div>

      {loading ? (
        <div className="relative z-10 glass-panel p-12 flex items-center justify-center gap-2 text-[var(--text-secondary)]">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Carregando metricas...</span>
        </div>
      ) : (
        <>
          <section aria-label="Metricas principais" className="relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {METRICS_CARDS.map(m => {
                const Icon = m.icon
                const changeLabel = m.change
                return (
                  <div key={m.label} className="glass-panel p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 rounded-xl bg-[var(--brand-primary)]/10">
                        <Icon
                          size={18}
                          className="text-[var(--brand-primary)]"
                          aria-hidden="true"
                        />
                      </div>
                      {changeLabel !== '--' && (
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            m.up
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-rose-400 bg-rose-500/10'
                          }`}
                        >
                          {changeLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                      {String(m.value)}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">{m.label}</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Grafico de barras — dados reais por semana */}
          <div className="relative z-10 glass-panel p-6">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
              Atividade por Semana
            </h2>
            {metrics.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {['active_users', 'tickets_created', 'tasks_completed'].map(key => {
                    const labels: Record<string, string> = {
                      active_users: 'Usuarios Ativos',
                      tickets_created: 'Tickets',
                      tasks_completed: 'Tasks Concluidas',
                    }
                    const maxVal = Math.max(
                      ...metrics.map(m => (m as unknown as Record<string, number>)[key] || 1)
                    )
                    return (
                      <div key={key}>
                        <p className="text-xs text-[var(--text-muted)] mb-2">{labels[key]}</p>
                        <div className="flex items-end gap-2 h-24">
                          {[...metrics].reverse().map((m, i) => {
                            const val = (m as unknown as Record<string, number>)[key] || 0
                            const pct = maxVal > 0 ? (val / maxVal) * 100 : 0
                            return (
                              <div
                                key={m.id || i}
                                className="flex-1 flex flex-col items-center gap-1"
                              >
                                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                                  {val}
                                </span>
                                <div
                                  className="w-full rounded-t-sm"
                                  style={{
                                    height: `${Math.max(pct, 5)}%`,
                                    background:
                                      'linear-gradient(to top, var(--brand-primary), var(--brand-secondary))',
                                    opacity: 0.6 + (i / metrics.length) * 0.4,
                                  }}
                                  aria-hidden="true"
                                />
                                <span className="text-[9px] text-[var(--text-muted)]">
                                  S{i + 1}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-[var(--text-muted)] text-center">
                  Ultimas {metrics.length} semanas de dados reais
                </p>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] text-center py-8">
                Nenhuma metrica registrada ainda
              </p>
            )}
          </div>

          {/* Resumo */}
          {stats && (
            <div className="relative z-10 glass-panel p-6">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
                Resumo Geral
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Usuarios', value: stats.users },
                  { label: 'Tasks', value: stats.tasks },
                  { label: 'Tickets', value: stats.tickets },
                  { label: 'Feature Flags', value: stats.configItems },
                ].map(item => (
                  <div key={item.label} className="text-center p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-xl font-bold font-mono text-[var(--text-primary)]">
                      {item.value}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  )
}
