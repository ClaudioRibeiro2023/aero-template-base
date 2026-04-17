/**
 * SupabaseAgentSessionStore — persistência real de sessões e mensagens do agente.
 *
 * Implementa IAgentSessionStore usando o Supabase cookie-based client (respeita RLS).
 * Instanciado POR REQUEST na route handler — não é singleton, pois precisa
 * do contexto de cookies do Next.js para autenticação.
 *
 * Tabelas usadas:
 *   public.agent_sessions  — ciclo de vida da conversa
 *   public.agent_messages  — histórico persistido
 *
 * Sprint 3+: expandir para agent_memory (user layer + semantic RAG).
 */
import { randomUUID } from 'crypto'
import { SupabaseDbClient } from '@template/data/supabase'
import type { IAgentSessionStore, PersistMessagesParams, DomainPackInfo } from '@template/agent'
import type { AgentRequest, AgentSession, AIMessage } from '@template/agent'

/** Limite padrão de histórico injetado no prompt (janela segura de tokens) */
const DEFAULT_HISTORY_LIMIT = 30

export class SupabaseAgentSessionStore implements IAgentSessionStore {
  private readonly db = new SupabaseDbClient()

  // ─── resolveSession ────────────────────────────────────────────────────────

  async resolveSession(request: AgentRequest): Promise<AgentSession> {
    const client = await this.db.asUser()
    const now = new Date().toISOString()

    // Tentar recuperar sessão existente com validação de ownership
    if (request.sessionId) {
      const { data: existing } = await client
        .from('agent_sessions')
        .select(
          'id, user_id, tenant_id, app_id, status, title, started_at, last_active_at, turn_count'
        )
        .eq('id', request.sessionId)
        .eq('tenant_id', request.tenantId)
        .eq('user_id', request.userId)
        .eq('status', 'active')
        .maybeSingle()

      if (existing) {
        return {
          id: existing.id as string,
          userId: existing.user_id as string,
          tenantId: existing.tenant_id as string,
          appId: existing.app_id as string,
          status: existing.status as AgentSession['status'],
          title: (existing.title as string | null) ?? null,
          startedAt: existing.started_at as string,
          lastActiveAt: existing.last_active_at as string,
          turnCount: (existing.turn_count as number) ?? 0,
        }
      }
      // Sessão não encontrada ou inválida → cria nova abaixo
    }

    // Criar nova sessão
    const newId = randomUUID()
    const { data: created, error } = await client
      .from('agent_sessions')
      .insert({
        id: newId,
        tenant_id: request.tenantId,
        user_id: request.userId,
        app_id: request.appId,
        status: 'active',
        started_at: now,
        last_active_at: now,
        turn_count: 0,
        metadata: request.metadata ?? {},
      })
      .select('id')
      .single()

    if (error) {
      console.error('[AgentSessionStore] Erro ao criar sessão:', error.message)
      // Retorna sessão in-memory como fallback (não quebra a resposta)
      return {
        id: newId,
        userId: request.userId,
        tenantId: request.tenantId,
        appId: request.appId,
        status: 'active',
        title: null,
        startedAt: now,
        lastActiveAt: now,
        turnCount: 0,
      }
    }

    return {
      id: (created?.id as string) ?? newId,
      userId: request.userId,
      tenantId: request.tenantId,
      appId: request.appId,
      status: 'active',
      title: null,
      startedAt: now,
      lastActiveAt: now,
      turnCount: 0,
    }
  }

  // ─── loadHistory ───────────────────────────────────────────────────────────

  async loadHistory(
    sessionId: string,
    tenantId: string,
    limit = DEFAULT_HISTORY_LIMIT
  ): Promise<AIMessage[]> {
    const client = await this.db.asUser()

    const { data: rows, error } = await client
      .from('agent_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .eq('tenant_id', tenantId)
      .in('role', ['user', 'assistant'])
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error || !rows?.length) return []

    return rows.map(row => ({
      role: row.role as 'user' | 'assistant',
      content: row.content as string,
    }))
  }

  // ─── persistMessages ───────────────────────────────────────────────────────

  async persistMessages(params: PersistMessagesParams): Promise<void> {
    const client = await this.db.asUser()
    const t0 = new Date()
    const t1 = new Date(t0.getTime() + 1) // garante ordenação correta

    const { error } = await client.from('agent_messages').insert([
      {
        session_id: params.sessionId,
        tenant_id: params.tenantId,
        role: 'user',
        content: params.userMessage,
        created_at: t0.toISOString(),
      },
      {
        session_id: params.sessionId,
        tenant_id: params.tenantId,
        role: 'assistant',
        content: params.assistantMessage,
        tokens_used: params.tokensUsed,
        latency_ms: params.latencyMs,
        model: params.model,
        trace_id: params.traceId,
        created_at: t1.toISOString(),
      },
    ])

    if (error) {
      console.error('[AgentSessionStore] Erro ao persistir mensagens:', error.message)
    }
  }

  // ─── touchSession ──────────────────────────────────────────────────────────

  async touchSession(sessionId: string, turnCount: number): Promise<void> {
    const client = await this.db.asUser()
    const now = new Date().toISOString()

    const { error } = await client
      .from('agent_sessions')
      .update({
        last_active_at: now,
        turn_count: turnCount,
        updated_at: now,
      })
      .eq('id', sessionId)

    if (error) {
      console.error('[AgentSessionStore] Erro ao atualizar sessão:', error.message)
    }
  }

  // ─── recordDomainPack (Sprint 10) ──────────────────────────────────────────

  async recordDomainPack(sessionId: string, info: DomainPackInfo): Promise<void> {
    const client = await this.db.asUser()

    const { error } = await client
      .from('agent_sessions')
      .update({
        domain_pack_id: info.id,
        domain_pack_version: info.version,
        domain_pack_fallback: info.fallback,
        domain_pack_strategy: info.strategy,
      })
      .eq('id', sessionId)

    if (error) {
      console.error('[AgentSessionStore] Erro ao registrar domain pack:', error.message)
    }
  }
}

// ─── Helper: verifica se tenantId é UUID válido ───────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Retorna true apenas se tenantId for um UUID real.
 * Evita tentativas de persistência com 'default' ou null no banco.
 */
export function isValidTenantId(tenantId: string | null | undefined): tenantId is string {
  return typeof tenantId === 'string' && UUID_RE.test(tenantId)
}
