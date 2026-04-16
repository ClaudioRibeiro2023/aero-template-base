/**
 * Agent Domain Tools — registro centralizado de tools reais de domínio.
 *
 * Sprint 4: tools de leitura (consultas operacionais)
 * Sprint 6: tools de escrita (com confirmação transacional)
 */
import type { ToolDefinition } from '@template/agent'

// ─── Read tools (Sprint 4) ──────────────────────────────────────────────────
import { getOpenTasksTool } from './get-open-tasks'
import { getTicketStatusTool } from './get-ticket-status'
import { getPendingItemsTool } from './get-pending-items'
import { getRecentActivityTool } from './get-recent-activity'
import { getOperationalSnapshotTool } from './get-operational-snapshot'

// ─── Write tools (Sprint 6) ─────────────────────────────────────────────────
import { createTaskTool } from './create-task'
import { updateTaskStatusTool } from './update-task-status'
import { updateTaskPriorityTool } from './update-task-priority'
import { assignTaskTool } from './assign-task'

/** Todas as domain tools disponíveis */
export const domainTools: ToolDefinition[] = [
  // Leitura
  getOpenTasksTool,
  getTicketStatusTool,
  getPendingItemsTool,
  getRecentActivityTool,
  getOperationalSnapshotTool,
  // Escrita (requer confirmação)
  createTaskTool,
  updateTaskStatusTool,
  updateTaskPriorityTool,
  assignTaskTool,
]

/** Nomes das domain tools (para injeção no DomainPack.authorizedSources) */
export const domainToolNames: string[] = domainTools.map(t => t.name)
