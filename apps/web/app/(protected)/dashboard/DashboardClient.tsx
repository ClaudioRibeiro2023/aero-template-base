'use client'

/**
 * DashboardClient — Proposta C · Storytelling (Editorial).
 *
 * Redesign validado 2026-04-22 (`docs/reports/assets/design-review-2026-04-22/
 * page-proposta-C-validada.html`).
 *
 * Camadas:
 *  1. Hero editorial — kicker + h2 serif + p + big-num 60px (JetBrains Mono)
 *     com delta. Um insight por vez, sem competição visual.
 *  2. Side cards — "Métricas" (3 KPIs compactos com sparkline) + "Alertas"
 *     (lista com dot colorido + mensagem). Densidade alta, conteúdo útil.
 *  3. System health — rodapé editorial com status operacional por serviço.
 *
 * Fontes de dados reais (sem mock):
 *  - /api/dashboard/stats        (users, tasks, tickets, configItems)
 *  - /api/health                  (status, supabase, demo)
 *  - /api/platform/metrics        (admin/gestor — sparkline de semanas)
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  FileText,
  Activity,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react'
import { useFormatter } from 'next-intl'
import { AnimatedValue, Sparkline } from './DashboardKPICards'

// ── Tipos ────────────────────────────────────────────────────────────────
interface DashboardStats {
  users: number
  tasks: number
  tickets: number
  configItems: number
}

interface PlatformMetric {
  id: string
  week_start: string
  active_users: number
  tickets_created: number
  tasks_completed: number
}

type AlertLevel = 'info' | 'warn' | 'ok'
interface DashboardAlert {
  id: string
  level: AlertLevel
  message: string
  href?: string
}

async function fetchMetrics(): Promise<PlatformMetric[]> {
  const res = await fetch('/api/platform/metrics')
  if (!res.ok) return []
  const json = await res.json()
  return json.data?.metrics ?? []
}

// ── Props ────────────────────────────────────────────────────────────────
interface DashboardClientProps {
  appName: string
  dateLabel: string
}

export function DashboardClient({ appName, dateLabel }: DashboardClientProps) {
  const { hasRole } = useAuth()
  const intlFormat = useFormatter()
  const isAdmin = hasRole('ADMIN') || hasRole('GESTOR')
  const searchParams = useSearchParams()
  const [disabledNotice, setDisabledNotice] = useState<string | null>(null)

  // Notice quando redirecionado de módulo desabilitado
  useEffect(() => {
    const disabled = searchParams.get('disabled')
    if (disabled) {
      setDisabledNotice(disabled)
      const url = new URL(window.location.href)
      url.searchParams.delete('disabled')
      window.history.replaceState({}, '', url.pathname)
    }
  }, [searchParams])

  // Dashboard stats (dado real)
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats')
      if (!res.ok) throw new Error('stats_fetch_failed')
      const json = await res.json()
      return json.data
    },
    staleTime: 60_000,
  })

  // Health (status real)
  const { data: health } = useQuery({
    queryKey: ['health-status'],
    queryFn: async () => {
      const res = await fetch('/api/health')
      if (!res.ok) return { status: 'error', supabase: 'error' }
      return res.json()
    },
    staleTime: 30_000,
  })

  // Métricas semanais — sparkline do hero + side metrics
  const { data: metrics = [] } = useQuery({
    queryKey: ['platform-metrics'],
    queryFn: fetchMetrics,
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000,
  })

  const latest = metrics[0]
  const previous = metrics[1]

  // Delta % semana vs semana anterior (usuários ativos como hero)
  const heroValue = latest?.active_users ?? stats?.users ?? 0
  const heroDelta =
    previous && previous.active_users > 0
      ? Math.round(((latest!.active_users - previous.active_users) / previous.active_users) * 100)
      : null
  const heroSparkline = metrics.map(m => m.active_users).reverse()

  // Alertas — derivados do estado real (sem mock)
  const alerts: DashboardAlert[] = []
  if (health) {
    if (health.supabase !== 'connected' && !health.demo) {
      alerts.push({
        id: 'db-down',
        level: 'warn',
        message: 'Banco de dados temporariamente indisponível',
        href: '/admin/observability',
      })
    }
    if (health.status === 'healthy' && health.supabase === 'connected') {
      alerts.push({
        id: 'all-ok',
        level: 'ok',
        message: 'Todos os serviços operacionais',
      })
    }
    if (health.demo) {
      alerts.push({
        id: 'demo',
        level: 'info',
        message: 'Plataforma em modo demo — dados de exemplo',
      })
    }
  }
  if (stats && stats.tickets > 10) {
    alerts.push({
      id: 'tickets-high',
      level: 'warn',
      message: `${stats.tickets} tickets em aberto — considere priorizar suporte`,
      href: '/support/tickets',
    })
  }

  // Cards laterais de métricas (admin/gestor) ou fallback KPIs gerais
  const sideMetrics =
    isAdmin && latest
      ? [
          {
            label: 'Usuários Ativos',
            value: latest.active_users,
            prev: previous?.active_users,
            spark: metrics.map(m => m.active_users).reverse(),
            color: 'var(--brand-primary)',
            icon: Users,
          },
          {
            label: 'Tickets Criados',
            value: latest.tickets_created,
            prev: previous?.tickets_created,
            spark: metrics.map(m => m.tickets_created).reverse(),
            color: 'var(--accent-purple)',
            icon: FileText,
          },
          {
            label: 'Tasks Concluídas',
            value: latest.tasks_completed,
            prev: previous?.tasks_completed,
            spark: metrics.map(m => m.tasks_completed).reverse(),
            color: 'var(--accent-emerald)',
            icon: Activity,
          },
        ]
      : stats
        ? [
            {
              label: 'Usuários',
              value: stats.users,
              prev: undefined,
              spark: [] as number[],
              color: 'var(--brand-primary)',
              icon: Users,
            },
            {
              label: 'Tasks',
              value: stats.tasks,
              prev: undefined,
              spark: [] as number[],
              color: 'var(--accent-purple)',
              icon: FileText,
            },
            {
              label: 'Tickets',
              value: stats.tickets,
              prev: undefined,
              spark: [] as number[],
              color: 'var(--accent-emerald)',
              icon: Activity,
            },
          ]
        : []

  return (
    <main className="page-enter ambient-gradient max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Notice de módulo desabilitado */}
      {disabledNotice && (
        <div
          role="status"
          className="relative z-10 flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm"
        >
          <span>
            O módulo <strong className="font-semibold">{disabledNotice}</strong> não está habilitado
            nesta instalação.
          </span>
          <button
            onClick={() => setDisabledNotice(null)}
            className="ml-auto text-amber-400 hover:text-amber-200 transition-colors"
            aria-label="Fechar aviso"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── HERO EDITORIAL ───────────────────────────────────────── */}
      <section
        aria-label="Visão geral"
        className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-6"
      >
        {/* Narrativa — col-span 3 */}
        <article className="lg:col-span-3 space-y-4">
          <p className="kicker">
            <span className="kicker-dot" aria-hidden="true" />
            {dateLabel}
          </p>
          <h1 className="editorial-title">
            {appName}
            {health?.demo && (
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 align-middle">
                Demo Mode
              </span>
            )}
          </h1>
          <p className="editorial-lede">
            {statsLoading
              ? 'Consolidando leituras da plataforma…'
              : heroDelta !== null
                ? `Movimento de ${heroDelta >= 0 ? 'crescimento' : 'retração'} em usuários ativos na última semana.`
                : 'Acompanhe em tempo real o pulso operacional do sistema.'}
          </p>

          {/* Big-num + delta */}
          <div className="flex items-end gap-4 pt-2">
            <span className="big-num" aria-label={`Total: ${heroValue}`}>
              <AnimatedValue value={heroValue} />
            </span>
            {heroDelta !== null && (
              <span
                className={`big-delta ${heroDelta >= 0 ? 'is-up' : 'is-down'}`}
                aria-label={`Variação ${heroDelta}%`}
              >
                {heroDelta >= 0 ? '▲' : '▼'} {Math.abs(heroDelta)}%
                <span className="opacity-60 text-[11px] font-normal ml-1">vs. semana anterior</span>
              </span>
            )}
          </div>

          {heroSparkline.length > 1 && (
            <div className="pt-4 opacity-80">
              <Sparkline values={heroSparkline} color="var(--brand-primary)" />
            </div>
          )}
        </article>

        {/* Painel de Alertas — col-span 2 */}
        <aside
          aria-label="Alertas operacionais"
          className="lg:col-span-2 glass-panel p-5 space-y-3 flex flex-col"
        >
          <header className="flex items-center justify-between pb-2 border-b border-[var(--glass-border)]">
            <h2 className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-secondary)]">
              Alertas
            </h2>
            <Link
              href="/dashboard/alertas"
              className="text-xs text-[var(--brand-primary)] hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          </header>
          {alerts.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-6 text-center">
              Sem alertas no momento.
            </p>
          ) : (
            <ul className="space-y-2 flex-1">
              {alerts.map(a => {
                const Icon =
                  a.level === 'ok' ? CheckCircle2 : a.level === 'warn' ? AlertTriangle : Info
                const color =
                  a.level === 'ok'
                    ? 'text-emerald-400'
                    : a.level === 'warn'
                      ? 'text-amber-400'
                      : 'text-sky-400'
                const body = (
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <Icon
                      size={16}
                      className={`flex-shrink-0 mt-0.5 ${color}`}
                      aria-hidden="true"
                    />
                    <span className="text-sm text-[var(--text-secondary)] leading-snug">
                      {a.message}
                    </span>
                  </div>
                )
                return (
                  <li key={a.id}>
                    {a.href ? (
                      <Link href={a.href} className="block">
                        {body}
                      </Link>
                    ) : (
                      body
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </aside>
      </section>

      {/* ── MÉTRICAS — 3 CARDS COMPACTOS ─────────────────────────── */}
      {sideMetrics.length > 0 && (
        <section aria-label="Métricas complementares" className="relative z-10">
          <h2 className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-secondary)] mb-3">
            Métricas
            {latest
              ? ` · ${intlFormat.dateTime(new Date(latest.week_start), { dateStyle: 'medium' })}`
              : ''}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {sideMetrics.map(m => {
              const MetricIcon = m.icon
              const delta = m.prev ? m.value - m.prev : 0
              const deltaPct = m.prev && m.prev > 0 ? Math.round((delta / m.prev) * 100) : 0
              return (
                <div key={m.label} className="glass-panel p-4 flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg flex-shrink-0"
                    style={{ background: `color-mix(in srgb, ${m.color} 12%, transparent)` }}
                  >
                    <MetricIcon size={16} style={{ color: m.color }} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold font-mono text-[var(--text-primary)] leading-tight">
                      <AnimatedValue value={m.value} />
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{m.label}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {deltaPct !== 0 && (
                      <span
                        className={`text-xs font-medium ${deltaPct > 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                      >
                        {deltaPct > 0 ? '+' : ''}
                        {deltaPct}%
                      </span>
                    )}
                    {m.spark.length > 1 && <Sparkline values={m.spark} color={m.color} />}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── SAÚDE DO SISTEMA ─────────────────────────────────────── */}
      <section aria-label="Status do sistema" className="relative z-10">
        <h2 className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-secondary)] mb-3">
          Saúde do Sistema
        </h2>
        <div className="glass-panel p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'API',
              status:
                health?.status === 'healthy'
                  ? 'Operacional'
                  : health
                    ? 'Indisponível'
                    : 'Verificando…',
              ok: health?.status === 'healthy',
            },
            {
              label: 'Banco de Dados',
              status:
                health?.supabase === 'connected'
                  ? 'Operacional'
                  : health?.demo
                    ? 'Modo Demo'
                    : health
                      ? 'Indisponível'
                      : 'Verificando…',
              ok: health?.supabase === 'connected' || health?.demo,
            },
            {
              label: 'Autenticação',
              status: health?.demo
                ? 'Modo Demo'
                : health?.status === 'healthy'
                  ? 'Operacional'
                  : health
                    ? 'Indisponível'
                    : 'Verificando…',
              ok: health?.demo || health?.status === 'healthy',
            },
          ].map(svc => (
            <div key={svc.label} className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">{svc.label}</span>
              <span className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${svc.ok ? 'bg-emerald-400' : 'bg-amber-400'}`}
                  aria-hidden="true"
                />
                <span className="text-xs text-[var(--text-muted)]">{svc.status}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
