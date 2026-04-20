# Domain Packs — Contrato

Documento formal do contrato `DomainPack` consumido pelo `@template/agent`.

## Visão geral

Um **DomainPack** é a unidade de especialização do agente. Encapsula identidade, prompt de sistema, lista de tools autorizadas, regras de memória e políticas de segurança para um domínio específico (ex.: `core`, `tasks`, `support`).

Por que existe:

- O orquestrador é genérico; o que dá cara ao agente é o pack.
- `PolicyEngine` usa `authorizedSources.internalTools` para bloquear tool fora do escopo.
- O orquestrador filtra a lista de tools enviadas ao gateway para reduzir superfície.
- Admin e métricas agregam por `domain_pack_id` para entender onde está o tráfego.

## Shape do contrato

Tipo canônico em `B:\aero-studio\projects\.bases\template.base\packages\agent\src\types\domain-pack.ts`.

| Campo                             | Tipo                              | Descrição                                                            |
| --------------------------------- | --------------------------------- | -------------------------------------------------------------------- |
| `identity.id`                     | `string`                          | Slug estável do pack (`core`, `tasks`, `tasks-enterprise`)           |
| `identity.version`                | `string` (semver)                 | Versão do pack — muda quando prompt/tools mudam                      |
| `identity.displayName`            | `string`                          | Nome humano para o admin                                             |
| `identity.appIds`                 | `string[]`                        | Apps servidos. `['*']` só para `core`. Demais packs usam lista exata |
| `agent.name` / `avatar` / `tone`  | `string`                          | Metadados de apresentação                                            |
| `systemPrompt.systemPrompt`       | `string`                          | Prompt de sistema PT-BR                                              |
| `systemPrompt.responseRules`      | `string[]`                        | Regras obrigatórias de resposta                                      |
| `systemPrompt.outOfScope`         | `string[]`                        | Tópicos fora do escopo do pack                                       |
| `authorizedSources.internalTools` | `string[]`                        | Tools permitidas — PolicyEngine bloqueia o resto                     |
| `memoryRules.sessionFacts`        | `string[]`                        | Chaves de fato de sessão extraíveis                                  |
| `memoryRules.userPreferences`     | `string[]`                        | Preferências de usuário persistíveis                                 |
| `memoryRules.domainFacts`         | `string[]` (opcional)             | Fatos de domínio relevantes                                          |
| `memoryRules.sessionTtlSeconds`   | `number`                          | TTL da sessão                                                        |
| `security.minimumRole`            | `'viewer' \| 'member' \| 'admin'` | Role mínima para usar o pack                                         |
| `security.maskSensitiveData`      | `boolean`                         | Mascarar campos sensíveis em logs                                    |
| `security.restrictedFields`       | `string[]`                        | Campos sempre mascarados                                             |
| `security.crossTenantAllowed`     | `boolean`                         | Raramente `true`                                                     |

Exemplo real — `B:\aero-studio\projects\.bases\template.base\packages\agent\src\domain-packs\tasks\index.ts`:

```ts
export const tasksDomainPack: DomainPack = {
  identity: {
    id: 'tasks',
    version: '1.0.0',
    displayName: 'Assistente de Tarefas',
    appIds: ['tasks'],
  },
  systemPrompt: {
    systemPrompt: `Você é um assistente especialista em gestão de tarefas. ...`,
    responseRules: [
      'Confirmar antes de executar qualquer criação/alteração de tarefa',
      'Citar o ID da tarefa ao referenciá-la',
    ],
    outOfScope: ['Tickets de suporte', 'Auditoria e relatórios operacionais'],
  },
  authorizedSources: {
    internalTools: [
      'get_open_tasks',
      'create_task',
      'update_task_status',
      'update_task_priority',
      'assign_task',
    ],
    externalSources: [],
    documentTypes: [],
  },
  memoryRules: {
    sessionFacts: ['tarefa_em_foco', 'filtro_prioridade', 'filtro_status'],
    userPreferences: ['formato_listagem', 'idioma_preferido'],
    sessionTtlSeconds: 3600,
  },
  security: {
    minimumRole: 'viewer',
    maskSensitiveData: true,
    restrictedFields: ['password', 'api_key', 'secret', 'token'],
    crossTenantAllowed: false,
  },
}
```

## Identidade e versionamento

- `identity.id` é **estável** — mudança é breaking para dashboards e queries.
- `version` segue semver: mudança de prompt ou conjunto de tools = minor/patch; mudança de `id` = major.
- `appIds` define para quais apps o pack responde. Apenas o `core` usa `['*']` (fallback universal).

## Tools autorizadas

`authorizedSources.internalTools` tem **duas consequências operacionais**:

1. **PolicyEngine** bloqueia tool chamada que não esteja na lista.
2. **Orchestrator** filtra as tools enviadas ao gateway (o modelo nem vê as outras).

Lista mínima e explícita. Evite listar tool "por garantia".

## System prompt

- `systemPrompt`: prompt principal, sempre em PT-BR.
- `responseRules`: regras curtas e imperativas que o orquestrador injeta.
- `outOfScope`: tópicos explicitamente rejeitados, guiando o modelo a redirecionar para o core.

## Memory rules

Governam o `MemoryManager`:

- `sessionFacts`: fatos voláteis da conversa (ex.: `tarefa_em_foco`).
- `userPreferences`: preferências persistentes por usuário.
- `domainFacts`: fatos de domínio (ex.: tickets prioritários em `support`).
- `sessionTtlSeconds`: controla TTL da sessão em Redis/Supabase.

## Security

- `minimumRole`: o orquestrador barra usuários abaixo disso antes de enviar ao gateway.
- `maskSensitiveData` + `restrictedFields`: aplicam-se a `tool_logs` e `agent_messages`.
- `crossTenantAllowed`: default `false`; só `true` em packs administrativos internos.

## Como registrar

Registro acontece nas rotas de chat. Exemplo em `B:\aero-studio\projects\.bases\template.base\apps\web\app\api\agent\chat\route.ts`:

```ts
const _packRegistry = (() => {
  const r = new DomainPackRegistry()
  r.register(coreDomainPack)
  r.register(tasksDomainPack)
  r.register(supportDomainPack)
  const enterpriseTenantId = process.env.AGENT_ENTERPRISE_TENANT_ID
  if (enterpriseTenantId) {
    r.registerForTenant(tasksEnterpriseDomainPack, enterpriseTenantId)
  }
  return r
})()
```

Ordem não importa para prioridade — ela é definida pelo resolver (`tenant > app > fallback-core`).

## Boas práticas

- **Composição**: quando um pack compartilha base com o core, herde por composição explícita (importe e estenda) — não copie prompt inteiro.
- **Prompts PT-BR** — sempre.
- **Tool-list explícita e mínima**: cada tool listada é superfície de ataque.
- **Memory facts representativos**: liste apenas chaves realmente extraídas/usadas.
- **Avatar e tone coerentes**: o admin mostra esses valores.

## Anti-padrões

- Pack "decorativo" que só muda `displayName` — use registro padrão do core.
- `appIds: ['*']` fora do core — quebra o resolver.
- Prompt genérico tipo "você é um assistente útil" — não agrega domínio.
- Lista de tools enorme "por garantia" — derruba determinismo do modelo e aumenta risco.
- Pack que cruza domínio de outro (suporte fazendo tarefas) — crie tool compartilhada, não pack híbrido.

## Testando pack novo

1. Adicione o pack em `packages/agent/src/domain-packs/<nome>/index.ts`.
2. Registre-o nas rotas (`apps/web/app/api/agent/chat/route.ts` e `stream/route.ts`).
3. Crie ao menos um caso em `packages/agent/src/eval/cases/` mirando o pack.
4. Rode `pnpm --filter @template/agent eval` — todos os casos devem passar (15/15 hoje).
5. Valide no admin após primeira conversa real: `domain_pack_id` e `domain_pack_strategy` corretos.
