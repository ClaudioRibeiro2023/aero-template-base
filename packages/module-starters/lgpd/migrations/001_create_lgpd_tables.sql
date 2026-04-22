-- Migration: LGPD Module Tables

-- Registros de consentimento
CREATE TABLE IF NOT EXISTS consent_records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  marketing   BOOLEAN NOT NULL DEFAULT FALSE,
  analytics   BOOLEAN NOT NULL DEFAULT FALSE,
  third_party BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Solicitações de exportação/exclusão
CREATE TABLE IF NOT EXISTS data_export_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('export', 'deletion')),
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  reason       TEXT,
  download_url TEXT,
  expires_at   TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas seus próprios dados
CREATE POLICY "user_own_consent" ON consent_records
  USING (user_id = auth.uid());

CREATE POLICY "user_own_requests" ON data_export_requests
  USING (user_id = auth.uid());

-- Admin vê tudo do tenant
CREATE POLICY "admin_tenant_consent" ON consent_records
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "admin_tenant_requests" ON data_export_requests
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');
