/**
 * HistoryCompactor — compacta histórico longo via sumarização LLM.
 *
 * Quando o histórico excede COMPACT_THRESHOLD mensagens:
 * 1. Mantém as últimas KEEP_RECENT mensagens sem alteração
 * 2. Sumariza o restante com gpt-5.4-nano
 * 3. Retorna: [{ role: 'system', content: '[Resumo das mensagens anteriores]\n...' }, ...recentes]
 *
 * Objetivo: reduzir tokens mantendo contexto crítico.
 */
import type { IAIGateway, AIMessage } from '../types/gateway'

const COMPACT_THRESHOLD = 20
const KEEP_RECENT = 6

export class HistoryCompactor {
  constructor(private readonly gateway: IAIGateway) {}

  /**
   * Retorna histórico possivelmente compactado.
   * Se len <= COMPACT_THRESHOLD, retorna sem alteração.
   */
  async compact(history: AIMessage[]): Promise<AIMessage[]> {
    if (history.length <= COMPACT_THRESHOLD) return history

    const toSummarize = history.slice(0, history.length - KEEP_RECENT)
    const recent = history.slice(history.length - KEEP_RECENT)

    const summaryContent = await this.summarize(toSummarize)
    return [
      {
        role: 'system',
        content: `[Resumo das mensagens anteriores]\n${summaryContent}`,
      },
      ...recent,
    ]
  }

  private async summarize(messages: AIMessage[]): Promise<string> {
    const text = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${String(m.content)}`)
      .join('\n')

    try {
      const response = await this.gateway.complete({
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente de compactação de contexto. Resuma a conversa abaixo em até 200 palavras, preservando fatos e decisões importantes. Responda apenas o resumo, sem preâmbulo.',
          },
          { role: 'user', content: text },
        ],
        model: 'gpt-5.4-nano',
        temperature: 0.1,
        maxTokens: 400,
      })
      return response.content
    } catch {
      // Fallback: últimas 10 linhas
      return text.split('\n').slice(-10).join('\n')
    }
  }
}
