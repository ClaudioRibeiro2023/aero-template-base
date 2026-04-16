/**
 * update_task_priority — altera a prioridade de uma tarefa (write tool).
 */
import { z } from 'zod'
import { SupabaseDbClient } from '@template/data/supabase'
import type {
  ToolDefinition,
  ToolExecutionContext,
  ToolResult,
  WriteToolPreview,
} from '@template/agent'

const inputSchema = z.object({
  task_id: z.string().uuid().describe('ID da tarefa'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).describe('Nova prioridade'),
})

interface UpdatePriorityResult {
  preview?: WriteToolPreview
  task?: { id: string; priority: string; updated_at: string }
}

export const updateTaskPriorityTool: ToolDefinition = {
  name: 'update_task_priority',
  description:
    'Altera a prioridade de uma tarefa existente. Requer confirmação. Útil para escalonar ou reduzir urgência de tarefas.',
  inputSchema,
  authorization: {
    requiredRoles: ['user', 'manager', 'admin', 'super_admin'],
    requiresConfirmation: true,
  },
  async execute(
    input: z.infer<typeof inputSchema>,
    context: ToolExecutionContext
  ): Promise<ToolResult<UpdatePriorityResult>> {
    if (context.mode !== 'execute') {
      return {
        success: true,
        data: {
          preview: {
            description: `Alterar prioridade da tarefa ${input.task_id} para "${input.priority}"`,
            impact: `A prioridade será alterada para "${input.priority}"`,
            details: { task_id: input.task_id, priority: input.priority },
          },
        },
        source: 'transactional',
      }
    }

    try {
      const db = new SupabaseDbClient()
      const client = await db.asUser()

      const { data, error } = await client
        .from('tasks')
        .update({ priority: input.priority })
        .eq('id', input.task_id)
        .select('id, priority, updated_at')
        .single()

      if (error) {
        return {
          success: false,
          error: `Erro ao atualizar prioridade: ${error.message}`,
          code: 'DB_ERROR',
        }
      }
      if (!data) {
        return { success: false, error: 'Tarefa não encontrada', code: 'NOT_FOUND' }
      }

      return {
        success: true,
        data: { task: data as UpdatePriorityResult['task'] },
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
