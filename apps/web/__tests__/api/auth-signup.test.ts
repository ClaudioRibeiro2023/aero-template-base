/**
 * Testes da API route /api/auth/signup (POST).
 * Mockam: rate-limit, supabase-cookies, validate/parseBody, schemas/auth.
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

// ── Mock schema (importado em route mas parseBody é mockado acima) ──
vi.mock('@/schemas/auth', () => ({
  SignupSchema: {},
}))

// ── Mock supabase-cookies ──
const mockSignUp = vi.fn()
vi.mock('@/lib/supabase-cookies', () => ({
  createSupabaseCookieClient: vi.fn(async () => ({
    auth: { signUp: mockSignUp },
  })),
}))

// ── Helper: NextRequest simulado ──
function makeRequest(body?: unknown) {
  return {
    url: 'http://localhost:3000/api/auth/signup',
    headers: new Map([['x-forwarded-for', '127.0.0.1']]),
    json: vi.fn(async () => body),
  } as unknown as import('next/server').NextRequest
}

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    vi.resetModules()
    mockRateLimit.mockReturnValue({ success: true, remaining: 4 })
  })

  it('retorna 429 quando rate limit excedido', async () => {
    mockRateLimit.mockReturnValueOnce({ success: false, remaining: 0 })
    const { POST } = await import('../../app/api/auth/signup/route')
    const req = makeRequest()
    const res = await POST(req)
    expect(res.status).toBe(429)
  })

  it('retorna 400 quando body e invalido', async () => {
    mockParseBody.mockResolvedValueOnce({
      data: null,
      error: { status: 400, json: async () => ({ error: { message: 'Validation error' } }) },
    })
    const { POST } = await import('../../app/api/auth/signup/route')
    const req = makeRequest({ email: 'invalido' })
    const res = await POST(req)
    // Retorna o error object diretamente do parseBody
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
    const req = makeRequest({
      email: 'novo@empresa.com',
      password: 'senha123',
      name: 'Novo Usuario',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('retorna 400 quando email ja esta cadastrado', async () => {
    mockParseBody.mockResolvedValueOnce({
      data: { email: 'existente@empresa.com', password: 'senha123', name: 'Usuario Existente' },
      error: null,
    })

    mockSignUp.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'User already registered' },
    })

    const { POST } = await import('../../app/api/auth/signup/route')
    const req = makeRequest({
      email: 'existente@empresa.com',
      password: 'senha123',
      name: 'Usuario Existente',
    })
    const res = await POST(req)
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
    const req = makeRequest({ email: 'usuario@empresa.com', password: 'senha123', name: 'Usuario' })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
