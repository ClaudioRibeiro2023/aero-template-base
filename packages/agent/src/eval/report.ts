import type { EvalRun, RegressionDiff } from './types'

export function formatRunAsJson(run: EvalRun): string {
  return JSON.stringify(run, null, 2)
}

export function formatRunAsMarkdown(run: EvalRun): string {
  const s = run.summary
  const lines: string[] = []
  lines.push(`# Eval Run — ${run.runId}`)
  lines.push('')
  lines.push(`- Iniciado: ${run.startedAt}`)
  lines.push(`- Terminado: ${run.finishedAt}`)
  if (run.gitSha) lines.push(`- Git SHA: \`${run.gitSha}\``)
  lines.push('')
  lines.push(`## Resumo`)
  lines.push('')
  lines.push(`| Métrica | Valor |`)
  lines.push(`|---|---|`)
  lines.push(`| Total | ${s.total} |`)
  lines.push(`| Passed | ${s.passed} |`)
  lines.push(`| Failed | ${s.failed} |`)
  lines.push(`| Pass rate | ${(s.passRate * 100).toFixed(1)}% |`)
  lines.push(`| Median latency | ${s.medianLatencyMs}ms |`)
  lines.push(`| P95 latency | ${s.p95LatencyMs}ms |`)
  lines.push('')
  lines.push(`### Por categoria`)
  lines.push('')
  lines.push(`| Categoria | Passed | Total |`)
  lines.push(`|---|---|---|`)
  for (const [cat, b] of Object.entries(s.byCategory)) {
    lines.push(`| ${cat} | ${b.passed} | ${b.total} |`)
  }
  lines.push('')
  lines.push(`## Casos`)
  lines.push('')
  lines.push(`| Status | ID | Título | Categoria | Latência | Tools |`)
  lines.push(`|---|---|---|---|---|---|`)
  for (const r of run.results) {
    const st = r.passed ? 'PASS' : 'FAIL'
    const tools = r.metrics.toolsInvoked.join(', ') || '-'
    lines.push(
      `| ${st} | \`${r.caseId}\` | ${r.title} | ${r.category} | ${r.metrics.latencyMs}ms | ${tools} |`
    )
  }
  lines.push('')

  // Detalhe de falhas
  const failures = run.results.filter(r => !r.passed)
  if (failures.length > 0) {
    lines.push(`## Falhas`)
    lines.push('')
    for (const r of failures) {
      lines.push(`### ${r.caseId} — ${r.title}`)
      lines.push('')
      for (const a of r.assertions) {
        const mark = a.passed ? 'ok  ' : 'FAIL'
        lines.push(`- [${mark}] ${a.name}${a.detail ? ` — ${a.detail}` : ''}`)
      }
      if (r.metrics.error) {
        lines.push('')
        lines.push(`Erro: \`${r.metrics.error}\``)
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

export function diffRuns(baseline: EvalRun, current: EvalRun): RegressionDiff {
  const baseMap = new Map(baseline.results.map(r => [r.caseId, r.passed]))
  const curMap = new Map(current.results.map(r => [r.caseId, r.passed]))

  const regressions: RegressionDiff['regressions'] = []
  const wins: RegressionDiff['wins'] = []
  const newCases: string[] = []
  const removedCases: string[] = []
  let stablePassed = 0
  let stableFailed = 0

  for (const r of current.results) {
    const prev = baseMap.get(r.caseId)
    if (prev === undefined) {
      newCases.push(r.caseId)
      continue
    }
    if (prev === true && r.passed === false) {
      regressions.push({
        caseId: r.caseId,
        title: r.title,
        wasPassed: true,
        nowPassed: false,
      })
    } else if (prev === false && r.passed === true) {
      wins.push({
        caseId: r.caseId,
        title: r.title,
        wasPassed: false,
        nowPassed: true,
      })
    } else if (r.passed) {
      stablePassed++
    } else {
      stableFailed++
    }
  }

  for (const id of baseMap.keys()) {
    if (!curMap.has(id)) removedCases.push(id)
  }

  return {
    baselineRunId: baseline.runId,
    currentRunId: current.runId,
    regressions,
    wins,
    newCases,
    removedCases,
    stable: { passed: stablePassed, failed: stableFailed },
  }
}

export function formatDiffAsMarkdown(diff: RegressionDiff): string {
  const lines: string[] = []
  lines.push(`# Regression Diff`)
  lines.push('')
  lines.push(`- Baseline: \`${diff.baselineRunId}\``)
  lines.push(`- Current: \`${diff.currentRunId}\``)
  lines.push('')
  lines.push(`## Sumário`)
  lines.push('')
  lines.push(`- Regressões: ${diff.regressions.length}`)
  lines.push(`- Wins: ${diff.wins.length}`)
  lines.push(`- Novos casos: ${diff.newCases.length}`)
  lines.push(`- Casos removidos: ${diff.removedCases.length}`)
  lines.push(`- Estáveis (passed): ${diff.stable.passed}`)
  lines.push(`- Estáveis (failed): ${diff.stable.failed}`)
  lines.push('')

  if (diff.regressions.length > 0) {
    lines.push(`## Regressões`)
    lines.push('')
    for (const r of diff.regressions) {
      lines.push(`- FAIL \`${r.caseId}\` — ${r.title}`)
    }
    lines.push('')
  }

  if (diff.wins.length > 0) {
    lines.push(`## Wins`)
    lines.push('')
    for (const w of diff.wins) {
      lines.push(`- PASS \`${w.caseId}\` — ${w.title}`)
    }
    lines.push('')
  }

  if (diff.newCases.length > 0) {
    lines.push(`## Novos casos`)
    lines.push('')
    for (const id of diff.newCases) lines.push(`- \`${id}\``)
    lines.push('')
  }

  if (diff.removedCases.length > 0) {
    lines.push(`## Casos removidos`)
    lines.push('')
    for (const id of diff.removedCases) lines.push(`- \`${id}\``)
    lines.push('')
  }

  return lines.join('\n')
}
