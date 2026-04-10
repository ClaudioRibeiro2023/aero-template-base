import type { CategoryResult } from './types'

export async function checkI18n(): Promise<CategoryResult> {
  const checks = []

  try {
    const [ptBR, enUS, es] = (await Promise.all([
      fetch('/messages/pt-BR.json')
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch('/messages/en-US.json')
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch('/messages/es.json')
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null),
    ])) as [
      Record<string, unknown> | null,
      Record<string, unknown> | null,
      Record<string, unknown> | null,
    ]

    const locales = { 'pt-BR': ptBR, 'en-US': enUS, es: es }
    const available = Object.entries(locales).filter(([, v]) => v !== null)

    checks.push({
      name: 'Locales disponíveis',
      status: (available.length >= 3 ? 'pass' : available.length >= 1 ? 'warn' : 'fail') as
        | 'pass'
        | 'warn'
        | 'fail',
      score: Math.round((available.length / 3) * 100),
      details: `${available.length}/3 locales carregados (${available.map(([k]) => k).join(', ')})`,
      recommendation: 'Garanta que todos os 3 locales (pt-BR, en-US, es) estejam disponíveis.',
    })

    // Compare keys between pt-BR (primary) and others
    if (ptBR) {
      const ptKeys = Object.keys(ptBR)
      for (const [locale, data] of available) {
        if (locale === 'pt-BR' || !data) continue
        const localeKeys = Object.keys(data)
        const missing = ptKeys.filter(k => !localeKeys.includes(k))
        checks.push({
          name: `Completude ${locale}`,
          status: (missing.length === 0 ? 'pass' : missing.length <= 2 ? 'warn' : 'fail') as
            | 'pass'
            | 'warn'
            | 'fail',
          score:
            ptKeys.length > 0
              ? Math.round(((ptKeys.length - missing.length) / ptKeys.length) * 100)
              : 100,
          details:
            missing.length > 0
              ? `${missing.length} namespaces faltando: ${missing.join(', ')}`
              : 'Completo',
          recommendation:
            missing.length > 0 ? `Adicione as chaves faltantes em ${locale}.` : undefined,
        })
      }
    }
  } catch {
    checks.push({
      name: 'Arquivos i18n',
      status: 'warn' as const,
      score: 50,
      details: 'Não foi possível carregar arquivos de tradução via fetch.',
      recommendation: 'Verifique se os arquivos de mensagens estão acessíveis.',
    })
  }

  const score =
    checks.length > 0 ? Math.round(checks.reduce((sum, c) => sum + c.score, 0) / checks.length) : 50
  return { category: 'i18n', score, checks }
}
