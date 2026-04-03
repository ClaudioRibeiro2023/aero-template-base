/**
 * useTasks — React Query hooks para o CRUD de tasks.
 *
 * Sprint 7 (P1-01): Demonstra padrao completo com:
 * - useQuery para listagem com filtros
 * - useMutation para criar/atualizar/deletar
 * - Optimistic updates para UX responsiva
 * - Invalidacao automatica de cache
 *
 * Sprint 5: Refactored to delegate to tasksService.
 */
import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import type { TaskCreateFormValues, TaskUpdateFormValues } from '@template/shared/schemas'
import { tasksService } from '@/services/tasks'
import type { Task, TaskFilters, TasksResponse } from '@/services/tasks'

// Re-export types from service for backwards compatibility
export type { Task, TaskStatus, TaskPriority, TaskFilters, TasksResponse } from '@/services/tasks'

// ── Query keys ──
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as QueryKey,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as QueryKey,
}

// ── Hooks ──

/** Lista tasks com filtros e paginacao. */
export function useTasks(filters: TaskFilters = {}) {
  return useQuery<TasksResponse>({
    queryKey: taskKeys.list(filters),
    queryFn: () => tasksService.list(filters),
    staleTime: 30_000,
  })
}

/** Busca uma task por ID. */
export function useTask(id: string) {
  return useQuery<{ data: Task }>({
    queryKey: taskKeys.detail(id),
    queryFn: async () => ({ data: await tasksService.get(id) }),
    enabled: !!id,
    staleTime: 30_000,
  })
}

/** Cria nova task com optimistic update. */
export function useCreateTask() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: TaskCreateFormValues) => tasksService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

/** Atualiza task com optimistic update. */
export function useUpdateTask(id: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: TaskUpdateFormValues) => tasksService.update(id, payload),
    onMutate: async payload => {
      // Optimistic update no cache de detalhe
      await qc.cancelQueries({ queryKey: taskKeys.detail(id) })
      const previous = qc.getQueryData<{ data: Task }>(taskKeys.detail(id))
      if (previous?.data) {
        qc.setQueryData(taskKeys.detail(id), {
          ...previous,
          data: { ...previous.data, ...payload, updated_at: new Date().toISOString() },
        })
      }
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(taskKeys.detail(id), context.previous)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.detail(id) })
      qc.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

/** Deleta task com optimistic removal da lista. */
export function useDeleteTask() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tasksService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}
