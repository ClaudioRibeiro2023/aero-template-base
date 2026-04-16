/**
 * create_task — cria uma nova tarefa (tool de escrita com confirmação).
 *
 * Modos:
 * - preview (padrão): valida input e retorna proposta sem criar
 * - execute: efetua a criação real no banco
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
  title: z.string().min(1).max(200).describe('Título da tarefa'),
  description: z.string().max(2000).optional().describe('Descrição detalhada'),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .optional()
    .default('medium')
    .describe('Prioridade'),
  assignee_id: z.string().uuid().optional().describe('UUID do responsável'),
})

interface CreateTaskResult {
  preview?: WriteToolPreview
  task?: {
    id: string
    title: string
    status: string
    priority: string
    assignee_id: string | null
    created_at: string
  }
}

export const createTaskTool: ToolDefinition = {
  name: 'create_task',
  description:
    'Cria uma nova tarefa no sistema. Requer confirmação do usuário antes de executar. Em modo preview, retorna uma proposta da tarefa que será criada.',
  inputSchema,
  authorization: {
    requiredRoles: ['user', 'manager', 'admin', 'super_admin'],
    requiresConfirmation: true,
  },
  async execute(
    input: z.infer<typeof inputSchema>,
    context: ToolExecutionContext
  ): Promise<ToolResult<CreateTaskResult>> {
    // ─── Preview mode ─────────────────────────────────────────────
    if (context.mode !== 'execute') {
      return {
        success: true,
        data: {
          preview: {
            description: `Criar tarefa "${input.title}" com prioridade ${input.priority ?? 'medium'}`,
            impact: 'Uma nova tarefa será criada no sistema',
            details: {
              title: input.title,
              description: input.description ?? '(sem descrição)',
              priority: input.priority ?? 'medium',
              assignee_id: input.assignee_id ?? '(sem responsável)',
            },
          },
        },
        source: 'transactional',
      }
    }

    // ─── Execute mode ─────────────────────────────────────────────
    try {
      const db = new SupabaseDbClient()
      const client = await db.asUser()

      const { data, error } = await client
        .from('tasks')
        .insert({
          title: input.title,
          description: input.description ?? null,
          status: 'open',
          priority: input.priority ?? 'medium',
          assignee_id: input.assignee_id ?? null,
          created_by: context.userId,
        })
        .select('id, title, status, priority, assignee_id, created_at')
        .single()

      if (error) {
        return { success: false, error: `Erro ao criar tarefa: ${error.message}`, code: 'DB_ERROR' }
      }

      return {
        success: true,
        data: { task: data as CreateTaskResult['task'] },
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
