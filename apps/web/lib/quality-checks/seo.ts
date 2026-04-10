import type { CategoryResult } from './types'

export function checkSeo(): CategoryResult {
  const checks = []

  if (typeof document !== 'undefined') {
    // Title
    const title = document.title
    checks.push({
      name: 'Título da página',
      status: (title && title.length > 0 ? 'pass' : 'fail') as 'pass' | 'warn' | 'fail',
      score: title && title.length >= 10 && title.length <= 60 ? 100 : title ? 60 : 0,
      details: title ? `"${title}" (${title.length} chars)` : 'Título ausente',
      recommendation: 'Defina título entre 10-60 caracteres com palavras-chave relevantes.',
    })

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content')
    checks.push({
      name: 'Meta description',
      status: (metaDesc ? 'pass' : 'warn') as 'pass' | 'warn' | 'fail',
      score: metaDesc && metaDesc.length >= 50 && metaDesc.length <= 160 ? 100 : metaDesc ? 60 : 20,
      details: metaDesc ? `${metaDesc.length} chars` : 'Meta description ausente',
      recommendation: 'Adicione meta description entre 50-160 caracteres.',
    })

    // OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDesc = document.querySelector('meta[property="og:description"]')
    const ogTags = [ogTitle, ogDesc].filter(Boolean).length
    checks.push({
      name: 'Open Graph tags',
      status: (ogTags >= 2 ? 'pass' : ogTags >= 1 ? 'warn' : 'fail') as 'pass' | 'warn' | 'fail',
      score: ogTags >= 2 ? 100 : ogTags >= 1 ? 60 : 20,
      details: `${ogTags}/2 OG tags encontradas`,
      recommendation: 'Adicione og:title e og:description para melhor sharing social.',
    })

    // Viewport meta
    const viewport = document.querySelector('meta[name="viewport"]')
    checks.push({
      name: 'Viewport meta tag',
      status: (viewport ? 'pass' : 'fail') as 'pass' | 'warn' | 'fail',
      score: viewport ? 100 : 0,
      details: viewport ? 'Viewport configurado' : 'Viewport meta ausente',
      recommendation: 'Configure viewport meta para responsividade mobile.',
    })
  } else {
    checks.push({
      name: 'DOM Access',
      status: 'warn' as const,
      score: 50,
      details: 'DOM não disponível. Execute no browser.',
      recommendation: 'Execute o diagnóstico no browser para checks completos de SEO.',
    })
  }

  const score = Math.round(checks.reduce((sum, c) => sum + c.score, 0) / checks.length)
  return { category: 'SEO', score, checks }
}
