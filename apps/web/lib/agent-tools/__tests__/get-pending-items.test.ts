import { describe, it, expect, beforeEach } from 'vitest'
import { setTableResult, resetTableResults } from './setup'
import { getPendingItemsTool } from '../get-pending-items'
import type { ToolExecutionContext } from '@template/agent'

const ctx: ToolExecutionContext = {
  userId: 'user-1',
  tenantId: 'tenant-1',
  userRole: 'admin',
  appId: 'web',
  sessionId: 'session-1',
  traceId: 'trace-1',
}

describe('get_pending_items', () => {
  beforeEach(() => resetTableResults())

  it('deve ter nome correto', () => {
    expect(getPendingItemsTool.name).toBe('get_pending_items')
    expect(getPendingItemsTool.description).toBeTruthy()
  })

  it('deve agregar pendências de múltiplas entidades', async () => {
    setTableResult('tasks', [{ priority: 'high' }, { priority: 'medium' }, { priority: 'high' }])
    setTableResult('support_tickets', [{ status: 'open' }, { status: 'in_progress' }])
    setTableResult('notifications', [{ severity: 'warning' }, { severity: 'error' }])

    const result = await getPendingItemsTool.execute({}, ctx)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.totalPending).toBe(7)
      expect(result.data.tasks?.open).toBe(3)
      expect(result.data.tasks?.byPriority.high).toBe(2)
      expect(result.data.tasks?.byPriority.medium).toBe(1)
      expect(result.data.tickets?.open).toBe(2)
      expect(result.data.tickets?.byStatus.open).toBe(1)
      expect(result.data.tickets?.byStatus.in_progress).toBe(1)
      expect(result.data.notifications?.unread).toBe(2)
      expect(result.data.notifications?.bySeverity.warning).toBe(1)
      expect(result.data.notifications?.bySeverity.error).toBe(1)
      expect(result.source).toBe('analytical')
    }
  })

  it('deve permitir desabilitar tasks', async () => {
    setTableResult('support_tickets', [{ status: 'open' }])
    setTableResult('notifications', [{ severity: 'info' }])

    const result = await getPendingItemsTool.execute(
      { include_tasks: false, include_tickets: true, include_notifications: true },
      ctx
    )
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tasks).toBeNull()
      expect(result.data.tickets).not.toBeNull()
      expect(result.data.notifications).not.toBeNull()
      expect(result.data.totalPending).toBe(2)
    }
  })

  it('deve permitir desabilitar tickets e notifications', async () => {
    setTableResult('tasks', [{ priority: 'low' }])

    const result = await getPendingItemsTool.execute(
      { include_tasks: true, include_tickets: false, include_notifications: false },
      ctx
    )
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tasks).not.toBeNull()
      expect(result.data.tickets).toBeNull()
      expect(result.data.notifications).toBeNull()
      expect(result.data.totalPending).toBe(1)
    }
  })

  it('deve retornar zero quando não há pendências', async () => {
    setTableResult('tasks', [])
    setTableResult('support_tickets', [])
    setTableResult('notifications', [])

    const result = await getPendingItemsTool.execute({}, ctx)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.totalPending).toBe(0)
      expect(result.data.tasks?.open).toBe(0)
      expect(result.data.tickets?.open).toBe(0)
      expect(result.data.notifications?.unread).toBe(0)
    }
  })

  it('deve retornar generatedAt em ISO', async () => {
    const result = await getPendingItemsTool.execute({}, ctx)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    }
  })
})
