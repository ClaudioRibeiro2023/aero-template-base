/**
 * Tool Registry — contratos para ferramentas do agente.
 *
 * Toda tool deve ser: explícita, tipada, auditável e autorizada.
 * Nenhuma tool tem acesso irrestrito ao banco.
 */
import { z } from 'zod'

// ─── Definição de Tool ────────────────────────────────────────────────────────

export interface ToolDefinition<TInput extends z.ZodTypeAny = z.ZodTypeAny, TOutput = unknown> {
  /** Nome canônico (snake_case, único no registry) */
  name: string
  /** Descrição funcional clara — usada no prompt do sistema */
  description: string
  /** Schema de entrada (Zod) */
  inputSchema: TInput
  /** Política de autorização */
  authorization: ToolAuthorization
  /** Execução da tool */
  execute(input: z.infer<TInput>, context: ToolExecutionContext): Promise<ToolResult<TOutput>>
}

// ─── Autorização ──────────────────────────────────────────────────────────────

export interface ToolAuthorization {
  /** Roles mínimas necessárias. Vazio = qualquer usuário autenticado */
  requiredRoles?: string[]
  /** Escopos de aplicação onde a tool está disponível */
  allowedApps?: string[]
  /** Se requer que o tenant tenha feature flag ativa */
  requiredFeatureFlag?: string
}

// ─── Contexto de execução ─────────────────────────────────────────────────────

export interface ToolExecutionContext {
  userId: string
  tenantId: string
  userRole: string
  appId: string
  sessionId: string
  traceId: string
}

// ─── Resultado ────────────────────────────────────────────────────────────────

export type ToolResult<T = unknown> =
  | { success: true; data: T; source?: ToolDataSource }
  | { success: false; error: string; code?: string }

export type ToolDataSource =
  | 'transactional' // dado transacional interno (DB)
  | 'analytical' // dado analítico interno (views/aggregations)
  | 'document' // documento interno indexado
  | 'memory' // memória persistida do agente
  | 'external' // fonte externa viva (web, APIs públicas)

// ─── Log de execução ─────────────────────────────────────────────────────────

export interface ToolExecutionLog {
  id: string
  sessionId: string
  traceId: string
  toolName: string
  userId: string
  tenantId: string
  appId: string
  input: unknown
  output: unknown
  success: boolean
  errorMessage?: string
  durationMs: number
  source?: ToolDataSource
  executedAt: string
}
