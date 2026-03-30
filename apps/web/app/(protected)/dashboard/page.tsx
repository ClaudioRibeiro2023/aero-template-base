'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  FileText,
  Settings,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

// ── KPI Mock Data (substituir por queries Supabase em produção) ──
const KPI_CARDS = [
  {
    key: 'usuarios',
    label: 'Usuários',
    icon: Users,
    value: '48',
    change: '+12%',
    up: true,
    path: '/admin/usuarios',
  },
  {
    key: 'relatorios',
    label: 'Relatórios',
    icon: FileText,
    value: '134',
    change: '+5%',
    up: true,
    path: '/relatorios',
  },
  {
    key: 'atividade',
    label: 'Atividade',
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

// ── Quick Actions ──
const QUICK_ACTIONS = [
  { label: 'Novo Usuário', path: '/admin/usuarios', description: 'Criar conta de usuário' },
  { label: 'Relatório', path: '/relatorios', description: 'Gerar relatório' },
  { label: 'Configurações', path: '/admin/config', description: 'Ajustar sistema' },
]

// ── Animated count-up hook (rAF, ease-out cubic) ──
function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const startTime = performance.now()

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration])

  return count
}

function AnimatedValue({ value, suffix = '' }: { value: number; suffix?: string }) {
  const count = useCountUp(value)
  return (
    <>
      {count}
      {suffix}
    </>
  )
}

// ── Skeleton component ──
function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded bg-[var(--surface-base)] ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

// ── KPI Card ──
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
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-raised)] p-5 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    )
  }

  return (
    <Link
      href={path}
      className="group block rounded-xl border border-[var(--border-default)] bg-[var(--surface-raised)] p-5 transition-all duration-200 hover:border-[var(--brand-primary)]/40 hover:shadow-lg hover:shadow-[var(--brand-primary)]/5 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg bg-[var(--brand-primary)]/10">
          <Icon size={18} className="text-[var(--brand-primary)]" />
        </div>
        <span
          className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${
            up
              ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
              : 'text-red-500 bg-red-50 dark:bg-red-900/20'
          }`}
        >
          {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {change}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">
        {(() => {
          const hasSuffix = value.endsWith('%')
          const num = parseInt(value.replace('%', ''), 10)
          return isNaN(num) ? value : <AnimatedValue value={num} suffix={hasSuffix ? '%' : ''} />
        })()}
      </p>
      <p className="mt-0.5 text-sm text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
        {label}
      </p>
    </Link>
  )
}

// ── Mini Bar Chart (pure CSS, sem dependência) ──
const CHART_DATA = [
  { label: 'Jan', pct: 65 },
  { label: 'Fev', pct: 45 },
  { label: 'Mar', pct: 80 },
  { label: 'Abr', pct: 55 },
  { label: 'Mai', pct: 70 },
  { label: 'Jun', pct: 90 },
]

function MiniBarChart() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex items-end gap-4 h-32">
      {CHART_DATA.map((d, index) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
          <div
            className="w-full rounded-t bg-[var(--brand-primary)] hover:opacity-80 transition-all duration-700 ease-out cursor-default"
            style={{ height: mounted ? `${d.pct}%` : '0%', transitionDelay: `${index * 100}ms` }}
            title={`${d.label}: ${d.pct}%`}
          />
          <span className="text-[10px] font-medium text-[var(--text-muted)]">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Page ──
export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Template Platform'

  // Simula carregamento (em produção: buscar do Supabase)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="page-enter max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{appName}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Visão geral do sistema —{' '}
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* KPI Grid */}
      <section aria-label="Indicadores principais">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {KPI_CARDS.map(({ key, ...card }) => (
            <KpiCard key={key} {...card} loading={loading} />
          ))}
        </div>
      </section>

      {/* Charts + Quick Actions row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart card */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--border-default)] bg-[var(--surface-raised)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Atividade Mensal</h2>
              <p className="text-xs text-[var(--text-muted)]">Últimos 6 meses</p>
            </div>
            <TrendingUp size={16} className="text-[var(--brand-primary)]" />
          </div>
          {loading ? (
            <div className="h-24 flex items-end gap-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="flex-1" style={{ height: `${40 + i * 10}%` }} />
              ))}
            </div>
          ) : (
            <MiniBarChart />
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-raised)] p-5">
          <h2 className="text-sm font-semibold mb-4">Ações Rápidas</h2>
          <div className="space-y-2">
            {QUICK_ACTIONS.map(action => (
              <Link
                key={action.path}
                href={action.path}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--surface-base)] transition-colors group"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium group-hover:text-[var(--brand-primary)] transition-colors">
                    {action.label}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{action.description}</p>
                </div>
                <ArrowUpRight
                  size={14}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity ml-auto"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
