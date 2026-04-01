import { z } from 'zod'

export const featureFlagCreateSchema = z.object({
  flag_name: z
    .string()
    .min(1, 'Nome obrigatorio')
    .max(100, 'Nome muito longo')
    .regex(/^[a-z0-9_-]+$/, 'Use apenas letras minusculas, numeros, _ ou -'),
  description: z.string().max(500).optional().or(z.literal('')),
  enabled: z.boolean().default(false),
})

export const featureFlagUpdateSchema = featureFlagCreateSchema.partial()

export type FeatureFlagCreateFormValues = z.infer<typeof featureFlagCreateSchema>
export type FeatureFlagUpdateFormValues = z.infer<typeof featureFlagUpdateSchema>
