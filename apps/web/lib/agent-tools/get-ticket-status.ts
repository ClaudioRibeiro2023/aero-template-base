/**
 * get_ticket_status — retorna detalhes de um ticket de suporte específico ou lista tickets recentes.
 *
 * Consulta viva na tabela support_tickets com RLS.
 * Se ticket_id fornecido, retorna detalhes desse ticket.
 * Caso contrário, retorna os tickets mais recentes com filtros opcionais.
 */
import { z } from 'zod'
import { SupabaseDbClient } from '@template/data/supabase'
import type { ToolDefinition, ToolExecutionContext, ToolResult } from '@template/agent'

const inputSchema = z.object({
  ticket_id: z.string().uuid().optional().describe('ID do ticket específico para consulta'),
  status: z
    .enum(['open', 'in_progress', 'waiting', 'resolved', 'closed'])
    .optional()
    .describe('Filtrar por status'),
  limit: z.number().min(1).max(20).optional().default(5).describe('Máximo de itens retornados'),
})

interface TicketDetail {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  category: string | null
  assignee_id: string | null
  satisfaction_rating: number | null
  created_at: string
  updated_at: string
}

interface TicketStatusOutput {
  ticket?: TicketDetail
  tickets?: TicketDetail[]
  count: number
  generatedAt: string
}

export const getTicketStatusTool: ToolDefinition = {
  name: 'get_ticket_status',
  description:
    'Retorna status e detalhes de tickets de suporte. Se ticket_id fornecido, retorna os detalhes daquele ticket. Caso contrário, lista os tickets mais recentes com filtros opcionais por status.',
  inputSchema,
  authorization: {
    requiredRoles: ['viewer', 'user', 'manager', 'admin', 'super_admin'],
  },
  async execute(
    input: z.infer<typeof inputSchema>,
    _context: ToolExecutionContext
  ): Promise<ToolResult<TicketStatusOutput>> {
    try {
      const db = new SupabaseDbClient()
      const client = await db.asUser()

      // Consulta por ticket específico
      if (input.ticket_id) {
        const { data, error } = await client
          .from('support_tickets')
          .select(
            'id, title, description, status, priority, category, assignee_id, satisfaction_rating, created_at, updated_at'
          )
          .eq('id', input.ticket_id)
          .maybeSingle()

        if (error) {
          return {
            success: false,
            error: `Erro ao consultar ticket: ${error.message}`,
            code: 'DB_ERROR',
          }
        }
        if (!data) {
          return { success: false, error: 'Ticket não encontrado', code: 'NOT_FOUND' }
        }

        return {
          success: true,
          data: {
            ticket: data as TicketDetail,
            count: 1,
            generatedAt: new Date().toISOString(),
          },
          source: 'transactional',
        }
      }

      // Lista tickets recentes
      let query = client
        .from('support_tickets')
        .select(
          'id, title, description, status, priority, category, assignee_id, satisfaction_rating, created_at, updated_at',
          { count: 'exact' }
        )
        .order('updated_at', { ascending: false })
        .limit(input.limit ?? 5)

      if (input.status) {
        query = query.eq('status', input.status)
      }

      const { data, error, count } = await query

      if (error) {
        return {
          success: false,
          error: `Erro ao listar tickets: ${error.message}`,
          code: 'DB_ERROR',
        }
      }

      return {
        success: true,
        data: {
          tickets: (data ?? []) as TicketDetail[],
          count: count ?? data?.length ?? 0,
          generatedAt: new Date().toISOString(),
        },
        source: 'transactional',
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido',
        code: 'EXECUTION_ERROR',
      }
    }
  },
}
