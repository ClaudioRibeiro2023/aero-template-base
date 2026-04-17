import type { EvalCase } from '../types'

const kase: EvalCase = {
  id: 'rag-grounded-answer',
  title: 'Resposta ancorada em documento recuperado (RAG)',
  category: 'rag',
  input: 'Qual nossa política de férias?',
  mockTurns: [
    {
      content:
        'Segundo a política interna: cada colaborador tem direito a 30 dias de férias, podendo ser divididos em até 3 períodos.',
    },
  ],
  mockMemoryHits: [
    {
      key: 'politica-ferias',
      value: 'Política de férias: 30 dias/ano, até 3 períodos.',
      content:
        'Política de férias: cada colaborador tem direito a 30 dias por ano, podendo ser divididos em até 3 períodos.',
      source: 'manual-rh.md',
    },
  ],
  expectations: {
    minSources: 1,
    responseContains: ['política'],
  },
}

export default kase
