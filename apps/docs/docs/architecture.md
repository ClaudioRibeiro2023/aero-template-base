---
sidebar_position: 5
title: Arquitetura
---

# Arquitetura

## Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│  ┌─────────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ React SPA   │  │ SW/PWA   │  │ Supabase Auth     │  │
│  │ + TanStack  │  │ Offline  │  │ Auth Flow         │  │
│  └──────┬──────┘  └──────────┘  └───────────────────┘  │
└─────────┼───────────────────────────────────────────────┘
          │ REST API (JSON)
┌─────────▼───────────────────────────────────────────────┐
│              Next.js API Routes + Supabase                │
│  ┌────────┐ ┌─────────┐ ┌──────┐ ┌──────────────────┐  │
│  │ Auth   │ │ CSRF    │ │ CORS │ │ Rate Limiting    │  │
│  │ JWT    │ │ CSP     │ │      │ │ Metrics/Sentry   │  │
│  └────────┘ └─────────┘ └──────┘ └──────────────────┘  │
│  ┌─────────────────────────────────────────────────┐    │
│  │ API Routes: tasks, users, files, admin_config,  │    │
│  │             feature_flags, metrics, health       │    │
│  └──────────────────────┬──────────────────────────┘    │
│                         │                                │
│  ┌──────────────────────▼──────────────────────────┐    │
│  │ Supabase Client (PostgreSQL + RLS)              │    │
│  └──────────────────────┬──────────────────────────┘    │
└─────────────────────────┼───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│  Supabase (PostgreSQL + Auth + Storage + Realtime)      │
└─────────────────────────────────────────────────────────┘
```

## Princípios

1. **Multi-tenant by design** — Tenant isolation via RLS + middleware
2. **White-label** — Branding configurável por tenant via API
3. **Security-first** — CSRF, CSP, JWT, RBAC, rate limiting, audit log
4. **Observabilidade** — Sentry + métricas
5. **DX-first** — Hot reload, CLI scaffolding, Storybook, VSCode configs
6. **Testável** — Testes unitários + E2E

## Camadas do Frontend

| Camada         | Responsabilidade     | Tecnologia           |
| -------------- | -------------------- | -------------------- |
| **Pages**      | Rotas e layout       | React Router v6      |
| **Components** | UI reutilizável      | React + Tailwind     |
| **Hooks**      | Lógica compartilhada | Custom hooks         |
| **Services**   | API communication    | Axios + interceptors |
| **State**      | Server state         | TanStack Query v5    |
| **i18n**       | Internacionalização  | i18next              |
| **A11y**       | Acessibilidade       | WCAG 2.1 AA hooks    |

## Camadas do Backend

| Camada            | Responsabilidade             | Tecnologia                  |
| ----------------- | ---------------------------- | --------------------------- |
| **API Routes**    | Endpoints REST               | Next.js API Routes          |
| **Middleware**    | Auth, CSRF, CORS, Rate Limit | Next.js Middleware          |
| **Database**      | ORM + migrations             | Supabase (PostgreSQL + RLS) |
| **Auth**          | Autenticação e autorização   | Supabase Auth               |
| **Storage**       | Upload de arquivos           | Supabase Storage            |
| **Observability** | Logging, metrics, errors     | Sentry                      |
