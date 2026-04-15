/**
 * Memory Manager — contratos das 4 camadas de memória do agente.
 *
 * Memória não é histórico bruto. Cada camada tem critério e escopo.
 */

// ─── Camadas de memória ───────────────────────────────────────────────────────

export type MemoryLayer =
  | 'session' // memória ativa da sessão atual (volátil)
  | 'user' // preferências e padrões persistentes do usuário
  | 'domain' // fatos estáveis do domínio/aplicação (aprovados)
  | 'semantic' // conhecimento documental indexado (RAG)

// ─── Escopo ───────────────────────────────────────────────────────────────────

export interface MemoryScope {
  tenantId: string
  appId: string
  userId?: string
  sessionId?: string
}

// ─── Entrada de memória ───────────────────────────────────────────────────────

export interface MemoryEntry {
  id: string
  layer: MemoryLayer
  key: string
  value: unknown
  scope: MemoryScope
  /** Vetor de embedding (para busca semântica, camada 'semantic') */
  embedding?: number[]
  /** TTL em segundos. null = sem expiração */
  ttlSeconds?: number | null
  /** Score de relevância (preenchido em buscas) */
  relevanceScore?: number
  /** Origem que gerou esta memória */
  source?: string
  createdAt: string
  updatedAt: string
  expiresAt?: string | null
}

// ─── Opções de busca ─────────────────────────────────────────────────────────

export interface MemorySearchOptions {
  layer: MemoryLayer | MemoryLayer[]
  scope: MemoryScope
  /** Chave exata (busca direta) */
  key?: string
  /** Texto para busca semântica (camada 'semantic') */
  semanticQuery?: string
  /** Número máximo de resultados */
  limit?: number
  /** Score mínimo de relevância (0–1) */
  minScore?: number
}

// ─── Interface principal ──────────────────────────────────────────────────────

export interface IMemoryManager {
  /** Grava uma entrada de memória com critério */
  set(entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryEntry>

  /** Busca entradas por chave ou semântica */
  search(options: MemorySearchOptions): Promise<MemoryEntry[]>

  /** Recupera uma entrada específica por camada + chave + escopo */
  get(layer: MemoryLayer, key: string, scope: MemoryScope): Promise<MemoryEntry | null>

  /** Remove uma entrada */
  delete(layer: MemoryLayer, key: string, scope: MemoryScope): Promise<void>

  /** Resume e compacta memória de sessão ao fechar conversa */
  summarizeSession(sessionId: string, scope: MemoryScope): Promise<string>

  /** Retorna contexto enxuto para o orquestrador (já filtrado e rankado) */
  getContextForOrchestrator(
    query: string,
    scope: MemoryScope,
    maxTokenBudget?: number
  ): Promise<MemoryContext>
}

// ─── Contexto retornado ao orquestrador ──────────────────────────────────────

export interface MemoryContext {
  /** Fatos da sessão atual relevantes */
  sessionFacts: MemoryEntry[]
  /** Preferências do usuário relevantes */
  userPreferences: MemoryEntry[]
  /** Fatos do domínio relevantes */
  domainFacts: MemoryEntry[]
  /** Trechos de documentos relevantes */
  documentExcerpts: MemoryEntry[]
  /** Tokens estimados do contexto total */
  estimatedTokens: number
}
