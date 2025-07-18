-- Create lead_summaries table
CREATE TABLE IF NOT EXISTS lead_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    company_name TEXT,
    role TEXT,
    interests TEXT,
    lead_score INTEGER,
    conversation_summary TEXT,
    consultant_brief TEXT,
    ai_capabilities_shown TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create function to update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update 'updated_at' on row update
CREATE TRIGGER update_lead_summaries_updated_at
BEFORE UPDATE ON lead_summaries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE lead_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies for lead_summaries
-- Allow public read access
CREATE POLICY "Allow public read access" ON lead_summaries FOR SELECT USING (true);
-- Allow authenticated users to insert their own lead summary
CREATE POLICY "Allow authenticated insert" ON lead_summaries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Allow users to update their own summary
CREATE POLICY "Allow user update" ON lead_summaries FOR UPDATE USING (auth.uid() = id);
-- Allow service_role to bypass RLS
CREATE POLICY "Allow service_role access" ON lead_summaries FOR ALL USING (auth.role() = 'service_role');

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_lead_summaries_email ON lead_summaries(email);
CREATE INDEX IF NOT EXISTS idx_lead_summaries_created_at ON lead_summaries(created_at);
-- Meetings Table
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES lead_summaries(id) ON DELETE SET NULL,
    attendee_name TEXT NOT NULL,
    attendee_email TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled', -- e.g., scheduled, completed, cancelled, no-show
    meeting_link TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Email Campaigns Table
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_template TEXT NOT NULL,
    target_segment TEXT, -- e.g., 'new_leads', 'high_score_leads'
    status TEXT NOT NULL DEFAULT 'draft', -- e.g., draft, scheduled, sending, sent, archived
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Triggers for updated_at
CREATE TRIGGER update_meetings_updated_at
BEFORE UPDATE ON meetings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at
BEFORE UPDATE ON email_campaigns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS for Meetings
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admin access to meetings" ON meetings FOR ALL USING (auth.role() = 'service_role');

-- RLS for Email Campaigns
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admin access to email campaigns" ON email_campaigns FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meetings_lead_id ON meetings(lead_id);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
-- Database improvements: auto-updating timestamps and enhanced security

-- Function to auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply auto-update triggers to meetings table
DROP TRIGGER IF EXISTS update_meetings_updated_at ON meetings;
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply auto-update triggers to email_campaigns table
DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enhanced RLS policies with WITH CHECK for better security
DROP POLICY IF EXISTS "Service role can manage token_usage_logs" ON token_usage_logs;
CREATE POLICY "Service role can manage token_usage_logs"
  ON token_usage_logs
  FOR ALL
  TO authenticated
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage meetings" ON meetings;
CREATE POLICY "Service role can manage meetings"
  ON meetings
  FOR ALL
  TO authenticated
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage email_campaigns" ON email_campaigns;
CREATE POLICY "Service role can manage email_campaigns"
  ON email_campaigns
  FOR ALL
  TO authenticated
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Analytics views for better performance
CREATE OR REPLACE VIEW admin_stats_view AS
SELECT 
  COUNT(DISTINCT ls.id) as total_leads,
  COUNT(DISTINCT CASE WHEN ls.lead_score > 70 THEN ls.id END) as high_score_leads,
  COUNT(DISTINCT m.id) as total_meetings,
  COUNT(DISTINCT CASE WHEN m.status = 'completed' THEN m.id END) as completed_meetings,
  COALESCE(SUM(tul.total_cost), 0) as total_token_cost,
  COUNT(DISTINCT ec.id) as total_campaigns
FROM lead_summaries ls
LEFT JOIN meetings m ON ls.id = m.lead_id
LEFT JOIN token_usage_logs tul ON tul.created_at >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN email_campaigns ec ON ec.created_at >= CURRENT_DATE - INTERVAL '30 days';

-- Grant access to the view
GRANT SELECT ON admin_stats_view TO authenticated;

-- Activities table for activity logging
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

-- Enable realtime for activities table
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
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
