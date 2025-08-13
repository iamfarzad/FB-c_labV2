-- Enable UUID generation extensions (safe if already installed)
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- 1) Artifacts table (stores specs/code + metadata)
create table if not exists artifacts (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  lead_id uuid null,
  created_at timestamptz not null default now()
);

-- Link artifacts.lead_id -> lead_summaries(id)
alter table artifacts
  drop constraint if exists artifacts_lead_id_fkey,
  add constraint artifacts_lead_id_fkey
  foreign key (lead_id) references lead_summaries(id) on delete set null;

-- 2) Indexes for caching and lookups
create index if not exists idx_artifacts_type on artifacts(type);
create index if not exists idx_artifacts_hash on artifacts((metadata->>'hash'));
create index if not exists idx_artifacts_lead_id on artifacts(lead_id);

-- Unique per (type, metadata->>'hash') to prevent duplicates
do $$
begin
  if not exists (
    select 1 from pg_indexes where schemaname = 'public' and indexname = 'uniq_artifacts_type_hash'
  ) then
    execute 'create unique index uniq_artifacts_type_hash on artifacts(type, (metadata->>''hash''))';
  end if;
end$$;

-- 3) Conversation context: store the last user message
alter table conversation_contexts
  add column if not exists last_user_message text;


