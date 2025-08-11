# Supabase Database Optimization Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the comprehensive database optimization and monitoring system for the FB-c_labV2 project.

## Prerequisites

- Node.js and npm/pnpm installed
- Access to Supabase project
- Terminal/command line access

## Implementation Steps

### Phase 1: Setup and Preparation

#### 1. Install Supabase CLI

Choose one of the following methods:

**macOS (Homebrew):**
```bash
brew install supabase/tap/supabase
```

**npm (Global):**
```bash
npm install -g supabase
```

**Direct Download:**
Visit [Supabase CLI Releases](https://github.com/supabase/cli/releases)

#### 2. Verify Installation

```bash
./scripts/supabase-cli-setup.sh setup
```

This will:
- Check if Supabase CLI is installed
- Initialize the project if needed
- Verify configuration

### Phase 2: Local Development Setup

#### 1. Start Local Supabase Environment

```bash
./scripts/supabase-cli-setup.sh start
```

This will:
- Start local PostgreSQL database
- Start Supabase services (API, Auth, Storage, etc.)
- Display connection details

#### 2. Apply Optimization Migrations

```bash
./scripts/supabase-cli-setup.sh optimize
```

This will apply all three optimization migrations:
- Performance optimization (indexes, functions)
- RLS policy optimization (security)
- Monitoring setup (tracking, alerts)

#### 3. Generate Updated TypeScript Types

```bash
./scripts/supabase-cli-setup.sh generate-types
```

This updates `lib/database.types.ts` with the latest schema.

### Phase 3: Performance Analysis

#### 1. Run Performance Analysis

```bash
./scripts/supabase-cli-setup.sh analyze
```

Or manually run queries from:
```bash
# Copy queries from scripts/database-performance-analysis.sql
# Run in Supabase SQL Editor or via CLI
```

#### 2. Monitor Database Health

Access the monitoring functions:

```sql
-- Get overall health summary
SELECT * FROM get_database_health_summary();

-- View current table statistics
SELECT * FROM current_table_stats;

-- Check recent alerts
SELECT * FROM recent_alerts;

-- View performance trends
SELECT * FROM performance_trends;
```

### Phase 4: Production Deployment

#### 1. Link to Remote Project

```bash
./scripts/supabase-cli-setup.sh link YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your actual Supabase project reference.

#### 2. Push Migrations to Production

⚠️ **IMPORTANT**: Test thoroughly in staging first!

```bash
./scripts/supabase-cli-setup.sh push
```

#### 3. Verify Production Deployment

1. Check migration status in Supabase Dashboard
2. Run performance analysis queries
3. Verify monitoring functions are working
4. Test RLS policies with different user roles

### Phase 5: Ongoing Monitoring

#### 1. Set Up Automated Monitoring

Create a cron job or scheduled task to run monitoring functions:

```bash
# Example cron job (runs every hour)
0 * * * * cd /path/to/project && ./scripts/supabase-cli-setup.sh analyze
```

#### 2. Regular Maintenance Tasks

**Daily:**
- Check database alerts: `SELECT * FROM recent_alerts;`
- Monitor table sizes: `SELECT * FROM current_table_stats;`

**Weekly:**
- Run performance analysis
- Review slow query logs
- Check dead tuple ratios

**Monthly:**
- Clean up old monitoring data: `SELECT * FROM cleanup_monitoring_data(30);`
- Review and optimize indexes based on usage patterns
- Update performance baselines

## Migration Files Overview

### 1. Performance Optimization (`20250804180000_performance_optimization.sql`)

**What it does:**
- Adds critical indexes for all tables
- Creates partial indexes for better performance
- Adds composite indexes for complex queries
- Creates performance monitoring functions
- Updates table statistics

**Key indexes added:**
- `idx_lead_summaries_user_id_status` - User lead filtering
- `idx_token_usage_logs_user_date` - Cost analysis queries
- `idx_ai_responses_user_session` - AI response retrieval
- `idx_activities_type_status` - Activity filtering

### 2. RLS Policy Optimization (`20250804190000_rls_policy_optimization.sql`)

**What it does:**
- Standardizes RLS policy naming conventions
- Optimizes policy performance
- Adds service role bypass policies
- Creates security helper functions
- Adds RLS-specific indexes

**Key improvements:**
- Consistent policy naming: `{table}_{role}_{action}`
- Service role bypass for system operations
- Optimized policy checks with supporting indexes
- Security validation functions

### 3. Monitoring Setup (`20250804200000_monitoring_setup.sql`)

**What it does:**
- Enables pg_stat_statements extension
- Creates monitoring tables (performance_snapshots, slow_query_logs, database_alerts)
- Adds monitoring functions and views
- Sets up automated threshold checking
- Creates performance analysis tools

**Key features:**
- Automated performance snapshots
- Slow query detection and logging
- Database health monitoring
- Alert system for performance issues
- Cleanup functions for old data

## Performance Monitoring Functions

### Core Functions

```sql
-- Capture current performance metrics
SELECT capture_performance_snapshot();

-- Log slow queries (>1000ms by default)
SELECT capture_slow_queries(1000.0);

-- Check performance thresholds and create alerts
SELECT check_performance_thresholds();

-- Get database health summary
SELECT * FROM get_database_health_summary();

-- Run all monitoring tasks
SELECT * FROM run_monitoring_tasks();
```

### Analysis Views

```sql
-- Current table performance statistics
SELECT * FROM current_table_stats;

-- Recent alerts (last 7 days)
SELECT * FROM recent_alerts;

-- Performance trends (last 30 days)
SELECT * FROM performance_trends;
```

## Troubleshooting

### Common Issues

#### 1. Migration Fails

**Error**: Migration file has syntax errors
**Solution**: 
- Check SQL syntax in migration files
- Ensure all required extensions are available
- Verify table dependencies

#### 2. RLS Policies Block Queries

**Error**: Row-level security policy violation
**Solution**:
- Check user authentication
- Verify policy conditions
- Use service role for system operations

#### 3. Performance Issues Persist

**Error**: Queries still slow after optimization
**Solution**:
- Run `ANALYZE` on affected tables
- Check if indexes are being used: `EXPLAIN ANALYZE`
- Review query patterns and add specific indexes

#### 4. Monitoring Functions Not Working

**Error**: pg_stat_statements not available
**Solution**:
- Ensure extension is enabled: `CREATE EXTENSION pg_stat_statements;`
- Restart database if needed
- Check extension permissions

### Getting Help

1. **Check logs**: Review Supabase logs for detailed error messages
2. **Run diagnostics**: Use the analysis queries to identify issues
3. **Verify setup**: Ensure all migrations applied successfully
4. **Test locally**: Use local Supabase environment for debugging

## Performance Benchmarks

### Expected Improvements

After implementing optimizations, you should see:

- **Query Performance**: 50-80% reduction in average query time
- **Index Usage**: >90% of queries using indexes instead of sequential scans
- **Cache Hit Ratio**: >95% for both table and index caches
- **Dead Tuple Ratio**: <10% for all tables
- **Alert Resolution**: Automated detection of performance issues

### Monitoring Metrics

Track these key metrics:

- **Response Time**: Average API response time
- **Database Connections**: Number of active connections
- **Query Performance**: Slow query count and execution times
- **Storage Growth**: Table and index size trends
- **Error Rates**: Failed queries and connection errors

## Security Considerations

### RLS Policy Best Practices

1. **Service Role Bypass**: Always include service role policies for system operations
2. **User Isolation**: Ensure users can only access their own data
3. **Performance Impact**: Monitor RLS policy performance impact
4. **Testing**: Test policies with different user roles and scenarios

### Monitoring Security

1. **Access Control**: Limit access to monitoring functions
2. **Data Privacy**: Ensure monitoring doesn't expose sensitive data
3. **Alert Security**: Secure alert notifications and responses

## Next Steps

1. **Implement Caching**: Add Redis caching for frequently accessed data
2. **Data Archiving**: Set up archiving for old records
3. **Advanced Monitoring**: Implement custom dashboards and alerting
4. **Performance Tuning**: Continuously optimize based on usage patterns
5. **Capacity Planning**: Monitor growth trends and plan for scaling

---

## Quick Reference Commands

```bash
# Setup and start
./scripts/supabase-cli-setup.sh setup
./scripts/supabase-cli-setup.sh start

# Apply optimizations
./scripts/supabase-cli-setup.sh optimize

# Generate types
./scripts/supabase-cli-setup.sh generate-types

# Run analysis
./scripts/supabase-cli-setup.sh analyze

# Production deployment
./scripts/supabase-cli-setup.sh link YOUR_PROJECT_REF
./scripts/supabase-cli-setup.sh push

# Status and maintenance
./scripts/supabase-cli-setup.sh status
./scripts/supabase-cli-setup.sh reset  # Local only
```

---

*Last updated: 2025-08-04*
*Version: 1.0*
