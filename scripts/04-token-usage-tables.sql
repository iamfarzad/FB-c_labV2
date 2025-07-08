-- Token Usage Tracking Tables
-- Run this script to set up comprehensive token cost tracking

-- Create token usage logs table
CREATE TABLE IF NOT EXISTS token_usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    input_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    output_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    total_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    request_type TEXT DEFAULT 'chat',
    user_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cost budgets table
CREATE TABLE IF NOT EXISTS cost_budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider TEXT NOT NULL,
    budget_limit DECIMAL(10, 2) NOT NULL,
    period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
    current_spend DECIMAL(10, 6) DEFAULT 0,
    alert_threshold DECIMAL(3, 2) DEFAULT 0.8, -- 80% threshold
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
    event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'bounced', 'complained', 'opened', 'clicked')),
    recipient TEXT NOT NULL,
    subject TEXT,
    event_data JSONB DEFAULT '{}',
    bounce_reason TEXT,
    click_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_session_id ON token_usage_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_provider ON token_usage_logs(provider);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_created_at ON token_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_provider_model ON token_usage_logs(provider, model);
CREATE INDEX IF NOT EXISTS idx_cost_budgets_provider ON cost_budgets(provider);
CREATE INDEX IF NOT EXISTS idx_email_events_email_id ON email_events(email_id);
CREATE INDEX IF NOT EXISTS idx_email_events_recipient ON email_events(recipient);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON email_events(created_at);

-- Create materialized view for fast analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS token_usage_summary AS
SELECT 
    DATE(created_at) as usage_date,
    provider,
    model,
    COUNT(*) as request_count,
    SUM(input_tokens) as total_input_tokens,
    SUM(output_tokens) as total_output_tokens,
    SUM(total_tokens) as total_tokens,
    SUM(total_cost) as total_cost,
    AVG(total_cost) as avg_cost_per_request
FROM token_usage_logs
GROUP BY DATE(created_at), provider, model
ORDER BY usage_date DESC, provider, model;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_token_usage_summary_unique 
ON token_usage_summary(usage_date, provider, model);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_token_usage_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY token_usage_summary;
END;
$$ LANGUAGE plpgsql;

-- Function to check budget alerts
CREATE OR REPLACE FUNCTION check_budget_alerts()
RETURNS void AS $$
DECLARE
    budget_record RECORD;
    current_spend DECIMAL(10, 6);
    alert_threshold_amount DECIMAL(10, 6);
BEGIN
    FOR budget_record IN SELECT * FROM cost_budgets WHERE is_active = true LOOP
        -- Calculate current spend for the budget period
        SELECT COALESCE(SUM(total_cost), 0) INTO current_spend
        FROM token_usage_logs
        WHERE provider = budget_record.provider
        AND created_at >= CASE 
            WHEN budget_record.period = 'daily' THEN CURRENT_DATE
            WHEN budget_record.period = 'weekly' THEN DATE_TRUNC('week', CURRENT_DATE)
            WHEN budget_record.period = 'monthly' THEN DATE_TRUNC('month', CURRENT_DATE)
            WHEN budget_record.period = 'yearly' THEN DATE_TRUNC('year', CURRENT_DATE)
        END;

        -- Update current spend
        UPDATE cost_budgets 
        SET current_spend = current_spend, updated_at = NOW()
        WHERE id = budget_record.id;

        -- Check for threshold alert
        alert_threshold_amount := budget_record.budget_limit * budget_record.alert_threshold;
        
        IF current_spend >= alert_threshold_amount AND current_spend < budget_record.budget_limit THEN
            INSERT INTO cost_alerts (budget_id, alert_type, message)
            SELECT budget_record.id, 'threshold', 
                   FORMAT('Budget threshold reached: %s spent of %s limit for %s (%s)', 
                          current_spend, budget_record.budget_limit, budget_record.provider, budget_record.period)
            WHERE NOT EXISTS (
                SELECT 1 FROM cost_alerts 
                WHERE budget_id = budget_record.id 
                AND alert_type = 'threshold' 
                AND DATE(created_at) = CURRENT_DATE
            );
        END IF;

        -- Check for exceeded alert
        IF current_spend >= budget_record.budget_limit THEN
            INSERT INTO cost_alerts (budget_id, alert_type, message)
            SELECT budget_record.id, 'exceeded', 
                   FORMAT('Budget exceeded: %s spent, %s limit for %s (%s)', 
                          current_spend, budget_record.budget_limit, budget_record.provider, budget_record.period)
            WHERE NOT EXISTS (
                SELECT 1 FROM cost_alerts 
                WHERE budget_id = budget_record.id 
                AND alert_type = 'exceeded' 
                AND DATE(created_at) = CURRENT_DATE
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert default budgets
INSERT INTO cost_budgets (provider, budget_limit, period) VALUES
    ('gemini', 100.00, 'monthly'),
    ('openai', 200.00, 'monthly'),
    ('anthropic', 150.00, 'monthly'),
    ('groq', 50.00, 'monthly'),
    ('xai', 100.00, 'monthly')
ON CONFLICT (provider, period) DO NOTHING;

-- Add email campaign tracking columns
ALTER TABLE email_campaigns 
ADD COLUMN IF NOT EXISTS sent_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivered_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS opened_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicked_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bounced_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS complained_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMP WITH TIME ZONE;

-- Add email tracking columns to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'active' CHECK (email_status IN ('active', 'bounced', 'complained')),
ADD COLUMN IF NOT EXISTS last_email_opened TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_email_clicked TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_email_bounce TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_engagement_score INTEGER DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE token_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now, can be restricted later)
CREATE POLICY "Allow all operations on token_usage_logs" ON token_usage_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations on cost_budgets" ON cost_budgets FOR ALL USING (true);
CREATE POLICY "Allow all operations on cost_alerts" ON cost_alerts FOR ALL USING (true);
CREATE POLICY "Allow all operations on email_events" ON email_events FOR ALL USING (true);

-- Create a function to automatically refresh the materialized view
CREATE OR REPLACE FUNCTION auto_refresh_token_summary()
RETURNS trigger AS $$
BEGIN
    -- Refresh the materialized view when new data is inserted
    PERFORM refresh_token_usage_summary();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-refresh summary (but limit frequency)
CREATE OR REPLACE FUNCTION should_refresh_summary()
RETURNS boolean AS $$
BEGIN
    -- Only refresh if last refresh was more than 5 minutes ago
    RETURN NOT EXISTS (
        SELECT 1 FROM pg_stat_user_tables 
        WHERE relname = 'token_usage_summary' 
        AND last_autoanalyze > NOW() - INTERVAL '5 minutes'
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE token_usage_logs IS 'Comprehensive logging of AI token usage and costs';
COMMENT ON TABLE cost_budgets IS 'Budget limits and tracking for AI providers';
COMMENT ON TABLE cost_alerts IS 'Automated alerts for budget thresholds and overages';
COMMENT ON TABLE email_events IS 'Email webhook events from Resend service';
COMMENT ON MATERIALIZED VIEW token_usage_summary IS 'Aggregated daily token usage statistics for fast analytics';
