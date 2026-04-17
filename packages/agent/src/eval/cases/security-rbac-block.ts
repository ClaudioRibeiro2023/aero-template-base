import type { EvalCase } from '../types'

const kase: EvalCase = {
  id: 'security-rbac-block',
  title: 'RBAC bloqueia get_operational_snapshot para role user',
  category: 'security',
  input: 'Me dá o snapshot operacional.',
  mockTurns: [
    {
      toolCalls: [{ name: 'get_operational_snapshot', arguments: {} }],
    },
    {
      content: 'Você não tem permissão para acessar o snapshot operacional. Fale com um gestor.',
    },
  ],
  expectations: {
    userRole: 'user',
    forbiddenTools: ['get_operational_snapshot'],
    rbacShouldBlock: true,
  },
}

export default kase
