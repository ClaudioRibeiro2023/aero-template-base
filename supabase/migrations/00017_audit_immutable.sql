-- Migration: Auditoria imutável com triggers automáticos
-- Garante que toda mudança em tabelas sensíveis é registrada automaticamente

-- Função genérica de audit trigger
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    action,
    resource,
    resource_id,
    user_id,
    details,
    created_at
  ) VALUES (
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id)::text,
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    jsonb_build_object(
      'old', CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE null END,
      'new', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE null END
    ),
    now()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers em tabelas sensíveis
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['tasks', 'support_tickets', 'profiles', 'feature_flags']) LOOP
    -- Drop if exists (idempotente)
    EXECUTE format('DROP TRIGGER IF EXISTS audit_%s ON public.%I', tbl, tbl);
    -- Create
    EXECUTE format(
      'CREATE TRIGGER audit_%s AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func()',
      tbl, tbl
    );
  END LOOP;
END $$;

-- Tornar audit_logs imutável: revogar UPDATE e DELETE
REVOKE UPDATE, DELETE ON public.audit_logs FROM authenticated;
REVOKE UPDATE, DELETE ON public.audit_logs FROM anon;

-- Política: authenticated pode inserir (via trigger) e ler
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'audit_logs_immutable_insert') THEN
    CREATE POLICY "audit_logs_immutable_insert" ON public.audit_logs
      FOR INSERT TO authenticated
      WITH CHECK (true);
  END IF;
END $$;
