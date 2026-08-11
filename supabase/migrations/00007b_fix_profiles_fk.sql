-- Migration 00007: Fix profiles FK — ON DELETE SET NULL → ON DELETE RESTRICT
-- Problema: profiles.tenant_id usa ON DELETE SET NULL, o que significa que
-- ao deletar um tenant, todos os profiles associados ficam com tenant_id = NULL
-- (orphaned). Isso quebra o isolamento multi-tenant e pode expor dados entre
-- tenants, pois get_user_tenant_id() retornaria NULL para esses usuários.
-- Solução: mudar para ON DELETE RESTRICT, forçando a exclusão manual dos profiles
-- antes que um tenant possa ser removido. Isso é comportamento correto: um tenant
-- não deve ser deletado enquanto tiver usuários ativos.
-- Pré-requisito: para deletar um tenant, o admin deve antes reatribuir ou deletar
-- seus profiles. Isso pode ser feito via soft-delete (deleted_at no tenant).

-- Remove a constraint atual
alter table public.profiles
  drop constraint if exists profiles_tenant_id_fkey;

-- Recria com ON DELETE RESTRICT
alter table public.profiles
  add constraint profiles_tenant_id_fkey
  foreign key (tenant_id)
  references public.tenants(id)
  on delete restrict;
