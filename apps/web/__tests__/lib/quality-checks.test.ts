/**
 * Testes dos módulos quality-checks (security, performance, accessibility, code-quality, dependencies).
 * Mockam window, document e performance API para execução em ambiente Node.js (vitest).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { CategoryResult } from '../../lib/quality-checks/types'

// ── Helpers de validação ──
function isCategoryResult(obj: unknown): obj is CategoryResult {
  if (!obj || typeof obj !== 'object') return false
  const r = obj as Record<string, unknown>
  return (
    typeof r.category === 'string' &&
    typeof r.score === 'number' &&
    Array.isArray(r.checks) &&
    r.checks.every((c: unknown) => {
      const check = c as Record<string, unknown>
      return (
        typeof check.name === 'string' &&
        ['pass', 'warn', 'fail'].includes(check.status as string) &&
        typeof check.score === 'number'
      )
    })
  )
}

function expectValidCategoryResult(result: CategoryResult) {
  expect(isCategoryResult(result)).toBe(true)
  expect(result.score).toBeGreaterThanOrEqual(0)
  expect(result.score).toBeLessThanOrEqual(100)
  expect(result.checks.length).toBeGreaterThan(0)
  for (const check of result.checks) {
    expect(check.score).toBeGreaterThanOrEqual(0)
    expect(check.score).toBeLessThanOrEqual(100)
    expect(['pass', 'warn', 'fail']).toContain(check.status)
  }
}

// ── Setup global: simular ambiente browser mínimo ──
const originalWindow = global.window
const originalDocument = global.document

beforeEach(() => {
  // Simular window sem protocol https (ambiente de teste)
  Object.defineProperty(global, 'window', {
    value: {
      location: { protocol: 'http:' },
      performance: {
        getEntriesByType: vi.fn((type: string) => {
          if (type === 'navigation') {
            return [{ domContentLoadedEventEnd: 800, loadEventEnd: 1200 }]
          }
          if (type === 'resource') {
            return [{ name: 'app.js', transferSize: 200 * 1024 }]
          }
          return []
        }),
      },
    },
    writable: true,
    configurable: true,
  })

  // Simular document com atributos básicos
  Object.defineProperty(global, 'document', {
    value: {
      documentElement: {
        lang: 'pt-BR',
        style: {},
      },
      cookie: '',
      querySelectorAll: vi.fn((selector: string) => {
        if (selector === 'img') return []
        if (selector === '[role="main"], [role="navigation"], [role="banner"], main, nav, header') {
          return [{ tagName: 'main' }, { tagName: 'nav' }]
        }
        return []
      }),
      querySelector: vi.fn((selector: string) => {
        if (selector === 'a[href="#main-content"]') return { href: '#main-content' }
        return null
      }),
    },
    writable: true,
    configurable: true,
  })

  // Simular getComputedStyle global
  global.getComputedStyle = vi.fn(() => ({
    getPropertyValue: vi.fn((prop: string) => {
      if (prop === '--brand-primary') return '#1a73e8'
      return ''
    }),
  })) as unknown as typeof getComputedStyle

  // Simular performance global
  global.performance = global.window.performance as unknown as Performance
})

afterEach(() => {
  Object.defineProperty(global, 'window', {
    value: originalWindow,
    writable: true,
    configurable: true,
  })
  Object.defineProperty(global, 'document', {
    value: originalDocument,
    writable: true,
    configurable: true,
  })
  vi.restoreAllMocks()
})

describe('checkSecurity()', () => {
  it('retorna CategoryResult valido com categoria Seguranca', async () => {
    const { checkSecurity } = await import('../../lib/quality-checks/security')
    const result = checkSecurity()
    expectValidCategoryResult(result)
    expect(result.category).toBe('Segurança')
  })

  it('score entre 0 e 100', async () => {
    const { checkSecurity } = await import('../../lib/quality-checks/security')
    const result = checkSecurity()
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('contem checks de HTTPS e CSP', async () => {
    const { checkSecurity } = await import('../../lib/quality-checks/security')
    const result = checkSecurity()
    const names = result.checks.map(c => c.name)
    expect(names).toContain('HTTPS configurado')
    expect(names).toContain('Content Security Policy')
  })
})

describe('checkPerformance()', () => {
  it('retorna CategoryResult valido com categoria Performance', async () => {
    const { checkPerformance } = await import('../../lib/quality-checks/performance')
    const result = checkPerformance()
    expectValidCategoryResult(result)
    expect(result.category).toBe('Performance')
  })

  it('score entre 0 e 100', async () => {
    const { checkPerformance } = await import('../../lib/quality-checks/performance')
    const result = checkPerformance()
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('retorna check de fallback quando window nao disponivel', async () => {
    // Remover window temporariamente
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    const { checkPerformance } = await import('../../lib/quality-checks/performance')
    const result = checkPerformance()
    expect(isCategoryResult(result)).toBe(true)
    expect(result.checks.length).toBeGreaterThan(0)
  })
})

describe('checkAccessibility()', () => {
  it('retorna CategoryResult valido com categoria Acessibilidade', async () => {
    const { checkAccessibility } = await import('../../lib/quality-checks/accessibility')
    const result = checkAccessibility()
    expectValidCategoryResult(result)
    expect(result.category).toBe('Acessibilidade')
  })

  it('score entre 0 e 100', async () => {
    const { checkAccessibility } = await import('../../lib/quality-checks/accessibility')
    const result = checkAccessibility()
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('verifica lang attribute no HTML', async () => {
    const { checkAccessibility } = await import('../../lib/quality-checks/accessibility')
    const result = checkAccessibility()
    const langCheck = result.checks.find(c => c.name === 'Atributo lang no HTML')
    expect(langCheck).toBeDefined()
    expect(langCheck?.status).toBe('pass') // lang='pt-BR' definido no mock
  })

  it('retorna fallback quando document nao disponivel', async () => {
    Object.defineProperty(global, 'document', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    const { checkAccessibility } = await import('../../lib/quality-checks/accessibility')
    const result = checkAccessibility()
    expect(isCategoryResult(result)).toBe(true)
    expect(result.checks.length).toBeGreaterThan(0)
  })
})

describe('checkCodeQuality()', () => {
  it('retorna CategoryResult valido com categoria Qualidade de Codigo', async () => {
    const { checkCodeQuality } = await import('../../lib/quality-checks/code-quality')
    const result = checkCodeQuality()
    expectValidCategoryResult(result)
    expect(result.category).toBe('Qualidade de Código')
  })

  it('score entre 0 e 100', async () => {
    const { checkCodeQuality } = await import('../../lib/quality-checks/code-quality')
    const result = checkCodeQuality()
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('aceita serverChecks com node version e environment', async () => {
    const { checkCodeQuality } = await import('../../lib/quality-checks/code-quality')
    const result = checkCodeQuality({
      runtime: { node_version: 'v20.11.0', environment: 'production' },
    })
    expectValidCategoryResult(result)
    const nodeCheck = result.checks.find(c => c.name === 'Versão do Node.js')
    expect(nodeCheck).toBeDefined()
    expect(nodeCheck?.status).toBe('pass')
    const envCheck = result.checks.find(c => c.name === 'Ambiente de execução')
    expect(envCheck?.status).toBe('pass')
  })

  it('retorna warn para Node.js 18', async () => {
    const { checkCodeQuality } = await import('../../lib/quality-checks/code-quality')
    const result = checkCodeQuality({
      runtime: { node_version: 'v18.20.0', environment: 'production' },
    })
    const nodeCheck = result.checks.find(c => c.name === 'Versão do Node.js')
    expect(nodeCheck?.status).toBe('warn')
  })
})

describe('checkDependencies()', () => {
  it('retorna CategoryResult valido com categoria Dependencias e Config', async () => {
    const { checkDependencies } = await import('../../lib/quality-checks/dependencies')
    const result = checkDependencies()
    expectValidCategoryResult(result)
    expect(result.category).toBe('Dependências & Config')
  })

  it('score entre 0 e 100', async () => {
    const { checkDependencies } = await import('../../lib/quality-checks/dependencies')
    const result = checkDependencies()
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('retorna pass quando variaveis criticas configuradas', async () => {
    const { checkDependencies } = await import('../../lib/quality-checks/dependencies')
    const result = checkDependencies({
      env: {
        supabase_url: true,
        supabase_anon_key: true,
        app_url: true,
        app_name: true,
        demo_mode: false,
      },
    })
    expectValidCategoryResult(result)
    const criticalCheck = result.checks.find(c => c.name === 'Variáveis de ambiente críticas')
    expect(criticalCheck?.status).toBe('pass')
    expect(criticalCheck?.score).toBe(100)
  })

  it('retorna fail quando variaveis criticas ausentes', async () => {
    const { checkDependencies } = await import('../../lib/quality-checks/dependencies')
    const result = checkDependencies({
      env: {
        supabase_url: false,
        supabase_anon_key: false,
        app_url: false,
        app_name: false,
        demo_mode: false,
      },
    })
    const criticalCheck = result.checks.find(c => c.name === 'Variáveis de ambiente críticas')
    expect(criticalCheck?.status).toBe('fail')
    expect(criticalCheck?.score).toBe(0)
  })

  it('adiciona check de modo demo quando demo_mode ativo', async () => {
    const { checkDependencies } = await import('../../lib/quality-checks/dependencies')
    const result = checkDependencies({
      env: {
        supabase_url: true,
        supabase_anon_key: true,
        app_url: false,
        app_name: false,
        demo_mode: true,
      },
    })
    const demoCheck = result.checks.find(c => c.name === 'Modo demo')
    expect(demoCheck).toBeDefined()
    expect(demoCheck?.status).toBe('warn')
  })

  it('retorna fallback quando serverChecks nao fornecido', async () => {
    const { checkDependencies } = await import('../../lib/quality-checks/dependencies')
    const result = checkDependencies()
    expectValidCategoryResult(result)
    const fallbackCheck = result.checks.find(c => c.name === 'Server checks')
    expect(fallbackCheck).toBeDefined()
    expect(fallbackCheck?.status).toBe('warn')
  })
})
