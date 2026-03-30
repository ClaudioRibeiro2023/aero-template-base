---
sidebar_position: 2
title: Início Rápido
---

# Início Rápido

## Pré-requisitos

- **Node.js** >= 18.x
- **pnpm** >= 9.x (`npm install -g pnpm`)
- **Python** >= 3.11
- **Docker** e **Docker Compose** (para PostgreSQL, Redis, Keycloak)

## 1. Clone e Instale

```bash
git clone https://github.com/seu-org/template-platform.git
cd template-platform
pnpm install
```

## 2. Configure o Ambiente

```bash
cp .env.example .env
```

Variáveis principais:

| Variável       | Descrição                    | Default                    |
| -------------- | ---------------------------- | -------------------------- |
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql+asyncpg://...` |
| `REDIS_URL`    | URL do Redis                 | `redis://localhost:6379`   |
| `KEYCLOAK_URL` | URL do Keycloak              | `http://localhost:8080`    |
| `VITE_API_URL` | URL da API para o frontend   | `http://localhost:8000`    |

## 3. Suba a Infraestrutura

```bash
docker-compose -f infra/docker-compose.yml up -d
```

Isso sobe: PostgreSQL, Redis e Keycloak.

## 4. Rode as Migrations e Seed

```bash
pnpm db:migrate
pnpm db:seed
```

## 5. Inicie o Desenvolvimento

```bash
# Terminal 1 — Backend
cd api-template && uvicorn app.main:app --reload

# Terminal 2 — Frontend
pnpm dev
```

- Frontend: http://localhost:5173
- API: http://localhost:8000
- API docs (Swagger): http://localhost:8000/docs
- Keycloak: http://localhost:8080

## 6. Scripts Úteis

| Comando                     | Descrição                           |
| --------------------------- | ----------------------------------- |
| `pnpm dev`                  | Inicia o frontend                   |
| `pnpm build`                | Build de produção (packages + app)  |
| `pnpm test:run`             | Roda todos os testes FE             |
| `pnpm test:backend`         | Roda testes BE (pytest)             |
| `pnpm test:all`             | FE + BE                             |
| `pnpm storybook`            | Abre o Storybook na porta 6006      |
| `pnpm e2e`                  | Testes E2E (Playwright)             |
| `pnpm create-module <name>` | Scaffold de novo módulo (FE + BE)   |
| `pnpm db:seed`              | Popula o banco com dados de exemplo |
| `pnpm db:reset`             | Reset completo do banco             |

## Próximos Passos

- [Estrutura do Projeto](./project-structure)
- [Arquitetura](./architecture)
- [Criando um Novo Módulo](./guides/new-module)
