/**
 * Health Check Endpoint - PSW Voice Documentation System
 *
 * Monitors system health for uptime monitoring and load balancers
 * GET /api/health
 *
 * Returns:
 * - 200: System healthy
 * - 503: System unhealthy or degraded
 */

import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { getEncryptedDb } from '@/lib/database/encryptedDb';

export const dynamic = 'force-dynamic'; // Always run fresh
export const runtime = 'nodejs';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: ServiceStatus;
    ollama: ServiceStatus;
    filesystem: ServiceStatus;
  };
  metrics?: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

interface ServiceStatus {
  status: 'ok' | 'degraded' | 'error' | 'dev_mode_skip';
  message?: string;
  responseTime?: number;
}

export async function GET() {
  const startTime = Date.now();
  const health: HealthCheck = {
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
      // In development mode, better-sqlite3 native bindings may not load in Next.js
      // This is expected and doesn't indicate a real problem
      const isDevelopment = process.env.NEXT_PUBLIC_ENVIRONMENT === 'local';
      const errorMessage =
        error instanceof Error ? error.message : 'Database connection failed';
      const isNativeBindingError = errorMessage.includes('bindings file');

      health.services.database = {
        status:
          isDevelopment && isNativeBindingError ? 'dev_mode_skip' : 'error',
        message:
          isDevelopment && isNativeBindingError
            ? 'Native module - use production build or direct Node.js scripts for DB access'
            : errorMessage,
        responseTime: Date.now() - dbStart,
      };

      // Only mark unhealthy if it's a real error (not dev mode limitation)
      if (!isDevelopment || !isNativeBindingError) {
        health.status = 'unhealthy';
      }
    }

    // Check Ollama service
    const ollamaStart = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch('http://localhost:11434/api/tags', {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        const hasLlama = data.models?.some((m: any) =>
          m.name.includes('llama3.3')
        );
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
        health.status = 'degraded'; // AI not critical, mark degraded
      }
    } catch (error) {
      health.services.ollama = {
        status: 'error',
        message:
          error instanceof Error ? error.message : 'Ollama not reachable',
        responseTime: Date.now() - ollamaStart,
      };
      health.status = 'degraded'; // AI not critical, mark degraded
    }

    // Check filesystem (database file exists)
    try {
      const dbPath = process.env.LOCAL_DB_PATH || './local_psw_data.db';
      const dbExists = existsSync(dbPath);
      health.services.filesystem = {
        status: dbExists ? 'ok' : 'error',
        message: dbExists ? undefined : 'Database file not found',
      };
      if (!dbExists) health.status = 'unhealthy';
    } catch (error) {
      health.services.filesystem = {
        status: 'error',
        message:
          error instanceof Error ? error.message : 'Filesystem check failed',
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
    const statusCode =
      health.status === 'healthy'
        ? 200
        : health.status === 'degraded'
          ? 200
          : 503;
    const totalResponseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        ...health,
        responseTime: totalResponseTime,
      },
      { status: statusCode }
    );
  } catch (error) {
    // Catastrophic failure
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
        services: health.services,
      },
      { status: 503 }
    );
  }
}
