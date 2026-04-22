# Monitoramento pós-go-live — Projeto: ChatBot

> Checklist de observação para as primeiras 1–2 semanas em produção.
> Objetivo: coletar sinais reais antes de abrir a Fase 3.

---

## Diário (dias 1–7) — 15 minutos

Todos os dias, na mesma janela, abrir `/admin/agent` em produção e registrar:

| Métrica                   | Onde                                     | Alvo                     | Ação se fora                         |
| ------------------------- | ---------------------------------------- | ------------------------ | ------------------------------------ |
| Sessões (24h)             | Overview                                 | ≥ baseline esperado      | Investigar queda (deploy? erro?)     |
| Fallback rate global      | by_pack "core" com `fallback=true`       | ≤ 5%                     | Revisar appIds no client             |
| Tool failure rate         | `/admin/agent/tool-logs` com status=fail | ≤ 2%                     | Investigar tool específica           |
| Latência p95              | Overview                                 | ≤ 3000ms                 | Investigar gateway OpenAI/tool lenta |
| Pending actions expiradas | `/admin/agent/pending-actions`           | ≤ 20% do total           | UX confusa? Usuário não confirma?    |
| Degradações               | `/admin/agent/degradations`              | Zero crescimento anômalo | Ler error_msg; correção dirigida     |

Anotar valores diários em planilha ou comentário em PR de monitoramento.

---

## Sinais vermelhos — ação imediata

1. **`/api/agent/chat` 500** sustentado → rollback + investigar `OPENAI_API_KEY`, rate limit OpenAI, Supabase
2. **Pack errado resolvido** (ex: sessions de appId=tasks caindo em core) → verificar registry nas rotas e appId enviado pelo frontend
3. **Tenant override vazando** (tenant-enterprise respondendo para tenant errado) → auditar `registerForTenant` + env var; possível remoção temporária
4. **Campo sensível não redacted** em `agent_tool_logs.input` → bug crítico no sanitize; parar tools novas até fixar
5. **Pending actions executando sem confirmação** → bug crítico; desabilitar write tools via policy até fixar
6. **Cross-tenant leak** (tenant A vendo dado do tenant B) → incidente de segurança; RLS comprometido

---

## Sinais amarelos — investigar sem urgência

- Fallback rate 5–15% para appId conhecido → provavelmente client enviando appId errado em parte das rotas
- Latência p95 2000–3000ms → aceitável, mas vigiar crescimento
- Tools específicas com taxa de falha 2–5% → mapear causa (DB lenta? payload errado?)
- Sessões sem `domain_pack_id` entrando novas → `recordDomainPack` silenciando erro; ver logs

---

## Semanal — 30 minutos

No fim de cada semana, consolidar:

### Relatório S1 / S2

- [ ] Volume de sessões na semana, por pack
- [ ] Top 5 tools mais usadas, com success rate de cada
- [ ] Top 3 tenants por volume
- [ ] Incidentes (vermelho ou amarelo) com ação tomada
- [ ] Amostra de 10 conversas reais — classificar:
  - leitura com tool correta? Sim / Não
  - resposta ancorada em dados reais? Sim / Não
  - confirmação de escrita executada? Sim / Não
  - fallback inesperado? Sim / Não
  - degradação explícita? Sim / Não
- [ ] Lista de gaps percebidos que justificam entrar na Fase 3

### Coleta para golden set expandido

Capturar 20–30 conversas representativas (5 por categoria: leitura, escrita, RAG, fallback, degradação). Anonimizar. Salvar como candidatos para novos `EvalCase` em Sprint 13+.

---

## Decisão ao final da semana 2

Critérios objetivos para abertura da Fase 3:

### Go

- [ ] Sem incidente vermelho não resolvido
- [ ] Fallback rate global ≤ 10%
- [ ] Latência p95 ≤ 3000ms consistente
- [ ] Zero vazamento de tenant
- [ ] Zero execução de write sem confirmação
- [ ] Admin dando visibilidade suficiente (operador não precisa abrir DB direto)
- [ ] 20+ conversas reais coletadas e classificadas
- [ ] Lista de gaps reais (não hipotéticos) pronta

### No-go

- Algum item acima não atendido → corrigir e estender observação por +1 semana

### Decisão positiva — abrir Sprint 13

Sugestão prioritária baseada em valor:

1. **Write tools no support pack** (`create_ticket`, `update_ticket_status`, `assign_ticket`) — replica padrão de tasks
2. **Alertas de fallback rate por tenant** — endpoint + widget admin
3. **Registry config-driven** — habilita novo pack sem code deploy

Priorizar por quem dos três o operacional está pedindo mais depois de 2 semanas observando.

---

## Registro operacional

Manter em `docs/agent/OPERATIONS-LOG.md` (criar na primeira semana):

```
## 2026-04-DD — Go-live
Deploy: <url>, SHA: <sha>, Migrations: 00023, 00024

## 2026-04-DD — Dia 1
Sessões: X | Fallback: Y% | p95: Z ms | Incidentes: nenhum

## 2026-04-DD — Dia 2
...
```

Log de 2 semanas = evidência para a decisão de Fase 3.
