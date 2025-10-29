/**
 * AI Performance Monitor - PSW Voice Documentation System
 *
 * Real-time monitoring of AI model performance, accuracy, and reliability
 * Supports quarterly review requirements and continuous quality assurance
 */

import { log as logger } from '../logger';
import Database from 'better-sqlite3';
import path from 'path';

interface AIPerformanceMetric {
  id?: number;
  timestamp: string;
  responseTimeMs: number;
  model: string;
  wasSuccessful: boolean;
  errorType?: string;
  tokenCount?: number;
  userId?: number;
  sessionId?: string;
}

interface PSWFeedback {
  id?: number;
  userId: number;
  reportId: number;
  timestamp: string;
  accuracyRating: number; // 1-5 scale
  helpfulnessRating: number; // 1-5 scale
  comments?: string;
  issueReported: boolean;
  issueType?: string;
}

interface AIAuditRecord {
  id?: number;
  reportId: number;
  timestamp: string;
  aiGeneratedContent: string;
  manualReviewScore: number; // 1-5 scale
  accuracyScore: number; // percentage
  completenessScore: number; // percentage
  reviewerNotes?: string;
  issuesFound: string[];
}

interface QuarterlyStats {
  period: string;
  totalRequests: number;
  avgResponseTime: number;
  errorRate: number;
  avgAccuracyRating: number;
  avgHelpfulnessRating: number;
  issueCount: number;
  auditedSampleSize: number;
  avgAuditScore: number;
  contextUsageTrend: {
    avgTokensPerRequest: number;
    maxTokensUsed: number;
    longConversations: number;
  };
}

export class PSWDocumentationMonitor {
  private db: Database.Database;
  private responseTimes: number[] = [];
  private errorCount: number = 0;
  private totalRequests: number = 0;

  constructor() {
    const dbPath =
      process.env.DATABASE_PATH ||
      path.join(process.cwd(), 'psw_documentation.db');
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  /**
   * Initialize monitoring database tables
   */
  private initializeTables(): void {
    // AI performance metrics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ai_performance_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        response_time_ms INTEGER NOT NULL,
        model TEXT NOT NULL,
        was_successful INTEGER NOT NULL,
        error_type TEXT,
        token_count INTEGER,
        user_id INTEGER,
        session_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_ai_perf_timestamp ON ai_performance_metrics(timestamp);
      CREATE INDEX IF NOT EXISTS idx_ai_perf_model ON ai_performance_metrics(model);
    `);

    // PSW feedback table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS psw_feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        report_id INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        accuracy_rating INTEGER NOT NULL CHECK(accuracy_rating BETWEEN 1 AND 5),
        helpfulness_rating INTEGER NOT NULL CHECK(helpfulness_rating BETWEEN 1 AND 5),
        comments TEXT,
        issue_reported INTEGER NOT NULL DEFAULT 0,
        issue_type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES psw_users(id),
        FOREIGN KEY (report_id) REFERENCES shift_reports(id)
      );
      CREATE INDEX IF NOT EXISTS idx_feedback_user ON psw_feedback(user_id);
      CREATE INDEX IF NOT EXISTS idx_feedback_report ON psw_feedback(report_id);
    `);

    // AI audit records table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ai_audit_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        ai_generated_content TEXT NOT NULL,
        manual_review_score INTEGER NOT NULL CHECK(manual_review_score BETWEEN 1 AND 5),
        accuracy_score INTEGER NOT NULL CHECK(accuracy_score BETWEEN 0 AND 100),
        completeness_score INTEGER NOT NULL CHECK(completeness_score BETWEEN 0 AND 100),
        reviewer_notes TEXT,
        issues_found TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (report_id) REFERENCES shift_reports(id)
      );
      CREATE INDEX IF NOT EXISTS idx_audit_report ON ai_audit_records(report_id);
      CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON ai_audit_records(timestamp);
    `);

    logger.info(
      { type: 'ai_monitor_initialized' },
      'AI monitoring tables initialized'
    );
  }

  /**
   * Record AI performance metric
   */
  public recordResult(
    durationMs: number,
    wasSuccessful: boolean,
    options?: {
      model?: string;
      errorType?: string;
      tokenCount?: number;
      userId?: number;
      sessionId?: string;
    }
  ): void {
    this.totalRequests++;
    this.responseTimes.push(durationMs);
    if (!wasSuccessful) this.errorCount++;

    // Store in database
    const metric: AIPerformanceMetric = {
      timestamp: new Date().toISOString(),
      responseTimeMs: durationMs,
      model: options?.model || 'llama-3.3-70b',
      wasSuccessful,
      errorType: options?.errorType,
      tokenCount: options?.tokenCount,
      userId: options?.userId,
      sessionId: options?.sessionId,
    };

    const stmt = this.db.prepare(`
      INSERT INTO ai_performance_metrics
      (timestamp, response_time_ms, model, was_successful, error_type, token_count, user_id, session_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      metric.timestamp,
      metric.responseTimeMs,
      metric.model,
      metric.wasSuccessful ? 1 : 0,
      metric.errorType || null,
      metric.tokenCount || null,
      metric.userId || null,
      metric.sessionId || null
    );

    // Real-time alerts
    this.checkAlerts();
  }

  /**
   * Check for alert conditions
   */
  private checkAlerts(): void {
    // If more than 10% of responses have issues, flag it
    if (this.errorCount / this.totalRequests > 0.1) {
      logger.warn(
        {
          type: 'ai_high_error_rate',
          errorRate: ((this.errorCount / this.totalRequests) * 100).toFixed(2),
          totalRequests: this.totalRequests,
        },
        '⚠️ Alert: AI extraction error rate > 10%. Consider model improvement or review.'
      );
    }

    // If average response time of last 20 requests exceeds 5s, flag it
    const recentTimes = this.responseTimes.slice(-20);
    if (recentTimes.length >= 20) {
      const avgRecent =
        recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;
      if (avgRecent > 5000) {
        logger.warn(
          {
            type: 'ai_slow_response',
            avgResponseTime: avgRecent.toFixed(1),
            threshold: 5000,
          },
          '⚠️ Alert: AI response time exceeding 5s. Investigate performance issues or scaling.'
        );
      }
    }
  }

  /**
   * Record PSW feedback
   */
  public recordFeedback(
    feedback: Omit<PSWFeedback, 'id' | 'timestamp'>
  ): number {
    const stmt = this.db.prepare(`
      INSERT INTO psw_feedback
      (user_id, report_id, timestamp, accuracy_rating, helpfulness_rating, comments, issue_reported, issue_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      feedback.userId,
      feedback.reportId,
      new Date().toISOString(),
      feedback.accuracyRating,
      feedback.helpfulnessRating,
      feedback.comments || null,
      feedback.issueReported ? 1 : 0,
      feedback.issueType || null
    );

    logger.info(
      {
        type: 'psw_feedback_recorded',
        userId: feedback.userId,
        reportId: feedback.reportId,
        accuracyRating: feedback.accuracyRating,
        helpfulnessRating: feedback.helpfulnessRating,
      },
      'PSW feedback recorded'
    );

    return result.lastInsertRowid as number;
  }

  /**
   * Record AI audit
   */
  public recordAudit(audit: Omit<AIAuditRecord, 'id' | 'timestamp'>): number {
    const stmt = this.db.prepare(`
      INSERT INTO ai_audit_records
      (report_id, timestamp, ai_generated_content, manual_review_score, accuracy_score,
       completeness_score, reviewer_notes, issues_found)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      audit.reportId,
      new Date().toISOString(),
      audit.aiGeneratedContent,
      audit.manualReviewScore,
      audit.accuracyScore,
      audit.completenessScore,
      audit.reviewerNotes || null,
      JSON.stringify(audit.issuesFound)
    );

    logger.info(
      {
        type: 'ai_audit_recorded',
        reportId: audit.reportId,
        accuracyScore: audit.accuracyScore,
        completenessScore: audit.completenessScore,
      },
      'AI audit record created'
    );

    return result.lastInsertRowid as number;
  }

  /**
   * Get current statistics
   */
  public getStats(): {
    averageResponseMs: string;
    totalRequests: number;
    errorRatePercent: string;
  } {
    const avg =
      this.responseTimes.length > 0
        ? this.responseTimes.reduce((a, b) => a + b, 0) /
          this.responseTimes.length
        : 0;
    const errorRate =
      this.totalRequests > 0 ? (this.errorCount / this.totalRequests) * 100 : 0;

    return {
      averageResponseMs: avg.toFixed(1),
      totalRequests: this.totalRequests,
      errorRatePercent: errorRate.toFixed(2),
    };
  }

  /**
   * Generate quarterly review report
   */
  public generateQuarterlyReport(
    startDate: string,
    endDate: string
  ): QuarterlyStats {
    // Performance metrics
    const perfStmt = this.db.prepare(`
      SELECT
        COUNT(*) as total_requests,
        AVG(response_time_ms) as avg_response_time,
        SUM(CASE WHEN was_successful = 0 THEN 1 ELSE 0 END) as error_count,
        AVG(token_count) as avg_tokens,
        MAX(token_count) as max_tokens,
        SUM(CASE WHEN token_count > 50000 THEN 1 ELSE 0 END) as long_conversations
      FROM ai_performance_metrics
      WHERE timestamp BETWEEN ? AND ?
    `);

    const perfData = perfStmt.get(startDate, endDate) as any;

    // Feedback metrics
    const feedbackStmt = this.db.prepare(`
      SELECT
        AVG(accuracy_rating) as avg_accuracy,
        AVG(helpfulness_rating) as avg_helpfulness,
        SUM(issue_reported) as issue_count
      FROM psw_feedback
      WHERE timestamp BETWEEN ? AND ?
    `);

    const feedbackData = feedbackStmt.get(startDate, endDate) as any;

    // Audit metrics
    const auditStmt = this.db.prepare(`
      SELECT
        COUNT(*) as audit_count,
        AVG(accuracy_score) as avg_audit_accuracy,
        AVG(completeness_score) as avg_audit_completeness
      FROM ai_audit_records
      WHERE timestamp BETWEEN ? AND ?
    `);

    const auditData = auditStmt.get(startDate, endDate) as any;

    const errorRate =
      perfData.total_requests > 0
        ? (perfData.error_count / perfData.total_requests) * 100
        : 0;

    const avgAuditScore =
      (auditData.avg_audit_accuracy + auditData.avg_audit_completeness) / 2;

    return {
      period: `${startDate} to ${endDate}`,
      totalRequests: perfData.total_requests || 0,
      avgResponseTime: Math.round(perfData.avg_response_time || 0),
      errorRate: Math.round(errorRate * 100) / 100,
      avgAccuracyRating:
        Math.round((feedbackData.avg_accuracy || 0) * 100) / 100,
      avgHelpfulnessRating:
        Math.round((feedbackData.avg_helpfulness || 0) * 100) / 100,
      issueCount: feedbackData.issue_count || 0,
      auditedSampleSize: auditData.audit_count || 0,
      avgAuditScore: Math.round(avgAuditScore || 0),
      contextUsageTrend: {
        avgTokensPerRequest: Math.round(perfData.avg_tokens || 0),
        maxTokensUsed: perfData.max_tokens || 0,
        longConversations: perfData.long_conversations || 0,
      },
    };
  }

  /**
   * Get satisfaction scores
   */
  public getSatisfactionScores(period?: { start: string; end: string }): {
    overallSatisfaction: number;
    accuracyScore: number;
    helpfulnessScore: number;
    totalResponses: number;
  } {
    let query = `
      SELECT
        AVG(accuracy_rating) as avg_accuracy,
        AVG(helpfulness_rating) as avg_helpfulness,
        COUNT(*) as total
      FROM psw_feedback
    `;

    const params: any[] = [];
    if (period) {
      query += ` WHERE timestamp BETWEEN ? AND ?`;
      params.push(period.start, period.end);
    }

    const result = this.db.prepare(query).get(...params) as any;

    const accuracyScore = result.avg_accuracy || 0;
    const helpfulnessScore = result.avg_helpfulness || 0;
    const overallSatisfaction = (accuracyScore + helpfulnessScore) / 2;

    return {
      overallSatisfaction: Math.round(overallSatisfaction * 100) / 100,
      accuracyScore: Math.round(accuracyScore * 100) / 100,
      helpfulnessScore: Math.round(helpfulnessScore * 100) / 100,
      totalResponses: result.total || 0,
    };
  }

  /**
   * Get incident report
   */
  public getIncidentReport(period?: { start: string; end: string }): Array<{
    id: number;
    timestamp: string;
    userId: number;
    reportId: number;
    issueType: string;
    comments: string;
  }> {
    let query = `
      SELECT
        id, timestamp, user_id, report_id, issue_type, comments
      FROM psw_feedback
      WHERE issue_reported = 1
    `;

    const params: any[] = [];
    if (period) {
      query += ` AND timestamp BETWEEN ? AND ?`;
      params.push(period.start, period.end);
    }

    query += ` ORDER BY timestamp DESC`;

    return this.db.prepare(query).all(...params) as any[];
  }

  /**
   * Select random sample for audit
   */
  public selectRandomAuditSample(
    sampleSize: number = 20,
    period?: { start: string; end: string }
  ): Array<{
    id: number;
    createdAt: string;
    pswId: number;
    clientId: number;
  }> {
    let query = `
      SELECT id, created_at, psw_id, client_id
      FROM shift_reports
    `;

    const params: any[] = [];
    if (period) {
      query += ` WHERE created_at BETWEEN ? AND ?`;
      params.push(period.start, period.end);
    }

    query += ` ORDER BY RANDOM() LIMIT ?`;
    params.push(sampleSize);

    return this.db.prepare(query).all(...params) as any[];
  }

  /**
   * Close database connection
   */
  public close(): void {
    this.db.close();
  }
}

// Singleton instance
let monitorInstance: PSWDocumentationMonitor | null = null;

export function getAIMonitor(): PSWDocumentationMonitor {
  if (!monitorInstance) {
    monitorInstance = new PSWDocumentationMonitor();
  }
  return monitorInstance;
}
