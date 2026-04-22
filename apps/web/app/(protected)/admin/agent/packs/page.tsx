'use client'

import Link from 'next/link'
import { ChevronLeft, Package, Wrench, AppWindow } from 'lucide-react'
import { useAdminAgentPacks } from '@/hooks/useAdminAgent'

export default function AgentPacksPage() {
  const { data, isLoading } = useAdminAgentPacks()

  const items = data?.items ?? []

  return (
    <main className="page-enter ambient-gradient max-w-5xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="relative z-10 mb-6 flex items-center gap-3">
        <Link
          href="/admin/agent"
          className="p-1.5 rounded-xl hover:bg-white/[0.03] transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} className="text-[var(--text-muted)]" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Domain Packs</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Packs de dominio registrados e suas ferramentas autorizadas
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="relative z-10 glass-panel p-8 flex items-center justify-center">
          <div className="flex gap-1 items-center" role="status" aria-label="Carregando">
            <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" />
          </div>
        </div>
      )}

      {/* Empty */}
      {!isLoading && items.length === 0 && (
        <div className="relative z-10 glass-panel p-8 text-center">
          <Package size={32} className="mx-auto mb-3 text-[var(--text-muted)]" aria-hidden="true" />
          <p className="text-sm text-[var(--text-muted)]">Nenhum domain pack registrado.</p>
        </div>
      )}

      {/* Pack cards */}
      {!isLoading && items.length > 0 && (
        <div className="relative z-10 flex flex-col gap-3">
          {items.map(pack => (
            <section key={pack.id} className="glass-panel p-5">
              {/* Pack header */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center flex-shrink-0">
                    <Package size={18} className="text-[var(--brand-primary)]" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                      {pack.display_name}
                    </h2>
                    <p className="text-xs font-mono text-[var(--text-muted)]">{pack.id}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full border border-sky-400/30 bg-sky-400/10 text-xs font-mono text-sky-300">
                  v{pack.version}
                </span>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/[0.03] rounded-xl p-3 flex items-center gap-2.5">
                  <Wrench
                    size={15}
                    className="text-[var(--text-muted)] flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                      Ferramentas autorizadas
                    </p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">
                      {pack.authorized_tool_count}
                    </p>
                  </div>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-3 flex items-center gap-2.5">
                  <AppWindow
                    size={15}
                    className="text-[var(--text-muted)] flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                      Apps vinculados
                    </p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">
                      {pack.app_ids.includes('*') ? '∞' : pack.app_ids.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* App IDs */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  Apps
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {pack.app_ids.includes('*') ? (
                    <span className="px-2 py-0.5 rounded-md border border-emerald-400/30 bg-emerald-400/10 text-xs font-mono text-emerald-300">
                      * todos
                    </span>
                  ) : (
                    pack.app_ids.map(appId => (
                      <span
                        key={appId}
                        className="px-2 py-0.5 rounded-md border border-[var(--glass-border)] bg-white/[0.03] text-xs font-mono text-[var(--text-secondary)]"
                      >
                        {appId}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}
