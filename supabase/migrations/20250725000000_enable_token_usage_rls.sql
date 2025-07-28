-- Enable Row Level Security for token usage and budget tables
-- Migration: 20250725000000_enable_token_usage_rls.sql

-- Enable RLS on token_usage_logs table
ALTER TABLE token_usage_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for token_usage_logs
CREATE POLICY insert_own_tokens ON token_usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY select_own_tokens ON token_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY update_own_tokens ON token_usage_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS on user_budgets table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_budgets') THEN
    ALTER TABLE user_budgets ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY insert_own_budgets ON user_budgets
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY select_own_budgets ON user_budgets
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY update_own_budgets ON user_budgets
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Enable RLS on demo_sessions table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'demo_sessions') THEN
    ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY insert_own_sessions ON demo_sessions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY select_own_sessions ON demo_sessions
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY update_own_sessions ON demo_sessions
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for better performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_user_id ON token_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_correlation_id ON token_usage_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_session_id ON token_usage_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_created_at ON token_usage_logs(created_at);

-- Add comments for documentation
COMMENT ON POLICY insert_own_tokens ON token_usage_logs IS 'Users can only insert their own token usage records';
COMMENT ON POLICY select_own_tokens ON token_usage_logs IS 'Users can only view their own token usage records';
COMMENT ON POLICY update_own_tokens ON token_usage_logs IS 'Users can only update their own token usage records';
