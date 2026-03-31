# Arquitetura

Visão geral da arquitetura do Template.Base v2.1 — monorepo Supabase-first com Next.js 14.

## Stack Tecnológica

| Camada        | Tecnologia                    | Versão     |
| ------------- | ----------------------------- | ---------- |
| Frontend      | Next.js 14 (App Router)       | 14.x       |
| UI            | React 18 + TailwindCSS 3      | 18.x / 3.x |
| Auth          | Supabase Auth + @supabase/ssr | 2.x        |
| Database      | Supabase PostgreSQL + RLS     | 15         |
| Realtime      | Supabase Realtime             | 2.x        |
| Storage       | Supabase Storage              | 2.x        |
| i18n          | react-i18next (pt-BR, en-US)  | 14.x       |
| Design System | @template/design-system       | 1.x        |
| Gerenciador   | pnpm workspaces               | 9.x        |

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

## Autenticação — Supabase Auth + @supabase/ssr

O template usa Supabase Auth como provider exclusivo, com o cliente server-side criado via `createServerClient` do pacote `@supabase/ssr`.

### Fluxo de Autenticação

```
Browser → middleware.ts (createServerClient) → verifica cookies HttpOnly
                   ↓
        Token válido? → continua request
        Token expirado? → auto-refresh transparente
        Sem token? → redirect para /login
```

### Benefícios do @supabase/ssr

- Auto-refresh de tokens sem código manual
- Cookies HttpOnly gerenciados pelo Next.js
- Sem exposição do token no JavaScript do cliente
- Compatível com Edge Runtime e Node.js

### Auth Guard em API Routes

Todas as API routes protegidas usam helpers de `lib/auth-guard.ts`:

```ts
import { requireAuth, requireRole } from '@/lib/auth-guard'

// Requer apenas autenticação:
const user = await requireAuth(request)

// Requer role específica:
const user = await requireRole(request, 'ADMIN')
```

### Helpers de Resposta — lib/api-response.ts

9 helpers padronizados para API routes:

| Helper            | Status HTTP | Uso                           |
| ----------------- | ----------- | ----------------------------- |
| `ok(data)`        | 200         | Sucesso com dados             |
| `created(data)`   | 201         | Recurso criado                |
| `noContent()`     | 204         | Sucesso sem dados             |
| `badRequest(msg)` | 400         | Dados inválidos               |
| `unauthorized()`  | 401         | Não autenticado               |
| `forbidden()`     | 403         | Sem permissão (role)          |
| `notFound(msg)`   | 404         | Recurso não encontrado        |
| `conflict(msg)`   | 409         | Conflito de estado            |
| `serverError(e)`  | 500         | Erro interno (log automático) |

## Banco de Dados — Supabase PostgreSQL

### Migrations

8 migrations em `supabase/migrations/`:

| Migration                      | Conteúdo                                        |
| ------------------------------ | ----------------------------------------------- |
| `00001_create_tenants.sql`     | Tabela de tenants com metadata JSONB            |
| `00002_create_profiles.sql`    | Perfis de usuário vinculados a tenants          |
| `00003_create_core_tables.sql` | Tabelas de negócio do template                  |
| `00004_rls_policies.sql`       | Políticas RLS para isolamento multi-tenant      |
| `00005_audit_logs_rls.sql`     | RLS em audit_logs (isolamento por tenant)       |
| `00006_handle_new_user.sql`    | Trigger auto-criação de profile no signup       |
| `00007_fk_restrict.sql`        | FK RESTRICT para integridade referencial        |
| `00008_drop_uuid_ossp.sql`     | Remove extensão uuid-ossp (usa gen_random_uuid) |

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
