/**
 * Support Messages API service.
 */
import { fetchJson } from '@/lib/fetch-json'
import type { MessageCreateFormValues } from '@template/shared/schemas'

export interface SupportMessage {
  id: string
  ticket_id: string
  content: string
  message_type: 'reply' | 'internal_note' | 'status_change' | 'assignment'
  is_internal: boolean
  created_by: string
  created_at: string
}

export const supportMessagesService = {
  list: async (ticketId: string): Promise<SupportMessage[]> => {
    const res = await fetchJson<{ data: SupportMessage[] }>(
      `/api/support/tickets/${ticketId}/messages`
    )
    return res.data
  },

  create: async (ticketId: string, payload: MessageCreateFormValues): Promise<SupportMessage> => {
    const res = await fetchJson<{ data: SupportMessage }>(
      `/api/support/tickets/${ticketId}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )
    return res.data
  },
}
