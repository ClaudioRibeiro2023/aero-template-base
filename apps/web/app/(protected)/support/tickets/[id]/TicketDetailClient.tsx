'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useTicket, useUpdateTicket } from '@/hooks/useSupportTickets'
import { useTicketMessages, useCreateMessage } from '@/hooks/useSupportMessages'
import { TicketStatusBadge } from '@/components/support/TicketStatusBadge'
import { TicketPriorityIndicator } from '@/components/support/TicketPriorityIndicator'
import { ConversationThread } from '@/components/support/ConversationThread'
import { MessageInput } from '@/components/support/MessageInput'
import { TicketActions } from '@/components/support/TicketActions'
import { SatisfactionRating } from '@/components/support/SatisfactionRating'
import { useRateTicket } from '@/hooks/useSupportTickets'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useEffect, useState, useMemo } from 'react'

const CATEGORY_LABELS: Record<string, string> = {
  bug: 'Bug',
  feature: 'Feature',
  question: 'Dúvida',
  access: 'Acesso',
  performance: 'Performance',
  other: 'Outro',
}

export function TicketDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: ticket, isLoading, isError } = useTicket(id)
  const { data: messages = [] } = useTicketMessages(id)
  const createMessage = useCreateMessage(id)
  const updateTicket = useUpdateTicket(id)
  const rateTicket = useRateTicket(id)

  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [currentUserId, setCurrentUserId] = useState('')
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUserId(data.user.id)
        setUserRole((data.user.user_metadata?.role as string) ?? 'VIEWER')
      }
    })
  }, [supabase])

  const isAdmin = userRole === 'ADMIN' || userRole === 'GESTOR'
  const isCreator = ticket?.created_by === currentUserId
  const canRate =
    isCreator &&
    ticket &&
    ['resolved', 'closed'].includes(ticket.status) &&
    !ticket.satisfaction_rating

  function handleSendMessage(content: string, isInternal: boolean) {
    createMessage.mutate({ content, is_internal: isInternal })
  }

  function handleResolve() {
    updateTicket.mutate({ status: 'resolved' })
  }

  function handleClose() {
    updateTicket.mutate({ status: 'closed' })
  }

  function handleAssign() {
    // In a full implementation, this would open a user picker modal
    // For now, self-assign
    if (currentUserId) {
      updateTicket.mutate({ assignee_id: currentUserId, status: 'in_progress' })
    }
  }

  function handleRate(rating: number, comment: string) {
    rateTicket.mutate({ satisfaction_rating: rating, satisfaction_comment: comment })
  }

  if (isLoading) {
    return (
      <main className="ambient-gradient max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 flex justify-center py-16">
        <Loader2 size={24} className="animate-spin text-[var(--brand-primary)]" />
      </main>
    )
  }

  if (isError || !ticket) {
    return (
      <main className="ambient-gradient max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <div role="alert" className="glass-panel p-6 text-center text-sm text-rose-400">
          Ticket não encontrado.
        </div>
      </main>
    )
  }

  return (
    <main className="page-enter ambient-gradient max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="relative z-10">
        <Link
          href="/support/tickets"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-4"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Voltar
        </Link>
      </div>

      {/* Ticket Header */}
      <div className="relative z-10 glass-panel p-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-3">{ticket.title}</h1>
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <TicketStatusBadge status={ticket.status} />
          <TicketPriorityIndicator priority={ticket.priority} />
          <span className="text-[11px] text-[var(--text-muted)]">
            {CATEGORY_LABELS[ticket.category] ?? ticket.category}
          </span>
          <span className="text-[11px] text-[var(--text-muted)] ml-auto">
            Criado em {new Date(ticket.created_at).toLocaleString('pt-BR')}
          </span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
          {ticket.description}
        </p>
      </div>

      {/* Admin Actions */}
      {isAdmin && ticket.status !== 'closed' && (
        <div className="relative z-10">
          <TicketActions
            status={ticket.status}
            onAssign={handleAssign}
            onResolve={handleResolve}
            onClose={handleClose}
            isPending={updateTicket.isPending}
          />
        </div>
      )}

      {/* Conversation */}
      <div className="relative z-10">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Mensagens</h2>
        <ConversationThread messages={messages} currentUserId={currentUserId} />
      </div>

      {/* Message Input */}
      {ticket.status !== 'closed' && (
        <div className="relative z-10">
          <MessageInput
            onSend={handleSendMessage}
            isPending={createMessage.isPending}
            showInternalToggle={isAdmin}
          />
        </div>
      )}

      {/* Satisfaction Rating */}
      {canRate && (
        <div className="relative z-10">
          <SatisfactionRating onRate={handleRate} isPending={rateTicket.isPending} />
        </div>
      )}

      {/* Show existing rating */}
      {ticket.satisfaction_rating && (
        <div className="relative z-10 glass-panel p-4">
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-2">Avaliação</h3>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                className={star <= ticket.satisfaction_rating! ? 'text-amber-400' : 'text-zinc-600'}
              >
                ★
              </span>
            ))}
          </div>
          {ticket.satisfaction_comment && (
            <p className="text-sm text-[var(--text-muted)] mt-1">{ticket.satisfaction_comment}</p>
          )}
        </div>
      )}
    </main>
  )
}
