/**
 * @template/agent — Conversation OS do Template Base
 *
 * Infraestrutura nativa de agente conversacional reutilizável.
 * O template é dono da infraestrutura.
 * Cada aplicação é dona apenas do seu Domain Pack.
 *
 * @version 0.1.0
 * @sprint Sprint 1 — Fundação do núcleo agentic
 */

// ─── Tipos centrais ───────────────────────────────────────────────────────────
export * from './types/index'
export type { PendingAction, WriteToolPreview } from './types/index'

// ─── Gateway ──────────────────────────────────────────────────────────────────
export { OpenAIGateway, getAIGateway } from './gateway/index'

// ─── Orquestrador ─────────────────────────────────────────────────────────────
export { AgentOrchestrator } from './orchestrator/index'
export type { OrchestratorConfig } from './orchestrator/index'

// ─── Memória ──────────────────────────────────────────────────────────────────
export { MemoryManager, SessionMemory } from './memory/index'
export { HistoryCompactor, SemanticRetriever } from './memory/index'
export type {
  IExternalMemoryStore,
  DocumentExcerpt,
  ExternalMemorySearchOptions,
} from './memory/index'

// ─── Tools ────────────────────────────────────────────────────────────────────
export { ToolRegistry, getToolRegistry } from './tools/index'

// ─── Policy ───────────────────────────────────────────────────────────────────
export { PolicyEngine, getPolicyEngine } from './policy/index'

// ─── Observabilidade ──────────────────────────────────────────────────────────
export { AgentTracer, getAgentTracer } from './observability/index'

// ─── Domain Packs ─────────────────────────────────────────────────────────────
export {
  DomainPackRegistry,
  getDomainPackRegistry,
  coreDomainPack,
  tasksDomainPack,
  supportDomainPack,
  tasksEnterpriseDomainPack,
} from './domain-packs/index'
export type { ResolveStrategy, ResolveResult } from './domain-packs/index'

// ─── Eval Harness ─────────────────────────────────────────────────────────────
export * from './eval/index'
