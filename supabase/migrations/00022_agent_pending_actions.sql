-- ─── Migration 00022: agent_pending_actions ────────────────────────────────────
-- Tabela para ações pendentes de confirmação do agente.
-- Sprint 6: confirmação transacional de tools de escrita.

create table if not exists public.agent_pending_actions (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null,
  tenant_id       uuid not null,
  user_id         uuid not null,
  app_id          text not null,
  tool_name       text not null,
  proposed_input  jsonb not null default '{}',
  description     text not null,
  impact          text not null,
  status          text not null default 'pending'
                    check (status in ('pending', 'confirmed', 'cancelled', 'expired', 'executed')),
  nonce           text not null unique,  -- anti-replay
  expires_at      timestamptz not null,
  created_at      timestamptz not null default now(),
  confirmed_at    timestamptz,
  executed_at     timestamptz,
  result          jsonb,
  error_msg       text,
  trace_id        uuid
);

-- ─── Índices ──────────────────────────────────────────────────────────────────

create index idx_pending_actions_session on public.agent_pending_actions (session_id);
create index idx_pending_actions_user    on public.agent_pending_actions (user_id, status);
create index idx_pending_actions_tenant  on public.agent_pending_actions (tenant_id);
create index idx_pending_actions_expires on public.agent_pending_actions (expires_at) where status = 'pending';
create index idx_pending_actions_nonce   on public.agent_pending_actions (nonce);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table public.agent_pending_actions enable row level security;

create policy "agent_pending_actions: user owns"
  on public.agent_pending_actions for all
  using (user_id = auth.uid());

-- ─── Rate limiting table ──────────────────────────────────────────────────────

create table if not exists public.agent_rate_limits (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null,
  user_id     uuid not null,
  endpoint    text not null,
  window_start timestamptz not null,
  request_count integer not null default 1,
  created_at  timestamptz not null default now(),

  unique (tenant_id, user_id, endpoint, window_start)
);

create index idx_rate_limits_lookup on public.agent_rate_limits (tenant_id, user_id, endpoint, window_start);

alter table public.agent_rate_limits enable row level security;

create policy "agent_rate_limits: user owns"
  on public.agent_rate_limits for all
  using (user_id = auth.uid());

-- ─── Cleanup function for expired actions ─────────────────────────────────────

create or replace function public.agent_expire_pending_actions()
returns void
language sql
as $$
  update public.agent_pending_actions
  set status = 'expired'
  where status = 'pending'
    and expires_at < now();
$$;
