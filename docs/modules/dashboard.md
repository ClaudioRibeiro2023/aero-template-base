# Modulo: Dashboard

> **ID**: `dashboard` | **Versao**: 1.0.0 | **Categoria**: Padrao | **Status**: Ativo

Painel principal com KPIs, metricas, status e atividade recente

## Metadados

| Campo   | Valor        |
| ------- | ------------ |
| Icone   | `LayoutGrid` |
| Caminho | `/dashboard` |
| Ordem   | 1            |
| Grupo   | Principal    |
| Sidebar | Sim          |

## Dependencias

- [`auth`](./auth.md)

## Rotas

### Paginas

- `/dashboard`
- `/dashboard/analytics`
- `/dashboard/alertas`

### API

- `/api/dashboard`
- `/api/health`

## Tabelas (Supabase)

- `platform_metrics`

## Hooks

- `useHealthCheck`

## Componentes

- `DashboardClient`
- `DashboardKPICards`
- `DashboardCharts`

## Variaveis de Ambiente

Nenhuma variavel de ambiente requerida.

## Funcoes (Navegacao)

| ID                    | Nome        | Subtitulo                  | Caminho                | Categoria   |
| --------------------- | ----------- | -------------------------- | ---------------------- | ----------- |
| `dashboard-main`      | Visao Geral | KPIs e metricas principais | `/dashboard`           | INDICADORES |
| `dashboard-analytics` | Analytics   | Analises detalhadas        | `/dashboard/analytics` | ANALISE     |
| `dashboard-alerts`    | Alertas     | Notificacoes e watchlist   | `/dashboard/alertas`   | CONTROLE    |

---

_Gerado por `scripts/generate-module-docs.mjs` em 2026-04-13_
