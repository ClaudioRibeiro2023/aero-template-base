/**
 * assign_task — atribui ou reatribui uma tarefa a um usuário (write tool).
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
  assignee_id: z.string().uuid().describe('UUID do novo responsável'),
})

interface AssignTaskResult {
  preview?: WriteToolPreview
  task?: { id: string; assignee_id: string; updated_at: string }
}

export const assignTaskTool: ToolDefinition = {
  name: 'assign_task',
  description:
    'Atribui ou reatribui uma tarefa a um responsável. Requer confirmação. Útil para delegar tarefas ou reatribuir quando necessário.',
  inputSchema,
  authorization: {
    requiredRoles: ['manager', 'admin', 'super_admin'],
    requiresConfirmation: true,
  },
  async execute(
    input: z.infer<typeof inputSchema>,
    context: ToolExecutionContext
  ): Promise<ToolResult<AssignTaskResult>> {
    if (context.mode !== 'execute') {
      return {
        success: true,
        data: {
          preview: {
            description: `Atribuir tarefa ${input.task_id} ao usuário ${input.assignee_id}`,
            impact: 'O responsável pela tarefa será alterado',
            details: { task_id: input.task_id, assignee_id: input.assignee_id },
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
        .update({ assignee_id: input.assignee_id })
        .eq('id', input.task_id)
        .select('id, assignee_id, updated_at')
        .single()

      if (error) {
        return {
          success: false,
          error: `Erro ao atribuir tarefa: ${error.message}`,
          code: 'DB_ERROR',
        }
      }
      if (!data) {
        return { success: false, error: 'Tarefa não encontrada', code: 'NOT_FOUND' }
      }

      return {
        success: true,
        data: { task: data as AssignTaskResult['task'] },
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
