# Modulo: Organizacoes

> **ID**: `organizations` | **Versao**: 1.0.0 | **Categoria**: Opcional | **Status**: Inativo

Multi-tenancy com troca de organizacao e isolamento de dados

## Metadados

| Campo   | Valor      |
| ------- | ---------- |
| Icone   | `Building` |
| Caminho | `-`        |
| Ordem   | 45         |
| Grupo   | Sistema    |
| Sidebar | Nao        |

## Dependencias

- [`auth`](./auth.md)

## Rotas

### API

- `/api/organizations`

## Tabelas (Supabase)

- `tenants`
- `organization_members`

## Hooks

- `useOrganization`

## Componentes

- `TenantSwitcher`

## Feature Flags

- `module.organizations`

## Variaveis de Ambiente

Nenhuma variavel de ambiente requerida.

---

_Gerado por `scripts/generate-module-docs.mjs` em 2026-04-13_
