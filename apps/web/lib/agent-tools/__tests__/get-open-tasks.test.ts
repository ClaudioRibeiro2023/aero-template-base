import { describe, it, expect, beforeEach } from 'vitest'
import { setTableResult, resetTableResults } from './setup'
import { getOpenTasksTool } from '../get-open-tasks'
import type { ToolExecutionContext } from '@template/agent'

const ctx: ToolExecutionContext = {
  userId: 'user-1',
  tenantId: 'tenant-1',
  userRole: 'admin',
  appId: 'web',
  sessionId: 'session-1',
  traceId: 'trace-1',
}

describe('get_open_tasks', () => {
  beforeEach(() => resetTableResults())

  it('deve ter nome e descrição corretos', () => {
    expect(getOpenTasksTool.name).toBe('get_open_tasks')
    expect(getOpenTasksTool.description).toBeTruthy()
  })

  it('deve permitir todos os roles', () => {
    const roles = getOpenTasksTool.authorization.requiredRoles
    expect(roles).toContain('viewer')
    expect(roles).toContain('user')
    expect(roles).toContain('manager')
    expect(roles).toContain('admin')
    expect(roles).toContain('super_admin')
  })

  it('deve retornar tarefas abertas com sucesso', async () => {
    const tasks = [
      {
        id: '1',
        title: 'Task A',
        status: 'open',
        priority: 'high',
        assignee_id: null,
        created_at: '2026-01-01',
        updated_at: '2026-01-02',
      },
      {
        id: '2',
        title: 'Task B',
        status: 'in_progress',
        priority: 'medium',
        assignee_id: 'user-1',
        created_at: '2026-01-01',
        updated_at: '2026-01-03',
      },
    ]
    setTableResult('tasks', tasks, null, 2)

    const result = await getOpenTasksTool.execute({}, ctx)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.count).toBe(2)
      expect(result.data.items).toHaveLength(2)
      expect(result.data.generatedAt).toBeTruthy()
      expect(result.source).toBe('transactional')
    }
  })

  it('deve retornar lista vazia quando não há tarefas', async () => {
    setTableResult('tasks', [], null, 0)

    const result = await getOpenTasksTool.execute({}, ctx)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.count).toBe(0)
      expect(result.data.items).toHaveLength(0)
    }
  })

  it('deve retornar erro controlado quando DB falha', async () => {
    setTableResult('tasks', null, { message: 'connection refused', code: '500' })

    const result = await getOpenTasksTool.execute({}, ctx)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Erro ao consultar tarefas')
      expect(result.code).toBe('DB_ERROR')
    }
  })

  it('deve aceitar filtro de prioridade', async () => {
    setTableResult('tasks', [], null, 0)

    const result = await getOpenTasksTool.execute({ priority: 'high', limit: 5 }, ctx)
    expect(result.success).toBe(true)
  })

  it('deve aceitar filtro de assignee_id', async () => {
    setTableResult('tasks', [], null, 0)

    const result = await getOpenTasksTool.execute(
      { assignee_id: '550e8400-e29b-41d4-a716-446655440000' },
      ctx
    )
    expect(result.success).toBe(true)
  })
})
