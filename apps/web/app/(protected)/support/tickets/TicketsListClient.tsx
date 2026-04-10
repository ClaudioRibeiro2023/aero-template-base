'use client'

import { useState } from 'react'
import { Plus, Loader2, Headphones, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EmptyState } from '@template/design-system'
import { useRealtimeTickets } from '@/hooks/useRealtimeSubscription'
import { useTickets, type TicketFilters } from '@/hooks/useSupportTickets'
import { TicketCard } from '@/components/support/TicketCard'

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'open', label: 'Abertos' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'resolved', label: 'Resolvidos' },
  { value: 'closed', label: 'Fechados' },
]

export function TicketsListClient() {
  const router = useRouter()
  const [filters, setFilters] = useState<TicketFilters>({ page: 1, page_size: 20 })
  const { data, isLoading, isError } = useTickets(filters)

  // Real-time: lista atualiza automaticamente
  useRealtimeTickets()

  const tickets = data?.data ?? []
  const meta = data?.meta

  return (
    <main className="page-enter ambient-gradient max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Suporte</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {meta?.total != null
              ? `${meta.total} tickets no total`
              : 'Central de atendimento e suporte técnico'}
          </p>
        </div>
        <Link
          href="/support/tickets/new"
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90 transition-colors min-h-[44px] flex-shrink-0"
        >
          <Plus size={16} aria-hidden="true" />
          Novo Ticket
        </Link>
      </div>

      {/* Filters */}
      <div className="relative z-10 flex flex-wrap gap-2">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value || 'all'}
            onClick={() => setFilters(prev => ({ ...prev, status: f.value || undefined, page: 1 }))}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors min-h-[36px] ${
              (filters.status ?? '') === f.value
                ? 'bg-[var(--brand-primary)]/10 border-[var(--brand-primary)]/30 text-[var(--brand-primary)]'
                : 'border-[rgba(255,255,255,0.08)] text-[var(--text-muted)] hover:border-[rgba(255,255,255,0.15)]'
            }`}
            aria-pressed={(filters.status ?? '') === f.value}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <section
        aria-label="Lista de tickets"
        aria-busy={isLoading}
        className="relative z-10 space-y-2"
      >
        {isLoading && (
          <div className="flex items-center justify-center py-16" aria-label="Carregando tickets">
            <Loader2
              size={24}
              className="animate-spin text-[var(--brand-primary)]"
              aria-hidden="true"
            />
          </div>
        )}

        {isError && (
          <div role="alert" className="glass-panel p-6 text-center text-sm text-rose-400">
            Erro ao carregar tickets. Tente novamente.
          </div>
        )}

        {!isLoading && !isError && tickets.length === 0 && (
          <EmptyState
            icon={<Headphones size={40} />}
            title="Nenhum ticket encontrado"
            description="Abra um chamado para receber suporte técnico"
            actions={
              <button
                onClick={() => router.push('/support/tickets/new')}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90 transition-colors"
              >
                Novo Ticket
              </button>
            }
          />
        )}

        {tickets.map(ticket => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </section>

      {/* Pagination */}
      {meta && meta.pages > 1 && (
        <nav aria-label="Paginação" className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => setFilters(f => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))}
            disabled={(filters.page ?? 1) <= 1}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] glass-panel hover:border-[var(--glass-border-hover)] transition-colors disabled:opacity-40 min-h-[44px]"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Anterior
          </button>
          <span className="text-xs text-[var(--text-muted)]">
            Página {filters.page ?? 1} de {meta.pages}
          </span>
          <button
            onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) + 1 }))}
            disabled={(filters.page ?? 1) >= meta.pages}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] glass-panel hover:border-[var(--glass-border-hover)] transition-colors disabled:opacity-40 min-h-[44px]"
          >
            Próxima
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </nav>
      )}
    </main>
  )
}
