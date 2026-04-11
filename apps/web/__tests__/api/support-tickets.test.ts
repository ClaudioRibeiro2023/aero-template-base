/**
 * Testes da API route /api/support/tickets (GET + POST).
 * v3.0: Mockam @/lib/data (getAuthGateway, getRepository) em vez de supabase-cookies.
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
const mockCreate = vi.fn()

vi.mock('@/lib/data', () => ({
  getAuthGateway: vi.fn(() => ({ getUser: mockGetUser })),
  getRepository: vi.fn(() => ({
    findMany: mockFindMany,
    create: mockCreate,
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  })),
}))

// ── Mock @template/shared/schemas ──
vi.mock('@template/shared/schemas', () => ({
  ticketCreateSchema: {
    safeParse: vi.fn((data: unknown) => ({ success: true, data })),
  },
}))

// ── Mock @/lib/api-guard ──
vi.mock('@/lib/api-guard', () => ({
  requireJson: vi.fn(() => null),
}))

// ── Helper: cria NextRequest simulado ──
function makeRequest(options: { method?: string; url?: string; body?: unknown } = {}) {
  const { method = 'GET', url = 'http://localhost:3000/api/support/tickets', body } = options
  return {
    method,
    url,
    headers: new Map([
      ['x-forwarded-for', '127.0.0.1'],
      ...(method !== 'GET' ? [['content-type', 'application/json'] as [string, string]] : []),
    ]),
    json: vi.fn(async () => body),
  } as unknown as import('next/server').NextRequest
}

describe('GET /api/support/tickets', () => {
  beforeEach(() => {
    vi.resetModules()
    mockRateLimit.mockReturnValue({ success: true, remaining: 99 })
    mockGetUser.mockReset()
    mockFindMany.mockReset()
  })

  it('retorna 401 quando usuario nao autenticado', async () => {
    mockGetUser.mockResolvedValueOnce({ user: null, error: 'Não autenticado' })
    const { GET } = await import('../../app/api/support/tickets/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('retorna 429 quando rate limit excedido', async () => {
    mockRateLimit.mockReturnValueOnce({ success: false, remaining: 0 })
    const { GET } = await import('../../app/api/support/tickets/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(429)
  })

  it('retorna lista de tickets para usuario autenticado', async () => {
    mockGetUser.mockResolvedValueOnce({
      user: { id: 'u1', email: 'user@empresa.com', role: 'COLABORADOR' },
      error: null,
    })
    const tickets = [{ id: 'tk1', title: 'Bug crítico', status: 'open', created_by: 'u1' }]
    mockFindMany.mockResolvedValueOnce(tickets)

    const { GET } = await import('../../app/api/support/tickets/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
  })
})

describe('POST /api/support/tickets', () => {
  beforeEach(() => {
    vi.resetModules()
    mockRateLimit.mockReturnValue({ success: true, remaining: 99 })
    mockGetUser.mockReset()
    mockCreate.mockReset()
  })

  it('retorna 401 quando usuario nao autenticado', async () => {
    mockGetUser.mockResolvedValueOnce({ user: null, error: 'Não autenticado' })
    const { POST } = await import('../../app/api/support/tickets/route')
    const res = await POST(makeRequest({ method: 'POST', body: { title: 'Novo ticket' } }))
    expect(res.status).toBe(401)
  })

  it('retorna 429 quando rate limit excedido', async () => {
    mockRateLimit.mockReturnValueOnce({ success: false, remaining: 0 })
    const { POST } = await import('../../app/api/support/tickets/route')
    const res = await POST(makeRequest({ method: 'POST' }))
    expect(res.status).toBe(429)
  })

  it('cria ticket com sucesso e retorna 201', async () => {
    mockGetUser.mockResolvedValueOnce({
      user: { id: 'u1', email: 'user@empresa.com', role: 'COLABORADOR' },
      error: null,
    })
    const newTicket = { id: 'tk-new', title: 'Novo ticket', status: 'open', created_by: 'u1' }
    mockCreate.mockResolvedValueOnce(newTicket)

    const { POST } = await import('../../app/api/support/tickets/route')
    const res = await POST(
      makeRequest({ method: 'POST', body: { title: 'Novo ticket', category: 'bug' } })
    )
    expect(res.status).toBe(201)
  })
})
