import type { CategoryResult } from './types'

export function checkDependencies(serverChecks?: { env: Record<string, boolean> }): CategoryResult {
  const checks = []

  // Check critical env vars
  if (serverChecks?.env) {
    const envChecks = serverChecks.env
    const criticalVars = ['supabase_url', 'supabase_anon_key']
    const optionalVars = ['app_url', 'app_name']

    const criticalConfigured = criticalVars.filter(v => envChecks[v]).length
    checks.push({
      name: 'Variáveis de ambiente críticas',
      status: (criticalConfigured === criticalVars.length ? 'pass' : 'fail') as
        | 'pass'
        | 'warn'
        | 'fail',
      score: Math.round((criticalConfigured / criticalVars.length) * 100),
      details: `${criticalConfigured}/${criticalVars.length} configuradas`,
      recommendation: 'Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    })

    const optionalConfigured = optionalVars.filter(v => envChecks[v]).length
    checks.push({
      name: 'Variáveis opcionais',
      status: (optionalConfigured === optionalVars.length ? 'pass' : 'warn') as
        | 'pass'
        | 'warn'
        | 'fail',
      score: Math.round((optionalConfigured / optionalVars.length) * 100),
      details: `${optionalConfigured}/${optionalVars.length} configuradas`,
      recommendation: 'Configure APP_URL e APP_NAME para melhor SEO e branding.',
    })

    if (envChecks.demo_mode) {
      checks.push({
        name: 'Modo demo',
        status: 'warn' as const,
        score: 50,
        details: 'DEMO_MODE está ativo — auth é ignorado.',
        recommendation: 'Desative DEMO_MODE em produção para segurança.',
      })
    }
  } else {
    checks.push({
      name: 'Server checks',
      status: 'warn' as const,
      score: 50,
      details: 'Dados do servidor não disponíveis.',
      recommendation: 'Execute o diagnóstico com acesso à API /api/quality/checks.',
    })
  }

  const score =
    checks.length > 0 ? Math.round(checks.reduce((sum, c) => sum + c.score, 0) / checks.length) : 50
  return { category: 'Dependências & Config', score, checks }
}
