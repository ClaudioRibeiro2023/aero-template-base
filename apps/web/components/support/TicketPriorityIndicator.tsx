'use client'

const PRIORITY_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  low: { label: 'Baixa', className: 'bg-zinc-500/20 text-zinc-400', dot: 'bg-zinc-400' },
  medium: { label: 'Média', className: 'bg-amber-500/10 text-amber-400', dot: 'bg-amber-400' },
  high: { label: 'Alta', className: 'bg-orange-500/10 text-orange-400', dot: 'bg-orange-400' },
  critical: { label: 'Crítica', className: 'bg-rose-500/10 text-rose-400', dot: 'bg-rose-400' },
}

export function TicketPriorityIndicator({ priority }: { priority: string }) {
  const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.medium

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-full ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  )
}
