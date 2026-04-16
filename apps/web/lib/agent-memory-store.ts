/**
 * SupabaseMemoryStore — implementação de IExternalMemoryStore via Supabase.
 *
 * Implementa as camadas 2 (user), 3 (domain) e 4 (semantic/RAG) de memória.
 * Instanciado POR REQUEST na route handler — precisa do contexto de cookies.
 *
 * Tabelas usadas:
 *   public.agent_memory     — entradas key-value persistentes (camadas user + domain)
 *   public.agent_documents  — chunks de documentos com embedding pgvector (camada semantic)
 *
 * Sprint 3: user + domain + RAG funcional.
 */
import { randomUUID } from 'crypto'
import { SupabaseDbClient } from '@template/data/supabase'
import type {
  IExternalMemoryStore,
  MemoryEntry,
  MemoryLayer,
  MemoryScope,
  DocumentExcerpt,
  ExternalMemorySearchOptions,
} from '@template/agent'

export class SupabaseMemoryStore implements IExternalMemoryStore {
  private readonly db = new SupabaseDbClient()

  // ─── get ──────────────────────────────────────────────────────────────────

  async get(
    layer: Exclude<MemoryLayer, 'session'>,
    key: string,
    scope: MemoryScope
  ): Promise<MemoryEntry | null> {
    const client = await this.db.asUser()
    const now = new Date().toISOString()

    const { data, error } = await client
      .from('agent_memory')
      .select('*')
      .eq('layer', layer)
      .eq('key', key)
      .eq('tenant_id', scope.tenantId)
      .eq('app_id', scope.appId)
      .or(scope.userId ? `user_id.eq.${scope.userId},user_id.is.null` : 'user_id.is.null')
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) return null
    return this.rowToEntry(data)
  }

  // ─── set ──────────────────────────────────────────────────────────────────

  async set(
    entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'> & {
      layer: Exclude<MemoryLayer, 'session'>
    }
  ): Promise<MemoryEntry> {
    const client = await this.db.asUser()
    const now = new Date().toISOString()
    const id = randomUUID()

    const expiresAt = entry.ttlSeconds
      ? new Date(Date.now() + entry.ttlSeconds * 1000).toISOString()
      : null

    const { data, error } = await client
      .from('agent_memory')
      .upsert(
        {
          id,
          layer: entry.layer,
          key: entry.key,
          value: entry.value,
          tenant_id: entry.scope.tenantId,
          app_id: entry.scope.appId,
          user_id: entry.scope.userId ?? null,
          session_id: entry.scope.sessionId ?? null,
          embedding: entry.embedding ?? null,
          ttl_seconds: entry.ttlSeconds ?? null,
          relevance_score: entry.relevanceScore ?? null,
          source: entry.source ?? null,
          expires_at: expiresAt,
          created_at: now,
          updated_at: now,
        },
        { onConflict: 'tenant_id,app_id,layer,key,user_id' }
      )
      .select('*')
      .single()

    if (error || !data) {
      console.error('[SupabaseMemoryStore] Erro ao gravar entrada:', error?.message)
      // Retorna entry simulada como fallback
      return {
        id,
        layer: entry.layer,
        key: entry.key,
        value: entry.value,
        scope: entry.scope,
        createdAt: now,
        updatedAt: now,
      }
    }

    return this.rowToEntry(data)
  }

  // ─── search ───────────────────────────────────────────────────────────────

  async search(
    _query: string,
    scope: MemoryScope,
    options?: ExternalMemorySearchOptions
  ): Promise<MemoryEntry[]> {
    const client = await this.db.asUser()
    const now = new Date().toISOString()
    const layers = options?.layers ?? ['user', 'domain']
    const limit = options?.limit ?? 20

    const { data, error } = await client
      .from('agent_memory')
      .select('*')
      .eq('tenant_id', scope.tenantId)
      .eq('app_id', scope.appId)
      .in('layer', layers)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error || !data) return []
    return data.map((row: Record<string, unknown>) => this.rowToEntry(row))
  }

  // ─── retrieveDocuments ────────────────────────────────────────────────────

  async retrieveDocuments(
    queryEmbedding: number[],
    scope: MemoryScope,
    topK: number
  ): Promise<DocumentExcerpt[]> {
    const client = await this.db.asUser()

    // Usa RPC Postgres para busca vetorial via pgvector
    const { data, error } = await client.rpc('agent_search_documents', {
      p_query_embedding: queryEmbedding,
      p_tenant_id: scope.tenantId,
      p_app_id: scope.appId,
      p_top_k: topK,
    })

    if (error || !data) {
      if (error) console.error('[SupabaseMemoryStore] Erro RAG:', error.message)
      return []
    }

    return (
      data as Array<{
        id: string
        content: string
        source: string
        source_type: string
        score: number
        chunk_index: number | null
        metadata: Record<string, unknown> | null
      }>
    ).map(row => ({
      id: row.id,
      content: row.content,
      source: row.source,
      sourceType: row.source_type,
      score: row.score,
      chunkIndex: row.chunk_index ?? undefined,
      metadata: row.metadata ?? undefined,
    }))
  }

  // ─── delete ───────────────────────────────────────────────────────────────

  async delete(
    layer: Exclude<MemoryLayer, 'session'>,
    key: string,
    scope: MemoryScope
  ): Promise<void> {
    const client = await this.db.asUser()

    const { error } = await client
      .from('agent_memory')
      .delete()
      .eq('layer', layer)
      .eq('key', key)
      .eq('tenant_id', scope.tenantId)
      .eq('app_id', scope.appId)

    if (error) {
      console.error('[SupabaseMemoryStore] Erro ao deletar entrada:', error.message)
    }
  }

  // ─── helpers ──────────────────────────────────────────────────────────────

  private rowToEntry(row: Record<string, unknown>): MemoryEntry {
    return {
      id: row.id as string,
      layer: row.layer as MemoryLayer,
      key: row.key as string,
      value: row.value,
      scope: {
        tenantId: row.tenant_id as string,
        appId: row.app_id as string,
        userId: (row.user_id as string | null) ?? undefined,
        sessionId: (row.session_id as string | null) ?? undefined,
      },
      embedding: (row.embedding as number[] | null) ?? undefined,
      ttlSeconds: (row.ttl_seconds as number | null) ?? undefined,
      relevanceScore: (row.relevance_score as number | null) ?? undefined,
      source: (row.source as string | null) ?? undefined,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      expiresAt: (row.expires_at as string | null) ?? undefined,
    }
  }
}
