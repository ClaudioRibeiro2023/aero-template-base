-- Migration 013: Add role_name to profiles for custom RBAC
-- Keeps existing role enum for backward compat, adds text field for custom roles

alter table public.profiles
  add column if not exists role_name text;

-- Backfill from existing role enum
update public.profiles set role_name = role::text where role_name is null;

-- Index for fast lookups
create index if not exists idx_profiles_role_name on public.profiles (role_name);
