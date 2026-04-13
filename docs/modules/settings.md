# Modulo: Configuracoes Pessoais

> **ID**: `settings` | **Versao**: 1.0.0 | **Categoria**: Core (sempre ativo) | **Status**: Ativo

Perfil do usuario, preferencias, seguranca e sessoes

## Metadados

| Campo   | Valor       |
| ------- | ----------- |
| Icone   | `Settings`  |
| Caminho | `/settings` |
| Ordem   | 50          |
| Grupo   | Sistema     |
| Sidebar | Nao         |

## Dependencias

- [`auth`](./auth.md)

## Rotas

### Paginas

- `/settings`
- `/profile`
- `/profile/security`

### API

- `/api/user/preferences`
- `/api/user/locale`
- `/api/user/onboarding`

## Tabelas (Supabase)

- `profiles`

## Hooks

- `useTheme`
- `useOnboarding`
- `useFormDirty`

## Componentes

- `FirstRunWizard`

## Variaveis de Ambiente

Nenhuma variavel de ambiente requerida.

---

_Gerado por `scripts/generate-module-docs.mjs` em 2026-04-13_
