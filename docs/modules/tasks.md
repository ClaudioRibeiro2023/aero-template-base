# Modulo: Tarefas

> **ID**: `tasks` | **Versao**: 1.0.0 | **Categoria**: Opcional | **Status**: Ativo

Gerenciamento de tarefas com CRUD completo, filtros e status

## Metadados

| Campo   | Valor         |
| ------- | ------------- |
| Icone   | `CheckCircle` |
| Caminho | `/tasks`      |
| Ordem   | 3             |
| Grupo   | Principal     |
| Sidebar | Sim           |

## Dependencias

- [`auth`](./auth.md)

## Rotas

### Paginas

- `/tasks`

### API

- `/api/tasks`

## Tabelas (Supabase)

- `tasks`

## Hooks

- `useTasks`

## Componentes

Nenhum componente exportado.

## Feature Flags

- `module.tasks`

## Variaveis de Ambiente

Nenhuma variavel de ambiente requerida.

## Funcoes (Navegacao)

| ID           | Nome             | Subtitulo                 | Caminho  | Categoria   |
| ------------ | ---------------- | ------------------------- | -------- | ----------- |
| `tasks-list` | Todas as Tarefas | Listar, criar e gerenciar | `/tasks` | OPERACIONAL |

---

_Gerado por `scripts/generate-module-docs.mjs` em 2026-04-13_
