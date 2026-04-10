/**
 * Support Tickets API service.
 */
import { fetchJson, fetchJsonRaw } from '@/lib/fetch-json'
import type {
  TicketCreateFormValues,
  TicketUpdateFormValues,
  TicketAssignFormValues,
  TicketRateFormValues,
} from '@template/shared/schemas'

export interface SupportTicket {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: 'bug' | 'feature' | 'question' | 'access' | 'performance' | 'other'
  created_by: string
  assignee_id: string | null
  satisfaction_rating: number | null
  satisfaction_comment: string | null
  created_at: string
  updated_at: string
}

export interface TicketFilters {
  status?: string
  priority?: string
  category?: string
  page?: number
  page_size?: number
}

export interface TicketsResponse {
  data: SupportTicket[]
  meta: { page: number; page_size: number; total: number; pages: number }
}

export const supportTicketsService = {
  list: async (filters: TicketFilters = {}): Promise<TicketsResponse> => {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.priority) params.set('priority', filters.priority)
    if (filters.category) params.set('category', filters.category)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.page_size) params.set('page_size', String(filters.page_size))
    const qs = params.toString() ? `?${params}` : ''
    return fetchJsonRaw<TicketsResponse>(`/api/support/tickets${qs}`)
  },

  get: async (id: string): Promise<SupportTicket> => {
    const res = await fetchJson<{ data: SupportTicket }>(`/api/support/tickets/${id}`)
    return res.data
  },

  create: async (payload: TicketCreateFormValues): Promise<SupportTicket> => {
    const res = await fetchJson<{ data: SupportTicket }>('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.data
  },

  update: async (id: string, payload: TicketUpdateFormValues): Promise<SupportTicket> => {
    const res = await fetchJson<{ data: SupportTicket }>(`/api/support/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await fetch(`/api/support/tickets/${id}`, { method: 'DELETE' }).then(res => {
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`)
    })
  },

  assign: async (id: string, payload: TicketAssignFormValues): Promise<SupportTicket> => {
    const res = await fetchJson<{ data: SupportTicket }>(`/api/support/tickets/${id}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.data
  },

  rate: async (id: string, payload: TicketRateFormValues): Promise<SupportTicket> => {
    const res = await fetchJson<{ data: SupportTicket }>(`/api/support/tickets/${id}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.data
  },
}
