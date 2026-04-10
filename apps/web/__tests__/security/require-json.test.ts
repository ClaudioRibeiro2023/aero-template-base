/**
 * Testes da função requireJson() de @/lib/api-guard.
 * Testa validação de Content-Type para endpoints de mutação.
 */
import { describe, it, expect, vi } from 'vitest'

// ── Mock next/server ──
vi.mock('next/server', () => ({
  NextRequest: class {},
  NextResponse: {
    json: vi.fn((body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}))

// ── Mock @/lib/api-response para capturar badRequest ──
vi.mock('@/lib/api-response', () => ({
  badRequest: vi.fn((message: string) => ({
    status: 400,
    json: async () => ({ error: message }),
  })),
  ok: vi.fn(),
  created: vi.fn(),
  unauthorized: vi.fn(),
  tooManyRequests: vi.fn(),
  serverError: vi.fn(),
}))

// ── Helper: cria NextRequest simulado com headers ──
function makeRequest(contentType: string | null) {
  const headers = new Map<string, string>()
  if (contentType !== null) {
    headers.set('content-type', contentType)
  }
  return {
    headers: {
      get: (key: string) => headers.get(key.toLowerCase()) ?? null,
    },
  } as unknown as import('next/server').NextRequest
}

describe('requireJson()', () => {
  it('retorna null para Content-Type application/json', async () => {
    const { requireJson } = await import('../../lib/api-guard')
    const req = makeRequest('application/json')
    const result = requireJson(req)
    expect(result).toBeNull()
  })

  it('retorna null para application/json; charset=utf-8', async () => {
    const { requireJson } = await import('../../lib/api-guard')
    const req = makeRequest('application/json; charset=utf-8')
    const result = requireJson(req)
    expect(result).toBeNull()
  })

  it('retorna resposta 400 para text/plain', async () => {
    const { requireJson } = await import('../../lib/api-guard')
    const req = makeRequest('text/plain')
    const result = requireJson(req)
    expect(result).not.toBeNull()
    expect(result?.status).toBe(400)
  })

  it('retorna resposta 400 quando Content-Type nao fornecido', async () => {
    const { requireJson } = await import('../../lib/api-guard')
    const req = makeRequest(null)
    const result = requireJson(req)
    expect(result).not.toBeNull()
    expect(result?.status).toBe(400)
  })

  it('retorna resposta 400 para multipart/form-data', async () => {
    const { requireJson } = await import('../../lib/api-guard')
    const req = makeRequest('multipart/form-data; boundary=----boundary')
    const result = requireJson(req)
    expect(result).not.toBeNull()
    expect(result?.status).toBe(400)
  })
})
