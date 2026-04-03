// ============================================================================
// Role Domain Types
// ============================================================================

/**
 * Role definition entity
 */
export interface RoleDefinition {
  id: string
  tenant_id: string | null
  name: string
  display_name: string
  description: string
  permissions: string[]
  is_system: boolean
  hierarchy_level: number
  created_at: string
  updated_at: string
  user_count?: number
}

/**
 * Payload for creating a role
 */
export interface RoleCreate {
  name: string
  display_name: string
  description?: string
  permissions?: string[]
  hierarchy_level?: number
}

/**
 * Payload for updating a role
 */
export interface RoleUpdate {
  display_name?: string
  description?: string
  permissions?: string[]
  hierarchy_level?: number
}

/**
 * Response for roles listing
 */
export interface RolesResponse {
  items: RoleDefinition[]
  total: number
}
