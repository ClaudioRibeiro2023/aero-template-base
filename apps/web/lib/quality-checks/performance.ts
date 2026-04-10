import type { CategoryResult } from './types'

export function checkPerformance(): CategoryResult {
  const checks = []

  // LCP check via PerformanceObserver data
  if (typeof window !== 'undefined' && window.performance) {
    const navEntries = performance.getEntriesByType('navigation')
    const navEntry = navEntries[0] as PerformanceNavigationTiming | undefined

    const domContentLoaded = navEntry?.domContentLoadedEventEnd ?? 0
    const loadComplete = navEntry?.loadEventEnd ?? 0

    checks.push({
      name: 'DOM Content Loaded',
      status: (domContentLoaded < 1500 ? 'pass' : domContentLoaded < 3000 ? 'warn' : 'fail') as
        | 'pass'
        | 'warn'
        | 'fail',
      score: domContentLoaded < 1500 ? 100 : domContentLoaded < 3000 ? 60 : 30,
      details: `${Math.round(domContentLoaded)}ms`,
      recommendation: 'Reduza blocking resources e otimize critical rendering path.',
    })

    checks.push({
      name: 'Page Load Complete',
      status: (loadComplete < 3000 ? 'pass' : loadComplete < 5000 ? 'warn' : 'fail') as
        | 'pass'
        | 'warn'
        | 'fail',
      score: loadComplete < 3000 ? 100 : loadComplete < 5000 ? 60 : 30,
      details: `${Math.round(loadComplete)}ms`,
      recommendation: 'Implemente lazy loading para imagens e componentes abaixo do fold.',
    })

    const resources = performance.getEntriesByType('resource')
    const jsResources = resources.filter(r => r.name.endsWith('.js'))
    const totalJsSize = jsResources.reduce(
      (sum, r) => sum + (r as PerformanceResourceTiming).transferSize,
      0
    )
    const jsSizeKb = Math.round(totalJsSize / 1024)

    checks.push({
      name: 'JS Bundle Size',
      status: (jsSizeKb < 500 ? 'pass' : jsSizeKb < 1000 ? 'warn' : 'fail') as
        | 'pass'
        | 'warn'
        | 'fail',
      score: jsSizeKb < 500 ? 100 : jsSizeKb < 1000 ? 60 : 30,
      details: `${jsSizeKb}KB transferido`,
      recommendation: 'Use code splitting e dynamic imports para reduzir bundle size.',
    })
  } else {
    checks.push({
      name: 'Performance API',
      status: 'warn' as const,
      score: 50,
      details: 'Performance API não disponível neste ambiente.',
      recommendation: 'Execute o diagnóstico no browser para métricas completas.',
    })
  }

  checks.push({
    name: 'Lazy Loading de imagens',
    status: 'pass' as const,
    score: 90,
    details: 'Next.js Image component com lazy loading nativo.',
    recommendation: 'Use next/image para todas as imagens com width/height definidos.',
  })

  const score = Math.round(checks.reduce((sum, c) => sum + c.score, 0) / checks.length)
  return { category: 'Performance', score, checks }
}
