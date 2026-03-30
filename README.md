# Template Base v2.0

> **Starter Template Corporativo** | Next.js 14 | Supabase | pnpm Monorepo | TypeScript

Template base para projetos internos da Aero Engenharia. Clone, configure e comece a desenvolver em minutos.

**[Demo Live](https://template.aeroeng.tech)** | **[Arquitetura](ARCHITECTURE.md)** | **[Changelog](CHANGELOG.md)**

---

## Stack

| Camada            | Tecnologia                             | Versao     |
| ----------------- | -------------------------------------- | ---------- |
| **Framework**     | Next.js (App Router)                   | 14.2       |
| **UI**            | React + TailwindCSS                    | 18.2 / 3.3 |
| **Linguagem**     | TypeScript (strict)                    | 5.3        |
| **Auth**          | Supabase Auth + Google OAuth           | 2.x        |
| **Banco**         | PostgreSQL via Supabase                | 15+        |
| **Monorepo**      | pnpm Workspaces                        | 9.x        |
| **Testes**        | Vitest + Testing Library               | 3.x        |
| **Design System** | Componentes compartilhados + Storybook | -          |
| **Deploy**        | Vercel                                 | -          |

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

O template suporta dois provedores de autenticacao:

| Provedor                   | Quando usar                                                            |
| -------------------------- | ---------------------------------------------------------------------- |
| **Supabase Auth** (padrao) | Projetos com Supabase. Login por email/senha, magic link, Google OAuth |
| **Keycloak** (opcional)    | Ambientes corporativos com OIDC/SAML existente                         |

### Sistema de Roles

4 niveis de acesso com middleware de protecao:

| Role       | Acesso                                   |
| ---------- | ---------------------------------------- |
| `ADMIN`    | Tudo, incluindo configuracoes do sistema |
| `GESTOR`   | Gestao de equipe e relatorios            |
| `OPERADOR` | Operacoes do dia a dia                   |
| `VIEWER`   | Somente leitura                          |

---

## Customizacao

### Branding via Variaveis de Ambiente

```env
NEXT_PUBLIC_APP_NAME=Minha Aplicacao
NEXT_PUBLIC_PRIMARY_COLOR=#14b8a6
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

## Seguranca

- **Row-Level Security** (RLS) no Supabase para multi-tenancy
- **Middleware** de autenticacao com verificacao de cookies
- **Security Headers**: HSTS, X-Frame-Options DENY, CSP, Referrer-Policy
- **Rate Limiting** em APIs sensiveis
- **Audit Logging** de acoes administrativas
- **Input Validation** com Zod schemas
- **DEMO_MODE** bloqueado em producao

---

## Licenca

Uso interno — Aero Engenharia &copy; 2026
