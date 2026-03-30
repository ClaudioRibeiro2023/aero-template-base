---
sidebar_position: 7
title: Autenticação
---

# Autenticação

## Stack

- **Keycloak** como Identity Provider (OIDC/OAuth2)
- **oidc-client-ts** no frontend para fluxo Authorization Code + PKCE
- **JWT middleware** no backend para validação de tokens
- **RBAC** com roles extraídas do token Keycloak

## Fluxo

```
Browser → Keycloak (login) → JWT token → API (validate + extract roles)
```

1. Usuário clica "Login" → redirect para Keycloak
2. Keycloak autentica → retorna `access_token` + `refresh_token`
3. Frontend armazena tokens → envia `Authorization: Bearer <token>` em cada request
4. Backend `auth.py` valida JWT → extrai `user_id`, `tenant_id`, `roles`
5. `ProtectedRoute` no frontend bloqueia acesso a rotas sem autenticação

## Backend — JWT Middleware

```python
from app.auth import get_current_user, require_roles

@router.get("/admin/config")
async def get_config(user = Depends(require_roles("ADMIN"))):
    ...
```

## Frontend — ProtectedRoute

```tsx
<ProtectedRoute requiredRoles={['ADMIN']}>
  <AdminPage />
</ProtectedRoute>
```

## CSRF Protection

- Double-submit cookie pattern via `CSRFMiddleware`
- Token endpoint: `GET /api/csrf-token`
- Validação automática em requests mutantes (POST, PUT, PATCH, DELETE)

## Security Headers

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security` (em produção)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
