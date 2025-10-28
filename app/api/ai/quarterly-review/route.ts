/**
 * AI Quarterly Review API
 * Comprehensive AI performance and quality review endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAIMonitor } from '@/lib/monitoring/aiMonitor';
import { log as logger } from '@/lib/logger';

/**
 * GET /api/ai/quarterly-review
 * Generate comprehensive quarterly review report
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Default to last quarter if not specified
    const end = endDate || new Date().toISOString();
    const start = startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const monitor = getAIMonitor();

    // Generate comprehensive report
    const quarterlyStats = monitor.generateQuarterlyReport(start, end);
    const satisfactionScores = monitor.getSatisfactionScores({ start, end });
    const incidents = monitor.getIncidentReport({ start, end });

    // Generate recommendations
    const recommendations: string[] = [];

    if (quarterlyStats.errorRate > 5) {
      recommendations.push(`High error rate (${quarterlyStats.errorRate}%) - Review model performance and error logs`);
    }

    if (quarterlyStats.avgResponseTime > 3000) {
      recommendations.push(`Slow response times (${quarterlyStats.avgResponseTime}ms avg) - Consider hardware upgrade or model optimization`);
    }

    if (satisfactionScores.accuracyScore < 4.0) {
      recommendations.push(`Low accuracy rating (${satisfactionScores.accuracyScore}/5) - Audit AI outputs and consider fine-tuning`);
    }

    if (quarterlyStats.contextUsageTrend.longConversations > quarterlyStats.totalRequests * 0.1) {
      recommendations.push(`Context usage increasing - ${quarterlyStats.contextUsageTrend.longConversations} long conversations detected`);
    }

    if (quarterlyStats.issueCount > quarterlyStats.totalRequests * 0.05) {
      recommendations.push(`${quarterlyStats.issueCount} issues reported - Review common error patterns`);
    }

    if (quarterlyStats.auditedSampleSize < 20) {
      recommendations.push(`Low audit sample size (${quarterlyStats.auditedSampleSize}) - Increase random audits for better quality assurance`);
    }

    logger.info(
      {
        type: 'quarterly_review_generated',
        period: `${start} to ${end}`,
        totalRequests: quarterlyStats.totalRequests,
      },
      'Quarterly review report generated'
    );

    return NextResponse.json({
      success: true,
      data: {
        period: {
          start,
          end,
        },
        quarterlyStats,
        satisfactionScores,
        incidents: {
          total: incidents.length,
          recentIncidents: incidents.slice(0, 10),
        },
        recommendations,
        summary: {
          overallHealth: calculateOverallHealth(quarterlyStats, satisfactionScores),
          keyMetrics: {
            aiPerformance: quarterlyStats.avgResponseTime < 3000 ? 'Good' : 'Needs Improvement',
            userSatisfaction: satisfactionScores.overallSatisfaction >= 4.0 ? 'Excellent' : satisfactionScores.overallSatisfaction >= 3.5 ? 'Good' : 'Needs Improvement',
            reliability: quarterlyStats.errorRate < 5 ? 'Excellent' : quarterlyStats.errorRate < 10 ? 'Good' : 'Needs Improvement',
          },
        },
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

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate quarterly review',
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate overall health score
 */
function calculateOverallHealth(stats: any, satisfaction: any): {
  score: number;
  rating: string;
} {
  let score = 100;

  // Deduct for high error rate
  if (stats.errorRate > 10) score -= 20;
  else if (stats.errorRate > 5) score -= 10;

  // Deduct for slow response times
  if (stats.avgResponseTime > 5000) score -= 20;
  else if (stats.avgResponseTime > 3000) score -= 10;

  // Deduct for low satisfaction
  if (satisfaction.overallSatisfaction < 3.0) score -= 30;
  else if (satisfaction.overallSatisfaction < 4.0) score -= 15;

  // Deduct for high issue rate
  const issueRate = stats.totalRequests > 0 ? (stats.issueCount / stats.totalRequests) * 100 : 0;
  if (issueRate > 10) score -= 20;
  else if (issueRate > 5) score -= 10;

  let rating = 'Excellent';
  if (score < 90) rating = 'Good';
  if (score < 75) rating = 'Fair';
  if (score < 60) rating = 'Needs Improvement';
  if (score < 40) rating = 'Critical';

  return { score: Math.max(0, score), rating };
}
