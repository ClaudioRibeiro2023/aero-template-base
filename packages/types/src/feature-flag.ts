// ============================================================================
// Feature Flag Domain Types
// ============================================================================

/**
 * Feature flag entity
 */
export interface FeatureFlag {
  id: string
  tenant_id: string | null
  flag_name: string
  description: string
  enabled: boolean
  rollout_pct: number
  created_at: string
  updated_at: string
}

/**
 * Payload for creating a feature flag
 */
export interface FeatureFlagCreate {
  flag_name: string
  description?: string
  enabled?: boolean
  rollout_pct?: number
}

/**
 * Payload for updating a feature flag
 */
export interface FeatureFlagUpdate {
  enabled?: boolean
  description?: string
  rollout_pct?: number
}
