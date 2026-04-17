import type { EvalCase } from '../types'

const kase: EvalCase = {
  id: 'write-requires-confirmation',
  title: 'Escrita (create_task) gera pending action — não auto-executa',
  category: 'write',
  input: 'Crie uma tarefa chamada "Revisar proposta".',
  mockTurns: [
    {
      toolCalls: [
        {
          name: 'create_task',
          arguments: { title: 'Revisar proposta', priority: 'medium' },
        },
      ],
    },
    {
      content: 'Preparei a criação da tarefa "Revisar proposta". Por favor confirme para efetivar.',
    },
  ],
  expectations: {
    expectedTools: ['create_task'],
    expectsPendingAction: true,
    responseContains: ['confirm'],
  },
}

export default kase
