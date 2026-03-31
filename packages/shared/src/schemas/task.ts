/**
 * Zod validation schemas for Task forms.
 * Sprint 12: Formularios Complexos e Validacao.
 */
import { z } from 'zod'

export const TaskStatusEnum = z.enum(['todo', 'in_progress', 'done', 'cancelled'])
export const TaskPriorityEnum = z.enum(['low', 'medium', 'high', 'critical'])

export const taskCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Titulo e obrigatorio')
    .max(255, 'Titulo deve ter no maximo 255 caracteres')
    .trim(),
  description: z
    .string()
    .max(5000, 'Descricao deve ter no maximo 5000 caracteres')
    .optional()
    .or(z.literal('')),
  status: TaskStatusEnum.default('todo'),
  priority: TaskPriorityEnum.default('medium'),
  assignee_id: z
    .string()
    .uuid('ID do responsavel deve ser um UUID valido')
    .optional()
    .or(z.literal('')),
})

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  title: z
    .string()
    .min(1, 'Titulo e obrigatorio')
    .max(255, 'Titulo deve ter no maximo 255 caracteres')
    .trim()
    .optional(),
})

export type TaskCreateFormValues = z.infer<typeof taskCreateSchema>
export type TaskUpdateFormValues = z.infer<typeof taskUpdateSchema>
