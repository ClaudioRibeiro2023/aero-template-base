/**
 * useSupportMessages — React Query hooks para mensagens de tickets.
 */
import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import type { MessageCreateFormValues } from '@template/shared/schemas'
import { supportMessagesService, type SupportMessage } from '@/services/supportMessages'

export type { SupportMessage }

export const messageKeys = {
  all: ['support-messages'] as const,
  list: (ticketId: string) => [...messageKeys.all, 'list', ticketId] as QueryKey,
}

export function useTicketMessages(ticketId: string) {
  return useQuery<SupportMessage[]>({
    queryKey: messageKeys.list(ticketId),
    queryFn: () => supportMessagesService.list(ticketId),
    enabled: !!ticketId,
    staleTime: 15_000,
  })
}

export function useCreateMessage(ticketId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: MessageCreateFormValues) =>
      supportMessagesService.create(ticketId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messageKeys.list(ticketId) })
    },
  })
}
