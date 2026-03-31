# Template Base v2.1

> **Starter Template Corporativo** | Next.js 14 | Supabase | pnpm Monorepo | TypeScript

Template base para projetos internos da Aero Engenharia. Clone, configure e comece a desenvolver em minutos.

**[Demo Live](https://template.aeroeng.tech)** | **[Arquitetura](ARCHITECTURE.md)** | **[Changelog](CHANGELOG.md)**

---

## Stack

| Camada            | Tecnologia                             | Versao     |
| ----------------- | -------------------------------------- | ---------- |
| **Framework**     | Next.js (App Router)                   | 14.2       |
| **UI**            | React + TailwindCSS                    | 18.2 / 3.3 |
| **Linguagem**     | TypeScript (strict)                    | 5.5+       |
| **Auth**          | Supabase Auth + Google OAuth           | 2.x        |
| **Banco**         | PostgreSQL via Supabase                | 15+        |
| **Monorepo**      | pnpm Workspaces                        | 9.x        |
| **Lint**          | ESLint 9 flat config                   | 9.x        |
| **Testes**        | Vitest + Testing Library               | 3.x        |
| **Design System** | Componentes compartilhados + Storybook | -          |
| **Deploy**        | Vercel (via GitHub Actions)            | -          |

---

## Inicio Rapido

```bash
# 1. Clone
git clone https://github.com/ClaudioRibeiro2023/aero-template-base.git
cd aero-template-base

# 2. Instale dependencias
pnpm install

# 3. Configure variaveis de ambiente
cp apps/web/.env.example apps/web/.env.local
# Edite .env.local com suas chaves Supabase

# 4. Inicie o servidor de desenvolvimento
pnpm dev
# Acesse http://localhost:3000
```

### Modo Demo (sem Supabase)

Para testar sem configurar Supabase, adicione ao `.env.local`:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

---

## Estrutura do Monorepo

```
template.base/
├── apps/
│   └── web/                    # Next.js 14 App Router
│       ├── app/                # Rotas (login, dashboard, etc.)
│       ├── components/         # Componentes da aplicacao
│       └── lib/                # Utilitarios (supabase, auth, etc.)
├── packages/
│   ├── types/                  # TypeScript types compartilhados
│   ├── shared/                 # Auth adapters, Supabase client, utils
│   └── design-system/          # UI components + Storybook
├── docs/                       # Documentacao tecnica
├── infra/                      # Docker Compose, Kubernetes
├── .github/workflows/          # CI/CD (lint, test, build, deploy)
├── vercel.json                 # Configuracao Vercel
└── package.json                # Scripts do monorepo
```

---

## Autenticacao

O template usa Supabase Auth como provedor padrão, com middleware baseado em `@supabase/ssr` para auto-refresh seguro de tokens via cookies HttpOnly.

| Metodo             | Suporte                                     |
| ------------------ | ------------------------------------------- |
| **Email/Senha**    | Login tradicional com validação Zod         |
| **Magic Link**     | Login sem senha via email                   |
| **Google OAuth**   | Login social com PKCE callback              |
| **Reset de Senha** | Rota `/api/auth/reset-password` padronizada |

### Sistema de Roles

4 niveis de acesso com middleware de protecao:

| Role       | Acesso                                   |
| ---------- | ---------------------------------------- |
| `ADMIN`    | Tudo, incluindo configuracoes do sistema |
| `GESTOR`   | Gestao de equipe e relatorios            |
| `OPERADOR` | Operacoes do dia a dia                   |
| `VIEWER`   | Somente leitura                          |

Auth guard disponivel em `lib/auth-guard.ts` com `requireAuth()` e `requireRole()` para protecao de API routes server-side.

---

## Customizacao

### Branding via Variaveis de Ambiente

```env
NEXT_PUBLIC_APP_NAME=Minha Aplicacao
NEXT_PUBLIC_PRIMARY_COLOR=#0087A8
NEXT_PUBLIC_SECONDARY_COLOR=#0e7490
NEXT_PUBLIC_LOGO_URL=/logo.svg
```

### Setup Wizard

```bash
pnpm setup
```

Configura nome do projeto, namespace, Supabase e branding interativamente.

### Criar Novo Modulo

```bash
pnpm create-module
```

Gera a estrutura de um novo modulo com CRUD, rotas e componentes.

---

## Deploy

### Vercel (Recomendado)

O projeto esta configurado para deploy automatico na Vercel:

1. Conecte o repositorio no Vercel Dashboard
2. Configure as variaveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_NAME`
3. Deploy automatico a cada push em `master`

### Docker

```bash
cd infra
cp .env.production.example .env.production
docker compose -f docker-compose.prod.yml up -d
```

Para mais detalhes, veja [docs/DEPLOY.md](docs/DEPLOY.md).

---

## Scripts

| Script               | Descricao                            |
| -------------------- | ------------------------------------ |
| `pnpm dev`           | Inicia o servidor de desenvolvimento |
| `pnpm build`         | Build de producao (packages + app)   |
| `pnpm lint`          | Executa ESLint                       |
| `pnpm format`        | Formata codigo com Prettier          |
| `pnpm typecheck`     | Verifica tipos TypeScript            |
| `pnpm test`          | Executa testes unitarios             |
| `pnpm storybook`     | Inicia Storybook do design system    |
| `pnpm db:migrate`    | Aplica migrations no Supabase        |
| `pnpm db:types`      | Gera tipos TypeScript do schema      |
| `pnpm clean`         | Remove node_modules e builds         |
| `pnpm setup`         | Wizard de configuracao inicial       |
| `pnpm create-module` | Gera estrutura de novo modulo        |

---

## Destaques v2.1

- **Middleware `@supabase/ssr`** — auto-refresh de tokens, sem parsing manual de cookies
- **4 migrations de seguranca** (00005–00008): RLS audit_logs, handle_new_user, FK RESTRICT, drop uuid-ossp
- **API response wrapper** padronizado (`ok`, `created`, `badRequest`, `unauthorized`, `forbidden`, etc.) em `lib/api-response.ts`
- **Auth guard** com `requireAuth()` e `requireRole()` em `lib/auth-guard.ts`
- **ESLint 9** flat config (`eslint.config.mjs`)
- **TypeScript 5.5+** com `verbatimModuleSyntax` e target ES2022
- **192 testes** em 10 arquivos, coverage threshold 60%
- **Deploy automatico Vercel** via GitHub Actions em push na `master`

## Seguranca

- **Row-Level Security** (RLS) no Supabase para multi-tenancy
- **Middleware** com `@supabase/ssr` (auto-refresh seguro via cookies HttpOnly)
- **Security Headers**: HSTS, X-Frame-Options DENY, CSP, Referrer-Policy
- **Rate Limiting** em APIs sensiveis (30 req/min admin, 60 req/min health)
- **Audit Logging** de acoes administrativas
- **Input Validation** com Zod schemas (7 schemas em `schemas/`)
- **DEMO_MODE** bloqueado em producao

---

## Licenca

Uso interno — Aero Engenharia &copy; 2026
