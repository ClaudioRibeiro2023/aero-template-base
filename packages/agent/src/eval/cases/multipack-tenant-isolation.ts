import type { EvalCase } from '../types'

/**
 * Verifica isolamento do tenant override: um tenant diferente NÃO deve
 * receber o pack enterprise — cai no branch "app" (tasksDomainPack padrão).
 */
const kase: EvalCase = {
  id: 'multipack-tenant-isolation',
  title: 'Multi-pack: tenant sem override recebe pack tasks padrão (branch app)',
  category: 'security',
  input: 'Liste minhas tarefas abertas.',
  mockTurns: [
    {
      toolCalls: [{ name: 'get_open_tasks', arguments: {} }],
    },
    {
      content: 'Você tem 2 tarefas abertas no momento.',
    },
  ],
  mockToolOutputs: {
    get_open_tasks: {
      tasks: [
        { id: 't-1', title: 'Revisar contrato', priority: 'high' },
        { id: 't-2', title: 'Enviar relatório', priority: 'medium' },
      ],
    },
  },
  expectations: {
    appId: 'tasks',
    tenantId: 'other-tenant-eval',
    expectedDomainPackId: 'tasks',
    expectedDomainPackFallback: false,
    expectedTools: ['get_open_tasks'],
  },
}

export default kase
