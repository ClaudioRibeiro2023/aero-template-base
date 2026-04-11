/**
 * Testes da rota auth/callback e da função safePath() (testada indiretamente via GET handler).
 * v3.0: Mockam @template/data/supabase (SupabaseDbClient) em vez de supabase-cookies.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock next/server ──
const mockRedirect = vi.fn((url: string) => ({ status: 302, headers: { location: url } }))
vi.mock('next/server', () => ({
  NextRequest: class {},
  NextResponse: {
    redirect: (url: string) => mockRedirect(url),
    json: vi.fn((body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}))

// ── Mock @template/data/supabase (v3.0) ──
const mockExchangeCodeForSession = vi.fn()
vi.mock('@template/data/supabase', () => ({
  SupabaseDbClient: vi.fn().mockImplementation(() => ({
    asUser: vi.fn(() => ({
      auth: { exchangeCodeForSession: mockExchangeCodeForSession },
    })),
  })),
}))

// ── Helper: cria NextRequest simulado ──
function makeCallbackRequest(params: Record<string, string>) {
  const url = new URL('http://localhost:3000/auth/callback')
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  return { url: url.toString() } as unknown as import('next/server').NextRequest
}

describe('GET /auth/callback — safePath via redirect', () => {
  beforeEach(() => {
    vi.resetModules()
    mockExchangeCodeForSession.mockResolvedValue({ error: null })
    mockRedirect.mockClear()
  })

  it('redireciona para /dashboard quando next nao fornecido', async () => {
    const { GET } = await import('../../app/auth/callback/route')
    const req = makeCallbackRequest({ code: 'valid-code' })
    await GET(req)
    expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/dashboard'))
  })

  it('redireciona para /dashboard quando next e string vazia', async () => {
    const { GET } = await import('../../app/auth/callback/route')
    const req = makeCallbackRequest({ code: 'valid-code', next: '' })
    await GET(req)
    expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/dashboard'))
  })

  it('redireciona para /dashboard quando next e valido', async () => {
    const { GET } = await import('../../app/auth/callback/route')
    const req = makeCallbackRequest({ code: 'valid-code', next: '/dashboard' })
    await GET(req)
    expect(mockRedirect).toHaveBeenCalledWith(expect.stringMatching(/\/dashboard$/))
  })

  it('redireciona para /admin/config quando next e caminho valido', async () => {
    const { GET } = await import('../../app/auth/callback/route')
    const req = makeCallbackRequest({ code: 'valid-code', next: '/admin/config' })
    await GET(req)
    expect(mockRedirect).toHaveBeenCalledWith(expect.stringMatching(/\/admin\/config$/))
  })

  it('bloqueia //evil.com e redireciona para /dashboard', async () => {
    const { GET } = await import('../../app/auth/callback/route')
    const req = makeCallbackRequest({ code: 'valid-code', next: '//evil.com' })
    await GET(req)
    expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/dashboard'))
    expect(mockRedirect).not.toHaveBeenCalledWith(expect.stringContaining('evil.com'))
  })

  it('bloqueia http://evil.com e redireciona para /dashboard', async () => {
    const { GET } = await import('../../app/auth/callback/route')
    const req = makeCallbackRequest({ code: 'valid-code', next: 'http://evil.com' })
    await GET(req)
    expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/dashboard'))
    expect(mockRedirect).not.toHaveBeenCalledWith(expect.stringContaining('evil.com'))
  })

  it('bloqueia /javascript:alert(1) e redireciona para /dashboard', async () => {
    const { GET } = await import('../../app/auth/callback/route')
    const req = makeCallbackRequest({ code: 'valid-code', next: '/javascript:alert(1)' })
    await GET(req)
    expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/dashboard'))
    expect(mockRedirect).not.toHaveBeenCalledWith(expect.stringContaining('javascript'))
  })

  it('redireciona para login com erro quando code exchange falha', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: new Error('invalid code') })
    const { GET } = await import('../../app/auth/callback/route')
    const req = makeCallbackRequest({ code: 'bad-code', next: '/dashboard' })
    await GET(req)
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/login?error=auth_callback_failed')
    )
  })

  it('redireciona para login com erro quando code nao fornecido', async () => {
    const { GET } = await import('../../app/auth/callback/route')
    const req = makeCallbackRequest({})
    await GET(req)
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/login?error=auth_callback_failed')
    )
  })
})
