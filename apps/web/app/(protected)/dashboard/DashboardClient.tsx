'use client'

/**
 * DashboardClient — Componente interativo do dashboard.
 *
 * Separado do page.tsx (Server Component) para habilitar RSC + Suspense streaming.
 * Contém: KPI cards com count-up, mini chart com animação, quick actions.
 * Tudo que precisa de hooks de browser (useState, useEffect, useReducedMotion).
 *
 * Sprint 5 refactor: KPI cards e charts extraídos para sub-componentes.
 */
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  FileText,
  Settings,
  Activity,
  ArrowUpRight,
  BarChart3,
  Gauge,
  GripVertical,
} from 'lucide-react'
import { useFormatter } from 'next-intl'

import { DashboardKPICards, AnimatedValue, Sparkline, useWidgetOrder } from './DashboardKPICards'
import { DashboardCharts } from './DashboardCharts'

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

const SECTION_STORAGE_KEY = 'dashboard-section-order'

interface DashboardClientProps {
  appName: string
  dateLabel: string
}

export function DashboardClient({ appName, dateLabel }: DashboardClientProps) {
  const loading = false
  const { hasRole } = useAuth()
  const intlFormat = useFormatter()
  const isAdmin = hasRole('ADMIN') || hasRole('GESTOR')

  // Platform metrics — only for admin/gestor
  const { data: metrics = [] } = useQuery({
    queryKey: ['platform-metrics'],
    queryFn: fetchMetrics,
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000,
  })

  const latestMetric = metrics[0]
  const previousMetric = metrics[1]

  // Drag-and-drop section ordering (bottom sections)
  const DEFAULT_SECTIONS = ['chart-actions', 'status-activity'] as const
  const { order: sectionOrder, saveOrder: saveSectionOrder } = useWidgetOrder(
    [...DEFAULT_SECTIONS],
    SECTION_STORAGE_KEY
  )
  const sectionDragRef = useRef<number | null>(null)
  const [sectionDragOver, setSectionDragOver] = useState<number | null>(null)
  const [sectionFocused, setSectionFocused] = useState<number | null>(null)

  // Section DnD handlers
  function handleSectionDragStart(index: number) {
    sectionDragRef.current = index
  }

  function handleSectionDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    setSectionDragOver(index)
  }

  function handleSectionDrop(index: number) {
    const from = sectionDragRef.current
    if (from === null || from === index) {
      sectionDragRef.current = null
      setSectionDragOver(null)
      return
    }
    const newOrder = [...sectionOrder]
    const [moved] = newOrder.splice(from, 1)
    newOrder.splice(index, 0, moved)
    saveSectionOrder(newOrder)
    sectionDragRef.current = null
    setSectionDragOver(null)
  }

  function handleSectionDragEnd() {
    sectionDragRef.current = null
    setSectionDragOver(null)
  }

  function handleSectionKeyDown(e: React.KeyboardEvent, index: number) {
    const len = sectionOrder.length
    if (e.key === 'Escape') {
      e.preventDefault()
      ;(e.currentTarget as HTMLElement).blur()
      return
    }
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const newOrder = [...sectionOrder]
    let targetIndex = index
    if (e.key === 'ArrowUp') targetIndex = Math.max(0, index - 1)
    else if (e.key === 'ArrowDown') targetIndex = Math.min(len - 1, index + 1)
    else if (e.key === 'Home') targetIndex = 0
    else if (e.key === 'End') targetIndex = len - 1
    if (targetIndex === index) return
    const [moved] = newOrder.splice(index, 1)
    newOrder.splice(targetIndex, 0, moved)
    saveSectionOrder(newOrder)
    setSectionFocused(targetIndex)
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
      <DashboardKPICards cards={KPI_CARDS} loading={loading} />

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
                  {intlFormat.dateTime(new Date(latestMetric.week_start), { dateStyle: 'medium' })}
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

      {/* Reorderable Sections */}
      <div className="relative z-10 space-y-4">
        {sectionOrder.map((sectionId, sIdx) => (
          <div
            key={sectionId}
            data-section-id={sectionId}
            draggable
            tabIndex={0}
            role="listitem"
            aria-label={`Seção ${sectionId === 'chart-actions' ? 'Gráfico e Ações' : 'Status e Atividade'}, posição ${sIdx + 1} de ${sectionOrder.length}. Use setas para mover.`}
            onDragStart={() => handleSectionDragStart(sIdx)}
            onDragOver={e => handleSectionDragOver(e, sIdx)}
            onDrop={() => handleSectionDrop(sIdx)}
            onDragEnd={handleSectionDragEnd}
            onFocus={() => setSectionFocused(sIdx)}
            onBlur={() => setSectionFocused(null)}
            onKeyDown={e => handleSectionKeyDown(e, sIdx)}
            className="group/section relative"
            style={{
              opacity: sectionDragRef.current === sIdx ? 0.5 : 1,
              outline:
                sectionFocused === sIdx
                  ? '2px solid var(--brand-primary)'
                  : sectionDragOver === sIdx
                    ? '2px dashed var(--brand-primary)'
                    : undefined,
              borderRadius: 'var(--radius-lg)',
            }}
          >
            {/* Section drag handle */}
            <div
              className="absolute top-3 right-3 z-10 opacity-0 group-hover/section:opacity-60 transition-opacity cursor-grab active:cursor-grabbing"
              aria-hidden="true"
            >
              <GripVertical size={14} className="text-[var(--text-muted)]" />
            </div>

            {sectionId === 'chart-actions' && (
              <DashboardCharts loading={loading} quickActions={QUICK_ACTIONS} />
            )}

            {sectionId === 'status-activity' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* System Status */}
                <div className="glass-panel p-6">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
                    Status do Sistema
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'API', status: 'Operacional', color: 'bg-emerald-400' },
                      {
                        label: 'Banco de Dados',
                        status: 'Operacional',
                        color: 'bg-emerald-400',
                      },
                      {
                        label: 'Autenticação',
                        status: 'Operacional',
                        color: 'bg-emerald-400',
                      },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-sm text-[var(--text-secondary)]">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${item.color}`}
                            aria-hidden="true"
                          />
                          <span className="text-xs text-[var(--text-muted)]">{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2 glass-panel p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      Atividade Recente
                    </h3>
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
                            <ItemIcon
                              size={14}
                              className="text-[var(--text-muted)]"
                              aria-hidden="true"
                            />
                          </div>
                          <p className="flex-1 text-sm text-[var(--text-secondary)]">
                            {item.action}
                          </p>
                          <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                            {item.time}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <p className="text-[11px] text-[var(--text-muted)] text-right">
          Arraste seções para reordenar
        </p>
      </div>
    </main>
  )
}
