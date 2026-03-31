# 🗺️ Mapa do Repositório

> Documento gerado automaticamente. Última atualização: Março 2026 (Release 1.0)

Este documento mapeia a estrutura completa do repositório **Template Platform**, identificando arquivos centrais, dependências reais e pontos de integração.

---

## Estrutura de Diretórios

```
template-platform/
│
├── 📁 app/                            # Next.js App Router
│   ├── (auth)/                        # Grupo de rotas de autenticação
│   │   ├── login/page.tsx             # Página de login
│   │   └── register/page.tsx          # Página de registro
│   ├── (dashboard)/                   # Grupo de rotas do dashboard
│   │   ├── layout.tsx                 # Layout com sidebar
│   │   └── page.tsx                   # Dashboard principal
│   ├── api/                           # API Routes (Next.js)
│   │   ├── health/route.ts            # Health check
│   │   └── v1/                        # API v1 endpoints
│   ├── layout.tsx                     # Root layout
│   ├── page.tsx                       # Landing page
│   └── globals.css                    # Estilos globais (Tailwind)
│
├── 📁 components/                     # Componentes React
│   ├── ui/                            # Design system (Button, Input, Card, etc.)
│   ├── layout/                        # Header, Sidebar, Footer
│   ├── forms/                         # Componentes de formulário
│   └── data/                          # Tabelas, gráficos, cards de dados
│
├── 📁 lib/                            # Lógica compartilhada
│   ├── supabase/                      # Supabase client + server + types
│   │   ├── client.ts                  # Browser client
│   │   ├── server.ts                  # Server client (SSR)
│   │   └── types.ts                   # Tipos gerados do Supabase
│   ├── auth.ts                        # Autenticação (Supabase Auth)
│   ├── validations/                   # Schemas Zod
│   └── utils.ts                       # Helpers e formatters
│
├── 📁 types/                          # Tipos TypeScript
│   ├── database.ts                    # Tipos do banco de dados
│   └── index.ts                       # Barrel exports
│
├── 📁 supabase/                       # Supabase local
│   ├── config.toml                    # Config do Supabase CLI
│   └── migrations/                    # SQL migrations
│
├── 📁 public/                         # Assets estáticos
│
├── 📁 docs/                           # Documentação (~25 páginas)
│   ├── INDEX.md                       # Índice mestre
│   ├── MEGAPLAN-EVOLUCAO.md           # Plano mestre
│   ├── BACKLOG-V1.1.md                # Backlog consolidado
│   ├── TECHNICAL-DEBT.md              # Technical Debt Register
│   ├── DESIGN_SYSTEM.md               # Design system
│   ├── TROUBLESHOOTING.md             # Resolução de problemas
│   ├── arquitetura/                   # C4 Model diagrams
│   ├── contratos-integracao/          # Auth, API
│   ├── operacao/                      # Setup, deploy, env vars
│   ├── seguranca/                     # RBAC, headers
│   └── adr_v2/                        # Architecture Decision Records
│
├── 📁 scripts/                        # Scripts de automação
│   ├── new-module.js                  # Scaffolding de módulos
│   └── check-env.js                   # Validação de env vars
│
├── 📁 .github/                        # GitHub config
│   └── workflows/                     # CI/CD pipelines
│
├── 📄 package.json                    # Deps: next@14, react@18, tailwindcss@3
├── 📄 pnpm-lock.yaml                  # Lockfile
├── 📄 tsconfig.json                   # TypeScript config
├── 📄 next.config.mjs                 # Next.js config
├── 📄 tailwind.config.ts              # Tailwind config
├── 📄 postcss.config.js               # PostCSS config
├── 📄 .eslintrc.cjs                   # ESLint config
├── 📄 .prettierrc                     # Prettier config
├── 📄 README.md                       # Documentação principal
├── 📄 CONTRIBUTING.md                 # Guia de contribuição
└── 📄 CLAUDE.md                       # Instruções para agentes IA
```

---

## Arquivos Centrais (Source of Truth)

### Configuração do Projeto

| Arquivo           | Propósito         | Versão/Info                    |
| ----------------- | ----------------- | ------------------------------ |
| `package.json`    | Deps do projeto   | Next.js 14, React 18, pnpm 9.x |
| `tsconfig.json`   | TypeScript config | TS 5.3+, strict mode           |
| `next.config.mjs` | Next.js config    | App Router, Server Actions     |

### Frontend + Backend (Next.js)

| Arquivo              | Propósito       | Versão/Info                         |
| -------------------- | --------------- | ----------------------------------- |
| `package.json`       | Deps do projeto | Next.js 14, React 18, TailwindCSS 3 |
| `tailwind.config.ts` | Design tokens   | -                                   |
| `app/api/`           | API Routes      | Next.js Route Handlers              |
| `app/actions/`       | Server Actions  | Next.js Server Actions              |

### Autenticação

| Arquivo                  | Propósito      | Descrição                        |
| ------------------------ | -------------- | -------------------------------- |
| `lib/supabase/client.ts` | Browser client | Supabase client-side             |
| `lib/supabase/server.ts` | Server client  | Supabase SSR (cookies)           |
| `lib/auth.ts`            | Auth helpers   | Login, logout, roles, middleware |

### Banco de Dados

| Arquivo                 | Propósito     | Descrição                  |
| ----------------------- | ------------- | -------------------------- |
| `supabase/config.toml`  | Config local  | Supabase CLI config        |
| `supabase/migrations/`  | Migrations    | SQL migrations versionadas |
| `lib/supabase/types.ts` | Tipos gerados | Types do schema PostgreSQL |

---

## Dependências Reais (Confirmadas)

### Next.js + Supabase (package.json)

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "zod": "^3.22.0",
    "lucide-react": "^0.294.0",
    "tailwind-merge": "^2.1.0",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@playwright/test": "^1.56.1",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## Pontos de Integração

### URLs e Endpoints

| Serviço    | URL Local              | Descrição                   |
| ---------- | ---------------------- | --------------------------- |
| Next.js    | http://localhost:3000  | App (frontend + API routes) |
| Supabase   | http://localhost:54321 | Supabase local (CLI)        |
| PostgreSQL | localhost:54322        | Banco via Supabase CLI      |

### Endpoints da API (Next.js API Routes)

| Endpoint      | Método | Propósito            |
| ------------- | ------ | -------------------- |
| `/api/health` | GET    | Health check         |
| `/api/v1/...` | CRUD   | Endpoints de negócio |

### Autenticação (Supabase Auth)

| Funcionalidade     | Implementação                          |
| ------------------ | -------------------------------------- |
| Login/Registro     | Supabase Auth (email + password)       |
| Sessão             | Cookies gerenciados pelo @supabase/ssr |
| Middleware         | middleware.ts (refresh de sessão)      |
| Row Level Security | Policies no PostgreSQL via Supabase    |

---

## Variáveis de Ambiente

### Next.js + Supabase

| Variável                        | Default | Descrição                        |
| ------------------------------- | ------- | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | -       | URL do projeto Supabase          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | -       | Chave pública (anon) do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY`     | -       | Chave privada (server-side only) |
| `NEXT_PUBLIC_APP_URL`           | -       | URL pública da aplicação         |

---

## Scripts Disponíveis

### Desenvolvimento (pnpm)

```bash
pnpm install      # Instala dependências
pnpm dev          # Inicia Next.js em localhost:3000
pnpm build        # Build de produção
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check (tsc --noEmit)
pnpm test         # Testes unitários
pnpm test:e2e     # Testes E2E (Playwright)
```

### Supabase (CLI)

```bash
npx supabase start           # Inicia Supabase local
npx supabase db reset        # Reset + re-aplica migrations
npx supabase gen types ts    # Gera tipos TypeScript do schema
npx supabase migration new   # Cria nova migration
```

---

## Testes

### Cobertura Atual

| Tipo             | Localização          |
| ---------------- | -------------------- |
| Unit (Vitest)    | `**/*.test.{ts,tsx}` |
| E2E (Playwright) | `e2e/*.spec.ts`      |

### Categorias E2E

- `accessibility.spec.ts` - Landmarks, ARIA, contraste
- `forms.spec.ts` - Validação, UX de formulários
- `navigation.spec.ts` - Rotas, sidebar, deep links
- `performance.spec.ts` - LCP, cache, lazy loading
- `template.spec.ts` - Layout, responsividade, auth demo

---

_Documento gerado para servir como referência de integração. Atualizado em 2026-03-25 (Release 1.0)._
