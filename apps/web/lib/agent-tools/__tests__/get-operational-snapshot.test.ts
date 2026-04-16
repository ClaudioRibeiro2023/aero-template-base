import { describe, it, expect, beforeEach } from 'vitest'
import { setTableResult, resetTableResults } from './setup'
import { getOperationalSnapshotTool } from '../get-operational-snapshot'
import type { ToolExecutionContext } from '@template/agent'

const ctx: ToolExecutionContext = {
  userId: 'user-1',
  tenantId: 'tenant-1',
  userRole: 'admin',
  appId: 'web',
  sessionId: 'session-1',
  traceId: 'trace-1',
}

describe('get_operational_snapshot', () => {
  beforeEach(() => resetTableResults())

  it('deve ter nome correto', () => {
    expect(getOperationalSnapshotTool.name).toBe('get_operational_snapshot')
    expect(getOperationalSnapshotTool.description).toBeTruthy()
  })

  it('deve exigir role manager+', () => {
    const roles = getOperationalSnapshotTool.authorization.requiredRoles!
    expect(roles).toContain('manager')
    expect(roles).toContain('admin')
    expect(roles).toContain('super_admin')
    expect(roles).not.toContain('viewer')
    expect(roles).not.toContain('user')
  })

  it('deve retornar snapshot operacional completo', async () => {
    setTableResult('tasks', [
      { status: 'open', priority: 'high' },
      { status: 'done', priority: 'low' },
      { status: 'in_progress', priority: 'medium' },
    ])
    setTableResult('support_tickets', [
      { status: 'open', category: 'bug' },
      { status: 'resolved', category: 'feature' },
    ])
    setTableResult('notifications', [], null, 3)
    setTableResult('quality_reports', { overall_score: 87, created_at: '2026-01-01T00:00:00Z' })

    const result = await getOperationalSnapshotTool.execute({}, ctx)
    expect(result.success).toBe(true)
    if (result.success) {
      // Tasks
      expect(result.data.tasks.total).toBe(3)
      expect(result.data.tasks.open).toBe(2) // open + in_progress
      expect(result.data.tasks.done).toBe(1)
      expect(result.data.tasks.byPriority.high).toBe(1)
      expect(result.data.tasks.byPriority.low).toBe(1)
      expect(result.data.tasks.byPriority.medium).toBe(1)

      // Tickets
      expect(result.data.tickets.total).toBe(2)
      expect(result.data.tickets.open).toBe(1)
      expect(result.data.tickets.resolved).toBe(1)
      expect(result.data.tickets.byCategory.bug).toBe(1)
      expect(result.data.tickets.byCategory.feature).toBe(1)

      // Quality
      expect(result.data.quality.latestScore).toBe(87)
      expect(result.data.quality.latestDate).toBe('2026-01-01T00:00:00Z')

      // Meta
      expect(result.data.periodDays).toBe(7)
      expect(result.data.generatedAt).toBeTruthy()
      expect(result.source).toBe('analytical')
    }
  })

  it('deve aceitar período customizado', async () => {
    const result = await getOperationalSnapshotTool.execute({ period_days: 30 }, ctx)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.periodDays).toBe(30)
    }
  })

  it('deve retornar snapshot vazio sem dados', async () => {
    setTableResult('tasks', [])
    setTableResult('support_tickets', [])
    setTableResult('notifications', [], null, 0)
    setTableResult('quality_reports', null)

    const result = await getOperationalSnapshotTool.execute({}, ctx)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tasks.total).toBe(0)
      expect(result.data.tasks.open).toBe(0)
      expect(result.data.tasks.done).toBe(0)
      expect(result.data.tickets.total).toBe(0)
      expect(result.data.tickets.open).toBe(0)
      expect(result.data.tickets.resolved).toBe(0)
      expect(result.data.notifications.unread).toBe(0)
      expect(result.data.quality.latestScore).toBeNull()
      expect(result.data.quality.latestDate).toBeNull()
    }
  })

  it('deve usar período padrão de 7 dias', async () => {
    const result = await getOperationalSnapshotTool.execute({}, ctx)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.periodDays).toBe(7)
    }
  })
})
