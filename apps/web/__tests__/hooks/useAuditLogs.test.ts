import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useAuditLogs, auditLogKeys } from '../../hooks/useAuditLogs'

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

describe('auditLogKeys', () => {
  it('gera keys corretas', () => {
    expect(auditLogKeys.all).toEqual(['audit-logs'])
    expect(auditLogKeys.list({})).toEqual(['audit-logs', 'list', {}])
    expect(auditLogKeys.list({ action: 'CREATE' })).toEqual([
      'audit-logs',
      'list',
      { action: 'CREATE' },
    ])
  })
})

describe('useAuditLogs', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('retorna lista paginada de audit logs', async () => {
    const mockData = {
      data: {
        items: [
          {
            id: 'log-1',
            user_id: 'user-1',
            action: 'CREATE',
            resource: 'tasks',
            resource_id: 'task-1',
            details: { title: 'Nova task' },
            ip_address: '127.0.0.1',
            created_at: '2026-01-01T00:00:00Z',
          },
          {
            id: 'log-2',
            user_id: 'user-1',
            action: 'UPDATE',
            resource: 'tasks',
            resource_id: 'task-1',
            details: null,
            ip_address: '127.0.0.1',
            created_at: '2026-01-01T01:00:00Z',
          },
        ],
        total: 50,
        page: 1,
        page_size: 20,
        total_pages: 3,
      },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const { result } = renderHook(() => useAuditLogs(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toHaveLength(2)
    expect(result.current.data?.total).toBe(50)
    expect(result.current.data?.total_pages).toBe(3)
  })

  it('passa filtro action como query param', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { items: [], total: 0, page: 1, page_size: 20, total_pages: 0 },
      }),
    })

    const { result } = renderHook(() => useAuditLogs({ action: 'DELETE' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => result.current.isSuccess)
    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('action=DELETE')
  })

  it('passa filtro resource como query param', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { items: [], total: 0, page: 1, page_size: 20, total_pages: 0 },
      }),
    })

    const { result } = renderHook(() => useAuditLogs({ resource: 'users' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => result.current.isSuccess)
    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('resource=users')
  })

  it('passa multiplos filtros como query params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { items: [], total: 0, page: 1, page_size: 20, total_pages: 0 },
      }),
    })

    const { result } = renderHook(
      () =>
        useAuditLogs({
          action: 'CREATE',
          resource: 'tasks',
          user_id: 'user-123',
          page: 2,
          page_size: 10,
        }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => result.current.isSuccess)
    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('action=CREATE')
    expect(calledUrl).toContain('resource=tasks')
    expect(calledUrl).toContain('user_id=user-123')
    expect(calledUrl).toContain('page=2')
    expect(calledUrl).toContain('page_size=10')
  })

  it('passa filtros de data como query params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { items: [], total: 0, page: 1, page_size: 20, total_pages: 0 },
      }),
    })

    const { result } = renderHook(
      () =>
        useAuditLogs({
          date_from: '2026-01-01',
          date_to: '2026-01-31',
        }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => result.current.isSuccess)
    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('date_from=2026-01-01')
    expect(calledUrl).toContain('date_to=2026-01-31')
  })

  it('lanca erro quando resposta nao e ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: { message: 'Forbidden' } }),
    })

    const { result } = renderHook(() => useAuditLogs(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Forbidden')
  })
})
