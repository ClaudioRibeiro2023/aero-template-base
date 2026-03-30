/**
 * Zod validation schemas for Task forms.
 * Sprint 12: Formulários Complexos e Validação.
 */
import { z } from 'zod'

export const TaskStatusEnum = z.enum(['todo', 'in_progress', 'done', 'cancelled'])
export const TaskPriorityEnum = z.enum(['low', 'medium', 'high', 'critical'])

export const taskCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(255, 'Título deve ter no máximo 255 caracteres')
    .trim(),
  description: z
    .string()
    .max(5000, 'Descrição deve ter no máximo 5000 caracteres')
    .optional()
    .or(z.literal('')),
  status: TaskStatusEnum.default('todo'),
  priority: TaskPriorityEnum.default('medium'),
  assignee_id: z
    .string()
    .uuid('ID do responsável deve ser um UUID válido')
    .optional()
    .or(z.literal('')),
})

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(255, 'Título deve ter no máximo 255 caracteres')
    .trim()
    .optional(),
})

export type TaskCreateFormValues = z.infer<typeof taskCreateSchema>
export type TaskUpdateFormValues = z.infer<typeof taskUpdateSchema>
