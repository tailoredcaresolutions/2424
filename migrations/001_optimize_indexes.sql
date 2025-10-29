-- Database Index Optimization - PSW Voice Documentation System
-- Created: October 24, 2025
-- Purpose: Add composite indexes for common query patterns

-- ============================================================================
-- Composite Indexes for Shift Reports (most queried table)
-- ============================================================================

-- Query pattern: "Get all reports for PSW X on date Y with status Z"
CREATE INDEX IF NOT EXISTS idx_reports_psw_date_status
ON shift_reports(psw_id, shift_date DESC, status);

-- Query pattern: "Get recent reports by date and status" (dashboard view)
CREATE INDEX IF NOT EXISTS idx_reports_date_status
ON shift_reports(shift_date DESC, status);

-- Query pattern: "Get all reports for client X with date range"
CREATE INDEX IF NOT EXISTS idx_reports_client_date
ON shift_reports(client_id, shift_date DESC);

-- Query pattern: "Find reports needing follow-up"
CREATE INDEX IF NOT EXISTS idx_reports_followup
ON shift_reports(follow_up_required, status) WHERE follow_up_required = 1;

-- Query pattern: "Get submitted but unreviewed reports"
CREATE INDEX IF NOT EXISTS idx_reports_pending_review
ON shift_reports(status, submitted_at DESC) WHERE status = 'submitted';

-- ============================================================================
-- Audit Log Indexes (for HIPAA compliance queries)
-- ============================================================================

-- Query pattern: "Get audit trail for user X in date range"
CREATE INDEX IF NOT EXISTS idx_audit_user_timestamp
ON audit_log(user_id, timestamp DESC);

-- Query pattern: "Get all actions on entity type X"
CREATE INDEX IF NOT EXISTS idx_audit_entity
ON audit_log(entity_type, entity_id, timestamp DESC);

-- Query pattern: "Find specific security events"
CREATE INDEX IF NOT EXISTS idx_audit_action
ON audit_log(action, timestamp DESC);

-- ============================================================================
-- User Session Indexes (for MFA and authentication)
-- ============================================================================

-- Query pattern: "Find active sessions for user X"
CREATE INDEX IF NOT EXISTS idx_sessions_user_expires
ON user_sessions(user_id, expires_at DESC);

-- Query pattern: "Clean up expired sessions"
CREATE INDEX IF NOT EXISTS idx_sessions_expired
ON user_sessions(expires_at) WHERE expires_at < datetime('now');

-- ============================================================================
-- Client Table Indexes
-- ============================================================================

-- Query pattern: "Search clients by name"
CREATE INDEX IF NOT EXISTS idx_clients_name
ON clients(last_name, first_name);

-- Query pattern: "Get recently updated clients"
CREATE INDEX IF NOT EXISTS idx_clients_updated
ON clients(updated_at DESC);

-- ============================================================================
-- PSW Users Indexes
-- ============================================================================

-- Query pattern: "Find users with MFA enabled"
CREATE INDEX IF NOT EXISTS idx_users_mfa
ON psw_users(mfa_enabled, last_login DESC);

-- ============================================================================
-- Performance Analysis
-- ============================================================================

-- To analyze query performance, use:
-- EXPLAIN QUERY PLAN SELECT ... ;

-- To see index usage statistics:
-- SELECT * FROM sqlite_stat1;

-- ============================================================================
-- Expected Performance Improvements
-- ============================================================================

/*
Before Optimization (estimated):
- Dashboard query (30 days of reports): ~500ms
- User audit log (1 month): ~200ms
- Client report history: ~300ms

After Optimization (expected):
- Dashboard query: ~50ms (10x faster)
- User audit log: ~20ms (10x faster)
- Client report history: ~30ms (10x faster)

Total improvement: 5-10x faster for common queries
*/
