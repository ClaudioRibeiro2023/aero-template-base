/**
 * Users API service.
 * Sprint 15: Users CRUD API.
 */
import { apiClient } from '@template/shared'

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
  list: async (params?: ListUsersParams): Promise<UserList> => {
    const query = new URLSearchParams()
    if (params?.active_only) query.set('active_only', 'true')
    if (params?.tenant_id) query.set('tenant_id', params.tenant_id)
    if (params?.department) query.set('department', params.department)
    if (params?.search) query.set('search', params.search)
    if (params?.page) query.set('page', String(params.page))
    if (params?.page_size) query.set('page_size', String(params.page_size))
    const qs = query.toString()
    const res = await apiClient.get<UserList>(`/users${qs ? `?${qs}` : ''}`)
    return res.data
  },

  get: async (id: string): Promise<User> => {
    const res = await apiClient.get<User>(`/users/${id}`)
    return res.data
  },

  getByEmail: async (email: string): Promise<User> => {
    const res = await apiClient.get<User>(`/users/by-email/${encodeURIComponent(email)}`)
    return res.data
  },

  create: async (data: UserCreate): Promise<User> => {
    const res = await apiClient.post<User>('/users', data)
    return res.data
  },

  update: async (id: string, data: UserUpdate): Promise<User> => {
    const res = await apiClient.put<User>(`/users/${id}`, data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },
}
