/**
 * IAgentSessionStore — contrato de persistência de sessões e mensagens.
 *
 * Desacopla o AgentOrchestrator da implementação concreta de armazenamento.
 * Sprint 1: não injetado → sessão in-memory efêmera.
 * Sprint 2: SupabaseAgentSessionStore (apps/web/lib/agent-session-store.ts).
 * Sprint N: qualquer outro store (Redis, Postgres via Prisma, etc.).
 */
import type { AgentSession } from './agent'
import type { AIMessage } from './gateway'
import type { AgentRequest } from './agent'

// ─── Parâmetros para gravar par de mensagens ──────────────────────────────────

export interface PersistMessagesParams {
  sessionId: string
  tenantId: string
  userId: string
  userMessage: string
  assistantMessage: string
  model: string
  tokensUsed: number
  latencyMs: number
  traceId: string
}

// ─── Info do domain pack resolvido (Sprint 10) ────────────────────────────────

export interface DomainPackInfo {
  id: string
  version: string
  fallback: boolean
  strategy: 'tenant' | 'app' | 'fallback-core' | 'none'
}

// ─── Interface principal ──────────────────────────────────────────────────────

export interface IAgentSessionStore {
  /**
   * Recupera sessão existente (por sessionId) ou cria uma nova.
   * Valida ownership (tenantId + userId) antes de reutilizar.
   */
  resolveSession(request: AgentRequest): Promise<AgentSession>

  /**
   * Carrega as últimas N mensagens user/assistant da sessão,
   * em ordem cronológica, prontas para injeção no prompt.
   */
  loadHistory(sessionId: string, tenantId: string, limit: number): Promise<AIMessage[]>

  /**
   * Persiste o par (mensagem do usuário + resposta do agente) após cada turno.
   */
  persistMessages(params: PersistMessagesParams): Promise<void>

  /**
   * Atualiza last_active_at e turn_count da sessão.
   */
  touchSession(sessionId: string, turnCount: number): Promise<void>

  /**
   * Sprint 10: persiste o domain pack resolvido na sessão.
   * Opcional para compatibilidade reversa (eval Runner não supre store).
   */
  recordDomainPack?(sessionId: string, info: DomainPackInfo): Promise<void>
}
