# Setup Local

> Guia completo para configurar o ambiente de desenvolvimento local.

---

## Pré-requisitos

| Ferramenta         | Versão Mínima           | Verificar                |
| ------------------ | ----------------------- | ------------------------ |
| **Node.js**        | 18.0.0                  | `node --version`         |
| **pnpm**           | 8.0.0 (recomendado 9.x) | `pnpm --version`         |
| **Docker**         | 20.10+                  | `docker --version`       |
| **Docker Compose** | 2.0+                    | `docker compose version` |
| **Git**            | 2.30+                   | `git --version`          |

### Instalar pnpm

```bash
# Via npm
npm install -g pnpm@9

# Via corepack (Node.js 16.13+)
corepack enable
corepack prepare pnpm@9.15.9 --activate
```

---

## Setup Rápido

### 1. Clonar o Repositório

```bash
git clone https://github.com/ClaudioRibeiro2023/Modelo.git template-platform
cd template-platform
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Subir Infraestrutura (Docker — opcional)

```bash
cd infra
docker compose up -d
```

Serviços iniciados:

- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

### 4. Iniciar Frontend

```bash
# Na raiz do projeto
pnpm dev
```

Acesse: **http://localhost:13000**

---

## Configuração por Ambiente

### Variáveis de Ambiente (Frontend)

Criar arquivo `apps/web/.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon

# Desenvolvimento
NEXT_PUBLIC_DEMO_MODE=true  # Bypass auth para dev rápido
```

### Variáveis Docker Compose

Copiar template:

```bash
cd infra
cp .env.example .env
```

Editar conforme necessário.

---

## Portas Utilizadas

| Serviço    | Porta | URL                    |
| ---------- | ----- | ---------------------- |
| Frontend   | 13000 | http://localhost:13000 |
| PostgreSQL | 5432  | -                      |
| Redis      | 6379  | -                      |
| Storybook  | 6006  | http://localhost:6006  |

---

## Modo Demo (Sem Autenticação)

Para desenvolver sem configurar Supabase:

```bash
NEXT_PUBLIC_DEMO_MODE=true pnpm dev
```

Usuário mock:

- **Email:** demo@template.com
- **Roles:** ADMIN, GESTOR, OPERADOR, VIEWER

---

## Scripts Disponíveis

### Root (pnpm)

```bash
pnpm dev          # Frontend em localhost:13000
pnpm build        # Build de produção
pnpm lint         # Lint (ESLint)
pnpm lint:fix     # Lint + fix
pnpm typecheck    # TypeScript check
pnpm test         # Testes unitários
pnpm test:e2e     # Testes E2E
pnpm format       # Prettier
pnpm clean        # Remove node_modules e dist
```

### Docker

```bash
cd infra

# Subir todos os serviços
docker compose up -d

# Ver logs
docker compose logs -f [service]

# Parar tudo
docker compose down

# Limpar volumes
docker compose down -v
```

---

## Verificação do Setup

### 1. Frontend

```bash
curl http://localhost:13000
# Deve retornar HTML
```

### 2. PostgreSQL

```bash
docker exec -it infra-db-1 psql -U template -d template -c "SELECT 1"
```

### 3. Redis

```bash
docker exec -it infra-redis-1 redis-cli ping
# PONG
```

---

## Troubleshooting

### pnpm install falha

```bash
# Limpar cache
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Porta em uso

```bash
# Windows
netstat -ano | findstr :13000
taskkill /PID <pid> /F

# Linux/Mac
lsof -i :13000
kill -9 <pid>
```

### Docker não sobe

```bash
# Verificar logs
docker compose logs

# Resetar containers
docker compose down -v
docker compose up -d
```

---

**Próximos passos:**

- [Deploy](./deploy.md)
- [Variáveis de Ambiente](./variaveis-ambiente.md)
