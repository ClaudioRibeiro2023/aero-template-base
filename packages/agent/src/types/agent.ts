/**
 * Agent — contratos centrais do orquestrador e runtime.
 */
import type { AIMessage, AIModel } from './gateway'
import type { MemoryContext } from './memory'
import type { DomainPack } from './domain-pack'
import type { PendingAction } from './tool'

// ─── Sessão ───────────────────────────────────────────────────────────────────

export interface AgentSession {
  id: string
  userId: string
  tenantId: string
  appId: string
  /** Status da sessão */
  status: 'active' | 'closed' | 'archived'
  /** Título gerado automaticamente (ou null se nova) */
  title?: string | null
  /** Timestamp de início */
  startedAt: string
  /** Timestamp de último turno */
  lastActiveAt: string
  /** Resumo compactado da sessão (preenchido ao fechar) */
  summary?: string | null
  /** Número de turnos */
  turnCount: number
}

// ─── Turno de conversa ────────────────────────────────────────────────────────

export interface AgentTurn {
  id: string
  sessionId: string
  /** Mensagem do usuário */
  userMessage: string
  /** Resposta final do agente */
  assistantMessage: string
  /** Tool calls executadas neste turno */
  toolCallsExecuted?: string[]
  /** Fontes de dados usadas */
  sourcesUsed?: string[]
  /** Modelo utilizado */
  model: AIModel
  /** Tokens consumidos */
  tokensUsed: number
  /** Latência total em ms */
  latencyMs: number
  /** ID de rastreabilidade */
  traceId: string
  createdAt: string
}

// ─── Contexto do orquestrador ─────────────────────────────────────────────────

export interface AgentContext {
  /** Sessão atual */
  session: AgentSession
  /** Domain Pack resolvido para esta sessão */
  domainPack: DomainPack
  /** Contexto de memória recuperado */
  memoryContext: MemoryContext
  /** Histórico de mensagens (limitado — não o histórico bruto completo) */
  conversationHistory: AIMessage[]
  /** ID de rastreabilidade do turno */
  traceId: string
}

// ─── Request de entrada do usuário ────────────────────────────────────────────

export interface AgentRequest {
  /** Mensagem do usuário */
  message: string
  /** Sessão existente (null = nova sessão) */
  sessionId?: string | null
  /** Contexto de execução */
  userId: string
  tenantId: string
  appId: string
  userRole: string
  /** Metadados opcionais (ex: página atual, entidade em foco) */
  metadata?: Record<string, unknown>
}

// ─── Resposta do agente ───────────────────────────────────────────────────────

export interface AgentResponse {
  /** Resposta textual */
  content: string
  /** Sessão usada/criada */
  session: AgentSession
  /** Fontes usadas na resposta */
  sources?: ResponseSource[]
  /** Tool calls executados */
  toolsUsed?: string[]
  /** Modelo que gerou a resposta */
  model: AIModel
  /** Tokens consumidos */
  tokensUsed: number
  /** Latência total em ms */
  latencyMs: number
  /** ID de rastreabilidade */
  traceId: string
  /** Indica que o agente operou em modo degradado (fallback in-memory) */
  degraded?: boolean
  /** Razões de degradação (ex: falha de persistência, embedding indisponível) */
  degradationReasons?: string[]
  /** Ações pendentes de confirmação do usuário */
  pendingActions?: PendingAction[]
  /** ID do Domain Pack usado para responder (ex: 'tasks', 'core') */
  domainPackId?: string
  /** Versão do Domain Pack usado (ex: '1.0.0') */
  domainPackVersion?: string
  /** true quando o resolver caiu no core porque não havia pack específico para appId */
  domainPackFallback?: boolean
}

// ─── Fonte de informação ──────────────────────────────────────────────────────

export interface ResponseSource {
  type: 'transactional' | 'analytical' | 'document' | 'memory' | 'external'
  label: string
  detail?: string
}

// ─── Chunk de streaming ───────────────────────────────────────────────────────

export interface AgentStreamChunk {
  type: 'delta' | 'sources' | 'done' | 'error'
  delta?: string
  sources?: ResponseSource[]
  session?: AgentSession
  error?: string
}
