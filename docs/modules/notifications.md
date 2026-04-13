# Modulo: Notificacoes

> **ID**: `notifications` | **Versao**: 1.0.0 | **Categoria**: Opcional | **Status**: Ativo

Centro de notificacoes com WebSocket e badge em tempo real

## Metadados

| Campo   | Valor   |
| ------- | ------- |
| Icone   | `Bell`  |
| Caminho | `-`     |
| Ordem   | 40      |
| Grupo   | Sistema |
| Sidebar | Nao     |

## Dependencias

- [`auth`](./auth.md)

## Rotas

### API

- `/api/notifications`

## Tabelas (Supabase)

- `notifications`

## Hooks

- `useNotifications`
- `useWebSocket`
- `useRealtimeSubscription`

## Componentes

- `NotificationCenter`

## Feature Flags

- `module.notifications`

## Variaveis de Ambiente

Nenhuma variavel de ambiente requerida.

---

_Gerado por `scripts/generate-module-docs.mjs` em 2026-04-13_
