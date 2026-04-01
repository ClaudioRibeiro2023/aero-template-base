/**
 * useFeatureFlagsAdmin — React Query hooks para gerenciar feature flags.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchJson } from '@/lib/fetch-json'

// ── Types ──

export interface FeatureFlag {
  id: string
  tenant_id: string | null
  flag_name: string
  description: string
  enabled: boolean
  created_at: string
  updated_at: string
}

interface FeatureFlagsResponse {
  data: { items: FeatureFlag[]; total: number }
  error: null
}

// ── Query keys ──

const featureFlagKeys = {
  all: ['feature-flags'] as const,
  list: () => [...featureFlagKeys.all, 'list'] as const,
}

// ── Hooks ──

export function useFeatureFlags() {
  return useQuery<{ items: FeatureFlag[]; total: number }>({
    queryKey: featureFlagKeys.list(),
    queryFn: () => fetchJson<FeatureFlagsResponse['data']>('/api/feature-flags'),
    staleTime: 30_000,
  })
}

export function useCreateFeatureFlag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { flag_name: string; description?: string; enabled?: boolean }) =>
      fetchJson<FeatureFlag>('/api/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: featureFlagKeys.all }),
  })
}

export function useUpdateFeatureFlag(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { enabled?: boolean; description?: string }) =>
      fetchJson<FeatureFlag>(`/api/feature-flags/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: featureFlagKeys.all }),
  })
}

export function useDeleteFeatureFlag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson<{ deleted: boolean }>(`/api/feature-flags/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: featureFlagKeys.all }),
  })
}
