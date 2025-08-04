-- Database Monitoring Setup Migration
-- Date: 2025-08-04
-- Purpose: Set up comprehensive database monitoring and performance tracking

-- ============================================================================
-- ENABLE REQUIRED EXTENSIONS
-- ============================================================================

-- Enable pg_stat_statements for query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Enable pg_stat_monitor if available (enhanced monitoring)
-- This will fail silently if not available
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_stat_monitor;
EXCEPTION WHEN OTHERS THEN
    -- Extension not available, continue without it
    NULL;
END $$;

-- ============================================================================
-- MONITORING TABLES
-- ============================================================================

-- Table to store performance snapshots
CREATE TABLE IF NOT EXISTS performance_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    snapshot_time TIMESTAMPTZ DEFAULT NOW(),
    table_name TEXT NOT NULL,
    table_size_bytes BIGINT,
    index_size_bytes BIGINT,
    row_count BIGINT,
    seq_scan BIGINT,
    seq_tup_read BIGINT,
    idx_scan BIGINT,
    idx_tup_fetch BIGINT,
    n_tup_ins BIGINT,
    n_tup_upd BIGINT,
    n_tup_del BIGINT,
    n_tup_hot_upd BIGINT,
    n_live_tup BIGINT,
    n_dead_tup BIGINT,
    vacuum_count BIGINT,
    autovacuum_count BIGINT,
    analyze_count BIGINT,
    autoanalyze_count BIGINT
);

-- Table to store slow query logs
CREATE TABLE IF NOT EXISTS slow_query_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    query_hash TEXT,
    query_text TEXT,
    calls BIGINT,
    total_exec_time DOUBLE PRECISION,
    mean_exec_time DOUBLE PRECISION,
    min_exec_time DOUBLE PRECISION,
    max_exec_time DOUBLE PRECISION,
    stddev_exec_time DOUBLE PRECISION,
    rows_returned BIGINT,
    shared_blks_hit BIGINT,
    shared_blks_read BIGINT,
    shared_blks_dirtied BIGINT,
    shared_blks_written BIGINT,
    temp_blks_read BIGINT,
    temp_blks_written BIGINT
);

-- Table to store database alerts
CREATE TABLE IF NOT EXISTS database_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_time TIMESTAMPTZ DEFAULT NOW(),
    alert_type TEXT NOT NULL, -- 'performance', 'storage', 'security', 'error'
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT,
    table_name TEXT,
    query_hash TEXT,
    metric_value DOUBLE PRECISION,
    threshold_value DOUBLE PRECISION,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

-- Indexes for monitoring tables
CREATE INDEX IF NOT EXISTS idx_performance_snapshots_time_table ON performance_snapshots(snapshot_time DESC, table_name);
CREATE INDEX IF NOT EXISTS idx_slow_query_logs_time ON slow_query_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_slow_query_logs_exec_time ON slow_query_logs(mean_exec_time DESC);
CREATE INDEX IF NOT EXISTS idx_database_alerts_time_severity ON database_alerts(alert_time DESC, severity);
CREATE INDEX IF NOT EXISTS idx_database_alerts_unresolved ON database_alerts(resolved, alert_time DESC) WHERE resolved = FALSE;

-- ============================================================================
-- MONITORING FUNCTIONS
-- ============================================================================

-- Function to capture performance snapshot
CREATE OR REPLACE FUNCTION capture_performance_snapshot()
RETURNS INTEGER AS $$
DECLARE
    snapshot_count INTEGER := 0;
BEGIN
    INSERT INTO performance_snapshots (
        table_name, table_size_bytes, index_size_bytes, row_count,
        seq_scan, seq_tup_read, idx_scan, idx_tup_fetch,
        n_tup_ins, n_tup_upd, n_tup_del, n_tup_hot_upd,
        n_live_tup, n_dead_tup, vacuum_count, autovacuum_count,
        analyze_count, autoanalyze_count
    )
    SELECT 
        schemaname || '.' || tablename as table_name,
        pg_total_relation_size(schemaname||'.'||tablename) as table_size_bytes,
        pg_indexes_size(schemaname||'.'||tablename) as index_size_bytes,
        n_live_tup + n_dead_tup as row_count,
        seq_scan, seq_tup_read, idx_scan, idx_tup_fetch,
        n_tup_ins, n_tup_upd, n_tup_del, n_tup_hot_upd,
        n_live_tup, n_dead_tup, vacuum_count, autovacuum_count,
        analyze_count, autoanalyze_count
    FROM pg_stat_user_tables
    WHERE schemaname = 'public';
    
    GET DIAGNOSTICS snapshot_count = ROW_COUNT;
    RETURN snapshot_count;
END;
$$ LANGUAGE plpgsql;

-- Function to capture slow queries
CREATE OR REPLACE FUNCTION capture_slow_queries(min_exec_time DOUBLE PRECISION DEFAULT 1000.0)
RETURNS INTEGER AS $$
DECLARE
    query_count INTEGER := 0;
BEGIN
    -- Only capture if pg_stat_statements is available
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') THEN
        INSERT INTO slow_query_logs (
            query_hash, query_text, calls, total_exec_time, mean_exec_time,
            min_exec_time, max_exec_time, stddev_exec_time, rows_returned,
            shared_blks_hit, shared_blks_read, shared_blks_dirtied, shared_blks_written,
            temp_blks_read, temp_blks_written
        )
        SELECT 
            md5(query) as query_hash,
            query as query_text,
            calls,
            total_exec_time,
            mean_exec_time,
            min_exec_time,
            max_exec_time,
            stddev_exec_time,
            rows,
            shared_blks_hit,
            shared_blks_read,
            shared_blks_dirtied,
            shared_blks_written,
            temp_blks_read,
            temp_blks_written
        FROM pg_stat_statements
        WHERE mean_exec_time >= min_exec_time
            AND query NOT LIKE '%pg_stat_statements%'
            AND query NOT LIKE '%capture_slow_queries%'
        ON CONFLICT DO NOTHING;
        
        GET DIAGNOSTICS query_count = ROW_COUNT;
    END IF;
    
    RETURN query_count;
END;
$$ LANGUAGE plpgsql;

-- Function to check performance thresholds and create alerts
CREATE OR REPLACE FUNCTION check_performance_thresholds()
RETURNS INTEGER AS $$
DECLARE
    alert_count INTEGER := 0;
    rec RECORD;
BEGIN
    -- Check for tables with high dead tuple ratio
    FOR rec IN 
        SELECT 
            schemaname || '.' || tablename as table_name,
            n_dead_tup,
            n_live_tup,
            CASE WHEN n_live_tup > 0 THEN (n_dead_tup::FLOAT / n_live_tup::FLOAT) * 100 ELSE 0 END as dead_tuple_ratio
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
            AND n_live_tup > 1000  -- Only check tables with significant data
            AND CASE WHEN n_live_tup > 0 THEN (n_dead_tup::FLOAT / n_live_tup::FLOAT) * 100 ELSE 0 END > 20
    LOOP
        INSERT INTO database_alerts (alert_type, severity, title, description, table_name, metric_value, threshold_value)
        VALUES (
            'performance',
            CASE WHEN rec.dead_tuple_ratio > 50 THEN 'high' ELSE 'medium' END,
            'High Dead Tuple Ratio',
            'Table ' || rec.table_name || ' has ' || ROUND(rec.dead_tuple_ratio, 2) || '% dead tuples. Consider running VACUUM.',
            rec.table_name,
            rec.dead_tuple_ratio,
            20.0
        );
        alert_count := alert_count + 1;
    END LOOP;

    -- Check for tables with low index usage
    FOR rec IN 
        SELECT 
            schemaname || '.' || tablename as table_name,
            seq_scan,
            idx_scan,
            CASE WHEN (seq_scan + idx_scan) > 0 THEN (seq_scan::FLOAT / (seq_scan + idx_scan)::FLOAT) * 100 ELSE 0 END as seq_scan_ratio
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
            AND (seq_scan + idx_scan) > 100  -- Only check tables with significant access
            AND CASE WHEN (seq_scan + idx_scan) > 0 THEN (seq_scan::FLOAT / (seq_scan + idx_scan)::FLOAT) * 100 ELSE 0 END > 80
    LOOP
        INSERT INTO database_alerts (alert_type, severity, title, description, table_name, metric_value, threshold_value)
        VALUES (
            'performance',
            'medium',
            'High Sequential Scan Ratio',
            'Table ' || rec.table_name || ' has ' || ROUND(rec.seq_scan_ratio, 2) || '% sequential scans. Consider adding indexes.',
            rec.table_name,
            rec.seq_scan_ratio,
            80.0
        );
        alert_count := alert_count + 1;
    END LOOP;

    -- Check for slow queries
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') THEN
        FOR rec IN 
            SELECT 
                md5(query) as query_hash,
                query,
                mean_exec_time,
                calls
            FROM pg_stat_statements
            WHERE mean_exec_time > 5000  -- 5 seconds
                AND calls > 10
                AND query NOT LIKE '%pg_stat_statements%'
            ORDER BY mean_exec_time DESC
            LIMIT 5
        LOOP
            INSERT INTO database_alerts (alert_type, severity, title, description, query_hash, metric_value, threshold_value)
            VALUES (
                'performance',
                CASE WHEN rec.mean_exec_time > 10000 THEN 'high' ELSE 'medium' END,
                'Slow Query Detected',
                'Query with hash ' || rec.query_hash || ' has average execution time of ' || ROUND(rec.mean_exec_time, 2) || 'ms over ' || rec.calls || ' calls.',
                rec.query_hash,
                rec.mean_exec_time,
                5000.0
            );
            alert_count := alert_count + 1;
        END LOOP;
    END IF;

    RETURN alert_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get database health summary
CREATE OR REPLACE FUNCTION get_database_health_summary()
RETURNS TABLE (
    metric_name TEXT,
    metric_value TEXT,
    status TEXT,
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH health_metrics AS (
        -- Database size
        SELECT 
            'database_size' as metric,
            pg_size_pretty(pg_database_size(current_database())) as value,
            'info' as status,
            'Total database size' as desc
        
        UNION ALL
        
        -- Active connections
        SELECT 
            'active_connections' as metric,
            COUNT(*)::TEXT as value,
            CASE WHEN COUNT(*) > 80 THEN 'warning' WHEN COUNT(*) > 100 THEN 'critical' ELSE 'good' END as status,
            'Number of active database connections' as desc
        FROM pg_stat_activity 
        WHERE state = 'active'
        
        UNION ALL
        
        -- Unresolved alerts
        SELECT 
            'unresolved_alerts' as metric,
            COUNT(*)::TEXT as value,
            CASE WHEN COUNT(*) > 10 THEN 'critical' WHEN COUNT(*) > 5 THEN 'warning' ELSE 'good' END as status,
            'Number of unresolved database alerts' as desc
        FROM database_alerts 
        WHERE resolved = FALSE
        
        UNION ALL
        
        -- Cache hit ratio
        SELECT 
            'cache_hit_ratio' as metric,
            ROUND(
                (SUM(heap_blks_hit) / NULLIF(SUM(heap_blks_hit + heap_blks_read), 0) * 100)::NUMERIC, 2
            )::TEXT || '%' as value,
            CASE 
                WHEN SUM(heap_blks_hit) / NULLIF(SUM(heap_blks_hit + heap_blks_read), 0) * 100 < 90 THEN 'warning'
                WHEN SUM(heap_blks_hit) / NULLIF(SUM(heap_blks_hit + heap_blks_read), 0) * 100 < 95 THEN 'good'
                ELSE 'excellent'
            END as status,
            'Database cache hit ratio (should be >95%)' as desc
        FROM pg_statio_user_tables
    )
    SELECT 
        hm.metric as metric_name,
        hm.value as metric_value,
        hm.status,
        hm.desc as description
    FROM health_metrics hm;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old monitoring data
CREATE OR REPLACE FUNCTION cleanup_monitoring_data(days_to_keep INTEGER DEFAULT 30)
RETURNS TABLE (
    table_name TEXT,
    rows_deleted BIGINT
) AS $$
DECLARE
    cutoff_date TIMESTAMPTZ;
    deleted_count BIGINT;
BEGIN
    cutoff_date := NOW() - (days_to_keep || ' days')::INTERVAL;
    
    -- Clean performance snapshots
    DELETE FROM performance_snapshots WHERE snapshot_time < cutoff_date;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN QUERY SELECT 'performance_snapshots'::TEXT, deleted_count;
    
    -- Clean slow query logs
    DELETE FROM slow_query_logs WHERE logged_at < cutoff_date;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN QUERY SELECT 'slow_query_logs'::TEXT, deleted_count;
    
    -- Clean resolved alerts older than cutoff
    DELETE FROM database_alerts WHERE resolved = TRUE AND resolved_at < cutoff_date;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN QUERY SELECT 'database_alerts'::TEXT, deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MONITORING VIEWS
-- ============================================================================

-- View for current table statistics
CREATE OR REPLACE VIEW current_table_stats AS
SELECT 
    schemaname || '.' || tablename as table_name,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    CASE 
        WHEN n_live_tup > 0 THEN ROUND((n_dead_tup::FLOAT / n_live_tup::FLOAT) * 100, 2)
        ELSE 0 
    END as dead_row_ratio,
    seq_scan,
    idx_scan,
    CASE 
        WHEN (seq_scan + idx_scan) > 0 THEN ROUND((idx_scan::FLOAT / (seq_scan + idx_scan)::FLOAT) * 100, 2)
        ELSE 0 
    END as index_usage_ratio,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- View for recent alerts
CREATE OR REPLACE VIEW recent_alerts AS
SELECT 
    alert_time,
    alert_type,
    severity,
    title,
    description,
    table_name,
    metric_value,
    threshold_value,
    resolved
FROM database_alerts
WHERE alert_time > NOW() - INTERVAL '7 days'
ORDER BY alert_time DESC, severity DESC;

-- View for performance trends
CREATE OR REPLACE VIEW performance_trends AS
SELECT 
    table_name,
    DATE(snapshot_time) as snapshot_date,
    AVG(table_size_bytes) as avg_table_size,
    AVG(row_count) as avg_row_count,
    AVG(seq_scan) as avg_seq_scans,
    AVG(idx_scan) as avg_idx_scans,
    AVG(n_dead_tup) as avg_dead_tuples
FROM performance_snapshots
WHERE snapshot_time > NOW() - INTERVAL '30 days'
GROUP BY table_name, DATE(snapshot_time)
ORDER BY table_name, snapshot_date DESC;

-- ============================================================================
-- AUTOMATED MONITORING SETUP
-- ============================================================================

-- Function to run all monitoring tasks
CREATE OR REPLACE FUNCTION run_monitoring_tasks()
RETURNS TABLE (
    task_name TEXT,
    result_count INTEGER,
    execution_time INTERVAL
) AS $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    result_count INTEGER;
BEGIN
    -- Capture performance snapshot
    start_time := NOW();
    SELECT capture_performance_snapshot() INTO result_count;
    end_time := NOW();
    RETURN QUERY SELECT 'capture_performance_snapshot'::TEXT, result_count, end_time - start_time;
    
    -- Capture slow queries
    start_time := NOW();
    SELECT capture_slow_queries() INTO result_count;
    end_time := NOW();
    RETURN QUERY SELECT 'capture_slow_queries'::TEXT, result_count, end_time - start_time;
    
    -- Check performance thresholds
    start_time := NOW();
    SELECT check_performance_thresholds() INTO result_count;
    end_time := NOW();
    RETURN QUERY SELECT 'check_performance_thresholds'::TEXT, result_count, end_time - start_time;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE performance_snapshots IS 'Stores periodic snapshots of table performance metrics';
COMMENT ON TABLE slow_query_logs IS 'Stores information about slow-running queries';
COMMENT ON TABLE database_alerts IS 'Stores database performance and health alerts';

COMMENT ON FUNCTION capture_performance_snapshot() IS 'Captures current performance metrics for all tables';
COMMENT ON FUNCTION capture_slow_queries(DOUBLE PRECISION) IS 'Captures slow queries from pg_stat_statements';
COMMENT ON FUNCTION check_performance_thresholds() IS 'Checks performance metrics against thresholds and creates alerts';
COMMENT ON FUNCTION get_database_health_summary() IS 'Returns overall database health summary';
COMMENT ON FUNCTION cleanup_monitoring_data(INTEGER) IS 'Cleans up old monitoring data older than specified days';
COMMENT ON FUNCTION run_monitoring_tasks() IS 'Runs all monitoring tasks and returns execution summary';

COMMENT ON VIEW current_table_stats IS 'Current performance statistics for all tables';
COMMENT ON VIEW recent_alerts IS 'Recent database alerts from the last 7 days';
COMMENT ON VIEW performance_trends IS 'Performance trends over the last 30 days';

-- ============================================================================
-- INITIAL DATA CAPTURE
-- ============================================================================

-- Capture initial performance snapshot
SELECT capture_performance_snapshot() as initial_snapshot_count;

-- Capture initial slow queries
SELECT capture_slow_queries() as initial_slow_query_count;

-- Run initial threshold check
SELECT check_performance_thresholds() as initial_alert_count;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show monitoring setup status
SELECT 
    'Extensions' as category,
    extname as name,
    'Installed' as status
FROM pg_extension 
WHERE extname IN ('pg_stat_statements', 'pg_stat_monitor')

UNION ALL

SELECT 
    'Tables' as category,
    tablename as name,
    'Created' as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('performance_snapshots', 'slow_query_logs', 'database_alerts')

UNION ALL

SELECT 
    'Views' as category,
    viewname as name,
    'Created' as status
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname IN ('current_table_stats', 'recent_alerts', 'performance_trends')

ORDER BY category, name;

-- Show initial health summary
SELECT * FROM get_database_health_summary();
