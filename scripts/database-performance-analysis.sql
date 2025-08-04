-- Database Performance Analysis Queries
-- Purpose: Comprehensive queries for analyzing database performance
-- Usage: Run these queries in Supabase SQL Editor or via CLI

-- ============================================================================
-- TABLE SIZE AND GROWTH ANALYSIS
-- ============================================================================

-- Current table sizes with detailed breakdown
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
    pg_total_relation_size(schemaname||'.'||tablename) as total_bytes,
    ROUND(
        (pg_indexes_size(schemaname||'.'||tablename)::FLOAT / 
         NULLIF(pg_total_relation_size(schemaname||'.'||tablename), 0)) * 100, 2
    ) as index_ratio_percent
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================================================
-- INDEX USAGE ANALYSIS
-- ============================================================================

-- Index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    CASE 
        WHEN idx_scan = 0 THEN 'UNUSED - Consider dropping'
        WHEN idx_scan < 100 THEN 'LOW USAGE - Review necessity'
        ELSE 'ACTIVE'
    END as usage_status
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC, pg_relation_size(indexrelid) DESC;

-- Tables with low index usage (high sequential scan ratio)
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    CASE 
        WHEN (seq_scan + idx_scan) > 0 
        THEN ROUND((seq_scan::FLOAT / (seq_scan + idx_scan)::FLOAT) * 100, 2)
        ELSE 0 
    END as seq_scan_percent,
    CASE 
        WHEN (seq_scan + idx_scan) > 0 AND (seq_scan::FLOAT / (seq_scan + idx_scan)::FLOAT) > 0.8
        THEN 'HIGH - Add indexes'
        WHEN (seq_scan + idx_scan) > 0 AND (seq_scan::FLOAT / (seq_scan + idx_scan)::FLOAT) > 0.5
        THEN 'MEDIUM - Review queries'
        ELSE 'GOOD'
    END as recommendation
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND (seq_scan + idx_scan) > 0
ORDER BY seq_scan DESC;

-- ============================================================================
-- VACUUM AND MAINTENANCE ANALYSIS
-- ============================================================================

-- Tables needing vacuum (high dead tuple ratio)
SELECT 
    schemaname,
    tablename,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    CASE 
        WHEN n_live_tup > 0 
        THEN ROUND((n_dead_tup::FLOAT / n_live_tup::FLOAT) * 100, 2)
        ELSE 0 
    END as dead_tuple_percent,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze,
    CASE 
        WHEN n_live_tup > 0 AND (n_dead_tup::FLOAT / n_live_tup::FLOAT) > 0.2
        THEN 'VACUUM NEEDED'
        WHEN n_live_tup > 0 AND (n_dead_tup::FLOAT / n_live_tup::FLOAT) > 0.1
        THEN 'MONITOR'
        ELSE 'GOOD'
    END as vacuum_recommendation
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY (n_dead_tup::FLOAT / NULLIF(n_live_tup, 0)) DESC NULLS LAST;

-- ============================================================================
-- QUERY PERFORMANCE ANALYSIS (requires pg_stat_statements)
-- ============================================================================

-- Top 10 slowest queries by average execution time
SELECT 
    LEFT(query, 100) || '...' as query_preview,
    calls,
    ROUND(total_exec_time::NUMERIC, 2) as total_time_ms,
    ROUND(mean_exec_time::NUMERIC, 2) as avg_time_ms,
    ROUND(min_exec_time::NUMERIC, 2) as min_time_ms,
    ROUND(max_exec_time::NUMERIC, 2) as max_time_ms,
    rows,
    ROUND((100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0))::NUMERIC, 2) as hit_percent
FROM pg_stat_statements
WHERE calls > 5  -- Only queries called more than 5 times
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Top 10 most frequently called queries
SELECT 
    LEFT(query, 100) || '...' as query_preview,
    calls,
    ROUND(total_exec_time::NUMERIC, 2) as total_time_ms,
    ROUND(mean_exec_time::NUMERIC, 2) as avg_time_ms,
    rows,
    ROUND((100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0))::NUMERIC, 2) as hit_percent
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 10;

-- Queries with low cache hit ratio
SELECT 
    LEFT(query, 100) || '...' as query_preview,
    calls,
    ROUND(mean_exec_time::NUMERIC, 2) as avg_time_ms,
    shared_blks_hit,
    shared_blks_read,
    ROUND((100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0))::NUMERIC, 2) as hit_percent
FROM pg_stat_statements
WHERE shared_blks_read > 0
    AND (100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0)) < 90
ORDER BY hit_percent ASC, calls DESC
LIMIT 10;

-- ============================================================================
-- CONNECTION AND ACTIVITY ANALYSIS
-- ============================================================================

-- Current database connections
SELECT 
    state,
    COUNT(*) as connection_count,
    ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - state_change)))::NUMERIC, 2) as avg_duration_seconds
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state
ORDER BY connection_count DESC;

-- Long running queries (over 30 seconds)
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    EXTRACT(EPOCH FROM (NOW() - query_start)) as duration_seconds,
    LEFT(query, 100) || '...' as query_preview
FROM pg_stat_activity
WHERE datname = current_database()
    AND state = 'active'
    AND query_start < NOW() - INTERVAL '30 seconds'
ORDER BY duration_seconds DESC;

-- ============================================================================
-- CACHE AND BUFFER ANALYSIS
-- ============================================================================

-- Database cache hit ratio (should be > 95%)
SELECT 
    'Database Cache Hit Ratio' as metric,
    ROUND(
        (SUM(heap_blks_hit) / NULLIF(SUM(heap_blks_hit + heap_blks_read), 0) * 100)::NUMERIC, 2
    ) || '%' as value,
    CASE 
        WHEN SUM(heap_blks_hit) / NULLIF(SUM(heap_blks_hit + heap_blks_read), 0) * 100 >= 95 THEN 'EXCELLENT'
        WHEN SUM(heap_blks_hit) / NULLIF(SUM(heap_blks_hit + heap_blks_read), 0) * 100 >= 90 THEN 'GOOD'
        ELSE 'NEEDS IMPROVEMENT'
    END as status
FROM pg_statio_user_tables

UNION ALL

-- Index cache hit ratio
SELECT 
    'Index Cache Hit Ratio' as metric,
    ROUND(
        (SUM(idx_blks_hit) / NULLIF(SUM(idx_blks_hit + idx_blks_read), 0) * 100)::NUMERIC, 2
    ) || '%' as value,
    CASE 
        WHEN SUM(idx_blks_hit) / NULLIF(SUM(idx_blks_hit + idx_blks_read), 0) * 100 >= 95 THEN 'EXCELLENT'
        WHEN SUM(idx_blks_hit) / NULLIF(SUM(idx_blks_hit + idx_blks_read), 0) * 100 >= 90 THEN 'GOOD'
        ELSE 'NEEDS IMPROVEMENT'
    END as status
FROM pg_statio_user_indexes;

-- ============================================================================
-- SPECIFIC TABLE ANALYSIS
-- ============================================================================

-- Token usage logs analysis (high-volume table)
SELECT 
    'token_usage_logs' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT model) as unique_models,
    SUM(total_tokens) as total_tokens_used,
    SUM(estimated_cost) as total_estimated_cost,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record,
    ROUND(AVG(estimated_cost)::NUMERIC, 6) as avg_cost_per_request
FROM token_usage_logs;

-- Lead summaries analysis
SELECT 
    'lead_summaries' as table_name,
    COUNT(*) as total_leads,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT industry) as unique_industries,
    COUNT(*) FILTER (WHERE status = 'new') as new_leads,
    COUNT(*) FILTER (WHERE status = 'contacted') as contacted_leads,
    COUNT(*) FILTER (WHERE status = 'qualified') as qualified_leads,
    ROUND(AVG(lead_score)::NUMERIC, 2) as avg_lead_score
FROM lead_summaries;

-- AI responses analysis
SELECT 
    'ai_responses' as table_name,
    COUNT(*) as total_responses,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(*) FILTER (WHERE response_type = 'voice') as voice_responses,
    COUNT(*) FILTER (WHERE response_type = 'text') as text_responses,
    COUNT(*) FILTER (WHERE response_type = 'video_analysis') as video_responses,
    MIN(created_at) as oldest_response,
    MAX(created_at) as newest_response
FROM ai_responses;

-- ============================================================================
-- RECOMMENDATIONS SUMMARY
-- ============================================================================

-- Generate performance recommendations
WITH table_stats AS (
    SELECT 
        schemaname || '.' || tablename as table_name,
        pg_total_relation_size(schemaname||'.'||tablename) as total_size,
        n_live_tup,
        n_dead_tup,
        seq_scan,
        idx_scan,
        CASE 
            WHEN n_live_tup > 0 
            THEN (n_dead_tup::FLOAT / n_live_tup::FLOAT) * 100
            ELSE 0 
        END as dead_tuple_percent,
        CASE 
            WHEN (seq_scan + idx_scan) > 0 
            THEN (seq_scan::FLOAT / (seq_scan + idx_scan)::FLOAT) * 100
            ELSE 0 
        END as seq_scan_percent
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
)
SELECT 
    table_name,
    pg_size_pretty(total_size) as size,
    CASE 
        WHEN dead_tuple_percent > 20 THEN 'VACUUM NEEDED - ' || ROUND(dead_tuple_percent, 1) || '% dead tuples'
        WHEN seq_scan_percent > 80 THEN 'ADD INDEXES - ' || ROUND(seq_scan_percent, 1) || '% sequential scans'
        WHEN total_size > 100 * 1024 * 1024 THEN 'MONITOR SIZE - Large table'
        ELSE 'GOOD'
    END as recommendation,
    CASE 
        WHEN dead_tuple_percent > 20 THEN 'HIGH'
        WHEN seq_scan_percent > 80 THEN 'MEDIUM'
        WHEN total_size > 100 * 1024 * 1024 THEN 'LOW'
        ELSE 'NONE'
    END as priority
FROM table_stats
WHERE dead_tuple_percent > 20 OR seq_scan_percent > 80 OR total_size > 100 * 1024 * 1024
ORDER BY 
    CASE 
        WHEN dead_tuple_percent > 20 THEN 1
        WHEN seq_scan_percent > 80 THEN 2
        ELSE 3
    END,
    total_size DESC;

-- ============================================================================
-- MONITORING FUNCTIONS USAGE
-- ============================================================================

-- Use the monitoring functions created in the migration
SELECT 'Performance Snapshot' as task, capture_performance_snapshot() as result;
SELECT 'Slow Queries' as task, capture_slow_queries() as result;
SELECT 'Threshold Check' as task, check_performance_thresholds() as result;

-- Get current health summary
SELECT * FROM get_database_health_summary();

-- View current table stats
SELECT * FROM current_table_stats;

-- View recent alerts
SELECT * FROM recent_alerts;

-- View performance trends (if data exists)
SELECT * FROM performance_trends LIMIT 20;
