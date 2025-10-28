/**
 * Enhanced Audit Logger - PSW Voice Documentation System
 *
 * Features:
 * - Field-level change tracking
 * - Before/after value comparison
 * - Tamper-proof logging with checksums
 * - User context and IP tracking
 * - Automatic sensitive data masking
 * - Search and export capabilities
 * - Compliance reporting (HIPAA audit trails)
 */

import crypto from 'crypto';
import { getEncryptedDb } from '../database/encryptedDb';
import { log as logger } from '../logger';

interface AuditLogEntry {
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  fieldChanges?: FieldChange[];
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

interface FieldChange {
  field: string;
  oldValue: string | null;
  newValue: string | null;
  dataType: string;
}

interface AuditSearchCriteria {
  userId?: number;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

interface AuditRecord {
  id: number;
  timestamp: string;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  field_changes: string | null;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
  checksum: string;
  metadata: string | null;
}

export class EnhancedAuditLogger {
  private sensitiveFields = [
    'password',
    'mfa_secret',
    'health_number',
    'ssn',
    'date_of_birth',
    'email',
    'phone',
  ];

  /**
   * Log an audit event with field-level tracking
   */
  public async logAudit(entry: AuditLogEntry): Promise<number> {
    try {
      const db = getEncryptedDb();

      // Mask sensitive data in field changes
      const maskedFieldChanges = this.maskSensitiveData(entry.fieldChanges);

      // Serialize data for storage
      const fieldChangesJson = maskedFieldChanges
        ? JSON.stringify(maskedFieldChanges)
        : null;
      const metadataJson = entry.metadata
        ? JSON.stringify(entry.metadata)
        : null;

      // Calculate tamper-proof checksum
      const checksum = this.calculateChecksum({
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        fieldChanges: fieldChangesJson,
      });

      // Insert audit log entry
      const result = db
        .prepare(
          `
        INSERT INTO audit_log (
          user_id, action, entity_type, entity_id,
          field_changes, ip_address, user_agent, session_id,
          checksum, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
        )
        .run(
          entry.userId,
          entry.action,
          entry.entityType,
          entry.entityId,
          fieldChangesJson,
          entry.ipAddress || null,
          entry.userAgent || null,
          entry.sessionId || null,
          checksum,
          metadataJson
        );

      logger.info(
        {
          type: 'audit_log_created',
          auditId: result.lastInsertRowid,
          userId: entry.userId,
          action: entry.action,
          entityType: entry.entityType,
        },
        `Audit log created: ${entry.action} on ${entry.entityType}`
      );

      return Number(result.lastInsertRowid);
    } catch (error) {
      logger.error(
        {
          type: 'audit_log_error',
          userId: entry.userId,
          action: entry.action,
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Failed to create audit log entry'
      );
      throw error;
    }
  }

  /**
   * Log entity creation
   */
  public async logCreate(
    userId: number,
    entityType: string,
    entityId: number,
    data: Record<string, any>,
    context?: { ipAddress?: string; userAgent?: string; sessionId?: string }
  ): Promise<number> {
    const fieldChanges: FieldChange[] = Object.keys(data).map((key) => ({
      field: key,
      oldValue: null,
      newValue: String(data[key]),
      dataType: typeof data[key],
    }));

    return this.logAudit({
      userId,
      action: 'CREATE',
      entityType,
      entityId,
      fieldChanges,
      ...context,
    });
  }

  /**
   * Log entity update with field-level changes
   */
  public async logUpdate(
    userId: number,
    entityType: string,
    entityId: number,
    oldData: Record<string, any>,
    newData: Record<string, any>,
    context?: { ipAddress?: string; userAgent?: string; sessionId?: string }
  ): Promise<number> {
    // Track only changed fields
    const fieldChanges: FieldChange[] = [];

    for (const key in newData) {
      if (oldData[key] !== newData[key]) {
        fieldChanges.push({
          field: key,
          oldValue: oldData[key] !== undefined ? String(oldData[key]) : null,
          newValue: String(newData[key]),
          dataType: typeof newData[key],
        });
      }
    }

    return this.logAudit({
      userId,
      action: 'UPDATE',
      entityType,
      entityId,
      fieldChanges,
      ...context,
    });
  }

  /**
   * Log entity deletion
   */
  public async logDelete(
    userId: number,
    entityType: string,
    entityId: number,
    data: Record<string, any>,
    context?: { ipAddress?: string; userAgent?: string; sessionId?: string }
  ): Promise<number> {
    const fieldChanges: FieldChange[] = Object.keys(data).map((key) => ({
      field: key,
      oldValue: String(data[key]),
      newValue: null,
      dataType: typeof data[key],
    }));

    return this.logAudit({
      userId,
      action: 'DELETE',
      entityType,
      entityId,
      fieldChanges,
      ...context,
    });
  }

  /**
   * Log access/view events
   */
  public async logAccess(
    userId: number,
    entityType: string,
    entityId: number,
    context?: { ipAddress?: string; userAgent?: string; sessionId?: string }
  ): Promise<number> {
    return this.logAudit({
      userId,
      action: 'ACCESS',
      entityType,
      entityId,
      ...context,
    });
  }

  /**
   * Mask sensitive data in field changes
   */
  private maskSensitiveData(
    fieldChanges?: FieldChange[]
  ): FieldChange[] | undefined {
    if (!fieldChanges) return undefined;

    return fieldChanges.map((change) => {
      if (
        this.sensitiveFields.some((sf) =>
          change.field.toLowerCase().includes(sf.toLowerCase())
        )
      ) {
        return {
          ...change,
          oldValue: change.oldValue ? '[REDACTED]' : null,
          newValue: change.newValue ? '[REDACTED]' : null,
        };
      }
      return change;
    });
  }

  /**
   * Calculate tamper-proof checksum
   */
  private calculateChecksum(data: Record<string, any>): string {
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    const secret = process.env.AUDIT_LOG_SECRET || 'CHANGE_THIS_IN_PRODUCTION';

    return crypto.createHmac('sha256', secret).update(dataString).digest('hex');
  }

  /**
   * Verify audit log integrity
   */
  public async verifyIntegrity(auditId: number): Promise<boolean> {
    try {
      const db = getEncryptedDb();

      const record = db
        .prepare(
          `
        SELECT * FROM audit_log WHERE id = ?
      `
        )
        .get(auditId) as AuditRecord | undefined;

      if (!record) {
        return false;
      }

      // Recalculate checksum
      const expectedChecksum = this.calculateChecksum({
        userId: record.user_id,
        action: record.action,
        entityType: record.entity_type,
        entityId: record.entity_id,
        fieldChanges: record.field_changes,
      });

      return expectedChecksum === record.checksum;
    } catch (error) {
      logger.error(
        {
          type: 'audit_verify_error',
          auditId,
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Failed to verify audit log integrity'
      );
      return false;
    }
  }

  /**
   * Search audit logs with filters
   */
  public async searchAuditLogs(
    criteria: AuditSearchCriteria
  ): Promise<AuditRecord[]> {
    try {
      const db = getEncryptedDb();

      let query = 'SELECT * FROM audit_log WHERE 1=1';
      const params: any[] = [];

      if (criteria.userId) {
        query += ' AND user_id = ?';
        params.push(criteria.userId);
      }

      if (criteria.action) {
        query += ' AND action = ?';
        params.push(criteria.action);
      }

      if (criteria.entityType) {
        query += ' AND entity_type = ?';
        params.push(criteria.entityType);
      }

      if (criteria.startDate) {
        query += ' AND timestamp >= ?';
        params.push(criteria.startDate);
      }

      if (criteria.endDate) {
        query += ' AND timestamp <= ?';
        params.push(criteria.endDate);
      }

      query += ' ORDER BY timestamp DESC';

      if (criteria.limit) {
        query += ' LIMIT ?';
        params.push(criteria.limit);
      }

      return db.prepare(query).all(...params) as AuditRecord[];
    } catch (error) {
      logger.error(
        {
          type: 'audit_search_error',
          criteria,
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Failed to search audit logs'
      );
      return [];
    }
  }

  /**
   * Generate compliance report (HIPAA audit trail)
   */
  public async generateComplianceReport(
    startDate: string,
    endDate: string
  ): Promise<{
    totalEvents: number;
    eventsByAction: Record<string, number>;
    eventsByUser: Record<number, number>;
    eventsByEntity: Record<string, number>;
    sensitiveDataAccess: number;
    integrityViolations: number;
  }> {
    try {
      const db = getEncryptedDb();

      // Get all audit logs in date range
      const logs = await this.searchAuditLogs({ startDate, endDate });

      // Aggregate statistics
      const eventsByAction: Record<string, number> = {};
      const eventsByUser: Record<number, number> = {};
      const eventsByEntity: Record<string, number> = {};
      let sensitiveDataAccess = 0;
      let integrityViolations = 0;

      for (const log of logs) {
        // Count by action
        eventsByAction[log.action] = (eventsByAction[log.action] || 0) + 1;

        // Count by user
        eventsByUser[log.user_id] = (eventsByUser[log.user_id] || 0) + 1;

        // Count by entity type
        eventsByEntity[log.entity_type] =
          (eventsByEntity[log.entity_type] || 0) + 1;

        // Check for sensitive data access
        if (log.field_changes) {
          const fieldChanges = JSON.parse(log.field_changes);
          if (
            fieldChanges.some(
              (fc: FieldChange) =>
                fc.oldValue === '[REDACTED]' || fc.newValue === '[REDACTED]'
            )
          ) {
            sensitiveDataAccess++;
          }
        }

        // Verify integrity
        const isValid = await this.verifyIntegrity(log.id);
        if (!isValid) {
          integrityViolations++;
        }
      }

      return {
        totalEvents: logs.length,
        eventsByAction,
        eventsByUser,
        eventsByEntity,
        sensitiveDataAccess,
        integrityViolations,
      };
    } catch (error) {
      logger.error(
        {
          type: 'compliance_report_error',
          startDate,
          endDate,
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Failed to generate compliance report'
      );
      throw error;
    }
  }

  /**
   * Export audit logs to CSV (for compliance)
   */
  public async exportToCSV(criteria: AuditSearchCriteria): Promise<string> {
    const logs = await this.searchAuditLogs(criteria);

    const headers = [
      'Audit ID',
      'Timestamp',
      'User ID',
      'Action',
      'Entity Type',
      'Entity ID',
      'Field Changes',
      'IP Address',
      'Session ID',
    ];

    const rows = logs.map((log) => [
      log.id,
      log.timestamp,
      log.user_id,
      log.action,
      log.entity_type,
      log.entity_id,
      log.field_changes || '',
      log.ip_address || '',
      log.session_id || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    return csv;
  }
}

// Singleton instance
let enhancedAuditLoggerInstance: EnhancedAuditLogger | null = null;

export function getEnhancedAuditLogger(): EnhancedAuditLogger {
  if (!enhancedAuditLoggerInstance) {
    enhancedAuditLoggerInstance = new EnhancedAuditLogger();
  }
  return enhancedAuditLoggerInstance;
}
