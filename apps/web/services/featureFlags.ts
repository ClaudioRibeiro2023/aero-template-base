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
  list: async (): Promise<{ items: FeatureFlag[]; total: number }> => {
    return fetchJson<{ items: FeatureFlag[]; total: number }>('/api/feature-flags')
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
