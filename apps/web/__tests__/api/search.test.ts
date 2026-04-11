/**
 * Testes da API route /api/search (GET).
 * Testa busca global cross-entity com autenticacao e validacao de parametros.
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

// ── Mock @/lib/data ──
const mockGetUser = vi.fn()

vi.mock('@/lib/data', () => ({
  getAuthGateway: vi.fn(() => ({ getUser: mockGetUser })),
  getRepository: vi.fn(),
}))

// ── Mock @template/data/supabase ──
const mockFrom = vi.fn()
const mockSelect = vi.fn(() => ({
  or: vi.fn(() => ({ limit: vi.fn(() => ({ data: [], error: null })) })),
}))

vi.mock('@template/data/supabase', () => ({
  SupabaseDbClient: vi.fn().mockImplementation(() => ({
    asUser: () => ({
      from: mockFrom.mockReturnValue({
        select: mockSelect,
      }),
    }),
  })),
}))

// ── Mock logger ──
vi.mock('@/lib/logger', () => ({
  withApiLog: (_name: string, handler: unknown) => handler,
}))

// ── Mock sentry ──
vi.mock('@/lib/sentry', () => ({
  captureException: vi.fn(),
}))

// ── Helper: cria NextRequest simulado ──
function makeRequest(options: { method?: string; url?: string; headers?: Record<string, string> }) {
  const { method = 'GET', url = 'http://localhost:3000/api/search', headers = {} } = options
  const defaultHeaders: Record<string, string> = { 'x-forwarded-for': '127.0.0.1' }
  const parsedUrl = new URL(url)
  return {
    method,
    url,
    headers: new Map(Object.entries({ ...defaultHeaders, ...headers })),
    nextUrl: parsedUrl,
    json: vi.fn(async () => ({})),
  } as unknown as import('next/server').NextRequest
}

describe('GET /api/search', () => {
  beforeEach(() => {
    vi.resetModules()
    mockGetUser.mockReset()
    mockFrom.mockClear()
  })

  it('retorna 401 quando usuario nao esta autenticado', async () => {
    mockGetUser.mockResolvedValueOnce({ user: null, error: 'Nao autenticado' })
    const { GET } = await import('../../app/api/search/route')
    const req = makeRequest({ url: 'http://localhost:3000/api/search?q=teste' })
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('retorna 400 quando parametro q tem menos de 2 caracteres', async () => {
    mockGetUser.mockResolvedValueOnce({
      user: { id: 'user-1', email: 'u@test.com', role: 'ADMIN' },
      error: null,
    })
    const { GET } = await import('../../app/api/search/route')
    const req = makeRequest({ url: 'http://localhost:3000/api/search?q=a' })
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('retorna 400 quando parametro q esta ausente', async () => {
    mockGetUser.mockResolvedValueOnce({
      user: { id: 'user-1', email: 'u@test.com', role: 'ADMIN' },
      error: null,
    })
    const { GET } = await import('../../app/api/search/route')
    const req = makeRequest({ url: 'http://localhost:3000/api/search' })
    const res = await GET(req)
    expect(res.status).toBe(400)
  })
})
