/**
 * Memory Manager — orquestra as 4 camadas de memória.
 *
 * Camadas:
 * 1. session  → SessionMemory (in-process, volátil)
 * 2. user     → IExternalMemoryStore (persistente por usuário)
 * 3. domain   → IExternalMemoryStore (persistente por domínio/tenant)
 * 4. semantic → IExternalMemoryStore + pgvector (documentos indexados, RAG)
 *
 * Sprint 1: session totalmente funcional.
 * Sprint 3: user + domain + semantic via IExternalMemoryStore.
 */
import type {
  IMemoryManager,
  IExternalMemoryStore,
  MemoryEntry,
  MemoryLayer,
  MemoryScope,
  MemorySearchOptions,
  MemoryContext,
  DocumentExcerpt,
} from '../types/memory'
import { SessionMemory } from './SessionMemory'
import { SemanticRetriever } from './SemanticRetriever'
import type { IAIGateway } from '../types/gateway'

export class MemoryManager implements IMemoryManager {
  private readonly sessionMemory = new SessionMemory()
  private readonly retriever: SemanticRetriever | null = null

  constructor(
    private readonly gateway?: IAIGateway,
    private readonly externalStore?: IExternalMemoryStore
  ) {
    if (gateway && externalStore) {
      this.retriever = new SemanticRetriever(gateway, externalStore)
    }
  }

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
        if (this.externalStore) {
          return this.externalStore.set({
            ...entry,
            layer: entry.layer as Exclude<MemoryLayer, 'session'>,
          })
        }
        // Fallback gracioso quando store não injetado
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
      } else if (this.externalStore) {
        const found = await this.externalStore.search(
          options.key ?? options.semanticQuery ?? '',
          options.scope,
          {
            layers: [layer as Exclude<MemoryLayer, 'session'>],
            limit: options.limit,
            minScore: options.minScore,
          }
        )
        results.push(...found)
      }
    }

    return options.limit ? results.slice(0, options.limit) : results
  }

  async get(layer: MemoryLayer, key: string, scope: MemoryScope): Promise<MemoryEntry | null> {
    if (layer === 'session') {
      return this.sessionMemory.get(key, scope)
    }
    if (this.externalStore) {
      return this.externalStore.get(layer as Exclude<MemoryLayer, 'session'>, key, scope)
    }
    return null
  }

  async delete(layer: MemoryLayer, key: string, scope: MemoryScope): Promise<void> {
    if (layer === 'session') {
      this.sessionMemory.delete(key, scope)
      return
    }
    if (this.externalStore) {
      await this.externalStore.delete(layer as Exclude<MemoryLayer, 'session'>, key, scope)
    }
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
    query: string,
    scope: MemoryScope,
    _maxTokenBudget = 2000
  ): Promise<MemoryContext> {
    const sessionFacts = this.sessionMemory.getAll(scope)

    let userPreferences: MemoryEntry[] = []
    let domainFacts: MemoryEntry[] = []

    if (this.externalStore) {
      try {
        const [userResults, domainResults] = await Promise.all([
          this.externalStore.search(query, scope, { layers: ['user'], limit: 10 }),
          this.externalStore.search(query, scope, { layers: ['domain'], limit: 10 }),
        ])
        userPreferences = userResults
        domainFacts = domainResults
      } catch {
        // Degradação silenciosa — sessão ainda funciona
      }
    }

    let documentExcerpts: DocumentExcerpt[] = []
    if (this.retriever) {
      try {
        documentExcerpts = await this.retriever.retrieve(query, scope)
      } catch {
        // Degradação silenciosa — sessão ainda funciona sem RAG
      }
    }

    const allEntries = [...sessionFacts, ...userPreferences, ...domainFacts]

    return {
      sessionFacts,
      userPreferences,
      domainFacts,
      documentExcerpts,
      estimatedTokens: estimateTokens(allEntries),
    }
  }
}

function estimateTokens(entries: MemoryEntry[]): number {
  return entries.reduce((sum, e) => sum + JSON.stringify(e.value).length / 4, 0)
}
