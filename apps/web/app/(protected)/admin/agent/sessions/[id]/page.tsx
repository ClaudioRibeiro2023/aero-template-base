'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { useFormatter } from 'next-intl'
import { useAdminAgentSession } from '@/hooks/useAdminAgent'

function JsonBlock({ value }: { value: unknown }) {
  if (value == null) return <span className="text-[var(--text-muted)]">—</span>
  return (
    <pre className="text-xs text-[var(--text-primary)] whitespace-pre-wrap break-all font-mono max-h-64 overflow-auto">
      {JSON.stringify(value, null, 2)}
    </pre>
  )
}

export default function AgentSessionDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const { data, isLoading } = useAdminAgentSession(id)
  const format = useFormatter()

  return (
    <main className="page-enter ambient-gradient max-w-6xl mx-auto p-4 sm:p-8">
      <div className="relative z-10 mb-6 flex items-center gap-3">
        <Link
          href="/admin/agent/sessions"
          className="p-1.5 rounded-xl hover:bg-white/[0.03] transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} className="text-[var(--text-muted)]" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Detalhe da sessao</h1>
          <p className="text-sm text-[var(--text-secondary)] font-mono">{id}</p>
        </div>
      </div>

      {isLoading && (
        <div className="glass-panel p-6 text-sm text-[var(--text-muted)]">Carregando...</div>
      )}

      {!isLoading && data && (
        <>
          <section className="relative z-10 glass-panel p-4 mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Metadata</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <dt className="text-[var(--text-muted)] uppercase tracking-wider">Status</dt>
                <dd className="text-[var(--text-primary)]">{data.session.status}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)] uppercase tracking-wider">Turnos</dt>
                <dd className="text-[var(--text-primary)]">{data.session.turn_count}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)] uppercase tracking-wider">App</dt>
                <dd className="text-[var(--text-primary)] font-mono">{data.session.app_id}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)] uppercase tracking-wider">Tenant</dt>
                <dd className="text-[var(--text-primary)] font-mono">
                  {data.session.tenant_id.slice(0, 8)}…
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)] uppercase tracking-wider">Usuario</dt>
                <dd className="text-[var(--text-primary)] font-mono">
                  {data.session.user_id.slice(0, 8)}…
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)] uppercase tracking-wider">Iniciada</dt>
                <dd className="text-[var(--text-primary)]">
                  {format.dateTime(new Date(data.session.started_at), {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)] uppercase tracking-wider">Ultima</dt>
                <dd className="text-[var(--text-primary)]">
                  {format.dateTime(new Date(data.session.last_active_at), {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)] uppercase tracking-wider">Domain Pack</dt>
                <dd className="text-[var(--text-primary)]">
                  {data.session.domain_pack_id ? (
                    <span className="inline-flex items-center gap-2 flex-wrap">
                      <span className="font-mono">
                        {data.session.domain_pack_id}
                        {data.session.domain_pack_version
                          ? ` v${data.session.domain_pack_version}`
                          : ''}
                      </span>
                      {data.session.domain_pack_fallback && (
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 text-[10px] font-medium">
                          fallback
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)]">—</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)] uppercase tracking-wider">Strategy</dt>
                <dd className="text-[var(--text-primary)] font-mono">
                  {data.session.domain_pack_strategy ?? (
                    <span className="text-[var(--text-muted)]">—</span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <section className="relative z-10 glass-panel p-4 mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              Mensagens ({data.messages.length})
            </h2>
            <ul className="space-y-3">
              {data.messages.map(m => (
                <li key={m.id} className="border-l-2 border-[var(--glass-border)] pl-3 py-1">
                  <div className="flex items-center gap-2 mb-1 text-xs">
                    <span className="font-semibold uppercase text-[var(--text-muted)]">
                      {m.role}
                    </span>
                    <span className="text-[var(--text-muted)]">
                      {format.dateTime(new Date(m.created_at), {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                    {m.latency_ms != null && (
                      <span className="text-[var(--text-muted)]">· {m.latency_ms}ms</span>
                    )}
                    {m.model && <span className="text-[var(--text-muted)]">· {m.model}</span>}
                  </div>
                  <div className="text-sm text-[var(--text-primary)] whitespace-pre-wrap break-words">
                    {m.content}
                  </div>
                  {m.tool_calls != null && (
                    <div className="mt-2">
                      <JsonBlock value={m.tool_calls} />
                    </div>
                  )}
                </li>
              ))}
              {data.messages.length === 0 && (
                <li className="text-sm text-[var(--text-muted)]">Sem mensagens.</li>
              )}
            </ul>
          </section>

          <section className="relative z-10 glass-panel p-4 mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              Tool Logs ({data.tool_logs.length})
            </h2>
            <ul className="space-y-3">
              {data.tool_logs.map(t => (
                <li key={t.id} className="border-l-2 pl-3 py-1 border-[var(--glass-border)]">
                  <div className="flex items-center gap-2 mb-1 text-xs">
                    <span className="font-mono text-[var(--text-primary)]">{t.tool_name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        t.success
                          ? 'text-emerald-400 bg-emerald-400/10'
                          : 'text-rose-400 bg-rose-400/10'
                      }`}
                    >
                      {t.success ? 'success' : 'fail'}
                    </span>
                    {t.latency_ms != null && (
                      <span className="text-[var(--text-muted)]">{t.latency_ms}ms</span>
                    )}
                  </div>
                  {t.error_msg && <div className="text-xs text-rose-300 mb-1">{t.error_msg}</div>}
                  <details className="text-xs">
                    <summary className="cursor-pointer text-[var(--text-muted)]">
                      input / output
                    </summary>
                    <div className="mt-1 space-y-1">
                      <JsonBlock value={t.input} />
                      <JsonBlock value={t.output} />
                    </div>
                  </details>
                </li>
              ))}
              {data.tool_logs.length === 0 && (
                <li className="text-sm text-[var(--text-muted)]">Sem tool logs.</li>
              )}
            </ul>
          </section>

          <section className="relative z-10 glass-panel p-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              Acoes Pendentes ({data.pending_actions.length})
            </h2>
            <ul className="space-y-3">
              {data.pending_actions.map(p => (
                <li key={p.id} className="border-l-2 pl-3 py-1 border-[var(--glass-border)]">
                  <div className="flex items-center gap-2 mb-1 text-xs">
                    <span className="font-mono text-[var(--text-primary)]">{p.tool_name}</span>
                    <span className="text-[var(--text-muted)]">{p.status}</span>
                  </div>
                  <div className="text-sm text-[var(--text-primary)]">{p.description}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">Impact: {p.impact}</div>
                  <details className="text-xs mt-1">
                    <summary className="cursor-pointer text-[var(--text-muted)]">payload</summary>
                    <div className="mt-1">
                      <JsonBlock value={p.proposed_input} />
                    </div>
                  </details>
                </li>
              ))}
              {data.pending_actions.length === 0 && (
                <li className="text-sm text-[var(--text-muted)]">Sem acoes pendentes.</li>
              )}
            </ul>
          </section>
        </>
      )}
    </main>
  )
}
