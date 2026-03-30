/**
 * Users API service.
 * Sprint 15: Users CRUD API.
 */
import { get, post, put, del } from './api-client'

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: string
  email: string
  name: string
  keycloak_id: string | null
  avatar_url: string | null
  phone: string | null
  department: string | null
  is_active: boolean
  email_verified: boolean
  tenant_id: string | null
  is_deleted: boolean
}

export interface UserCreate {
  email: string
  name: string
  keycloak_id?: string
  avatar_url?: string
  phone?: string
  department?: string
  tenant_id?: string
}

export interface UserUpdate {
  name?: string
  avatar_url?: string
  phone?: string
  department?: string
  is_active?: boolean
  email_verified?: boolean
  tenant_id?: string
}

export interface UserList {
  items: User[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface ListUsersParams {
  active_only?: boolean
  tenant_id?: string
  department?: string
  search?: string
  page?: number
  page_size?: number
}

// ============================================================================
// API Functions
// ============================================================================

export const usersService = {
  list: (params?: ListUsersParams) => get<UserList>('/users', { params }),

  get: (id: string) => get<User>(`/users/${id}`),

  getByEmail: (email: string) => get<User>(`/users/by-email/${encodeURIComponent(email)}`),

  create: (data: UserCreate) => post<User>('/users', data),

  update: (id: string, data: UserUpdate) => put<User>(`/users/${id}`, data),

  delete: (id: string) => del(`/users/${id}`),
}
