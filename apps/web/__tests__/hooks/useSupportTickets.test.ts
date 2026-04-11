import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useBulkCloseTickets,
  useBulkReassignTickets,
  ticketKeys,
} from '../../hooks/useSupportTickets'

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

describe('ticketKeys', () => {
  it('gera keys corretas', () => {
    expect(ticketKeys.all).toEqual(['support-tickets'])
    expect(ticketKeys.lists()).toEqual(['support-tickets', 'list'])
    expect(ticketKeys.list({ status: 'open' })).toEqual([
      'support-tickets',
      'list',
      { status: 'open' },
    ])
    expect(ticketKeys.detail('abc')).toEqual(['support-tickets', 'detail', 'abc'])
  })
})

describe('useBulkCloseTickets', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('faz POST /api/support/tickets/bulk com action=close e ids corretos', async () => {
    // fetchJson retorna json.data quando res.ok — o serviço devolve { affected: N } diretamente
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { affected: 3 } }),
    })

    const { result } = renderHook(() => useBulkCloseTickets(), { wrapper: createWrapper() })

    await result.current.mutateAsync(['t1', 't2', 't3'])

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/support/tickets/bulk')
    expect(options.method).toBe('POST')

    const body = JSON.parse(options.body as string)
    expect(body.action).toBe('close')
    expect(body.ids).toEqual(['t1', 't2', 't3'])
  })

  it('retorna affected count correto', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { affected: 2 } }),
    })

    const { result } = renderHook(() => useBulkCloseTickets(), { wrapper: createWrapper() })

    const res = await result.current.mutateAsync(['t1', 't2'])
    expect(res.affected).toBe(2)
  })

  it('invalida queries de support-tickets apos sucesso', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { affected: 1 } }),
    })

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useBulkCloseTickets(), { wrapper })

    await result.current.mutateAsync(['t1'])

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledOnce())
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ticketKeys.all,
    })
  })

  it('lanca erro quando resposta nao e ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ error: { message: 'IDs invalidos' } }),
    })

    const { result } = renderHook(() => useBulkCloseTickets(), { wrapper: createWrapper() })

    await expect(result.current.mutateAsync(['invalid'])).rejects.toThrow('IDs invalidos')
  })
})

describe('useBulkReassignTickets', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('faz POST /api/support/tickets/bulk com action=reassign, ids e assignee_id no body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { affected: 2 } }),
    })

    const { result } = renderHook(() => useBulkReassignTickets(), { wrapper: createWrapper() })

    await result.current.mutateAsync({ ids: ['t10', 't20'], assigneeId: 'user-abc' })

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/support/tickets/bulk')
    expect(options.method).toBe('POST')

    const body = JSON.parse(options.body as string)
    expect(body.action).toBe('reassign')
    expect(body.ids).toEqual(['t10', 't20'])
    expect(body.assignee_id).toBe('user-abc')
  })

  it('retorna affected count correto', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { affected: 5 } }),
    })

    const { result } = renderHook(() => useBulkReassignTickets(), { wrapper: createWrapper() })

    const res = await result.current.mutateAsync({
      ids: ['t1', 't2', 't3', 't4', 't5'],
      assigneeId: 'user-xyz',
    })
    expect(res.affected).toBe(5)
  })

  it('invalida queries de support-tickets apos sucesso', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { affected: 1 } }),
    })

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useBulkReassignTickets(), { wrapper })

    await result.current.mutateAsync({ ids: ['t1'], assigneeId: 'user-def' })

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledOnce())
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ticketKeys.all,
    })
  })

  it('lanca erro quando resposta nao e ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: { message: 'Sem permissao para reatribuir' } }),
    })

    const { result } = renderHook(() => useBulkReassignTickets(), { wrapper: createWrapper() })

    await expect(
      result.current.mutateAsync({ ids: ['t1'], assigneeId: 'user-abc' })
    ).rejects.toThrow('Sem permissao para reatribuir')
  })
})
