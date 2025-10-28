-- Enhanced Audit Log - Add missing columns for tamper-proof checksums

-- Add new columns (only those that don't exist yet)
ALTER TABLE audit_log ADD COLUMN session_id TEXT;
ALTER TABLE audit_log ADD COLUMN checksum TEXT;
ALTER TABLE audit_log ADD COLUMN metadata TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_ip_address ON audit_log(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_session ON audit_log(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_checksum ON audit_log(checksum);
