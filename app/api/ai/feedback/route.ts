/**
 * PSW Feedback API
 * Collect and analyze PSW satisfaction and accuracy ratings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAIMonitor } from '@/lib/monitoring/aiMonitor';
import { log as logger } from '@/lib/logger';

/**
 * POST /api/ai/feedback
 * Submit PSW feedback on AI-generated report
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { userId, reportId, accuracyRating, helpfulnessRating, comments, issueReported, issueType } = body;

    // Validation
    if (!userId || !reportId) {
      return NextResponse.json(
        { success: false, error: 'userId and reportId are required' },
        { status: 400 }
      );
    }

    if (!accuracyRating || accuracyRating < 1 || accuracyRating > 5) {
      return NextResponse.json(
        { success: false, error: 'accuracyRating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (!helpfulnessRating || helpfulnessRating < 1 || helpfulnessRating > 5) {
      return NextResponse.json(
        { success: false, error: 'helpfulnessRating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const monitor = getAIMonitor();

    const feedbackId = monitor.recordFeedback({
      userId,
      reportId,
      accuracyRating,
      helpfulnessRating,
      comments,
      issueReported: issueReported || false,
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

    return NextResponse.json({
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

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit feedback',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/feedback
 * Get aggregated feedback statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const monitor = getAIMonitor();

    const period = startDate && endDate ? { start: startDate, end: endDate } : undefined;
    const satisfaction = monitor.getSatisfactionScores(period);

    return NextResponse.json({
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

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve feedback',
      },
      { status: 500 }
    );
  }
}
