/**
 * MFA Verification API - Login TOTP Verification
 * POST /api/auth/mfa/verify
 *
 * Verifies TOTP code during login
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMFAService } from '@/lib/security/mfaService';
import { log as logger } from '@/lib/logger';
import { withRateLimit, authLimiter } from '@/lib/middleware/rateLimiter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Apply strict rate limiting (5 attempts per 15 minutes for brute-force protection)
    const rateLimitResult = await withRateLimit(request, authLimiter, 5);
    if (rateLimitResult) return rateLimitResult;

    const body = await request.json();
    const { userId, totpCode } = body;

    // Validation
    if (!userId || !totpCode) {
      return NextResponse.json(
        { error: 'userId and totpCode are required' },
        { status: 400 }
      );
    }

    // Verify TOTP
    const mfaService = getMFAService();
    const result = await mfaService.verifyTOTP(userId, totpCode);

    if (result.success) {
      logger.info(
        { type: 'api_mfa_verify_success', userId },
        `MFA verification successful for user ${userId}`
      );

      return NextResponse.json({
        success: true,
        message: result.message,
      });
    } else {
      logger.warn(
        { type: 'api_mfa_verify_failed', userId },
        `MFA verification failed for user ${userId}`
      );

      return NextResponse.json(
        {
          success: false,
          error: result.message,
          requiresSetup: result.requiresSetup,
        },
        { status: 401 }
      );
    }
  } catch (error) {
    logger.error(
      {
        type: 'api_mfa_verify_error',
        error: error instanceof Error ? error.message : 'Unknown',
      },
      'MFA verification API error'
    );

    return NextResponse.json(
      {
        error: 'Failed to verify MFA code',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
