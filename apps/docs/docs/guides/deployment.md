---
sidebar_position: 3
title: Deploy
---

# Deploy

## Ambientes

| Ambiente        | Descrição              | Trigger                |
| --------------- | ---------------------- | ---------------------- |
| **Development** | Local (Docker Compose) | `pnpm dev`             |
| **Staging**     | CI/CD automático       | Push para `develop`    |
| **Production**  | CI/CD com aprovação    | Push para `main` / tag |

## Frontend — Build de Produção

```bash
pnpm build  # Build packages + app
```

Output em `apps/web/dist/` — deploy como SPA estático (Nginx, Vercel, Netlify, S3+CloudFront).

## Backend — Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY api-template/ .
RUN pip install -r requirements.txt
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Infraestrutura

```bash
# Subir tudo local
docker-compose -f infra/docker-compose.yml up -d

# Migrations
pnpm db:migrate

# Seed
pnpm db:seed
```

## CI/CD (GitHub Actions)

Workflows em `.github/workflows/`:

| Workflow          | Trigger | O que faz                              |
| ----------------- | ------- | -------------------------------------- |
| `frontend-ci.yml` | Push/PR | Lint, typecheck, test, build, coverage |
| `backend-ci.yml`  | Push/PR | pytest, coverage                       |

## Checklist de Deploy

- [ ] Variáveis de ambiente configuradas (`.env`)
- [ ] `SECRET_KEY` e `CSRF_SECRET_KEY` definidos (não usar defaults)
- [ ] PostgreSQL e Redis acessíveis
- [ ] Keycloak realm configurado
- [ ] Migrations aplicadas (`pnpm db:migrate`)
- [ ] Build de produção sem erros (`pnpm build`)
- [ ] Testes passando (`pnpm test:all`)
