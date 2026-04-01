import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '../../hooks/useRoles'

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

describe('useRoles', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('retorna lista de roles com sucesso', async () => {
    const mockData = {
      data: {
        items: [
          {
            id: 'role-1',
            tenant_id: null,
            name: 'ADMIN',
            display_name: 'Administrador',
            description: 'Acesso total',
            permissions: ['DASHBOARD.VIEW', 'ADMIN.ADMIN'],
            is_system: true,
            hierarchy_level: 100,
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
            user_count: 2,
          },
        ],
        total: 1,
      },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const { result } = renderHook(() => useRoles(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toHaveLength(1)
    expect(result.current.data?.items[0].name).toBe('ADMIN')
  })

  it('lanca erro quando resposta nao e ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Unauthorized' } }),
    })

    const { result } = renderHook(() => useRoles(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Unauthorized')
  })
})

describe('useCreateRole', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('faz POST /api/admin/roles e retorna role criada', async () => {
    const newRole = {
      id: 'role-new',
      tenant_id: null,
      name: 'EDITOR',
      display_name: 'Editor',
      description: '',
      permissions: ['DASHBOARD.VIEW'],
      is_system: false,
      hierarchy_level: 10,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: newRole }),
    })

    const { result } = renderHook(() => useCreateRole(), { wrapper: createWrapper() })

    await result.current.mutateAsync({
      name: 'EDITOR',
      display_name: 'Editor',
      permissions: ['DASHBOARD.VIEW'],
      hierarchy_level: 10,
    })

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/admin/roles')
    expect(options.method).toBe('POST')
    const body = JSON.parse(options.body as string)
    expect(body.name).toBe('EDITOR')
    expect(body.display_name).toBe('Editor')
    expect(body.permissions).toEqual(['DASHBOARD.VIEW'])
  })
})

describe('useUpdateRole', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('faz PUT /api/admin/roles/:id', async () => {
    const updated = {
      id: 'role-1',
      tenant_id: null,
      name: 'EDITOR',
      display_name: 'Editor Atualizado',
      description: 'Descricao nova',
      permissions: ['DASHBOARD.VIEW', 'RELATORIOS.VIEW'],
      is_system: false,
      hierarchy_level: 20,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: updated }),
    })

    const { result } = renderHook(() => useUpdateRole('role-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      display_name: 'Editor Atualizado',
      permissions: ['DASHBOARD.VIEW', 'RELATORIOS.VIEW'],
      hierarchy_level: 20,
    })

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/admin/roles/role-1')
    expect(options.method).toBe('PUT')
    const body = JSON.parse(options.body as string)
    expect(body.display_name).toBe('Editor Atualizado')
    expect(body.permissions).toHaveLength(2)
    expect(body.hierarchy_level).toBe(20)
  })
})

describe('useDeleteRole', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('faz DELETE /api/admin/roles/:id', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { deleted: true } }),
    })

    const { result } = renderHook(() => useDeleteRole(), { wrapper: createWrapper() })
    await result.current.mutateAsync('role-1')

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/admin/roles/role-1')
    expect(options.method).toBe('DELETE')
  })

  it('lanca erro quando delete falha', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'Cannot delete system role' } }),
    })

    const { result } = renderHook(() => useDeleteRole(), { wrapper: createWrapper() })
    await expect(result.current.mutateAsync('role-sys')).rejects.toThrow(
      'Cannot delete system role'
    )
  })
})
