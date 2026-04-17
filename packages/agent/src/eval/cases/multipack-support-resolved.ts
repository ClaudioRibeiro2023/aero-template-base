import type { EvalCase } from '../types'

const kase: EvalCase = {
  id: 'multipack-support-resolved',
  title: 'Multi-pack: appId=support resolve ao supportDomainPack e consulta ticket',
  category: 'read',
  input: 'Qual o status do ticket 123?',
  mockTurns: [
    {
      toolCalls: [
        {
          name: 'get_ticket_status',
          arguments: { ticket_id: '123' },
        },
      ],
    },
    {
      content: 'O ticket 123 está aberto e em andamento. Acompanharemos o SLA associado.',
    },
  ],
  mockToolOutputs: {
    get_ticket_status: {
      ticket_id: '123',
      status: 'open',
      priority: 'high',
      sla_remaining_hours: 4,
    },
  },
  expectations: {
    appId: 'support',
    expectedDomainPackId: 'support',
    expectedDomainPackFallback: false,
    expectedTools: ['get_ticket_status'],
    responseContains: ['ticket', '123'],
  },
}

export default kase
