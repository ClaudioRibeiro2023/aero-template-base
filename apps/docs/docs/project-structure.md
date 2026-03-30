---
sidebar_position: 3
title: Estrutura do Projeto
---

# Estrutura do Projeto

```
template-platform/
├── apps/
│   ├── web/                    # Aplicação React principal
│   │   ├── src/
│   │   │   ├── components/     # Componentes React
│   │   │   │   ├── common/     # ErrorBoundary, SkipLink, Toast, TenantSwitcher...
│   │   │   │   ├── forms/      # FormInput, FormSelect, FormTextarea, FileUpload
│   │   │   │   ├── layout/     # Sidebar, Header, MainLayout
│   │   │   │   └── pages/      # Páginas da aplicação
│   │   │   ├── hooks/          # Custom hooks (useA11y, useFileUpload, useWebSocket...)
│   │   │   ├── services/       # API clients (api-client, adminConfig, fileUpload)
│   │   │   ├── lib/            # Utilitários (sw-register, i18n)
│   │   │   ├── styles/         # CSS global + Tailwind
│   │   │   └── test/           # Setup de testes Vitest
│   │   ├── e2e/                # Testes Playwright E2E
│   │   └── public/             # Assets estáticos (manifest.json, sw.js, offline.html)
│   └── docs/                   # Portal Docusaurus (este site)
│
├── api-template/               # Backend FastAPI
│   ├── app/
│   │   ├── routers/            # Endpoints REST (tasks, users, files, admin_config...)
│   │   ├── models/             # SQLAlchemy ORM (Task, User, Tenant)
│   │   ├── main.py             # App principal + middleware + CORS
│   │   ├── auth.py             # JWT middleware + RBAC
│   │   ├── cache.py            # Redis/Memory cache + circuit breaker
│   │   ├── csrf.py             # CSRF protection
│   │   ├── security.py         # CSP + security headers
│   │   ├── observability.py    # Sentry + MetricsStore
│   │   └── session.py          # Session store (Redis/Memory)
│   ├── scripts/                # seed.py, migrations
│   ├── tests/                  # pytest test suite
│   └── requirements.txt        # Python dependencies
│
├── packages/
│   ├── shared/                 # Código compartilhado entre apps
│   ├── design-system/          # Componentes UI base + Storybook
│   └── types/                  # TypeScript shared types
│
├── infra/
│   ├── docker-compose.yml      # PostgreSQL + Redis + Keycloak
│   └── keycloak/               # Realm configs
│
├── scripts/                    # CLI scaffolding (new-module.js)
├── .github/workflows/          # CI/CD (GitHub Actions)
├── .vscode/                    # Configurações IDE
└── docs/                       # Documentação gerencial (MEGAPLAN, BACKLOG, CHECKLIST)
```

## Packages Workspace

O monorepo usa **pnpm workspaces**. Os packages são:

| Package                   | Path                     | Descrição                          |
| ------------------------- | ------------------------ | ---------------------------------- |
| `@template/web`           | `apps/web`               | Aplicação principal                |
| `@template/docs`          | `apps/docs`              | Portal de documentação             |
| `@template/shared`        | `packages/shared`        | Hooks, utils, tipos compartilhados |
| `@template/design-system` | `packages/design-system` | Componentes UI + Storybook         |
| `@template/types`         | `packages/types`         | TypeScript types compartilhados    |

## Convenções de Naming

- **Componentes**: PascalCase (`FileUpload.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useFileUpload.ts`)
- **Services**: camelCase (`fileUpload.ts`)
- **Testes**: mesmo nome + `.test.ts(x)` (`FileUpload.test.tsx`)
- **Stories**: mesmo nome + `.stories.tsx` (`FileUpload.stories.tsx`)
- **BE routers**: snake_case (`file_upload.py`)
- **BE tests**: prefixo `test_` (`test_file_upload.py`)
