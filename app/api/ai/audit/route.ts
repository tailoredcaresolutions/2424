/**
 * AI Audit API
 * Manual quality review and accuracy audit system
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAIMonitor } from '@/lib/monitoring/aiMonitor';
import { log as logger } from '@/lib/logger';

/**
 * POST /api/ai/audit
 * Submit manual audit of AI-generated content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      reportId,
      aiGeneratedContent,
      manualReviewScore,
      accuracyScore,
      completenessScore,
      reviewerNotes,
      issuesFound,
    } = body;

    // Validation
    if (!reportId || !aiGeneratedContent) {
      return NextResponse.json(
        { success: false, error: 'reportId and aiGeneratedContent are required' },
        { status: 400 }
      );
    }

    if (!manualReviewScore || manualReviewScore < 1 || manualReviewScore > 5) {
      return NextResponse.json(
        { success: false, error: 'manualReviewScore must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (accuracyScore < 0 || accuracyScore > 100) {
      return NextResponse.json(
        { success: false, error: 'accuracyScore must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (completenessScore < 0 || completenessScore > 100) {
      return NextResponse.json(
        { success: false, error: 'completenessScore must be between 0 and 100' },
        { status: 400 }
      );
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

    return NextResponse.json({
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

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit audit',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/audit/sample
 * Get random sample of reports for manual audit
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sampleSize = parseInt(searchParams.get('sampleSize') || '20');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const monitor = getAIMonitor();

    const period = startDate && endDate ? { start: startDate, end: endDate } : undefined;
    const sample = monitor.selectRandomAuditSample(sampleSize, period);

    logger.info(
      {
        type: 'audit_sample_generated',
        sampleSize: sample.length,
        requested: sampleSize,
      },
      'Random audit sample generated'
    );

    return NextResponse.json({
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

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate audit sample',
      },
      { status: 500 }
    );
  }
}
