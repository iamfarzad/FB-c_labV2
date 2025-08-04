-- Make total_tokens a generated column that automatically calculates input_tokens + output_tokens
-- First, drop the existing column and recreate it as generated

-- Remove any existing default value
ALTER TABLE token_usage_logs ALTER COLUMN total_tokens DROP DEFAULT;

-- Drop the column and recreate as generated
ALTER TABLE token_usage_logs DROP COLUMN total_tokens;
ALTER TABLE token_usage_logs ADD COLUMN total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED;

-- Add comment to document the generated column
COMMENT ON COLUMN token_usage_logs.total_tokens IS 'Automatically calculated as input_tokens + output_tokens (generated column)';

-- Update the view to reflect the change (it should still work the same)
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
