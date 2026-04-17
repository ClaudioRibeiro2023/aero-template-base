/**
 * MockAIGateway — reproduz turnos scriptados de um EvalCase.
 *
 * Implementa IAIGateway sem tocar em nenhum provedor real. Cada
 * chamada a `.complete()` devolve o próximo turno do script; se o
 * script acabar, devolve uma resposta vazia de parada.
 */
import type {
  IAIGateway,
  GatewayRequest,
  GatewayResponse,
  GatewayStreamChunk,
  AIToolCall,
} from '../types/gateway'
import type { MockTurn } from './types'

export interface MockAIGatewayOptions {
  caseId: string
  turns: MockTurn[]
  /** Dimensão do embedding sintético. Default 1536 (compatível com OpenAI ada-002). */
  embeddingDim?: number
}

export class MockAIGateway implements IAIGateway {
  public readonly provider = 'mock'
  private cursor = 0
  private readonly caseId: string
  private readonly turns: MockTurn[]
  private readonly embeddingDim: number

  constructor(opts: MockAIGatewayOptions) {
    this.caseId = opts.caseId
    this.turns = opts.turns
    this.embeddingDim = opts.embeddingDim ?? 1536
  }

  async complete(_req: GatewayRequest): Promise<GatewayResponse> {
    const idx = this.cursor
    const turn = this.turns[idx]
    this.cursor++

    if (!turn) {
      // Script esgotado — força parada
      return {
        content: '',
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        model: 'mock-5.4-mini',
        finishReason: 'stop',
      }
    }

    const toolCalls: AIToolCall[] | undefined = turn.toolCalls?.map((tc, toolIdx) => ({
      id: `call_${this.caseId}_${idx}_${toolIdx}`,
      type: 'function' as const,
      function: {
        name: tc.name,
        arguments: JSON.stringify(tc.arguments ?? {}),
      },
    }))

    const finishReason: GatewayResponse['finishReason'] =
      turn.finishReason ?? (toolCalls && toolCalls.length > 0 ? 'tool_calls' : 'stop')

    const promptTokens = turn.usage?.promptTokens ?? 100
    const completionTokens = turn.usage?.completionTokens ?? 50

    return {
      content: turn.content ?? '',
      toolCalls,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
      model: 'mock-5.4-mini',
      finishReason,
      estimatedCostUsd: 0,
      latencyMs: 0,
    }
  }

  async *stream(_req: GatewayRequest): AsyncGenerator<GatewayStreamChunk> {
    throw new Error('MockAIGateway.stream: não suportado no eval harness')
    // eslint-disable-next-line no-unreachable
    yield { type: 'done' }
  }

  async embed(_text: string): Promise<number[]> {
    return new Array(this.embeddingDim).fill(0)
  }
}
