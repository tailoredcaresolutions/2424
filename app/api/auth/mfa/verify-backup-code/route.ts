/**
 * MFA Backup Code Verification API
 * POST /api/auth/mfa/verify-backup-code
 *
 * Verifies backup recovery code for account access
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMFAService } from '@/lib/security/mfaService';
import { log as logger } from '@/lib/logger';
import { withRateLimit, authLimiter } from '@/lib/middleware/rateLimiter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Apply strict rate limiting (5 attempts per 15 minutes)
    const rateLimitResult = await withRateLimit(request, authLimiter, 5);
    if (rateLimitResult) return rateLimitResult;

    const body = await request.json();
    const { userId, backupCode } = body;

    // Validation
    if (!userId || !backupCode) {
      return NextResponse.json(
        { error: 'userId and backupCode are required' },
        { status: 400 }
      );
    }

    // Verify backup code
    const mfaService = getMFAService();
    const result = await mfaService.verifyBackupCode(userId, backupCode);

    if (result.success) {
      logger.info(
        {
          type: 'api_mfa_backup_code_success',
          userId,
          remainingCodes: result.remainingCodes,
        },
        `Backup code verified for user ${userId}`
      );

      return NextResponse.json({
        success: true,
        message: result.message,
        remainingCodes: result.remainingCodes,
        warning:
          result.remainingCodes && result.remainingCodes <= 2
            ? 'You have 2 or fewer backup codes remaining. Please generate new codes.'
            : undefined,
      });
    } else {
      logger.warn(
        { type: 'api_mfa_backup_code_failed', userId },
        `Invalid backup code for user ${userId}`
      );

      return NextResponse.json(
        {
          success: false,
          error: result.message,
          remainingCodes: result.remainingCodes,
        },
        { status: 401 }
      );
    }
  } catch (error) {
    logger.error(
      {
        type: 'api_mfa_backup_code_error',
        error: error instanceof Error ? error.message : 'Unknown',
      },
      'Backup code verification API error'
    );

    return NextResponse.json(
      {
        error: 'Failed to verify backup code',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
