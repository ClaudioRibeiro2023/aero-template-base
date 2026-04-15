/**
 * Domain Pack Registry — gerencia os packs de domínio registrados.
 *
 * Cada aplicação registra seu pack no startup.
 * O orquestrador resolve o pack correto por appId + tenantId.
 */
import type { DomainPack, IDomainPackRegistry } from '../types/domain-pack'

export class DomainPackRegistry implements IDomainPackRegistry {
  private readonly packs = new Map<string, DomainPack>()

  register(pack: DomainPack): void {
    for (const appId of pack.identity.appIds) {
      const key = `${appId}:${pack.identity.id}`
      this.packs.set(key, pack)
      console.info(
        `[DomainPackRegistry] Pack "${pack.identity.id}" v${pack.identity.version} registrado para app "${appId}"`
      )
    }
  }

  resolve(appId: string, _tenantId?: string): DomainPack | null {
    // Primeiro tenta match exato por appId
    for (const [key, pack] of this.packs.entries()) {
      if (key.startsWith(`${appId}:`)) return pack
    }
    // Fallback: core pack
    return this.packs.get('*:core') ?? null
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
