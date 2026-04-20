-- Migration 024: Backfill domain_pack fields on legacy agent_sessions rows
-- Rationale: sessions created before 00023 have NULL domain_pack_id.
-- They were served by coreDomainPack at runtime (the registry's only pack at that time),
-- so we mark them explicitly to keep the admin panel legible and metrics accurate.

UPDATE public.agent_sessions
SET
  domain_pack_id = 'core',
  domain_pack_version = '1.0.0',
  domain_pack_fallback = false,
  domain_pack_strategy = 'fallback-core'
WHERE domain_pack_id IS NULL;

-- Verify: all rows now have a domain_pack_id
DO $$
DECLARE
  legacy_count integer;
BEGIN
  SELECT count(*) INTO legacy_count FROM public.agent_sessions WHERE domain_pack_id IS NULL;
  IF legacy_count > 0 THEN
    RAISE WARNING 'Backfill incompleto: % sessões ainda sem domain_pack_id', legacy_count;
  END IF;
END $$;
