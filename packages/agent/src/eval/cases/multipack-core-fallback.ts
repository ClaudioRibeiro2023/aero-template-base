import type { EvalCase } from '../types'

const kase: EvalCase = {
  id: 'multipack-core-fallback',
  title: 'Multi-pack: appId desconhecido cai no core (fallback)',
  category: 'security',
  input: 'Olá, o que você pode fazer?',
  mockTurns: [
    {
      content:
        'Posso ajudar com tarefas, pesquisas em documentos internos e mais. Qual o seu pedido?',
    },
  ],
  expectations: {
    appId: 'eval',
    expectedDomainPackId: 'core',
    expectedDomainPackFallback: true,
    responseContains: ['ajudar'],
  },
}

export default kase
