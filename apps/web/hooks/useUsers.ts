/**
 * TanStack Query hooks for Users CRUD.
 * Megaplan V4 Sprint A: Users CRUD real via /api/users.
 */
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import {
  usersService,
  type User,
  type UserCreate,
  type UserUpdate,
  type UserList,
  type ListUsersParams,
} from '../services/users'

// Re-export types for consumers
export type {
  User as Profile,
  UserCreate,
  UserUpdate,
  UserList,
  ListUsersParams,
} from '../services/users'
export type { UserRole } from '../services/users'

// ============================================================================
// Query Keys
// ============================================================================

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: ListUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

// ============================================================================
// Hooks
// ============================================================================

export function useUsers(params?: ListUsersParams, options?: Partial<UseQueryOptions<UserList>>) {
  return useQuery<UserList>({
    queryKey: userKeys.list(params),
    queryFn: () => usersService.list(params),
    staleTime: 30_000,
    ...options,
  })
}

export function useUser(id: string, options?: Partial<UseQueryOptions<User>>) {
  return useQuery<User>({
    queryKey: userKeys.detail(id),
    queryFn: () => usersService.get(id),
    enabled: !!id,
    staleTime: 60_000,
    ...options,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UserCreate) => usersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdate }) => usersService.update(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useBulkDeactivateUsers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => usersService.bulkDeactivate(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useBulkChangeUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ids, role }: { ids: string[]; role: string }) =>
      usersService.bulkChangeRole(ids, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
