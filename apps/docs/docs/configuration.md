---
sidebar_position: 4
title: Configuração
---

# Configuração

## Variáveis de Ambiente

### Backend (api-template/.env)

| Variável                | Descrição                                | Default                                                          |
| ----------------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| `DATABASE_URL`          | PostgreSQL connection string             | `postgresql+asyncpg://template:template@localhost:5432/template` |
| `REDIS_URL`             | Redis connection                         | `redis://localhost:6379`                                         |
| `KEYCLOAK_URL`          | Keycloak base URL                        | `http://localhost:8080`                                          |
| `KEYCLOAK_REALM`        | Realm name                               | `template`                                                       |
| `KEYCLOAK_CLIENT_ID`    | OIDC client ID                           | `template-api`                                                   |
| `SECRET_KEY`            | JWT signing key                          | (obrigatório em produção)                                        |
| `CSRF_SECRET_KEY`       | CSRF token key                           | (obrigatório em produção)                                        |
| `ENVIRONMENT`           | `development` / `staging` / `production` | `development`                                                    |
| `ENABLE_RATE_LIMITING`  | Ativa rate limiting                      | `true`                                                           |
| `ENABLE_CSP`            | Ativa Content Security Policy            | `false`                                                          |
| `MAX_FILE_SIZE_MB`      | Tamanho máximo de upload                 | `10`                                                             |
| `MEMORY_CACHE_MAX_SIZE` | Max entries no MemoryCache               | `1000`                                                           |

### Frontend (apps/web/.env)

| Variável                  | Descrição             | Default                 |
| ------------------------- | --------------------- | ----------------------- |
| `VITE_API_URL`            | URL base da API       | `http://localhost:8000` |
| `VITE_KEYCLOAK_URL`       | Keycloak URL          | `http://localhost:8080` |
| `VITE_KEYCLOAK_REALM`     | Realm                 | `template`              |
| `VITE_KEYCLOAK_CLIENT_ID` | Client ID OIDC        | `template-web`          |
| `VITE_SENTRY_DSN`         | Sentry DSN (opcional) | —                       |

## Docker Compose

O arquivo `infra/docker-compose.yml` sobe os serviços:

| Serviço    | Porta | Descrição                |
| ---------- | ----- | ------------------------ |
| PostgreSQL | 5432  | Banco de dados principal |
| Redis      | 6379  | Cache + sessions         |
| Keycloak   | 8080  | Identity Provider (OIDC) |

## White-Label / Branding

A plataforma suporta configuração white-label via API admin:

```bash
# Obter config atual
curl http://localhost:8000/api/platform/public-config

# Atualizar branding (requer auth admin)
curl -X PATCH http://localhost:8000/api/admin/platform-config \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"branding": {"appName": "Meu Produto", "primaryColor": "#3b82f6"}}'
```

Veja mais em [Admin Config API](./api/admin-config).
