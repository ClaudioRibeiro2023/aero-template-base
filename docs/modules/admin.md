# Modulo: Administracao

> **ID**: `admin` | **Versao**: 1.0.0 | **Categoria**: Core (sempre ativo) | **Status**: Ativo

Gestao de usuarios, roles, auditoria e configuracoes do sistema

## Metadados

| Campo   | Valor             |
| ------- | ----------------- |
| Icone   | `Users`           |
| Caminho | `/admin/usuarios` |
| Ordem   | 30                |
| Grupo   | Administracao     |
| Sidebar | Sim               |

## Dependencias

- [`auth`](./auth.md)

## Rotas

### Paginas

- `/admin`
- `/admin/usuarios`
- `/admin/roles`
- `/admin/auditoria`
- `/admin/quality`
- `/admin/config`
- `/admin/config/geral`
- `/admin/config/aparencia`
- `/admin/config/navegacao`
- `/admin/config/notificacoes`
- `/admin/config/integracoes`

### API

- `/api/admin`
- `/api/users`
- `/api/audit-logs`
- `/api/quality`
- `/api/config`
- `/api/platform`

## Tabelas (Supabase)

- `profiles`
- `role_definitions`
- `admin_config`
- `audit_logs`

## Hooks

- `useUsers`
- `useRoles`
- `useAuditLogs`
- `usePermissions`
- `useNavigationConfig`
- `usePlatformConfig`
- `usePlatformBranding`
- `useNavigationExport`
- `useQualityDiagnostic`

## Componentes

- `NavigationEditor`

## Variaveis de Ambiente

Nenhuma variavel de ambiente requerida.

## Funcoes (Navegacao)

| ID                | Nome           | Subtitulo             | Caminho            | Categoria |
| ----------------- | -------------- | --------------------- | ------------------ | --------- |
| `admin-usuarios`  | Usuarios       | Gestao de usuarios    | `/admin/usuarios`  | CONTROLE  |
| `admin-roles`     | Perfis e Roles | Permissoes            | `/admin/roles`     | CONTROLE  |
| `admin-auditoria` | Auditoria      | Logs de acoes         | `/admin/auditoria` | CONTROLE  |
| `admin-config`    | Configuracoes  | Parametros do sistema | `/admin/config`    | CONFIG    |

---

_Gerado por `scripts/generate-module-docs.mjs` em 2026-04-13_
