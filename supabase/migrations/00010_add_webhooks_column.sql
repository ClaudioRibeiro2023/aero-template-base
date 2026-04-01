-- Migration 00010: Add webhooks JSONB column to admin_config
-- Megaplan V4 Sprint B: Integracoes persistentes

ALTER TABLE public.admin_config
  ADD COLUMN IF NOT EXISTS webhooks jsonb NOT NULL DEFAULT '[]';

COMMENT ON COLUMN public.admin_config.webhooks IS 'Array of webhook configurations [{id, url, events}]';
