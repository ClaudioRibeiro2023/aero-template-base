import type { EvalCase } from '../types'

const kase: EvalCase = {
  id: 'degradation-tool-failure',
  title: 'Tool falha — agente informa indisponibilidade sem crash',
  category: 'degradation',
  input: 'Liste minhas tarefas abertas.',
  mockTurns: [
    {
      toolCalls: [{ name: 'get_open_tasks', arguments: {} }],
    },
    {
      content:
        'Não consegui recuperar suas tarefas no momento (fonte indisponível). Por favor tente novamente em instantes.',
    },
  ],
  mockToolOutputs: {
    get_open_tasks: { __error: 'DB unreachable' },
  },
  expectations: {
    expectedTools: ['get_open_tasks'],
    expectsDegraded: true,
    responseContains: ['indisponível'],
  },
}

export default kase
