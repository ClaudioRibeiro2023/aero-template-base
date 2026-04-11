/**
 * Tests for @template/utils — formatters e helpers.
 */
import { describe, it, expect, vi } from 'vitest'
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatDate,
  isEmpty,
  capitalize,
  truncate,
  cn,
  generateId,
  deepClone,
  sleep,
} from '../index'

describe('formatters', () => {
  it('formatNumber formata numero com separador de milhar pt-BR', () => {
    const result = formatNumber(1234567)
    // pt-BR usa ponto como separador de milhar
    expect(result).toContain('1')
    expect(result).toContain('234')
    expect(result).toContain('567')
  })

  it('formatCurrency formata valor em BRL', () => {
    const result = formatCurrency(99.9)
    // Deve conter R$ e valor
    expect(result).toMatch(/R\$/)
  })

  it('formatPercent formata porcentagem com decimais', () => {
    expect(formatPercent(85.678, 2)).toBe('85.68%')
    expect(formatPercent(100)).toBe('100.0%')
  })
})

describe('helpers — isEmpty', () => {
  it('retorna true para null, undefined, string vazia', () => {
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
    expect(isEmpty('')).toBe(true)
    expect(isEmpty('  ')).toBe(true)
  })

  it('retorna true para array e objeto vazios', () => {
    expect(isEmpty([])).toBe(true)
    expect(isEmpty({})).toBe(true)
  })

  it('retorna false para valores preenchidos', () => {
    expect(isEmpty('texto')).toBe(false)
    expect(isEmpty([1])).toBe(false)
    expect(isEmpty({ a: 1 })).toBe(false)
    expect(isEmpty(0)).toBe(false)
  })
})

describe('helpers — capitalize e truncate', () => {
  it('capitalize transforma primeira letra em maiuscula', () => {
    expect(capitalize('hello')).toBe('Hello')
    expect(capitalize('WORLD')).toBe('World')
  })

  it('truncate corta string longa com ellipsis', () => {
    expect(truncate('abcdefghij', 7)).toBe('abcd...')
    expect(truncate('short', 10)).toBe('short')
  })

  it('cn concatena classes filtrando falsy', () => {
    expect(cn('a', undefined, 'b', false, 'c')).toBe('a b c')
    expect(cn(null, undefined, false)).toBe('')
  })
})

describe('helpers — generateId e deepClone', () => {
  it('generateId gera ID com prefixo', () => {
    const id = generateId('test')
    expect(id).toMatch(/^test-[a-z0-9]+$/)
  })

  it('deepClone cria copia independente', () => {
    const original = { a: 1, b: { c: 2 } }
    const clone = deepClone(original)
    clone.b.c = 99
    expect(original.b.c).toBe(2)
  })

  it('sleep resolve apos delay', async () => {
    const start = Date.now()
    await sleep(50)
    expect(Date.now() - start).toBeGreaterThanOrEqual(40)
  })
})
