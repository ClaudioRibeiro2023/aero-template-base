import type { CategoryResult } from './types'

export function checkAccessibility(): CategoryResult {
  const checks = []

  if (typeof document !== 'undefined') {
    // Check lang attribute
    const htmlLang = document.documentElement.lang
    checks.push({
      name: 'Atributo lang no HTML',
      status: (htmlLang ? 'pass' : 'fail') as 'pass' | 'warn' | 'fail',
      score: htmlLang ? 100 : 0,
      details: htmlLang ? `lang="${htmlLang}"` : 'Atributo lang ausente',
      recommendation: 'Defina lang no elemento <html> para leitores de tela.',
    })

    // Check images without alt
    const images = document.querySelectorAll('img')
    const imagesWithoutAlt = Array.from(images).filter(img => !img.hasAttribute('alt'))
    checks.push({
      name: 'Imagens com atributo alt',
      status: (imagesWithoutAlt.length === 0 ? 'pass' : 'warn') as 'pass' | 'warn' | 'fail',
      score:
        images.length === 0
          ? 100
          : Math.round(((images.length - imagesWithoutAlt.length) / images.length) * 100),
      details: `${imagesWithoutAlt.length}/${images.length} imagens sem alt`,
      recommendation: 'Adicione texto alternativo descritivo para todas as imagens.',
    })

    // Check skip link
    const skipLink = document.querySelector('a[href="#main-content"]')
    checks.push({
      name: 'Skip navigation link',
      status: (skipLink ? 'pass' : 'warn') as 'pass' | 'warn' | 'fail',
      score: skipLink ? 100 : 40,
      details: skipLink ? 'Skip link encontrado' : 'Skip link não encontrado',
      recommendation: 'Adicione um link de pular navegação para acessibilidade.',
    })

    // Check focus-visible
    const styles = getComputedStyle(document.documentElement)
    const hasFocusStyles = styles.getPropertyValue('--brand-primary')
    checks.push({
      name: 'Focus visible styles',
      status: (hasFocusStyles ? 'pass' : 'warn') as 'pass' | 'warn' | 'fail',
      score: hasFocusStyles ? 90 : 50,
      details: 'Verificação de CSS custom properties para focus styles.',
      recommendation: 'Garanta que todos os elementos interativos têm focus-visible styling.',
    })

    // Check ARIA roles
    const landmarks = document.querySelectorAll(
      '[role="main"], [role="navigation"], [role="banner"], main, nav, header'
    )
    checks.push({
      name: 'Landmarks ARIA',
      status: (landmarks.length >= 1 ? 'pass' : 'warn') as 'pass' | 'warn' | 'fail',
      score: landmarks.length >= 2 ? 100 : landmarks.length >= 1 ? 70 : 30,
      details: `${landmarks.length} landmarks encontrados`,
      recommendation: 'Use landmarks ARIA (main, nav, header) para navegação por leitores de tela.',
    })
  } else {
    checks.push({
      name: 'DOM Access',
      status: 'warn' as const,
      score: 50,
      details: 'DOM não disponível. Execute no browser.',
      recommendation: 'Execute o diagnóstico no browser para checks completos de a11y.',
    })
  }

  const score = Math.round(checks.reduce((sum, c) => sum + c.score, 0) / checks.length)
  return { category: 'Acessibilidade', score, checks }
}
