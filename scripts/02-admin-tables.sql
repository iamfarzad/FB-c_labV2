-- Admin dashboard tables for comprehensive business management
-- Token usage tracking, meetings, and email campaigns

-- Function to auto-update updated_at column (if not already created)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Token usage logs for cost tracking
CREATE TABLE IF NOT EXISTS token_usage_logs (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 session_id UUID,
 provider TEXT NOT NULL CHECK (provider IN ('gemini', 'openai', 'anthropic', 'groq')),
 model TEXT NOT NULL,
 input_tokens INTEGER NOT NULL DEFAULT 0,
 output_tokens INTEGER NOT NULL DEFAULT 0,
 input_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
 output_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
 total_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meetings table for consultation scheduling
CREATE TABLE IF NOT EXISTS meetings (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 lead_id UUID REFERENCES lead_summaries(id) ON DELETE CASCADE,
 name TEXT NOT NULL,
 email TEXT NOT NULL,
 company TEXT,
 meeting_date DATE NOT NULL,
 meeting_time TIME NOT NULL,
 time_zone TEXT NOT NULL DEFAULT 'EST',
 status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show')),
 meeting_link TEXT NOT NULL,
 notes TEXT,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email campaigns for lead nurturing
CREATE TABLE IF NOT EXISTS email_campaigns (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 name TEXT NOT NULL,
 subject TEXT NOT NULL,
 template TEXT NOT NULL DEFAULT 'lead-followup',
 target_segment TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'scheduled')),
 sent_count INTEGER NOT NULL DEFAULT 0,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_created_at ON token_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_provider ON token_usage_logs(provider);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_session_id ON token_usage_logs(session_id);

CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_lead_id ON meetings(lead_id);
CREATE INDEX IF NOT EXISTS idx_meetings_email ON meetings(email);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON email_campaigns(created_at);
