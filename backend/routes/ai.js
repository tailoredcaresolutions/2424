/**
 * AI Routes
 * Converted from: app/api/ai/*/route.ts
 * AI-powered features (audit, feedback, quarterly review)
 */

import express from 'express';
import { getAIMonitor } from '../lib/monitoring/aiMonitor.js';
import { getLLMClient } from '../lib/ai/llm.js';
import { log as logger } from '../lib/logger.js';

const router = express.Router();

/**
 * POST /api/ai/audit
 * Submit manual audit of AI-generated content
 */
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

    // Validation
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

    logger.info({
      type: 'ai_audit_submitted',
      auditId,
      reportId,
      manualReviewScore,
      accuracyScore,
      completenessScore,
    }, 'AI audit record submitted');

    res.json({
      success: true,
      data: {
        auditId,
        message: 'Audit record created successfully',
      },
    });
  } catch (error) {
    logger.error({
      type: 'audit_submission_error',
      error: error instanceof Error ? error.message : 'Unknown',
    }, 'Failed to submit audit');

    res.status(500).json({
      success: false,
      error: 'Failed to submit audit',
    });
  }
});

/**
 * POST /api/ai/feedback
 * Generate AI feedback for a report
 */
router.post('/feedback', async (req, res) => {
  try {
    const { reportText } = req.body;

    if (!reportText) {
      return res.status(400).json({
        success: false,
        error: 'reportText is required',
      });
    }

    const llm = getLLMClient();
    const feedback = await llm.generateFeedback(reportText);

    logger.info({ type: 'ai_feedback_generated' }, 'AI feedback generated');

    res.json({
      success: true,
      data: { feedback },
    });
  } catch (error) {
    logger.error({
      type: 'ai_feedback_error',
      error: error instanceof Error ? error.message : 'Unknown',
    }, 'Failed to generate feedback');

    res.status(500).json({
      success: false,
      error: 'Failed to generate feedback',
    });
  }
});

/**
 * POST /api/ai/quarterly-review
 * Generate quarterly review report
 */
router.post('/quarterly-review', async (req, res) => {
  try {
    const { pswId, startDate, endDate } = req.body;

    if (!pswId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'pswId, startDate, and endDate are required',
      });
    }

    const llm = getLLMClient();
    const review = await llm.generateQuarterlyReview(pswId, startDate, endDate);

    logger.info({
      type: 'quarterly_review_generated',
      pswId,
      startDate,
      endDate,
    }, 'Quarterly review generated');

    res.json({
      success: true,
      data: { review },
    });
  } catch (error) {
    logger.error({
      type: 'quarterly_review_error',
      error: error instanceof Error ? error.message : 'Unknown',
    }, 'Failed to generate quarterly review');

    res.status(500).json({
      success: false,
      error: 'Failed to generate quarterly review',
    });
  }
});

export default router;
