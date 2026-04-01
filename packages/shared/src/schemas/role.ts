import { z } from 'zod'

// Formato "RECURSO.ACAO" — ex: DASHBOARD.VIEW, USUARIOS.DELETE
const permissionPattern = /^[A-Z_]+\.[A-Z_]+$/

export const roleCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome obrigatorio')
    .max(50, 'Nome muito longo')
    .regex(/^[A-Z0-9_]+$/, 'Use apenas letras maiusculas, numeros ou _'),
  display_name: z.string().min(1, 'Nome de exibicao obrigatorio').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  permissions: z
    .array(z.string().regex(permissionPattern, 'Formato invalido — use RECURSO.ACAO'))
    .default([]),
  hierarchy_level: z.number().int().min(0).max(100).default(0),
})

export const roleUpdateSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().or(z.literal('')),
  permissions: z.array(z.string().regex(permissionPattern)).optional(),
  hierarchy_level: z.number().int().min(0).max(100).optional(),
})

export type RoleCreateFormValues = z.infer<typeof roleCreateSchema>
export type RoleUpdateFormValues = z.infer<typeof roleUpdateSchema>
