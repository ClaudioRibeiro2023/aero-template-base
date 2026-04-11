'use client'

import { memo } from 'react'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { useTranslations, useFormatter } from 'next-intl'
import { TicketStatusBadge } from './TicketStatusBadge'
import { TicketPriorityIndicator } from './TicketPriorityIndicator'
import type { SupportTicket } from '@/services/supportTickets'

export const TicketCard = memo(function TicketCard({ ticket }: { ticket: SupportTicket }) {
  const t = useTranslations('support')
  const format = useFormatter()

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
            {t(`category.${ticket.category}`)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[11px] text-[var(--text-muted)] hidden sm:block">
          {format.dateTime(new Date(ticket.updated_at), { dateStyle: 'medium' })}
        </span>
        <MessageSquare size={14} className="text-[var(--text-muted)]" aria-hidden="true" />
      </div>
    </Link>
  )
})
