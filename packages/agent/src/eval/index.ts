/**
 * @template/agent/eval — Offline deterministic eval harness.
 */
export type {
  EvalCase,
  EvalExpectations,
  EvalResult,
  EvalRun,
  AssertionResult,
  RegressionDiff,
  MockTurn,
} from './types'
export { MockAIGateway } from './MockAIGateway'
export { runEvalCase, runEval } from './Runner'
export type { ToolInvocation, RunEvalOptions } from './Runner'
export { formatRunAsJson, formatRunAsMarkdown, diffRuns, formatDiffAsMarkdown } from './report'
export { goldenCases } from './cases/index'
