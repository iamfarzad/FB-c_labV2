-- Cleanup and Deploy Optimizations Migration
-- This migration handles existing policy conflicts and applies all optimizations

-- 1. Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can view their own token usage logs" ON token_usage_logs;
DROP POLICY IF EXISTS "Users can insert their own token usage logs" ON token_usage_logs;
DROP POLICY IF EXISTS "Admins can view all token usage logs" ON token_usage_logs;
DROP POLICY IF EXISTS "Users can view their own budget" ON user_budgets;
DROP POLICY IF EXISTS "Users can update their own budget" ON user_budgets;
DROP POLICY IF EXISTS "System can insert user budgets" ON user_budgets;

-- 2. Ensure tables exist with proper structure
CREATE TABLE IF NOT EXISTS token_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  estimated_cost DECIMAL(10,6) NOT NULL DEFAULT 0,
  task_type TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add missing columns if they don't exist
DO $$
BEGIN
  -- Add task_type if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'token_usage_logs' AND column_name = 'task_type') THEN
    ALTER TABLE token_usage_logs ADD COLUMN task_type TEXT NOT NULL DEFAULT 'unknown';
  END IF;
  
  -- Add endpoint if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'token_usage_logs' AND column_name = 'endpoint') THEN
    ALTER TABLE token_usage_logs ADD COLUMN endpoint TEXT NOT NULL DEFAULT 'unknown';
  END IF;
  
  -- Add success if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'token_usage_logs' AND column_name = 'success') THEN
    ALTER TABLE token_usage_logs ADD COLUMN success BOOLEAN NOT NULL DEFAULT true;
  END IF;
  
  -- Add error_message if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'token_usage_logs' AND column_name = 'error_message') THEN
    ALTER TABLE token_usage_logs ADD COLUMN error_message TEXT;
  END IF;
  
  -- Add estimated_cost if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'token_usage_logs' AND column_name = 'estimated_cost') THEN
    ALTER TABLE token_usage_logs ADD COLUMN estimated_cost DECIMAL(10,6) NOT NULL DEFAULT 0;
  END IF;
END $$;

-- 4. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_user_id ON token_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_created_at ON token_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_model ON token_usage_logs(model);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_task_type ON token_usage_logs(task_type);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_endpoint ON token_usage_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_session_id ON token_usage_logs(session_id);

-- 5. Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_user_date ON token_usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_user_model ON token_usage_logs(user_id, model);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_date_cost ON token_usage_logs(created_at DESC, estimated_cost DESC);

-- 6. Create user_budgets table if not exists
CREATE TABLE IF NOT EXISTS user_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  daily_limit INTEGER NOT NULL DEFAULT 100000,
  monthly_limit INTEGER NOT NULL DEFAULT 1000000,
  per_request_limit INTEGER NOT NULL DEFAULT 10000,
  user_plan TEXT NOT NULL DEFAULT 'free' CHECK (user_plan IN ('free', 'basic', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_budgets_user_id ON user_budgets(user_id);

-- 7. Create ai_responses table if not exists
CREATE TABLE IF NOT EXISTS ai_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  text TEXT,
  audio_data TEXT,
  image_data TEXT,
  response_type TEXT NOT NULL,
  tools_used TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_responses_session_id ON ai_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_user_id ON ai_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_activity_id ON ai_responses(activity_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_created_at ON ai_responses(created_at);

-- 8. Enable RLS on all tables
ALTER TABLE token_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;

-- 9. Create optimized RLS policies
CREATE POLICY "token_usage_select_own" ON token_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "token_usage_insert_own" ON token_usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "token_usage_update_own" ON token_usage_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_budgets_select_own" ON user_budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_budgets_insert_own" ON user_budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_budgets_update_own" ON user_budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ai_responses_select_own" ON ai_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ai_responses_insert_own" ON ai_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ai_responses_update_own" ON ai_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- 10. Create monitoring views
CREATE OR REPLACE VIEW daily_token_usage AS
SELECT 
  user_id,
  DATE(created_at) as usage_date,
  model,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(total_tokens) as total_tokens,
  SUM(estimated_cost) as total_cost,
  COUNT(*) as request_count
FROM token_usage_logs
GROUP BY user_id, DATE(created_at), model
ORDER BY usage_date DESC, total_cost DESC;

CREATE OR REPLACE VIEW user_usage_summary AS
SELECT 
  u.id as user_id,
  u.email,
  ub.user_plan,
  ub.daily_limit,
  ub.monthly_limit,
  COALESCE(daily_usage.daily_tokens, 0) as today_tokens,
  COALESCE(daily_usage.daily_cost, 0) as today_cost,
  COALESCE(monthly_usage.monthly_tokens, 0) as month_tokens,
  COALESCE(monthly_usage.monthly_cost, 0) as month_cost
FROM auth.users u
LEFT JOIN user_budgets ub ON u.id = ub.user_id
LEFT JOIN (
  SELECT 
    user_id,
    SUM(total_tokens) as daily_tokens,
    SUM(estimated_cost) as daily_cost
  FROM token_usage_logs 
  WHERE DATE(created_at) = CURRENT_DATE
  GROUP BY user_id
) daily_usage ON u.id = daily_usage.user_id
LEFT JOIN (
  SELECT 
    user_id,
    SUM(total_tokens) as monthly_tokens,
    SUM(estimated_cost) as monthly_cost
  FROM token_usage_logs 
  WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY user_id
) monthly_usage ON u.id = monthly_usage.user_id;

-- 11. Create performance monitoring functions
CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS TABLE (
  query text,
  calls bigint,
  total_time double precision,
  mean_time double precision,
  rows bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pg_stat_statements.query,
    pg_stat_statements.calls,
    pg_stat_statements.total_exec_time,
    pg_stat_statements.mean_exec_time,
    pg_stat_statements.rows
  FROM pg_stat_statements
  WHERE pg_stat_statements.mean_exec_time > 100
  ORDER BY pg_stat_statements.mean_exec_time DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create database health check function
CREATE OR REPLACE FUNCTION database_health_check()
RETURNS TABLE (
  metric text,
  value text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'active_connections'::text, COUNT(*)::text FROM pg_stat_activity WHERE state = 'active'
  UNION ALL
  SELECT 'idle_connections'::text, COUNT(*)::text FROM pg_stat_activity WHERE state = 'idle'
  UNION ALL
  SELECT 'database_size'::text, pg_size_pretty(pg_database_size(current_database()))
  UNION ALL
  SELECT 'cache_hit_ratio'::text, ROUND((sum(blks_hit) * 100.0 / sum(blks_hit + blks_read)), 2)::text || '%' 
    FROM pg_stat_database WHERE datname = current_database();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Grant necessary permissions
GRANT SELECT, INSERT ON token_usage_logs TO authenticated;
GRANT SELECT, UPDATE ON user_budgets TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ai_responses TO authenticated;
GRANT SELECT ON daily_token_usage TO authenticated;
GRANT SELECT ON user_usage_summary TO authenticated;

-- 14. Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_budgets_updated_at ON user_budgets;
CREATE TRIGGER update_user_budgets_updated_at
  BEFORE UPDATE ON user_budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_responses_updated_at ON ai_responses;
CREATE TRIGGER update_ai_responses_updated_at
  BEFORE UPDATE ON ai_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 15. Insert default budgets for existing users
INSERT INTO user_budgets (user_id, daily_limit, monthly_limit, per_request_limit, user_plan)
SELECT 
  id as user_id,
  100000 as daily_limit,
  1000000 as monthly_limit,
  10000 as per_request_limit,
  'free' as user_plan
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_budgets WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- 16. Enable realtime for tables
DO $$
BEGIN
    -- Enable realtime for activities table
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'activities'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE activities;
    END IF;
    
    -- Enable realtime for ai_responses table
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'ai_responses'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE ai_responses;
    END IF;
END $$;

-- 17. Create indexes for lead_summaries and lead_search_results if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lead_summaries') THEN
    CREATE INDEX IF NOT EXISTS idx_lead_summaries_user_id ON lead_summaries(user_id);
    CREATE INDEX IF NOT EXISTS idx_lead_summaries_created_at ON lead_summaries(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_lead_summaries_company_name ON lead_summaries(company_name);
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lead_search_results') THEN
    CREATE INDEX IF NOT EXISTS idx_lead_search_results_lead_id ON lead_search_results(lead_id);
    CREATE INDEX IF NOT EXISTS idx_lead_search_results_source ON lead_search_results(source);
    CREATE INDEX IF NOT EXISTS idx_lead_search_results_created_at ON lead_search_results(created_at DESC);
  END IF;
END $$;

-- 18. Analyze tables for better query planning
ANALYZE token_usage_logs;
ANALYZE user_budgets;
ANALYZE ai_responses;

-- Migration completed successfully
SELECT 'Database optimization migration completed successfully' as status;
