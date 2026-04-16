/**
 * get_operational_snapshot — panorama executivo da operação.
 *
 * Agrega KPIs de múltiplas entidades em uma visão consolidada:
 * - Tasks: abertas, concluídas, por prioridade
 * - Tickets: abertos, resolvidos, tempo médio
 * - Notifications: não lidas
 * - Quality: score mais recente
 *
 * Todas as consultas respeitam RLS do tenant.
 */
import { z } from 'zod'
import { SupabaseDbClient } from '@template/data/supabase'
import type { ToolDefinition, ToolExecutionContext, ToolResult } from '@template/agent'

const inputSchema = z.object({
  period_days: z
    .number()
    .min(1)
    .max(90)
    .optional()
    .default(7)
    .describe('Período em dias para métricas (padrão: 7)'),
})

interface SnapshotOutput {
  tasks: {
    total: number
    open: number
    done: number
    byPriority: Record<string, number>
  }
  tickets: {
    total: number
    open: number
    resolved: number
    byCategory: Record<string, number>
  }
  notifications: {
    unread: number
  }
  quality: {
    latestScore: number | null
    latestDate: string | null
  }
  periodDays: number
  generatedAt: string
}

export const getOperationalSnapshotTool: ToolDefinition = {
  name: 'get_operational_snapshot',
  description:
    'Retorna um panorama executivo da operação: KPIs de tarefas (abertas, concluídas, por prioridade), tickets de suporte (abertos, resolvidos, por categoria), notificações não lidas e último score de qualidade. Ideal para resumos gerenciais e visão geral do status operacional.',
  inputSchema,
  authorization: {
    requiredRoles: ['manager', 'admin', 'super_admin'],
  },
  async execute(
    input: z.infer<typeof inputSchema>,
    context: ToolExecutionContext
  ): Promise<ToolResult<SnapshotOutput>> {
    try {
      const db = new SupabaseDbClient()
      const client = await db.asUser()
      const periodDays = input.period_days ?? 7
      const since = new Date(Date.now() - periodDays * 86_400_000).toISOString()

      // ─── Tasks ──────────────────────────────────────────────────────
      const { data: taskRows } = await client
        .from('tasks')
        .select('status, priority')
        .gte('created_at', since)

      const tasks = { total: 0, open: 0, done: 0, byPriority: {} as Record<string, number> }
      if (taskRows) {
        tasks.total = taskRows.length
        for (const row of taskRows) {
          const status = row.status as string
          const priority = (row.priority as string) ?? 'medium'
          if (status === 'done') tasks.done++
          if (status !== 'done' && status !== 'cancelled') tasks.open++
          tasks.byPriority[priority] = (tasks.byPriority[priority] ?? 0) + 1
        }
      }

      // ─── Tickets ────────────────────────────────────────────────────
      const { data: ticketRows } = await client
        .from('support_tickets')
        .select('status, category')
        .gte('created_at', since)

      const tickets = { total: 0, open: 0, resolved: 0, byCategory: {} as Record<string, number> }
      if (ticketRows) {
        tickets.total = ticketRows.length
        for (const row of ticketRows) {
          const status = row.status as string
          const category = (row.category as string) ?? 'geral'
          if (status === 'resolved' || status === 'closed') tickets.resolved++
          if (status !== 'resolved' && status !== 'closed') tickets.open++
          tickets.byCategory[category] = (tickets.byCategory[category] ?? 0) + 1
        }
      }

      // ─── Notifications ──────────────────────────────────────────────
      const { count: unreadCount } = await client
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', context.userId)
        .eq('read', false)

      // ─── Quality ────────────────────────────────────────────────────
      const { data: qualityRow } = await client
        .from('quality_reports')
        .select('overall_score, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      return {
        success: true,
        data: {
          tasks,
          tickets,
          notifications: { unread: unreadCount ?? 0 },
          quality: {
            latestScore: qualityRow ? (qualityRow.overall_score as number) : null,
            latestDate: qualityRow ? (qualityRow.created_at as string) : null,
          },
          periodDays,
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
