/**
 * Domain Pack Registry — gerencia os packs de domínio registrados.
 *
 * Cada aplicação registra seu pack no startup.
 * O orquestrador resolve o pack correto por appId + tenantId com prioridade determinística:
 *   1. tenant-específico: <appId>:<tenantId>
 *   2. app-wide:          <appId>:*
 *   3. fallback-core:     qualquer pack registrado com appIds contendo '*'
 *   4. none
 */
import type { DomainPack, IDomainPackRegistry } from '../types/domain-pack'

export type ResolveStrategy = 'tenant' | 'app' | 'fallback-core' | 'none'

export interface ResolveResult {
  pack: DomainPack | null
  strategy: ResolveStrategy
}

export class DomainPackRegistry implements IDomainPackRegistry {
  private readonly packs = new Map<string, DomainPack>()

  register(pack: DomainPack): void {
    for (const appId of pack.identity.appIds) {
      const key = `${appId}:*`
      this.packs.set(key, pack)
      console.info(
        `[DomainPackRegistry] Pack "${pack.identity.id}" v${pack.identity.version} registrado para app "${appId}"`
      )
    }
  }

  /**
   * Registra um pack para um tenant específico.
   * Tem prioridade maior que o registro app-wide.
   */
  registerForTenant(pack: DomainPack, tenantId: string): void {
    for (const appId of pack.identity.appIds) {
      const key = `${appId}:${tenantId}`
      this.packs.set(key, pack)
      console.info(
        `[DomainPackRegistry] Pack "${pack.identity.id}" v${pack.identity.version} registrado para app "${appId}" + tenant "${tenantId}"`
      )
    }
  }

  resolve(appId: string, tenantId?: string): DomainPack | null {
    return this.resolveWithMetadata(appId, tenantId).pack
  }

  resolveWithMetadata(appId: string, tenantId?: string): ResolveResult {
    // 1. tenant-específico
    if (tenantId) {
      const tenantKey = `${appId}:${tenantId}`
      const tenantHit = this.packs.get(tenantKey)
      if (tenantHit) return { pack: tenantHit, strategy: 'tenant' }
    }

    // 2. app-wide
    const appKey = `${appId}:*`
    const appHit = this.packs.get(appKey)
    if (appHit) return { pack: appHit, strategy: 'app' }

    // 3. fallback-core — qualquer pack que declare appIds: ['*']
    for (const pack of this.packs.values()) {
      if (pack.identity.appIds.includes('*')) {
        return { pack, strategy: 'fallback-core' }
      }
    }

    return { pack: null, strategy: 'none' }
  }

  list(): DomainPack[] {
    const seen = new Set<string>()
    const result: DomainPack[] = []
    for (const pack of this.packs.values()) {
      if (!seen.has(pack.identity.id)) {
        seen.add(pack.identity.id)
        result.push(pack)
      }
    }
    return result
  }
}

let _registry: DomainPackRegistry | null = null

export function getDomainPackRegistry(): DomainPackRegistry {
  if (!_registry) _registry = new DomainPackRegistry()
  return _registry
}
