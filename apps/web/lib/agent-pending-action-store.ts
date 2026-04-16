/**
 * PendingActionStore — gerencia ações pendentes de confirmação.
 *
 * Sprint 6: confirmação transacional para tools de escrita.
 * Toda ação mutável passa por: proposta → confirmação → execução.
 */
import { randomUUID } from 'crypto'
import { SupabaseDbClient } from '@template/data/supabase'
import type { PendingAction } from '@template/agent'

/** Janela de expiração padrão: 5 minutos */
const DEFAULT_EXPIRY_MS = 5 * 60 * 1000

export class PendingActionStore {
  private readonly db = new SupabaseDbClient()

  /** Cria uma nova ação pendente */
  async create(params: {
    sessionId: string
    tenantId: string
    userId: string
    appId: string
    toolName: string
    proposedInput: unknown
    description: string
    impact: string
    traceId?: string
  }): Promise<PendingAction> {
    const client = await this.db.asUser()
    const now = new Date()
    const id = randomUUID()
    const nonce = randomUUID()
    const expiresAt = new Date(now.getTime() + DEFAULT_EXPIRY_MS).toISOString()

    const { data, error } = await client
      .from('agent_pending_actions')
      .insert({
        id,
        session_id: params.sessionId,
        tenant_id: params.tenantId,
        user_id: params.userId,
        app_id: params.appId,
        tool_name: params.toolName,
        proposed_input: params.proposedInput,
        description: params.description,
        impact: params.impact,
        status: 'pending',
        nonce,
        expires_at: expiresAt,
        created_at: now.toISOString(),
        trace_id: params.traceId ?? null,
      })
      .select('*')
      .single()

    if (error || !data) {
      console.error('[PendingActionStore] Erro ao criar ação pendente:', error?.message)
      // Return a local-only fallback so the flow continues
      return {
        id,
        sessionId: params.sessionId,
        tenantId: params.tenantId,
        userId: params.userId,
        appId: params.appId,
        toolName: params.toolName,
        proposedInput: params.proposedInput,
        description: params.description,
        impact: params.impact,
        status: 'pending',
        expiresAt,
        createdAt: now.toISOString(),
      }
    }

    return this.rowToAction(data)
  }

  /** Busca uma ação pendente por ID com validações de segurança */
  async findForConfirmation(
    actionId: string,
    userId: string,
    tenantId: string
  ): Promise<{ action: PendingAction | null; error?: string }> {
    const client = await this.db.asUser()

    // First, expire any old actions
    try {
      await client.rpc('agent_expire_pending_actions')
    } catch {
      /* ignore */
    }

    const { data, error } = await client
      .from('agent_pending_actions')
      .select('*')
      .eq('id', actionId)
      .single()

    if (error || !data) {
      return { action: null, error: 'Ação não encontrada' }
    }

    const action = this.rowToAction(data)

    // Security validations
    if (action.userId !== userId) {
      return { action: null, error: 'Ação não pertence a este usuário' }
    }
    if (action.tenantId !== tenantId) {
      return { action: null, error: 'Ação não pertence a este tenant' }
    }
    if (action.status !== 'pending') {
      return { action: null, error: `Ação já está em status "${action.status}"` }
    }
    if (new Date(action.expiresAt) < new Date()) {
      // Mark as expired
      try {
        await client.from('agent_pending_actions').update({ status: 'expired' }).eq('id', actionId)
      } catch {
        /* ignore */
      }
      return { action: null, error: 'Ação expirada' }
    }

    return { action }
  }

  /** Marca ação como confirmada */
  async confirm(actionId: string): Promise<void> {
    const client = await this.db.asUser()
    await client
      .from('agent_pending_actions')
      .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
      .eq('id', actionId)
  }

  /** Marca ação como executada com resultado */
  async markExecuted(actionId: string, result: unknown, error?: string): Promise<void> {
    const client = await this.db.asUser()
    await client
      .from('agent_pending_actions')
      .update({
        status: error ? 'pending' : 'executed',
        executed_at: new Date().toISOString(),
        result: result ?? null,
        error_msg: error ?? null,
      })
      .eq('id', actionId)
  }

  /** Cancela uma ação pendente */
  async cancel(actionId: string, userId: string, tenantId: string): Promise<{ error?: string }> {
    const { action, error } = await this.findForConfirmation(actionId, userId, tenantId)
    if (!action) return { error: error ?? 'Ação não encontrada' }

    const client = await this.db.asUser()
    await client.from('agent_pending_actions').update({ status: 'cancelled' }).eq('id', actionId)

    return {}
  }

  private rowToAction(row: Record<string, unknown>): PendingAction {
    return {
      id: row.id as string,
      sessionId: row.session_id as string,
      tenantId: row.tenant_id as string,
      userId: row.user_id as string,
      appId: row.app_id as string,
      toolName: row.tool_name as string,
      proposedInput: row.proposed_input,
      description: row.description as string,
      impact: row.impact as string,
      status: row.status as PendingAction['status'],
      expiresAt: row.expires_at as string,
      createdAt: row.created_at as string,
      confirmedAt: (row.confirmed_at as string) ?? undefined,
      executedAt: (row.executed_at as string) ?? undefined,
      result: row.result ?? undefined,
      error: (row.error_msg as string) ?? undefined,
    }
  }
}
