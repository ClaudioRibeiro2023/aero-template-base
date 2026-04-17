'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Filter, FileSearch, AlertTriangle } from 'lucide-react'
import { useFormatter } from 'next-intl'
import { useAdminAgentDegradations } from '@/hooks/useAdminAgent'

export default function AgentDegradationsPage() {
  const [tool, setTool] = useState('')
  const [tenant, setTenant] = useState('')
  const [page, setPage] = useState(1)
  const format = useFormatter()

  const { data, isLoading } = useAdminAgentDegradations({
    tool: tool || undefined,
    tenant_id: tenant || undefined,
    page,
    page_size: 50,
  })

  const items = data?.items ?? []
  const totalPages = data?.total_pages ?? 1

  return (
    <main className="page-enter ambient-gradient max-w-6xl mx-auto p-4 sm:p-8">
      <div className="relative z-10 mb-6 flex items-center gap-3">
        <Link
          href="/admin/agent"
          className="p-1.5 rounded-xl hover:bg-white/[0.03] transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} className="text-[var(--text-muted)]" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Degradacoes</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Falhas e sinais de degradacao do agente
          </p>
        </div>
      </div>

      <div className="relative z-10 mb-4 glass-panel p-4 flex flex-wrap items-center gap-3">
        <Filter size={15} className="text-[var(--text-muted)]" aria-hidden="true" />
        <input
          type="text"
          aria-label="Ferramenta"
          placeholder="ferramenta"
          value={tool}
          onChange={e => {
            setTool(e.target.value)
            setPage(1)
          }}
          className="min-w-[180px] px-3 py-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-sm text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-muted)]"
        />
        <input
          type="text"
          aria-label="Tenant"
          placeholder="tenant_id"
          value={tenant}
          onChange={e => {
            setTenant(e.target.value)
            setPage(1)
          }}
          className="min-w-[200px] px-3 py-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-sm text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-muted)]"
        />
        {data && (
          <span className="text-xs text-[var(--text-muted)] ml-auto">{data.total} registros</span>
        )}
      </div>

      <div className="relative z-10 glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">Degradacoes</caption>
            <thead>
              <tr className="border-b border-[var(--glass-border)] bg-white/[0.02]">
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Ferramenta
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Motivo
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Latencia
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Sessao
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-[var(--text-muted)]"
                  >
                    Carregando...
                  </td>
                </tr>
              )}
              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <FileSearch
                        size={40}
                        className="text-[var(--text-muted)]"
                        aria-hidden="true"
                      />
                      <p className="text-sm font-medium text-[var(--text-secondary)]">
                        Nenhuma degradacao registrada
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {items.map(d => (
                <tr
                  key={d.id}
                  className="border-b border-[var(--glass-border)] hover:bg-white/[0.015] transition-colors"
                >
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)] whitespace-nowrap">
                    {format.dateTime(new Date(d.created_at), {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-primary)] font-mono">
                    {d.tool_name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2 text-xs text-rose-300">
                      <AlertTriangle size={13} className="mt-0.5" aria-hidden="true" />
                      <span className="truncate max-w-[340px]">{d.reason}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                    {d.latency_ms != null ? `${d.latency_ms}ms` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)] font-mono">
                    {d.session_id ? (
                      <Link
                        href={`/admin/agent/sessions/${d.session_id}`}
                        className="hover:underline"
                      >
                        {d.session_id.slice(0, 8)}…
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--glass-border)]">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--glass-border)] text-sm text-[var(--text-secondary)] disabled:opacity-40 hover:bg-white/[0.03] transition-all"
            >
              <ChevronLeft size={14} aria-hidden="true" /> Anterior
            </button>
            <span className="text-xs text-[var(--text-muted)]">
              Pagina {page} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--glass-border)] text-sm text-[var(--text-secondary)] disabled:opacity-40 hover:bg-white/[0.03] transition-all"
            >
              Proxima <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
