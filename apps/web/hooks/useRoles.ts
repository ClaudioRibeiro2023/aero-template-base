/**
 * useRoles — React Query hooks para CRUD de role_definitions.
 *
 * Sprint 5: Refactored to delegate to rolesService.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rolesService } from '@/services/roles'
import type { RoleDefinition, RoleCreate, RoleUpdate, RolesResponse } from '@/services/roles'

// Re-export types for backwards compatibility
export type { RoleDefinition, RoleCreate, RoleUpdate, RolesResponse } from '@/services/roles'

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
    queryFn: () => rolesService.list(),
    staleTime: 30_000,
  })
}

export function useRole(id: string) {
  return useQuery<RoleDefinition>({
    queryKey: roleKeys.detail(id),
    queryFn: () => rolesService.get(id),
    enabled: Boolean(id),
  })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RoleCreate) => rolesService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  })
}

export function useUpdateRole(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RoleUpdate) => rolesService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rolesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  })
}
