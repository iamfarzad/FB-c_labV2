-- Sync RLS, policies, functions, and indexes with production Supabase
-- Date: 2025-08-11

-- Enable RLS on tables without policies
ALTER TABLE IF EXISTS conversation_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS intent_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS capability_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation_contexts
DROP POLICY IF EXISTS "Users can view own conversation contexts" ON conversation_contexts;
CREATE POLICY "Users can view own conversation contexts" ON conversation_contexts
FOR SELECT TO authenticated
USING (email IN (SELECT email FROM auth.users WHERE id = auth.uid()));

-- RLS Policies for intent_classifications
DROP POLICY IF EXISTS "Users can view own intent classifications" ON intent_classifications;
CREATE POLICY "Users can view own intent classifications" ON intent_classifications
FOR SELECT TO authenticated
USING (session_id IN (
    SELECT session_id FROM conversation_contexts 
    WHERE email IN (SELECT email FROM auth.users WHERE id = auth.uid())
));

-- RLS Policies for capability_usage
DROP POLICY IF EXISTS "Users can view own capability usage" ON capability_usage;
CREATE POLICY "Users can view own capability usage" ON capability_usage
FOR SELECT TO authenticated
USING (session_id IN (
    SELECT session_id FROM conversation_contexts 
    WHERE email IN (SELECT email FROM auth.users WHERE id = auth.uid())
));

-- Tighten RLS for conversation_insights (drop permissive policies first)
DROP POLICY IF EXISTS "conversation_insights_public_insert" ON conversation_insights;
DROP POLICY IF EXISTS "conversation_insights_public_select" ON conversation_insights;
DROP POLICY IF EXISTS "conversation_insights_service_role" ON conversation_insights;

DROP POLICY IF EXISTS "Users can view own conversation insights" ON conversation_insights;
CREATE POLICY "Users can view own conversation insights" ON conversation_insights
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = (SELECT user_id FROM leads WHERE id = lead_id));

DROP POLICY IF EXISTS "Users can insert own conversation insights" ON conversation_insights;
CREATE POLICY "Users can insert own conversation insights" ON conversation_insights
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = (SELECT user_id FROM leads WHERE id = lead_id));

-- Tighten RLS for follow_up_tasks
DROP POLICY IF EXISTS "follow_up_tasks_public_insert" ON follow_up_tasks;
DROP POLICY IF EXISTS "follow_up_tasks_public_select" ON follow_up_tasks;
DROP POLICY IF EXISTS "follow_up_tasks_public_update" ON follow_up_tasks;
DROP POLICY IF EXISTS "follow_up_tasks_service_role" ON follow_up_tasks;

DROP POLICY IF EXISTS "Users can view own follow-up tasks" ON follow_up_tasks;
CREATE POLICY "Users can view own follow-up tasks" ON follow_up_tasks
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = (SELECT user_id FROM leads WHERE id = lead_id));

DROP POLICY IF EXISTS "Users can insert own follow-up tasks" ON follow_up_tasks;
CREATE POLICY "Users can insert own follow-up tasks" ON follow_up_tasks
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = (SELECT user_id FROM leads WHERE id = lead_id));

-- Tighten RLS for voice_sessions
DROP POLICY IF EXISTS "voice_sessions_public_insert" ON voice_sessions;
DROP POLICY IF EXISTS "voice_sessions_public_select" ON voice_sessions;
DROP POLICY IF EXISTS "voice_sessions_public_update" ON voice_sessions;
DROP POLICY IF EXISTS "voice_sessions_service_role" ON voice_sessions;

DROP POLICY IF EXISTS "Users can view own voice sessions" ON voice_sessions;
CREATE POLICY "Users can view own voice sessions" ON voice_sessions
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = (SELECT user_id FROM leads WHERE id = lead_id));

DROP POLICY IF EXISTS "Users can insert own voice sessions" ON voice_sessions;
CREATE POLICY "Users can insert own voice sessions" ON voice_sessions
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = (SELECT user_id FROM leads WHERE id = lead_id));

-- Security definer function template
CREATE OR REPLACE FUNCTION public.secure_function_template(param1 text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN param1;
END;
$$;

-- Replace get_slow_queries with secure pattern and minimal output
CREATE OR REPLACE FUNCTION public.get_slow_queries()
RETURNS TABLE (query text, duration interval)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY 
    SELECT query_text, total_time 
    FROM pg_stat_statements 
    ORDER BY total_time DESC 
    LIMIT 10;
END;
$$;

-- Revoke unnecessary execute permissions
REVOKE EXECUTE ON FUNCTION public.get_slow_queries() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.secure_function_template(text) FROM PUBLIC;

-- Ensure leads has user_id for ownership checks
ALTER TABLE IF EXISTS leads
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create Missing Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);

-- Drop Unused Indexes
DROP INDEX IF EXISTS idx_conversation_insights_insight_type;
DROP INDEX IF EXISTS idx_lead_summaries_user_id;
DROP INDEX IF EXISTS idx_lead_summaries_created_at;
DROP INDEX IF EXISTS idx_lead_summaries_company_name;
DROP INDEX IF EXISTS idx_lead_summaries_email;
DROP INDEX IF EXISTS idx_lead_summaries_lead_score;
DROP INDEX IF EXISTS idx_lead_search_results_lead_id;
DROP INDEX IF EXISTS idx_activities_type;
DROP INDEX IF EXISTS idx_activities_status;
DROP INDEX IF EXISTS idx_activities_created_at;
DROP INDEX IF EXISTS idx_token_usage_logs_user_id;
DROP INDEX IF EXISTS idx_token_usage_logs_created_at;
DROP INDEX IF EXISTS idx_token_usage_logs_model;
DROP INDEX IF EXISTS idx_token_usage_logs_task_type;
DROP INDEX IF EXISTS idx_token_usage_logs_endpoint;
DROP INDEX IF EXISTS idx_token_usage_logs_session_id;
DROP INDEX IF EXISTS idx_token_usage_logs_user_date;
DROP INDEX IF EXISTS idx_token_usage_logs_user_model;
DROP INDEX IF EXISTS idx_token_usage_logs_date_cost;
DROP INDEX IF EXISTS idx_user_budgets_user_id;
DROP INDEX IF EXISTS idx_ai_responses_session_id;
DROP INDEX IF EXISTS idx_ai_responses_user_id;
DROP INDEX IF EXISTS idx_ai_responses_activity_id;
DROP INDEX IF EXISTS idx_ai_responses_created_at;
DROP INDEX IF EXISTS idx_follow_up_tasks_task_type;
DROP INDEX IF EXISTS idx_follow_up_tasks_status;
DROP INDEX IF EXISTS idx_follow_up_tasks_scheduled_for;
DROP INDEX IF EXISTS idx_meetings_user_id;
DROP INDEX IF EXISTS idx_meetings_lead_id;
DROP INDEX IF EXISTS idx_meetings_date;
DROP INDEX IF EXISTS idx_meetings_status;
DROP INDEX IF EXISTS idx_meetings_created_at;
DROP INDEX IF EXISTS idx_meetings_user_date;
DROP INDEX IF EXISTS idx_meetings_status_date;
DROP INDEX IF EXISTS idx_conversation_contexts_email;
DROP INDEX IF EXISTS idx_intent_classifications_session;
DROP INDEX IF EXISTS idx_capability_usage_session;
DROP INDEX IF EXISTS idx_transcripts_search_vector;
DROP INDEX IF EXISTS idx_voice_sessions_session_id;

-- Drop duplicate indexes
DROP INDEX IF EXISTS idx_token_usage_user_id;

-- Notes:
-- This migration intentionally tightens RLS to user-owned data via leads.user_id lookups
-- and aligns function security with SECURITY DEFINER and empty search_path.


