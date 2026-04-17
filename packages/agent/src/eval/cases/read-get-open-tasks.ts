import type { EvalCase } from '../types'

const kase: EvalCase = {
  id: 'read-get-open-tasks',
  title: 'Listar tarefas abertas do usuário',
  category: 'read',
  input: 'Quais minhas tarefas abertas?',
  mockTurns: [
    {
      toolCalls: [{ name: 'get_open_tasks', arguments: { status: 'open' } }],
    },
    {
      content:
        'Você tem 2 tarefas abertas: "Revisar proposta" (alta) e "Enviar orçamento" (média).',
    },
  ],
  mockToolOutputs: {
    get_open_tasks: {
      tasks: [
        { id: 't1', title: 'Revisar proposta', priority: 'high' },
        { id: 't2', title: 'Enviar orçamento', priority: 'medium' },
      ],
    },
  },
  expectations: {
    expectedTools: ['get_open_tasks'],
    responseContains: ['tarefa'],
    forbiddenTools: ['create_task'],
  },
}

export default kase
