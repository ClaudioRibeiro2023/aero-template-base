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

      {!isLoading && data?.by_pack && data.by_pack.length > 0 && (
        <section className="relative z-10 mt-4 glass-panel p-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Por Domain Pack</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <caption className="sr-only">Agregações por domain pack</caption>
              <thead>
                <tr className="border-b border-[var(--glass-border)] bg-white/[0.02]">
                  <th className="px-3 py-2 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Pack
                  </th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Sessoes
                  </th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Tool calls
                  </th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Fallbacks
                  </th>
                  <th className="px-3 py-2 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Latencia media
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.by_pack.map((row, idx) => (
                  <tr
                    key={row.pack_id ?? `__legacy__${idx}`}
                    className="border-b border-[var(--glass-border)]"
                  >
                    <td className="px-3 py-2 text-xs font-mono text-[var(--text-primary)]">
                      {row.pack_id ?? (
                        <span className="text-[var(--text-muted)] italic">legado</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-[var(--text-primary)]">
                      {row.sessions_count}
                    </td>
                    <td className="px-3 py-2 text-xs text-[var(--text-primary)]">
                      {row.tool_calls_count}
                    </td>
                    <td className="px-3 py-2 text-xs text-[var(--text-primary)]">
                      {row.fallback_count}
                    </td>
                    <td className="px-3 py-2 text-xs text-[var(--text-muted)]">
                      {row.avg_latency_ms != null ? `${row.avg_latency_ms} ms` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  )
}
