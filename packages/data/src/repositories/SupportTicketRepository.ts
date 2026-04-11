/**
 * SupportTicketRepository — Acesso a dados para support_tickets.
 * Tabela: support_tickets
 */
import { SupabaseRepository } from '../providers/supabase/SupabaseRepository'
import type { SupabaseDbClient } from '../providers/supabase/SupabaseDbClient'

export interface SupportTicket {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  category: string | null
  created_by: string
  assignee_id: string | null
  satisfaction_rating: number | null
  satisfaction_comment: string | null
  created_at: string
  updated_at: string
}

export interface SupportTicketCreate {
  title: string
  description?: string
  priority?: string
  category?: string
  created_by: string
}

export interface SupportTicketUpdate {
  title?: string
  description?: string
  status?: string
  priority?: string
  category?: string
  assignee_id?: string | null
  satisfaction_rating?: number
  satisfaction_comment?: string | null
}

const DEFAULT_SELECT =
  'id, title, description, status, priority, category, created_by, assignee_id, satisfaction_rating, satisfaction_comment, created_at, updated_at'

export class SupportTicketRepository extends SupabaseRepository<
  SupportTicket,
  SupportTicketCreate,
  SupportTicketUpdate
> {
  constructor(dbClient: SupabaseDbClient) {
    super(dbClient, {
      table: 'support_tickets',
      defaultSelect: DEFAULT_SELECT,
    })
  }

  /** Busca tickets por assignee */
  async findByAssignee(assigneeId: string) {
    return this.findMany({
      filters: [{ field: 'assignee_id', operator: 'eq', value: assigneeId }],
      sort: [{ field: 'updated_at', ascending: false }],
    })
  }

  /** Busca tickets abertos (não resolvidos) */
  async findOpen() {
    return this.findMany({
      filters: [
        { field: 'status', operator: 'neq', value: 'closed' },
        { field: 'status', operator: 'neq', value: 'resolved' },
      ],
      sort: [{ field: 'created_at', ascending: false }],
    })
  }
}
