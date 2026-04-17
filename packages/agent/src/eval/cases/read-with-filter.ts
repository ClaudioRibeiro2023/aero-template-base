import type { EvalCase } from '../types'

const kase: EvalCase = {
  id: 'read-with-filter',
  title: 'Consulta com filtros (tickets alta prioridade)',
  category: 'read',
  input: 'Quais tickets de suporte abertos de alta prioridade?',
  mockTurns: [
    {
      toolCalls: [
        {
          name: 'get_ticket_status',
          arguments: { status: 'open', priority: 'high' },
        },
      ],
    },
    {
      content: 'Há 1 ticket aberto de alta prioridade: #42 "Queda de serviço".',
    },
  ],
  mockToolOutputs: {
    get_ticket_status: {
      tickets: [{ id: 42, title: 'Queda de serviço', priority: 'high', status: 'open' }],
    },
  },
  expectations: {
    expectedTools: ['get_ticket_status'],
    responseContains: ['ticket'],
  },
}

export default kase
