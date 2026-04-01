-- Migration 011: role_definitions table
-- Stores custom and system roles per tenant with granular permissions

create table public.role_definitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  name text not null,
  display_name text not null,
  description text not null default '',
  permissions jsonb not null default '[]',
  is_system boolean not null default false,
  hierarchy_level integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, name)
);

create index idx_role_definitions_tenant on public.role_definitions (tenant_id);
create index idx_role_definitions_name on public.role_definitions (name);

create trigger trg_role_definitions_updated_at
  before update on public.role_definitions
  for each row execute function public.update_updated_at();

-- RLS
alter table public.role_definitions enable row level security;

-- Tenant members can read
create policy "role_definitions_select" on public.role_definitions
  for select using (
    tenant_id = (select tenant_id from public.profiles where id = auth.uid())
  );

-- Only ADMIN can insert/update/delete
create policy "role_definitions_insert" on public.role_definitions
  for insert with check (
    (select role from public.profiles where id = auth.uid()) = 'ADMIN'
    and tenant_id = (select tenant_id from public.profiles where id = auth.uid())
  );

create policy "role_definitions_update" on public.role_definitions
  for update using (
    (select role from public.profiles where id = auth.uid()) = 'ADMIN'
    and tenant_id = (select tenant_id from public.profiles where id = auth.uid())
  );

-- Cannot delete system roles
create policy "role_definitions_delete" on public.role_definitions
  for delete using (
    (select role from public.profiles where id = auth.uid()) = 'ADMIN'
    and tenant_id = (select tenant_id from public.profiles where id = auth.uid())
    and is_system = false
  );
