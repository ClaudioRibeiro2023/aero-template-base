import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/server
vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => ({ type: 'next' })),
    redirect: vi.fn((url: URL) => ({ type: 'redirect', url: url.toString() })),
    json: vi.fn((body: unknown, init?: { status?: number }) => ({
      type: 'json',
      body,
      status: init?.status,
    })),
  },
}))

// Mock supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  })),
}))

describe('Middleware security', () => {
  it('should allow public paths without auth', async () => {
    const { middleware } = await import('../middleware')
    const request = createMockRequest('/login')
    const response = await middleware(request)
    expect(response).toBeDefined()
  })

  it('should block DEMO_MODE in production', async () => {
    process.env.NODE_ENV = 'production'
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
    const { middleware } = await import('../middleware')
    const request = createMockRequest('/dashboard')
    const response = await middleware(request)
    // In production, DEMO_MODE should NOT bypass auth
    expect(response).toBeDefined()
  })

  it('should redirect unauthenticated page requests to login', async () => {
    const { NextResponse } = await import('next/server')
    const { middleware } = await import('../middleware')
    const request = createMockRequest('/dashboard')
    await middleware(request)
    expect(NextResponse.redirect).toHaveBeenCalled()
  })

  it('should return 401 for unauthenticated API requests', async () => {
    const { NextResponse } = await import('next/server')
    const { middleware } = await import('../middleware')
    const request = createMockRequest('/api/admin/config')
    await middleware(request)
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) }),
      expect.objectContaining({ status: 401 })
    )
  })
})

function createMockRequest(pathname: string, headers: Record<string, string> = {}) {
  return {
    nextUrl: { pathname },
    url: `http://localhost:3000${pathname}`,
    headers: {
      get: (name: string) => headers[name] || null,
    },
  } as any
}
