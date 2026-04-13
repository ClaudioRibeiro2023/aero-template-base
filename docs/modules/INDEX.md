# Catalogo de Modulos

> Documentacao gerada automaticamente em 2026-04-13
> Total: **12 modulos** (10 ativos)

| #   | ID                                    | Nome                   | Categoria           | Versao | Status  | Dependencias        | Rotas |
| --- | ------------------------------------- | ---------------------- | ------------------- | ------ | ------- | ------------------- | ----- |
| 0   | [`auth`](./auth.md)                   | Autenticacao           | Core (sempre ativo) | 1.0.0  | Ativo   | -                   | 4     |
| 1   | [`dashboard`](./dashboard.md)         | Dashboard              | Padrao              | 1.0.0  | Ativo   | auth                | 3     |
| 2   | [`reports`](./reports.md)             | Relatorios             | Padrao              | 1.0.0  | Ativo   | auth                | 1     |
| 3   | [`tasks`](./tasks.md)                 | Tarefas                | Opcional            | 1.0.0  | Ativo   | auth                | 1     |
| 20  | [`support`](./support.md)             | Suporte                | Opcional            | 1.0.0  | Inativo | auth, notifications | 3     |
| 30  | [`admin`](./admin.md)                 | Administracao          | Core (sempre ativo) | 1.0.0  | Ativo   | auth                | 11    |
| 35  | [`feature-flags`](./feature-flags.md) | Feature Flags          | Opcional            | 1.0.0  | Ativo   | admin               | 1     |
| 40  | [`notifications`](./notifications.md) | Notificacoes           | Opcional            | 1.0.0  | Ativo   | auth                | 0     |
| 45  | [`organizations`](./organizations.md) | Organizacoes           | Opcional            | 1.0.0  | Inativo | auth                | 0     |
| 50  | [`settings`](./settings.md)           | Configuracoes Pessoais | Core (sempre ativo) | 1.0.0  | Ativo   | auth                | 3     |
| 90  | [`file-upload`](./file-upload.md)     | Upload de Arquivos     | utility             | 1.0.0  | Ativo   | auth                | 0     |
| 99  | [`search`](./search.md)               | Busca Global           | Core (sempre ativo) | 1.0.0  | Ativo   | auth                | 0     |

## Resumo por Categoria

### Core (sempre ativo)

4/4 ativos: `auth`, `admin`, `settings`, `search`

### Padrao

2/2 ativos: `dashboard`, `reports`

### Opcional

3/5 ativos: `tasks`, `support`, `feature-flags`, `notifications`, `organizations`

### utility

1/1 ativos: `file-upload`

## Grafo de Dependencias

```
auth --> dashboard
auth --> reports
auth --> tasks
auth --> support
notifications --> support
auth --> admin
admin --> feature-flags
auth --> notifications
auth --> organizations
auth --> settings
auth --> file-upload
auth --> search
```

---

_Gerado por `scripts/generate-module-docs.mjs`_
