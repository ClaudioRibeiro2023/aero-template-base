-- Migration: 00009_create_tasks.sql
-- Sprint 7 (P1-01): CRUD de referência — tabela tasks com RLS
-- Demonstra: schema real, RLS, índices, trigger updated_at

create type task_status as enum ('todo', 'in_progress', 'done', 'cancelled');
create type task_priority as enum ('low', 'medium', 'high', 'critical');

create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 255),
  description text check (char_length(description) <= 5000),
  status      task_status not null default 'todo',
  priority    task_priority not null default 'medium',
  assignee_id uuid references auth.users(id) on delete set null,
  created_by  uuid not null references auth.users(id) on delete cascade,
  tenant_id   uuid references public.tenants(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Índices para queries frequentes
create index if not exists tasks_created_by_idx on public.tasks(created_by);
create index if not exists tasks_tenant_id_idx  on public.tasks(tenant_id);
create index if not exists tasks_status_idx     on public.tasks(status);
create index if not exists tasks_updated_at_idx on public.tasks(updated_at desc);

-- Trigger para manter updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ── RLS ──
alter table public.tasks enable row level security;

-- Usuários autenticados leem tasks do seu tenant (ou tasks pessoais sem tenant)
create policy "tasks_select"
  on public.tasks for select
  using (
    auth.uid() is not null
    and (
      tenant_id is null
      or tenant_id in (
        select tenant_id from public.profiles where id = auth.uid()
      )
    )
  );

-- Usuário cria tasks para si mesmo
create policy "tasks_insert"
  on public.tasks for insert
  with check (
    auth.uid() is not null
    and created_by = auth.uid()
  );

-- Criador ou admin pode atualizar
create policy "tasks_update"
  on public.tasks for update
  using (
    auth.uid() = created_by
    or (auth.jwt() -> 'app_metadata' ->> 'role') in ('ADMIN', 'SUPER_ADMIN')
  );

-- Criador ou admin pode deletar
create policy "tasks_delete"
  on public.tasks for delete
  using (
    auth.uid() = created_by
    or (auth.jwt() -> 'app_metadata' ->> 'role') in ('ADMIN', 'SUPER_ADMIN')
  );
