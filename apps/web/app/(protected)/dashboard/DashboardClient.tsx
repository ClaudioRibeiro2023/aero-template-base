'use client'

/**
 * DashboardClient — Componente interativo do dashboard.
 *
 * Separado do page.tsx (Server Component) para habilitar RSC + Suspense streaming.
 * Contém: KPI cards com count-up, mini chart com animação, quick actions.
 * Tudo que precisa de hooks de browser (useState, useEffect, useReducedMotion).
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useReducedMotion } from '@/hooks/useA11y'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  FileText,
  Settings,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Zap,
  Gauge,
  GripVertical,
} from 'lucide-react'

// ── KPI Mock Data ──
const KPI_CARDS = [
  {
    key: 'usuarios',
    label: 'Usuários Ativos',
    icon: Users,
    value: '48',
    change: '+12%',
    up: true,
    path: '/admin/usuarios',
  },
  {
    key: 'relatorios',
    label: 'Relatórios Gerados',
    icon: FileText,
    value: '134',
    change: '+5%',
    up: true,
    path: '/relatorios',
  },
  {
    key: 'atividade',
    label: 'Taxa de Atividade',
    icon: Activity,
    value: '92%',
    change: '-2%',
    up: false,
    path: '/dashboard/analytics',
  },
  {
    key: 'config',
    label: 'Config Items',
    icon: Settings,
    value: '17',
    change: '0%',
    up: true,
    path: '/admin/config',
  },
]

const QUICK_ACTIONS = [
  {
    label: 'Novo Usuário',
    path: '/admin/usuarios',
    description: 'Criar conta de usuário',
    icon: Users,
  },
  {
    label: 'Gerar Relatório',
    path: '/relatorios',
    description: 'Criar análise personalizada',
    icon: BarChart3,
  },
  { label: 'Configurações', path: '/admin/config', description: 'Ajustar sistema', icon: Settings },
]

const CHART_DATA = [
  { label: 'Jan', pct: 65 },
  { label: 'Fev', pct: 45 },
  { label: 'Mar', pct: 80 },
  { label: 'Abr', pct: 55 },
  { label: 'Mai', pct: 70 },
  { label: 'Jun', pct: 90 },
]

// ── Platform Metrics (admin/gestor only) ──
interface PlatformMetric {
  id: string
  week_start: string
  active_users: number
  tickets_created: number
  tasks_completed: number
}

async function fetchMetrics(): Promise<PlatformMetric[]> {
  const res = await fetch('/api/platform/metrics')
  if (!res.ok) return []
  const json = await res.json()
  return json.data?.metrics ?? []
}

// ── Animated count-up hook (rAF, expo ease-out — respects reduced-motion) ──
function useCountUp(target: number, duration = 800, skipAnimation = false) {
  const [count, setCount] = useState(skipAnimation ? target : 0)

  useEffect(() => {
    if (skipAnimation) {
      setCount(target)
      return
    }

    const startTime = performance.now()

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [target, duration, skipAnimation])

  return count
}

function AnimatedValue({ value, suffix = '' }: { value: number; suffix?: string }) {
  const prefersReduced = useReducedMotion()
  const count = useCountUp(value, 800, prefersReduced)
  return (
    <>
      {count}
      {suffix}
    </>
  )
}

function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`shimmer rounded-lg ${className}`} style={style} aria-hidden="true" />
}

function KpiCard({
  label,
  icon: Icon,
  value,
  change,
  up,
  path,
  loading,
}: {
  label: string
  icon: React.ElementType
  value: string
  change: string
  up: boolean
  path: string
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="glass-panel p-5 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    )
  }

  return (
    <Link
      href={path}
      className="group relative block glass-panel p-5 transition-all duration-300 hover:-translate-y-[2px] hover:border-[var(--glass-border-hover)] hover:shadow-lg"
    >
      <div
        className="absolute inset-0 rounded-[var(--radius-lg)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: '0 0 24px var(--glow-brand)' }}
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between">
        <div className="p-2.5 rounded-xl bg-[var(--brand-primary)]/10 backdrop-blur-sm">
          <Icon size={20} className="text-[var(--brand-primary)]" aria-hidden="true" />
        </div>
        <span
          className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm ${
            up ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
          }`}
        >
          {up ? (
            <ArrowUpRight size={12} aria-hidden="true" />
          ) : (
            <ArrowDownRight size={12} aria-hidden="true" />
          )}
          {change}
        </span>
      </div>
      <p className="relative mt-4 text-2xl font-bold font-mono tracking-tight text-[var(--text-primary)]">
        {(() => {
          const hasSuffix = value.endsWith('%')
          const num = parseInt(value.replace('%', ''), 10)
          return isNaN(num) ? value : <AnimatedValue value={num} suffix={hasSuffix ? '%' : ''} />
        })()}
      </p>
      <p className="relative mt-1 text-sm text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
        {label}
      </p>
    </Link>
  )
}

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

function Sparkline({
  values,
  color = 'var(--brand-primary)',
}: {
  values: number[]
  color?: string
}) {
  if (values.length < 2) return null
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const w = 64,
    h = 24,
    pad = 2
  const points = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - pad * 2)
      const y = h - pad - ((v - min) / range) * (h - pad * 2)
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg width={w} height={h} aria-hidden="true" className="opacity-70">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface DashboardClientProps {
  appName: string
  dateLabel: string
}

const STORAGE_KEY = 'dashboard-widget-order'

function useWidgetOrder(defaultKeys: string[]) {
  const [order, setOrder] = useState<string[]>(defaultKeys)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed: string[] = JSON.parse(saved)
        // Only restore if saved keys match current keys
        if (parsed.length === defaultKeys.length && parsed.every(k => defaultKeys.includes(k))) {
          setOrder(parsed)
        }
      }
    } catch {
      // ignore
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const saveOrder = useCallback((newOrder: string[]) => {
    setOrder(newOrder)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder))
    } catch {
      // ignore
    }
  }, [])

  return { order, saveOrder }
}

export function DashboardClient({ appName, dateLabel }: DashboardClientProps) {
  // Data is static (KPI_CARDS, CHART_DATA, QUICK_ACTIONS are constants) — no loading needed
  const loading = false
  const { hasRole } = useAuth()
  const isAdmin = hasRole('ADMIN') || hasRole('GESTOR')

  // Platform metrics — only for admin/gestor
  const { data: metrics = [] } = useQuery({
    queryKey: ['platform-metrics'],
    queryFn: fetchMetrics,
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000, // 5 min
  })

  const latestMetric = metrics[0]
  const previousMetric = metrics[1]

  // Drag-and-drop widget ordering
  const { order, saveOrder } = useWidgetOrder(KPI_CARDS.map(c => c.key))
  const orderedCards = order.map(key => KPI_CARDS.find(c => c.key === key)!).filter(Boolean)
  const dragIndexRef = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  function handleDragStart(index: number) {
    dragIndexRef.current = index
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    setDragOver(index)
  }

  function handleDrop(index: number) {
    const from = dragIndexRef.current
    if (from === null || from === index) {
      dragIndexRef.current = null
      setDragOver(null)
      return
    }
    const newOrder = [...order]
    const [moved] = newOrder.splice(from, 1)
    newOrder.splice(index, 0, moved)
    saveOrder(newOrder)
    dragIndexRef.current = null
    setDragOver(null)
  }

  function handleDragEnd() {
    dragIndexRef.current = null
    setDragOver(null)
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    const len = orderedCards.length
    if (e.key === 'Escape') {
      e.preventDefault()
      ;(e.currentTarget as HTMLElement).blur()
      return
    }
    if (!['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const newOrder = [...order]
    let targetIndex = index
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      targetIndex = Math.max(0, index - 1)
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      targetIndex = Math.min(len - 1, index + 1)
    } else if (e.key === 'Home') {
      targetIndex = 0
    } else if (e.key === 'End') {
      targetIndex = len - 1
    }
    if (targetIndex === index) return
    const [moved] = newOrder.splice(index, 1)
    newOrder.splice(targetIndex, 0, moved)
    saveOrder(newOrder)
    setFocusedIndex(targetIndex)
  }

  return (
    <main className="page-enter ambient-gradient max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="relative z-10">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{appName}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Visão geral do sistema — {dateLabel}
        </p>
      </div>

      {/* Bento Grid — KPI Cards (draggable) */}
      <section aria-label="Indicadores principais" className="relative z-10">
        <div
          role="list"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger-children"
        >
          {orderedCards.map(({ key, ...card }, index) => (
            <div
              key={key}
              role="listitem"
              tabIndex={0}
              draggable
              aria-label={`${card.label}, posição ${index + 1} de ${orderedCards.length}. Use as teclas de seta para mover.`}
              onDragStart={() => handleDragStart(index)}
              onDragOver={e => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              onKeyDown={e => handleKeyDown(e, index)}
              className="group/drag relative"
              style={{
                opacity: dragIndexRef.current === index ? 0.5 : 1,
                outline:
                  focusedIndex === index
                    ? '2px solid var(--brand-primary)'
                    : dragOver === index
                      ? '2px dashed var(--brand-primary)'
                      : undefined,
                borderRadius: 'var(--radius-lg)',
              }}
            >
              {/* Drag handle */}
              <div
                className="absolute top-2 right-2 z-10 opacity-0 group-hover/drag:opacity-60 transition-opacity cursor-grab active:cursor-grabbing"
                aria-hidden="true"
              >
                <GripVertical size={14} className="text-[var(--text-muted)]" />
              </div>
              <KpiCard {...card} loading={loading} />
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-[var(--text-muted)] text-right">
          Arraste para reordenar
        </p>
      </section>

      {/* Platform Metrics — admin/gestor only */}
      {isAdmin && latestMetric && (
        <section aria-label="Métricas da semana" className="relative z-10">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Métricas da Semana
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Semana de {new Date(latestMetric.week_start).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[var(--accent-purple)]/10" aria-hidden="true">
                <Gauge size={16} className="text-[var(--accent-purple)]" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: 'Usuários Ativos',
                  value: latestMetric.active_users,
                  prev: previousMetric?.active_users,
                  icon: Users,
                  sparkValues: metrics.map(m => m.active_users).reverse(),
                  sparkColor: 'var(--brand-primary)',
                },
                {
                  label: 'Tickets Criados',
                  value: latestMetric.tickets_created,
                  prev: previousMetric?.tickets_created,
                  icon: FileText,
                  sparkValues: metrics.map(m => m.tickets_created).reverse(),
                  sparkColor: 'var(--accent-purple)',
                },
                {
                  label: 'Tasks Concluídas',
                  value: latestMetric.tasks_completed,
                  prev: previousMetric?.tasks_completed,
                  icon: Activity,
                  sparkValues: metrics.map(m => m.tasks_completed).reverse(),
                  sparkColor: 'var(--accent-purple)',
                },
              ].map(metric => {
                const MetricIcon = metric.icon
                const delta = metric.prev ? metric.value - metric.prev : 0
                const deltaPct =
                  metric.prev && metric.prev > 0 ? Math.round((delta / metric.prev) * 100) : 0
                return (
                  <div
                    key={metric.label}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]"
                  >
                    <div className="p-2 rounded-lg bg-[var(--brand-primary)]/10 flex-shrink-0">
                      <MetricIcon
                        size={16}
                        className="text-[var(--brand-primary)]"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-bold font-mono text-[var(--text-primary)]">
                        <AnimatedValue value={metric.value} />
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{metric.label}</p>
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
                      <Sparkline values={metric.sparkValues} color={metric.sparkColor} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Bento Grid — Charts + Quick Actions */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-4">
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
            {QUICK_ACTIONS.map(action => {
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
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {action.description}
                    </p>
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

      {/* Bottom Bento Row — Status + Activity */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* System Status */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
            Status do Sistema
          </h3>
          <div className="space-y-3">
            {[
              { label: 'API', status: 'Operacional', color: 'bg-emerald-400' },
              { label: 'Banco de Dados', status: 'Operacional', color: 'bg-emerald-400' },
              { label: 'Autenticação', status: 'Operacional', color: 'bg-emerald-400' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} aria-hidden="true" />
                  <span className="text-xs text-[var(--text-muted)]">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Atividade Recente</h3>
            <Link
              href="/dashboard/analytics"
              className="text-xs text-[var(--brand-primary)] hover:underline flex items-center gap-1"
            >
              Ver tudo <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { action: 'Novo usuário cadastrado', time: 'Há 5 min', icon: Users },
              { action: 'Relatório exportado', time: 'Há 12 min', icon: FileText },
              { action: 'Configuração atualizada', time: 'Há 1h', icon: Settings },
              { action: 'Login do administrador', time: 'Há 2h', icon: Activity },
            ].map((item, i) => {
              const ItemIcon = item.icon
              return (
                <div key={i} className="flex items-center gap-3 py-1">
                  <div className="p-1.5 rounded-lg bg-white/[0.03]">
                    <ItemIcon size={14} className="text-[var(--text-muted)]" aria-hidden="true" />
                  </div>
                  <p className="flex-1 text-sm text-[var(--text-secondary)]">{item.action}</p>
                  <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                    {item.time}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
