/**
 * get_recent_activity — atividade recente do sistema via audit_logs.
 *
 * Consulta viva na tabela audit_logs com RLS.
 * Retorna as ações mais recentes, opcionalmente filtradas por recurso ou ação.
 */
import { z } from 'zod'
import { SupabaseDbClient } from '@template/data/supabase'
import type { ToolDefinition, ToolExecutionContext, ToolResult } from '@template/agent'

const inputSchema = z.object({
  resource: z
    .string()
    .optional()
    .describe('Filtrar por tipo de recurso (ex: tasks, support_tickets, users)'),
  action: z.string().optional().describe('Filtrar por tipo de ação (ex: create, update, delete)'),
  limit: z
    .number()
    .min(1)
    .max(30)
    .optional()
    .default(10)
    .describe('Máximo de registros retornados'),
})

interface ActivityEntry {
  id: string
  user_id: string
  action: string
  resource: string
  resource_id: string | null
  created_at: string
}

interface RecentActivityOutput {
  entries: ActivityEntry[]
  count: number
  generatedAt: string
}

export const getRecentActivityTool: ToolDefinition = {
  name: 'get_recent_activity',
  description:
    'Retorna as ações mais recentes registradas no sistema (audit log). Pode filtrar por tipo de recurso (tasks, tickets, users) ou tipo de ação (create, update, delete). Útil para saber o que aconteceu recentemente.',
  inputSchema,
  authorization: {
    requiredRoles: ['manager', 'admin', 'super_admin'],
  },
  async execute(
    input: z.infer<typeof inputSchema>,
    _context: ToolExecutionContext
  ): Promise<ToolResult<RecentActivityOutput>> {
    try {
      const db = new SupabaseDbClient()
      const client = await db.asUser()

      let query = client
        .from('audit_logs')
        .select('id, user_id, action, resource, resource_id, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(input.limit ?? 10)

      if (input.resource) {
        query = query.ilike('resource', `%${input.resource}%`)
      }
      if (input.action) {
        query = query.ilike('action', `%${input.action}%`)
      }

      const { data, error, count } = await query

      if (error) {
        return {
          success: false,
          error: `Erro ao consultar atividades: ${error.message}`,
          code: 'DB_ERROR',
        }
      }

      return {
        success: true,
        data: {
          entries: (data ?? []) as ActivityEntry[],
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
