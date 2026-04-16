import { describe, it, expect, beforeEach } from 'vitest'
import { setTableResult, resetTableResults } from './setup'
import { getRecentActivityTool } from '../get-recent-activity'
import type { ToolExecutionContext } from '@template/agent'

const ctx: ToolExecutionContext = {
  userId: 'user-1',
  tenantId: 'tenant-1',
  userRole: 'admin',
  appId: 'web',
  sessionId: 'session-1',
  traceId: 'trace-1',
}

describe('get_recent_activity', () => {
  beforeEach(() => resetTableResults())

  it('deve ter nome correto', () => {
    expect(getRecentActivityTool.name).toBe('get_recent_activity')
    expect(getRecentActivityTool.description).toBeTruthy()
  })

  it('deve exigir role manager+', () => {
    const roles = getRecentActivityTool.authorization.requiredRoles!
    expect(roles).toContain('manager')
    expect(roles).toContain('admin')
    expect(roles).toContain('super_admin')
    expect(roles).not.toContain('viewer')
    expect(roles).not.toContain('user')
  })

  it('deve retornar atividades recentes', async () => {
    const entries = [
      {
        id: 'a-1',
        user_id: 'user-1',
        action: 'create',
        resource: 'tasks',
        resource_id: 't-1',
        created_at: '2026-01-01T10:00:00Z',
      },
      {
        id: 'a-2',
        user_id: 'user-2',
        action: 'update',
        resource: 'tasks',
        resource_id: 't-2',
        created_at: '2026-01-01T09:00:00Z',
      },
    ]
    setTableResult('audit_logs', entries, null, 2)

    const result = await getRecentActivityTool.execute({}, ctx)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.entries).toHaveLength(2)
      expect(result.data.count).toBe(2)
      expect(result.data.generatedAt).toBeTruthy()
      expect(result.source).toBe('transactional')
    }
  })

  it('deve retornar lista vazia sem atividades', async () => {
    setTableResult('audit_logs', [], null, 0)

    const result = await getRecentActivityTool.execute({}, ctx)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.entries).toHaveLength(0)
      expect(result.data.count).toBe(0)
    }
  })

  it('deve tratar erro de DB', async () => {
    setTableResult('audit_logs', null, { message: 'connection error', code: '500' })

    const result = await getRecentActivityTool.execute({}, ctx)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Erro ao consultar atividades')
      expect(result.code).toBe('DB_ERROR')
    }
  })

  it('deve aceitar filtro de resource', async () => {
    setTableResult('audit_logs', [], null, 0)

    const result = await getRecentActivityTool.execute({ resource: 'tasks' }, ctx)
    expect(result.success).toBe(true)
  })

  it('deve aceitar filtro de action', async () => {
    setTableResult('audit_logs', [], null, 0)

    const result = await getRecentActivityTool.execute({ action: 'create' }, ctx)
    expect(result.success).toBe(true)
  })

  it('deve aceitar filtro de limit', async () => {
    setTableResult('audit_logs', [], null, 0)

    const result = await getRecentActivityTool.execute({ limit: 5 }, ctx)
    expect(result.success).toBe(true)
  })
})
