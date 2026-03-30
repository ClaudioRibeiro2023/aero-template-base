---
slug: /
sidebar_position: 1
title: Template Platform
---

# Template Platform

> Plataforma base para produtos corporativos — multi-tenant, white-label, extensível.

## O que é?

Template Platform é um **monorepo starter** projetado como fundação para múltiplos produtos SaaS corporativos. Inclui toda a infraestrutura de autenticação, multi-tenancy, white-label, observabilidade e DX pronta para uso.

## Números da Plataforma

| Métrica               | Valor                    |
| --------------------- | ------------------------ |
| **Testes totais**     | 1.613+ (845 BE + 768 FE) |
| **Cobertura BE**      | 85%+                     |
| **Storybook stories** | 77+                      |
| **Sprints entregues** | 37                       |
| **Dívidas técnicas**  | 0 pendentes              |

## Stack Tecnológica

| Camada            | Tecnologia                                 |
| ----------------- | ------------------------------------------ |
| **Frontend**      | React 18 + TypeScript + Vite + TailwindCSS |
| **Estado**        | TanStack Query v5                          |
| **Backend**       | FastAPI + SQLAlchemy + Alembic             |
| **Auth**          | Keycloak + OIDC + JWT                      |
| **Cache**         | Redis (com circuit breaker)                |
| **Infra**         | Docker Compose + GitHub Actions            |
| **i18n**          | i18next (pt-BR + en-US)                    |
| **Testes**        | Vitest + Playwright + pytest               |
| **Design System** | Custom + Storybook 8.6                     |
| **PWA**           | Service Worker + Offline fallback          |

## Início Rápido

```bash
git clone https://github.com/seu-org/template-platform.git
cd template-platform
pnpm install
pnpm dev
```

Veja o guia completo em [Getting Started](./getting-started).
