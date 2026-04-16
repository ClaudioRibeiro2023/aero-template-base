/**
 * SemanticRetriever — recupera documentos por similaridade semântica (RAG).
 *
 * Fluxo:
 * 1. Gera embedding da query via gateway (text-embedding-3-small)
 * 2. Consulta o IExternalMemoryStore.retrieveDocuments()
 * 3. Filtra por score mínimo e retorna DocumentExcerpt[]
 *
 * Responsabilidade única: ponte gateway ↔ store externo para RAG.
 */
import type { IAIGateway } from '../types/gateway'
import type { IExternalMemoryStore, DocumentExcerpt, MemoryScope } from '../types/memory'

const DEFAULT_TOP_K = 4
const MIN_SCORE = 0.7

export class SemanticRetriever {
  constructor(
    private readonly gateway: IAIGateway,
    private readonly store: IExternalMemoryStore
  ) {}

  /**
   * Recupera documentos semanticamente relevantes para a query.
   * Retorna array vazio se embedding falhar.
   */
  async retrieve(
    query: string,
    scope: MemoryScope,
    topK = DEFAULT_TOP_K,
    minScore = MIN_SCORE
  ): Promise<DocumentExcerpt[]> {
    // 1. Gera embedding
    let embedding: number[]
    try {
      embedding = await this.gateway.embed(query)
    } catch {
      return []
    }

    // 2. Busca por similaridade
    const docs = await this.store.retrieveDocuments(embedding, scope, topK)

    // 3. Filtra por score mínimo
    return docs.filter(d => d.score >= minScore)
  }
}
