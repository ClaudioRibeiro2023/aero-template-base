/**
 * useQualityDiagnostic — React Query hooks para relatórios de qualidade.
 */
import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import {
  qualityReportsService,
  type QualityReport,
  type QualityReportsResponse,
  type ServerChecks,
} from '@/services/qualityReports'
import type { QualityReportCreateValues } from '@template/shared/schemas'

export type { QualityReport, QualityReportsResponse, ServerChecks }

export const qualityKeys = {
  all: ['quality-reports'] as const,
  lists: () => [...qualityKeys.all, 'list'] as const,
  list: (page: number) => [...qualityKeys.lists(), page] as QueryKey,
  detail: (id: string) => [...qualityKeys.all, 'detail', id] as QueryKey,
  checks: ['quality-checks'] as const,
}

export function useQualityReports(page = 1) {
  return useQuery<QualityReportsResponse>({
    queryKey: qualityKeys.list(page),
    queryFn: () => qualityReportsService.list(page),
    staleTime: 30_000,
  })
}

export function useQualityReport(id: string) {
  return useQuery<QualityReport>({
    queryKey: qualityKeys.detail(id),
    queryFn: () => qualityReportsService.get(id),
    enabled: !!id,
    staleTime: 60_000,
  })
}

export function useServerChecks() {
  return useQuery<ServerChecks>({
    queryKey: qualityKeys.checks,
    queryFn: () => qualityReportsService.getServerChecks(),
    staleTime: 60_000,
  })
}

export function useRunDiagnostic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: QualityReportCreateValues) => qualityReportsService.save(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qualityKeys.lists() })
    },
  })
}
