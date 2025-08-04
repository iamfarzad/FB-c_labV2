-- Performance Optimization Migration
-- Date: 2025-08-04
-- Purpose: Add critical indexes and optimize database performance

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Lead Summaries Performance Indexes
CREATE INDEX IF NOT EXISTS idx_lead_summaries_user_id_status ON lead_summaries(user_id, status) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lead_summaries_email_unique ON lead_summaries(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lead_summaries_company_industry ON lead_summaries(company, industry) WHERE company IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lead_summaries_lead_score_desc ON lead_summaries(lead_score DESC) WHERE lead_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lead_summaries_created_at_desc ON lead_summaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_summaries_updated_at_desc ON lead_summaries(updated_at DESC);

-- Lead Search Results Performance Indexes
CREATE INDEX IF NOT EXISTS idx_lead_search_results_lead_source ON lead_search_results(lead_id, source);
CREATE INDEX IF NOT EXISTS idx_lead_search_results_url_unique ON lead_search_results(url);
CREATE INDEX IF NOT EXISTS idx_lead_search_results_created_at_desc ON lead_search_results(created_at DESC);

-- Token Usage Logs Performance Indexes (Critical for cost analysis)
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_user_date ON token_usage_logs(user_id, DATE(created_at)) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_model_date ON token_usage_logs(model, DATE(created_at));
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_cost_desc ON token_usage_logs(estimated_cost DESC) WHERE estimated_cost > 0;
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_session_task ON token_usage_logs(session_id, task_type) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_endpoint_success ON token_usage_logs(endpoint, success);

-- User Budgets Performance Indexes
CREATE INDEX IF NOT EXISTS idx_user_budgets_plan_limits ON user_budgets(user_plan, daily_limit, monthly_limit);
CREATE INDEX IF NOT EXISTS idx_user_budgets_updated_at_desc ON user_budgets(updated_at DESC);

-- AI Responses Performance Indexes (Missing from original migration)
CREATE INDEX IF NOT EXISTS idx_ai_responses_user_session ON ai_responses(user_id, session_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_responses_type_created ON ai_responses(response_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_responses_activity_id ON ai_responses(activity_id) WHERE activity_id IS NOT NULL;

-- Activities Performance Indexes
CREATE INDEX IF NOT EXISTS idx_activities_type_status ON activities(type, status);
CREATE INDEX IF NOT EXISTS idx_activities_created_at_desc ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_metadata_gin ON activities USING GIN(metadata) WHERE metadata IS NOT NULL;

-- ============================================================================
-- PARTIAL INDEXES FOR BETTER PERFORMANCE
-- ============================================================================

-- Only index non-null user_id values for better performance
CREATE INDEX IF NOT EXISTS idx_lead_summaries_active_leads ON lead_summaries(user_id, status, lead_score DESC) 
  WHERE user_id IS NOT NULL AND status IN ('new', 'contacted', 'qualified');

-- Index only successful token usage for cost analysis
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_successful_costs ON token_usage_logs(user_id, created_at DESC, estimated_cost) 
  WHERE success = true AND user_id IS NOT NULL;

-- Index only recent activities (last 30 days) for better performance
CREATE INDEX IF NOT EXISTS idx_activities_recent ON activities(type, status, created_at DESC) 
  WHERE created_at > (NOW() - INTERVAL '30 days');

-- ============================================================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- ============================================================================

-- For lead analytics queries
CREATE INDEX IF NOT EXISTS idx_lead_summaries_analytics ON lead_summaries(user_id, industry, company_size, lead_score DESC, created_at DESC) 
  WHERE user_id IS NOT NULL AND lead_score IS NOT NULL;

-- For token usage cost analysis
CREATE INDEX IF NOT EXISTS idx_token_usage_cost_analysis ON token_usage_logs(user_id, model, DATE(created_at), estimated_cost DESC) 
  WHERE user_id IS NOT NULL AND success = true;

-- For AI response analysis
CREATE INDEX IF NOT EXISTS idx_ai_responses_analysis ON ai_responses(user_id, response_type, created_at DESC) 
  WHERE user_id IS NOT NULL;

-- ============================================================================
-- FOREIGN KEY OPTIMIZATIONS
-- ============================================================================

-- Ensure all foreign key constraints exist and are properly indexed
-- (Most are already created, but let's verify critical ones)

-- Add missing foreign key if not exists for ai_responses.user_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'ai_responses_user_id_fkey' 
        AND table_name = 'ai_responses'
    ) THEN
        ALTER TABLE ai_responses 
        ADD CONSTRAINT ai_responses_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add missing foreign key if not exists for ai_responses.activity_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'ai_responses_activity_id_fkey' 
        AND table_name = 'ai_responses'
    ) THEN
        ALTER TABLE ai_responses 
        ADD CONSTRAINT ai_responses_activity_id_fkey 
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- TABLE STATISTICS UPDATE
-- ============================================================================

-- Update table statistics for better query planning
ANALYZE lead_summaries;
ANALYZE lead_search_results;
ANALYZE token_usage_logs;
ANALYZE user_budgets;
ANALYZE ai_responses;
ANALYZE activities;

-- ============================================================================
-- PERFORMANCE MONITORING FUNCTIONS
-- ============================================================================

-- Function to get table sizes and index usage
CREATE OR REPLACE FUNCTION get_table_performance_stats()
RETURNS TABLE (
    table_name TEXT,
    table_size TEXT,
    index_size TEXT,
    total_size TEXT,
    row_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) + pg_indexes_size(schemaname||'.'||tablename)) as total_size,
        n_tup_ins + n_tup_upd + n_tup_del as row_count
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get slow queries (requires pg_stat_statements extension)
CREATE OR REPLACE FUNCTION get_slow_queries(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    query TEXT,
    calls BIGINT,
    total_time DOUBLE PRECISION,
    mean_time DOUBLE PRECISION,
    rows BIGINT
) AS $$
BEGIN
    -- Check if pg_stat_statements is available
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') THEN
        RETURN QUERY
        SELECT 
            pss.query,
            pss.calls,
            pss.total_exec_time as total_time,
            pss.mean_exec_time as mean_time,
            pss.rows
        FROM pg_stat_statements pss
        ORDER BY pss.mean_exec_time DESC
        LIMIT limit_count;
    ELSE
        -- Return empty result if extension not available
        RETURN;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION get_table_performance_stats() IS 'Returns performance statistics for all tables including sizes and row counts';
COMMENT ON FUNCTION get_slow_queries(INTEGER) IS 'Returns the slowest queries from pg_stat_statements (requires extension)';

-- Add comments to critical indexes
COMMENT ON INDEX idx_lead_summaries_user_id_status IS 'Optimizes user lead filtering by status';
COMMENT ON INDEX idx_token_usage_logs_user_date IS 'Critical for daily/monthly cost analysis queries';
COMMENT ON INDEX idx_token_usage_cost_analysis IS 'Composite index for comprehensive cost analysis';
COMMENT ON INDEX idx_ai_responses_user_session IS 'Optimizes AI response retrieval by user and session';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all indexes were created successfully
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Show table sizes after optimization
SELECT * FROM get_table_performance_stats();
