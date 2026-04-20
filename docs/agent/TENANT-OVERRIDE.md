# Tenant Override de Domain Pack

Como sobrescrever um pack para um tenant específico mantendo o mesmo `appId`.

## Quando usar

- Cliente enterprise que precisa de **prompt customizado**, política de confirmação mais estrita ou lista de tools diferente.
- Mesmo `appId` (ex.: `tasks`), mesma semântica de negócio, mas regras operacionais específicas daquele tenant.
- Integração com SLA ou workflow próprio daquele cliente.

## Quando NÃO usar

- Diferenças triviais de preferência de usuário → use `memoryRules.userPreferences`.
- Novo domínio inteiro (ex.: RH, jurídico) → crie um pack novo, não override.
- Apenas rebrand de prompt (troca de tom) → não justifica override; ajuste o pack base.

## Prioridade do resolver

`DomainPackRegistry.resolveWithMetadata(appId, tenantId)` segue ordem determinística:

```
1. tenant    — <appId>:<tenantId>   registrado via registerForTenant
2. app       — <appId>:*            registrado via register
3. fallback-core — pack com appIds contendo '*'  (coreDomainPack)
4. none      — nenhum pack resolve
```

A `strategy` resolvida é persistida em `agent_sessions.domain_pack_strategy` e retornada no response do chat.

## Como registrar

Exemplo real em `B:\aero-studio\projects\.bases\template.base\apps\web\app\api\agent\chat\route.ts`:

```ts
const _packRegistry = (() => {
  const r = new DomainPackRegistry()
  r.register(coreDomainPack)
  r.register(tasksDomainPack)
  r.register(supportDomainPack)

  // Tenant override — opt-in via env
  const enterpriseTenantId = process.env.AGENT_ENTERPRISE_TENANT_ID
  if (enterpriseTenantId) {
    r.registerForTenant(tasksEnterpriseDomainPack, enterpriseTenantId)
  }
  return r
})()
```

Mesmo bloco existe em `stream/route.ts` — **mantenha sincronizado**.

## Dependência de configuração

A env `AGENT_ENTERPRISE_TENANT_ID` é **opt-in**:

| Valor           | Comportamento                                                    |
| --------------- | ---------------------------------------------------------------- |
| (vazio / unset) | Nenhum override ativado. Todos tenants usam `tasksDomainPack`.   |
| `<UUID válido>` | Tenant indicado recebe `tasksEnterpriseDomainPack` para `tasks`. |

Documentada em `B:\aero-studio\projects\.bases\template.base\apps\web\.env.example`.

## Observabilidade

Quando o override resolve, você verá:

- `agent_sessions.domain_pack_id = 'tasks-enterprise'`
- `agent_sessions.domain_pack_strategy = 'tenant'`
- Admin UI: badge violeta "tenant" na coluna Pack (`/admin/agent/sessions`)
- Trace: `strategy: 'tenant'` no span do orquestrador

## Riscos operacionais

- **Env faltando em preview/prod**: override silenciosamente não ativa. Documente no deploy runbook.
- **Drift entre base e override**: quando `tasksDomainPack` ganha tool nova e `tasksEnterpriseDomainPack` não acompanha. Mitigação: eval harness cobre ambos, e PR checklist inclui "override atualizado?".
- **Override mal configurado**: tenant errado recebe pack errado = dados vazados entre clientes. Sempre confirme UUID do tenant no env antes de subir.

## Como testar

Caso de eval real em `B:\aero-studio\projects\.bases\template.base\packages\agent\src\eval\cases\multipack-tenant-override.ts`:

```ts
const kase: EvalCase = {
  id: 'multipack-tenant-override',
  title: 'Multi-pack: tenant override resolve tasksEnterpriseDomainPack no lugar de tasks',
  category: 'write',
  input: 'Crie uma tarefa urgente para fechar o relatório regulatório.',
  expectations: {
    appId: 'tasks',
    tenantId: 'enterprise-tenant-eval',
    expectedDomainPackId: 'tasks-enterprise',
    expectedDomainPackFallback: false,
    expectedTools: ['create_task'],
    expectsPendingAction: true,
  },
}
```

Padrão para novo override: cópia desse caso com `tenantId` fixo + `expectedDomainPackId` do override. Rode `pnpm --filter @template/agent eval` e verifique o delta.
