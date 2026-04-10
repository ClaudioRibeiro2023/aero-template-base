/**
 * Quality Reports API service.
 */
import { fetchJson, fetchJsonRaw } from '@/lib/fetch-json'
import type { QualityReportCreateValues } from '@template/shared/schemas'

export interface QualityReport {
  id: string
  overall_score: number
  results: Record<
    string,
    {
      category: string
      score: number
      checks: Array<{
        name: string
        status: 'pass' | 'warn' | 'fail'
        score: number
        details?: string
        recommendation?: string
      }>
    }
  >
  created_by: string
  created_at: string
}

export interface QualityReportsResponse {
  data: QualityReport[]
  meta: { page: number; page_size: number; total: number; pages: number }
}

export interface ServerChecks {
  env: Record<string, boolean>
  runtime: { node_version: string; environment: string }
}

export const qualityReportsService = {
  list: async (page = 1, pageSize = 10): Promise<QualityReportsResponse> => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    return fetchJsonRaw<QualityReportsResponse>(`/api/quality/reports?${params}`)
  },

  get: async (id: string): Promise<QualityReport> => {
    const res = await fetchJson<{ data: QualityReport }>(`/api/quality/reports/${id}`)
    return res.data
  },

  save: async (payload: QualityReportCreateValues): Promise<QualityReport> => {
    const res = await fetchJson<{ data: QualityReport }>('/api/quality/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.data
  },

  getServerChecks: async (): Promise<ServerChecks> => {
    const res = await fetchJson<{ data: ServerChecks }>('/api/quality/checks')
    return res.data
  },
}
