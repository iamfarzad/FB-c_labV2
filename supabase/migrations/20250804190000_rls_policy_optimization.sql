-- RLS Policy Optimization Migration
-- Date: 2025-08-04
-- Purpose: Standardize and optimize Row Level Security policies

-- ============================================================================
-- RLS POLICY CLEANUP AND STANDARDIZATION
-- ============================================================================

-- Drop all existing policies to ensure clean state
-- Lead Summaries
DROP POLICY IF EXISTS "users manage own leads" ON lead_summaries;
DROP POLICY IF EXISTS "service_role full access" ON lead_summaries;
DROP POLICY IF EXISTS "Allow public read access" ON lead_summaries;
DROP POLICY IF EXISTS "Allow authenticated insert" ON lead_summaries;
DROP POLICY IF EXISTS "Allow user update" ON lead_summaries;
DROP POLICY IF EXISTS "Allow service_role access" ON lead_summaries;

-- Lead Search Results
DROP POLICY IF EXISTS "users read own lead search results" ON lead_search_results;
DROP POLICY IF EXISTS "users insert own lead search results" ON lead_search_results;
DROP POLICY IF EXISTS "users update own lead search results" ON lead_search_results;
DROP POLICY IF EXISTS "users delete own lead search results" ON lead_search_results;
DROP POLICY IF EXISTS "service_role full access" ON lead_search_results;
DROP POLICY IF EXISTS "auth read own" ON lead_search_results;

-- Activities
DROP POLICY IF EXISTS "Allow anonymous insert for activities" ON activities;
DROP POLICY IF EXISTS "Allow public read access for activities" ON activities;

-- Token Usage Logs
DROP POLICY IF EXISTS "Users can view their own token usage logs" ON token_usage_logs;
DROP POLICY IF EXISTS "Users can insert their own token usage logs" ON token_usage_logs;
DROP POLICY IF EXISTS "Admins can view all token usage logs" ON token_usage_logs;
DROP POLICY IF EXISTS "insert_own_tokens" ON token_usage_logs;
DROP POLICY IF EXISTS "select_own_tokens" ON token_usage_logs;
DROP POLICY IF EXISTS "update_own_tokens" ON token_usage_logs;

-- User Budgets
DROP POLICY IF EXISTS "Users can view their own budget" ON user_budgets;
DROP POLICY IF EXISTS "Users can update their own budget" ON user_budgets;
DROP POLICY IF EXISTS "System can insert user budgets" ON user_budgets;
DROP POLICY IF EXISTS "insert_own_budgets" ON user_budgets;
DROP POLICY IF EXISTS "select_own_budgets" ON user_budgets;
DROP POLICY IF EXISTS "update_own_budgets" ON user_budgets;

-- AI Responses
DROP POLICY IF EXISTS "Users can view their own AI responses" ON ai_responses;
DROP POLICY IF EXISTS "Users can insert their own AI responses" ON ai_responses;
DROP POLICY IF EXISTS "Authenticated users can update their own responses" ON ai_responses;

-- ============================================================================
-- STANDARDIZED RLS POLICIES
-- ============================================================================

-- LEAD SUMMARIES POLICIES
-- Service role has full access (bypasses RLS)
CREATE POLICY "lead_summaries_service_role_all" ON lead_summaries
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Users can manage their own leads
CREATE POLICY "lead_summaries_user_select" ON lead_summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "lead_summaries_user_insert" ON lead_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lead_summaries_user_update" ON lead_summaries
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lead_summaries_user_delete" ON lead_summaries
  FOR DELETE USING (auth.uid() = user_id);

-- LEAD SEARCH RESULTS POLICIES
-- Service role has full access
CREATE POLICY "lead_search_results_service_role_all" ON lead_search_results
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Users can access search results for their own leads
CREATE POLICY "lead_search_results_user_select" ON lead_search_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lead_summaries 
      WHERE lead_summaries.id = lead_search_results.lead_id 
      AND lead_summaries.user_id = auth.uid()
    )
  );

CREATE POLICY "lead_search_results_user_insert" ON lead_search_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lead_summaries 
      WHERE lead_summaries.id = lead_search_results.lead_id 
      AND lead_summaries.user_id = auth.uid()
    )
  );

CREATE POLICY "lead_search_results_user_update" ON lead_search_results
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lead_summaries 
      WHERE lead_summaries.id = lead_search_results.lead_id 
      AND lead_summaries.user_id = auth.uid()
    )
  );

CREATE POLICY "lead_search_results_user_delete" ON lead_search_results
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lead_summaries 
      WHERE lead_summaries.id = lead_search_results.lead_id 
      AND lead_summaries.user_id = auth.uid()
    )
  );

-- ACTIVITIES POLICIES
-- Service role has full access
CREATE POLICY "activities_service_role_all" ON activities
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Allow authenticated users to read all activities (for system monitoring)
CREATE POLICY "activities_authenticated_select" ON activities
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert activities
CREATE POLICY "activities_authenticated_insert" ON activities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- TOKEN USAGE LOGS POLICIES
-- Service role has full access
CREATE POLICY "token_usage_logs_service_role_all" ON token_usage_logs
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Users can manage their own token usage logs
CREATE POLICY "token_usage_logs_user_select" ON token_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "token_usage_logs_user_insert" ON token_usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- USER BUDGETS POLICIES
-- Service role has full access
CREATE POLICY "user_budgets_service_role_all" ON user_budgets
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Users can view and update their own budget
CREATE POLICY "user_budgets_user_select" ON user_budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_budgets_user_update" ON user_budgets
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- System can insert budgets for new users
CREATE POLICY "user_budgets_system_insert" ON user_budgets
  FOR INSERT WITH CHECK (true);

-- AI RESPONSES POLICIES
-- Service role has full access
CREATE POLICY "ai_responses_service_role_all" ON ai_responses
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Users can manage their own AI responses
CREATE POLICY "ai_responses_user_select" ON ai_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ai_responses_user_insert" ON ai_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ai_responses_user_update" ON ai_responses
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ai_responses_user_delete" ON ai_responses
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICY PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- Create indexes to support RLS policy checks
CREATE INDEX IF NOT EXISTS idx_lead_summaries_rls_user_id ON lead_summaries(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_rls_user_id ON token_usage_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_budgets_rls_user_id ON user_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_rls_user_id ON ai_responses(user_id) WHERE user_id IS NOT NULL;

-- Composite index for lead search results RLS check
CREATE INDEX IF NOT EXISTS idx_lead_search_results_rls_check ON lead_search_results(lead_id) 
  INCLUDE (id) WHERE lead_id IS NOT NULL;

-- ============================================================================
-- RLS SECURITY FUNCTIONS
-- ============================================================================

-- Function to check if user is admin/premium
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_budgets 
    WHERE user_id = auth.uid() 
    AND user_plan IN ('premium', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a lead
CREATE OR REPLACE FUNCTION user_owns_lead(lead_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM lead_summaries 
    WHERE id = lead_uuid 
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICY VALIDATION
-- ============================================================================

-- Create function to validate RLS policies
CREATE OR REPLACE FUNCTION validate_rls_policies()
RETURNS TABLE (
    table_name TEXT,
    rls_enabled BOOLEAN,
    policy_count BIGINT,
    has_service_role_policy BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::TEXT,
        t.rowsecurity as rls_enabled,
        COUNT(p.policyname) as policy_count,
        BOOL_OR(p.policyname LIKE '%service_role%') as has_service_role_policy
    FROM pg_tables t
    LEFT JOIN pg_policies p ON t.tablename = p.tablename
    WHERE t.schemaname = 'public'
        AND t.tablename IN ('lead_summaries', 'lead_search_results', 'activities', 
                           'token_usage_logs', 'user_budgets', 'ai_responses')
    GROUP BY t.tablename, t.rowsecurity
    ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- POLICY COMMENTS FOR DOCUMENTATION
-- ============================================================================

-- Lead Summaries
COMMENT ON POLICY "lead_summaries_service_role_all" ON lead_summaries IS 'Service role bypass for system operations';
COMMENT ON POLICY "lead_summaries_user_select" ON lead_summaries IS 'Users can view their own leads';
COMMENT ON POLICY "lead_summaries_user_insert" ON lead_summaries IS 'Users can create leads for themselves';
COMMENT ON POLICY "lead_summaries_user_update" ON lead_summaries IS 'Users can update their own leads';
COMMENT ON POLICY "lead_summaries_user_delete" ON lead_summaries IS 'Users can delete their own leads';

-- Token Usage Logs
COMMENT ON POLICY "token_usage_logs_service_role_all" ON token_usage_logs IS 'Service role bypass for system operations';
COMMENT ON POLICY "token_usage_logs_user_select" ON token_usage_logs IS 'Users can view their own token usage';
COMMENT ON POLICY "token_usage_logs_user_insert" ON token_usage_logs IS 'Users can log their own token usage';

-- User Budgets
COMMENT ON POLICY "user_budgets_service_role_all" ON user_budgets IS 'Service role bypass for system operations';
COMMENT ON POLICY "user_budgets_user_select" ON user_budgets IS 'Users can view their own budget';
COMMENT ON POLICY "user_budgets_user_update" ON user_budgets IS 'Users can update their own budget';
COMMENT ON POLICY "user_budgets_system_insert" ON user_budgets IS 'System can create budgets for new users';

-- AI Responses
COMMENT ON POLICY "ai_responses_service_role_all" ON ai_responses IS 'Service role bypass for system operations';
COMMENT ON POLICY "ai_responses_user_select" ON ai_responses IS 'Users can view their own AI responses';
COMMENT ON POLICY "ai_responses_user_insert" ON ai_responses IS 'Users can create AI responses';
COMMENT ON POLICY "ai_responses_user_update" ON ai_responses IS 'Users can update their own AI responses';
COMMENT ON POLICY "ai_responses_user_delete" ON ai_responses IS 'Users can delete their own AI responses';

-- Activities
COMMENT ON POLICY "activities_service_role_all" ON activities IS 'Service role bypass for system operations';
COMMENT ON POLICY "activities_authenticated_select" ON activities IS 'Authenticated users can view activities for monitoring';
COMMENT ON POLICY "activities_authenticated_insert" ON activities IS 'Authenticated users can create activities';

-- Lead Search Results
COMMENT ON POLICY "lead_search_results_service_role_all" ON lead_search_results IS 'Service role bypass for system operations';
COMMENT ON POLICY "lead_search_results_user_select" ON lead_search_results IS 'Users can view search results for their leads';
COMMENT ON POLICY "lead_search_results_user_insert" ON lead_search_results IS 'Users can create search results for their leads';
COMMENT ON POLICY "lead_search_results_user_update" ON lead_search_results IS 'Users can update search results for their leads';
COMMENT ON POLICY "lead_search_results_user_delete" ON lead_search_results IS 'Users can delete search results for their leads';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show RLS policy validation results
SELECT * FROM validate_rls_policies();

-- Show all policies for verification
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual IS NOT NULL as has_using_clause,
    with_check IS NOT NULL as has_with_check_clause
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
