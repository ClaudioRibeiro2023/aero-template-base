/**
 * update_task_status — atualiza o status de uma tarefa existente (write tool).
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
  new_status: z
    .enum(['todo', 'in_progress', 'done', 'cancelled'])
    .describe('Novo status — valores válidos do enum task_status'),
  reason: z.string().max(500).optional().describe('Motivo da mudança'),
})

interface UpdateStatusResult {
  preview?: WriteToolPreview
  task?: { id: string; status: string; updated_at: string }
}

export const updateTaskStatusTool: ToolDefinition = {
  name: 'update_task_status',
  description:
    'Atualiza o status de uma tarefa existente. Requer confirmação. Útil para marcar tarefas como concluídas, em progresso, em revisão ou cancelar.',
  inputSchema,
  authorization: {
    requiredRoles: ['user', 'manager', 'admin', 'super_admin'],
    requiresConfirmation: true,
  },
  async execute(
    input: z.infer<typeof inputSchema>,
    context: ToolExecutionContext
  ): Promise<ToolResult<UpdateStatusResult>> {
    if (context.mode !== 'execute') {
      return {
        success: true,
        data: {
          preview: {
            description: `Alterar status da tarefa ${input.task_id} para "${input.new_status}"`,
            impact: `O status da tarefa será alterado para "${input.new_status}"${input.reason ? `. Motivo: ${input.reason}` : ''}`,
            details: {
              task_id: input.task_id,
              new_status: input.new_status,
              reason: input.reason ?? '(sem motivo)',
            },
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
        .update({ status: input.new_status })
        .eq('id', input.task_id)
        .select('id, status, updated_at')
        .single()

      if (error) {
        return {
          success: false,
          error: `Erro ao atualizar status: ${error.message}`,
          code: 'DB_ERROR',
        }
      }
      if (!data) {
        return { success: false, error: 'Tarefa não encontrada', code: 'NOT_FOUND' }
      }

      return {
        success: true,
        data: { task: data as UpdateStatusResult['task'] },
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
