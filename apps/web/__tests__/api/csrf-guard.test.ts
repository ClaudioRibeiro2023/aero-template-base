/**
 * Testes do wrapper withCsrf e helpers de validacao de API.
 * Valida protecao CSRF e checagem de Content-Type.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock next/server ──
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}))

// ── Mock sentry ──
vi.mock('@/lib/sentry', () => ({
  captureException: vi.fn(),
}))

import { validateApiRequest, requireJson, withCsrf } from '../../lib/api-guard'
import type { NextRequest, NextResponse } from 'next/server'

function makeRequest(headers: Record<string, string | null>): NextRequest {
  return {
    headers: {
      get: (key: string) => headers[key] ?? null,
    },
  } as unknown as NextRequest
}

describe('validateApiRequest', () => {
  it('aceita request sem origin (server-side)', () => {
    const req = makeRequest({ host: 'localhost:3000' })
    expect(validateApiRequest(req)).toBe(true)
  })

  it('aceita request com origin igual ao host', () => {
    const req = makeRequest({
      origin: 'https://app.example.com',
      host: 'app.example.com',
    })
    expect(validateApiRequest(req)).toBe(true)
  })

  it('rejeita request com origin diferente do host', () => {
    const req = makeRequest({
      origin: 'https://malicious.com',
      host: 'app.example.com',
    })
    expect(validateApiRequest(req)).toBe(false)
  })
})

describe('requireJson', () => {
  it('retorna null para content-type application/json', () => {
    const req = makeRequest({ 'content-type': 'application/json' })
    expect(requireJson(req)).toBeNull()
  })

  it('retorna null para content-type com charset', () => {
    const req = makeRequest({ 'content-type': 'application/json; charset=utf-8' })
    expect(requireJson(req)).toBeNull()
  })

  it('retorna resposta 400 para content-type invalido', () => {
    const req = makeRequest({ 'content-type': 'text/plain' })
    const result = requireJson(req)
    expect(result).not.toBeNull()
    expect(result!.status).toBe(400)
  })
})

describe('withCsrf', () => {
  it('executa handler quando origin e valido', async () => {
    const handler = vi.fn().mockResolvedValue({ status: 200 } as unknown as NextResponse)
    const wrapped = withCsrf(handler)

    const req = makeRequest({
      origin: 'https://app.example.com',
      host: 'app.example.com',
    }) as NextRequest

    const result = await wrapped(req)
    expect(handler).toHaveBeenCalledWith(req, undefined)
    expect(result.status).toBe(200)
  })

  it('retorna 403 quando origin e invalido', async () => {
    const handler = vi.fn()
    const wrapped = withCsrf(handler)

    const req = makeRequest({
      origin: 'https://evil.com',
      host: 'app.example.com',
    }) as NextRequest

    const result = await wrapped(req)
    expect(handler).not.toHaveBeenCalled()
    expect(result.status).toBe(403)
  })

  it('permite requests sem origin (server-side)', async () => {
    const handler = vi.fn().mockResolvedValue({ status: 201 } as unknown as NextResponse)
    const wrapped = withCsrf(handler)

    const req = makeRequest({ host: 'app.example.com' }) as NextRequest

    const result = await wrapped(req)
    expect(handler).toHaveBeenCalled()
    expect(result.status).toBe(201)
  })
})
