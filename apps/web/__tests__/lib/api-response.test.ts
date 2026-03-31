import { describe, it, expect } from 'vitest'
import {
  ok,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  tooManyRequests,
  serverError,
} from '../../lib/api-response'

describe('api-response helpers', () => {
  describe('ok()', () => {
    it('retorna status 200 com data', async () => {
      const res = ok({ id: '1', name: 'test' })
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.data).toEqual({ id: '1', name: 'test' })
      expect(body.error).toBeNull()
    })

    it('retorna meta null quando não fornecido', async () => {
      const res = ok({ id: '1' })
      const body = await res.json()
      expect(body.meta).toBeNull()
    })

    it('inclui meta quando fornecido', async () => {
      const res = ok([], { page: 1, total: 10, page_size: 5, pages: 2 })
      const body = await res.json()
      expect(body.meta).toEqual({ page: 1, total: 10, page_size: 5, pages: 2 })
    })

    it('aceita array como data', async () => {
      const res = ok([1, 2, 3])
      const body = await res.json()
      expect(body.data).toEqual([1, 2, 3])
    })

    it('aceita null como data', async () => {
      const res = ok(null)
      const body = await res.json()
      expect(body.data).toBeNull()
    })
  })

  describe('created()', () => {
    it('retorna status 201', async () => {
      const res = created({ id: 'new' })
      expect(res.status).toBe(201)
    })

    it('retorna data e error null', async () => {
      const res = created({ id: 'abc', name: 'Novo item' })
      const body = await res.json()
      expect(body.data).toEqual({ id: 'abc', name: 'Novo item' })
      expect(body.error).toBeNull()
    })
  })

  describe('noContent()', () => {
    it('retorna status 204', () => {
      const res = noContent()
      expect(res.status).toBe(204)
    })

    it('retorna body nulo', () => {
      const res = noContent()
      expect(res.body).toBeNull()
    })
  })

  describe('badRequest()', () => {
    it('retorna status 400 com mensagem de erro', async () => {
      const res = badRequest('Campo inválido')
      const body = await res.json()
      expect(res.status).toBe(400)
      expect(body.error.message).toBe('Campo inválido')
      expect(body.data).toBeNull()
    })

    it('retorna details null quando não fornecido', async () => {
      const res = badRequest('Erro simples')
      const body = await res.json()
      expect(body.error.details).toBeNull()
    })

    it('inclui details quando fornecido', async () => {
      const res = badRequest('Erro de validação', { field: 'email' })
      const body = await res.json()
      expect(body.error.details).toEqual({ field: 'email' })
    })

    it('aceita details como array', async () => {
      const res = badRequest('Múltiplos erros', ['campo1', 'campo2'])
      const body = await res.json()
      expect(body.error.details).toEqual(['campo1', 'campo2'])
    })
  })

  describe('unauthorized()', () => {
    it('retorna status 401', async () => {
      const res = unauthorized()
      expect(res.status).toBe(401)
    })

    it('retorna mensagem padrão "Unauthorized"', async () => {
      const res = unauthorized()
      const body = await res.json()
      expect(body.error.message).toBe('Unauthorized')
    })

    it('aceita mensagem customizada', async () => {
      const res = unauthorized('Token expirado')
      const body = await res.json()
      expect(body.error.message).toBe('Token expirado')
    })

    it('retorna data null', async () => {
      const res = unauthorized()
      const body = await res.json()
      expect(body.data).toBeNull()
    })
  })

  describe('forbidden()', () => {
    it('retorna status 403', async () => {
      const res = forbidden()
      expect(res.status).toBe(403)
    })

    it('retorna mensagem padrão "Forbidden"', async () => {
      const res = forbidden()
      const body = await res.json()
      expect(body.error.message).toBe('Forbidden')
    })

    it('aceita mensagem customizada', async () => {
      const res = forbidden('Sem permissão para esta ação')
      const body = await res.json()
      expect(body.error.message).toBe('Sem permissão para esta ação')
    })
  })

  describe('notFound()', () => {
    it('retorna status 404', async () => {
      const res = notFound()
      expect(res.status).toBe(404)
    })

    it('retorna mensagem padrão "Not found"', async () => {
      const res = notFound()
      const body = await res.json()
      expect(body.error.message).toBe('Not found')
    })

    it('aceita mensagem customizada', async () => {
      const res = notFound('Usuário não encontrado')
      const body = await res.json()
      expect(body.error.message).toBe('Usuário não encontrado')
    })

    it('retorna data null', async () => {
      const res = notFound()
      const body = await res.json()
      expect(body.data).toBeNull()
    })
  })

  describe('tooManyRequests()', () => {
    it('retorna status 429', async () => {
      const res = tooManyRequests()
      expect(res.status).toBe(429)
    })

    it('retorna mensagem "Too Many Requests"', async () => {
      const res = tooManyRequests()
      const body = await res.json()
      expect(body.error.message).toBe('Too Many Requests')
    })

    it('retorna data null', async () => {
      const res = tooManyRequests()
      const body = await res.json()
      expect(body.data).toBeNull()
    })
  })

  describe('serverError()', () => {
    it('retorna status 500', async () => {
      const res = serverError()
      expect(res.status).toBe(500)
    })

    it('retorna mensagem padrão "Internal server error"', async () => {
      const res = serverError()
      const body = await res.json()
      expect(body.error.message).toBe('Internal server error')
    })

    it('aceita mensagem customizada', async () => {
      const res = serverError('Falha ao conectar ao banco de dados')
      const body = await res.json()
      expect(body.error.message).toBe('Falha ao conectar ao banco de dados')
    })

    it('retorna data null', async () => {
      const res = serverError()
      const body = await res.json()
      expect(body.data).toBeNull()
    })
  })
})
