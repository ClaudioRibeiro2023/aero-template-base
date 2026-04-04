/**
 * Testes da API route /api/audit-logs (GET).
 * Mockam: rate-limit, auth-guard, supabase-server, api-response.
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

// ── Mock supabase-server ──
const mockFrom = vi.fn()
vi.mock('@/app/lib/supabase-server', () => ({
  createServerSupabase: vi.fn(() => ({
    from: mockFrom,
  })),
}))

// ── Helper: cria NextRequest simulado ──
function makeRequest(options: { url?: string } = {}) {
  const { url = 'http://localhost:3000/api/audit-logs' } = options
  return {
    method: 'GET',
    url,
    headers: new Map([['x-forwarded-for', '127.0.0.1']]),
  } as unknown as import('next/server').NextRequest
}

// ── Helper: chain de supabase query ──
function makeQueryChain(result: { data?: unknown; error?: unknown; count?: number }) {
  const promise = Promise.resolve(result)
  const chain = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    then: (onfulfilled: (v: unknown) => unknown, onrejected?: (r: unknown) => unknown) =>
      promise.then(onfulfilled, onrejected),
  }
  return chain
}

describe('GET /api/audit-logs', () => {
  beforeEach(() => {
    vi.resetModules()
    mockRateLimit.mockReturnValue({ success: true, remaining: 99 })
  })

  it('retorna 401 quando usuario nao esta autenticado', async () => {
    mockGetAuthUser.mockResolvedValueOnce({ user: null, error: 'Unauthorized' })
    const { GET } = await import('../../app/api/audit-logs/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('retorna 403 quando usuario nao e ADMIN', async () => {
    mockGetAuthUser.mockResolvedValueOnce({
      user: { id: 'g1', email: 'gestor@empresa.com', role: 'GESTOR' },
      error: null,
    })
    const { GET } = await import('../../app/api/audit-logs/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(403)
  })

  it('retorna 429 quando rate limit excedido', async () => {
    mockRateLimit.mockReturnValueOnce({ success: false, remaining: 0 })
    const { GET } = await import('../../app/api/audit-logs/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(429)
  })

  it('retorna lista de audit logs para ADMIN autenticado', async () => {
    mockGetAuthUser.mockResolvedValueOnce({
      user: { id: 'admin-1', email: 'admin@empresa.com', role: 'ADMIN' },
      error: null,
    })

    const logs = [
      {
        id: 'log-1',
        user_id: 'u1',
        action: 'CREATE',
        resource: 'users',
        resource_id: 'u2',
        ip_address: '127.0.0.1',
        created_at: '2026-01-01T00:00:00Z',
      },
    ]

    const chain = makeQueryChain({ data: logs, error: null, count: 1 })
    mockFrom.mockReturnValue(chain)

    const { GET } = await import('../../app/api/audit-logs/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.items).toHaveLength(1)
    expect(body.data.total).toBe(1)
  })

  it('aplica filtro de action quando parametro fornecido', async () => {
    mockGetAuthUser.mockResolvedValueOnce({
      user: { id: 'admin-1', email: 'admin@empresa.com', role: 'ADMIN' },
      error: null,
    })

    const chain = makeQueryChain({ data: [], error: null, count: 0 })
    mockFrom.mockReturnValue(chain)

    const { GET } = await import('../../app/api/audit-logs/route')
    const res = await GET(
      makeRequest({ url: 'http://localhost:3000/api/audit-logs?action=DELETE' })
    )
    expect(res.status).toBe(200)
    expect(chain.eq).toHaveBeenCalledWith('action', 'DELETE')
  })

  it('retorna lista vazia quando tabela nao existe (db error)', async () => {
    mockGetAuthUser.mockResolvedValueOnce({
      user: { id: 'admin-1', email: 'admin@empresa.com', role: 'ADMIN' },
      error: null,
    })

    const chain = makeQueryChain({
      data: null,
      error: { message: 'relation does not exist' },
      count: 0,
    })
    mockFrom.mockReturnValue(chain)

    const { GET } = await import('../../app/api/audit-logs/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.items).toEqual([])
  })

  it('retorna 403 para VIEWER', async () => {
    mockGetAuthUser.mockResolvedValueOnce({
      user: { id: 'v1', email: 'viewer@empresa.com', role: 'VIEWER' },
      error: null,
    })
    const { GET } = await import('../../app/api/audit-logs/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(403)
  })
})
