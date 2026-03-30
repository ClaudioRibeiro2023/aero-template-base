# Arquitetura — Template Base v2.0

## Decisoes Arquiteturais

| Decisao              | Escolha                             | Justificativa                                                    |
| -------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| Framework            | Next.js 14 (App Router)             | SSR/SSG, API routes, middleware nativo                           |
| Backend-as-a-Service | Supabase                            | Auth, DB, RLS, Realtime sem servidor proprio                     |
| Monorepo             | pnpm Workspaces                     | Compartilhamento de tipos, design system, auth adapters          |
| Auth                 | Supabase Auth + Keycloak (opcional) | Flexibilidade: SaaS para projetos simples, OIDC para corporativo |
| Estilizacao          | TailwindCSS                         | Utility-first, sem CSS-in-JS runtime, design tokens              |
| Validacao            | Zod                                 | Runtime type-checking, integracao com react-hook-form            |

---

## Diagrama de Camadas

```
┌─────────────────────────────────────────────┐
│                   Browser                    │
├─────────────────────────────────────────────┤
│              Next.js App Router              │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Login   │ │Dashboard │ │  Modulos     │  │
│  │ (public) │ │(protegido│ │ (protegido)  │  │
│  └─────────┘ └──────────┘ └──────────────┘  │
├─────────────────────────────────────────────┤
│              Middleware Layer                 │
│  Auth Check → Role Guard → Rate Limit        │
├─────────────────────────────────────────────┤
│           Shared Packages Layer              │
│  ┌────────┐ ┌─────────┐ ┌──────────────┐   │
│  │ types  │ │ shared  │ │ design-system│   │
│  │(TS defs)│ │(auth,   │ │(UI components│   │
│  │        │ │ supabase│ │ + Storybook) │   │
│  └────────┘ └─────────┘ └──────────────┘   │
├─────────────────────────────────────────────┤
│              Supabase Cloud                  │
│  ┌────────┐ ┌─────────┐ ┌──────────────┐   │
│  │  Auth  │ │PostgreSQL│ │  Storage     │   │
│  │(JWT +  │ │(+ RLS)  │ │  (arquivos)  │   │
│  │ OAuth) │ │         │ │              │   │
│  └────────┘ └─────────┘ └──────────────┘   │
└─────────────────────────────────────────────┘
```

---

## Build Pipeline

A ordem de build respeita dependencias entre packages:

```
1. @template/types        →  TypeScript definitions
2. @template/shared       →  Auth adapters, Supabase client (depende de types)
3. @template/design-system →  UI components (depende de types + shared)
4. @template/web          →  Next.js app (depende de todos acima)
```

Orquestrado pelo script `build` no root `package.json`:

```
pnpm run build:packages && pnpm run build:app
```

---

## Fluxo de Autenticacao

```
Browser                    Next.js                     Supabase
   │                          │                            │
   │  POST /login             │                            │
   │ (email + senha)          │                            │
   │─────────────────────────>│                            │
   │                          │  signInWithPassword()      │
   │                          │───────────────────────────>│
   │                          │         JWT + refresh      │
   │                          │<───────────────────────────│
   │     Set-Cookie           │                            │
   │  (sb-access-token)       │                            │
   │<─────────────────────────│                            │
   │                          │                            │
   │  GET /dashboard          │                            │
   │─────────────────────────>│                            │
   │                          │  middleware.ts:             │
   │                          │  1. Ler cookie              │
   │                          │  2. Verificar JWT           │
   │                          │  3. Checar role             │
   │                          │  4. Permitir/Redirecionar   │
   │     200 OK               │                            │
   │<─────────────────────────│                            │
```

### Provedores suportados

- **Email/Senha** — Login direto com Supabase Auth
- **Magic Link** — Link de acesso por email (OTP)
- **Google OAuth** — SSO via Google
- **Keycloak** — OIDC para ambientes corporativos (opcional)

---

## Seguranca

### Camadas de Protecao

| Camada     | Implementacao               | Arquivo                      |
| ---------- | --------------------------- | ---------------------------- |
| Transport  | HSTS, TLS 1.3               | `next.config.js` (headers)   |
| Auth       | JWT + Cookie httpOnly       | `packages/shared/src/auth/`  |
| Middleware | Role-based access control   | `apps/web/middleware.ts`     |
| API        | Rate limiting, Bearer token | `apps/web/lib/rate-limit.ts` |
| Database   | Row-Level Security (RLS)    | Supabase policies            |
| Input      | Zod schema validation       | Per-route validation         |
| Audit      | Event logging               | `apps/web/lib/audit.ts`      |

### Security Headers (next.config.js)

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## Infraestrutura

### Producao (Vercel)

```
Vercel Edge Network
  └── Next.js App (SSR + Static)
        └── Supabase Cloud (sa-east-1)
              ├── PostgreSQL 15
              ├── Auth (GoTrue)
              └── Storage (S3)
```

### Producao (Self-Hosted)

```
Traefik 3.0 (TLS + Reverse Proxy)
  ├── Next.js Container (port 3000)
  ├── Keycloak Container (port 8080)
  ├── PostgreSQL Container (port 5432)
  └── Redis Container (port 6379)
```

Configuracoes em `infra/docker-compose.prod.yml`.

---

## CI/CD

| Workflow          | Trigger                 | Acoes                           |
| ----------------- | ----------------------- | ------------------------------- |
| `ci.yml`          | Push, PR                | Lint + Typecheck + Test + Build |
| `frontend-ci.yml` | Mudancas em `apps/web/` | Lint + Test + Build + E2E       |
| `docker.yml`      | Push em master, tags    | Build + Push GHCR               |

### Vercel Auto-Deploy

- Push em `master` → Deploy automatico
- PRs → Preview deployment (desabilitado para branches nao-master)
