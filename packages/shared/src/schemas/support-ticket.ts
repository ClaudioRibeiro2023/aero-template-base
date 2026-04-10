import { z } from 'zod'

export const TicketStatusEnum = z.enum(['open', 'in_progress', 'resolved', 'closed'])
export const TicketPriorityEnum = z.enum(['low', 'medium', 'high', 'critical'])
export const TicketCategoryEnum = z.enum([
  'bug',
  'feature',
  'question',
  'access',
  'performance',
  'other',
])
export const MessageTypeEnum = z.enum(['reply', 'internal_note', 'status_change', 'assignment'])

export const ticketCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Titulo e obrigatorio')
    .max(255, 'Titulo deve ter no maximo 255 caracteres')
    .trim(),
  description: z
    .string()
    .min(1, 'Descricao e obrigatoria')
    .max(10000, 'Descricao deve ter no maximo 10000 caracteres'),
  category: TicketCategoryEnum.default('other'),
  priority: TicketPriorityEnum.default('medium'),
})

export const ticketUpdateSchema = ticketCreateSchema.partial().extend({
  status: TicketStatusEnum.optional(),
  assignee_id: z
    .string()
    .uuid('ID do responsavel deve ser um UUID valido')
    .optional()
    .or(z.literal('')),
})

export const ticketAssignSchema = z.object({
  assignee_id: z.string().uuid('ID do responsavel deve ser um UUID valido'),
})

export const ticketRateSchema = z.object({
  satisfaction_rating: z.number().int().min(1).max(5),
  satisfaction_comment: z.string().max(1000).optional().or(z.literal('')),
})

export const messageCreateSchema = z.object({
  content: z
    .string()
    .min(1, 'Mensagem e obrigatoria')
    .max(10000, 'Mensagem deve ter no maximo 10000 caracteres'),
  is_internal: z.boolean().default(false),
})

export type TicketCreateFormValues = z.infer<typeof ticketCreateSchema>
export type TicketUpdateFormValues = z.infer<typeof ticketUpdateSchema>
export type TicketAssignFormValues = z.infer<typeof ticketAssignSchema>
export type TicketRateFormValues = z.infer<typeof ticketRateSchema>
export type MessageCreateFormValues = z.infer<typeof messageCreateSchema>
