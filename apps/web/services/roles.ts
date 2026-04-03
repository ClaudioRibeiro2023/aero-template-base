/**
 * Roles API service.
 * Sprint 5: Architecture Consistency — service layer extraction.
 */
import { fetchJson } from '@/lib/fetch-json'
import type { RoleDefinition, RoleCreate, RoleUpdate, RolesResponse } from '@template/types'

// Re-export types for convenience
export type { RoleDefinition, RoleCreate, RoleUpdate, RolesResponse } from '@template/types'

// ============================================================================
// API Functions
// ============================================================================

export const rolesService = {
  list: async (): Promise<RolesResponse> => {
    return fetchJson<RolesResponse>('/api/admin/roles')
  },

  get: async (id: string): Promise<RoleDefinition> => {
    return fetchJson<RoleDefinition>(`/api/admin/roles/${id}`)
  },

  create: async (payload: RoleCreate): Promise<RoleDefinition> => {
    return fetchJson<RoleDefinition>('/api/admin/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  },

  update: async (id: string, payload: RoleUpdate): Promise<RoleDefinition> => {
    return fetchJson<RoleDefinition>(`/api/admin/roles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  },

  delete: async (id: string): Promise<{ deleted: boolean }> => {
    return fetchJson<{ deleted: boolean }>(`/api/admin/roles/${id}`, { method: 'DELETE' })
  },
}
