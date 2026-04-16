/**
 * get_open_tasks — retorna tarefas abertas do tenant.
 *
 * Consulta viva na tabela tasks com RLS.
 * Filtra por status != 'done' e != 'cancelled'.
 * Opcionalmente filtra por assignee ou prioridade.
 */
import { z } from 'zod'
import { SupabaseDbClient } from '@template/data/supabase'
import type { ToolDefinition, ToolExecutionContext, ToolResult } from '@template/agent'

const inputSchema = z.object({
  assignee_id: z.string().uuid().optional().describe('Filtrar por responsável (UUID)'),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .optional()
    .describe('Filtrar por prioridade'),
  limit: z.number().min(1).max(50).optional().default(10).describe('Máximo de itens retornados'),
})

interface OpenTasksOutput {
  count: number
  items: Array<{
    id: string
    title: string
    status: string
    priority: string
    assignee_id: string | null
    created_at: string
    updated_at: string
  }>
  generatedAt: string
}

export const getOpenTasksTool: ToolDefinition = {
  name: 'get_open_tasks',
  description:
    'Retorna tarefas abertas (não concluídas e não canceladas) do tenant atual. Pode filtrar por responsável e prioridade. Útil para saber o volume de trabalho pendente.',
  inputSchema,
  authorization: {
    requiredRoles: ['viewer', 'user', 'manager', 'admin', 'super_admin'],
  },
  async execute(
    input: z.infer<typeof inputSchema>,
    _context: ToolExecutionContext
  ): Promise<ToolResult<OpenTasksOutput>> {
    try {
      const db = new SupabaseDbClient()
      const client = await db.asUser()

      let query = client
        .from('tasks')
        .select('id, title, status, priority, assignee_id, created_at, updated_at', {
          count: 'exact',
        })
        .not('status', 'eq', 'done')
        .not('status', 'eq', 'cancelled')
        .order('updated_at', { ascending: false })
        .limit(input.limit ?? 10)

      if (input.assignee_id) {
        query = query.eq('assignee_id', input.assignee_id)
      }
      if (input.priority) {
        query = query.eq('priority', input.priority)
      }

      const { data, error, count } = await query

      if (error) {
        return {
          success: false,
          error: `Erro ao consultar tarefas: ${error.message}`,
          code: 'DB_ERROR',
        }
      }

      return {
        success: true,
        data: {
          count: count ?? data?.length ?? 0,
          items: (data ?? []) as OpenTasksOutput['items'],
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
