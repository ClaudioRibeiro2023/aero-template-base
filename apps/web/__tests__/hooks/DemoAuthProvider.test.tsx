/**
 * DemoAuthProvider Tests
 *
 * Testa provider de autenticacao demo.
 * Verifica login, logout, roles e token.
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { DemoAuthProvider, useAuth } from '@template/shared/auth'

// ── Helper: componente que expoe estado do auth ──
function TestAuthConsumer() {
  const auth = useAuth()
  return (
    <div>
      <span data-testid="isAuth">{String(auth.isAuthenticated)}</span>
      <span data-testid="userId">{auth.user?.id ?? 'null'}</span>
      <span data-testid="email">{auth.user?.email ?? 'null'}</span>
      <span data-testid="name">{auth.user?.name ?? 'null'}</span>
      <span data-testid="roles">{auth.user?.roles?.join(',') ?? 'null'}</span>
      <span data-testid="isLoading">{String(auth.isLoading)}</span>
      <button data-testid="logout" onClick={() => auth.logout()}>
        Logout
      </button>
      <button data-testid="login" onClick={() => auth.login()}>
        Login
      </button>
    </div>
  )
}

function TestRoleConsumer({ role }: { role: string }) {
  const { hasRole } = useAuth()
  return <span data-testid="hasRole">{String(hasRole(role))}</span>
}

function TestAnyRoleConsumer({ roles }: { roles: string[] }) {
  const { hasAnyRole } = useAuth()
  return <span data-testid="hasAnyRole">{String(hasAnyRole(roles))}</span>
}

function TestTokenConsumer() {
  const { getAccessToken } = useAuth()
  const [token, setToken] = React.useState<string | null>(null)
  React.useEffect(() => {
    getAccessToken().then(setToken)
  }, [getAccessToken])
  return <span data-testid="token">{token ?? 'pending'}</span>
}

describe('DemoAuthProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    // Mock window.location para evitar redirect real
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '/' },
    })
  })

  it('renderiza children', () => {
    render(
      <DemoAuthProvider>
        <span data-testid="child">Hello</span>
      </DemoAuthProvider>
    )
    expect(screen.getByTestId('child')).toHaveTextContent('Hello')
  })

  it('provê demo user com id, email, name e roles', () => {
    render(
      <DemoAuthProvider>
        <TestAuthConsumer />
      </DemoAuthProvider>
    )
    expect(screen.getByTestId('userId')).toHaveTextContent('demo-user-001')
    expect(screen.getByTestId('email')).toHaveTextContent('admin@template.dev')
    expect(screen.getByTestId('name')).toHaveTextContent('Admin Demo')
    expect(screen.getByTestId('roles')).toHaveTextContent('ADMIN')
  })

  it('isAuthenticated true inicialmente, isLoading false', () => {
    render(
      <DemoAuthProvider>
        <TestAuthConsumer />
      </DemoAuthProvider>
    )
    expect(screen.getByTestId('isAuth')).toHaveTextContent('true')
    expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
  })

  it('logout torna isAuthenticated false e user null', async () => {
    vi.useFakeTimers()
    render(
      <DemoAuthProvider>
        <TestAuthConsumer />
      </DemoAuthProvider>
    )

    await act(async () => {
      screen.getByTestId('logout').click()
    })

    expect(screen.getByTestId('isAuth')).toHaveTextContent('false')
    expect(screen.getByTestId('userId')).toHaveTextContent('null')

    vi.useRealTimers()
  })

  it('login restaura user apos logout', async () => {
    vi.useFakeTimers()
    render(
      <DemoAuthProvider>
        <TestAuthConsumer />
      </DemoAuthProvider>
    )

    await act(async () => {
      screen.getByTestId('logout').click()
    })
    expect(screen.getByTestId('isAuth')).toHaveTextContent('false')

    await act(async () => {
      screen.getByTestId('login').click()
    })
    expect(screen.getByTestId('isAuth')).toHaveTextContent('true')
    expect(screen.getByTestId('userId')).toHaveTextContent('demo-user-001')

    vi.useRealTimers()
  })

  it('hasRole retorna true case-insensitive para ADMIN', () => {
    render(
      <DemoAuthProvider>
        <TestRoleConsumer role="admin" />
      </DemoAuthProvider>
    )
    expect(screen.getByTestId('hasRole')).toHaveTextContent('true')
  })

  it('hasRole retorna false para role inexistente', () => {
    render(
      <DemoAuthProvider>
        <TestRoleConsumer role="viewer" />
      </DemoAuthProvider>
    )
    expect(screen.getByTestId('hasRole')).toHaveTextContent('false')
  })

  it('hasAnyRole retorna true quando pelo menos uma role corresponde', () => {
    render(
      <DemoAuthProvider>
        <TestAnyRoleConsumer roles={['USER', 'ADMIN']} />
      </DemoAuthProvider>
    )
    expect(screen.getByTestId('hasAnyRole')).toHaveTextContent('true')
  })

  it('getAccessToken retorna demo-token', async () => {
    render(
      <DemoAuthProvider>
        <TestTokenConsumer />
      </DemoAuthProvider>
    )

    // Wait for useEffect to resolve
    await act(async () => {
      await new Promise(r => setTimeout(r, 10))
    })

    expect(screen.getByTestId('token')).toHaveTextContent('demo-token')
  })
})
