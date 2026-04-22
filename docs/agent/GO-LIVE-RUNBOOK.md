# Runbook de entrada em operação — Projeto: ChatBot

> Sequência literal para go-live controlado após fechamento da Fase 2 (commit `b228e20`).
> Executar em ordem. Não pular etapas.

---

## Pré-requisitos

- [ ] Repo em `B:\aero-studio\projects\.bases\template.base`, branch `master`, árvore limpa
- [ ] Último commit: `b228e20` ou posterior
- [ ] Vercel CLI instalada e autenticada
- [ ] Acesso ao projeto Supabase do `template.base`
- [ ] Credenciais `OPENAI_API_KEY` em mãos
- [ ] Janela de baixo tráfego combinada

---

## Fase 1 — Preparar ambiente Vercel

### 1.1 Verificar env vars atuais em produção

```powershell
vercel env ls production
```

Esperado presente: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_AUTH_PROVIDER`.

### 1.2 Adicionar `OPENAI_API_KEY` (bloqueante)

```powershell
vercel env add OPENAI_API_KEY production
# cole a chave quando solicitado

vercel env add OPENAI_API_KEY preview
# mesma chave (ou chave separada com limit de preview)
```

### 1.3 (Opcional) Adicionar `AGENT_ENTERPRISE_TENANT_ID`

Apenas se for ativar o `tasksEnterpriseDomainPack` para um tenant específico.

```powershell
vercel env add AGENT_ENTERPRISE_TENANT_ID production
# cole o UUID do tenant enterprise
```

Sem esta variável, o override fica inativo — zero impacto no comportamento atual.

### 1.4 Validar `SUPABASE_SERVICE_ROLE_KEY`

Confirmar que o valor é do projeto Supabase do `template.base`, não injetado por integração de outro projeto.

```powershell
vercel env pull .env.production.local --environment=production
# inspecionar SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SUPABASE_URL
# URL e key precisam apontar para o MESMO projeto
```

Se suspeitar de injeção cruzada, remover e recriar manualmente:

```powershell
vercel env rm SUPABASE_SERVICE_ROLE_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

---

## Fase 2 — Migrations em staging

### 2.1 Aplicar migration `00023` em staging

Via Supabase Studio do projeto de staging: SQL Editor → colar o conteúdo de `supabase/migrations/00023_agent_sessions_domain_pack.sql` → Run.

Esperado: quatro colunas novas em `public.agent_sessions` (`domain_pack_id`, `domain_pack_version`, `domain_pack_fallback`, `domain_pack_strategy`) + dois índices.

### 2.2 Aplicar migration `00024` em staging

Mesma rota: SQL Editor → `supabase/migrations/00024_backfill_legacy_agent_sessions.sql` → Run.

O bloco `DO $$` emite `RAISE WARNING` se sobrar alguma linha com `domain_pack_id` nulo.

### 2.3 Validar backfill em staging

Rodar as queries abaixo no SQL Editor:

```sql
-- 1. Nenhuma linha deve permanecer com domain_pack_id nulo
SELECT count(*) AS legacy_remaining
FROM public.agent_sessions
WHERE domain_pack_id IS NULL;
-- Esperado: 0

-- 2. Distribuição por pack
SELECT domain_pack_id, domain_pack_strategy, count(*)
FROM public.agent_sessions
GROUP BY 1, 2
ORDER BY 3 DESC;

-- 3. Sessões novas criadas depois do deploy devem ter strategy != 'fallback-core'
-- (confirmar depois do 2.5)

-- 4. Constraint de strategy
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'agent_sessions_domain_pack_strategy_chk';
```

---

## Fase 3 — Validação funcional em staging

Deploy de preview aponta para banco de staging. Se não houver ambiente de staging separado, promover um preview com as env vars de staging.

### 3.1 Deploy preview

```powershell
vercel deploy
# NÃO usar --prod ainda
```

Anotar URL do preview.

### 3.2 Casos de validação manual

| #   | Caso                      | Como validar                                                   | Critério                                            |
| --- | ------------------------- | -------------------------------------------------------------- | --------------------------------------------------- |
| 1   | Core pack                 | POST `/api/agent/chat` com appId ausente ou desconhecido       | response.domainPackId === 'core', fallback=true     |
| 2   | Tasks pack — leitura      | Chat com appId=`tasks`, pedir tarefas abertas                  | tool `get_open_tasks` executada, pack=`tasks`       |
| 3   | Tasks pack — escrita      | Pedir criar tarefa                                             | pendingAction criado; não executa sem POST /confirm |
| 4   | Tasks pack — confirmar    | POST `/api/agent/actions/confirm` com actionId                 | tarefa criada em `public.tasks`                     |
| 5   | Support pack — leitura    | Chat com appId=`support`, pedir status de ticket               | tool `get_ticket_status` executada                  |
| 6   | Support pack — isolamento | Pedir criar tarefa em appId=`support`                          | tool bloqueada por policy; resposta graceful        |
| 7   | Tenant override           | Chat com appId=`tasks` + tenantId=`AGENT_ENTERPRISE_TENANT_ID` | pack=`tasks-enterprise`, strategy=`tenant`          |
| 8   | Admin sessions            | GET `/admin/agent/sessions` logado como ADMIN                  | coluna Pack + filtros funcionam                     |
| 9   | Admin RBAC                | GET `/admin/agent/sessions` logado como VIEWER                 | 403                                                 |
| 10  | Admin métricas            | GET `/admin/agent`                                             | by_pack popula com dados reais                      |
| 11  | Persistência pack         | Consultar `agent_sessions` no Supabase após chat               | `domain_pack_id` gravado                            |
| 12  | Tool log sanitizado       | Chat que envie tool com campo "token"                          | `agent_tool_logs.input` redacted                    |

### 3.3 Critério de passagem

- [ ] Todos os 12 casos verdes
- [ ] Nenhum 500 em rotas do agente
- [ ] `/admin/agent/*` renderiza sem erro
- [ ] Métricas `by_pack` mostra ao menos `core` e `tasks` ou `support` no staging

Se qualquer caso falhar: **não promover para produção**. Corrigir e repetir.

---

## Fase 4 — Produção

### 4.1 Aplicar migrations 00023 + 00024 em produção

Mesma rota da staging: SQL Editor → 00023 → validar → 00024 → validar com queries da seção 2.3.

**Atenção:** 00024 roda `UPDATE` em todas as linhas. Em tenant com milhões de sessões, considerar rodar em batches:

```sql
-- Versão batched (opcional, se a 00024 direta for muito lenta)
DO $$
DECLARE
  rows_updated integer;
BEGIN
  LOOP
    UPDATE public.agent_sessions
    SET domain_pack_id = 'core', domain_pack_version = '1.0.0',
        domain_pack_fallback = false, domain_pack_strategy = 'fallback-core'
    WHERE id IN (
      SELECT id FROM public.agent_sessions
      WHERE domain_pack_id IS NULL
      LIMIT 10000
    );
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    EXIT WHEN rows_updated = 0;
    COMMIT;
  END LOOP;
END $$;
```

### 4.2 Promover deploy para produção

```powershell
vercel deploy --prod
```

Anotar horário, URL e SHA do deploy.

### 4.3 Smoke test em produção

Repetir casos 1, 2, 5, 8, 9, 10, 11 da seção 3.2 diretamente em produção. Não criar dados de teste massivos.

### 4.4 Registrar no changelog operacional

Criar entry em `docs/agent/CHANGELOG-PHASE-2.md` ou em docs de operação:

```
## Go-live — <YYYY-MM-DD HH:MM TZ>
- Commit: <sha>
- URL: https://aero-template.vercel.app (ou domínio custom)
- Migrations: 00023, 00024
- Env vars: OPENAI_API_KEY, (AGENT_ENTERPRISE_TENANT_ID)
- Responsável: <nome>
```

---

## Fase 5 — Rollback (se necessário)

### 5.1 Rollback de deploy

```powershell
vercel rollback <deployment-url-anterior>
```

### 5.2 Rollback de migration

00023 e 00024 são aditivas e idempotentes. Para reverter:

```sql
-- Remover colunas (só se realmente necessário — perde dados)
ALTER TABLE public.agent_sessions
  DROP COLUMN IF EXISTS domain_pack_id,
  DROP COLUMN IF EXISTS domain_pack_version,
  DROP COLUMN IF EXISTS domain_pack_fallback,
  DROP COLUMN IF EXISTS domain_pack_strategy;

DROP INDEX IF EXISTS idx_agent_sessions_domain_pack;
DROP INDEX IF EXISTS idx_agent_sessions_fallback;
```

Preferir: fazer rollback só do deploy e investigar o problema com as colunas em paz.

---

## Fase 6 — Monitoramento primeiras 2 semanas

Ver `docs/agent/MONITORING-WEEK-1.md` para checklist diário + semanal.

---

## Troubleshooting rápido

| Sintoma                                                       | Causa provável                                                   | Ação                                                |
| ------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------- |
| `/api/agent/chat` retorna 500 "Serviço de IA não configurado" | `OPENAI_API_KEY` ausente                                         | Rodar Fase 1.2                                      |
| Admin panel mostra tudo como "Legado (sem pack)"              | Migration 00024 não rodada                                       | Rodar Fase 4.1                                      |
| Pack=`tasks-enterprise` não aparece em prod                   | `AGENT_ENTERPRISE_TENANT_ID` ausente                             | Rodar Fase 1.3                                      |
| Tool log retorna campo sensível em cleartext                  | Falha no sanitize — bug real                                     | Investigar `lib/agent-tool-log-persister.ts`        |
| Fallback rate >10% para appId conhecido                       | Pack não registrado em `chat/route.ts` ou appId errado no client | Verificar registry na rota + o que o frontend manda |
| `agent_sessions.domain_pack_id` fica nulo em sessões novas    | `recordDomainPack` falhou silencioso                             | Checar logs do handler; verificar RLS               |
