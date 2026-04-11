/**
 * Testes da API route /api/auth/signup (POST).
 * v3.0: Mockam @template/data/supabase (SupabaseDbClient) em vez de supabase-cookies.
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
const mockRateLimit = vi.fn(() => ({ success: true, remaining: 4 }))
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
  getClientIp: vi.fn(() => '127.0.0.1'),
}))

// ── Mock parseBody ──
const mockParseBody = vi.fn()
vi.mock('@/lib/validate', () => ({
  parseBody: (...args: unknown[]) => mockParseBody(...args),
}))

// ── Mock schema ──
vi.mock('@/schemas/auth', () => ({
  SignupSchema: {},
}))

// ── Mock @template/data/supabase (v3.0) ──
const mockSignUp = vi.fn()
vi.mock('@template/data/supabase', () => ({
  SupabaseDbClient: vi.fn().mockImplementation(() => ({
    asUser: vi.fn(() => ({
      auth: { signUp: mockSignUp },
    })),
  })),
}))

// ── Helper: NextRequest simulado ──
function makeRequest(body?: unknown) {
  return {
    url: 'http://localhost:3000/api/auth/signup',
    headers: new Map([
      ['x-forwarded-for', '127.0.0.1'],
      ['content-type', 'application/json'],
    ]),
    json: vi.fn(async () => body),
  } as unknown as import('next/server').NextRequest
}

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    vi.resetModules()
    mockRateLimit.mockReturnValue({ success: true, remaining: 4 })
    mockSignUp.mockReset()
  })

  it('retorna 429 quando rate limit excedido', async () => {
    mockRateLimit.mockReturnValueOnce({ success: false, remaining: 0 })
    const { POST } = await import('../../app/api/auth/signup/route')
    const res = await POST(makeRequest())
    expect(res.status).toBe(429)
  })

  it('retorna 400 quando body e invalido', async () => {
    mockParseBody.mockResolvedValueOnce({
      data: null,
      error: { status: 400, json: async () => ({ error: { message: 'Validation error' } }) },
    })
    const { POST } = await import('../../app/api/auth/signup/route')
    const res = await POST(makeRequest({ email: 'invalido' }))
    expect(res).toBeDefined()
  })

  it('retorna 200 quando signup e bem-sucedido', async () => {
    mockParseBody.mockResolvedValueOnce({
      data: { email: 'novo@empresa.com', password: 'senha123', name: 'Novo Usuario' },
      error: null,
    })
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: 'new-uuid', email: 'novo@empresa.com' } },
      error: null,
    })
    const { POST } = await import('../../app/api/auth/signup/route')
    const res = await POST(
      makeRequest({ email: 'novo@empresa.com', password: 'senha123', name: 'Novo' })
    )
    expect(res.status).toBe(200)
  })

  it('retorna 400 quando email ja esta cadastrado', async () => {
    mockParseBody.mockResolvedValueOnce({
      data: { email: 'existente@empresa.com', password: 'senha123', name: 'Usuario' },
      error: null,
    })
    mockSignUp.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'User already registered' },
    })
    const { POST } = await import('../../app/api/auth/signup/route')
    const res = await POST(makeRequest({ email: 'existente@empresa.com', password: 'senha123' }))
    expect(res.status).toBe(400)
  })

  it('retorna 500 quando Supabase retorna erro inesperado', async () => {
    mockParseBody.mockResolvedValueOnce({
      data: { email: 'usuario@empresa.com', password: 'senha123', name: 'Usuario' },
      error: null,
    })
    mockSignUp.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Database error saving new user' },
    })
    const { POST } = await import('../../app/api/auth/signup/route')
    const res = await POST(makeRequest({ email: 'usuario@empresa.com', password: 'senha123' }))
    expect(res.status).toBe(500)
  })
})
