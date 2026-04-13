/**
 * Zod validation schemas for User/Profile management.
 * Sprint A (Megaplan V4): Users CRUD real.
 */
import { z } from 'zod'

export const UserRoleEnum = z.enum(['ADMIN', 'GESTOR', 'OPERADOR', 'VIEWER'])

export const userCreateSchema = z.object({
  display_name: z
    .string()
    .min(1, 'Nome e obrigatorio')
    .max(255, 'Nome deve ter no maximo 255 caracteres')
    .trim(),
  email: z.string().email('Email invalido'),
  role: UserRoleEnum.default('VIEWER'),
  is_active: z.boolean().default(true),
  phone: z
    .string()
    .max(30, 'Telefone deve ter no maximo 30 caracteres')
    .optional()
    .or(z.literal('')),
  department: z
    .string()
    .max(100, 'Departamento deve ter no maximo 100 caracteres')
    .optional()
    .or(z.literal('')),
})

export const userUpdateSchema = z.object({
  display_name: z
    .string()
    .min(1, 'Nome e obrigatorio')
    .max(255, 'Nome deve ter no maximo 255 caracteres')
    .trim()
    .optional(),
  email: z.string().email('Email invalido').optional(),
  role: UserRoleEnum.optional(),
  is_active: z.boolean().optional(),
  phone: z.string().max(30).optional().or(z.literal('')),
  department: z.string().max(100).optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio deve ter no maximo 500 caracteres').optional().or(z.literal('')),
  avatar_url: z.string().url('URL de avatar invalida').max(1024).optional().or(z.literal('')),
})

export type UserCreateFormValues = z.infer<typeof userCreateSchema>
export type UserUpdateFormValues = z.infer<typeof userUpdateSchema>
