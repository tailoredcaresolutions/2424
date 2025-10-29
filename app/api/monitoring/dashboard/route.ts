/**
 * Health Monitoring Dashboard API
 * GET /api/monitoring/dashboard
 *
 * Returns comprehensive health metrics and status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getHealthMonitor } from '@/lib/monitoring/healthMonitor';
import { log as logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const healthMonitor = getHealthMonitor();

    // Get comprehensive health report
    const report = await healthMonitor.getHealthReport();

    // Store metrics for historical tracking
    await healthMonitor.storeMetrics(report);

    logger.info(
      {
        type: 'api_monitoring_dashboard',
        overall: report.overall,
        alerts: report.alerts.length,
      },
      `Health dashboard accessed - Status: ${report.overall}`
    );

    // Return appropriate status code based on health
    const statusCode =
      report.overall === 'healthy'
        ? 200
        : report.overall === 'degraded'
          ? 200
          : 503;

    return NextResponse.json(report, { status: statusCode });
  } catch (error) {
    logger.error(
      {
        type: 'api_monitoring_dashboard_error',
        error: error instanceof Error ? error.message : 'Unknown',
      },
      'Health monitoring dashboard API error'
    );

    return NextResponse.json(
      {
        error: 'Failed to generate health report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
