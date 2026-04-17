'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Filter, FileSearch } from 'lucide-react'
import { useFormatter } from 'next-intl'
import { useAdminAgentToolLogs, useAdminAgentPacks } from '@/hooks/useAdminAgent'

export default function AgentToolLogsPage() {
  const [tool, setTool] = useState('')
  const [status, setStatus] = useState<'' | 'success' | 'fail'>('')
  const [tenant, setTenant] = useState('')
  const [user, setUser] = useState('')
  const [packFilter, setPackFilter] = useState('')
  const [page, setPage] = useState(1)
  const format = useFormatter()

  const { data: packsData } = useAdminAgentPacks()
  const { data, isLoading } = useAdminAgentToolLogs({
    tool: tool || undefined,
    status: status || undefined,
    tenant_id: tenant || undefined,
    user_id: user || undefined,
    domain_pack_id: packFilter || undefined,
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
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Tool Logs</h1>
          <p className="text-sm text-[var(--text-secondary)]">Chamadas de ferramentas do agente</p>
        </div>
      </div>

      <div className="relative z-10 mb-4 glass-panel p-4 flex flex-wrap items-center gap-3">
        <Filter size={15} className="text-[var(--text-muted)]" aria-hidden="true" />
        <input
          type="text"
          aria-label="Filtrar por ferramenta"
          placeholder="nome da ferramenta"
          value={tool}
          onChange={e => {
            setTool(e.target.value)
            setPage(1)
          }}
          className="min-w-[180px] px-3 py-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-sm text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-muted)]"
        />
        <select
          aria-label="Filtrar por status"
          value={status}
          onChange={e => {
            setStatus(e.target.value as '' | 'success' | 'fail')
            setPage(1)
          }}
          className="px-3 py-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-sm text-[var(--text-primary)] focus:outline-none"
        >
          <option value="">Todos status</option>
          <option value="success">success</option>
          <option value="fail">fail</option>
        </select>
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
        <select
          aria-label="Filtrar por domain pack"
          value={packFilter}
          onChange={e => {
            setPackFilter(e.target.value)
            setPage(1)
          }}
          className="px-3 py-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-sm text-[var(--text-primary)] focus:outline-none"
        >
          <option value="">Todos packs</option>
          {packsData?.items.map(p => (
            <option key={p.id} value={p.id}>
              {p.display_name} ({p.id})
            </option>
          ))}
        </select>
        {data && (
          <span className="text-xs text-[var(--text-muted)] ml-auto">{data.total} registros</span>
        )}
      </div>

      <div className="relative z-10 glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">Tool logs</caption>
            <thead>
              <tr className="border-b border-[var(--glass-border)] bg-white/[0.02]">
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Ferramenta
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Pack
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Latencia
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Erro
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Payload
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-[var(--text-muted)]"
                  >
                    Carregando...
                  </td>
                </tr>
              )}
              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <FileSearch
                        size={40}
                        className="text-[var(--text-muted)]"
                        aria-hidden="true"
                      />
                      <p className="text-sm font-medium text-[var(--text-secondary)]">
                        Nenhum log encontrado
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {items.map(t => (
                <tr
                  key={t.id}
                  className="border-b border-[var(--glass-border)] hover:bg-white/[0.015] transition-colors"
                >
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)] whitespace-nowrap">
                    {format.dateTime(new Date(t.created_at), {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-primary)] font-mono truncate max-w-[200px]">
                    {t.tool_name}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {t.domain_pack_id ? (
                      <span className="inline-block px-2 py-0.5 rounded bg-sky-400/10 text-sky-300 font-mono text-[10px]">
                        {t.domain_pack_id}
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        t.success
                          ? 'text-emerald-400 bg-emerald-400/10'
                          : 'text-rose-400 bg-rose-400/10'
                      }`}
                    >
                      {t.success ? 'success' : 'fail'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                    {t.latency_ms != null ? `${t.latency_ms}ms` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-rose-300 truncate max-w-[220px]">
                    {t.error_msg ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                    <details>
                      <summary className="cursor-pointer">ver</summary>
                      <pre className="mt-1 max-h-52 overflow-auto text-[10px] font-mono whitespace-pre-wrap break-all text-[var(--text-primary)]">
                        {JSON.stringify({ input: t.input, output: t.output }, null, 2)}
                      </pre>
                    </details>
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
