/**
 * Health Check Routes
 * Converted from: app/api/health/route.ts
 *
 * Monitors system health for uptime monitoring and load balancers
 * GET /api/health
 */

import express from 'express';
import { existsSync } from 'fs';
import { getEncryptedDb } from '../lib/database/encryptedDb.ts';

const router = express.Router();

/**
 * GET /api/health
 * Returns system health status
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: { status: 'ok' },
      ollama: { status: 'ok' },
      filesystem: { status: 'ok' },
    },
  };

  try {
    // Check database connectivity
    const dbStart = Date.now();
    try {
      const db = getEncryptedDb();
      const result = db.prepare('SELECT 1 as test').get();
      health.services.database = {
        status: result ? 'ok' : 'error',
        responseTime: Date.now() - dbStart,
      };
    } catch (error) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      const errorMessage = error instanceof Error ? error.message : 'Database connection failed';
      const isNativeBindingError = errorMessage.includes('bindings file');

      health.services.database = {
        status: isDevelopment && isNativeBindingError ? 'dev_mode_skip' : 'error',
        message: isDevelopment && isNativeBindingError
          ? 'Native module - use production build for DB access'
          : errorMessage,
        responseTime: Date.now() - dbStart,
      };

      if (!isDevelopment || !isNativeBindingError) {
        health.status = 'unhealthy';
      }
    }

    // Check Ollama service
    const ollamaStart = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${process.env.OLLAMA_HOST}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        const hasLlama = data.models?.some((m) => m.name.includes('llama3.3'));
        health.services.ollama = {
          status: hasLlama ? 'ok' : 'degraded',
          message: hasLlama ? undefined : 'Llama 3.3 70B not found',
          responseTime: Date.now() - ollamaStart,
        };
        if (!hasLlama) health.status = 'degraded';
      } else {
        health.services.ollama = {
          status: 'error',
          message: `Ollama returned ${response.status}`,
          responseTime: Date.now() - ollamaStart,
        };
        health.status = 'degraded';
      }
    } catch (error) {
      health.services.ollama = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Ollama not reachable',
        responseTime: Date.now() - ollamaStart,
      };
      health.status = 'degraded';
    }

    // Check filesystem (database file exists)
    try {
      const dbPath = process.env.DATABASE_PATH || './data/local_psw_data.db';
      const dbExists = existsSync(dbPath);
      health.services.filesystem = {
        status: dbExists ? 'ok' : 'error',
        message: dbExists ? undefined : 'Database file not found',
      };
      if (!dbExists) health.status = 'unhealthy';
    } catch (error) {
      health.services.filesystem = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Filesystem check failed',
      };
      health.status = 'degraded';
    }

    // Add memory metrics
    const memUsage = process.memoryUsage();
    health.metrics = {
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      },
    };

    // Return appropriate status code
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    const totalResponseTime = Date.now() - startTime;

    res.status(statusCode).json({
      ...health,
      responseTime: totalResponseTime,
    });
  } catch (error) {
    // Catastrophic failure
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
      services: health.services,
    });
  }
});

export default router;
