-- Migration 001: Tenants table
-- Multi-tenant foundation for all downstream tables

create extension if not exists "uuid-ossp";

create table public.tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro', 'enterprise')),
  is_active boolean not null default true,
  settings jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_tenants_slug on public.tenants (slug) where deleted_at is null;
create index idx_tenants_active on public.tenants (is_active) where deleted_at is null;

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_tenants_updated_at
  before update on public.tenants
  for each row execute function public.update_updated_at();

-- Default tenant for development
insert into public.tenants (name, slug, description, plan)
values ('Default', 'default', 'Default development tenant', 'pro')
on conflict (slug) do nothing;
