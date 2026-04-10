import type { CategoryResult, CheckResult } from './types'

async function checkEndpoint(url: string, name: string): Promise<CheckResult> {
  try {
    const start = performance.now()
    const res = await fetch(url, { method: 'GET', cache: 'no-store' })
    const elapsed = Math.round(performance.now() - start)

    return {
      name,
      status: res.ok && elapsed < 2000 ? 'pass' : res.ok && elapsed < 5000 ? 'warn' : 'fail',
      score: res.ok ? (elapsed < 1000 ? 100 : elapsed < 3000 ? 70 : 40) : 0,
      details: `Status ${res.status} — ${elapsed}ms`,
      recommendation:
        elapsed > 2000
          ? 'Investigue latência alta. Considere caching ou otimização de queries.'
          : undefined,
    }
  } catch (err) {
    return {
      name,
      status: 'fail',
      score: 0,
      details: `Erro: ${err instanceof Error ? err.message : 'Falha na conexão'}`,
      recommendation: 'Verifique se o endpoint está acessível e respondendo.',
    }
  }
}

export async function checkApiHealth(): Promise<CategoryResult> {
  const checks = await Promise.all([
    checkEndpoint('/api/health', 'Health Check (/api/health)'),
    checkEndpoint('/api/support/tickets?page_size=1', 'Support Tickets API'),
    checkEndpoint('/api/quality/checks', 'Quality Checks API'),
  ])

  const score = Math.round(checks.reduce((sum, c) => sum + c.score, 0) / checks.length)
  return { category: 'API Health', score, checks }
}
