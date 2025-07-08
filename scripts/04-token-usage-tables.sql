-- Token Usage Tracking Tables
-- Run this script to set up comprehensive token cost tracking

-- Drop old token_usage_logs if it exists to replace with a more detailed one
DROP TABLE IF EXISTS token_usage_logs CASCADE;

-- Create enhanced token usage logs table
CREATE TABLE IF NOT EXISTS token_usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
    input_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    output_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    total_cost DECIMAL(10, 6) GENERATED ALWAYS AS (input_cost + output_cost) STORED,
    request_type TEXT DEFAULT 'chat',
    user_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cost budgets table
CREATE TABLE IF NOT EXISTS cost_budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider TEXT NOT NULL,
    budget_limit DECIMAL(10, 2) NOT NULL,
    period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
    current_spend DECIMAL(10, 6) DEFAULT 0,
    alert_threshold DECIMAL(3, 2) DEFAULT 0.80, -- 80% threshold
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, period)
);

-- Create cost alerts table
CREATE TABLE IF NOT EXISTS cost_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    budget_id UUID REFERENCES cost_budgets(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('threshold', 'exceeded', 'daily_summary')),
    message TEXT NOT NULL,
    is_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email events table for webhook tracking
CREATE TABLE IF NOT EXISTS email_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    recipient TEXT NOT NULL,
    subject TEXT,
    event_data JSONB,
    bounce_reason TEXT,
    click_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_session_id ON token_usage_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_provider ON token_usage_logs(provider);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_created_at ON token_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_cost_budgets_provider ON cost_budgets(provider);
CREATE INDEX IF NOT EXISTS idx_email_events_email_id ON email_events(email_id);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON email_events(event_type);

-- Insert default budgets
INSERT INTO cost_budgets (provider, budget_limit, period) VALUES
    ('gemini', 100.00, 'monthly'),
    ('openai', 200.00, 'monthly'),
    ('anthropic', 150.00, 'monthly'),
    ('groq', 50.00, 'monthly'),
    ('xai', 100.00, 'monthly')
ON CONFLICT (provider, period) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE cost_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies (secure by default, only service_role can access)
CREATE POLICY "Allow service_role access" ON cost_budgets FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service_role access" ON cost_alerts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service_role access" ON email_events FOR ALL USING (auth.role() = 'service_role');
