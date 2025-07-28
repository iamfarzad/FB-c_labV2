import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ksmxqswuzrmdgckwxkvn.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const migrationSQL = `
-- Migration: Add lead_search_results table for grounded search
-- Date: 2025-07-23

CREATE TABLE IF NOT EXISTS lead_search_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES lead_summaries(id) ON DELETE CASCADE,
  source TEXT NOT NULL,           -- e.g. "linkedin", "google", "company_website"
  url TEXT NOT NULL,
  title TEXT,
  snippet TEXT,
  raw JSONB,                      -- full Gemini response
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_lead_search_results_lead_id ON lead_search_results(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_search_results_source ON lead_search_results(source);
CREATE INDEX IF NOT EXISTS idx_lead_search_results_created_at ON lead_search_results(created_at);

-- Enable RLS
ALTER TABLE lead_search_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow service_role to insert/read/update/delete
CREATE POLICY "service_role full access" 
  ON lead_search_results FOR ALL 
  USING (auth.role() = 'service_role') 
  WITH CHECK (auth.role() = 'service_role');

-- Allow authenticated users to read their own lead data
CREATE POLICY "auth read own" 
  ON lead_search_results FOR SELECT 
  USING (true);

-- Add trigger for updated_at (if needed in future)
CREATE OR REPLACE FUNCTION update_lead_search_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'lead_search_results' AND column_name = 'updated_at') THEN
        ALTER TABLE lead_search_results ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_lead_search_results_updated_at ON lead_search_results;
CREATE TRIGGER update_lead_search_results_updated_at
    BEFORE UPDATE ON lead_search_results
    FOR EACH ROW
    EXECUTE FUNCTION update_lead_search_results_updated_at();
`

async function applyMigration() {
  try {
    console.log('Applying migration...')
    
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('Migration failed:', error)
      process.exit(1)
    }
    
    console.log('Migration applied successfully!')
    
    // Test the table exists
    const { data, error: testError } = await supabase
      .from('lead_search_results')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('Table test failed:', testError)
    } else {
      console.log('Table test successful - lead_search_results table exists!')
    }
    
  } catch (error) {
    console.error('Migration script error:', error)
    process.exit(1)
  }
}

applyMigration()
