-- Migration 003: Core application tables
-- admin_config, feature_flags, audit_logs

-- Admin Config (per-tenant branding/theme/navigation)
create table public.admin_config (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branding jsonb not null default '{}',
  theme jsonb not null default '{"mode": "light", "density": "comfortable"}',
  navigation jsonb not null default '[]',
  notifications jsonb not null default '{"email": true, "push": false}',
  maintenance_mode boolean not null default false,
  default_language text not null default 'pt-BR',
  default_timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id)
);

create trigger trg_admin_config_updated_at
  before update on public.admin_config
  for each row execute function public.update_updated_at();

-- Feature Flags (per-tenant)
create table public.feature_flags (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  flag_name text not null,
  enabled boolean not null default false,
  description text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, flag_name)
);

create index idx_feature_flags_tenant on public.feature_flags (tenant_id);
create index idx_feature_flags_name on public.feature_flags (flag_name);

create trigger trg_feature_flags_updated_at
  before update on public.feature_flags
  for each row execute function public.update_updated_at();

-- Audit Logs (append-only)
create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  details jsonb not null default '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index idx_audit_logs_tenant on public.audit_logs (tenant_id, created_at desc);
create index idx_audit_logs_user on public.audit_logs (user_id, created_at desc);
create index idx_audit_logs_action on public.audit_logs (action, created_at desc);

-- Default feature flags for new tenants
create or replace function public.seed_tenant_defaults()
returns trigger as $$
begin
  -- Create admin config
  insert into public.admin_config (tenant_id)
  values (new.id);

  -- Create default feature flags
  insert into public.feature_flags (tenant_id, flag_name, enabled, description) values
    (new.id, 'dark_mode', true, 'Enable dark mode toggle'),
    (new.id, 'analytics', false, 'Enable analytics tracking'),
    (new.id, 'maintenance_mode', false, 'Enable maintenance mode'),
    (new.id, 'realtime', true, 'Enable realtime subscriptions'),
    (new.id, 'file_upload', true, 'Enable file uploads');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_tenant_created
  after insert on public.tenants
  for each row execute function public.seed_tenant_defaults();
