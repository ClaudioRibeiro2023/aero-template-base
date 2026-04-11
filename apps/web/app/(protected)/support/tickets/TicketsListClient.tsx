'use client'

import { useState, useRef } from 'react'
import {
  Plus,
  Loader2,
  Headphones,
  ChevronLeft,
  ChevronRight,
  FileDown,
  XCircle,
  UserCheck,
  Sheet,
} from 'lucide-react'
import Link from 'next/link'
import { useTranslations, useFormatter } from 'next-intl'
import { useRouter } from 'next/navigation'
import { EmptyState, ToastItem } from '@template/design-system'
import { useRealtimeTickets } from '@/hooks/useRealtimeSubscription'
import {
  useTickets,
  useBulkCloseTickets,
  useBulkReassignTickets,
  type TicketFilters,
} from '@/hooks/useSupportTickets'
import { TicketCard } from '@/components/support/TicketCard'
import { BulkActionBar } from '@/components/common/BulkActionBar'
import { UndoToast } from '@/components/common/UndoToast'
import { useUndoToast } from '@/hooks/useUndoToast'
import { exportToCsv, exportToXlsx } from '@/lib/export-csv'
import { useNotifications } from '@/hooks/useNotifications'

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'open', label: 'Abertos' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'resolved', label: 'Resolvidos' },
  { value: 'closed', label: 'Fechados' },
]

const STATUS_LABELS: Record<string, string> = {
  open: 'Aberto',
  in_progress: 'Em Andamento',
  resolved: 'Resolvido',
  closed: 'Fechado',
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
}

export function TicketsListClient() {
  const ts = useTranslations('support')
  const intlFormat = useFormatter()
  const router = useRouter()
  const [filters, setFilters] = useState<TicketFilters>({ page: 1, page_size: 20 })
  const { data, isLoading, isError } = useTickets(filters)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const bulkClose = useBulkCloseTickets()
  const bulkReassign = useBulkReassignTickets()
  const { toast: undoToast, show: showUndo, dismiss: dismissUndo, handleUndo } = useUndoToast()
  const closedIdsRef = useRef<string[]>([])
  const { notifyBulkClose, notifyBulkReassign, notifyBulkExport } = useNotifications()

  // Real-time: lista atualiza automaticamente
  useRealtimeTickets()

  const tickets = data?.data ?? []
  const meta = data?.meta

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === tickets.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(tickets.map(t => t.id)))
    }
  }

  function handleBulkExport() {
    const selectedTickets = tickets.filter(t => selected.has(t.id)) as unknown as Record<
      string,
      unknown
    >[]
    exportToCsv(selectedTickets, 'tickets', [
      { key: 'title', label: ts('form.title') },
      {
        key: 'status',
        label: ts('form.category'),
        format: v => STATUS_LABELS[v as string] || String(v),
      },
      {
        key: 'priority',
        label: ts('form.priority'),
        format: v => PRIORITY_LABELS[v as string] || String(v),
      },
      { key: 'category', label: ts('form.category') },
      {
        key: 'created_at',
        label: ts('createdAt', { date: '' }),
        format: v => intlFormat.dateTime(new Date(v as string), { dateStyle: 'medium' }),
      },
    ])
    setToast({ message: `${selectedTickets.length} tickets exportados`, type: 'success' })
    notifyBulkExport(selectedTickets.length, 'CSV')
    setSelected(new Set())
  }

  function handleBulkExportXlsx() {
    const selectedTickets = tickets.filter(t => selected.has(t.id)) as unknown as Record<
      string,
      unknown
    >[]
    exportToXlsx(selectedTickets, 'tickets', [
      { key: 'title', label: ts('form.title') },
      {
        key: 'status',
        label: ts('form.category'),
        format: v => STATUS_LABELS[v as string] || String(v),
      },
      {
        key: 'priority',
        label: ts('form.priority'),
        format: v => PRIORITY_LABELS[v as string] || String(v),
      },
      { key: 'category', label: ts('form.category') },
      {
        key: 'created_at',
        label: ts('createdAt', { date: '' }),
        format: v => intlFormat.dateTime(new Date(v as string), { dateStyle: 'medium' }),
      },
    ])
    setToast({ message: `${selectedTickets.length} tickets exportados (.xls)`, type: 'success' })
    notifyBulkExport(selectedTickets.length, 'XLSX')
    setSelected(new Set())
  }

  async function handleBulkClose() {
    const ids = Array.from(selected)
    const count = ids.length
    closedIdsRef.current = ids
    try {
      await bulkClose.mutateAsync(ids)
      notifyBulkClose(count)
      setSelected(new Set())
      showUndo({
        message: `${count} ticket${count > 1 ? 's' : ''} fechado${count > 1 ? 's' : ''}`,
        onUndo: async () => {
          // Reabrir tickets via reassign to original status — use update to 'open'
          await Promise.all(
            closedIdsRef.current.map(id =>
              fetch(`/api/support/tickets/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'open' }),
              })
            )
          )
        },
      })
    } catch {
      setToast({ message: 'Erro ao fechar tickets', type: 'error' })
    }
  }

  async function handleBulkReassign() {
    const assigneeId = prompt('ID do responsável para reatribuir:')
    if (!assigneeId?.trim()) return
    try {
      await bulkReassign.mutateAsync({ ids: Array.from(selected), assigneeId: assigneeId.trim() })
      notifyBulkReassign(selected.size)
      setToast({ message: `${selected.size} tickets reatribuídos`, type: 'success' })
      setSelected(new Set())
    } catch {
      setToast({ message: 'Erro ao reatribuir tickets', type: 'error' })
    }
  }

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
      <div className="relative z-10 flex flex-wrap items-center gap-2">
        {tickets.length > 0 && (
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[var(--text-muted)] mr-2">
            <input
              type="checkbox"
              checked={tickets.length > 0 && selected.size === tickets.length}
              onChange={toggleSelectAll}
              className="accent-[var(--brand-primary)] w-3.5 h-3.5"
            />
            Todos
          </label>
        )}
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
          <div key={ticket.id} className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={selected.has(ticket.id)}
              onChange={() => toggleSelect(ticket.id)}
              className="accent-[var(--brand-primary)] w-3.5 h-3.5 mt-4 flex-shrink-0"
              aria-label={`Selecionar ticket: ${ticket.title}`}
            />
            <div className="flex-1 min-w-0">
              <TicketCard ticket={ticket} />
            </div>
          </div>
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
      {/* Bulk Actions */}
      <BulkActionBar
        selectedCount={selected.size}
        onClear={() => setSelected(new Set())}
        actions={[
          {
            label: 'Fechar',
            icon: <XCircle size={14} />,
            onClick: handleBulkClose,
            variant: 'danger',
            disabled: bulkClose.isPending,
          },
          {
            label: 'Reatribuir',
            icon: <UserCheck size={14} />,
            onClick: handleBulkReassign,
            variant: 'primary',
            disabled: bulkReassign.isPending,
          },
          {
            label: 'CSV',
            icon: <FileDown size={14} />,
            onClick: handleBulkExport,
            variant: 'secondary',
          },
          {
            label: 'XLSX',
            icon: <Sheet size={14} />,
            onClick: handleBulkExportXlsx,
            variant: 'secondary',
          },
        ]}
      />

      {/* Undo Toast — bulk close */}
      {undoToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[110]">
          <UndoToast
            message={undoToast.message}
            countdown={undoToast.countdown}
            isPending={undoToast.isPending}
            onUndo={handleUndo}
            onDismiss={dismissUndo}
          />
        </div>
      )}

      {/* Toast — export / error feedback */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[100]">
          <ToastItem
            id="tickets-toast"
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </main>
  )
}
