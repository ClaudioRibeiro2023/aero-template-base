/**
 * Agent Domain Tools — registro centralizado de tools reais de domínio.
 *
 * Sprint 4: primeira camada de tools que consultam dados vivos.
 * Todas respeitam RLS (tenant isolation), RBAC e são auditáveis.
 *
 * Para adicionar uma tool:
 * 1. Criar o arquivo em agent-tools/
 * 2. Importar e adicionar ao array domainTools
 * 3. Adicionar o nome em coreDomainPack.authorizedSources.internalTools
 */
import type { ToolDefinition } from '@template/agent'

import { getOpenTasksTool } from './get-open-tasks'
import { getTicketStatusTool } from './get-ticket-status'
import { getPendingItemsTool } from './get-pending-items'
import { getRecentActivityTool } from './get-recent-activity'
import { getOperationalSnapshotTool } from './get-operational-snapshot'

/** Todas as domain tools disponíveis */
export const domainTools: ToolDefinition[] = [
  getOpenTasksTool,
  getTicketStatusTool,
  getPendingItemsTool,
  getRecentActivityTool,
  getOperationalSnapshotTool,
]

/** Nomes das domain tools (para injeção no DomainPack.authorizedSources) */
export const domainToolNames: string[] = domainTools.map(t => t.name)
