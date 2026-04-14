import { describe, it, expect } from 'vitest'
import { rateLimit, getClientIp } from '../../lib/rate-limit'

describe('rateLimit()', () => {
  it('permite primeira requisição', async () => {
    const uid = `first-${Date.now()}-${Math.random()}`
    const result = await rateLimit(uid, { max: 3, windowMs: 60_000 })
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it('decrementa remaining a cada requisição', async () => {
    const uid = `decrement-${Date.now()}-${Math.random()}`
    const r1 = await rateLimit(uid, { max: 5, windowMs: 60_000 })
    const r2 = await rateLimit(uid, { max: 5, windowMs: 60_000 })
    const r3 = await rateLimit(uid, { max: 5, windowMs: 60_000 })
    expect(r1.remaining).toBe(4)
    expect(r2.remaining).toBe(3)
    expect(r3.remaining).toBe(2)
  })

  it('bloqueia após atingir limite', async () => {
    const uid = `block-${Date.now()}-${Math.random()}`
    await rateLimit(uid, { max: 2, windowMs: 60_000 })
    await rateLimit(uid, { max: 2, windowMs: 60_000 })
    const result = await rateLimit(uid, { max: 2, windowMs: 60_000 })
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('continua bloqueando após limite atingido', async () => {
    const uid = `keep-blocked-${Date.now()}-${Math.random()}`
    await rateLimit(uid, { max: 1, windowMs: 60_000 })
    const r2 = await rateLimit(uid, { max: 1, windowMs: 60_000 })
    const r3 = await rateLimit(uid, { max: 1, windowMs: 60_000 })
    expect(r2.success).toBe(false)
    expect(r3.success).toBe(false)
  })

  it('usa defaults quando config não fornecida (max=10)', async () => {
    const uid = `default-${Date.now()}-${Math.random()}`
    const result = await rateLimit(uid)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(9)
  })

  it('isola contadores por identifier diferente', async () => {
    const uid1 = `isolate-a-${Date.now()}-${Math.random()}`
    const uid2 = `isolate-b-${Date.now()}-${Math.random()}`
    await rateLimit(uid1, { max: 1, windowMs: 60_000 })
    const blocked = await rateLimit(uid1, { max: 1, windowMs: 60_000 })
    const allowed = await rateLimit(uid2, { max: 1, windowMs: 60_000 })
    expect(blocked.success).toBe(false)
    expect(allowed.success).toBe(true)
  })

  it('reseta janela após windowMs expirar', async () => {
    const uid = `reset-${Date.now()}-${Math.random()}`
    await rateLimit(uid, { max: 1, windowMs: 50 })
    const blocked = await rateLimit(uid, { max: 1, windowMs: 50 })
    expect(blocked.success).toBe(false)

    await new Promise(r => setTimeout(r, 60))

    const after = await rateLimit(uid, { max: 1, windowMs: 50 })
    expect(after.success).toBe(true)
    expect(after.remaining).toBe(0)
  })
})

describe('getClientIp()', () => {
  it('extrai primeiro IP do header x-forwarded-for com múltiplos IPs', () => {
    const headers = new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' })
    expect(getClientIp(headers)).toBe('1.2.3.4')
  })

  it('extrai IP único do header x-forwarded-for', () => {
    const headers = new Headers({ 'x-forwarded-for': '192.168.1.1' })
    expect(getClientIp(headers)).toBe('192.168.1.1')
  })

  it('remove espaços em branco do IP extraído', () => {
    const headers = new Headers({ 'x-forwarded-for': '  10.0.0.1  , 10.0.0.2' })
    expect(getClientIp(headers)).toBe('10.0.0.1')
  })

  it('usa x-real-ip como fallback quando x-forwarded-for ausente', () => {
    const headers = new Headers({ 'x-real-ip': '9.10.11.12' })
    expect(getClientIp(headers)).toBe('9.10.11.12')
  })

  it('prefere x-forwarded-for sobre x-real-ip quando ambos presentes', () => {
    const headers = new Headers({
      'x-forwarded-for': '1.1.1.1',
      'x-real-ip': '2.2.2.2',
    })
    expect(getClientIp(headers)).toBe('1.1.1.1')
  })

  it('retorna "unknown" quando nenhum header de IP presente', () => {
    const headers = new Headers()
    expect(getClientIp(headers)).toBe('unknown')
  })

  it('retorna "unknown" quando headers sem campos de IP', () => {
    const headers = new Headers({ 'content-type': 'application/json' })
    expect(getClientIp(headers)).toBe('unknown')
  })
})
