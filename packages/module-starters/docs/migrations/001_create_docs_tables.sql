-- Docs Module — migration stub.
-- Ajuste para o schema real antes de aplicar em produção.

create table if not exists docs_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null check (category in ('guide', 'reference', 'changelog', 'faq')),
  content text not null,
  tags text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create index if not exists docs_pages_category_idx on docs_pages (category);
create index if not exists docs_pages_tags_idx on docs_pages using gin (tags);
