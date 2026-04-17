-- ─── Migration 00023: domain pack on agent_sessions ─────────────────────────
-- Sprint 10: persiste o domain pack resolvido por sessão.
-- Backwards-compatible: todas as colunas NOVAS são nullable (exceto fallback,
-- que tem default false). Linhas legadas continuam válidas.

alter table public.agent_sessions
  add column if not exists domain_pack_id       text,
  add column if not exists domain_pack_version  text,
  add column if not exists domain_pack_fallback boolean not null default false,
  add column if not exists domain_pack_strategy text;

-- Valida os valores aceitos em domain_pack_strategy (nullable).
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'agent_sessions_domain_pack_strategy_chk'
  ) then
    alter table public.agent_sessions
      add constraint agent_sessions_domain_pack_strategy_chk
        check (
          domain_pack_strategy is null
          or domain_pack_strategy in ('tenant', 'app', 'fallback-core', 'none')
        );
  end if;
end $$;

-- ─── Índices ─────────────────────────────────────────────────────────────────

create index if not exists idx_agent_sessions_domain_pack
  on public.agent_sessions (domain_pack_id);

create index if not exists idx_agent_sessions_fallback
  on public.agent_sessions (domain_pack_fallback)
  where domain_pack_fallback = true;
