import type { EvalCase } from '../types'

const kase: EvalCase = {
  id: 'multipack-tasks-resolved',
  title: 'Multi-pack: appId=tasks resolve ao tasksDomainPack e executa create_task',
  category: 'write',
  input: 'Crie uma tarefa chamada "Revisar relatório mensal".',
  mockTurns: [
    {
      toolCalls: [
        {
          name: 'create_task',
          arguments: { title: 'Revisar relatório mensal', priority: 'medium' },
        },
      ],
    },
    {
      content: 'Preparei a criação da tarefa "Revisar relatório mensal". Confirme para efetivar.',
    },
  ],
  expectations: {
    appId: 'tasks',
    expectedDomainPackId: 'tasks',
    expectedDomainPackFallback: false,
    expectedTools: ['create_task'],
    expectsPendingAction: true,
    responseContains: ['confirm'],
  },
}

export default kase
