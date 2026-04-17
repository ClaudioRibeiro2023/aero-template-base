#!/usr/bin/env node
/**
 * CLI do eval harness.
 *
 * Uso:
 *   pnpm --filter @template/agent eval
 *   pnpm --filter @template/agent eval -- --case read-get-open-tasks
 *   pnpm --filter @template/agent eval -- --baseline eval-results/baseline.json
 *   pnpm --filter @template/agent eval -- --out eval-results --json-only
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { runEval } from './Runner'
import { goldenCases } from './cases/index'
import { formatRunAsJson, formatRunAsMarkdown, diffRuns, formatDiffAsMarkdown } from './report'
import type { EvalRun } from './types'

interface Args {
  baseline?: string
  out: string
  caseId?: string
  jsonOnly: boolean
  updateBaseline: boolean
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    out: 'eval-results',
    jsonOnly: false,
    updateBaseline: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--baseline') args.baseline = argv[++i]
    else if (a === '--out') args.out = argv[++i] ?? 'eval-results'
    else if (a === '--case') args.caseId = argv[++i]
    else if (a === '--json-only') args.jsonOnly = true
    else if (a === '--update-baseline') args.updateBaseline = true
  }
  return args
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const outDir = resolve(process.cwd(), args.out)
  mkdirSync(outDir, { recursive: true })

  console.info(
    `[eval] running ${goldenCases.length} case(s)${args.caseId ? ` (filter: ${args.caseId})` : ''}`
  )
  const run: EvalRun = await runEval(goldenCases, { onlyCaseId: args.caseId })

  const ts = run.finishedAt.replace(/[:.]/g, '-')
  const jsonPath = join(outDir, `run-${ts}.json`)
  writeFileSync(jsonPath, formatRunAsJson(run), 'utf-8')
  console.info(`[eval] wrote ${jsonPath}`)

  if (!args.jsonOnly) {
    const mdPath = join(outDir, `run-${ts}.md`)
    writeFileSync(mdPath, formatRunAsMarkdown(run), 'utf-8')
    console.info(`[eval] wrote ${mdPath}`)
  }

  let diffHasRegressions = false
  if (args.baseline) {
    const baselinePath = resolve(process.cwd(), args.baseline)
    if (!existsSync(baselinePath)) {
      console.warn(`[eval] baseline not found: ${baselinePath} — skipping diff`)
    } else {
      const baselineRaw = readFileSync(baselinePath, 'utf-8')
      const baseline = JSON.parse(baselineRaw) as EvalRun
      const diff = diffRuns(baseline, run)
      const diffMdPath = join(outDir, `diff-${ts}.md`)
      writeFileSync(diffMdPath, formatDiffAsMarkdown(diff), 'utf-8')
      console.info(`[eval] wrote ${diffMdPath}`)
      diffHasRegressions = diff.regressions.length > 0
    }
  }

  if (args.updateBaseline) {
    const baselinePath = join(outDir, 'baseline.json')
    writeFileSync(baselinePath, formatRunAsJson(run), 'utf-8')
    console.info(`[eval] updated baseline: ${baselinePath}`)
  }

  // Print summary
  const s = run.summary
  console.info('')
  console.info(`[eval] summary: ${s.passed}/${s.total} passed (${(s.passRate * 100).toFixed(1)}%)`)
  console.info(`[eval] median=${s.medianLatencyMs}ms p95=${s.p95LatencyMs}ms`)

  const allPassed = s.passRate === 1
  if (!allPassed || diffHasRegressions) {
    process.exit(1)
  }
}

main().catch(err => {
  console.error('[eval] fatal:', err)
  process.exit(2)
})
