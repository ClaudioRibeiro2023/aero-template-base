// ============================================================================
// User Domain Types
// ============================================================================

import type { UserRole } from './auth'

/**
 * Full user profile entity
 */
export interface User {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  phone: string | null
  department: string | null
  role: UserRole
  is_active: boolean
  tenant_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

/**
 * Payload for creating a user
 */
export interface UserCreate {
  email: string
  display_name: string
  role?: UserRole
  is_active?: boolean
  phone?: string
  department?: string
}

/**
 * Payload for updating a user
 */
export interface UserUpdate {
  display_name?: string
  email?: string
  role?: UserRole
  is_active?: boolean
  phone?: string | null
  department?: string | null
}

/**
 * Paginated user list response
 */
export interface UserList {
  items: User[]
  total: number
  page: number
  page_size: number
  pages: number
}

/**
 * Parameters for listing users
 */
export interface ListUsersParams {
  active_only?: boolean
  search?: string
  role?: string
  page?: number
  page_size?: number
}
