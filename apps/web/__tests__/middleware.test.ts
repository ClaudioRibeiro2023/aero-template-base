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

function createMockRequest(pathname: string, headers: Record<string, string> = {}) {
  return {
    nextUrl: { pathname },
    url: `http://localhost:3000${pathname}`,
    cookies: {
      getAll: () => [] as { name: string; value: string }[],
      set: vi.fn(),
    },
    headers: {
      get: (name: string) => headers[name] || null,
    },
  } as never
}
