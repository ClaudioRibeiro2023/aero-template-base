/**
 * Testes da API route /api/support/tickets (GET + POST).
 * Mockam: rate-limit, supabase-cookies, next/server, api-guard, schemas.
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

// ── Mock rate-limit: permite por padrão ──
const mockRateLimit = vi.fn(() => ({ success: true, remaining: 99 }))
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
  getClientIp: vi.fn(() => '127.0.0.1'),
}))

// ── Mock supabase-cookies ──
const mockGetUser = vi.fn()
const mockFrom = vi.fn()
vi.mock('@/lib/supabase-cookies', () => ({
  createSupabaseCookieClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

// ── Mock @template/shared/schemas ──
vi.mock('@template/shared/schemas', () => ({
  ticketCreateSchema: {
    safeParse: vi.fn((data: unknown) => ({ success: true, data })),
  },
}))

// ── Mock @/lib/api-guard ──
const mockRequireJson = vi.fn(() => null)
vi.mock('@/lib/api-guard', () => ({
  requireJson: (...args: unknown[]) => mockRequireJson(...args),
}))

// ── Mock @/lib/api-response ──
vi.mock('@/lib/api-response', () => ({
  ok: vi.fn((data: unknown, meta?: unknown) => ({
    status: 200,
    json: async () => ({ data, meta }),
  })),
  created: vi.fn((data: unknown) => ({ status: 201, json: async () => ({ data }) })),
  badRequest: vi.fn((msg: string) => ({ status: 400, json: async () => ({ error: msg }) })),
  unauthorized: vi.fn(() => ({ status: 401, json: async () => ({ error: 'Unauthorized' }) })),
  tooManyRequests: vi.fn(() => ({
    status: 429,
    json: async () => ({ error: 'Too Many Requests' }),
  })),
  serverError: vi.fn(() => ({
    status: 500,
    json: async () => ({ error: 'Internal Server Error' }),
  })),
}))

// ── Helper: cria NextRequest simulado ──
function makeRequest(options: {
  method?: string
  url?: string
  body?: unknown
  headers?: Record<string, string>
}) {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/support/tickets',
    body,
    headers = {},
  } = options
  return {
    method,
    url,
    headers: new Map(Object.entries({ 'x-forwarded-for': '127.0.0.1', ...headers })),
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
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  }
  const promise = Promise.resolve(result)
  Object.assign(chain, promise)
  return chain
}

describe('GET /api/support/tickets', () => {
  beforeEach(() => {
    vi.resetModules()
    mockRateLimit.mockReturnValue({ success: true, remaining: 99 })
    mockRequireJson.mockReturnValue(null)
  })

  it('retorna 401 quando usuario nao esta autenticado', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { GET } = await import('../../app/api/support/tickets/route')
    const req = makeRequest({})
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('retorna 429 quando rate limit excedido', async () => {
    mockRateLimit.mockReturnValueOnce({ success: false, remaining: 0 })
    const { GET } = await import('../../app/api/support/tickets/route')
    const req = makeRequest({})
    const res = await GET(req)
    expect(res.status).toBe(429)
  })

  it('retorna lista de tickets com sucesso para usuario autenticado', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } })

    const tickets = [
      {
        id: 'ticket-1',
        title: 'Ticket teste',
        description: 'Descricao',
        status: 'open',
        priority: 'medium',
        category: 'bug',
        created_by: 'user-123',
        assignee_id: null,
        satisfaction_rating: null,
        satisfaction_comment: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ]

    const chain = makeQueryChain({ data: tickets, error: null, count: 1 })
    mockFrom.mockReturnValue(chain)

    const { GET } = await import('../../app/api/support/tickets/route')
    const req = makeRequest({})
    const res = await GET(req)
    expect(res.status).toBe(200)
  })

  it('filtra por status quando parametro fornecido', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } })
    const chain = makeQueryChain({ data: [], error: null, count: 0 })
    mockFrom.mockReturnValue(chain)

    const { GET } = await import('../../app/api/support/tickets/route')
    const req = makeRequest({ url: 'http://localhost:3000/api/support/tickets?status=resolved' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(chain.eq).toHaveBeenCalledWith('status', 'resolved')
  })
})

describe('POST /api/support/tickets', () => {
  beforeEach(() => {
    vi.resetModules()
    mockRateLimit.mockReturnValue({ success: true, remaining: 99 })
    mockRequireJson.mockReturnValue(null)
  })

  it('retorna 401 quando usuario nao esta autenticado', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { POST } = await import('../../app/api/support/tickets/route')
    const req = makeRequest({
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { title: 'Bug', priority: 'high', category: 'bug' },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('retorna 429 quando rate limit excedido', async () => {
    mockRateLimit.mockReturnValueOnce({ success: false, remaining: 0 })
    const { POST } = await import('../../app/api/support/tickets/route')
    const req = makeRequest({
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: {},
    })
    const res = await POST(req)
    expect(res.status).toBe(429)
  })

  it('retorna 400 quando Content-Type invalido', async () => {
    mockRequireJson.mockReturnValueOnce({
      status: 400,
      json: async () => ({ error: 'Content-Type must be application/json' }),
    })
    const { POST } = await import('../../app/api/support/tickets/route')
    const req = makeRequest({
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: 'raw',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('cria ticket com sucesso e retorna 201', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } })

    const createdTicket = {
      id: 'ticket-new',
      title: 'Novo Ticket',
      description: 'Descricao do ticket',
      status: 'open',
      priority: 'high',
      category: 'bug',
      created_by: 'user-123',
      assignee_id: null,
      satisfaction_rating: null,
      satisfaction_comment: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }

    const chain = makeQueryChain({ data: createdTicket, error: null })
    mockFrom.mockReturnValue(chain)

    const { POST } = await import('../../app/api/support/tickets/route')
    const req = makeRequest({
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { title: 'Novo Ticket', description: 'Descricao', priority: 'high', category: 'bug' },
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })
})
