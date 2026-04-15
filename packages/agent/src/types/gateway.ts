/**
 * AI Gateway — contratos de integração com provedores de IA.
 *
 * O gateway é o ÚNICO ponto de acesso à IA. Nenhuma aplicação filha
 * chama a OpenAI diretamente. Toda requisição passa por aqui.
 */

// ─── Modelos disponíveis ──────────────────────────────────────────────────────

export type AIModel =
  | 'gpt-5.4-mini' // padrão do sistema — velocidade e custo equilibrados
  | 'gpt-5.4' // escalonamento — tarefas complexas de raciocínio
  | 'gpt-5.4-nano' // microtarefas auxiliares — extremamente rápido/barato
  | (string & {}) // permite modelos customizados por tenant

export const DEFAULT_MODEL: AIModel = 'gpt-5.4-mini'
export const REASONING_MODEL: AIModel = 'gpt-5.4'
export const MICRO_MODEL: AIModel = 'gpt-5.4-nano'

// ─── Mensagens ────────────────────────────────────────────────────────────────

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool'

export interface AIMessage {
  role: MessageRole
  content: string
  tool_call_id?: string
  tool_calls?: AIToolCall[]
  metadata?: Record<string, unknown>
}

export interface AIToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

// ─── Request / Response ───────────────────────────────────────────────────────

export interface GatewayRequest {
  /** Mensagens do turno atual */
  messages: AIMessage[]
  /** Modelo a ser usado (default: gpt-5.4-mini) */
  model?: AIModel
  /** Temperatura (0–2). Default: 0.3 para respostas mais determinísticas */
  temperature?: number
  /** Máximo de tokens na resposta */
  maxTokens?: number
  /** Definições de tools disponíveis nessa requisição */
  tools?: GatewayToolDefinition[]
  /** Contexto de rastreabilidade */
  traceId?: string
  /** ID da sessão para agrupamento de logs */
  sessionId?: string
  /** Se deve retornar streaming */
  stream?: boolean
}

export interface GatewayResponse {
  /** Conteúdo textual da resposta */
  content: string
  /** Chamadas de tool solicitadas pelo modelo */
  toolCalls?: AIToolCall[]
  /** Tokens consumidos */
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  /** Modelo efetivamente usado */
  model: string
  /** Custo estimado em USD */
  estimatedCostUsd?: number
  /** Latência em ms */
  latencyMs?: number
  /** Motivo de parada */
  finishReason: 'stop' | 'tool_calls' | 'length' | 'content_filter'
}

export interface GatewayStreamChunk {
  type: 'delta' | 'tool_call' | 'done'
  delta?: string
  toolCall?: AIToolCall
  finishReason?: GatewayResponse['finishReason']
}

// ─── Tool definition ──────────────────────────────────────────────────────────

export interface GatewayToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown> // JSON Schema
    strict?: boolean
  }
}

// ─── Interface principal ──────────────────────────────────────────────────────

export interface IAIGateway {
  /** Envia requisição e retorna resposta completa */
  complete(request: GatewayRequest): Promise<GatewayResponse>
  /** Envia requisição com streaming (gerador assíncrono) */
  stream(request: GatewayRequest): AsyncGenerator<GatewayStreamChunk>
  /** Calcula embedding para um texto (usado pelo Retrieval Manager) */
  embed(text: string): Promise<number[]>
  /** Retorna o provedor identificador */
  readonly provider: string
}
