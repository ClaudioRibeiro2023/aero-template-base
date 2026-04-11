/**
 * Testes da API route /api/audit-logs (GET).
 * v3.0: Mockam @/lib/data (getAuthGateway, getRepository) em vez de auth-guard + supabase-server.
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

// ── Mock logger ──
vi.mock('@/lib/logger', () => ({
  withApiLog: (_name: string, handler: unknown) => handler,
}))

// ── Mock @/lib/data (v3.0) ──
const mockGetUser = vi.fn()
const mockFindMany = vi.fn()
const mockFindManyGraceful = vi.fn()

vi.mock('@/lib/data', () => ({
  getAuthGateway: vi.fn(() => ({ getUser: mockGetUser })),
  getRepository: vi.fn(() => ({
    findMany: mockFindMany,
    findManyGraceful: mockFindManyGraceful,
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
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

describe('GET /api/audit-logs', () => {
  beforeEach(() => {
    vi.resetModules()
    mockRateLimit.mockReturnValue({ success: true, remaining: 99 })
    mockGetUser.mockReset()
    mockFindMany.mockReset()
    mockFindManyGraceful.mockReset()
  })

  it('retorna 401 quando usuario nao esta autenticado', async () => {
    mockGetUser.mockResolvedValueOnce({ user: null, error: 'Não autenticado' })
    const { GET } = await import('../../app/api/audit-logs/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('retorna 403 quando usuario nao e ADMIN', async () => {
    mockGetUser.mockResolvedValueOnce({
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
    mockGetUser.mockResolvedValueOnce({
      user: { id: 'admin-1', email: 'admin@empresa.com', role: 'ADMIN' },
      error: null,
    })
    const logs = [
      {
        id: 'log-1',
        user_id: 'u1',
        action: 'CREATE',
        resource: 'users',
        created_at: '2026-01-01T00:00:00Z',
      },
    ]
    mockFindManyGraceful.mockResolvedValueOnce({ data: logs, total: 1, pages: 1 })

    const { GET } = await import('../../app/api/audit-logs/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
  })

  it('aplica filtro de action quando parametro fornecido', async () => {
    mockGetUser.mockResolvedValueOnce({
      user: { id: 'admin-1', email: 'admin@empresa.com', role: 'ADMIN' },
      error: null,
    })
    mockFindManyGraceful.mockResolvedValueOnce({ data: [], total: 0, pages: 0 })

    const { GET } = await import('../../app/api/audit-logs/route')
    const res = await GET(
      makeRequest({ url: 'http://localhost:3000/api/audit-logs?action=DELETE' })
    )
    expect(res.status).toBe(200)
    expect(mockFindManyGraceful).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.arrayContaining([
          expect.objectContaining({ field: 'action', value: 'DELETE' }),
        ]),
      })
    )
  })

  it('retorna 403 para VIEWER', async () => {
    mockGetUser.mockResolvedValueOnce({
      user: { id: 'v1', email: 'viewer@empresa.com', role: 'VIEWER' },
      error: null,
    })
    const { GET } = await import('../../app/api/audit-logs/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(403)
  })
})
