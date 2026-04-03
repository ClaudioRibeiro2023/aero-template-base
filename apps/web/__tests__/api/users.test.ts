/**
 * Testes da API route /api/users (GET + POST).
 * Mockam: rate-limit, auth-guard, supabase-server.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock next/server ──
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}))

// ── Mock rate-limit ──
const mockRateLimit = vi.fn(() => ({ success: true, remaining: 99 }))
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
  getClientIp: vi.fn(() => '127.0.0.1'),
}))

// ── Mock auth-guard ──
const mockGetAuthUser = vi.fn()
vi.mock('@/lib/auth-guard', () => ({
  getAuthUser: () => mockGetAuthUser(),
}))

// ── Mock supabase-server (service role) ──
const mockAdminCreateUser = vi.fn()
const mockFrom = vi.fn()
vi.mock('@/app/lib/supabase-server', () => ({
  createServerSupabase: vi.fn(() => ({
    from: mockFrom,
    auth: {
      admin: { createUser: mockAdminCreateUser },
    },
  })),
}))

// ── Mock @template/shared/schemas ──
vi.mock('@template/shared/schemas', () => ({
  userCreateSchema: {
    safeParse: vi.fn((data: unknown) => ({ success: true, data })),
  },
}))

// ── Helper: cria NextRequest simulado ──
function makeRequest(options: { method?: string; url?: string; body?: unknown }) {
  const { method = 'GET', url = 'http://localhost:3000/api/users', body } = options
  return {
    method,
    url,
    headers: new Map([['x-forwarded-for', '127.0.0.1']]),
    json: vi.fn(async () => body),
  } as unknown as import('next/server').NextRequest
}

// ── Helper: chain de supabase query ──
function makeQueryChain(result: { data?: unknown; error?: unknown; count?: number }) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    then: undefined as unknown,
  }
  const promise = Promise.resolve(result)
  Object.assign(chain, promise)
  return chain
}

describe('GET /api/users', () => {
  beforeEach(() => {
    vi.resetModules()
    mockRateLimit.mockReturnValue({ success: true, remaining: 99 })
  })

  it('retorna 401 quando usuario nao esta autenticado', async () => {
    mockGetAuthUser.mockResolvedValueOnce({ user: null, error: 'Unauthorized' })
    const { GET } = await import('../../app/api/users/route')
    const req = makeRequest({})
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('retorna 403 quando usuario nao e ADMIN nem GESTOR', async () => {
    mockGetAuthUser.mockResolvedValueOnce({
      user: { id: 'u1', email: 'v@empresa.com', role: 'VIEWER' },
      error: null,
    })
    const { GET } = await import('../../app/api/users/route')
    const req = makeRequest({})
    const res = await GET(req)
    expect(res.status).toBe(403)
  })

  it('retorna 429 quando rate limit excedido', async () => {
    mockRateLimit.mockReturnValueOnce({ success: false, remaining: 0 })
    const { GET } = await import('../../app/api/users/route')
    const req = makeRequest({})
    const res = await GET(req)
    expect(res.status).toBe(429)
  })

  it('retorna lista de usuarios para ADMIN autenticado', async () => {
    mockGetAuthUser.mockResolvedValueOnce({
      user: { id: 'admin-1', email: 'admin@empresa.com', role: 'ADMIN' },
      error: null,
    })

    const profiles = [
      {
        id: 'u1',
        email: 'joao@empresa.com',
        display_name: 'Joao',
        role: 'VIEWER',
        is_active: true,
        department: 'TI',
        avatar_url: null,
        phone: null,
        tenant_id: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ]

    const chain = makeQueryChain({ data: profiles, error: null, count: 1 })
    mockFrom.mockReturnValue(chain)

    const { GET } = await import('../../app/api/users/route')
    const req = makeRequest({ url: 'http://localhost:3000/api/users' })
    const res = await GET(req)
    expect(res.status).toBe(200)
  })

  it('retorna lista de usuarios para GESTOR autenticado', async () => {
    mockGetAuthUser.mockResolvedValueOnce({
      user: { id: 'gestor-1', email: 'gestor@empresa.com', role: 'GESTOR' },
      error: null,
    })

    const chain = makeQueryChain({ data: [], error: null, count: 0 })
    mockFrom.mockReturnValue(chain)

    const { GET } = await import('../../app/api/users/route')
    const req = makeRequest({})
    const res = await GET(req)
    expect(res.status).toBe(200)
  })
})

describe('POST /api/users', () => {
  beforeEach(() => {
    vi.resetModules()
    mockRateLimit.mockReturnValue({ success: true, remaining: 99 })
  })

  it('retorna 401 quando usuario nao esta autenticado', async () => {
    mockGetAuthUser.mockResolvedValueOnce({ user: null, error: 'Unauthorized' })
    const { POST } = await import('../../app/api/users/route')
    const req = makeRequest({ method: 'POST', body: {} })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('retorna 403 quando usuario nao e ADMIN', async () => {
    mockGetAuthUser.mockResolvedValueOnce({
      user: { id: 'g1', email: 'gestor@empresa.com', role: 'GESTOR' },
      error: null,
    })
    const { POST } = await import('../../app/api/users/route')
    const req = makeRequest({ method: 'POST', body: {} })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('cria usuario com sucesso e retorna 201', async () => {
    mockGetAuthUser.mockResolvedValueOnce({
      user: { id: 'admin-1', email: 'admin@empresa.com', role: 'ADMIN' },
      error: null,
    })

    const newUser = { id: 'new-uuid', email: 'novo@empresa.com' }
    mockAdminCreateUser.mockResolvedValueOnce({
      data: { user: newUser },
      error: null,
    })

    const profile = {
      id: 'new-uuid',
      email: 'novo@empresa.com',
      display_name: 'Novo Usuario',
      role: 'VIEWER',
      is_active: true,
      department: null,
      avatar_url: null,
      phone: null,
      tenant_id: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }

    const chain = makeQueryChain({ data: profile, error: null })
    mockFrom.mockReturnValue(chain)

    const { POST } = await import('../../app/api/users/route')
    const req = makeRequest({
      method: 'POST',
      body: {
        email: 'novo@empresa.com',
        display_name: 'Novo Usuario',
        role: 'VIEWER',
        is_active: true,
      },
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })
})
