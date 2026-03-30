---
sidebar_position: 1
title: Visão Geral
---

# Frontend — Visão Geral

## Stack

- **React 18** + TypeScript 5.3
- **Vite 5** (build + HMR)
- **TailwindCSS 3** (estilização utility-first)
- **TanStack Query v5** (server state management)
- **React Router v6** (routing)
- **i18next** (internacionalização pt-BR + en-US)
- **Recharts** (gráficos interativos)
- **Vitest** + React Testing Library (testes unitários)
- **Playwright** (testes E2E)
- **Storybook 8.6** (design system docs)

## Estrutura

```
apps/web/src/
├── components/
│   ├── common/       # ErrorBoundary, SkipLink, Toast, TenantSwitcher, FirstRunWizard, Loading
│   ├── forms/        # FormInput, FormSelect, FormTextarea, FileUpload
│   ├── layout/       # Sidebar, Header, MainLayout
│   └── pages/        # Dashboard, Tasks, Settings, Admin...
├── hooks/            # useA11y, useFileUpload, useWebSocket, usePerformance, usePlatformConfig...
├── services/         # api-client, adminConfig, fileUpload
├── lib/              # sw-register, i18n config
├── styles/           # Tailwind + custom CSS
├── locales/          # Translation files (pt-BR, en-US)
└── test/             # Vitest setup
```

## Scripts

```bash
pnpm -C apps/web dev          # Dev server (porta 5173)
pnpm -C apps/web build        # Build de produção
pnpm -C apps/web test:run     # Testes unitários
pnpm -C apps/web test:e2e     # Testes E2E
pnpm -C apps/web storybook    # Storybook (porta 6006)
```

## Vite Config

O Vite está configurado com:

- **Chunk splitting** por biblioteca (react-vendor, query, router, auth, zod, axios)
- **Target** `es2020`
- **Path alias** `@/` → `src/`
- Build otimizado com tree-shaking automático
