---
sidebar_position: 2
title: Users API
---

# Users API

Base path: `/api/users`

## Endpoints

| Method   | Path              | Descrição                     | Auth               |
| -------- | ----------------- | ----------------------------- | ------------------ |
| `GET`    | `/api/users`      | Lista usuários do tenant      | JWT                |
| `POST`   | `/api/users`      | Cria novo usuário             | ADMIN              |
| `GET`    | `/api/users/{id}` | Obtém usuário por ID          | JWT                |
| `PUT`    | `/api/users/{id}` | Atualiza usuário              | JWT (self) / ADMIN |
| `DELETE` | `/api/users/{id}` | Remove usuário                | ADMIN              |
| `GET`    | `/api/users/me`   | Perfil do usuário autenticado | JWT                |

## Schemas

### UserCreate

```json
{
  "email": "user@example.com",
  "name": "João Silva",
  "keycloak_id": "kc-uuid",
  "department": "Engineering",
  "phone": "+55 11 99999-0000"
}
```

### UserResponse

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "João Silva",
  "avatar_url": null,
  "department": "Engineering",
  "is_active": true,
  "email_verified": true,
  "tenant_id": "uuid",
  "created_at": "2026-03-25T10:00:00Z"
}
```
