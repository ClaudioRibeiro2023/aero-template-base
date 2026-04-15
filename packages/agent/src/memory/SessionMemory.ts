/**
 * Session Memory — camada de memória ativa da sessão (volátil, in-process).
 *
 * Armazena fatos relevantes do turno atual:
 * - entidade em foco (ex: contrato #123, município Uberlândia)
 * - período em análise
 * - intenção do usuário
 * - filtros aplicados
 *
 * Descartada ao fechar a sessão (após sumarização).
 */
import type { MemoryEntry, MemoryScope } from '../types/memory'
import { randomUUID } from 'crypto'

export class SessionMemory {
  private readonly store = new Map<string, MemoryEntry>()

  set(key: string, value: unknown, scope: MemoryScope, ttlSeconds?: number): MemoryEntry {
    const now = new Date().toISOString()
    const entry: MemoryEntry = {
      id: randomUUID(),
      layer: 'session',
      key,
      value,
      scope,
      ttlSeconds: ttlSeconds ?? 3600,
      createdAt: now,
      updatedAt: now,
      expiresAt: ttlSeconds ? new Date(Date.now() + ttlSeconds * 1000).toISOString() : null,
    }
    this.store.set(this.makeKey(key, scope), entry)
    return entry
  }

  get(key: string, scope: MemoryScope): MemoryEntry | null {
    const entry = this.store.get(this.makeKey(key, scope))
    if (!entry) return null
    if (this.isExpired(entry)) {
      this.store.delete(this.makeKey(key, scope))
      return null
    }
    return entry
  }

  getAll(scope: MemoryScope): MemoryEntry[] {
    const result: MemoryEntry[] = []
    for (const entry of this.store.values()) {
      if (
        entry.scope.sessionId === scope.sessionId &&
        entry.scope.tenantId === scope.tenantId &&
        !this.isExpired(entry)
      ) {
        result.push(entry)
      }
    }
    return result
  }

  delete(key: string, scope: MemoryScope): void {
    this.store.delete(this.makeKey(key, scope))
  }

  clear(scope: MemoryScope): void {
    for (const [k, entry] of this.store.entries()) {
      if (entry.scope.sessionId === scope.sessionId) {
        this.store.delete(k)
      }
    }
  }

  /** Serializa a memória de sessão em texto para sumarização */
  serialize(scope: MemoryScope): string {
    const entries = this.getAll(scope)
    if (entries.length === 0) return ''
    return entries.map(e => `[${e.key}]: ${JSON.stringify(e.value)}`).join('\n')
  }

  private makeKey(key: string, scope: MemoryScope): string {
    return `${scope.tenantId}:${scope.sessionId ?? 'global'}:${key}`
  }

  private isExpired(entry: MemoryEntry): boolean {
    if (!entry.expiresAt) return false
    return new Date(entry.expiresAt) < new Date()
  }
}
