'use client'

import { Loader2, UserPlus, CheckCircle, XCircle } from 'lucide-react'

export function TicketActions({
  status,
  onAssign,
  onResolve,
  onClose,
  isPending,
}: {
  status: string
  onAssign: () => void
  onResolve: () => void
  onClose: () => void
  isPending: boolean
}) {
  const btnClass =
    'flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50'

  return (
    <div className="glass-panel p-4">
      <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
        Ações do Admin
      </h3>
      <div className="flex flex-wrap gap-2">
        {status !== 'closed' && (
          <button
            onClick={onAssign}
            disabled={isPending}
            className={`${btnClass} border-blue-500/20 text-blue-400 hover:bg-blue-500/10`}
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
            Atribuir
          </button>
        )}
        {(status === 'open' || status === 'in_progress') && (
          <button
            onClick={onResolve}
            disabled={isPending}
            className={`${btnClass} border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10`}
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
            Resolver
          </button>
        )}
        {status !== 'closed' && (
          <button
            onClick={onClose}
            disabled={isPending}
            className={`${btnClass} border-zinc-500/20 text-zinc-400 hover:bg-zinc-500/10`}
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
            Fechar
          </button>
        )}
      </div>
    </div>
  )
}
