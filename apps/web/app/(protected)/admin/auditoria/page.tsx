'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { useAuditLogs, type AuditLog } from '@/hooks/useAuditLogs'

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'text-emerald-400 bg-emerald-400/10',
  UPDATE: 'text-sky-400 bg-sky-400/10',
  DELETE: 'text-rose-400 bg-rose-400/10',
  READ: 'text-gray-400 bg-gray-400/10',
  LOGIN: 'text-violet-400 bg-violet-400/10',
  LOGOUT: 'text-orange-400 bg-orange-400/10',
}

function AuditRow({ log }: { log: AuditLog }) {
  const actionClass = ACTION_COLORS[log.action] ?? 'text-gray-400 bg-gray-400/10'
  const date = new Date(log.created_at).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <tr className="border-b border-[var(--glass-border)] hover:bg-white/[0.015] transition-colors">
      <td className="px-4 py-3 text-xs text-[var(--text-muted)] whitespace-nowrap">{date}</td>
      <td className="px-4 py-3">
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${actionClass}`}>
          {log.action}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-[var(--text-primary)] font-mono truncate max-w-[180px]">
        {log.resource}
      </td>
      <td className="px-4 py-3 text-xs text-[var(--text-muted)] truncate max-w-[120px]">
        {log.resource_id ?? '—'}
      </td>
      <td className="px-4 py-3 text-xs text-[var(--text-muted)] truncate max-w-[160px]">
        {log.user_id.slice(0, 8)}…
      </td>
      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
        {log.details ? (
          <span className="font-mono">{JSON.stringify(log.details).slice(0, 60)}</span>
        ) : (
          '—'
        )}
      </td>
    </tr>
  )
}

export default function AuditoriaPage() {
  const [action, setAction] = useState('')
  const [resource, setResource] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useAuditLogs({
    action: action || undefined,
    resource: resource || undefined,
    page,
    page_size: 50,
  })

  const logs = data?.items ?? []
  const totalPages = data?.total_pages ?? 1

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
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Auditoria</h1>
          <p className="text-sm text-[var(--text-secondary)]">Historico de acoes administrativas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="relative z-10 mb-4 glass-panel p-4 flex flex-wrap items-center gap-3">
        <Filter size={15} className="text-[var(--text-muted)]" />
        <select
          aria-label="Filtrar por acao"
          value={action}
          onChange={e => {
            setAction(e.target.value)
            setPage(1)
          }}
          className="px-3 py-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-sm text-[var(--text-primary)] focus:outline-none"
        >
          <option value="">Todas as acoes</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="LOGIN">LOGIN</option>
          <option value="LOGOUT">LOGOUT</option>
        </select>
        <input
          type="text"
          aria-label="Filtrar por recurso"
          placeholder="Filtrar por recurso..."
          value={resource}
          onChange={e => {
            setResource(e.target.value)
            setPage(1)
          }}
          className="flex-1 min-w-[160px] px-3 py-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-sm text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-muted)]"
        />
        {data && (
          <span className="text-xs text-[var(--text-muted)] ml-auto">
            {data.total} registro{data.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tabela */}
      <div className="relative z-10 glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--glass-border)] bg-white/[0.02]">
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Acao
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Recurso
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Detalhes
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
              {!isLoading && logs.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-[var(--text-muted)]"
                  >
                    Nenhum registro encontrado
                  </td>
                </tr>
              )}
              {logs.map(log => (
                <AuditRow key={log.id} log={log} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginacao */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--glass-border)]">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--glass-border)] text-sm text-[var(--text-secondary)] disabled:opacity-40 hover:bg-white/[0.03] transition-all"
            >
              <ChevronLeft size={14} /> Anterior
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
              Proxima <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
