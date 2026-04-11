import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { withApiLog } from '../../lib/logger'

// Simula NextRequest com a estrutura minima usada por withApiLog
function makeRequest(method = 'GET', pathname = '/api/test') {
  return {
    method,
    url: `http://localhost${pathname}`,
    nextUrl: { pathname },
  } as unknown as import('next/server').NextRequest
}

function makeResponse(status: number): Response {
  return new Response(null, { status })
}

describe('withApiLog', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'debug').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('handler wrapeado e chamado com os argumentos originais', async () => {
    const handler = vi.fn().mockResolvedValue(makeResponse(200))
    const wrapped = withApiLog('rota-teste', handler)
    const req = makeRequest('GET', '/api/test')

    await wrapped(req)

    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith(req)
  })

  it('retorna a Response original do handler sem modificacao', async () => {
    const originalResponse = makeResponse(200)
    const handler = vi.fn().mockResolvedValue(originalResponse)
    const wrapped = withApiLog('rota-teste', handler)

    const result = await wrapped(makeRequest())

    expect(result).toBe(originalResponse)
  })

  it('emite console.info para status 2xx', async () => {
    const handler = vi.fn().mockResolvedValue(makeResponse(200))
    const wrapped = withApiLog('api-users', handler)

    await wrapped(makeRequest('GET', '/api/users'))

    expect(console.info).toHaveBeenCalledOnce()
    expect(console.warn).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  it('mensagem de log 2xx contem metodo, path e status', async () => {
    const handler = vi.fn().mockResolvedValue(makeResponse(201))
    const wrapped = withApiLog('api-create', handler)

    await wrapped(makeRequest('POST', '/api/items'))

    const logArg = (console.info as ReturnType<typeof vi.spyOn>).mock.calls[0][0] as string
    expect(logArg).toContain('POST')
    expect(logArg).toContain('/api/items')
    expect(logArg).toContain('201')
  })

  it('emite console.warn para status 4xx', async () => {
    const handler = vi.fn().mockResolvedValue(makeResponse(404))
    const wrapped = withApiLog('api-detail', handler)

    await wrapped(makeRequest('GET', '/api/items/nao-existe'))

    expect(console.warn).toHaveBeenCalledOnce()
    expect(console.info).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  it('emite console.warn para status 400 (bad request)', async () => {
    const handler = vi.fn().mockResolvedValue(makeResponse(400))
    const wrapped = withApiLog('api-create', handler)

    await wrapped(makeRequest('POST', '/api/items'))

    expect(console.warn).toHaveBeenCalledOnce()
  })

  it('emite console.warn para status 401 (unauthorized)', async () => {
    const handler = vi.fn().mockResolvedValue(makeResponse(401))
    const wrapped = withApiLog('api-auth', handler)

    await wrapped(makeRequest('GET', '/api/me'))

    expect(console.warn).toHaveBeenCalledOnce()
  })

  it('emite console.error para status 5xx', async () => {
    const handler = vi.fn().mockResolvedValue(makeResponse(500))
    const wrapped = withApiLog('api-crash', handler)

    await wrapped(makeRequest('GET', '/api/crash'))

    expect(console.error).toHaveBeenCalledOnce()
    expect(console.info).not.toHaveBeenCalled()
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('emite console.error para status 503 (service unavailable)', async () => {
    const handler = vi.fn().mockResolvedValue(makeResponse(503))
    const wrapped = withApiLog('api-health', handler)

    await wrapped(makeRequest('GET', '/api/health'))

    expect(console.error).toHaveBeenCalledOnce()
  })

  it('mensagem de log 4xx contem metodo, path e status', async () => {
    const handler = vi.fn().mockResolvedValue(makeResponse(403))
    const wrapped = withApiLog('api-forbidden', handler)

    await wrapped(makeRequest('DELETE', '/api/admin'))

    const logArg = (console.warn as ReturnType<typeof vi.spyOn>).mock.calls[0][0] as string
    expect(logArg).toContain('DELETE')
    expect(logArg).toContain('/api/admin')
    expect(logArg).toContain('403')
  })

  it('mensagem de log 5xx contem metodo, path e status', async () => {
    const handler = vi.fn().mockResolvedValue(makeResponse(500))
    const wrapped = withApiLog('api-crash', handler)

    await wrapped(makeRequest('POST', '/api/process'))

    const logArg = (console.error as ReturnType<typeof vi.spyOn>).mock.calls[0][0] as string
    expect(logArg).toContain('POST')
    expect(logArg).toContain('/api/process')
    expect(logArg).toContain('500')
  })

  it('se handler lanca erro, o erro e re-thrown', async () => {
    const erroOriginal = new Error('Falha catastrofica')
    const handler = vi.fn().mockRejectedValue(erroOriginal)
    const wrapped = withApiLog('api-falha', handler)

    await expect(wrapped(makeRequest('GET', '/api/falha'))).rejects.toThrow('Falha catastrofica')
  })

  it('se handler lanca erro, emite console.error com UNHANDLED no log', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('boom'))
    const wrapped = withApiLog('api-boom', handler)

    await expect(wrapped(makeRequest('GET', '/api/boom'))).rejects.toThrow()

    expect(console.error).toHaveBeenCalledOnce()
    const logArg = (console.error as ReturnType<typeof vi.spyOn>).mock.calls[0][0] as string
    expect(logArg).toContain('UNHANDLED')
  })

  it('se handler lanca erro nao-Error, e re-thrown sem modificacao', async () => {
    const handler = vi.fn().mockRejectedValue('string-error')
    const wrapped = withApiLog('api-str', handler)

    await expect(wrapped(makeRequest('GET', '/api/str'))).rejects.toBe('string-error')
  })

  it('routeName aparece no contexto do log', async () => {
    // Em dev, o formato e "[routeName] mensagem" — validamos via console.info
    const handler = vi.fn().mockResolvedValue(makeResponse(200))
    const wrapped = withApiLog('minha-rota-especial', handler)

    await wrapped(makeRequest('GET', '/api/ok'))

    const logArg = (console.info as ReturnType<typeof vi.spyOn>).mock.calls[0][0] as string
    expect(logArg).toContain('minha-rota-especial')
  })
})
