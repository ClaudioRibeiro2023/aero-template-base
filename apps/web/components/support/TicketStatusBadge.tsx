'use client'

import { CircleDot, Loader2, CheckCircle, XCircle } from 'lucide-react'

const STATUS_CONFIG: Record<string, { icon: React.ElementType; label: string; className: string }> =
  {
    open: {
      icon: CircleDot,
      label: 'Aberto',
      className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    in_progress: {
      icon: Loader2,
      label: 'Em Andamento',
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    resolved: {
      icon: CheckCircle,
      label: 'Resolvido',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    closed: {
      icon: XCircle,
      label: 'Fechado',
      className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    },
  }

export function TicketStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.open
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-full border ${config.className}`}
    >
      <Icon
        size={12}
        aria-hidden="true"
        className={status === 'in_progress' ? 'animate-spin' : ''}
      />
      {config.label}
    </span>
  )
}
