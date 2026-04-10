/**
 * Feature Flags API service.
 * Sprint 5: Architecture Consistency — service layer extraction.
 */
import { fetchJson } from '@/lib/fetch-json'
import type { FeatureFlag, FeatureFlagCreate, FeatureFlagUpdate } from '@template/types'

// Re-export types for convenience
export type { FeatureFlag, FeatureFlagCreate, FeatureFlagUpdate } from '@template/types'

// ============================================================================
// API Functions
// ============================================================================

export const featureFlagsService = {
  list: async (orgId?: string): Promise<{ items: FeatureFlag[]; total: number }> => {
    const qs = orgId ? `?org_id=${encodeURIComponent(orgId)}` : ''
    return fetchJson<{ items: FeatureFlag[]; total: number }>(`/api/feature-flags${qs}`)
  },

  create: async (payload: FeatureFlagCreate): Promise<FeatureFlag> => {
    return fetchJson<FeatureFlag>('/api/feature-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  },

  update: async (id: string, payload: FeatureFlagUpdate): Promise<FeatureFlag> => {
    return fetchJson<FeatureFlag>(`/api/feature-flags/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  },

  delete: async (id: string): Promise<{ deleted: boolean }> => {
    return fetchJson<{ deleted: boolean }>(`/api/feature-flags/${id}`, { method: 'DELETE' })
  },
}
