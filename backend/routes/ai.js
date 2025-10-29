/**
 * AI Routes
 * Converted from: app/api/ai/[...]/route.ts
 * AI quality monitoring endpoints
 */

import express from 'express';
import { getAIMonitor } from '../lib/monitoring/aiMonitor.ts';
import { log as logger } from '../lib/logger.ts';

const router = express.Router();

router.post('/audit', async (req, res) => {
  try {
    const {
      reportId,
      aiGeneratedContent,
      manualReviewScore,
      accuracyScore,
      completenessScore,
      reviewerNotes,
      issuesFound,
    } = req.body;

    if (!reportId || !aiGeneratedContent) {
      return res.status(400).json({
        success: false,
        error: 'reportId and aiGeneratedContent are required',
      });
    }

    if (!manualReviewScore || manualReviewScore < 1 || manualReviewScore > 5) {
      return res.status(400).json({
        success: false,
        error: 'manualReviewScore must be between 1 and 5',
      });
    }

    if (accuracyScore < 0 || accuracyScore > 100) {
      return res.status(400).json({
        success: false,
        error: 'accuracyScore must be between 0 and 100',
      });
    }

    if (completenessScore < 0 || completenessScore > 100) {
      return res.status(400).json({
        success: false,
        error: 'completenessScore must be between 0 and 100',
      });
    }

    const monitor = getAIMonitor();
    const auditId = monitor.recordAudit({
      reportId,
      aiGeneratedContent,
      manualReviewScore,
      accuracyScore,
      completenessScore,
      reviewerNotes,
      issuesFound: issuesFound || [],
    });

    logger.info(
      {
        type: 'ai_audit_submitted',
        auditId,
        reportId,
        manualReviewScore,
        accuracyScore,
        completenessScore,
      },
      'AI audit record submitted'
    );

    res.json({
      success: true,
      data: {
        auditId,
        message: 'Audit record created successfully',
      },
    });
  } catch (error) {
    logger.error(
      {
        type: 'audit_submission_error',
        error: error instanceof Error ? error.message : 'Unknown',
      },
      'Failed to submit audit'
    );

    res.status(500).json({
      success: false,
      error: 'Failed to submit audit',
    });
  }
});

router.get('/audit/sample', async (req, res) => {
  try {
    const sampleSizeParam = Array.isArray(req.query.sampleSize)
      ? req.query.sampleSize[0]
      : req.query.sampleSize;
    const sampleSize = sampleSizeParam
      ? parseInt(String(sampleSizeParam), 10)
      : 20;
    const startDateParam = Array.isArray(req.query.startDate)
      ? req.query.startDate[0]
      : req.query.startDate;
    const endDateParam = Array.isArray(req.query.endDate)
      ? req.query.endDate[0]
      : req.query.endDate;

    const period =
      startDateParam && endDateParam
        ? { start: String(startDateParam), end: String(endDateParam) }
        : undefined;

    const monitor = getAIMonitor();
    const sample = monitor.selectRandomAuditSample(sampleSize || 20, period);

    logger.info(
      {
        type: 'audit_sample_generated',
        sampleSize: sample.length,
        requested: sampleSize || 20,
      },
      'Random audit sample generated'
    );

    res.json({
      success: true,
      data: {
        sampleSize: sample.length,
        reports: sample,
      },
    });
  } catch (error) {
    logger.error(
      {
        type: 'audit_sample_error',
        error: error instanceof Error ? error.message : 'Unknown',
      },
      'Failed to generate audit sample'
    );

    res.status(500).json({
      success: false,
      error: 'Failed to generate audit sample',
    });
  }
});

router.post('/feedback', async (req, res) => {
  try {
    const {
      userId,
      reportId,
      accuracyRating,
      helpfulnessRating,
      comments,
      issueReported,
      issueType,
    } = req.body;

    if (!userId || !reportId) {
      return res.status(400).json({
        success: false,
        error: 'userId and reportId are required',
      });
    }

    if (!accuracyRating || accuracyRating < 1 || accuracyRating > 5) {
      return res.status(400).json({
        success: false,
        error: 'accuracyRating must be between 1 and 5',
      });
    }

    if (!helpfulnessRating || helpfulnessRating < 1 || helpfulnessRating > 5) {
      return res.status(400).json({
        success: false,
        error: 'helpfulnessRating must be between 1 and 5',
      });
    }

    const monitor = getAIMonitor();
    const feedbackId = monitor.recordFeedback({
      userId,
      reportId,
      accuracyRating,
      helpfulnessRating,
      comments,
      issueReported: Boolean(issueReported),
      issueType,
    });

    logger.info(
      {
        type: 'psw_feedback_submitted',
        feedbackId,
        userId,
        reportId,
        accuracyRating,
        helpfulnessRating,
      },
      'PSW feedback submitted'
    );

    res.json({
      success: true,
      data: {
        feedbackId,
        message: 'Feedback recorded successfully',
      },
    });
  } catch (error) {
    logger.error(
      {
        type: 'feedback_submission_error',
        error: error instanceof Error ? error.message : 'Unknown',
      },
      'Failed to submit feedback'
    );

    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback',
    });
  }
});

router.get('/feedback', async (req, res) => {
  try {
    const startDateParam = Array.isArray(req.query.startDate)
      ? req.query.startDate[0]
      : req.query.startDate;
    const endDateParam = Array.isArray(req.query.endDate)
      ? req.query.endDate[0]
      : req.query.endDate;

    const period =
      startDateParam && endDateParam
        ? { start: String(startDateParam), end: String(endDateParam) }
        : undefined;

    const monitor = getAIMonitor();
    const satisfaction = monitor.getSatisfactionScores(period);

    res.json({
      success: true,
      data: {
        period: period || 'all time',
        satisfaction,
      },
    });
  } catch (error) {
    logger.error(
      {
        type: 'feedback_retrieval_error',
        error: error instanceof Error ? error.message : 'Unknown',
      },
      'Failed to retrieve feedback'
    );

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve feedback',
    });
  }
});

router.get('/quarterly-review', async (req, res) => {
  try {
    const startDateParam = Array.isArray(req.query.startDate)
      ? req.query.startDate[0]
      : req.query.startDate;
    const endDateParam = Array.isArray(req.query.endDate)
      ? req.query.endDate[0]
      : req.query.endDate;

    const end = endDateParam || new Date().toISOString();
    const start =
      startDateParam || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const monitor = getAIMonitor();
    const quarterlyStats = monitor.generateQuarterlyReport(String(start), String(end));
    const satisfactionScores = monitor.getSatisfactionScores({ start: String(start), end: String(end) });
    const incidents = monitor.getIncidentReport({ start: String(start), end: String(end) });

    const recommendations = buildRecommendations(quarterlyStats, satisfactionScores);
    const summary = buildSummary(quarterlyStats, satisfactionScores);

    logger.info(
      {
        type: 'quarterly_review_generated',
        period: `${start} to ${end}`,
        totalRequests: quarterlyStats.totalRequests,
      },
      'Quarterly review report generated'
    );

    res.json({
      success: true,
      data: {
        period: { start, end },
        quarterlyStats,
        satisfactionScores,
        incidents: {
          total: incidents.length,
          recentIncidents: incidents.slice(0, 10),
        },
        recommendations,
        summary,
      },
    });
  } catch (error) {
    logger.error(
      {
        type: 'quarterly_review_error',
        error: error instanceof Error ? error.message : 'Unknown',
      },
      'Failed to generate quarterly review'
    );

    res.status(500).json({
      success: false,
      error: 'Failed to generate quarterly review',
    });
  }
});

function buildRecommendations(stats, satisfaction) {
  const items = [];

  if (stats.errorRate > 5) {
    items.push(
      `High error rate (${stats.errorRate}%) - Review model performance and error logs`
    );
  }

  if (stats.avgResponseTime > 3000) {
    items.push(
      `Slow response times (${stats.avgResponseTime}ms avg) - Consider hardware upgrade or optimization`
    );
  }

  if (satisfaction.accuracyScore < 4.0) {
    items.push(
      `Low accuracy rating (${satisfaction.accuracyScore}/5) - Audit AI outputs and consider fine-tuning`
    );
  }

  if (stats.contextUsageTrend.longConversations > stats.totalRequests * 0.1) {
    items.push(
      `Context usage increasing - ${stats.contextUsageTrend.longConversations} long conversations detected`
    );
  }

  if (stats.issueCount > stats.totalRequests * 0.05) {
    items.push(`${stats.issueCount} issues reported - Review common error patterns`);
  }

  if (stats.auditedSampleSize < 20) {
    items.push(
      `Low audit sample size (${stats.auditedSampleSize}) - Increase random audits for better quality assurance`
    );
  }

  return items;
}

function buildSummary(stats, satisfaction) {
  const overallHealth = calculateOverallHealth(stats, satisfaction);

  return {
    overallHealth,
    keyMetrics: {
      aiPerformance: stats.avgResponseTime < 3000 ? 'Good' : 'Needs Improvement',
      userSatisfaction:
        satisfaction.overallSatisfaction >= 4.0
          ? 'Excellent'
          : satisfaction.overallSatisfaction >= 3.5
            ? 'Good'
            : 'Needs Improvement',
      reliability:
        stats.errorRate < 5
          ? 'Excellent'
          : stats.errorRate < 10
            ? 'Good'
            : 'Needs Improvement',
    },
  };
}

function calculateOverallHealth(stats, satisfaction) {
  let score = 100;

  if (stats.errorRate > 10) score -= 20;
  else if (stats.errorRate > 5) score -= 10;

  if (stats.avgResponseTime > 5000) score -= 20;
  else if (stats.avgResponseTime > 3000) score -= 10;

  if (satisfaction.overallSatisfaction < 3.0) score -= 30;
  else if (satisfaction.overallSatisfaction < 4.0) score -= 15;

  const issueRate =
    stats.totalRequests > 0 ? (stats.issueCount / stats.totalRequests) * 100 : 0;
  if (issueRate > 10) score -= 20;
  else if (issueRate > 5) score -= 10;

  let rating = 'Excellent';
  if (score < 90) rating = 'Good';
  if (score < 75) rating = 'Fair';
  if (score < 60) rating = 'Needs Improvement';
  if (score < 40) rating = 'Critical';

  return { score: Math.max(0, score), rating };
}

export default router;
