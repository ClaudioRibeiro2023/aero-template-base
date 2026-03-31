import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useTasks, useCreateTask, useDeleteTask, taskKeys } from '../../hooks/useTasks'

// ── Mock global fetch ──
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('taskKeys', () => {
  it('gera keys corretas', () => {
    expect(taskKeys.all).toEqual(['tasks'])
    expect(taskKeys.lists()).toEqual(['tasks', 'list'])
    expect(taskKeys.list({ status: 'todo' })).toEqual(['tasks', 'list', { status: 'todo' }])
    expect(taskKeys.detail('abc')).toEqual(['tasks', 'detail', 'abc'])
  })
})

describe('useTasks', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('retorna lista de tasks com sucesso', async () => {
    const mockData = {
      data: [
        {
          id: '1',
          title: 'Task 1',
          description: null,
          status: 'todo',
          priority: 'medium',
          assignee_id: null,
          created_by: 'user1',
          tenant_id: null,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ],
      error: null,
      meta: { page: 1, page_size: 20, total: 1, pages: 1 },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(1)
    expect(result.current.data?.data[0].title).toBe('Task 1')
  })

  it('constrói URL com filtros de status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [],
        error: null,
        meta: { page: 1, page_size: 20, total: 0, pages: 0 },
      }),
    })

    const { result } = renderHook(() => useTasks({ status: 'done' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => result.current.isSuccess)
    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('status=done')
  })

  it('lança erro quando resposta não é ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Unauthorized' } }),
    })

    const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Unauthorized')
  })
})

describe('useCreateTask', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('faz POST /api/tasks e retorna task criada', async () => {
    const newTask = {
      id: 'new-id',
      title: 'Nova Task',
      description: null,
      status: 'todo',
      priority: 'medium',
      assignee_id: null,
      created_by: 'user1',
      tenant_id: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: newTask }),
    })

    const { result } = renderHook(() => useCreateTask(), { wrapper: createWrapper() })

    await result.current.mutateAsync({ title: 'Nova Task', status: 'todo', priority: 'medium' })

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/tasks')
    expect(options.method).toBe('POST')
    const body = JSON.parse(options.body as string)
    expect(body.title).toBe('Nova Task')
  })
})

describe('useDeleteTask', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('faz DELETE /api/tasks/:id', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 })

    const { result } = renderHook(() => useDeleteTask(), { wrapper: createWrapper() })
    await result.current.mutateAsync('task-uuid-123')

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/tasks/task-uuid-123')
    expect(options?.method).toBe('DELETE')
  })
})
