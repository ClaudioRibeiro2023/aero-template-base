import type { DiagnosticReport } from './types'
import { checkSecurity } from './security'
import { checkPerformance } from './performance'
import { checkAccessibility } from './accessibility'
import { checkSeo } from './seo'
import { checkApiHealth } from './api-health'
import { checkI18n } from './i18n'
import { checkDependencies } from './dependencies'
import { checkCodeQuality } from './code-quality'

export type { DiagnosticReport, CheckResult, CategoryResult } from './types'

interface ServerChecksData {
  env: Record<string, boolean>
  runtime: { node_version: string; environment: string }
}

export async function runDiagnostic(serverChecks?: ServerChecksData): Promise<DiagnosticReport> {
  // Run sync checks
  const syncResults = [
    checkSecurity(),
    checkPerformance(),
    checkAccessibility(),
    checkSeo(),
    checkDependencies(serverChecks),
    checkCodeQuality(serverChecks),
  ]

  // Run async checks
  const [apiHealth, i18n] = await Promise.all([checkApiHealth(), checkI18n()])

  const allResults = [...syncResults, apiHealth, i18n]

  const results: DiagnosticReport['results'] = {}
  for (const result of allResults) {
    const key = result.category.toLowerCase().replace(/[^a-z0-9]/g, '_')
    results[key] = result
  }

  const overall_score = Math.round(
    allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length
  )

  return {
    overall_score,
    results,
    timestamp: new Date().toISOString(),
  }
}
