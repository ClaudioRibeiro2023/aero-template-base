---
sidebar_position: 5
title: Feature Flags API
---

# Feature Flags API

Base path: `/api/feature-flags`

## Endpoints

| Method   | Path                       | Descrição                      | Auth  |
| -------- | -------------------------- | ------------------------------ | ----- |
| `GET`    | `/api/feature-flags`       | Lista feature flags do tenant  | JWT   |
| `POST`   | `/api/feature-flags`       | Cria nova flag                 | ADMIN |
| `GET`    | `/api/feature-flags/{key}` | Obtém flag por key             | JWT   |
| `PATCH`  | `/api/feature-flags/{key}` | Atualiza flag (enable/disable) | ADMIN |
| `DELETE` | `/api/feature-flags/{key}` | Remove flag                    | ADMIN |

## Schema

```json
{
  "key": "new-dashboard",
  "description": "Habilitar novo dashboard com Recharts",
  "enabled": true,
  "tenant_id": "uuid",
  "created_at": "2026-03-25T10:00:00Z"
}
```

## Uso no Frontend

```tsx
// Verificar flag no frontend via API
const { data: flags } = useQuery({
  queryKey: ['feature-flags'],
  queryFn: () => api.get('/api/feature-flags'),
})

const isNewDashboard = flags?.find(f => f.key === 'new-dashboard')?.enabled
```

## Uso no Backend

```python
from app.routers.feature_flags import get_flag

flag = await get_flag("new-dashboard", tenant_id)
if flag and flag.enabled:
    return new_dashboard_data()
```
