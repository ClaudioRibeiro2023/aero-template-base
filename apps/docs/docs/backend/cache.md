---
sidebar_position: 4
title: Cache
---

# Cache

## Arquitetura

```
Request → cache.get(key) → Redis? → MemoryCache fallback
                              ↑
                    Circuit Breaker (se Redis indisponível)
```

## Implementações

| Classe           | Backend   | Descrição                                 |
| ---------------- | --------- | ----------------------------------------- |
| `RedisCache`     | Redis     | Cache async com circuit breaker           |
| `MemoryCache`    | In-memory | Fallback LRU (max 1000 entries)           |
| `create_cache()` | Factory   | Retorna Redis se disponível, senão Memory |

## Circuit Breaker

O `RedisCache` tem circuit breaker integrado:

- **Threshold**: 5 falhas consecutivas → circuit abre
- **Cooldown**: 30 segundos antes de tentar half-open
- **Half-open**: 1 probe request para testar se Redis voltou
- **Graceful defaults**: Quando circuit aberto, retorna `None`/`False`/`0`

## Uso

```python
from app.cache import create_cache, make_cache_key

cache = create_cache()

# Set
await cache.set("user:123", user_data, ttl=300)

# Get
data = await cache.get("user:123")

# Invalidate by prefix
await cache.invalidate_by_prefix("user:")

# Cache key helper
key = make_cache_key("tasks", tenant_id="abc", page=1)
```

## Configuração

| Env Var                 | Descrição                      | Default                  |
| ----------------------- | ------------------------------ | ------------------------ |
| `REDIS_URL`             | Redis connection string        | `redis://localhost:6379` |
| `MEMORY_CACHE_MAX_SIZE` | Max entries no MemoryCache LRU | `1000`                   |
