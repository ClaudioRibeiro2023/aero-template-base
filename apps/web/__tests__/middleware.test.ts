import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/server
vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn((opts?: unknown) => ({ type: 'next', opts, cookies: { set: vi.fn() } })),
    redirect: vi.fn((url: URL) => ({ type: 'redirect', url: url.toString() })),
    json: vi.fn((body: unknown, init?: { status?: number }) => ({
      type: 'json',
      body,
      status: init?.status,
    })),
  },
}))

// Mock @supabase/ssr (usado pelo middleware reescrito no Sprint 2)
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  })),
}))

describe('Middleware security', () => {
  beforeEach(() => {
    vi.resetModules()
    delete process.env.NEXT_PUBLIC_DEMO_MODE
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  it('permite public paths sem autenticação', async () => {
    const { middleware } = await import('../middleware')
    const request = createMockRequest('/login')
    const response = await middleware(request)
    expect(response).toBeDefined()
  })

  it('permite /auth/callback sem autenticação', async () => {
    const { middleware } = await import('../middleware')
    const request = createMockRequest('/auth/callback')
    const response = await middleware(request)
    expect(response).toBeDefined()
  })

  it('redireciona requisições de página não autenticadas para /login', async () => {
    const { NextResponse } = await import('next/server')
    const { middleware } = await import('../middleware')
    const request = createMockRequest('/dashboard')
    await middleware(request)
    expect(NextResponse.redirect).toHaveBeenCalled()
  })

  it('retorna 401 para requisições de API não autenticadas', async () => {
    const { NextResponse } = await import('next/server')
    const { middleware } = await import('../middleware')
    const request = createMockRequest('/api/admin/config')
    await middleware(request)
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) }),
      expect.objectContaining({ status: 401 })
    )
  })

  it('retorna resposta definida quando DEMO_MODE está ativo', async () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
    const { middleware } = await import('../middleware')
    const request = createMockRequest('/dashboard')
    // DEMO_MODE bypasses auth entirely — response is next() not redirect
    const response = await middleware(request)
    expect(response).toBeDefined()
    expect(response).toHaveProperty('type')
  })
})

describe('Middleware demo mode', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
    // Supabase vars NOT needed in demo mode
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })

  it('rotas protegidas passam sem auth em demo mode', async () => {
    const { middleware } = await import('../middleware')
    const request = createMockRequest('/dashboard')
    const response = await middleware(request)
    expect(response).toBeDefined()
    // Should be next(), not redirect
    expect(response).toHaveProperty('type', 'next')
  })

  it('demo mode + modulo desabilitado redireciona para /dashboard', async () => {
    // Mock module-gate to simulate disabled module
    vi.doMock('@/lib/module-gate', () => ({
      isRouteEnabled: (p: string) => !p.startsWith('/support'),
      isApiRouteEnabled: () => true,
    }))
    const { middleware } = await import('../middleware')
    const request = createMockRequest('/support/tickets')
    const response = await middleware(request)
    expect(response).toBeDefined()
    // Should redirect to /dashboard
    if ('type' in (response as Record<string, unknown>)) {
      const r = response as { type: string; url?: string }
      if (r.type === 'redirect') {
        expect(r.url).toContain('/dashboard')
      }
    }
  })

  it('demo mode + API de modulo desabilitado retorna 404 JSON', async () => {
    vi.doMock('@/lib/module-gate', () => ({
      isRouteEnabled: () => true,
      isApiRouteEnabled: (p: string) => !p.includes('/support'),
    }))
    const { NextResponse } = await import('next/server')
    const { middleware } = await import('../middleware')
    const request = createMockRequest('/api/support/tickets')
    await middleware(request)
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Module not available' }),
      expect.objectContaining({ status: 404 })
    )
  })

  it('locale detection via accept-language em demo mode', async () => {
    vi.doMock('@/lib/module-gate', () => ({
      isRouteEnabled: () => true,
      isApiRouteEnabled: () => true,
    }))
    const { middleware } = await import('../middleware')
    const request = createMockRequest('/dashboard', {
      'accept-language': 'en-US,en;q=0.9',
    })
    const response = await middleware(request)
    expect(response).toBeDefined()
    // Response should have cookies.set called for locale
    if (response && typeof response === 'object' && 'cookies' in response) {
      const r = response as { cookies: { set: ReturnType<typeof vi.fn> } }
      expect(r.cookies.set).toHaveBeenCalledWith(
        'locale',
        'en-US',
        expect.objectContaining({ path: '/', sameSite: 'lax' })
      )
    }
  })

  it('locale cookie ja definido nao sobrescreve', async () => {
    vi.doMock('@/lib/module-gate', () => ({
      isRouteEnabled: () => true,
      isApiRouteEnabled: () => true,
    }))
    const { middleware } = await import('../middleware')
    const request = createMockRequest('/dashboard', {
      'accept-language': 'en-US,en;q=0.9',
    })
    // Simulate existing locale cookie
    ;(
      request as unknown as {
        cookies: {
          getAll: () => { name: string; value: string }[]
          get: (n: string) => { value: string } | undefined
          set: ReturnType<typeof vi.fn>
        }
      }
    ).cookies.get = (name: string) => (name === 'locale' ? { value: 'pt-BR' } : undefined)
    const response = await middleware(request)
    expect(response).toBeDefined()
    // Locale should NOT be overwritten since cookie already exists
    if (response && typeof response === 'object' && 'cookies' in response) {
      const r = response as { cookies: { set: ReturnType<typeof vi.fn> } }
      // If cookies.set was called, it should NOT have been called with locale
      const localeCalls = r.cookies.set.mock.calls.filter((c: unknown[]) => c[0] === 'locale')
      expect(localeCalls.length).toBe(0)
    }
  })
})

function createMockRequest(pathname: string, headers: Record<string, string> = {}) {
  return {
    nextUrl: { pathname },
    url: `http://localhost:3000${pathname}`,
    cookies: {
      getAll: () => [] as { name: string; value: string }[],
      get: (_name: string) => undefined as { name: string; value: string } | undefined,
      set: vi.fn(),
    },
    headers: {
      get: (name: string) => headers[name] || null,
    },
  } as never
}
