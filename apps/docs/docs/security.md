---
sidebar_position: 8
title: Segurança
---

# Segurança

## Camadas de Proteção

| Camada            | Implementação                     | Arquivo       |
| ----------------- | --------------------------------- | ------------- |
| **Autenticação**  | JWT + Keycloak OIDC               | `auth.py`     |
| **Autorização**   | RBAC com `require_roles()`        | `auth.py`     |
| **CSRF**          | Double-submit cookie              | `csrf.py`     |
| **CSP**           | Content Security Policy builder   | `security.py` |
| **Headers**       | X-Frame, HSTS, Permissions-Policy | `security.py` |
| **Rate Limiting** | Por IP/endpoint                   | `main.py`     |
| **RLS**           | Row-Level Security por tenant     | `rls.py`      |
| **Audit Log**     | Registro de operações sensíveis   | `audit.py`    |
| **Sessions**      | Redis-backed session store        | `session.py`  |

## CSRF Protection

```python
# Automático via middleware — protege POST, PUT, PATCH, DELETE
# Token obtido via:
GET /api/csrf-token → { "csrf_token": "..." }
```

## Content Security Policy

```python
csp = CSPBuilder()
csp.add_directive("default-src", "'self'")
csp.add_directive("script-src", "'self'")
csp.add_directive("style-src", "'self' 'unsafe-inline'")
```

## Rate Limiting

- Configurável via `ENABLE_RATE_LIMITING` env var
- Limites por endpoint e por IP
- Headers `X-RateLimit-*` na response

## Audit Logging

Operações sensíveis (login, config changes, data mutations) são registradas com:

- `user_id`, `tenant_id`, `action`, `resource`, `timestamp`, `ip_address`
