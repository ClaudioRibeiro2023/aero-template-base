# Template.Base — App Web

Base para geração de novas aplicações via Aero Studio Run Factory.

## Stack

- Next.js 14 (App Router) + TypeScript strict
- Supabase Auth (password + magic link + OAuth)
- Tailwind CSS + Design System (`@template/design-system`)
- React Query (TanStack) para data fetching
- Vitest + Playwright para testes
- next-intl (pt-BR, en-US, es)

## Estrutura Herdada

```
app/
├── login/            # Login completo (OAuth + password + magic link)
├── register/         # Registro com confirmação
├── auth/callback/    # OAuth callback
├── (protected)/      # Área autenticada
│   ├── dashboard/    # Dashboard principal
│   ├── tasks/        # CRUD de tarefas (exemplo)
│   ├── profile/      # Perfil + segurança
│   ├── settings/     # Configurações do usuário
│   ├── admin/        # Admin (usuarios, roles, config, auditoria)
│   └── relatorios/   # Relatórios
├── api/              # API routes (auth, CRUD, admin, health)
└── layout.tsx        # Root layout com i18n + providers
```

## O que JÁ vem pronto (NÃO recriar)

- Auth completo (login, register, forgot-password, logout, OAuth)
- RBAC granular (PermissionGate, usePermissions, 4 roles)
- 120+ hooks (auth, CRUD, a11y, performance, forms)
- Services layer (tasks, users, roles, audit, feature-flags)
- Zod schemas (auth, tasks, roles, admin)
- Error boundaries (4 níveis)
- Security (CSP, rate limiting, auth guard, audit log)
- i18n (3 idiomas)
- Theming (dark/light, CSS custom properties, gradientes configuráveis)
- Testing (Vitest + Playwright, 60% coverage threshold)

## Configuração por App (`.env`)

```env
NEXT_PUBLIC_APP_NAME=Nome da App
NEXT_PUBLIC_LOGO_URL=/aero-logo.png
NEXT_PUBLIC_GRADIENT_COLORS=#cores,do,gradiente,login
NEXT_PUBLIC_AMBIENT_COLOR_1=rgba(r,g,b,0.06)
NEXT_PUBLIC_AMBIENT_COLOR_2=rgba(r,g,b,0.04)
NEXT_PUBLIC_AMBIENT_COLOR_3=rgba(r,g,b,0.03)
```

## Regra para Agentes

**COPIAR e ADAPTAR. NUNCA recriar do zero.**
Consulte este diretório ANTES de criar qualquer arquivo.
