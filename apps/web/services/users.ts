/**
 * Users API service.
 * Megaplan V4 Sprint A: Users CRUD real via /api/users.
 */
import { fetchJson } from '@/lib/fetch-json'
import type { User, UserCreate, UserUpdate, UserList, ListUsersParams } from '@template/types'

// Re-export types for convenience
export type { User, UserCreate, UserUpdate, UserList, ListUsersParams } from '@template/types'
export type { UserRole } from '@template/types'

// ============================================================================
// API Functions
// ============================================================================

export const usersService = {
  list: async (params?: ListUsersParams): Promise<UserList> => {
    const query = new URLSearchParams()
    if (params?.active_only) query.set('active_only', 'true')
    if (params?.search) query.set('search', params.search)
    if (params?.role) query.set('role', params.role)
    if (params?.page) query.set('page', String(params.page))
    if (params?.page_size) query.set('page_size', String(params.page_size))
    const qs = query.toString()
    const res = await fetchJson<{
      data: User[]
      meta: { page: number; page_size: number; total: number; pages: number }
    }>(`/api/users${qs ? `?${qs}` : ''}`)
    return {
      items: res.data,
      total: res.meta.total,
      page: res.meta.page,
      page_size: res.meta.page_size,
      pages: res.meta.pages,
    }
  },

  get: async (id: string): Promise<User> => {
    const res = await fetchJson<{ data: User }>(`/api/users/${id}`)
    return res.data
  },

  create: async (data: UserCreate): Promise<User> => {
    const res = await fetchJson<{ data: User }>('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.data
  },

  update: async (id: string, data: UserUpdate): Promise<User> => {
    const res = await fetchJson<{ data: User }>(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await fetchJson(`/api/users/${id}`, { method: 'DELETE' })
  },
}
