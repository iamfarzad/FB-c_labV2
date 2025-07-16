-- GDPR Compliance and Audit Logging Tables
-- Migration: 20250711000000_gdpr_compliance.sql

-- Enable RLS on all tables
ALTER TABLE lead_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage_logs ENABLE ROW LEVEL SECURITY;

-- Add soft delete columns to existing tables
ALTER TABLE lead_summaries 
ADD COLUMN deleted_at TIMESTAMPTZ,
ADD COLUMN deletion_reason TEXT;

ALTER TABLE meetings 
ADD COLUMN deleted_at TIMESTAMPTZ,
ADD COLUMN deletion_reason TEXT;

ALTER TABLE email_events 
ADD COLUMN deleted_at TIMESTAMPTZ,
ADD COLUMN deletion_reason TEXT;

ALTER TABLE token_usage_logs 
ADD COLUMN deleted_at TIMESTAMPTZ,
ADD COLUMN deletion_reason TEXT;

-- Create GDPR deletion logs table
CREATE TABLE gdpr_deletion_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    deletion_requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    data_types TEXT[] NOT NULL,
    records_count JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_deletion' CHECK (status IN ('pending_deletion', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create GDPR export logs table
CREATE TABLE gdpr_export_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    export_requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    data_types TEXT[] NOT NULL,
    records_count JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create consent logs table
CREATE TABLE consent_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    consent_type TEXT NOT NULL CHECK (consent_type IN ('marketing', 'analytics', 'necessary')),
    granted BOOLEAN NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create audit logs table
CREATE TABLE audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    user_email TEXT,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    request_id TEXT,
    status_code INTEGER,
    access_level TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create rate limits table
CREATE TABLE rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    reset_time BIGINT NOT NULL,
    blocked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create activity logs table (if not exists)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    user_email TEXT,
    user_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_lead_summaries_email ON lead_summaries(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_lead_summaries_deleted_at ON lead_summaries(deleted_at);
CREATE INDEX idx_meetings_lead_id ON meetings(lead_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_meetings_deleted_at ON meetings(deleted_at);
CREATE INDEX idx_email_events_recipient ON email_events(recipient) WHERE deleted_at IS NULL;
CREATE INDEX idx_email_events_deleted_at ON email_events(deleted_at);
CREATE INDEX idx_token_usage_logs_user_id ON token_usage_logs(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_token_usage_logs_deleted_at ON token_usage_logs(deleted_at);

CREATE INDEX idx_gdpr_deletion_logs_email ON gdpr_deletion_logs(email);
CREATE INDEX idx_gdpr_deletion_logs_status ON gdpr_deletion_logs(status);
CREATE INDEX idx_gdpr_export_logs_email ON gdpr_export_logs(email);
CREATE INDEX idx_gdpr_export_logs_status ON gdpr_export_logs(status);
CREATE INDEX idx_consent_logs_email ON consent_logs(email);
CREATE INDEX idx_consent_logs_timestamp ON consent_logs(timestamp);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_user_email ON audit_logs(user_email);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_rate_limits_reset_time ON rate_limits(reset_time);
CREATE INDEX idx_activity_logs_type ON activity_logs(type);
CREATE INDEX idx_activity_logs_user_email ON activity_logs(user_email);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Create RLS policies for GDPR compliance

-- Lead summaries: Users can only see their own data
CREATE POLICY "Users can view own lead data" ON lead_summaries
    FOR SELECT USING (
        email = current_setting('request.jwt.claims', true)::json->>'email'
        AND deleted_at IS NULL
    );

-- Lead summaries: Only system can insert/update
CREATE POLICY "System can manage lead data" ON lead_summaries
    FOR ALL USING (auth.role() = 'service_role');

-- Meetings: Users can only see meetings for their leads
CREATE POLICY "Users can view own meeting data" ON meetings
    FOR SELECT USING (
        lead_id IN (
            SELECT id FROM lead_summaries 
            WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
            AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

-- Meetings: Only system can insert/update
CREATE POLICY "System can manage meeting data" ON meetings
    FOR ALL USING (auth.role() = 'service_role');

-- Email events: Users can only see their own email events
CREATE POLICY "Users can view own email events" ON email_events
    FOR SELECT USING (
        recipient = current_setting('request.jwt.claims', true)::json->>'email'
        AND deleted_at IS NULL
    );

-- Email events: Only system can insert/update
CREATE POLICY "System can manage email events" ON email_events
    FOR ALL USING (auth.role() = 'service_role');

-- Token usage logs: Users can only see their own usage
CREATE POLICY "Users can view own token usage" ON token_usage_logs
    FOR SELECT USING (
        user_id = current_setting('request.jwt.claims', true)::json->>'email'
        AND deleted_at IS NULL
    );

-- Token usage logs: Only system can insert/update
CREATE POLICY "System can manage token usage" ON token_usage_logs
    FOR ALL USING (auth.role() = 'service_role');

-- GDPR logs: Users can only see their own GDPR logs
CREATE POLICY "Users can view own GDPR logs" ON gdpr_deletion_logs
    FOR SELECT USING (
        email = current_setting('request.jwt.claims', true)::json->>'email'
    );

CREATE POLICY "Users can view own GDPR export logs" ON gdpr_export_logs
    FOR SELECT USING (
        email = current_setting('request.jwt.claims', true)::json->>'email'
    );

-- GDPR logs: Only system can insert/update
CREATE POLICY "System can manage GDPR logs" ON gdpr_deletion_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "System can manage GDPR export logs" ON gdpr_export_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Consent logs: Users can only see their own consent logs
CREATE POLICY "Users can view own consent logs" ON consent_logs
    FOR SELECT USING (
        email = current_setting('request.jwt.claims', true)::json->>'email'
    );

-- Consent logs: Only system can insert/update
CREATE POLICY "System can manage consent logs" ON consent_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Audit logs: Only system can access
CREATE POLICY "System can manage audit logs" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Rate limits: Only system can access
CREATE POLICY "System can manage rate limits" ON rate_limits
    FOR ALL USING (auth.role() = 'service_role');

-- Activity logs: Users can only see their own activity logs
CREATE POLICY "Users can view own activity logs" ON activity_logs
    FOR SELECT USING (
        user_email = current_setting('request.jwt.claims', true)::json->>'email'
    );

-- Activity logs: Only system can insert/update
CREATE POLICY "System can manage activity logs" ON activity_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_gdpr_deletion_logs_updated_at 
    BEFORE UPDATE ON gdpr_deletion_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gdpr_export_logs_updated_at 
    BEFORE UPDATE ON gdpr_export_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at 
    BEFORE UPDATE ON rate_limits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_logs_updated_at 
    BEFORE UPDATE ON activity_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired rate limits
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM rate_limits 
    WHERE reset_time < EXTRACT(EPOCH FROM NOW()) * 1000;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired rate limits (runs every hour)
SELECT cron.schedule(
    'cleanup-expired-rate-limits',
    '0 * * * *', -- Every hour
    'SELECT cleanup_expired_rate_limits();'
);

-- Create function to anonymize deleted data
CREATE OR REPLACE FUNCTION anonymize_deleted_data()
RETURNS void AS $$
BEGIN
    -- Anonymize leads deleted more than 30 days ago
    UPDATE lead_summaries 
    SET 
        name = 'ANONYMIZED',
        email = 'anonymized_' || id,
        company_name = NULL,
        conversation_summary = NULL,
        consultant_brief = NULL
    WHERE 
        deleted_at IS NOT NULL 
        AND deleted_at < NOW() - INTERVAL '30 days'
        AND name != 'ANONYMIZED';
    
    -- Anonymize meetings deleted more than 30 days ago
    UPDATE meetings 
    SET 
        attendee_name = 'ANONYMIZED',
        attendee_email = 'anonymized_' || id,
        notes = NULL
    WHERE 
        deleted_at IS NOT NULL 
        AND deleted_at < NOW() - INTERVAL '30 days'
        AND attendee_name != 'ANONYMIZED';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to anonymize deleted data (runs daily)
SELECT cron.schedule(
    'anonymize-deleted-data',
    '0 2 * * *', -- Daily at 2 AM
    'SELECT anonymize_deleted_data();'
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create views for easier data access
CREATE VIEW active_leads AS
SELECT * FROM lead_summaries WHERE deleted_at IS NULL;

CREATE VIEW active_meetings AS
SELECT * FROM meetings WHERE deleted_at IS NULL;

CREATE VIEW active_email_events AS
SELECT * FROM email_events WHERE deleted_at IS NULL;

CREATE VIEW active_token_usage AS
SELECT * FROM token_usage_logs WHERE deleted_at IS NULL;

-- Grant permissions on views
GRANT SELECT ON active_leads TO anon, authenticated;
GRANT SELECT ON active_meetings TO anon, authenticated;
GRANT SELECT ON active_email_events TO anon, authenticated;
GRANT SELECT ON active_token_usage TO anon, authenticated;