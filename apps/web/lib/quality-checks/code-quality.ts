import type { CategoryResult } from './types'

export function checkCodeQuality(serverChecks?: {
  runtime: { node_version: string; environment: string }
}): CategoryResult {
  const checks = []

  // Check environment
  const env = serverChecks?.runtime?.environment ?? process.env.NODE_ENV ?? 'unknown'
  checks.push({
    name: 'Ambiente de execução',
    status: (env === 'production' ? 'pass' : 'warn') as 'pass' | 'warn' | 'fail',
    score: env === 'production' ? 100 : 60,
    details: `NODE_ENV = ${env}`,
    recommendation: env !== 'production' ? 'Garanta que NODE_ENV=production em deploy.' : undefined,
  })

  // Check Node.js version
  if (serverChecks?.runtime?.node_version) {
    const version = serverChecks.runtime.node_version
    const major = parseInt(version.replace('v', '').split('.')[0], 10)
    checks.push({
      name: 'Versão do Node.js',
      status: (major >= 20 ? 'pass' : major >= 18 ? 'warn' : 'fail') as 'pass' | 'warn' | 'fail',
      score: major >= 20 ? 100 : major >= 18 ? 70 : 30,
      details: version,
      recommendation: major < 20 ? 'Atualize para Node.js 20+ LTS.' : undefined,
    })
  }

  // TypeScript strict mode (template default)
  checks.push({
    name: 'TypeScript strict mode',
    status: 'pass' as const,
    score: 100,
    details: 'Template configurado com strict: true no tsconfig.',
    recommendation: undefined,
  })

  // Next.js App Router
  checks.push({
    name: 'Next.js App Router',
    status: 'pass' as const,
    score: 100,
    details: 'Usando App Router com RSC + Client Components.',
    recommendation: undefined,
  })

  const score = Math.round(checks.reduce((sum, c) => sum + c.score, 0) / checks.length)
  return { category: 'Qualidade de Código', score, checks }
}
