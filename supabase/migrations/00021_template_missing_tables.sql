-- 00021_template_missing_tables.sql
-- Cria tabelas ausentes referenciadas pelo código mas nunca aplicadas no Supabase compartilhado.
-- Todas as instruções usam IF NOT EXISTS (DB compartilhado com 81+ tabelas de outros projetos).
-- Executado via Supabase MCP execute_sql em 2026-04-12.

-- ═══════════════════════════════════════════
-- 1. TENANTS
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','starter','pro','enterprise')),
  is_active boolean NOT NULL DEFAULT true,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants(is_active);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Seed default tenant
INSERT INTO tenants (name, slug, description, plan)
SELECT 'Default', 'default', 'Tenant padrão do template', 'pro'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'default');

-- ═══════════════════════════════════════════
-- 2. PROFILES — colunas ausentes
-- ═══════════════════════════════════════════
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locale text DEFAULT 'pt-BR';

-- Vincular profiles existentes ao tenant default
UPDATE profiles SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default')
WHERE tenant_id IS NULL;

-- ═══════════════════════════════════════════
-- 3. ADMIN_CONFIG
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS admin_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branding jsonb DEFAULT '{}'::jsonb,
  theme jsonb DEFAULT '{}'::jsonb,
  navigation jsonb DEFAULT '[]'::jsonb,
  notifications jsonb DEFAULT '{}'::jsonb,
  maintenance_mode boolean NOT NULL DEFAULT false,
  default_language text NOT NULL DEFAULT 'pt-BR',
  default_timezone text NOT NULL DEFAULT 'America/Sao_Paulo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id)
);

ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

-- Seed default admin_config
INSERT INTO admin_config (tenant_id, branding, theme)
SELECT t.id,
  '{"app_name":"Template Platform","logo_url":null}'::jsonb,
  '{"primary_color":"#6366f1","mode":"dark"}'::jsonb
FROM tenants t WHERE t.slug = 'default'
AND NOT EXISTS (SELECT 1 FROM admin_config ac WHERE ac.tenant_id = t.id);

-- ═══════════════════════════════════════════
-- 4. TASKS (com enums)
-- ═══════════════════════════════════════════
DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('todo','in_progress','done','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('low','medium','high','critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  assignee_id uuid REFERENCES auth.users(id),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  tenant_id uuid REFERENCES tenants(id),
  due_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_tenant ON tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS: select by tenant
DO $$ BEGIN
CREATE POLICY tasks_select ON tasks FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS: insert own
DO $$ BEGIN
CREATE POLICY tasks_insert ON tasks FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS: update creator or admin
DO $$ BEGIN
CREATE POLICY tasks_update ON tasks FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','owner')
  ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS: delete creator or admin
DO $$ BEGIN
CREATE POLICY tasks_delete ON tasks FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','owner')
  ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════
-- 5. FEATURE_FLAGS
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  description text,
  enabled boolean NOT NULL DEFAULT false,
  rollout_percentage integer NOT NULL DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  org_id uuid REFERENCES tenants(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_org ON feature_flags(org_id);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
CREATE POLICY ff_select ON feature_flags FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY ff_insert ON feature_flags FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','owner')));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY ff_update ON feature_flags FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','owner')));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY ff_delete ON feature_flags FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','owner')));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Seed feature flags
INSERT INTO feature_flags (key, description, enabled, rollout_percentage)
SELECT * FROM (VALUES
  ('dark_mode', 'Tema escuro', true, 100),
  ('notifications', 'Sistema de notificações', true, 100),
  ('ai_insights', 'Insights por IA', false, 0),
  ('export_pdf', 'Exportação PDF', true, 100),
  ('beta_features', 'Features beta', false, 10)
) AS v(key, description, enabled, rollout_percentage)
WHERE NOT EXISTS (SELECT 1 FROM feature_flags LIMIT 1);

-- ═══════════════════════════════════════════
-- 6. ROLE_DEFINITIONS
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS role_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id),
  name text NOT NULL,
  display_name text NOT NULL,
  description text,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_system boolean NOT NULL DEFAULT false,
  hierarchy_level integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, name)
);

ALTER TABLE role_definitions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
CREATE POLICY rd_select ON role_definitions FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY rd_insert ON role_definitions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','owner')));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY rd_update ON role_definitions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','owner')));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY rd_delete ON role_definitions FOR DELETE TO authenticated
  USING (NOT is_system AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','owner')));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Seed system roles
INSERT INTO role_definitions (tenant_id, name, display_name, description, permissions, is_system, hierarchy_level)
SELECT t.id, v.name, v.display_name, v.description, v.permissions::jsonb, true, v.hierarchy_level
FROM tenants t, (VALUES
  ('admin', 'Administrador', 'Acesso total ao sistema', '["*"]', 100),
  ('gestor', 'Gestor', 'Gestão de equipes e relatórios', '["read:*","write:own","manage:team"]', 80),
  ('operador', 'Operador', 'Operações diárias', '["read:own","write:own"]', 50),
  ('viewer', 'Visualizador', 'Somente leitura', '["read:own"]', 10)
) AS v(name, display_name, description, permissions, hierarchy_level)
WHERE t.slug = 'default'
AND NOT EXISTS (SELECT 1 FROM role_definitions rd WHERE rd.tenant_id = t.id AND rd.name = v.name);

-- ═══════════════════════════════════════════
-- 7. SUPPORT_TICKETS
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  category text CHECK (category IN ('bug','feature','question','access','performance','other')),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  assignee_id uuid REFERENCES auth.users(id),
  satisfaction_rating integer CHECK (satisfaction_rating BETWEEN 1 AND 5),
  satisfaction_comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_created_by ON support_tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_updated ON support_tickets(updated_at DESC);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
CREATE POLICY st_select ON support_tickets FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR assignee_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','owner')
  ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY st_insert ON support_tickets FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY st_update ON support_tickets FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR assignee_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','owner')
  ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY st_delete ON support_tickets FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','owner')));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════
-- 8. SUPPORT_MESSAGES
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'reply' CHECK (message_type IN ('reply','internal_note','status_change','assignment')),
  is_internal boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_by ON support_messages(created_by);

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
CREATE POLICY sm_select ON support_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets st
      WHERE st.id = ticket_id
      AND (st.created_by = auth.uid() OR st.assignee_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','owner')
      ))
    )
    AND (NOT is_internal OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','owner')
    ))
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY sm_insert ON support_messages FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════
-- 9. NOTIFICATIONS
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','success','warning','error')),
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
CREATE POLICY notif_select ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY notif_update ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
