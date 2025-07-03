-- Lead summaries table (minimal storage)
CREATE TABLE lead_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT,
  conversation_summary TEXT NOT NULL,
  consultant_brief TEXT NOT NULL,
  lead_score INTEGER DEFAULT 0,
  ai_capabilities_shown TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE lead_summaries;

-- Indexes for performance
CREATE INDEX idx_lead_summaries_email ON lead_summaries(email);
CREATE INDEX idx_lead_summaries_lead_score ON lead_summaries(lead_score DESC);
CREATE INDEX idx_lead_summaries_created_at ON lead_summaries(created_at DESC);
