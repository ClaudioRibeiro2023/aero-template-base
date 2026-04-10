import { z } from 'zod'

export const QualityCheckStatusEnum = z.enum(['pass', 'warn', 'fail'])

export const qualityCheckResultSchema = z.object({
  name: z.string(),
  status: QualityCheckStatusEnum,
  score: z.number().int().min(0).max(100),
  details: z.string().optional(),
  recommendation: z.string().optional(),
})

export const qualityCategoryResultSchema = z.object({
  category: z.string(),
  score: z.number().int().min(0).max(100),
  checks: z.array(qualityCheckResultSchema),
})

export const qualityReportCreateSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  results: z.record(z.string(), qualityCategoryResultSchema),
})

export type QualityCheckResult = z.infer<typeof qualityCheckResultSchema>
export type QualityCategoryResult = z.infer<typeof qualityCategoryResultSchema>
export type QualityReportCreateValues = z.infer<typeof qualityReportCreateSchema>
