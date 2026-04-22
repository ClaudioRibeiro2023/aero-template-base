-- Migration: Observability Module Tables

-- Métricas da aplicação
CREATE TABLE IF NOT EXISTS app_metrics (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  value      NUMERIC NOT NULL,
  labels     JSONB NOT NULL DEFAULT '{}',
  period     TEXT NOT NULL DEFAULT '1h',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Logs da aplicação
CREATE TABLE IF NOT EXISTS app_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID REFERENCES tenants(id) ON DELETE CASCADE,
  level      TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warning', 'error', 'critical')),
  message    TEXT NOT NULL,
  context    JSONB NOT NULL DEFAULT '{}',
  source     TEXT,
  trace_id   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE app_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_metrics" ON app_metrics
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'GESTOR'));

CREATE POLICY "admin_logs" ON app_logs
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'GESTOR'));

-- Indexes para consultas temporais
CREATE INDEX IF NOT EXISTS idx_app_metrics_name_time ON app_metrics(name, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_logs_level_time ON app_logs(level, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_logs_tenant_time ON app_logs(tenant_id, created_at DESC);

-- Retenção automática: logs > 90 dias são deletados via pg_cron
-- SELECT cron.schedule('delete-old-logs', '0 3 * * *', $$DELETE FROM app_logs WHERE created_at < NOW() - INTERVAL '90 days'$$);
