-- Migration 002: Profiles table
-- Linked to auth.users, extends with app-specific fields

create type public.user_role as enum ('ADMIN', 'GESTOR', 'OPERADOR', 'VIEWER');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete set null,
  display_name text not null default '',
  email text not null default '',
  avatar_url text,
  phone text,
  department text,
  role public.user_role not null default 'VIEWER',
  is_active boolean not null default true,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_tenant on public.profiles (tenant_id);
create index idx_profiles_email on public.profiles (email);
create index idx_profiles_role on public.profiles (role);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', split_part(coalesce(new.email, ''), '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
