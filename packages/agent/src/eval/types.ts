/**
 * Eval Harness — contratos do offline deterministic eval harness.
 *
 * Roda o AgentOrchestrator REAL com um MockAIGateway que reproduz
 * turnos scriptados. Zero custo de API, zero DB, 100% determinístico.
 */

export interface MockTurn {
  content?: string
  toolCalls?: Array<{ name: string; arguments: Record<string, unknown> }>
  finishReason?: 'stop' | 'tool_calls' | 'length' | 'content_filter'
  usage?: { promptTokens: number; completionTokens: number }
}

export interface EvalExpectations {
  expectedTools?: string[]
  forbiddenTools?: string[]
  expectsPendingAction?: boolean
  expectsDegraded?: boolean
  responseContains?: string[]
  responseMatchesRegex?: string
  minSources?: number
  maxLatencyMs?: number
  userRole?: string
  rbacShouldBlock?: boolean
  tenantId?: string
  /** Override de appId (default 'eval') */
  appId?: string
  /** Asserta que response.domainPackId === este valor */
  expectedDomainPackId?: string
  /** Asserta que response.domainPackFallback === este valor */
  expectedDomainPackFallback?: boolean
}

export interface EvalCase {
  id: string
  title: string
  category: 'read' | 'write' | 'rag' | 'degradation' | 'security' | 'memory'
  input: string
  mockTurns: MockTurn[]
  expectations: EvalExpectations
  /** Saídas sintéticas por tool name. Chave = toolName. */
  mockToolOutputs?: Record<string, unknown>
  /** Simula hits da camada semantic (RAG). */
  mockMemoryHits?: Array<{ key: string; value: unknown; content?: string; source?: string }>
}

export interface AssertionResult {
  name: string
  passed: boolean
  detail?: string
}

export interface EvalResult {
  caseId: string
  title: string
  category: EvalCase['category']
  passed: boolean
  assertions: AssertionResult[]
  metrics: {
    latencyMs: number
    toolsInvoked: string[]
    pendingActionsCount: number
    degraded: boolean
    error?: string
    /** Sprint 10: domain pack resolvido no response. */
    domainPackId?: string
  }
  timestamp: string
}

export interface EvalRun {
  runId: string
  startedAt: string
  finishedAt: string
  gitSha?: string
  results: EvalResult[]
  summary: {
    total: number
    passed: number
    failed: number
    byCategory: Record<string, { total: number; passed: number }>
    passRate: number
    medianLatencyMs: number
    p95LatencyMs: number
  }
}

export interface RegressionDiff {
  baselineRunId: string
  currentRunId: string
  regressions: Array<{ caseId: string; title: string; wasPassed: true; nowPassed: false }>
  wins: Array<{ caseId: string; title: string; wasPassed: false; nowPassed: true }>
  newCases: string[]
  removedCases: string[]
  stable: { passed: number; failed: number }
}
