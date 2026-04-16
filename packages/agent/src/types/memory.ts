/**
 * Memory — contratos das 4 camadas de memória do agente.
 *
 * Memória não é histórico bruto. Cada camada tem critério e escopo.
 *
 * Camada 1 (session)  — SessionMemory in-process, volátil
 * Camada 2 (user)     — preferências/fatos por usuário, persistente
 * Camada 3 (domain)   — fatos estáveis do domínio/tenant, persistente
 * Camada 4 (semantic) — knowledge documental indexado (RAG via pgvector)
 */

// ─── Camadas de memória ───────────────────────────────────────────────────────

export type MemoryLayer =
  | 'session' // ativa na sessão corrente (volátil)
  | 'user' // preferências e padrões persistentes do usuário
  | 'domain' // fatos estáveis do domínio/aplicação
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
  embedding?: number[]
  ttlSeconds?: number | null
  relevanceScore?: number
  source?: string
  createdAt: string
  updatedAt: string
  expiresAt?: string | null
}

// ─── Trecho de documento (camada semântica / RAG) ─────────────────────────────

export interface DocumentExcerpt {
  id: string
  /** Conteúdo do trecho recuperado */
  content: string
  /** Identificador da fonte (nome do doc, path, URL, etc.) */
  source: string
  /** Tipo do documento */
  sourceType: 'document' | 'policy' | 'manual' | 'knowledge' | string
  /** Score de similaridade coseno (0–1) */
  score: number
  /** Posição do chunk no documento original */
  chunkIndex?: number
  /** Metadados extras (autor, data, seção, etc.) */
  metadata?: Record<string, unknown>
}

// ─── Opções de busca ─────────────────────────────────────────────────────────

export interface MemorySearchOptions {
  layer: MemoryLayer | MemoryLayer[]
  scope: MemoryScope
  key?: string
  semanticQuery?: string
  limit?: number
  minScore?: number
}

// ─── Interface do store externo (camadas 2, 3, 4) ────────────────────────────

export interface ExternalMemorySearchOptions {
  /** Camadas a pesquisar (padrão: user + domain) */
  layers?: Exclude<MemoryLayer, 'session'>[]
  limit?: number
  minScore?: number
}

export interface IExternalMemoryStore {
  /**
   * Lê uma entrada por camada + chave + escopo.
   * Retorna null se não encontrada ou expirada.
   */
  get(
    layer: Exclude<MemoryLayer, 'session'>,
    key: string,
    scope: MemoryScope
  ): Promise<MemoryEntry | null>

  /**
   * Grava uma entrada de memória persistente.
   * Camada 'session' não é aceita aqui — usar SessionMemory.
   */
  set(
    entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'> & {
      layer: Exclude<MemoryLayer, 'session'>
    }
  ): Promise<MemoryEntry>

  /**
   * Busca entradas por chave ou semântica (user + domain).
   * Se semanticQuery não fornecida, retorna as mais recentes do escopo.
   */
  search(
    query: string,
    scope: MemoryScope,
    options?: ExternalMemorySearchOptions
  ): Promise<MemoryEntry[]>

  /**
   * Busca documental por similaridade vetorial (camada semantic).
   * Recebe o embedding pré-computado da query para evitar chamadas duplas.
   */
  retrieveDocuments(
    queryEmbedding: number[],
    scope: MemoryScope,
    topK: number
  ): Promise<DocumentExcerpt[]>

  /**
   * Remove uma entrada por camada + chave + escopo.
   */
  delete(layer: Exclude<MemoryLayer, 'session'>, key: string, scope: MemoryScope): Promise<void>
}

// ─── Contexto retornado ao orquestrador ──────────────────────────────────────

export interface MemoryContext {
  /** Fatos ativos da sessão atual */
  sessionFacts: MemoryEntry[]
  /** Preferências e padrões persistentes do usuário */
  userPreferences: MemoryEntry[]
  /** Fatos estáveis do domínio */
  domainFacts: MemoryEntry[]
  /** Trechos de documentos recuperados por relevância semântica */
  documentExcerpts: DocumentExcerpt[]
  /** Tokens estimados do contexto total */
  estimatedTokens: number
}

// ─── Interface principal do MemoryManager ────────────────────────────────────

export interface IMemoryManager {
  set(entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryEntry>
  search(options: MemorySearchOptions): Promise<MemoryEntry[]>
  get(layer: MemoryLayer, key: string, scope: MemoryScope): Promise<MemoryEntry | null>
  delete(layer: MemoryLayer, key: string, scope: MemoryScope): Promise<void>
  summarizeSession(sessionId: string, scope: MemoryScope): Promise<string>
  getContextForOrchestrator(
    query: string,
    scope: MemoryScope,
    maxTokenBudget?: number
  ): Promise<MemoryContext>
}
