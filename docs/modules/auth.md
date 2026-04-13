# Modulo: Autenticacao

> **ID**: `auth` | **Versao**: 1.0.0 | **Categoria**: Core (sempre ativo) | **Status**: Ativo

Login, registro, recuperacao de senha e OAuth

## Metadados

| Campo   | Valor    |
| ------- | -------- |
| Icone   | `Lock`   |
| Caminho | `/login` |
| Ordem   | 0        |
| Grupo   | Sistema  |
| Sidebar | Nao      |

## Dependencias

Nenhuma dependencia.

## Rotas

### Paginas

- `/login`
- `/register`
- `/login/forgot-password`
- `/auth/callback`

### API

- `/api/auth`

## Tabelas (Supabase)

- `profiles`
- `tenants`

## Hooks

- `useAuth`

## Componentes

- `ProtectedRoute`
- `PermissionGate`

## Variaveis de Ambiente

| Variavel                        | Obrigatoria | Descricao                    |
| ------------------------------- | ----------- | ---------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Sim         | URL do projeto Supabase      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim         | Chave anonima do Supabase    |
| `SUPABASE_SERVICE_ROLE_KEY`     | Sim         | Chave de servico do Supabase |

---

_Gerado por `scripts/generate-module-docs.mjs` em 2026-04-13_
