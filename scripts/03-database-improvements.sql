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
