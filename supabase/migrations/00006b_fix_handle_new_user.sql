-- Migration 00006: Fix handle_new_user — Atribuir tenant_id ao criar profile
-- Problema: a função handle_new_user() não propaga o tenant_id do metadata
-- do usuário, fazendo com que todo profile novo nasça com tenant_id = NULL.
-- Isso quebra o isolamento multi-tenant desde o primeiro login.
-- Solução: extrair tenant_id de raw_user_meta_data no momento do INSERT.
-- Se não estiver presente no metadata, deixa NULL para atribuição manual pelo admin.
-- Nota: o campo raw_user_meta_data é preenchido pelo cliente ao chamar
-- supabase.auth.signUp({ data: { tenant_id: '...' } }).

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, tenant_id)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    -- tenant_id vindo do metadata do signup; NULL se não fornecido
    (new.raw_user_meta_data->>'tenant_id')::uuid
  );
  return new;
end;
$$ language plpgsql security definer;
