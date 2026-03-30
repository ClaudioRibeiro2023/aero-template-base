/**
 * TanStack Query hooks for Users CRUD.
 * Sprint 15: Users CRUD API.
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

// ============================================================================
// Query Keys
// ============================================================================

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: ListUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  byEmail: (email: string) => [...userKeys.all, 'by-email', email] as const,
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

export function useUserByEmail(email: string, options?: Partial<UseQueryOptions<User>>) {
  return useQuery<User>({
    queryKey: userKeys.byEmail(email),
    queryFn: () => usersService.getByEmail(email),
    enabled: !!email,
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
