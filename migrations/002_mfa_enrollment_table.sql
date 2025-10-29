-- MFA Enrollment Table
-- Temporary storage for MFA enrollment process (before verification)

CREATE TABLE IF NOT EXISTS mfa_enrollments (
  user_id INTEGER PRIMARY KEY,
  secret TEXT NOT NULL,
  enrollment_token TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES psw_users(user_id) ON DELETE CASCADE
);

-- Index for cleanup of expired enrollments
CREATE INDEX IF NOT EXISTS idx_mfa_enrollments_expires
ON mfa_enrollments(expires_at);
