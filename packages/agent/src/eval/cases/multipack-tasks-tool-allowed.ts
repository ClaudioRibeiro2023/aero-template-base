import type { EvalCase } from '../types'

const kase: EvalCase = {
  id: 'multipack-tasks-tool-allowed',
  title: 'Multi-pack: pack tasks permite get_open_tasks (tool autorizada)',
  category: 'read',
  input: 'Liste minhas tarefas abertas.',
  mockTurns: [
    {
      toolCalls: [{ name: 'get_open_tasks', arguments: { status: 'open' } }],
    },
    {
      content: 'Você tem 1 tarefa aberta: "Revisar proposta" (alta).',
    },
  ],
  mockToolOutputs: {
    get_open_tasks: {
      tasks: [{ id: 't1', title: 'Revisar proposta', priority: 'high' }],
    },
  },
  expectations: {
    appId: 'tasks',
    expectedDomainPackId: 'tasks',
    expectedDomainPackFallback: false,
    expectedTools: ['get_open_tasks'],
    responseContains: ['tarefa'],
  },
}

export default kase
