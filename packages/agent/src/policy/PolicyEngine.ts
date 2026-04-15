/**
 * Policy Engine — decisões de RBAC, escopo e segurança do agente.
 *
 * Verifica ANTES de qualquer tool call, acesso a memória ou fonte externa.
 * Integra com o RBAC existente do template (@template/data / IAuthGateway).
 */
import type { AgentRequest } from '../types/agent'
import type { DomainPack } from '../types/domain-pack'

// ─── Decisão de policy ────────────────────────────────────────────────────────

export interface PolicyDecision {
  allowed: boolean
  reason?: string
  /** Role efetiva para as verificações downstream */
  effectiveRole?: string
}

// ─── Engine ───────────────────────────────────────────────────────────────────

export class PolicyEngine {
  /**
   * Verifica se o usuário pode iniciar uma conversa com o agente.
   * Primeira barreira: antes de qualquer processamento.
   */
  checkAccess(request: AgentRequest, pack: DomainPack): PolicyDecision {
    const minimumRole = pack.security?.minimumRole
    if (!minimumRole) return { allowed: true, effectiveRole: request.userRole }

    const roleHierarchy = ['viewer', 'user', 'manager', 'admin', 'super_admin']
    const userLevel = roleHierarchy.indexOf(request.userRole.toLowerCase())
    const requiredLevel = roleHierarchy.indexOf(minimumRole.toLowerCase())

    if (userLevel < requiredLevel) {
      return {
        allowed: false,
        reason: `Role "${request.userRole}" insuficiente. Requer "${minimumRole}".`,
      }
    }

    return { allowed: true, effectiveRole: request.userRole }
  }

  /**
   * Verifica se o agente pode acessar uma fonte externa específica.
   * Controlado pelo DomainPack (externalSources autorizadas).
   */
  checkExternalSource(source: string, pack: DomainPack): PolicyDecision {
    const allowed = pack.authorizedSources.externalSources ?? []
    if (!allowed.includes(source)) {
      return {
        allowed: false,
        reason: `Fonte externa "${source}" não autorizada para domínio "${pack.identity.id}"`,
      }
    }
    return { allowed: true }
  }

  /**
   * Verifica se uma tool pode ser usada pelo usuário no contexto atual.
   * Complementa a verificação do ToolRegistry.
   */
  checkToolAccess(toolName: string, _userRole: string, pack: DomainPack): PolicyDecision {
    if (!pack.authorizedSources.internalTools.includes(toolName)) {
      return {
        allowed: false,
        reason: `Tool "${toolName}" não autorizada para domínio "${pack.identity.id}"`,
      }
    }
    return { allowed: true }
  }

  /**
   * Verifica se o agente pode gravar na memória persistente de domínio.
   * Requer aprovação explícita — não acontece automaticamente.
   */
  checkDomainMemoryWrite(userRole: string): PolicyDecision {
    const allowedRoles = ['admin', 'super_admin']
    if (!allowedRoles.includes(userRole.toLowerCase())) {
      return {
        allowed: false,
        reason: 'Somente admins podem gravar fatos na memória de domínio',
      }
    }
    return { allowed: true }
  }

  /**
   * Verifica isolamento de tenant: a requisição está no escopo correto?
   */
  checkTenantIsolation(requestTenantId: string, resourceTenantId: string): PolicyDecision {
    if (requestTenantId !== resourceTenantId) {
      return {
        allowed: false,
        reason: 'Acesso a dados de outro tenant não permitido',
      }
    }
    return { allowed: true }
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _policy: PolicyEngine | null = null

export function getPolicyEngine(): PolicyEngine {
  if (!_policy) _policy = new PolicyEngine()
  return _policy
}
