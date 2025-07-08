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
