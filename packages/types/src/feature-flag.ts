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
}

/**
 * Payload for updating a feature flag
 */
export interface FeatureFlagUpdate {
  enabled?: boolean
  description?: string
}
