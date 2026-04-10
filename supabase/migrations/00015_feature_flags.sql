-- Migration: Feature Flags dinâmicas
-- Permite ligar/desligar features por organização com rollout percentual

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  description text,
  enabled boolean DEFAULT true NOT NULL,
  rollout_pct integer DEFAULT 100 CHECK (rollout_pct >= 0 AND rollout_pct <= 100),
  org_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_org ON public.feature_flags(org_id);

-- RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer autenticado
CREATE POLICY "feature_flags_select" ON public.feature_flags
  FOR SELECT TO authenticated
  USING (true);

-- Escrita: apenas admin
CREATE POLICY "feature_flags_insert" ON public.feature_flags
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('ADMIN', 'admin')
    )
  );

CREATE POLICY "feature_flags_update" ON public.feature_flags
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('ADMIN', 'admin')
    )
  );

CREATE POLICY "feature_flags_delete" ON public.feature_flags
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('ADMIN', 'admin')
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_feature_flags_updated_at();

-- Seed: flags iniciais
INSERT INTO public.feature_flags (key, description, enabled, rollout_pct) VALUES
  ('realtime_tasks', 'Atualização em real-time de tasks via Supabase Realtime', true, 100),
  ('realtime_tickets', 'Atualização em real-time de tickets de suporte', true, 100),
  ('bulk_actions', 'Ações em lote (multi-select + bulk delete/export)', true, 100),
  ('command_palette', 'Busca global via Cmd+K / Ctrl+K', true, 100),
  ('onboarding_wizard', 'Wizard de onboarding para novos usuários', true, 100)
ON CONFLICT (key) DO NOTHING;
