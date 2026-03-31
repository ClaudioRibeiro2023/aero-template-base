# Variáveis de Ambiente

> Referência completa de todas as variáveis de ambiente do Template Platform.

**Fonte:** `infra/.env.example`, `infra/.env.production.example`

---

## Frontend (Next.js)

Prefixo obrigatório: `NEXT_PUBLIC_`

| Variável                        | Tipo    | Default                  | Descrição                    |
| ------------------------------- | ------- | ------------------------ | ---------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | string  | —                        | URL do projeto Supabase      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | string  | —                        | Chave anon do Supabase       |
| `NEXT_PUBLIC_APP_URL`           | string  | `window.location.origin` | URL da aplicação             |
| `NEXT_PUBLIC_DEMO_MODE`         | boolean | `false`                  | Ativa bypass de autenticação |

### Exemplo `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_DEMO_MODE=true
```

---

## Backend (Next.js API Routes)

| Variável               | Tipo   | Default       | Obrigatório | Descrição                      |
| ---------------------- | ------ | ------------- | ----------- | ------------------------------ |
| `SUPABASE_URL`         | string | —             | Sim         | URL do projeto Supabase        |
| `SUPABASE_SERVICE_KEY` | string | —             | Sim (prod)  | Chave service_role do Supabase |
| `ENVIRONMENT`          | string | `development` | Não         | Ambiente atual                 |

### Rate Limiting

| Variável             | Default      | Descrição                  |
| -------------------- | ------------ | -------------------------- |
| `RATE_LIMIT_DEFAULT` | `100/minute` | Limite padrão              |
| `RATE_LIMIT_AUTH`    | `10/minute`  | Limite para auth endpoints |
| `RATE_LIMIT_API`     | `60/minute`  | Limite para API endpoints  |
| `RATE_LIMIT_HEALTH`  | `300/minute` | Limite para health checks  |

### Exemplo `.env`

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Environment
ENVIRONMENT=development

# Rate Limiting
RATE_LIMIT_DEFAULT=100/minute
```

---

## Infraestrutura (Docker Compose)

**Fonte:** `infra/.env.example`

### PostgreSQL

| Variável            | Default           | Descrição        |
| ------------------- | ----------------- | ---------------- |
| `POSTGRES_USER`     | `template`        | Usuário do banco |
| `POSTGRES_PASSWORD` | `template_secret` | Senha do banco   |
| `POSTGRES_DB`       | `template_db`     | Nome do database |
| `POSTGRES_PORT`     | `5432`            | Porta exposta    |

### Redis

| Variável         | Default | Descrição        |
| ---------------- | ------- | ---------------- |
| `REDIS_PORT`     | `6379`  | Porta exposta    |
| `REDIS_PASSWORD` | -       | Senha (opcional) |

### Compose

| Variável               | Default             | Descrição              |
| ---------------------- | ------------------- | ---------------------- |
| `COMPOSE_PROJECT_NAME` | `template-platform` | Nome do projeto Docker |

---

## Produção

**Fonte:** `infra/.env.production.example`

### Variáveis Críticas

```bash
# OBRIGATÓRIAS EM PRODUÇÃO

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Frontend
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
NEXT_PUBLIC_DEMO_MODE=false
```

### Checklist de Segurança

- [ ] `SUPABASE_SERVICE_KEY` definida (nunca expor no client)
- [ ] `NEXT_PUBLIC_DEMO_MODE=false`
- [ ] Variáveis sensíveis em secrets manager (não em arquivos)

---

## Kubernetes

### ConfigMap (não sensível)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: template-config
data:
  ENVIRONMENT: 'production'
  NEXT_PUBLIC_SUPABASE_URL: 'https://xxx.supabase.co'
```

### Secret (sensível)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: template-secrets
type: Opaque
stringData:
  SUPABASE_SERVICE_KEY: '<secret>'
```

### Uso no Deployment

```yaml
spec:
  containers:
    - name: web
      envFrom:
        - configMapRef:
            name: template-config
        - secretRef:
            name: template-secrets
```

---

## Validação

### Script de Verificação

```bash
#!/bin/bash
# check-env.sh

required_vars=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Missing: $var"
    exit 1
  fi
done

echo "All required variables set"
```

---

## Referência Rápida por Serviço

### API precisa de:

```bash
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=eyJ...
ENVIRONMENT=production
```

### Frontend precisa de:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Docker Compose precisa de:

```bash
POSTGRES_USER=...
POSTGRES_PASSWORD=...
```

---

**Arquivos relacionados:**

- `infra/.env.example`
- `infra/.env.production.example`
