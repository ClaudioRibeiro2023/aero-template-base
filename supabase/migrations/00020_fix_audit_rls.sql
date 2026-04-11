-- Fix: audit_logs RLS policy da migration 00017 usava WITH CHECK (true)
-- permitindo cross-tenant injection. Substituir por policy restritiva.

-- Drop policy permissiva
DROP POLICY IF EXISTS audit_logs_immutable_insert ON audit_logs;

-- Recriar: usuarios so podem inserir logs atribuidos a si mesmos
CREATE POLICY audit_logs_insert_own ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Scope leitura por tenant
DROP POLICY IF EXISTS audit_logs_select ON audit_logs;
CREATE POLICY audit_logs_select_tenant ON audit_logs
  FOR SELECT TO authenticated
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
