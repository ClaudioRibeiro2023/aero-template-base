/**
 * useSupportTickets — React Query hooks para CRUD de tickets de suporte.
 */
import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import type {
  TicketCreateFormValues,
  TicketUpdateFormValues,
  TicketAssignFormValues,
  TicketRateFormValues,
} from '@template/shared/schemas'
import {
  supportTicketsService,
  type SupportTicket,
  type TicketFilters,
  type TicketsResponse,
} from '@/services/supportTickets'

export type { SupportTicket, TicketFilters, TicketsResponse }

export const ticketKeys = {
  all: ['support-tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (filters: TicketFilters) => [...ticketKeys.lists(), filters] as QueryKey,
  detail: (id: string) => [...ticketKeys.all, 'detail', id] as QueryKey,
}

export function useTickets(filters: TicketFilters = {}) {
  return useQuery<TicketsResponse>({
    queryKey: ticketKeys.list(filters),
    queryFn: () => supportTicketsService.list(filters),
    staleTime: 30_000,
  })
}

export function useTicket(id: string) {
  return useQuery<SupportTicket>({
    queryKey: ticketKeys.detail(id),
    queryFn: () => supportTicketsService.get(id),
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useCreateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TicketCreateFormValues) => supportTicketsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ticketKeys.lists() })
    },
  })
}

export function useUpdateTicket(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TicketUpdateFormValues) => supportTicketsService.update(id, payload),
    onMutate: async payload => {
      await qc.cancelQueries({ queryKey: ticketKeys.detail(id) })
      const previous = qc.getQueryData<SupportTicket>(ticketKeys.detail(id))
      if (previous) {
        qc.setQueryData(ticketKeys.detail(id), {
          ...previous,
          ...payload,
          updated_at: new Date().toISOString(),
        })
      }
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(ticketKeys.detail(id), context.previous)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ticketKeys.detail(id) })
      qc.invalidateQueries({ queryKey: ticketKeys.lists() })
    },
  })
}

export function useDeleteTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => supportTicketsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ticketKeys.lists() })
    },
  })
}

export function useAssignTicket(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TicketAssignFormValues) => supportTicketsService.assign(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ticketKeys.detail(id) })
      qc.invalidateQueries({ queryKey: ticketKeys.lists() })
    },
  })
}

export function useRateTicket(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TicketRateFormValues) => supportTicketsService.rate(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ticketKeys.detail(id) })
    },
  })
}
