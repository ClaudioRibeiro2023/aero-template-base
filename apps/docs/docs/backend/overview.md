---
sidebar_position: 1
title: Visão Geral
---

# Backend — Visão Geral

## Stack

- **FastAPI** (async ASGI framework)
- **SQLAlchemy 2** (async ORM)
- **Alembic** (database migrations)
- **PostgreSQL** (banco de dados)
- **Redis** (cache + sessions)
- **Keycloak** (identity provider)
- **pytest** (test framework)

## Estrutura

```
api-template/
├── app/
│   ├── main.py              # App principal, middleware, CORS, routers
│   ├── auth.py              # JWT validation, RBAC, get_current_user
│   ├── cache.py             # RedisCache + MemoryCache + circuit breaker
│   ├── csrf.py              # CSRF middleware (double-submit cookie)
│   ├── security.py          # CSP + security headers middleware
│   ├── session.py           # Session store (Redis/Memory)
│   ├── rls.py               # Row-Level Security
│   ├── audit.py             # Audit logging
│   ├── admin_config.py      # White-label config store
│   ├── observability.py     # Sentry + MetricsStore + MetricsMiddleware
│   ├── models/
│   │   ├── base.py          # SQLAlchemy Base, AsyncSessionLocal, mixins
│   │   ├── task.py          # Task model
│   │   ├── tenant.py        # Tenant model
│   │   └── user.py          # User model
│   └── routers/
│       ├── tasks.py         # CRUD tasks
│       ├── users.py         # CRUD users
│       ├── file_upload.py   # File upload/download
│       ├── admin_config.py  # Admin config API
│       ├── feature_flags.py # Feature flags CRUD
│       └── ...
├── scripts/
│   └── seed.py              # Database seeding (async SQLAlchemy)
├── tests/                   # 845 testes pytest
├── requirements.txt         # Production deps
└── requirements-dev.txt     # Dev/test deps
```

## Rodando

```bash
# Development
cd api-template
uvicorn app.main:app --reload --port 8000

# Tests
python -m pytest tests/ -v --tb=short

# Seed
python scripts/seed.py          # Real DB
python scripts/seed.py --dry-run  # Preview mode
```

## Health Checks

| Endpoint               | Descrição                                      |
| ---------------------- | ---------------------------------------------- |
| `GET /health`          | Basic health check                             |
| `GET /health/detailed` | DB + Redis + Keycloak status, uptime, features |
