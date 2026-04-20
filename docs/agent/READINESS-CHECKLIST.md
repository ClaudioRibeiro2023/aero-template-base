# Readiness Checklist — Agente (Fase 2)

Checklist formal para ticar antes de declarar "pronto para operação". O ato de commitar esta versão confirma os itens verificáveis.

## Contrato e override

- [x] Contrato `DomainPack` documentado em `docs/agent/DOMAIN-PACKS.md`
- [x] Tenant override documentado em `docs/agent/TENANT-OVERRIDE.md`

## Configuração

- [x] `AGENT_ENTERPRISE_TENANT_ID` presente em `apps/web/.env.example` (seção Conversation OS)

## Banco de dados

- [x] Migration `00024_backfill_legacy_agent_sessions.sql` criada
- [x] Backfill marca sessões legadas como `core` + `fallback-core`

## UI admin

- [x] `/admin/agent/sessions` exibe pill de `domain_pack_strategy` por linha
- [x] `/admin/agent/sessions/[id]` exibe `Strategy` com pill colorida

## Qualidade

- [x] `pnpm --filter @template/agent typecheck` verde
- [x] `pnpm --filter web typecheck` verde
- [x] `pnpm --filter @template/agent build` verde
- [x] `pnpm --filter web build` verde
- [x] `pnpm --filter @template/agent eval` — 15/15 casos verdes

## Documentação

- [x] `docs/agent/CHANGELOG-PHASE-2.md` publicado com todas as Sprints 7–12
- [x] `docs/agent/PHASE-2-CLOSURE.md` publicado com escopo, arquitetura e pendências
- [x] `docs/agent/README.md` como índice da pasta
