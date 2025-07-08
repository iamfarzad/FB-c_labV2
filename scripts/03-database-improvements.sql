-- Database improvements: auto-updating timestamps and enhanced security

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

-- Enable RLS on all tables if not already enabled
ALTER TABLE token_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service role access
CREATE POLICY "Service role can manage all tables"
 ON token_usage_logs
 FOR ALL
 USING (auth.role() = 'service_role')
 WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all tables"
 ON meetings
 FOR ALL
 USING (auth.role() = 'service_role')
 WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all tables"
 ON email_campaigns
 FOR ALL
 USING (auth.role() = 'service_role')
 WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all tables"
 ON lead_summaries
 FOR ALL
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
GRANT SELECT ON admin_stats_view TO service_role;
