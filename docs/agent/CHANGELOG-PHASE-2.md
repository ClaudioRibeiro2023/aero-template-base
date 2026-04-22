# Changelog — Fase 2 do Agente

Consolidado das Sprints 7–12, que compõem a Fase 2 do `@template/agent`.

## Go-live — 2026-04-22

- Produção: https://template.aeroeng.tech
- Deploy prod: `aero-template-72urjxp0d` (Ready, 60s build)
- Preview validado: `aero-template-i2gi92h31`
- SHA do código: `1a019cc`
- Supabase: `ajfmcmjhtwtquxwkhlxc` (factory-h-governance, banco compartilhado)
- Migrations aplicadas: 00006, 00007, 00022, 00023, 00024 — Conversation OS
  inteiro pela primeira vez neste banco
- Env vars configuradas nos 3 environments: OPENAI_API_KEY,
  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_AUTH_PROVIDER(S),
  NEXT_PUBLIC_PRIMARY_COLOR, NEXT_PUBLIC_APP_VERSION, NEXT_PUBLIC_APP_NAME
- Smoke test automatizado: /login 200, /api/agent/chat sem auth 401
- Pendente operacional: smoke 12-case autenticado
  (docs/agent/GO-LIVE-RUNBOOK.md seção 3.2)

---

## Sprint 7 — Painel admin de observabilidade

Commit: `6ee060f`

- Rota `/admin/agent` com métricas agregadas (`sessions_total`, `messages_total`, `tool_calls_total`, latência avg/p95).
- Subpáginas: `sessions`, `tool-logs`, `pending-actions`, `degradations`.
- Hooks read-only em `apps/web/hooks/useAdminAgent.ts` com React Query.
- RBAC: ADMIN/GESTOR; dados sempre escopados por tenant.

## Sprint 8 — Eval harness offline

Commit: `e9133f5`

- Runner determinístico em `packages/agent/src/eval/` — sem chamadas reais ao LLM.
- Golden set inicial cobrindo read tools, write tools (com pending action) e políticas.
- Diff de regressão contra baseline checado no repo.
- Script `pnpm --filter @template/agent eval` integrado ao CI local.

## Sprint 9 — Multi-pack routing

Commit: `728b653`

- `DomainPackRegistry` com resolver determinístico (`tenant > app > fallback-core > none`).
- `tasksDomainPack` como primeiro pack especializado (não usa wildcard).
- Orchestrator filtra tools enviadas ao gateway pela lista autorizada do pack.
- Response do chat expõe `domainPack` resolvido.

## Sprint 10 — Persistência do pack por sessão

Commit: `0a616f7`

- Migration `00023_agent_sessions_domain_pack.sql`: colunas `domain_pack_id`, `domain_pack_version`, `domain_pack_fallback`, `domain_pack_strategy`.
- `SessionStore` grava o pack resolvido a cada turno.
- API admin `/api/admin/agent/metrics` agrega métricas `byPack`.
- UI admin: filtro por pack + coluna Pack em sessions.

## Sprint 11 — Segundo pack + tenant override

Commit: `dc31a6c`

- `supportDomainPack` — pack especializado para suporte, tools read-only.
- `tasksEnterpriseDomainPack` — variação enterprise do pack de tasks (prompt mais rígido, SLA explícito).
- `DomainPackRegistry.registerForTenant(pack, tenantId)` habilita override por tenant.
- 4 novos casos no eval harness cobrindo multi-pack + tenant override.

## Sprint 12 — Closure da Fase 2

Commit: _(esta sprint)_

- Documentação formal em `docs/agent/` (DOMAIN-PACKS, TENANT-OVERRIDE, CHANGELOG, closure, readiness).
- Migration `00024_backfill_legacy_agent_sessions.sql` marca sessões legadas como `core` / `fallback-core`.
- Badge visual de `domain_pack_strategy` no admin (violet/sky/amber/gray).
- `AGENT_ENTERPRISE_TENANT_ID` documentada em `.env.example`.
- Sem expansão funcional — fechamento puro da Fase 2.
