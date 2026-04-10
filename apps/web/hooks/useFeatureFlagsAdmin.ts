/**
 * useFeatureFlagsAdmin — React Query hooks para gerenciar feature flags.
 *
 * Sprint 5: Refactored to delegate to featureFlagsService.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { featureFlagsService } from '@/services/featureFlags'
import type { FeatureFlag, FeatureFlagCreate, FeatureFlagUpdate } from '@/services/featureFlags'

// Re-export types for backwards compatibility
export type { FeatureFlag, FeatureFlagCreate, FeatureFlagUpdate } from '@/services/featureFlags'

// ── Query keys ──

const featureFlagKeys = {
  all: ['feature-flags'] as const,
  list: (orgId?: string) => [...featureFlagKeys.all, 'list', orgId] as const,
}

// ── Hooks ──

export function useFeatureFlags(orgId?: string) {
  return useQuery<{ items: FeatureFlag[]; total: number }>({
    queryKey: featureFlagKeys.list(orgId),
    queryFn: () => featureFlagsService.list(orgId),
    staleTime: 30_000,
  })
}

export function useCreateFeatureFlag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: FeatureFlagCreate) => featureFlagsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: featureFlagKeys.all }),
  })
}

export function useUpdateFeatureFlag(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: FeatureFlagUpdate) => featureFlagsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: featureFlagKeys.all }),
  })
}

export function useDeleteFeatureFlag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => featureFlagsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: featureFlagKeys.all }),
  })
}
