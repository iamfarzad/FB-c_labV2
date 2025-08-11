-- Minimal pgvector setup for session memory
-- Requires pgvector extension installed in Supabase project

create table if not exists documents_embeddings (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  kind text not null,
  text text not null,
  embedding vector(1536) not null,
  created_at timestamptz default now()
);

create index if not exists documents_embeddings_session_idx on documents_embeddings (session_id);
create index if not exists documents_embeddings_kind_idx on documents_embeddings (kind);

-- Create IVFFlat index (you may need to run: create extension if not exists vector;)
-- adjust lists for performance vs recall in production
-- create index documents_embeddings_embedding_idx on documents_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Simple RPC for cosine match (expects pgvector 0.5+)
create or replace function match_documents(p_session_id text, p_query vector(1536), p_match_count int)
returns table(id uuid, text text, distance float)
language sql stable as $$
  select d.id, d.text, 1 - (d.embedding <#> p_query) as distance
  from documents_embeddings d
  where d.session_id = p_session_id
  order by d.embedding <#> p_query
  limit p_match_count;
$$;


