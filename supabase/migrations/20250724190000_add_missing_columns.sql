-- Add missing columns to existing token_usage_logs table
ALTER TABLE token_usage_logs 
ADD COLUMN IF NOT EXISTS task_type TEXT,
ADD COLUMN IF NOT EXISTS endpoint TEXT,
ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Update existing rows to have default values
UPDATE token_usage_logs 
SET 
  task_type = 'unknown',
  endpoint = 'unknown',
  success = true
WHERE task_type IS NULL;

-- Make task_type and endpoint NOT NULL after setting defaults
ALTER TABLE token_usage_logs 
ALTER COLUMN task_type SET NOT NULL,
ALTER COLUMN endpoint SET NOT NULL;

-- Create missing indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_task_type ON token_usage_logs(task_type);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_endpoint ON token_usage_logs(endpoint);

-- Create user_budgets table if it doesn't exist
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

-- Create index for user budgets
CREATE INDEX IF NOT EXISTS idx_user_budgets_user_id ON user_budgets(user_id);

-- Enable Row Level Security
ALTER TABLE token_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_budgets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own token usage logs" ON token_usage_logs;
DROP POLICY IF EXISTS "Users can insert their own token usage logs" ON token_usage_logs;
DROP POLICY IF EXISTS "Admins can view all token usage logs" ON token_usage_logs;
DROP POLICY IF EXISTS "Users can view their own budget" ON user_budgets;
DROP POLICY IF EXISTS "Users can update their own budget" ON user_budgets;
DROP POLICY IF EXISTS "System can insert user budgets" ON user_budgets;

-- RLS Policies for token_usage_logs
CREATE POLICY "Users can view their own token usage logs" ON token_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own token usage logs" ON token_usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all token usage logs" ON token_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_budgets 
      WHERE user_id = auth.uid() AND user_plan = 'premium'
    )
  );

-- RLS Policies for user_budgets
CREATE POLICY "Users can view their own budget" ON user_budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget" ON user_budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert user budgets" ON user_budgets
  FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_budgets
DROP TRIGGER IF EXISTS update_user_budgets_updated_at ON user_budgets;
CREATE TRIGGER update_user_budgets_updated_at 
  BEFORE UPDATE ON user_budgets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default budget for existing users
INSERT INTO user_budgets (user_id, daily_limit, monthly_limit, per_request_limit, user_plan)
SELECT 
  id as user_id,
  100000 as daily_limit,
  1000000 as monthly_limit,
  10000 as per_request_limit,
  'free' as user_plan
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_budgets);

-- Create view for daily usage summary
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

-- Grant permissions
GRANT SELECT, INSERT ON token_usage_logs TO authenticated;
GRANT SELECT, UPDATE ON user_budgets TO authenticated;
GRANT SELECT ON daily_token_usage TO authenticated; 