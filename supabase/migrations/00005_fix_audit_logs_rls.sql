-- Migration 00005: Fix audit_logs RLS — Corrigir cross-tenant injection
-- Problema: a policy "Audit logs: system can insert" usa WITH CHECK (true),
-- permitindo que qualquer tenant autenticado insira registros com o tenant_id
-- de outro tenant (cross-tenant injection).
-- Solução: restringir o WITH CHECK para exigir que tenant_id corresponda ao
-- tenant do usuário autenticado, usando a função get_user_tenant_id() já existente.
-- Obs: inserções feitas por service_role (backend) continuam funcionando porque
-- service_role bypassa RLS por definição.

-- Remove a policy vulnerável
drop policy if exists "Audit logs: system can insert" on public.audit_logs;

-- Recria com verificação de tenant
create policy "Audit logs: system can insert"
  on public.audit_logs for insert
  with check (
    -- Permitir quando tenant_id corresponde ao tenant do usuário autenticado
    tenant_id = public.get_user_tenant_id()
    -- Ou quando inserido via service_role sem tenant_id (logs de sistema)
    or tenant_id is null
  );
