/**
 * Monitoring Routes
 * Converted from: app/api/monitoring/dashboard/route.ts
 * Health monitoring dashboard
 */

import express from 'express';
import { getHealthMonitor } from '../lib/monitoring/healthMonitor.js';
import { log as logger } from '../lib/logger.js';

const router = express.Router();

/**
 * GET /api/monitoring/dashboard
 * Returns comprehensive health metrics
 */
router.get('/dashboard', async (req, res) => {
  try {
    const healthMonitor = getHealthMonitor();
    const report = await healthMonitor.getHealthReport();

    // Store metrics for historical tracking
    await healthMonitor.storeMetrics(report);

    logger.info({
      type: 'api_monitoring_dashboard',
      overall: report.overall,
      alerts: report.alerts.length,
    }, `Health dashboard accessed - Status: ${report.overall}`);

    const statusCode = report.overall === 'healthy' ? 200 : report.overall === 'degraded' ? 200 : 503;
    res.status(statusCode).json(report);
  } catch (error) {
    logger.error({
      type: 'api_monitoring_dashboard_error',
      error: error instanceof Error ? error.message : 'Unknown',
    }, 'Health monitoring dashboard API error');

    res.status(500).json({
      error: 'Failed to generate health report',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
