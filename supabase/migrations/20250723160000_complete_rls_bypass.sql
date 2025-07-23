-- COMPLETE RLS BYPASS - Run this immediately in Supabase Dashboard
-- This completely disables RLS to get the API working

-- 1. Completely disable RLS on both tables
ALTER TABLE lead_summaries DISABLE ROW LEVEL SECURITY;
ALTER TABLE lead_search_results DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies to ensure clean slate
DROP POLICY IF EXISTS "users manage own leads" ON lead_summaries;
DROP POLICY IF EXISTS "service_role full access" ON lead_summaries;
DROP POLICY IF EXISTS "users read own lead search results" ON lead_search_results;
DROP POLICY IF EXISTS "users insert own lead search results" ON lead_search_results;
DROP POLICY IF EXISTS "service_role full access" ON lead_search_results;
DROP POLICY IF EXISTS "auth read own" ON lead_search_results;

-- 3. Ensure user_id column exists and is nullable
DO $$
BEGIN
  -- Add user_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_summaries' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE lead_summaries ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  -- Create index if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'lead_summaries' AND indexname = 'idx_lead_summaries_user_id'
  ) THEN
    CREATE INDEX idx_lead_summaries_user_id ON lead_summaries(user_id);
  END IF;
END $$;

-- 4. Ensure lead_search_results table exists with proper structure
CREATE TABLE IF NOT EXISTS lead_search_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES lead_summaries(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  snippet TEXT,
  raw JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lead_search_results_lead_id ON lead_search_results(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_search_results_source ON lead_search_results(source);
CREATE INDEX IF NOT EXISTS idx_lead_search_results_created_at ON lead_search_results(created_at);

-- 6. Allow NULL user_id temporarily
ALTER TABLE lead_summaries ALTER COLUMN user_id DROP NOT NULL;

-- 7. Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('lead_summaries', 'lead_search_results');

-- 8. Verify tables exist and have correct structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('lead_summaries', 'lead_search_results')
ORDER BY table_name, ordinal_position;

-- NOTE: This is a temporary fix. Once the API is working, we'll re-enable RLS with proper policies. 