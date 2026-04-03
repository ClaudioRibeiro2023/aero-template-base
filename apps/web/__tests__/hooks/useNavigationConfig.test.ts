import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// ── Mock useAuth ──
const mockHasAnyRole = vi.fn(() => true)
vi.mock('@template/shared', () => ({
  useAuth: () => ({
    hasAnyRole: mockHasAnyRole,
  }),
}))

// ── Mock navigation defaults (inline to avoid hoisting issues) ──
vi.mock('@/config/navigation-default', () => ({
  DEFAULT_NAVIGATION_CONFIG: {
    modules: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'LayoutDashboard',
        enabled: true,
        roles: [] as string[],
        order: 1,
        functions: [],
      },
      {
        id: 'admin',
        label: 'Admin',
        path: '/admin',
        icon: 'Shield',
        enabled: true,
        roles: ['ADMIN'] as string[],
        order: 2,
        functions: [],
      },
      {
        id: 'disabled-mod',
        label: 'Desabilitado',
        path: '/disabled',
        icon: 'X',
        enabled: false,
        roles: [] as string[],
        order: 3,
        functions: [],
      },
    ],
    filters: [
      { id: 'f1', label: 'Global', enabled: true, order: 1, appliesTo: { global: true } },
      { id: 'f2', label: 'Desabilitado', enabled: false, order: 2, appliesTo: { global: true } },
    ],
    categories: [
      { id: 'C1', label: 'Cat A', order: 2, defaultExpanded: true },
      { id: 'C2', label: 'Cat B', order: 1, defaultExpanded: false },
    ],
    branding: undefined,
  },
}))

// ── Mock global fetch ──
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { useNavigationConfig } from '../../hooks/useNavigationConfig'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useNavigationConfig', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    mockHasAnyRole.mockReset()
    mockHasAnyRole.mockReturnValue(true)
  })

  it('retorna config padrao via initialData imediatamente', () => {
    // The hook has initialData, so it returns defaults synchronously
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useNavigationConfig(), {
      wrapper: createWrapper(),
    })

    // initialData means config is available immediately
    expect(result.current.config.modules).toHaveLength(3)
    expect(result.current.config.modules[0].id).toBe('dashboard')
  })

  it('chama refresh para invalidar e recarregar config da API', async () => {
    // First render with defaults (initialData)
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          navigation: [
            {
              id: 'api-module',
              label: 'Da API',
              path: '/api-mod',
              icon: 'Globe',
              enabled: true,
              roles: [],
              order: 1,
              functions: [],
            },
          ],
        },
      }),
    })

    const { result } = renderHook(() => useNavigationConfig(), {
      wrapper: createWrapper(),
    })

    // Initially has defaults via initialData
    expect(result.current.config.modules).toHaveLength(3)

    // Trigger refresh which invalidates the query
    await result.current.refresh()

    await waitFor(() => {
      // After refresh, config should be updated from API
      expect(result.current.config.modules).toHaveLength(1)
      expect(result.current.config.modules[0].id).toBe('api-module')
    })
  })

  it('filtra modulos desabilitados em authorizedModules', () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Not found' } }),
    })

    const { result } = renderHook(() => useNavigationConfig(), {
      wrapper: createWrapper(),
    })

    // initialData provides config immediately
    const ids = result.current.authorizedModules.map(m => m.id)
    expect(ids).not.toContain('disabled-mod')
    // dashboard and admin should be present (hasAnyRole returns true)
    expect(ids).toContain('dashboard')
    expect(ids).toContain('admin')
  })

  it('filtra modulos por role quando hasAnyRole retorna false', () => {
    mockHasAnyRole.mockReturnValue(false)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Fail' } }),
    })

    const { result } = renderHook(() => useNavigationConfig(), {
      wrapper: createWrapper(),
    })

    const ids = result.current.authorizedModules.map(m => m.id)
    // Dashboard (roles=[]) should pass, Admin (roles=['ADMIN']) should be excluded
    expect(ids).toContain('dashboard')
    expect(ids).not.toContain('admin')
  })

  it('retorna filtros habilitados ordenados', () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Fail' } }),
    })

    const { result } = renderHook(() => useNavigationConfig(), {
      wrapper: createWrapper(),
    })

    // Only enabled filter
    expect(result.current.filters).toHaveLength(1)
    expect(result.current.filters[0].id).toBe('f1')
  })

  it('retorna categorias ordenadas por order', () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Fail' } }),
    })

    const { result } = renderHook(() => useNavigationConfig(), {
      wrapper: createWrapper(),
    })

    expect(result.current.categories[0].id).toBe('C2') // order 1
    expect(result.current.categories[1].id).toBe('C1') // order 2
  })

  it('getModuleByPath retorna modulo mais especifico', () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Fail' } }),
    })

    const { result } = renderHook(() => useNavigationConfig(), {
      wrapper: createWrapper(),
    })

    expect(result.current.getModuleByPath('/dashboard')).toBeDefined()
    expect(result.current.getModuleByPath('/dashboard')?.id).toBe('dashboard')
    expect(result.current.getModuleByPath('/nonexistent')).toBeUndefined()
  })

  it('fallback para defaults quando API retorna json sem navigation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: {} }), // sem .navigation
    })

    const { result } = renderHook(() => useNavigationConfig(), {
      wrapper: createWrapper(),
    })

    // queryFn returns DEFAULT when no navigation in response
    await waitFor(() => {
      expect(result.current.config.modules).toHaveLength(3)
    })
  })

  it('fallback para defaults quando fetch falha completamente', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useNavigationConfig(), {
      wrapper: createWrapper(),
    })

    // queryFn catches errors and returns DEFAULT
    await waitFor(() => {
      expect(result.current.config.modules).toHaveLength(3)
      // error should be null since queryFn catches and returns defaults
      expect(result.current.error).toBeNull()
    })
  })
})
