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
│  │ React SPA   │  │ SW/PWA   │  │ Keycloak OIDC     │  │
│  │ + TanStack  │  │ Offline  │  │ Auth Flow         │  │
│  └──────┬──────┘  └──────────┘  └───────────────────┘  │
└─────────┼───────────────────────────────────────────────┘
          │ REST API (JSON)
┌─────────▼───────────────────────────────────────────────┐
│                    FastAPI Backend                        │
│  ┌────────┐ ┌─────────┐ ┌──────┐ ┌──────────────────┐  │
│  │ Auth   │ │ CSRF    │ │ CORS │ │ Rate Limiting    │  │
│  │ JWT    │ │ CSP     │ │      │ │ Metrics/Sentry   │  │
│  └────────┘ └─────────┘ └──────┘ └──────────────────┘  │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Routers: tasks, users, files, admin_config,     │    │
│  │          feature_flags, metrics, health          │    │
│  └──────────────────────┬──────────────────────────┘    │
│                         │                                │
│  ┌──────────────────────▼──────────────────────────┐    │
│  │ SQLAlchemy ORM (async) + Alembic Migrations     │    │
│  │ Models: Tenant, User, Task, AdminConfig, FF     │    │
│  └──────────────────────┬──────────────────────────┘    │
└─────────────────────────┼───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│  PostgreSQL  │  Redis (cache + sessions)  │  Keycloak   │
└─────────────────────────────────────────────────────────┘
```

## Princípios

1. **Multi-tenant by design** — Tenant isolation via RLS + middleware
2. **White-label** — Branding configurável por tenant via API
3. **Security-first** — CSRF, CSP, JWT, RBAC, rate limiting, audit log
4. **Cache resiliente** — Redis com circuit breaker + fallback Memory
5. **Observabilidade** — Sentry + Prometheus-style metrics
6. **DX-first** — Hot reload, CLI scaffolding, Storybook, VSCode configs
7. **Testável** — 1.613+ testes, 85% cobertura BE

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

| Camada            | Responsabilidade             | Tecnologia              |
| ----------------- | ---------------------------- | ----------------------- |
| **Routers**       | Endpoints REST               | FastAPI                 |
| **Middleware**    | Auth, CSRF, CORS, Rate Limit | Starlette               |
| **Models**        | ORM + migrations             | SQLAlchemy 2 + Alembic  |
| **Cache**         | Key-value store              | Redis + circuit breaker |
| **Sessions**      | Session management           | Redis / Memory          |
| **Security**      | Headers, CSP, HSTS           | Custom middleware       |
| **Observability** | Logging, metrics, errors     | Sentry + MetricsStore   |
