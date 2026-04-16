import { describe, it, expect, beforeEach } from 'vitest'
import { setTableResult, resetTableResults } from './setup'
import { getTicketStatusTool } from '../get-ticket-status'
import type { ToolExecutionContext } from '@template/agent'

const ctx: ToolExecutionContext = {
  userId: 'user-1',
  tenantId: 'tenant-1',
  userRole: 'admin',
  appId: 'web',
  sessionId: 'session-1',
  traceId: 'trace-1',
}

describe('get_ticket_status', () => {
  beforeEach(() => resetTableResults())

  it('deve ter nome correto', () => {
    expect(getTicketStatusTool.name).toBe('get_ticket_status')
    expect(getTicketStatusTool.description).toBeTruthy()
  })

  it('deve permitir todos os roles', () => {
    const roles = getTicketStatusTool.authorization.requiredRoles
    expect(roles).toContain('viewer')
    expect(roles).toContain('admin')
  })

  it('deve retornar ticket específico por ID', async () => {
    const ticket = {
      id: 't-1',
      title: 'Bug login',
      description: 'Não consigo logar',
      status: 'open',
      priority: 'high',
      category: 'bug',
      assignee_id: null,
      satisfaction_rating: null,
      created_at: '2026-01-01',
      updated_at: '2026-01-02',
    }
    setTableResult('support_tickets', ticket)

    const result = await getTicketStatusTool.execute(
      { ticket_id: '550e8400-e29b-41d4-a716-446655440000' },
      ctx
    )
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.ticket).toBeDefined()
      expect(result.data.count).toBe(1)
      expect(result.source).toBe('transactional')
    }
  })

  it('deve retornar NOT_FOUND quando ticket não existe', async () => {
    setTableResult('support_tickets', null)

    const result = await getTicketStatusTool.execute(
      { ticket_id: '550e8400-e29b-41d4-a716-446655440000' },
      ctx
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('NOT_FOUND')
    }
  })

  it('deve listar tickets recentes sem ID', async () => {
    setTableResult(
      'support_tickets',
      [
        {
          id: 't-1',
          title: 'Ticket 1',
          status: 'open',
          priority: 'medium',
          description: null,
          category: null,
          assignee_id: null,
          satisfaction_rating: null,
          created_at: '2026-01-01',
          updated_at: '2026-01-02',
        },
      ],
      null,
      1
    )

    const result = await getTicketStatusTool.execute({}, ctx)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tickets).toBeDefined()
      expect(result.data.count).toBeGreaterThanOrEqual(0)
      expect(result.data.generatedAt).toBeTruthy()
    }
  })

  it('deve tratar erro de DB na busca por ID', async () => {
    setTableResult('support_tickets', null, { message: 'DB error', code: '500' })

    const result = await getTicketStatusTool.execute(
      { ticket_id: '550e8400-e29b-41d4-a716-446655440000' },
      ctx
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('DB_ERROR')
    }
  })

  it('deve tratar erro de DB na listagem', async () => {
    setTableResult('support_tickets', null, { message: 'DB error', code: '500' })

    const result = await getTicketStatusTool.execute({}, ctx)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('DB_ERROR')
    }
  })

  it('deve aceitar filtro de status', async () => {
    setTableResult('support_tickets', [], null, 0)

    const result = await getTicketStatusTool.execute({ status: 'open' }, ctx)
    expect(result.success).toBe(true)
  })
})
