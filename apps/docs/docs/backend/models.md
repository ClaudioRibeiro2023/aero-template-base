---
sidebar_position: 3
title: Models
---

> **NOTA:** Este documento refere-se ao backend FastAPI (v1.x), que foi substituido por Next.js API Routes + Supabase na v2.0. Mantido como referencia historica.

# Models (SQLAlchemy ORM)

## Base

Todos os models herdam de `Base` com mixins opcionais:

```python
from app.models.base import Base, TimestampMixin, SoftDeleteMixin

class MyModel(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "my_models"
    ...
```

- **TimestampMixin**: `created_at`, `updated_at` automáticos
- **SoftDeleteMixin**: `deleted_at` para soft-delete

## Tenant

```python
class Tenant(Base, TimestampMixin):
    id: UUID (PK)
    name: str(100)
    slug: str(50) UNIQUE
    description: str (optional)
    is_active: bool (default True)
    plan: str(20) (default "free")
```

## User

```python
class User(Base, TimestampMixin):
    id: UUID (PK)
    keycloak_id: str UNIQUE
    email: str UNIQUE
    name: str
    avatar_url: str (optional)
    phone: str (optional)
    department: str (optional)
    is_active: bool (default True)
    email_verified: bool (default False)
    tenant_id: UUID (FK → tenants.id)
```

## Task

```python
class Task(Base, TimestampMixin):
    id: UUID (PK)
    title: str(200)
    description: str (optional)
    status: TaskStatus (enum: pending, in_progress, completed, cancelled)
    priority: TaskPriority (enum: low, medium, high, urgent)
    tenant_id: UUID (FK → tenants.id)
    assigned_to: UUID (FK → users.id, optional)
```

## Migrations

```bash
# Criar nova migration
cd api-template && python -m alembic revision --autogenerate -m "add_new_table"

# Aplicar
pnpm db:migrate

# Rollback
pnpm db:migrate:down
```
