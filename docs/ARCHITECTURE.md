# Arquitetura

Visão geral da arquitetura do Template.Base v2.0 — monorepo Supabase-first com Next.js 14.

## Stack Tecnológica

| Camada        | Tecnologia                          | Versão     |
| ------------- | ----------------------------------- | ---------- |
| Frontend      | Next.js 14 (App Router)             | 14.x       |
| UI            | React 18 + TailwindCSS 3            | 18.x / 3.x |
| Auth          | Supabase Auth + Keycloak (opcional) | 2.x        |
| Database      | Supabase PostgreSQL + RLS           | 15         |
| Realtime      | Supabase Realtime                   | 2.x        |
| Storage       | Supabase Storage                    | 2.x        |
| i18n          | react-i18next (pt-BR, en-US)        | 14.x       |
| Design System | @template/design-system             | 1.x        |
| Gerenciador   | pnpm workspaces                     | 9.x        |

## Estrutura do Monorepo

```
apps/
  web/                  # Aplicação Next.js 14 (App Router)
    app/                # Rotas e layouts (file-based routing)
    components/         # Componentes da aplicação
    contexts/           # React Contexts (auth, tenant, theme)
    hooks/              # Custom hooks
    i18n/               # Arquivos de tradução (pt-BR, en-US)
    lib/                # Utilitários da aplicação
    services/           # Camada de serviços (API calls)
    config/             # Configurações (navegação, módulos)
    middleware.ts       # Middleware Next.js (auth, i18n, tenant)

packages/
  types/                # TypeScript types compartilhados entre pacotes
  shared/               # Auth adapter, Supabase client, utilitários
  design-system/        # Componentes UI reutilizáveis + Storybook
```

## Diagrama de Camadas

```
┌──────────────────────────────────────────────┐
│            Next.js 14 (App Router)           │
│  ┌──────────┐ ┌───────────┐ ┌────────────┐  │
│  │  Pages   │ │API Routes │ │ Middleware  │  │
│  └────┬─────┘ └─────┬─────┘ └─────┬──────┘  │
│       └──────────────┼─────────────┘         │
│  ┌───────────────────┴────────────────────┐  │
│  │         @template/shared               │  │
│  │  ┌──────────┐ ┌─────────┐ ┌─────────┐ │  │
│  │  │AuthAdapter│ │Realtime │ │Storage  │ │  │
│  │  └────┬─────┘ └────┬────┘ └────┬────┘ │  │
│  └───────┼────────────┼───────────┼───────┘  │
└──────────┼────────────┼───────────┼──────────┘
           │            │           │
┌──────────┴────────────┴───────────┴──────────┐
│              Supabase Cloud                  │
│  ┌──────┐ ┌──────────┐ ┌────────┐ ┌───────┐ │
│  │ Auth │ │PostgreSQL│ │Realtime│ │Storage│ │
│  └──────┘ └──────────┘ └────────┘ └───────┘ │
└──────────────────────────────────────────────┘
```

## Autenticação — Padrão AuthAdapter

O template suporta dual provider via padrão adapter:

| Provider                     | Quando Usar                                       |
| ---------------------------- | ------------------------------------------------- |
| **Supabase Auth** (padrão)   | Projetos novos, auth simples (email/senha, OAuth) |
| **Keycloak OIDC** (opcional) | SSO corporativo, federação, MFA avançado          |

Configurável via `NEXT_PUBLIC_AUTH_PROVIDER` no `.env`. O `AuthAdapter` em `@template/shared` abstrai a diferença — componentes e páginas não precisam saber qual provider está ativo.

## Banco de Dados — Supabase PostgreSQL

### Migrations

4 migrations em `supabase/migrations/`:

| Migration                      | Conteúdo                                   |
| ------------------------------ | ------------------------------------------ |
| `00001_create_tenants.sql`     | Tabela de tenants com metadata JSONB       |
| `00002_create_profiles.sql`    | Perfis de usuário vinculados a tenants     |
| `00003_create_core_tables.sql` | Tabelas de negócio do template             |
| `00004_rls_policies.sql`       | Políticas RLS para isolamento multi-tenant |

### Multi-Tenancy via RLS

- Cada usuário pertence a um `tenant`
- JWT contém `tenant_id` como custom claim
- Políticas RLS filtram automaticamente por tenant
- Funções helper: `get_user_tenant_id()`, `get_user_role()`, `is_admin_or_gestor()`

## Realtime

Supabase Realtime habilitado para 3 canais:

- **Presence** — Status online/offline de usuários
- **Broadcast** — Notificações em tempo real
- **Postgres Changes** — Atualizações automáticas de dados na UI

## Storage

Supabase Storage com buckets pré-configurados:

- **avatars** — Fotos de perfil dos usuários (público)
- **attachments** — Arquivos anexados a registros (privado, RLS)
- **public** — Assets públicos (logos, imagens do tenant)

## Internacionalização (i18n)

- Biblioteca: `react-i18next`
- Idiomas padrão: pt-BR (primário) e en-US
- Detecção automática do idioma do navegador
- Arquivos de tradução em `apps/web/i18n/`
- Middleware configura o idioma no request

## Temas e Dark Mode

- CSS custom properties em `globals.css` para cores do branding
- Detecção automática de preferência do sistema (`prefers-color-scheme`)
- Toggle manual via `ThemeContext`
- Todos os componentes do design system suportam dark mode
