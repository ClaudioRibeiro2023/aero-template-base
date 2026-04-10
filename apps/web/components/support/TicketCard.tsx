'use client'

import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { TicketStatusBadge } from './TicketStatusBadge'
import { TicketPriorityIndicator } from './TicketPriorityIndicator'
import type { SupportTicket } from '@/services/supportTickets'

const CATEGORY_LABELS: Record<string, string> = {
  bug: 'Bug',
  feature: 'Feature',
  question: 'Dúvida',
  access: 'Acesso',
  performance: 'Performance',
  other: 'Outro',
}

export function TicketCard({ ticket }: { ticket: SupportTicket }) {
  return (
    <Link
      href={`/support/tickets/${ticket.id}`}
      className="glass-panel px-4 py-3 flex items-center gap-4 hover:border-[var(--glass-border-hover)] transition-colors group block"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{ticket.title}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <TicketStatusBadge status={ticket.status} />
          <TicketPriorityIndicator priority={ticket.priority} />
          <span className="text-[11px] text-[var(--text-muted)]">
            {CATEGORY_LABELS[ticket.category] ?? ticket.category}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[11px] text-[var(--text-muted)] hidden sm:block">
          {new Date(ticket.updated_at).toLocaleDateString('pt-BR')}
        </span>
        <MessageSquare size={14} className="text-[var(--text-muted)]" aria-hidden="true" />
      </div>
    </Link>
  )
}
