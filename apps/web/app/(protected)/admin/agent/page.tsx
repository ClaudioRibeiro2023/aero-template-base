'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  Activity,
  MessageSquare,
  Wrench,
  Clock,
  AlertTriangle,
  Gauge,
} from 'lucide-react'
import { useAdminAgentMetrics } from '@/hooks/useAdminAgent'

type Period = '7d' | '30d' | 'all'

function MetricCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string
  value: string | number
  icon: typeof Activity
  href?: string
}) {
  const body = (
    <div className="glass-panel p-4 h-full hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-[var(--text-muted)]" aria-hidden="true" />
        <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      </div>
      <div className="text-2xl font-bold text-[var(--text-primary)]">{value}</div>
    </div>
  )
  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  )
}

export default function AgentAdminPage() {
  const [period, setPeriod] = useState<Period>('7d')
  const { data, isLoading } = useAdminAgentMetrics(period)

  return (
    <main className="page-enter ambient-gradient max-w-5xl mx-auto p-4 sm:p-8">
      <div className="relative z-10 mb-6 flex items-center gap-3">
        <Link
          href="/admin"
          className="p-1.5 rounded-xl hover:bg-white/[0.03] transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} className="text-[var(--text-muted)]" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Agente — Observabilidade</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Panorama de sessoes, ferramentas e degradacoes
          </p>
        </div>
      </div>

      <div className="relative z-10 mb-4 glass-panel p-4 flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Periodo</span>
        {(['7d', '30d', 'all'] as const).map(p => (
          <button
            type="button"
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
              period === p
                ? 'border-sky-400/60 bg-sky-400/10 text-sky-200'
                : 'border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-white/[0.03]'
            }`}
          >
            {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : 'Todo periodo'}
          </button>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard
          label="Sessoes"
          value={isLoading ? '—' : (data?.sessions_total ?? 0)}
          icon={Activity}
          href="/admin/agent/sessions"
        />
        <MetricCard
          label="Mensagens"
          value={isLoading ? '—' : (data?.messages_total ?? 0)}
          icon={MessageSquare}
        />
        <MetricCard
          label="Tool Calls"
          value={isLoading ? '—' : (data?.tool_calls_total ?? 0)}
          icon={Wrench}
          href="/admin/agent/tool-logs"
        />
        <MetricCard
          label="Pendentes"
          value={isLoading ? '—' : (data?.pending_actions_total ?? 0)}
          icon={Clock}
          href="/admin/agent/pending-actions"
        />
        <MetricCard
          label="Degradacoes"
          value={isLoading ? '—' : (data?.degraded_total ?? 0)}
          icon={AlertTriangle}
          href="/admin/agent/degradations"
        />
        <MetricCard
          label="Latencia p95"
          value={isLoading ? '—' : `${data?.latency_p95_ms ?? 0} ms`}
          icon={Gauge}
        />
      </div>

      {!isLoading && data && (
        <div className="relative z-10 mt-4 glass-panel p-4 text-xs text-[var(--text-muted)]">
          Latencia media:{' '}
          <span className="text-[var(--text-primary)]">{data.latency_avg_ms} ms</span>
          {' · '}p95: <span className="text-[var(--text-primary)]">{data.latency_p95_ms} ms</span>
        </div>
      )}
    </main>
  )
}
