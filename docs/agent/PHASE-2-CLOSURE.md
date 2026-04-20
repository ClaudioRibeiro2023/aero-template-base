# Fechamento da Fase 2 — Agente Conversacional

Documento formal de fechamento. Fase 2 = Sprints 7–12.

## Escopo entregue

- Painel admin com métricas, sessions, tool-logs, pending-actions, degradations.
- Eval harness offline determinístico (15 casos, 15/15 verde).
- Multi-pack routing com resolver determinístico.
- 3 domain packs: `coreDomainPack`, `tasksDomainPack`, `supportDomainPack`.
- 1 override de tenant: `tasksEnterpriseDomainPack`.
- Persistência de `domain_pack_id/version/fallback/strategy` em `agent_sessions`.
- Agregação admin `byPack` + filtros por pack.
- Backfill de sessões legadas (migration 00024).
- Documentação formal em `docs/agent/`.

## Arquitetura final

```
┌──────────────────────────────────────────────────────────────────┐
│ UI                                                               │
│  - apps/web/components/agent/*  (chat widget)                    │
│  - apps/web/app/(protected)/admin/agent/*  (painel observ.)      │
└──────────────────┬───────────────────────────────────────────────┘
                   │
┌──────────────────┴───────────────────────────────────────────────┐
│ API Routes                                                       │
│  /api/agent/chat          — turno síncrono                       │
│  /api/agent/chat/stream   — SSE streaming                        │
│  /api/agent/actions/confirm — confirmação de write tool          │
│  /api/admin/agent/*       — read-only métricas e listas          │
└──────────────────┬───────────────────────────────────────────────┘
                   │
┌──────────────────┴───────────────────────────────────────────────┐
│ @template/agent (Orchestrator)                                   │
│  ├─ DomainPackRegistry  (resolve pack por appId + tenantId)      │
│  ├─ OpenAIGateway       (inferência)                             │
│  ├─ ToolRegistry        (tools registradas)                      │
│  ├─ PolicyEngine        (bloqueia tool não-autorizada)           │
│  ├─ MemoryManager       (sessionFacts, userPreferences, rag)     │
│  ├─ SessionStore        (persist agent_sessions)                 │
│  ├─ PendingActionStore  (write-confirmation flow)                │
│  └─ AgentTracer         (trace_id + spans)                       │
└──────────────────┬───────────────────────────────────────────────┘
                   │
┌──────────────────┴───────────────────────────────────────────────┐
│ Supabase                                                         │
│  agent_sessions | agent_messages | agent_tool_logs               │
│  agent_pending_actions | agent_memory_facts                      │
└──────────────────────────────────────────────────────────────────┘
```

## Blocos concluídos

- [x] Admin observabilidade (Sprint 7)
- [x] Eval harness offline (Sprint 8)
- [x] Multi-pack routing (Sprint 9)
- [x] Persistência de pack por sessão (Sprint 10)
- [x] Tenant override + segundo pack (Sprint 11)
- [x] Docs, backfill, strategy badge, closure (Sprint 12)

## Pendências assumidas para Fase 3

- **Eval multi-turn** com retenção real de memória entre turnos.
- **Judge model** para avaliar qualidade de resposta (hoje só estrutura/tool-calls).
- **Write tools no support pack** (hoje read-only).
- **Registry config-driven**: hoje o registro de packs está hardcoded nas duas rotas.
- **Alertas de fallback rate por tenant**: hoje só agregação, sem threshold.
- **Admin: filtro por strategy específica** (tenant / app / fallback-core).

## Riscos remanescentes

- `AGENT_ENTERPRISE_TENANT_ID` depende de configuração manual em cada ambiente. Preview deploys esquecem com facilidade.
- Registro programático das rotas: qualquer pack novo exige patch em 2 arquivos (`chat/route.ts` e `chat/stream/route.ts`). Drift possível.
- Agregações admin têm cap em 5000 rows por query — tenants muito ativos podem precisar de rollup separado.

## Critérios de entrada em operação

- [x] `pnpm --filter @template/agent typecheck` verde.
- [x] `pnpm --filter web typecheck` verde.
- [x] `pnpm --filter @template/agent build` verde.
- [x] `pnpm --filter web build` verde.
- [x] `pnpm --filter @template/agent eval` 15/15.
- [x] Docs publicadas em `docs/agent/`.
- [x] Migration `00024_backfill_legacy_agent_sessions.sql` aplicada em todos ambientes.
- [x] `AGENT_ENTERPRISE_TENANT_ID` documentado no `.env.example`.

## Critérios de abertura da Fase 3

- Consenso sobre próxima trilha (multi-turn eval / judge model / config-driven registry).
- Golden set ampliado cobrindo cenários reais observados em produção.
- Ao menos 2 tenants reais usando override ativamente — valida o valor do mecanismo antes de investir em Fase 3.
