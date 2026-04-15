/**
 * Memory Manager — orquestra as 4 camadas de memória.
 *
 * Camadas:
 * 1. session  → SessionMemory (in-process, volátil)
 * 2. user     → Supabase (persistente por usuário)
 * 3. domain   → Supabase (persistente por domínio/tenant)
 * 4. semantic → Supabase + pgvector (documentos indexados, RAG)
 *
 * Sprint 1: session totalmente funcional.
 * Sprint 3: user + domain via Supabase.
 * Sprint 4: semantic/RAG via pgvector.
 */
import type {
  IMemoryManager,
  MemoryEntry,
  MemoryLayer,
  MemoryScope,
  MemorySearchOptions,
  MemoryContext,
} from '../types/memory'
import { SessionMemory } from './SessionMemory'
import type { IAIGateway } from '../types/gateway'

export class MemoryManager implements IMemoryManager {
  private readonly sessionMemory = new SessionMemory()

  constructor(
    private readonly gateway?: IAIGateway // usado para sumarização e embeddings
  ) {}

  async set(entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryEntry> {
    switch (entry.layer) {
      case 'session':
        return this.sessionMemory.set(
          entry.key,
          entry.value,
          entry.scope,
          entry.ttlSeconds ?? undefined
        )

      case 'user':
      case 'domain':
      case 'semantic':
        // Sprint 3/4: persistência Supabase
        console.warn(
          `[MemoryManager] Camada "${entry.layer}" ainda não implementada — usando session como fallback`
        )
        return this.sessionMemory.set(
          entry.key,
          entry.value,
          entry.scope,
          entry.ttlSeconds ?? undefined
        )
    }
  }

  async search(options: MemorySearchOptions): Promise<MemoryEntry[]> {
    const layers = Array.isArray(options.layer) ? options.layer : [options.layer]
    const results: MemoryEntry[] = []

    for (const layer of layers) {
      if (layer === 'session') {
        const all = this.sessionMemory.getAll(options.scope)
        results.push(...all)
      }
      // Sprint 3/4: busca nas camadas user/domain/semantic
    }

    if (options.limit) {
      return results.slice(0, options.limit)
    }
    return results
  }

  async get(layer: MemoryLayer, key: string, scope: MemoryScope): Promise<MemoryEntry | null> {
    if (layer === 'session') {
      return this.sessionMemory.get(key, scope)
    }
    // Sprint 3/4: busca Supabase
    return null
  }

  async delete(layer: MemoryLayer, key: string, scope: MemoryScope): Promise<void> {
    if (layer === 'session') {
      this.sessionMemory.delete(key, scope)
    }
    // Sprint 3/4: delete Supabase
  }

  async summarizeSession(sessionId: string, scope: MemoryScope): Promise<string> {
    const serialized = this.sessionMemory.serialize({ ...scope, sessionId })
    if (!serialized || !this.gateway) return ''

    try {
      const response = await this.gateway.complete({
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente de sumarização. Resuma em 3-5 pontos os fatos mais relevantes da conversa.',
          },
          {
            role: 'user',
            content: `Resumo dos fatos da sessão:\n${serialized}`,
          },
        ],
        model: 'gpt-5.4-nano',
        temperature: 0.2,
        maxTokens: 300,
      })

      this.sessionMemory.clear({ ...scope, sessionId })
      return response.content
    } catch {
      return serialized.slice(0, 500)
    }
  }

  async getContextForOrchestrator(
    _query: string,
    scope: MemoryScope,
    _maxTokenBudget = 2000
  ): Promise<MemoryContext> {
    // Sprint 1: apenas sessão disponível
    const sessionFacts = this.sessionMemory.getAll(scope)

    return {
      sessionFacts,
      userPreferences: [], // Sprint 3
      domainFacts: [], // Sprint 3
      documentExcerpts: [], // Sprint 4
      estimatedTokens: estimateTokens(sessionFacts),
    }
  }
}

function estimateTokens(entries: MemoryEntry[]): number {
  return entries.reduce((sum, e) => sum + JSON.stringify(e.value).length / 4, 0)
}
