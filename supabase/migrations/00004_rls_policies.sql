-- Migration 004: Row Level Security Policies
-- Tenant isolation at database level

-- Helper: extract tenant_id from JWT
create or replace function public.get_user_tenant_id()
returns uuid as $$
  select coalesce(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid,
    (select tenant_id from public.profiles where id = auth.uid())
  );
$$ language sql stable security definer;

-- Helper: extract role from JWT or profile
create or replace function public.get_user_role()
returns public.user_role as $$
  select coalesce(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'user_role')::public.user_role,
    (select role from public.profiles where id = auth.uid()),
    'VIEWER'::public.user_role
  );
$$ language sql stable security definer;

-- Helper: check if user has specific role
create or replace function public.has_role(required_role public.user_role)
returns boolean as $$
  select public.get_user_role() = required_role;
$$ language sql stable security definer;

-- Helper: check if user is admin or gestor
create or replace function public.is_admin_or_gestor()
returns boolean as $$
  select public.get_user_role() in ('ADMIN', 'GESTOR');
$$ language sql stable security definer;

-- ============================================================
-- TENANTS
-- ============================================================
alter table public.tenants enable row level security;

create policy "Tenants: users can view their own tenant"
  on public.tenants for select
  using (id = public.get_user_tenant_id());

create policy "Tenants: admins can update their tenant"
  on public.tenants for update
  using (id = public.get_user_tenant_id() and public.is_admin_or_gestor());

-- ============================================================
-- PROFILES
-- ============================================================
alter table public.profiles enable row level security;

create policy "Profiles: users can view profiles in their tenant"
  on public.profiles for select
  using (tenant_id = public.get_user_tenant_id() or id = auth.uid());

create policy "Profiles: users can update their own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Profiles: admins can update any profile in tenant"
  on public.profiles for update
  using (tenant_id = public.get_user_tenant_id() and public.is_admin_or_gestor());

create policy "Profiles: admins can insert profiles"
  on public.profiles for insert
  with check (public.is_admin_or_gestor() or id = auth.uid());

-- ============================================================
-- ADMIN CONFIG
-- ============================================================
alter table public.admin_config enable row level security;

create policy "Admin config: users can view their tenant config"
  on public.admin_config for select
  using (tenant_id = public.get_user_tenant_id());

create policy "Admin config: admins can modify"
  on public.admin_config for all
  using (tenant_id = public.get_user_tenant_id() and public.is_admin_or_gestor());

-- ============================================================
-- FEATURE FLAGS
-- ============================================================
alter table public.feature_flags enable row level security;

create policy "Feature flags: users can view their tenant flags"
  on public.feature_flags for select
  using (tenant_id = public.get_user_tenant_id() or tenant_id is null);

create policy "Feature flags: admins can modify"
  on public.feature_flags for all
  using (tenant_id = public.get_user_tenant_id() and public.is_admin_or_gestor());

-- ============================================================
-- AUDIT LOGS
-- ============================================================
alter table public.audit_logs enable row level security;

create policy "Audit logs: admins can view tenant logs"
  on public.audit_logs for select
  using (tenant_id = public.get_user_tenant_id() and public.has_role('ADMIN'));

create policy "Audit logs: system can insert"
  on public.audit_logs for insert
  with check (true);
