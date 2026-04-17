'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Filter, FileSearch } from 'lucide-react'
import { useFormatter } from 'next-intl'
import { useAdminAgentPendingActions } from '@/hooks/useAdminAgent'

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-400 bg-amber-400/10',
  confirmed: 'text-sky-400 bg-sky-400/10',
  cancelled: 'text-gray-300 bg-gray-400/10',
  expired: 'text-gray-400 bg-gray-500/10',
  executed: 'text-emerald-400 bg-emerald-400/10',
  failed: 'text-rose-400 bg-rose-400/10',
}

export default function AgentPendingActionsPage() {
  const [status, setStatus] = useState('')
  const [tool, setTool] = useState('')
  const [tenant, setTenant] = useState('')
  const [user, setUser] = useState('')
  const [page, setPage] = useState(1)
  const format = useFormatter()

  const { data, isLoading } = useAdminAgentPendingActions({
    status: status || undefined,
    tool: tool || undefined,
    tenant_id: tenant || undefined,
    user_id: user || undefined,
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
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Acoes pendentes</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Confirmacoes transacionais do agente
          </p>
        </div>
      </div>

      <div className="relative z-10 mb-4 glass-panel p-4 flex flex-wrap items-center gap-3">
        <Filter size={15} className="text-[var(--text-muted)]" aria-hidden="true" />
        <select
          aria-label="Filtrar por status"
          value={status}
          onChange={e => {
            setStatus(e.target.value)
            setPage(1)
          }}
          className="px-3 py-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-sm text-[var(--text-primary)] focus:outline-none"
        >
          <option value="">Todos status</option>
          <option value="pending">pending</option>
          <option value="confirmed">confirmed</option>
          <option value="cancelled">cancelled</option>
          <option value="expired">expired</option>
          <option value="executed">executed</option>
        </select>
        <input
          type="text"
          aria-label="Ferramenta"
          placeholder="ferramenta"
          value={tool}
          onChange={e => {
            setTool(e.target.value)
            setPage(1)
          }}
          className="min-w-[160px] px-3 py-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-sm text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-muted)]"
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
          className="min-w-[180px] px-3 py-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-sm text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-muted)]"
        />
        <input
          type="text"
          aria-label="Usuario"
          placeholder="user_id"
          value={user}
          onChange={e => {
            setUser(e.target.value)
            setPage(1)
          }}
          className="min-w-[180px] px-3 py-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-sm text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-muted)]"
        />
        {data && (
          <span className="text-xs text-[var(--text-muted)] ml-auto">{data.total} registros</span>
        )}
      </div>

      <div className="relative z-10 glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">Acoes pendentes</caption>
            <thead>
              <tr className="border-b border-[var(--glass-border)] bg-white/[0.02]">
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Ferramenta
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Descricao
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Impacto
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
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-[var(--text-muted)]"
                  >
                    Carregando...
                  </td>
                </tr>
              )}
              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <FileSearch
                        size={40}
                        className="text-[var(--text-muted)]"
                        aria-hidden="true"
                      />
                      <p className="text-sm font-medium text-[var(--text-secondary)]">
                        Nenhuma acao pendente
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {items.map(p => {
                const statusClass = STATUS_COLORS[p.status] ?? 'text-gray-300 bg-gray-400/10'
                return (
                  <tr
                    key={p.id}
                    className="border-b border-[var(--glass-border)] hover:bg-white/[0.015] transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)] whitespace-nowrap">
                      {format.dateTime(new Date(p.created_at), {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusClass}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-primary)] font-mono">
                      {p.tool_name}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-primary)] truncate max-w-[260px]">
                      {p.description}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)] truncate max-w-[200px]">
                      {p.impact}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)] font-mono">
                      <Link
                        href={`/admin/agent/sessions/${p.session_id}`}
                        className="hover:underline"
                      >
                        {p.session_id.slice(0, 8)}…
                      </Link>
                    </td>
                  </tr>
                )
              })}
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
