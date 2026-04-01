-- Migration 014: SQL helper functions for custom RBAC

-- Returns current user's role_name (falls back to role enum text)
create or replace function public.get_user_role_name()
returns text
language sql stable security definer
as $$
  select coalesce(role_name, role::text, 'VIEWER')
  from public.profiles
  where id = auth.uid()
$$;

-- Returns current user's permissions as jsonb array
create or replace function public.get_user_permissions()
returns jsonb
language sql stable security definer
as $$
  select coalesce(rd.permissions, '[]'::jsonb)
  from public.profiles p
  left join public.role_definitions rd
    on rd.tenant_id = p.tenant_id
    and rd.name = coalesce(p.role_name, p.role::text)
  where p.id = auth.uid()
$$;

-- Returns true if current user has a specific permission string
create or replace function public.user_has_permission(permission_name text)
returns boolean
language sql stable security definer
as $$
  select exists (
    select 1
    from public.profiles p
    join public.role_definitions rd
      on rd.tenant_id = p.tenant_id
      and rd.name = coalesce(p.role_name, p.role::text)
    where p.id = auth.uid()
      and rd.permissions @> to_jsonb(permission_name)
  )
$$;

-- Seed role_definitions for new tenants (called from handle_new_user or manually)
create or replace function public.seed_tenant_roles(p_tenant_id uuid)
returns void
language plpgsql security definer
as $$
begin
  insert into public.role_definitions (tenant_id, name, display_name, description, permissions, is_system, hierarchy_level)
  values
    (p_tenant_id, 'ADMIN', 'Administrador', 'Acesso total ao sistema',
     '["DASHBOARD.VIEW","DASHBOARD.EXPORT","DASHBOARD.ADMIN","RELATORIOS.VIEW","RELATORIOS.CREATE","RELATORIOS.EXPORT","RELATORIOS.ADMIN","EXEMPLO.VIEW","EXEMPLO.CREATE","EXEMPLO.EDIT","EXEMPLO.DELETE","EXEMPLO.EXPORT","ETL.VIEW","ETL.EXECUTE","ETL.ADMIN","CONFIGURACOES.VIEW","CONFIGURACOES.EDIT","CONFIGURACOES.ADMIN","OBSERVABILIDADE.VIEW","OBSERVABILIDADE.ADMIN","DOCUMENTACAO.VIEW","DOCUMENTACAO.EDIT","LGPD.VIEW","LGPD.EDIT","LGPD.ADMIN","ADMIN.VIEW","ADMIN.CREATE","ADMIN.EDIT","ADMIN.DELETE","ADMIN.ADMIN","USUARIOS.VIEW","USUARIOS.CREATE","USUARIOS.EDIT","USUARIOS.DELETE","PERFIS.VIEW","PERFIS.CREATE","PERFIS.EDIT","PERFIS.DELETE","ENTIDADES.VIEW","ENTIDADES.CREATE","ENTIDADES.EDIT","ENTIDADES.DELETE","AUDITORIA.VIEW","AUDITORIA.EXPORT"]'::jsonb,
     true, 100),
    (p_tenant_id, 'GESTOR', 'Gestor', 'Permissoes de leitura, relatorios e exportacao',
     '["DASHBOARD.VIEW","DASHBOARD.EXPORT","RELATORIOS.VIEW","RELATORIOS.CREATE","RELATORIOS.EXPORT","EXEMPLO.VIEW","EXEMPLO.CREATE","EXEMPLO.EDIT","EXEMPLO.EXPORT","ETL.VIEW","CONFIGURACOES.VIEW","OBSERVABILIDADE.VIEW","DOCUMENTACAO.VIEW","LGPD.VIEW","USUARIOS.VIEW","ENTIDADES.VIEW","AUDITORIA.VIEW","AUDITORIA.EXPORT"]'::jsonb,
     true, 75),
    (p_tenant_id, 'OPERADOR', 'Operador', 'Permissoes operacionais',
     '["DASHBOARD.VIEW","RELATORIOS.VIEW","RELATORIOS.EXPORT","EXEMPLO.VIEW","EXEMPLO.CREATE","EXEMPLO.EDIT","DOCUMENTACAO.VIEW","LGPD.VIEW"]'::jsonb,
     true, 50),
    (p_tenant_id, 'VIEWER', 'Visualizador', 'Apenas leitura',
     '["DASHBOARD.VIEW","RELATORIOS.VIEW","EXEMPLO.VIEW","DOCUMENTACAO.VIEW","LGPD.VIEW"]'::jsonb,
     true, 25)
  on conflict (tenant_id, name) do nothing;
end;
$$;
