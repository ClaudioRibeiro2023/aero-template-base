import type { EvalCase } from '../types'

/**
 * Verifica o branch "tenant" do resolver: quando appId='tasks' + tenantId='enterprise-tenant-eval',
 * o registry retorna tasksEnterpriseDomainPack (override), NÃO o tasksDomainPack padrão.
 */
const kase: EvalCase = {
  id: 'multipack-tenant-override',
  title: 'Multi-pack: tenant override resolve tasksEnterpriseDomainPack no lugar de tasks',
  category: 'write',
  input: 'Crie uma tarefa urgente para fechar o relatório regulatório.',
  mockTurns: [
    {
      toolCalls: [
        {
          name: 'create_task',
          arguments: {
            title: 'Fechar relatório regulatório',
            priority: 'urgent',
          },
        },
      ],
    },
    {
      content:
        'Preparei a criação da tarefa urgente "Fechar relatório regulatório". Devido ao impacto/SLA associado, confirme para efetivar.',
    },
  ],
  expectations: {
    appId: 'tasks',
    tenantId: 'enterprise-tenant-eval',
    expectedDomainPackId: 'tasks-enterprise',
    expectedDomainPackFallback: false,
    expectedTools: ['create_task'],
    expectsPendingAction: true,
  },
}

export default kase
