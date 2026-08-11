-- Migration 006: Conversation OS — tabelas do agente
-- Sprint 1 fundação: sessions, messages, memory, tool_logs
--
-- Contexto:
-- O @template/agent é o Conversation OS do template. Cada app derivada
-- tem seu próprio Domain Pack mas compartilha esta infraestrutura.
-- Sprint 1: tabelas criadas, leitura/escrita via API (sem Edge Functions ainda).
-- Sprint 2: ativar persistência real no AgentOrchestrator.resolveSession() +
--           AgentOrchestrator.buildHistory() que hoje retornam in-memory.

-- ─── Sessões de conversa ───────────────────────────────────────────────────────

create table if not exists public.agent_sessions (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  app_id      text not null default 'web',
  status      text not null default 'active' check (status in ('active', 'archived', 'expired')),
  title       text,
  turn_count  integer not null default 0,
  metadata    jsonb not null default '{}',
  started_at  timestamptz not null default now(),
  last_active_at timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_agent_sessions_tenant_user on public.agent_sessions (tenant_id, user_id);
create index idx_agent_sessions_app      on public.agent_sessions (app_id);
create index idx_agent_sessions_status   on public.agent_sessions (status);
create index idx_agent_sessions_active   on public.agent_sessions (last_active_at desc);

create trigger trg_agent_sessions_updated_at
  before update on public.agent_sessions
  for each row execute function public.update_updated_at();

-- ─── Mensagens de uma sessão ──────────────────────────────────────────────────

create table if not exists public.agent_messages (
  id          uuid primary key default uuid_generate_v4(),
  session_id  uuid not null references public.agent_sessions(id) on delete cascade,
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content     text not null,
  tool_calls  jsonb,             -- array de tool calls (quando role=assistant)
  tool_call_id text,             -- ID da ferramenta executada (quando role=tool)
  tokens_used integer,
  latency_ms  integer,
  model       text,
  trace_id    uuid,
  created_at  timestamptz not null default now()
);

create index idx_agent_messages_session on public.agent_messages (session_id, created_at);
create index idx_agent_messages_tenant  on public.agent_messages (tenant_id);
create index idx_agent_messages_trace   on public.agent_messages (trace_id) where trace_id is not null;

-- ─── Memória do agente (multi-layer) ─────────────────────────────────────────

create table if not exists public.agent_memory (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete cascade,
  session_id  uuid references public.agent_sessions(id) on delete cascade,
  app_id      text not null default 'web',
  layer       text not null check (layer in ('session', 'user', 'domain', 'semantic')),
  key         text not null,
  value       jsonb not null,
  embedding   vector(1536),     -- OpenAI text-embedding-3-small (Sprint 3+)
  ttl_seconds integer,          -- null = sem expiração
  expires_at  timestamptz,      -- calculado no insert/update
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- Unicidade por (tenant, app, layer, key, user/session)
  unique nulls not distinct (tenant_id, app_id, layer, key, user_id, session_id)
);

create index idx_agent_memory_scope    on public.agent_memory (tenant_id, app_id, layer);
create index idx_agent_memory_user     on public.agent_memory (user_id) where user_id is not null;
create index idx_agent_memory_session  on public.agent_memory (session_id) where session_id is not null;
create index idx_agent_memory_expires  on public.agent_memory (expires_at) where expires_at is not null;

-- Índice vetorial para busca semântica (Sprint 3+)
create index idx_agent_memory_embedding on public.agent_memory
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 50)
  where embedding is not null;

create trigger trg_agent_memory_updated_at
  before update on public.agent_memory
  for each row execute function public.update_updated_at();

-- ─── Logs de execução de ferramentas ─────────────────────────────────────────

create table if not exists public.agent_tool_logs (
  id          uuid primary key default uuid_generate_v4(),
  trace_id    uuid not null,
  session_id  uuid references public.agent_sessions(id) on delete set null,
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  tool_name   text not null,
  input       jsonb not null default '{}',
  output      jsonb,
  success     boolean not null,
  error_msg   text,
  latency_ms  integer,
  user_role   text,
  app_id      text,
  created_at  timestamptz not null default now()
);

create index idx_agent_tool_logs_trace   on public.agent_tool_logs (trace_id);
create index idx_agent_tool_logs_session on public.agent_tool_logs (session_id) where session_id is not null;
create index idx_agent_tool_logs_tenant  on public.agent_tool_logs (tenant_id);
create index idx_agent_tool_logs_tool    on public.agent_tool_logs (tool_name);
create index idx_agent_tool_logs_created on public.agent_tool_logs (created_at desc);

-- ─── RLS — Row Level Security ─────────────────────────────────────────────────

alter table public.agent_sessions  enable row level security;
alter table public.agent_messages  enable row level security;
alter table public.agent_memory    enable row level security;
alter table public.agent_tool_logs enable row level security;

-- agent_sessions: usuário vê apenas as próprias sessões dentro do tenant
create policy "agent_sessions: user owns"
  on public.agent_sessions for all
  using (
    user_id = auth.uid()
    and tenant_id in (
      select tenant_id from public.profiles where id = auth.uid()
    )
  );

-- agent_messages: acesso via sessão (herda isolamento do tenant)
create policy "agent_messages: via session"
  on public.agent_messages for all
  using (
    session_id in (
      select id from public.agent_sessions
      where user_id = auth.uid()
    )
  );

-- agent_memory: user/session scope
create policy "agent_memory: user scope"
  on public.agent_memory for all
  using (
    tenant_id in (
      select tenant_id from public.profiles where id = auth.uid()
    )
    and (user_id is null or user_id = auth.uid())
  );

-- agent_tool_logs: usuário vê apenas os próprios logs
create policy "agent_tool_logs: user owns"
  on public.agent_tool_logs for all
  using (
    user_id = auth.uid()
    and tenant_id in (
      select tenant_id from public.profiles where id = auth.uid()
    )
  );

-- ─── Função auxiliar: expirar memória TTL ────────────────────────────────────
-- Chamável via pg_cron (Sprint 2+): SELECT agent_expire_memory();

create or replace function public.agent_expire_memory()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  _count integer;
begin
  delete from public.agent_memory
  where expires_at is not null and expires_at < now();
  get diagnostics _count = row_count;
  return _count;
end;
$$;
