-- Conversational Intelligence Database Migration
-- Creates tables for context management, intent detection, and capability tracking

create table if not exists conversation_contexts (
  session_id text primary key,
  email text not null,
  name text,
  company_url text,
  company_context jsonb,
  person_context jsonb,
  role text,
  role_confidence numeric,
  intent_data jsonb,
  ai_capabilities_shown text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists intent_classifications (
  id uuid primary key default gen_random_uuid(),
  session_id text references conversation_contexts(session_id),
  intent text,
  confidence numeric,
  slots jsonb,
  created_at timestamptz default now()
);

create table if not exists capability_usage (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  capability_name text,
  usage_count int default 1,
  usage_data jsonb,
  created_at timestamptz default now()
);

-- Add indexes for performance
create index if not exists idx_conversation_contexts_email on conversation_contexts(email);
create index if not exists idx_intent_classifications_session on intent_classifications(session_id);
create index if not exists idx_capability_usage_session on capability_usage(session_id);

-- Add columns to existing lead_summaries table if they don't exist
alter table lead_summaries add column if not exists consultant_brief text;
alter table lead_summaries add column if not exists conversation_summary text;
alter table lead_summaries add column if not exists intent_type text;

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for conversation_contexts
create trigger update_conversation_contexts_updated_at
  before update on conversation_contexts
  for each row
  execute function update_updated_at_column();
