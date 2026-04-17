/**
 * Eval Runner — executa EvalCases contra um AgentOrchestrator real
 * usando MockAIGateway + ToolRegistry com tools sintéticas.
 *
 * Determinístico: mesmas entradas → mesmos outputs (exceto latência wall-clock).
 */
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { AgentOrchestrator } from '../orchestrator/AgentOrchestrator'
import { ToolRegistry } from '../tools/ToolRegistry'
import { PolicyEngine } from '../policy/PolicyEngine'
import { AgentTracer } from '../observability/AgentTracer'
import { DomainPackRegistry } from '../domain-packs/DomainPackRegistry'
import { coreDomainPack } from '../domain-packs/core/index'
import { tasksDomainPack } from '../domain-packs/tasks/index'
import { MemoryManager } from '../memory/MemoryManager'
import { MockAIGateway } from './MockAIGateway'
import type { EvalCase, EvalResult, EvalRun, AssertionResult, MockTurn } from './types'
import type {
  ToolDefinition,
  ToolExecutionContext,
  ToolResult,
  WriteToolPreview,
} from '../types/tool'
import type { IExternalMemoryStore, MemoryEntry, DocumentExcerpt } from '../types/memory'

// ─── Tool catalog (roles necessárias para RBAC) ──────────────────────────────
//
// Espelha o que o core pack autoriza + a política de roles por tool.
// `get_recent_activity` e `get_operational_snapshot` são gerencias+.
const TOOL_ROLES: Record<string, { requiredRoles?: string[]; requiresConfirmation?: boolean }> = {
  search_internal_documents: {},
  get_open_tasks: {},
  get_ticket_status: {},
  get_pending_items: {},
  get_recent_activity: { requiredRoles: ['manager', 'admin', 'super_admin'] },
  get_operational_snapshot: { requiredRoles: ['manager', 'admin', 'super_admin'] },
  create_task: { requiresConfirmation: true },
  update_task_status: { requiresConfirmation: true },
  update_task_priority: { requiresConfirmation: true },
  assign_task: { requiresConfirmation: true },
}

/** Captura de cada execução de tool para asserções post-run. */
export interface ToolInvocation {
  toolName: string
  input: unknown
  context: ToolExecutionContext
  result: ToolResult
}

// ─── Fake external memory store p/ casos RAG ─────────────────────────────────

function makeFakeMemoryStore(hits: NonNullable<EvalCase['mockMemoryHits']>): IExternalMemoryStore {
  const docs: DocumentExcerpt[] = hits.map((h, idx) => ({
    id: `doc_${idx}`,
    content: h.content ?? String(h.value ?? h.key),
    source: h.source ?? h.key,
    sourceType: 'document',
    score: 0.9 - idx * 0.05,
    chunkIndex: 0,
  }))

  return {
    async get() {
      return null
    },
    async set(entry) {
      return {
        id: randomUUID(),
        layer: entry.layer,
        key: entry.key,
        value: entry.value,
        scope: entry.scope,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as MemoryEntry
    },
    async search() {
      return []
    },
    async retrieveDocuments() {
      return docs
    },
    async delete() {
      /* noop */
    },
  }
}

// ─── Tool factory ────────────────────────────────────────────────────────────

function buildSyntheticTool(
  toolName: string,
  mockOutput: unknown,
  capture: ToolInvocation[]
): ToolDefinition {
  const meta = TOOL_ROLES[toolName] ?? {}
  return {
    name: toolName,
    description: `Eval synthetic tool for ${toolName}`,
    inputSchema: z.object({}).passthrough() as z.ZodTypeAny,
    authorization: {
      requiredRoles: meta.requiredRoles,
      requiresConfirmation: meta.requiresConfirmation,
    },
    async execute(input, context) {
      // Modela falha de tool se o mockOutput for { __error: string }
      if (
        mockOutput &&
        typeof mockOutput === 'object' &&
        '__error' in (mockOutput as Record<string, unknown>)
      ) {
        const err = (mockOutput as Record<string, unknown>).__error as string
        const result: ToolResult = { success: false, error: err, code: 'TOOL_FAILURE' }
        capture.push({ toolName, input, context, result })
        return result
      }

      // Tools com requiresConfirmation retornam preview — orchestrator cria pending action
      if (meta.requiresConfirmation) {
        const preview: WriteToolPreview = {
          description: `Prévia para ${toolName}`,
          impact: 'Operação de escrita (aguardando confirmação).',
          details: (input as Record<string, unknown>) ?? {},
        }
        const result: ToolResult = {
          success: true,
          data: { preview, proposed: input },
          source: 'transactional',
        }
        capture.push({ toolName, input, context, result })
        return result
      }

      const data =
        mockOutput !== undefined ? mockOutput : { ok: true, mocked: true, tool: toolName }
      const result: ToolResult = {
        success: true,
        data,
        source: 'transactional',
      }
      capture.push({ toolName, input, context, result })
      return result
    },
  }
}

// ─── Pending action store sintético ──────────────────────────────────────────

function makePendingActionStore() {
  return {
    async create(params: {
      sessionId: string
      tenantId: string
      userId: string
      appId: string
      toolName: string
      proposedInput: unknown
      description: string
      impact: string
      traceId?: string
    }) {
      const now = new Date()
      return {
        id: randomUUID(),
        sessionId: params.sessionId,
        tenantId: params.tenantId,
        userId: params.userId,
        appId: params.appId,
        toolName: params.toolName,
        proposedInput: params.proposedInput,
        description: params.description,
        impact: params.impact,
        status: 'pending' as const,
        expiresAt: new Date(now.getTime() + 10 * 60_000).toISOString(),
        createdAt: now.toISOString(),
      }
    },
  }
}

// ─── Runner principal ────────────────────────────────────────────────────────

export interface RunEvalOptions {
  /** Filtra por caseId (útil para --case). */
  onlyCaseId?: string
  /** Override de gitSha no EvalRun. */
  gitSha?: string
}

export async function runEvalCase(kase: EvalCase): Promise<EvalResult> {
  const start = Date.now()
  const capture: ToolInvocation[] = []

  // Monta turns; para casos de degradação, insere um turno final de resposta se não houver
  const turns: MockTurn[] = [...kase.mockTurns]

  const gateway = new MockAIGateway({ caseId: kase.id, turns })

  const registry = new ToolRegistry()
  // Registra TODAS as tools mencionadas pelo caso (expected, forbidden, e keys de mockToolOutputs)
  const toolsToRegister = new Set<string>()
  for (const t of kase.expectations.expectedTools ?? []) toolsToRegister.add(t)
  for (const t of kase.expectations.forbiddenTools ?? []) toolsToRegister.add(t)
  for (const t of Object.keys(kase.mockToolOutputs ?? {})) toolsToRegister.add(t)
  // Também registra qualquer tool referenciada nos mockTurns
  for (const turn of turns) {
    for (const tc of turn.toolCalls ?? []) toolsToRegister.add(tc.name)
  }

  for (const toolName of toolsToRegister) {
    const mockOut = kase.mockToolOutputs?.[toolName]
    registry.register(buildSyntheticTool(toolName, mockOut, capture))
  }

  const policy = new PolicyEngine()
  const tracer = new AgentTracer()
  const packRegistry = new DomainPackRegistry()
  packRegistry.register(coreDomainPack)
  packRegistry.register(tasksDomainPack)

  const memoryStore = kase.mockMemoryHits ? makeFakeMemoryStore(kase.mockMemoryHits) : undefined
  const memory = new MemoryManager(gateway, memoryStore)

  const orchestrator = new AgentOrchestrator({
    gateway,
    memory,
    tools: registry,
    policy,
    packRegistry,
    tracer,
    memoryStore,
    pendingActionStore: makePendingActionStore(),
  })

  const userRole = kase.expectations.userRole ?? 'user'
  const tenantId = kase.expectations.tenantId ?? 'eval-tenant'
  const appId = kase.expectations.appId ?? 'eval'

  let response: Awaited<ReturnType<AgentOrchestrator['run']>> | null = null
  let runError: string | undefined

  try {
    response = await orchestrator.run({
      message: kase.input,
      sessionId: null,
      userId: 'eval-user',
      tenantId,
      appId,
      userRole,
    })
  } catch (err) {
    runError = err instanceof Error ? err.message : String(err)
  }

  const latencyMs = Date.now() - start

  const assertions = evaluateAssertions(kase, response, capture, runError, latencyMs)
  const passed = assertions.every(a => a.passed)

  return {
    caseId: kase.id,
    title: kase.title,
    category: kase.category,
    passed,
    assertions,
    metrics: {
      latencyMs,
      toolsInvoked: capture.map(c => c.toolName),
      pendingActionsCount: response?.pendingActions?.length ?? 0,
      degraded: response?.degraded === true,
      error: runError,
      domainPackId: response?.domainPackId,
    },
    timestamp: new Date().toISOString(),
  }
}

function evaluateAssertions(
  kase: EvalCase,
  response: Awaited<ReturnType<AgentOrchestrator['run']>> | null,
  capture: ToolInvocation[],
  runError: string | undefined,
  latencyMs: number
): AssertionResult[] {
  const results: AssertionResult[] = []
  const exp = kase.expectations
  const invokedNames = capture.map(c => c.toolName)

  // Se o run crashou e não era esperado, falha imediata
  if (runError && !exp.rbacShouldBlock) {
    results.push({
      name: 'orchestrator.run',
      passed: false,
      detail: `Erro inesperado: ${runError}`,
    })
    return results
  }
  results.push({ name: 'orchestrator.run', passed: true })

  if (exp.expectedTools) {
    for (const name of exp.expectedTools) {
      const found = invokedNames.includes(name)
      results.push({
        name: `expectedTools[${name}]`,
        passed: found,
        detail: found
          ? undefined
          : `tool "${name}" não foi invocada. Invocadas: ${invokedNames.join(', ') || '(nenhuma)'}`,
      })
    }
  }

  if (exp.forbiddenTools) {
    for (const name of exp.forbiddenTools) {
      const found = invokedNames.includes(name)
      results.push({
        name: `forbiddenTools[${name}]`,
        passed: !found,
        detail: found ? `tool proibida "${name}" foi invocada` : undefined,
      })
    }
  }

  if (exp.expectsPendingAction !== undefined) {
    const hasPending = (response?.pendingActions?.length ?? 0) > 0
    results.push({
      name: 'expectsPendingAction',
      passed: hasPending === exp.expectsPendingAction,
      detail: `esperado=${exp.expectsPendingAction}, atual=${hasPending}`,
    })
  }

  if (exp.expectsDegraded !== undefined) {
    // "Degradação" em casos de falha de tool: interpretamos como success=false nos capture
    // OU response.degraded=true. Aceitamos qualquer sinal observável.
    const hasFailure = capture.some(c => !c.result.success)
    const observedDegraded = response?.degraded === true || hasFailure
    results.push({
      name: 'expectsDegraded',
      passed: observedDegraded === exp.expectsDegraded,
      detail: `esperado=${exp.expectsDegraded}, degraded=${response?.degraded === true}, toolFailure=${hasFailure}`,
    })
  }

  if (exp.responseContains) {
    const content = response?.content ?? ''
    for (const sub of exp.responseContains) {
      const found = content.toLowerCase().includes(sub.toLowerCase())
      results.push({
        name: `responseContains["${sub}"]`,
        passed: found,
        detail: found ? undefined : `substring "${sub}" ausente em: "${content.slice(0, 120)}"`,
      })
    }
  }

  if (exp.responseMatchesRegex) {
    const re = new RegExp(exp.responseMatchesRegex)
    const content = response?.content ?? ''
    results.push({
      name: `responseMatchesRegex`,
      passed: re.test(content),
      detail: `regex=${exp.responseMatchesRegex}`,
    })
  }

  if (exp.minSources !== undefined) {
    const n = response?.sources?.length ?? 0
    results.push({
      name: 'minSources',
      passed: n >= exp.minSources,
      detail: `esperado>=${exp.minSources}, atual=${n}`,
    })
  }

  if (exp.maxLatencyMs !== undefined) {
    results.push({
      name: 'maxLatencyMs',
      passed: latencyMs <= exp.maxLatencyMs,
      detail: `latência=${latencyMs}ms (limite ${exp.maxLatencyMs}ms)`,
    })
  }

  if (exp.expectedDomainPackId !== undefined) {
    const actual = response?.domainPackId
    results.push({
      name: 'expectedDomainPackId',
      passed: actual === exp.expectedDomainPackId,
      detail: `esperado="${exp.expectedDomainPackId}", atual="${actual ?? 'undefined'}"`,
    })
  }

  if (exp.expectedDomainPackFallback !== undefined) {
    const actual = response?.domainPackFallback ?? false
    results.push({
      name: 'expectedDomainPackFallback',
      passed: actual === exp.expectedDomainPackFallback,
      detail: `esperado=${exp.expectedDomainPackFallback}, atual=${actual}`,
    })
  }

  if (exp.rbacShouldBlock) {
    // Orchestrator NÃO deve ter crashado; tools bloqueadas são surface como tool error,
    // não como exception. O indicador: a tool proibida NÃO foi executada (não entrou no capture).
    const forbiddenInvoked = (exp.forbiddenTools ?? []).some(n => invokedNames.includes(n))
    results.push({
      name: 'rbacShouldBlock',
      passed: !forbiddenInvoked && !runError,
      detail: forbiddenInvoked
        ? 'tool proibida foi executada — policy falhou'
        : runError
          ? `orchestrator crashou: ${runError}`
          : 'bloqueio correto',
    })
  }

  return results
}

export async function runEval(cases: EvalCase[], opts: RunEvalOptions = {}): Promise<EvalRun> {
  const filtered = opts.onlyCaseId ? cases.filter(c => c.id === opts.onlyCaseId) : cases
  const runId = randomUUID()
  const startedAt = new Date().toISOString()

  const results: EvalResult[] = []
  for (const kase of filtered) {
    const result = await runEvalCase(kase)
    results.push(result)
  }

  const finishedAt = new Date().toISOString()

  const byCategory: Record<string, { total: number; passed: number }> = {}
  for (const r of results) {
    const bucket = byCategory[r.category] ?? (byCategory[r.category] = { total: 0, passed: 0 })
    bucket.total++
    if (r.passed) bucket.passed++
  }

  const latencies = results.map(r => r.metrics.latencyMs).sort((a, b) => a - b)
  const median = latencies.length ? (latencies[Math.floor(latencies.length / 2)] ?? 0) : 0
  const p95Idx = Math.max(0, Math.floor(latencies.length * 0.95) - 1)
  const p95 = latencies.length ? (latencies[p95Idx] ?? latencies[latencies.length - 1] ?? 0) : 0
  const passed = results.filter(r => r.passed).length

  return {
    runId,
    startedAt,
    finishedAt,
    gitSha: opts.gitSha,
    results,
    summary: {
      total: results.length,
      passed,
      failed: results.length - passed,
      byCategory,
      passRate: results.length ? passed / results.length : 0,
      medianLatencyMs: median,
      p95LatencyMs: p95,
    },
  }
}
