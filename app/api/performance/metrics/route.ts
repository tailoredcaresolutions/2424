/**
 * Performance Metrics API - PSW Voice Documentation System
 *
 * Endpoints for performance monitoring and optimization:
 * - GET: Collect and return current performance metrics
 * - POST: Run performance optimization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPerformanceOptimizer } from '@/lib/performance/performanceOptimizer';
import { log as logger } from '@/lib/logger';

/**
 * GET /api/performance/metrics
 * Get current performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    const optimizer = getPerformanceOptimizer();

    // Collect current metrics
    const metrics = await optimizer.collectMetrics();

    // Get slow query report
    const slowQueryReport = optimizer.getSlowQueryReport();

    // Get recent query history
    const queryHistory = optimizer.getQueryHistory(20);

    logger.info(
      {
        type: 'performance_metrics_retrieved',
        cacheHitRate: metrics.cacheHitRate,
        avgQueryTime: metrics.avgQueryTime,
      },
      'Performance metrics retrieved'
    );

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        slowQueryReport,
        queryHistory,
      },
    });
  } catch (error) {
    logger.error(
      {
        type: 'performance_metrics_error',
        error: error instanceof Error ? error.message : 'Unknown',
      },
      'Failed to retrieve performance metrics'
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve performance metrics',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/performance/metrics
 * Run performance optimization
 */
export async function POST(request: NextRequest) {
  try {
    const optimizer = getPerformanceOptimizer();

    logger.info({ type: 'performance_optimization_triggered' }, 'Performance optimization triggered via API');

    // Run optimization
    const result = await optimizer.optimize();

    logger.info(
      {
        type: 'performance_optimization_complete',
        itemsWarmed: result.cacheWarming.itemsWarmed,
        recommendations: result.recommendations.length,
      },
      'Performance optimization complete'
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(
      {
        type: 'performance_optimization_error',
        error: error instanceof Error ? error.message : 'Unknown',
      },
      'Performance optimization failed'
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Performance optimization failed',
      },
      { status: 500 }
    );
  }
}
