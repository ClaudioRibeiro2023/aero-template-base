---
sidebar_position: 5
title: Observabilidade
---

# Observabilidade

## Componentes

| Componente            | Descrição                                   | Arquivo              |
| --------------------- | ------------------------------------------- | -------------------- |
| **Sentry**            | Error tracking + performance                | `observability.py`   |
| **MetricsStore**      | Prometheus-style counters/histograms/gauges | `observability.py`   |
| **MetricsMiddleware** | Auto-records request count + latency        | `observability.py`   |
| **Router `/metrics`** | GET snapshot, GET status, POST reset        | `routers/metrics.py` |

## Sentry

```python
from app.observability import setup_sentry, capture_exception

setup_sentry(dsn="https://...", environment="production")

try:
    ...
except Exception as e:
    capture_exception(e)
```

## MetricsStore

Thread-safe, in-memory Prometheus-style metrics:

```python
from app.observability import MetricsStore

store = MetricsStore()
store.increment("api_requests_total", labels={"method": "GET", "path": "/api/tasks"})
store.observe("api_latency_seconds", 0.045, labels={"path": "/api/tasks"})
store.set_gauge("active_connections", 42)

snapshot = store.snapshot()  # Dict com todas as métricas
```

## Endpoints

| Endpoint          | Method | Auth  | Descrição                                    |
| ----------------- | ------ | ----- | -------------------------------------------- |
| `/metrics`        | GET    | ADMIN | Snapshot de todas as métricas                |
| `/metrics/status` | GET    | ADMIN | Resumo (uptime, total requests, avg latency) |
| `/metrics/reset`  | POST   | ADMIN | Reset de todas as métricas                   |

## Configuração

| Env Var           | Descrição                                |
| ----------------- | ---------------------------------------- |
| `SENTRY_DSN`      | DSN do Sentry (backend)                  |
| `VITE_SENTRY_DSN` | DSN do Sentry (frontend)                 |
| `ENVIRONMENT`     | `development` / `staging` / `production` |
