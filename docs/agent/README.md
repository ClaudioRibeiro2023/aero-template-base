# Agente Conversacional — Documentação

Índice da documentação do `@template/agent` (Conversation OS nativo do template).

## Documentos

| Documento                                          | Conteúdo                                                      |
| -------------------------------------------------- | ------------------------------------------------------------- |
| [DOMAIN-PACKS.md](./DOMAIN-PACKS.md)               | Contrato do `DomainPack`, como criar e registrar packs        |
| [TENANT-OVERRIDE.md](./TENANT-OVERRIDE.md)         | Quando e como sobrescrever um pack para um tenant específico  |
| [CHANGELOG-PHASE-2.md](./CHANGELOG-PHASE-2.md)     | Consolidado do que foi entregue nas Sprints 7–12              |
| [PHASE-2-CLOSURE.md](./PHASE-2-CLOSURE.md)         | Fechamento formal da Fase 2 — escopo, arquitetura, pendências |
| [READINESS-CHECKLIST.md](./READINESS-CHECKLIST.md) | Checklist de prontidão para operação                          |

## Referências rápidas

- **Pacote**: `B:\aero-studio\projects\.bases\template.base\packages\agent\`
- **Rotas de chat**: `B:\aero-studio\projects\.bases\template.base\apps\web\app\api\agent\chat\route.ts`
- **Admin**: `B:\aero-studio\projects\.bases\template.base\apps\web\app\(protected)\admin\agent\`
- **Eval harness**: `pnpm --filter @template/agent eval`

## Stack do agente

```
UI (chat widget / admin)
  → API routes (/api/agent/*)
    → Orchestrator
      → OpenAIGateway | ToolRegistry | PolicyEngine | MemoryManager
      → SessionStore | PendingActionStore
        → Supabase (agent_sessions, agent_messages, agent_tool_logs, agent_pending_actions)
```
