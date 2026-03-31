---
sidebar_position: 4
title: Configuração
---

# Configuração

## Variáveis de Ambiente

### Frontend (apps/web/.env)

| Variável                        | Descrição               | Default                           |
| ------------------------------- | ----------------------- | --------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL do projeto Supabase | `https://seu-projeto.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase  | (ver painel Supabase)             |
| `VITE_SENTRY_DSN`               | Sentry DSN (opcional)   | —                                 |

## Docker Compose

O arquivo `infra/docker-compose.yml` sobe os serviços auxiliares:

| Serviço    | Porta | Descrição            |
| ---------- | ----- | -------------------- |
| PostgreSQL | 5432  | Banco de dados local |
| Redis      | 6379  | Cache + sessions     |

## White-Label / Branding

A plataforma suporta configuração white-label via API admin:

```bash
# Obter config atual
curl http://localhost:3000/api/platform/public-config

# Atualizar branding (requer auth admin)
curl -X PATCH http://localhost:3000/api/admin/platform-config \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"branding": {"appName": "Meu Produto", "primaryColor": "#3b82f6"}}'
```

Veja mais em [Admin Config API](./api/admin-config).
