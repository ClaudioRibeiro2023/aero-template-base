import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  userKeys,
} from '../../hooks/useUsers'

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

describe('userKeys', () => {
  it('gera keys corretas', () => {
    expect(userKeys.all).toEqual(['users'])
    expect(userKeys.lists()).toEqual(['users', 'list'])
    expect(userKeys.list({ role: 'ADMIN' })).toEqual(['users', 'list', { role: 'ADMIN' }])
    expect(userKeys.detail('abc')).toEqual(['users', 'detail', 'abc'])
  })
})

describe('useUsers', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('retorna lista paginada de usuarios com sucesso', async () => {
    // fetchJson unwraps json.data, so the HTTP body must be { data: { data: [...], meta } }
    const innerPayload = {
      data: [
        {
          id: 'u1',
          email: 'joao@empresa.com',
          display_name: 'Joao Silva',
          avatar_url: null,
          phone: null,
          department: 'TI',
          role: 'ADMIN',
          is_active: true,
          tenant_id: null,
          metadata: {},
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        {
          id: 'u2',
          email: 'maria@empresa.com',
          display_name: 'Maria Santos',
          avatar_url: null,
          phone: null,
          department: 'RH',
          role: 'VIEWER',
          is_active: true,
          tenant_id: null,
          metadata: {},
          created_at: '2026-01-02T00:00:00Z',
          updated_at: '2026-01-02T00:00:00Z',
        },
      ],
      meta: { page: 1, page_size: 10, total: 2, pages: 1 },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: innerPayload }),
    })

    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toHaveLength(2)
    expect(result.current.data?.total).toBe(2)
    expect(result.current.data?.items[0].display_name).toBe('Joao Silva')
  })

  it('constroi URL com filtros de role e search', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          data: [],
          meta: { page: 1, page_size: 10, total: 0, pages: 0 },
        },
      }),
    })

    const { result } = renderHook(() => useUsers({ role: 'ADMIN', search: 'joao' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => result.current.isSuccess)
    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('role=ADMIN')
    expect(calledUrl).toContain('search=joao')
  })

  it('lanca erro quando resposta nao e ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: { message: 'Internal Server Error' } }),
    })

    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Internal Server Error')
  })
})

describe('useCreateUser', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('faz POST /api/users e retorna usuario criado', async () => {
    const newUser = {
      id: 'new-id',
      email: 'novo@empresa.com',
      display_name: 'Novo Usuario',
      avatar_url: null,
      phone: null,
      department: null,
      role: 'VIEWER',
      is_active: true,
      tenant_id: null,
      metadata: {},
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: newUser }),
    })

    const { result } = renderHook(() => useCreateUser(), { wrapper: createWrapper() })

    await result.current.mutateAsync({
      email: 'novo@empresa.com',
      display_name: 'Novo Usuario',
      role: 'VIEWER',
    })

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/users')
    expect(options.method).toBe('POST')
    const body = JSON.parse(options.body as string)
    expect(body.email).toBe('novo@empresa.com')
    expect(body.display_name).toBe('Novo Usuario')
  })
})

describe('useUpdateUser', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('faz PUT /api/users/:id e retorna usuario atualizado', async () => {
    const updatedUser = {
      id: 'user-123',
      email: 'joao@empresa.com',
      display_name: 'Joao Atualizado',
      avatar_url: null,
      phone: null,
      department: 'TI',
      role: 'GESTOR',
      is_active: true,
      tenant_id: null,
      metadata: {},
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: updatedUser }),
    })

    const { result } = renderHook(() => useUpdateUser(), { wrapper: createWrapper() })

    await result.current.mutateAsync({
      id: 'user-123',
      data: { display_name: 'Joao Atualizado', role: 'GESTOR' },
    })

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/users/user-123')
    expect(options.method).toBe('PUT')
    const body = JSON.parse(options.body as string)
    expect(body.display_name).toBe('Joao Atualizado')
    expect(body.role).toBe('GESTOR')
  })
})

describe('useDeleteUser', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('faz DELETE /api/users/:id', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    const { result } = renderHook(() => useDeleteUser(), { wrapper: createWrapper() })
    await result.current.mutateAsync('user-uuid-456')

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/users/user-uuid-456')
    expect(options?.method).toBe('DELETE')
  })
})
