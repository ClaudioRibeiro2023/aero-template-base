---
sidebar_position: 6
title: Multi-Tenancy
---

# Multi-Tenancy

## Modelo

A plataforma implementa **multi-tenancy via schema compartilhado** com isolamento por Row-Level Security (RLS).

Cada recurso (Task, User, Config) pertence a um **Tenant**, identificado por `tenant_id` (UUID).

## Fluxo

1. **Request chega** → `TenantMiddleware` extrai o tenant do header `X-Tenant-ID` ou do JWT
2. **RLS ativo** → Queries do SQLAlchemy filtram automaticamente por `tenant_id`
3. **Response** → Dados apenas do tenant correto

## Models

```python
class Tenant(Base, TimestampMixin):
    __tablename__ = "tenants"
    id = Column(UUID, primary_key=True, default=uuid4)
    name = Column(String(100), nullable=False)
    slug = Column(String(50), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    plan = Column(String(20), default="free")
```

## Frontend — TenantSwitcher

O componente `TenantSwitcher` permite alternar entre tenants (para admin multi-org):

```tsx
import { TenantSwitcher } from '@/components/common/TenantSwitcher'
;<TenantSwitcher tenants={tenants} currentTenant={current} onSwitch={handleSwitch} />
```

## Seed de Tenant

```bash
pnpm db:seed          # Cria tenant "default" + admin user + tasks
pnpm db:seed --dry-run  # Preview sem persistir
```
