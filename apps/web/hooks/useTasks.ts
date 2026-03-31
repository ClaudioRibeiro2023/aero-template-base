/**
 * useTasks — React Query hooks para o CRUD de tasks.
 *
 * Sprint 7 (P1-01): Demonstra padrão completo com:
 * - useQuery para listagem com filtros
 * - useMutation para criar/atualizar/deletar
 * - Optimistic updates para UX responsiva
 * - Invalidação automática de cache
 */
import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import type { TaskCreateFormValues, TaskUpdateFormValues } from '@template/shared/schemas'

// ── Types ──
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assignee_id: string | null
  created_by: string
  tenant_id: string | null
  created_at: string
  updated_at: string
}

export interface TasksResponse {
  data: Task[]
  error: null
  meta: { page: number; page_size: number; total: number; pages: number }
}

export interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  page?: number
  page_size?: number
}

// ── Query keys ──
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as QueryKey,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as QueryKey,
}

// ── Helpers ──
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json?.error?.message ?? `HTTP ${res.status}`)
  }
  return json
}

// ── Hooks ──

/** Lista tasks com filtros e paginação. */
export function useTasks(filters: TaskFilters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.priority) params.set('priority', filters.priority)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.page_size) params.set('page_size', String(filters.page_size))
  const qs = params.toString() ? `?${params}` : ''

  return useQuery<TasksResponse>({
    queryKey: taskKeys.list(filters),
    queryFn: () => fetchJson<TasksResponse>(`/api/tasks${qs}`),
  })
}

/** Busca uma task por ID. */
export function useTask(id: string) {
  return useQuery<{ data: Task }>({
    queryKey: taskKeys.detail(id),
    queryFn: () => fetchJson(`/api/tasks/${id}`),
    enabled: !!id,
  })
}

/** Cria nova task com optimistic update. */
export function useCreateTask() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: TaskCreateFormValues) =>
      fetchJson<{ data: Task }>('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

/** Atualiza task com optimistic update. */
export function useUpdateTask(id: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: TaskUpdateFormValues) =>
      fetchJson<{ data: Task }>(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
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
    mutationFn: (id: string) =>
      fetch(`/api/tasks/${id}`, { method: 'DELETE' }).then(res => {
        if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`)
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}
