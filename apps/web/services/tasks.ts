/**
 * Tasks API service.
 * Sprint 5: Architecture Consistency — service layer extraction.
 */
import { fetchJson, fetchJsonRaw } from '@/lib/fetch-json'
import type { Task, TaskFilters, TasksResponse } from '@template/types'
import type { TaskCreateFormValues, TaskUpdateFormValues } from '@template/shared/schemas'

// Re-export types for convenience
export type { Task, TaskStatus, TaskPriority, TaskFilters, TasksResponse } from '@template/types'

// ============================================================================
// API Functions
// ============================================================================

export const tasksService = {
  list: async (filters: TaskFilters = {}): Promise<TasksResponse> => {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.priority) params.set('priority', filters.priority)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.page_size) params.set('page_size', String(filters.page_size))
    const qs = params.toString() ? `?${params}` : ''
    return fetchJsonRaw<TasksResponse>(`/api/tasks${qs}`)
  },

  get: async (id: string): Promise<Task> => {
    const res = await fetchJson<{ data: Task }>(`/api/tasks/${id}`)
    return res.data
  },

  create: async (payload: TaskCreateFormValues): Promise<Task> => {
    const res = await fetchJson<{ data: Task }>('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.data
  },

  update: async (id: string, payload: TaskUpdateFormValues): Promise<Task> => {
    const res = await fetchJson<{ data: Task }>(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' }).then(res => {
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`)
    })
  },
}
