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

## Backend — Next.js API Routes + Supabase

O backend utiliza Next.js API Routes com Supabase como banco de dados e autenticação. O deploy é feito junto com o frontend via Vercel ou plataforma equivalente.

## Infraestrutura

```bash
# Subir serviços auxiliares local
docker-compose -f infra/docker-compose.yml up -d

# Migrations (via Supabase CLI)
npx supabase db push
```

## CI/CD (GitHub Actions)

Workflows em `.github/workflows/`:

| Workflow          | Trigger | O que faz                              |
| ----------------- | ------- | -------------------------------------- |
| `frontend-ci.yml` | Push/PR | Lint, typecheck, test, build, coverage |

## Checklist de Deploy

- [ ] Variáveis de ambiente configuradas (`.env`)
- [ ] Supabase project configurado e acessível
- [ ] Migrations aplicadas (`npx supabase db push`)
- [ ] Build de produção sem erros (`pnpm build`)
- [ ] Testes passando (`pnpm test:all`)
