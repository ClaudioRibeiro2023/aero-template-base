---
sidebar_position: 2
title: Routers
---

# Routers (Endpoints)

## Registrados em main.py

| Router          | Prefix                        | Descrição                                     | Auth      |
| --------------- | ----------------------------- | --------------------------------------------- | --------- |
| `tasks`         | `/api/tasks`                  | CRUD de tasks                                 | JWT       |
| `users`         | `/api/users`                  | CRUD de usuários                              | JWT       |
| `file_upload`   | `/api/files`                  | Upload, metadata, list, delete, presigned URL | JWT       |
| `admin_config`  | `/api/admin`, `/api/platform` | Config white-label                            | ADMIN     |
| `feature_flags` | `/api/feature-flags`          | Feature flags CRUD                            | JWT/ADMIN |
| `metrics`       | `/metrics`                    | Prometheus-style metrics                      | ADMIN     |
| `health`        | `/health`                     | Health checks                                 | Público   |

## Padrão de Router

```python
from fastapi import APIRouter, Depends
from app.auth import get_current_user, require_roles

router = APIRouter(prefix="/api/example", tags=["example"])

@router.get("/")
async def list_items(user=Depends(get_current_user)):
    ...

@router.post("/")
async def create_item(data: ItemCreate, user=Depends(get_current_user)):
    ...

@router.get("/{item_id}")
async def get_item(item_id: str, user=Depends(get_current_user)):
    ...

@router.delete("/{item_id}")
async def delete_item(item_id: str, user=Depends(require_roles("ADMIN"))):
    ...
```

## Registrando Novo Router

```python
# app/main.py
from app.routers.example import router as example_router
app.include_router(example_router)
```
