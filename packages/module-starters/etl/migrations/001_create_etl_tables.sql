-- Migration: ETL Module Tables
-- Execute: pnpm run db:migrate (ou cole no Supabase SQL Editor)

-- Fontes de dados
CREATE TABLE IF NOT EXISTS etl_data_sources (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('csv', 'json', 'shapefile', 'api', 'database')),
  description TEXT,
  config      JSONB NOT NULL DEFAULT '{}',
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Jobs de importação
CREATE TABLE IF NOT EXISTS etl_jobs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  source_id          UUID REFERENCES etl_data_sources(id),
  status             TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  progress           INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  records_total      INTEGER,
  records_processed  INTEGER,
  records_success    INTEGER,
  records_error      INTEGER,
  error_message      TEXT,
  logs               JSONB NOT NULL DEFAULT '[]',
  started_at         TIMESTAMPTZ,
  completed_at       TIMESTAMPTZ,
  created_by         UUID REFERENCES auth.users(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Relatórios de qualidade
CREATE TABLE IF NOT EXISTS etl_quality_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  target_id   TEXT NOT NULL,
  target_name TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('passed', 'warning', 'failed')),
  metrics     JSONB NOT NULL DEFAULT '[]',
  issues      JSONB NOT NULL DEFAULT '[]',
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE etl_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE etl_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE etl_quality_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_sources" ON etl_data_sources
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "tenant_isolation_jobs" ON etl_jobs
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "tenant_isolation_quality" ON etl_quality_reports
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_etl_jobs_status ON etl_jobs(status);
CREATE INDEX IF NOT EXISTS idx_etl_jobs_tenant ON etl_jobs(tenant_id, created_at DESC);
