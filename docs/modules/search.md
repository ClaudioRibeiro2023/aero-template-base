# Modulo: Busca Global

> **ID**: `search` | **Versao**: 1.0.0 | **Categoria**: Core (sempre ativo) | **Status**: Ativo

Command palette com busca cross-module (Ctrl+K)

## Metadados

| Campo   | Valor    |
| ------- | -------- |
| Icone   | `Search` |
| Caminho | `-`      |
| Ordem   | 99       |
| Grupo   | Sistema  |
| Sidebar | Nao      |

## Dependencias

- [`auth`](./auth.md)

## Rotas

### API

- `/api/search`

## Tabelas (Supabase)

Nenhuma tabela requerida.

## Hooks

- `useGlobalSearch`

## Componentes

- `GlobalSearch`
- `GlobalSearchProvider`
- `CommandPalette`

## Variaveis de Ambiente

Nenhuma variavel de ambiente requerida.

---

_Gerado por `scripts/generate-module-docs.mjs` em 2026-04-13_
