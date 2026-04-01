import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useFeatureFlags,
  useCreateFeatureFlag,
  useUpdateFeatureFlag,
  useDeleteFeatureFlag,
} from '../../hooks/useFeatureFlagsAdmin'

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

describe('useFeatureFlags', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('retorna lista de feature flags com sucesso', async () => {
    const mockData = {
      data: {
        items: [
          {
            id: 'ff-1',
            tenant_id: null,
            flag_name: 'dark-mode',
            description: 'Habilita modo escuro',
            enabled: true,
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
        ],
        total: 1,
      },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const { result } = renderHook(() => useFeatureFlags(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toHaveLength(1)
    expect(result.current.data?.items[0].flag_name).toBe('dark-mode')
  })

  it('lanca erro quando resposta nao e ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: { message: 'Internal Server Error' } }),
    })

    const { result } = renderHook(() => useFeatureFlags(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Internal Server Error')
  })
})

describe('useCreateFeatureFlag', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('faz POST /api/feature-flags e retorna flag criada', async () => {
    const newFlag = {
      id: 'ff-new',
      tenant_id: null,
      flag_name: 'new-feature',
      description: '',
      enabled: false,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: newFlag }),
    })

    const { result } = renderHook(() => useCreateFeatureFlag(), { wrapper: createWrapper() })

    await result.current.mutateAsync({ flag_name: 'new-feature' })

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/feature-flags')
    expect(options.method).toBe('POST')
    const body = JSON.parse(options.body as string)
    expect(body.flag_name).toBe('new-feature')
  })
})

describe('useUpdateFeatureFlag', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('faz PATCH /api/feature-flags/:id', async () => {
    const updated = {
      id: 'ff-1',
      tenant_id: null,
      flag_name: 'dark-mode',
      description: 'Atualizado',
      enabled: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: updated }),
    })

    const { result } = renderHook(() => useUpdateFeatureFlag('ff-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ enabled: true, description: 'Atualizado' })

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/feature-flags/ff-1')
    expect(options.method).toBe('PATCH')
    const body = JSON.parse(options.body as string)
    expect(body.enabled).toBe(true)
    expect(body.description).toBe('Atualizado')
  })
})

describe('useDeleteFeatureFlag', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('faz DELETE /api/feature-flags/:id', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { deleted: true } }),
    })

    const { result } = renderHook(() => useDeleteFeatureFlag(), { wrapper: createWrapper() })
    await result.current.mutateAsync('ff-1')

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/feature-flags/ff-1')
    expect(options.method).toBe('DELETE')
  })

  it('lanca erro quando delete falha', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: { message: 'Forbidden' } }),
    })

    const { result } = renderHook(() => useDeleteFeatureFlag(), { wrapper: createWrapper() })

    await expect(result.current.mutateAsync('ff-1')).rejects.toThrow('Forbidden')
  })
})
