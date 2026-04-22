/**
 * OpenAI Gateway — implementação do IAIGateway usando a Responses API.
 *
 * Este é o ÚNICO ponto de integração com a OpenAI.
 * Nenhuma aplicação filha chama a OpenAI diretamente.
 *
 * Usa a Responses API (openai.responses.create) que substitui o
 * Chat Completions para fluxos agênticos com tool use nativo.
 */
import OpenAI from 'openai'
import type {
  IAIGateway,
  GatewayRequest,
  GatewayResponse,
  GatewayStreamChunk,
  AIMessage,
} from '../types/gateway'
import { DEFAULT_MODEL } from '../types/gateway'

// Custo aproximado por 1M tokens (USD) — atualizar conforme pricing OpenAI
const COST_PER_1M: Record<string, { input: number; output: number }> = {
  'gpt-5.4-mini': { input: 0.15, output: 0.6 },
  'gpt-5.4': { input: 2.5, output: 10.0 },
  'gpt-5.4-nano': { input: 0.05, output: 0.2 },
}

function estimateCost(model: string, promptTokens: number, completionTokens: number): number {
  const pricing = COST_PER_1M[model]
  if (!pricing) return 0
  return (
    (promptTokens / 1_000_000) * pricing.input + (completionTokens / 1_000_000) * pricing.output
  )
}

// Converte AIMessage[] → formato aceito pela Responses API
// Respostas de tools usam { type: 'function_call_output', call_id, output }
// Mensagens normais usam { role, content }
function toResponsesInput(messages: AIMessage[]): OpenAI.Responses.ResponseInput {
  const out: OpenAI.Responses.ResponseInputItem[] = []
  for (const m of messages) {
    if (m.role === 'tool') {
      // Saída de ferramenta — referencia o call_id emitido no assistant anterior.
      out.push({
        type: 'function_call_output',
        call_id: m.tool_call_id ?? '',
        output: m.content,
      })
      continue
    }

    if (m.role === 'assistant' && m.tool_calls && m.tool_calls.length > 0) {
      // Assistant que decidiu chamar ferramenta(s).
      // Se houver texto livre, emitimos como message ANTES dos function_call,
      // preservando ordem. Cada tool_call vira um function_call item próprio
      // com o mesmo call_id para a OpenAI conseguir correlacionar o output.
      if (m.content && m.content.trim().length > 0) {
        out.push({
          type: 'message',
          role: 'assistant',
          content: [{ type: 'output_text', text: m.content }],
        } as OpenAI.Responses.ResponseInputItem)
      }
      for (const tc of m.tool_calls) {
        out.push({
          type: 'function_call',
          call_id: tc.id,
          name: tc.function.name,
          arguments: tc.function.arguments,
        } as OpenAI.Responses.ResponseInputItem)
      }
      continue
    }

    // Mensagem normal (system/user/assistant sem tool_calls).
    out.push({
      role: m.role as 'user' | 'system' | 'assistant',
      content: m.content,
    } as OpenAI.Responses.ResponseInputItem)
  }
  return out
}

export class OpenAIGateway implements IAIGateway {
  readonly provider = 'openai'
  private readonly client: OpenAI

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey ?? process.env.OPENAI_API_KEY,
    })
  }

  async complete(request: GatewayRequest): Promise<GatewayResponse> {
    const start = Date.now()
    const model = request.model ?? DEFAULT_MODEL

    const response = await this.client.responses.create({
      model,
      input: toResponsesInput(request.messages),
      temperature: request.temperature ?? 0.3,
      max_output_tokens: request.maxTokens,
      tools: request.tools?.map(t => ({
        type: 'function' as const,
        name: t.function.name,
        description: t.function.description,
        parameters: t.function.parameters,
        strict: t.function.strict ?? false,
      })),
    })

    const latencyMs = Date.now() - start
    const usage = response.usage ?? { input_tokens: 0, output_tokens: 0 }
    const promptTokens = usage.input_tokens
    const completionTokens = usage.output_tokens

    // Extrai conteúdo textual
    const textOutput = response.output
      .filter((o): o is OpenAI.Responses.ResponseOutputMessage => o.type === 'message')
      .flatMap(o =>
        o.content
          .filter((c): c is OpenAI.Responses.ResponseOutputText => c.type === 'output_text')
          .map(c => c.text)
      )
      .join('')

    // Extrai tool calls
    const toolCalls = response.output
      .filter((o): o is OpenAI.Responses.ResponseFunctionToolCall => o.type === 'function_call')
      .map(o => ({
        id: o.call_id,
        type: 'function' as const,
        function: {
          name: o.name,
          arguments: o.arguments,
        },
      }))

    return {
      content: textOutput,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
      model,
      estimatedCostUsd: estimateCost(model, promptTokens, completionTokens),
      latencyMs,
      finishReason: toolCalls.length > 0 ? 'tool_calls' : 'stop',
    }
  }

  async *stream(request: GatewayRequest): AsyncGenerator<GatewayStreamChunk> {
    const model = request.model ?? DEFAULT_MODEL

    const stream = await this.client.responses.create({
      model,
      input: toResponsesInput(request.messages),
      temperature: request.temperature ?? 0.3,
      max_output_tokens: request.maxTokens,
      tools: request.tools?.map(t => ({
        type: 'function' as const,
        name: t.function.name,
        description: t.function.description,
        parameters: t.function.parameters,
        strict: t.function.strict ?? false,
      })),
      stream: true,
    })

    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        yield { type: 'delta', delta: event.delta }
      } else if (event.type === 'response.function_call_arguments.done') {
        yield {
          type: 'tool_call',
          toolCall: {
            id: event.item_id,
            type: 'function',
            function: {
              name: (event as unknown as { name: string }).name ?? '',
              arguments: event.arguments,
            },
          },
        }
      } else if (event.type === 'response.completed') {
        yield { type: 'done', finishReason: 'stop' }
      }
    }
  }

  async embed(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    })
    return response.data[0]?.embedding ?? []
  }
}
