# C4 Model - Nível 3: Component Diagram

> Visão dos componentes internos dos principais containers.

## Next.js App - Components

```mermaid
C4Component
    title Component Diagram - Next.js App

    Container_Boundary(app, "Next.js App") {
        Component(router, "App Router", "Next.js 14", "Roteamento file-based e layouts")
        Component(authMiddleware, "Auth Middleware", "@supabase/ssr", "Validação de sessão e refresh de tokens")
        Component(serverActions, "Server Actions", "Next.js", "Mutações server-side")
        Component(apiRoutes, "API Routes", "Next.js Route Handlers", "Endpoints REST")
        Component(pages, "Pages", "React Server Components", "Páginas da aplicação")
        Component(modules, "Modules", "React Components", "Módulos de features")
        Component(designSystem, "Design System", "Tailwind CSS", "Componentes UI reutilizáveis")
        Component(supabaseClient, "Supabase Client", "@supabase/ssr", "Comunicação com Supabase")
    }

    System_Ext(supabase, "Supabase", "Auth + Database + Realtime")

    Rel(router, pages, "Renderiza")
    Rel(pages, modules, "Usa")
    Rel(pages, designSystem, "Usa")
    Rel(authMiddleware, supabaseClient, "Valida sessão")
    Rel(supabaseClient, supabase, "Queries + Auth", "HTTPS")
    Rel(serverActions, supabaseClient, "Mutações")
    Rel(apiRoutes, supabaseClient, "Data fetching")
```

### Estrutura de Componentes

```
apps/web/
├── app/                        # App Router (Next.js 14)
│   ├── (auth)/                 # Rotas de autenticação
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/            # Rotas protegidas
│   │   ├── layout.tsx
│   │   └── ...pages
│   ├── api/                    # API Route Handlers
│   │   ├── health/route.ts
│   │   └── ...
│   ├── actions/                # Server Actions
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
│
├── components/                  # Componentes da app
│   ├── layout/                 # Header, Sidebar, Footer
│   ├── ui/                     # Design system components
│   └── forms/                  # Form components
│
├── hooks/                       # Custom hooks
│   ├── useHealthCheck.ts
│   └── ...
│
├── lib/                         # Utilitários
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Auth middleware helper
│   ├── validations/            # Zod schemas
│   └── utils.ts
│
└── types/                       # TypeScript types
    └── database.ts             # Supabase generated types
```

### Packages Compartilhados

```
packages/
├── shared/src/
│   ├── auth/
│   │   ├── types.ts             # UserRole, AuthUser
│   │   └── index.ts             # Exports
│   │
│   ├── api/
│   │   └── client.ts            # Supabase client helpers
│   │
│   ├── cache/
│   │   └── queryClient.ts       # React Query config
│   │
│   └── utils/
│       ├── logger.ts            # Structured logging
│       ├── formatters.ts        # Date, currency, etc.
│       └── helpers.ts           # Utilidades gerais
│
├── design-system/src/
│   ├── components/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Card/
│   │   ├── Table/
│   │   └── ...
│   │
│   ├── tokens/
│   │   └── colors.ts, spacing.ts, typography.ts
│   │
│   └── styles/
│       └── base.css
│
└── types/src/
    ├── api.ts                   # API response types
    ├── auth.ts                  # Auth types
    └── common.ts                # Generic types
```

---

## Fluxo de Request (API Routes)

```mermaid
sequenceDiagram
    participant C as Client
    participant M as Middleware
    participant R as API Route Handler
    participant S as Server Action
    participant DB as Supabase

    C->>M: HTTP Request
    M->>M: Refresh session (supabase.auth)
    M->>M: Check auth (redirect if unauthenticated)

    alt API Route
        M->>R: Forward request
        R->>R: Validate input (Zod)
        R->>DB: Query via Supabase client (RLS applied)
        DB-->>R: Result
        R-->>C: JSON Response
    else Server Action
        M->>S: Forward action
        S->>S: Validate input (Zod)
        S->>DB: Mutate via Supabase client (RLS applied)
        DB-->>S: Result
        S-->>C: Revalidate + Response
    end
```

---

## Decisões de Design

### Frontend / Full-stack

| Decisão                   | Razão                                  |
| ------------------------- | -------------------------------------- |
| Next.js App Router        | SSR, RSC, layouts aninhados, streaming |
| Supabase Auth             | Auth integrada com RLS, zero server    |
| Server Actions            | Mutações tipadas, sem API boilerplate  |
| TanStack Query para cache | Cache automático, refetch, mutations   |
| Tailwind + Design Tokens  | Consistência, customização fácil       |
| Zod para validação        | Runtime + compile-time type safety     |

### Database / Auth

| Decisão               | Razão                                     |
| --------------------- | ----------------------------------------- |
| Supabase (PostgreSQL) | Managed, RLS nativo, realtime, storage    |
| Row-Level Security    | Multi-tenancy seguro sem middleware       |
| JWT via Supabase      | Stateless, auto-refresh via @supabase/ssr |

---

**Referências:**

- [C4 Model](https://c4model.com/)
- [Mermaid C4](https://mermaid.js.org/syntax/c4.html)
