-- ─── Migration 00007: agent_documents (RAG layer) ─────────────────────────────
-- Tabela para armazenamento e busca de documentos via pgvector.
-- Complementa agent_memory (migration 00006) para a camada semântica/RAG.

-- ─── Tabela principal ────────────────────────────────────────────────────────

create table if not exists public.agent_documents (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null,
  app_id       text not null,

  -- Conteúdo do chunk
  content      text not null,
  source       text not null,          -- ex: "manual-produto-v2.pdf"
  source_type  text not null default 'document',  -- document | policy | manual | knowledge

  -- Vetor de embedding (text-embedding-3-small = 1536 dims)
  embedding    vector(1536),

  -- Posição do chunk no documento original
  chunk_index  integer,

  -- Metadados extras (autor, seção, data, etc.)
  metadata     jsonb default '{}',

  -- Controle
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── Índices ──────────────────────────────────────────────────────────────────

-- Busca por tenant + app
create index if not exists agent_documents_tenant_app_idx
  on public.agent_documents (tenant_id, app_id);

-- Índice vetorial IVFFlat para busca por similaridade cosseno
-- lists=100 é razoável para até ~1M vetores
create index if not exists agent_documents_embedding_idx
  on public.agent_documents
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table public.agent_documents enable row level security;

-- Leitura: usuário autenticado vê documentos do próprio tenant
create policy "agent_documents_read"
  on public.agent_documents for select
  using (
    tenant_id in (
      select tenant_id from public.profiles where id = auth.uid()
    )
  );

-- Escrita: apenas service role pode inserir documentos (ingestão server-side)
create policy "agent_documents_insert_service"
  on public.agent_documents for insert
  with check (
    auth.role() = 'service_role'
  );

-- ─── Função RPC: busca semântica ──────────────────────────────────────────────
-- Chamada via supabase.rpc('agent_search_documents', {...})

create or replace function public.agent_search_documents(
  p_query_embedding  vector(1536),
  p_tenant_id        uuid,
  p_app_id           text,
  p_top_k            integer default 4
)
returns table (
  id           uuid,
  content      text,
  source       text,
  source_type  text,
  score        float,
  chunk_index  integer,
  metadata     jsonb
)
language sql stable
as $$
  select
    d.id,
    d.content,
    d.source,
    d.source_type,
    1 - (d.embedding <=> p_query_embedding) as score,
    d.chunk_index,
    d.metadata
  from public.agent_documents d
  where
    d.tenant_id = p_tenant_id
    and d.app_id = p_app_id
    and d.embedding is not null
  order by d.embedding <=> p_query_embedding
  limit p_top_k;
$$;

-- Permite execução da função para usuários autenticados
grant execute on function public.agent_search_documents to authenticated;

-- ─── Trigger: updated_at automático ──────────────────────────────────────────

create trigger agent_documents_updated_at
  before update on public.agent_documents
  for each row
  execute function public.handle_updated_at();
