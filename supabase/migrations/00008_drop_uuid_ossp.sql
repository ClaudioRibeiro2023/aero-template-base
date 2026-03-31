-- Migration 00008: Drop uuid-ossp — Substituir por gen_random_uuid() nativo
-- Problema: a migration 00001 faz CREATE EXTENSION "uuid-ossp" e usa
-- uuid_generate_v4() como default em todas as tabelas. Essa extensão é uma
-- dependência desnecessária no PostgreSQL 13+, onde gen_random_uuid() é
-- nativo (pgcrypto integrado ao core) e mais eficiente.
-- Solução: (1) alterar os defaults das colunas afetadas para gen_random_uuid(),
-- (2) remover a extensão. A remoção só é possível após atualizar todos os defaults,
-- caso contrário o DROP EXTENSION falhará por dependência.
-- Tabelas com uuid_generate_v4() detectadas nas migrations anteriores:
--   - public.tenants.id         (00001)
--   - public.admin_config.id    (00003)
--   - public.feature_flags.id   (00003)
--   - public.audit_logs.id      (00003)

-- Atualiza defaults para usar gen_random_uuid() nativo
alter table public.tenants
  alter column id set default gen_random_uuid();

alter table public.admin_config
  alter column id set default gen_random_uuid();

alter table public.feature_flags
  alter column id set default gen_random_uuid();

alter table public.audit_logs
  alter column id set default gen_random_uuid();

-- Remove a extensão uuid-ossp (seguro agora que não há mais dependências de default)
-- IF EXISTS garante idempotência: não falha se já foi removida anteriormente
drop extension if exists "uuid-ossp";
