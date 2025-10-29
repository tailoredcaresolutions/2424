/**
 * Backup Creation API
 * POST /api/backup/create
 *
 * Creates a database backup on demand
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBackupService } from '@/lib/backup/backupService';
import { log as logger } from '@/lib/logger';
import { withRateLimit, apiLimiter } from '@/lib/middleware/rateLimiter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (100 requests per minute)
    const rateLimitResult = await withRateLimit(request, apiLimiter, 100);
    if (rateLimitResult) return rateLimitResult;

    logger.info(
      { type: 'api_backup_create_started' },
      'Backup creation requested'
    );

    // Create backup
    const backupService = getBackupService();
    const result = await backupService.createBackup();

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          backupPath: result.backupPath,
          checksum: result.checksum,
          size: result.size,
          duration: result.duration,
        },
        message: 'Backup created successfully',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error(
      {
        type: 'api_backup_create_error',
        error: error instanceof Error ? error.message : 'Unknown',
      },
      'Backup creation API error'
    );

    return NextResponse.json(
      {
        error: 'Failed to create backup',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
