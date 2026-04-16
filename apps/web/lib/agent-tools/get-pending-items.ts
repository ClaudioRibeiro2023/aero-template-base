/**
 * get_pending_items — resumo cross-entity de pendências do tenant.
 *
 * Agrega dados de tasks, support_tickets e notifications para produzir
 * um panorama de tudo que precisa de atenção. Consultas com RLS.
 */
import { z } from 'zod'
import { SupabaseDbClient } from '@template/data/supabase'
import type { ToolDefinition, ToolExecutionContext, ToolResult } from '@template/agent'

const inputSchema = z.object({
  include_tasks: z.boolean().optional().default(true).describe('Incluir tarefas pendentes'),
  include_tickets: z.boolean().optional().default(true).describe('Incluir tickets abertos'),
  include_notifications: z
    .boolean()
    .optional()
    .default(true)
    .describe('Incluir notificações não lidas'),
})

interface PendingItemsOutput {
  totalPending: number
  tasks: {
    open: number
    byPriority: Record<string, number>
  } | null
  tickets: {
    open: number
    byStatus: Record<string, number>
  } | null
  notifications: {
    unread: number
    bySeverity: Record<string, number>
  } | null
  generatedAt: string
}

export const getPendingItemsTool: ToolDefinition = {
  name: 'get_pending_items',
  description:
    'Retorna um resumo operacional de todas as pendências do tenant: tarefas abertas (por prioridade), tickets abertos (por status) e notificações não lidas (por severidade). Útil para visão geral do que precisa de atenção.',
  inputSchema,
  authorization: {
    requiredRoles: ['viewer', 'user', 'manager', 'admin', 'super_admin'],
  },
  async execute(
    input: z.infer<typeof inputSchema>,
    context: ToolExecutionContext
  ): Promise<ToolResult<PendingItemsOutput>> {
    try {
      const db = new SupabaseDbClient()
      const client = await db.asUser()
      let totalPending = 0

      // ─── Tasks ──────────────────────────────────────────────────────
      let tasksResult: PendingItemsOutput['tasks'] = null
      if (input.include_tasks !== false) {
        const { data: taskRows, error: taskErr } = await client
          .from('tasks')
          .select('priority')
          .not('status', 'eq', 'done')
          .not('status', 'eq', 'cancelled')

        if (!taskErr && taskRows) {
          const byPriority: Record<string, number> = {}
          for (const row of taskRows) {
            const p = (row.priority as string) ?? 'medium'
            byPriority[p] = (byPriority[p] ?? 0) + 1
          }
          tasksResult = { open: taskRows.length, byPriority }
          totalPending += taskRows.length
        }
      }

      // ─── Tickets ────────────────────────────────────────────────────
      let ticketsResult: PendingItemsOutput['tickets'] = null
      if (input.include_tickets !== false) {
        const { data: ticketRows, error: ticketErr } = await client
          .from('support_tickets')
          .select('status')
          .not('status', 'eq', 'closed')
          .not('status', 'eq', 'resolved')

        if (!ticketErr && ticketRows) {
          const byStatus: Record<string, number> = {}
          for (const row of ticketRows) {
            const s = (row.status as string) ?? 'open'
            byStatus[s] = (byStatus[s] ?? 0) + 1
          }
          ticketsResult = { open: ticketRows.length, byStatus }
          totalPending += ticketRows.length
        }
      }

      // ─── Notifications ──────────────────────────────────────────────
      let notificationsResult: PendingItemsOutput['notifications'] = null
      if (input.include_notifications !== false) {
        const { data: notifRows, error: notifErr } = await client
          .from('notifications')
          .select('severity')
          .eq('user_id', context.userId)
          .eq('read', false)

        if (!notifErr && notifRows) {
          const bySeverity: Record<string, number> = {}
          for (const row of notifRows) {
            const sev = (row.severity as string) ?? 'info'
            bySeverity[sev] = (bySeverity[sev] ?? 0) + 1
          }
          notificationsResult = { unread: notifRows.length, bySeverity }
          totalPending += notifRows.length
        }
      }

      return {
        success: true,
        data: {
          totalPending,
          tasks: tasksResult,
          tickets: ticketsResult,
          notifications: notificationsResult,
          generatedAt: new Date().toISOString(),
        },
        source: 'analytical',
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
