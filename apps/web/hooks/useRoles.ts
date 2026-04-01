/**
 * useRoles — React Query hooks para CRUD de role_definitions.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchJson } from '@/lib/fetch-json'

// ── Types ──

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

export interface RolesResponse {
  items: RoleDefinition[]
  total: number
}

// ── Query keys ──

const roleKeys = {
  all: ['roles'] as const,
  list: () => [...roleKeys.all, 'list'] as const,
  detail: (id: string) => [...roleKeys.all, 'detail', id] as const,
}

// ── Hooks ──

export function useRoles() {
  return useQuery<RolesResponse>({
    queryKey: roleKeys.list(),
    queryFn: () => fetchJson<RolesResponse>('/api/admin/roles'),
    staleTime: 30_000,
  })
}

export function useRole(id: string) {
  return useQuery<RoleDefinition>({
    queryKey: roleKeys.detail(id),
    queryFn: () => fetchJson<RoleDefinition>(`/api/admin/roles/${id}`),
    enabled: Boolean(id),
  })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      name: string
      display_name: string
      description?: string
      permissions?: string[]
      hierarchy_level?: number
    }) =>
      fetchJson<RoleDefinition>('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  })
}

export function useUpdateRole(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      display_name?: string
      description?: string
      permissions?: string[]
      hierarchy_level?: number
    }) =>
      fetchJson<RoleDefinition>(`/api/admin/roles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson<{ deleted: boolean }>(`/api/admin/roles/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  })
}
