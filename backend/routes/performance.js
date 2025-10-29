/**
 * Performance Routes
 * Converted from: app/api/performance/metrics/route.ts
 * Performance metrics endpoint
 */

import express from 'express';

const router = express.Router();

/**
 * GET /api/performance/metrics
 * Returns performance metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      cpu: process.cpuUsage(),
    };

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance metrics',
    });
  }
});

export default router;
