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
  list: (params?: ListUsersParams) => {
    const query = new URLSearchParams()
    if (params?.active_only) query.set('active_only', 'true')
    if (params?.tenant_id) query.set('tenant_id', params.tenant_id)
    if (params?.department) query.set('department', params.department)
    if (params?.search) query.set('search', params.search)
    if (params?.page) query.set('page', String(params.page))
    if (params?.page_size) query.set('page_size', String(params.page_size))
    const qs = query.toString()
    return get<UserList>(`/users${qs ? `?${qs}` : ''}`)
  },

  get: (id: string) => get<User>(`/users/${id}`),

  getByEmail: (email: string) => get<User>(`/users/by-email/${encodeURIComponent(email)}`),

  create: (data: UserCreate) => post<User>('/users', data),

  update: (id: string, data: UserUpdate) => put<User>(`/users/${id}`, data),

  delete: (id: string) => del(`/users/${id}`),
}
