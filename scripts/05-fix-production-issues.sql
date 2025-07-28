-- Fix production deployment issues
-- This script addresses RLS policy problems and schema mismatches

-- Update RLS policies for lead_summaries to allow anonymous lead capture
DROP POLICY IF EXISTS "Allow authenticated insert" ON lead_summaries;
DROP POLICY IF EXISTS "Allow user update" ON lead_summaries;
DROP POLICY IF EXISTS "Allow service_role access" ON lead_summaries;

-- Create new policies that work for lead capture
CREATE POLICY "Allow anonymous insert for lead capture" ON lead_summaries 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON lead_summaries 
  FOR SELECT USING (true);

CREATE POLICY "Allow service_role full access" ON lead_summaries 
  FOR ALL USING (auth.role() = 'service_role');

-- Add missing columns to token_usage_logs if they don't exist
ALTER TABLE token_usage_logs 
ADD COLUMN IF NOT EXISTS total_tokens INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS request_type TEXT DEFAULT 'chat',
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create activities table for activity logging
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for activities table
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert for activities" ON activities 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access for activities" ON activities 
  FOR SELECT USING (true);

-- Indexes for activities
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Add updated_at column to lead_summaries if it doesn't exist
ALTER TABLE lead_summaries 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create or replace the update trigger for lead_summaries
DROP TRIGGER IF EXISTS update_lead_summaries_updated_at ON lead_summaries;
CREATE TRIGGER update_lead_summaries_updated_at
  BEFORE UPDATE ON lead_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a table for leads (different from lead_summaries for the new schema)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  role TEXT,
  interests TEXT,
  challenges TEXT,
  session_summary TEXT,
  tc_acceptance JSONB,
  lead_score INTEGER DEFAULT 50,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  source TEXT DEFAULT 'chat_interaction',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for leads table
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert for leads" ON leads 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access for leads" ON leads 
  FOR SELECT USING (true);

CREATE POLICY "Allow service_role full access for leads" ON leads 
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger for leads updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for leads
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads(lead_score DESC);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
