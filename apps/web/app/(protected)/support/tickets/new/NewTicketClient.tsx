'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Send } from 'lucide-react'
import Link from 'next/link'
import { ticketCreateSchema, type TicketCreateFormValues } from '@template/shared/schemas'
import { useCreateTicket } from '@/hooks/useSupportTickets'

const inputClass =
  'w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-[rgba(255,255,255,0.08)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/30 transition-colors'

export function NewTicketClient() {
  const router = useRouter()
  const createTicket = useCreateTicket()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TicketCreateFormValues>({
    resolver: zodResolver(ticketCreateSchema),
    defaultValues: { category: 'other', priority: 'medium' },
  })

  async function onSubmit(values: TicketCreateFormValues) {
    await createTicket.mutateAsync(values)
    router.push('/support/tickets')
  }

  return (
    <main className="page-enter ambient-gradient max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="relative z-10">
        <Link
          href="/support/tickets"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-4"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Novo Ticket</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Descreva o problema ou solicitação
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative z-10 glass-panel p-6 space-y-4"
        noValidate
      >
        <div>
          <label
            htmlFor="ticket-title"
            className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
          >
            Título <span aria-hidden="true">*</span>
          </label>
          <input
            id="ticket-title"
            type="text"
            className={inputClass}
            placeholder="Resumo do problema"
            aria-required="true"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'title-error' : undefined}
            {...register('title')}
          />
          {errors.title && (
            <p
              id="title-error"
              role="alert"
              aria-live="polite"
              className="mt-1 text-xs text-rose-400"
            >
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="ticket-description"
            className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
          >
            Descrição <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="ticket-description"
            rows={5}
            className={`${inputClass} resize-none`}
            placeholder="Detalhe o problema, passos para reproduzir, comportamento esperado..."
            aria-required="true"
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
            {...register('description')}
          />
          {errors.description && (
            <p
              id="description-error"
              role="alert"
              aria-live="polite"
              className="mt-1 text-xs text-rose-400"
            >
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="ticket-category"
              className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
            >
              Categoria
            </label>
            <select id="ticket-category" className={inputClass} {...register('category')}>
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
              <option value="question">Dúvida</option>
              <option value="access">Acesso</option>
              <option value="performance">Performance</option>
              <option value="other">Outro</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="ticket-priority"
              className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
            >
              Prioridade
            </label>
            <select id="ticket-priority" className={inputClass} {...register('priority')}>
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            href="/support/tickets"
            className="flex-1 py-2 text-sm font-medium rounded-lg border border-[rgba(255,255,255,0.08)] text-[var(--text-secondary)] hover:bg-white/[0.03] transition-colors text-center"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={createTicket.isPending}
            className="flex-1 py-2 text-sm font-semibold rounded-lg bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createTicket.isPending ? (
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            ) : (
              <Send size={14} aria-hidden="true" />
            )}
            Enviar Ticket
          </button>
        </div>
      </form>
    </main>
  )
}
