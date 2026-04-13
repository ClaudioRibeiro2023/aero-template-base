# Modulo: Suporte

> **ID**: `support` | **Versao**: 1.0.0 | **Categoria**: Opcional | **Status**: Inativo

Sistema de tickets com mensagens, SLA e satisfacao

## Metadados

| Campo   | Valor        |
| ------- | ------------ |
| Icone   | `HelpCircle` |
| Caminho | `/support`   |
| Ordem   | 20           |
| Grupo   | Suporte      |
| Sidebar | Sim          |

## Dependencias

- [`auth`](./auth.md)
- [`notifications`](./notifications.md)

## Rotas

### Paginas

- `/support`
- `/support/tickets`
- `/support/tickets/new`

### API

- `/api/support`

## Tabelas (Supabase)

- `support_tickets`
- `support_messages`

## Hooks

- `useSupportTickets`
- `useSupportMessages`

## Componentes

- `TicketCard`
- `TicketStatusBadge`
- `TicketPriorityIndicator`
- `ConversationThread`
- `MessageInput`
- `SatisfactionRating`
- `TicketActions`

## Feature Flags

- `module.support`

## Variaveis de Ambiente

Nenhuma variavel de ambiente requerida.

## Funcoes (Navegacao)

| ID                | Nome               | Subtitulo               | Caminho                | Categoria   |
| ----------------- | ------------------ | ----------------------- | ---------------------- | ----------- |
| `support-hub`     | Central de Suporte | Visao geral do suporte  | `/support`             | OPERACIONAL |
| `support-tickets` | Tickets            | Gerenciar tickets       | `/support/tickets`     | OPERACIONAL |
| `support-new`     | Novo Ticket        | Abrir ticket de suporte | `/support/tickets/new` | OPERACIONAL |

---

_Gerado por `scripts/generate-module-docs.mjs` em 2026-04-13_
