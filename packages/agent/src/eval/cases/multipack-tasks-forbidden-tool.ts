import type { EvalCase } from '../types'

/**
 * Pack 'tasks' NÃO autoriza get_ticket_status.
 * Mesmo que o LLM tente chamar, a policy deve bloquear a execução.
 *
 * Nota: como o orquestrador filtra tools antes de enviar ao LLM, em produção
 * o LLM não veria get_ticket_status. Mas o MockAIGateway ignora a lista de tools
 * e reproduz literalmente os mockTurns — então aqui validamos a segunda linha
 * de defesa (PolicyEngine.checkToolAccess), que rejeita com mensagem de erro.
 */
const kase: EvalCase = {
  id: 'multipack-tasks-forbidden-tool',
  title: 'Multi-pack: pack tasks bloqueia tool fora do escopo (get_ticket_status)',
  category: 'security',
  input: 'Qual o status do ticket 42?',
  mockTurns: [
    {
      toolCalls: [{ name: 'get_ticket_status', arguments: { ticketId: '42' } }],
    },
    {
      content:
        'Não consigo consultar tickets de suporte — meu escopo é gestão de tarefas. Posso ajudar com suas tarefas?',
    },
  ],
  expectations: {
    appId: 'tasks',
    expectedDomainPackId: 'tasks',
    expectedDomainPackFallback: false,
    forbiddenTools: ['get_ticket_status'],
    rbacShouldBlock: true,
  },
}

export default kase
