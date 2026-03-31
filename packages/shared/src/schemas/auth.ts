import { z } from 'zod'

export const SignupSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  tenant_id: z.string().uuid('tenant_id invalido').optional(),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const ResetPasswordSchema = z.object({
  email: z.string().email('Email invalido'),
})

export const UpdatePasswordSchema = z.object({
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
})

export type SignupInput = z.infer<typeof SignupSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>
