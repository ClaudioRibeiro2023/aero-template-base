import { z } from 'zod'

export const UpdateBrandingSchema = z.object({
  appName: z.string().min(1).max(100).optional(),
  logoUrl: z.string().url().nullable().optional(),
  faviconUrl: z.string().url().nullable().optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
})

export const UpdateThemeSchema = z.object({
  mode: z.enum(['light', 'dark', 'system']).optional(),
  density: z.enum(['comfortable', 'compact', 'spacious']).optional(),
  borderRadius: z.enum(['none', 'sm', 'md', 'lg']).optional(),
  fontFamily: z.string().optional(),
})

export const UpdateConfigSchema = z.object({
  branding: UpdateBrandingSchema.optional(),
  theme: UpdateThemeSchema.optional(),
  maintenanceMode: z.boolean().optional(),
  defaultLanguage: z.string().optional(),
  defaultTimezone: z.string().optional(),
})

export type UpdateConfigInput = z.infer<typeof UpdateConfigSchema>
