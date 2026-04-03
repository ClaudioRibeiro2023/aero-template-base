import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import React, { type ReactNode } from 'react'
import { AuthContext } from '@template/shared/auth/AuthContext.shared'
import { useAuth } from '../../hooks/useAuth'
import type { AuthContextType } from '@template/types'

// ── Mock mínimo de AuthContextType ──
function makeMockAuth(overrides?: Partial<AuthContextType>): AuthContextType {
  return {
    user: null,
    profile: null,
    isLoading: false,
    isAuthenticated: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
    ...overrides,
  } as unknown as AuthContextType
}

function makeWrapper(value: AuthContextType) {
  return ({ children }: { children: ReactNode }) =>
    React.createElement(AuthContext.Provider, { value }, children)
}

describe('useAuth', () => {
  it('lanca erro quando usado fora de AuthProvider', () => {
    // renderHook sem wrapper — contexto undefined
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider (Supabase or Demo)'
    )
  })

  it('retorna contexto de auth quando dentro de AuthProvider', () => {
    const mockAuth = makeMockAuth()
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(mockAuth) })
    expect(result.current).toBe(mockAuth)
  })

  it('reflete isLoading true quando provider esta carregando', () => {
    const mockAuth = makeMockAuth({ isLoading: true })
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(mockAuth) })
    expect(result.current.isLoading).toBe(true)
  })

  it('reflete usuario autenticado quando provider tem user', () => {
    const mockUser = { id: 'user-123', email: 'joao@empresa.com' } as AuthContextType['user']
    const mockAuth = makeMockAuth({ user: mockUser, isAuthenticated: true })
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(mockAuth) })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.id).toBe('user-123')
    expect(result.current.user?.email).toBe('joao@empresa.com')
  })

  it('expoe funcoes de autenticacao (signIn, signOut, signUp)', () => {
    const mockAuth = makeMockAuth()
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(mockAuth) })
    expect(typeof result.current.signIn).toBe('function')
    expect(typeof result.current.signOut).toBe('function')
    expect(typeof result.current.signUp).toBe('function')
  })
})
