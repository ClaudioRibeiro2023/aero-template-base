-- Migration 012: Seed system roles per tenant
-- Inserts 4 system roles for each existing tenant

insert into public.role_definitions (tenant_id, name, display_name, description, permissions, is_system, hierarchy_level)
select
  t.id as tenant_id,
  r.name,
  r.display_name,
  r.description,
  r.permissions::jsonb,
  true,
  r.hierarchy_level
from public.tenants t
cross join (
  values
    (
      'ADMIN',
      'Administrador',
      'Acesso total ao sistema',
      '["DASHBOARD.VIEW","DASHBOARD.EXPORT","DASHBOARD.ADMIN","RELATORIOS.VIEW","RELATORIOS.CREATE","RELATORIOS.EXPORT","RELATORIOS.ADMIN","EXEMPLO.VIEW","EXEMPLO.CREATE","EXEMPLO.EDIT","EXEMPLO.DELETE","EXEMPLO.EXPORT","ETL.VIEW","ETL.EXECUTE","ETL.ADMIN","CONFIGURACOES.VIEW","CONFIGURACOES.EDIT","CONFIGURACOES.ADMIN","OBSERVABILIDADE.VIEW","OBSERVABILIDADE.ADMIN","DOCUMENTACAO.VIEW","DOCUMENTACAO.EDIT","LGPD.VIEW","LGPD.EDIT","LGPD.ADMIN","ADMIN.VIEW","ADMIN.CREATE","ADMIN.EDIT","ADMIN.DELETE","ADMIN.ADMIN","USUARIOS.VIEW","USUARIOS.CREATE","USUARIOS.EDIT","USUARIOS.DELETE","PERFIS.VIEW","PERFIS.CREATE","PERFIS.EDIT","PERFIS.DELETE","ENTIDADES.VIEW","ENTIDADES.CREATE","ENTIDADES.EDIT","ENTIDADES.DELETE","AUDITORIA.VIEW","AUDITORIA.EXPORT"]',
      100
    ),
    (
      'GESTOR',
      'Gestor',
      'Permissoes de leitura, relatorios e exportacao',
      '["DASHBOARD.VIEW","DASHBOARD.EXPORT","RELATORIOS.VIEW","RELATORIOS.CREATE","RELATORIOS.EXPORT","EXEMPLO.VIEW","EXEMPLO.CREATE","EXEMPLO.EDIT","EXEMPLO.EXPORT","ETL.VIEW","CONFIGURACOES.VIEW","OBSERVABILIDADE.VIEW","DOCUMENTACAO.VIEW","LGPD.VIEW","USUARIOS.VIEW","ENTIDADES.VIEW","AUDITORIA.VIEW","AUDITORIA.EXPORT"]',
      75
    ),
    (
      'OPERADOR',
      'Operador',
      'Permissoes operacionais',
      '["DASHBOARD.VIEW","RELATORIOS.VIEW","RELATORIOS.EXPORT","EXEMPLO.VIEW","EXEMPLO.CREATE","EXEMPLO.EDIT","DOCUMENTACAO.VIEW","LGPD.VIEW"]',
      50
    ),
    (
      'VIEWER',
      'Visualizador',
      'Apenas leitura',
      '["DASHBOARD.VIEW","RELATORIOS.VIEW","EXEMPLO.VIEW","DOCUMENTACAO.VIEW","LGPD.VIEW"]',
      25
    )
) as r(name, display_name, description, permissions, hierarchy_level)
on conflict (tenant_id, name) do nothing;
