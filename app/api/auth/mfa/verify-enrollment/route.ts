/**
 * MFA Enrollment Verification API - Complete MFA Setup
 * POST /api/auth/mfa/verify-enrollment
 *
 * Completes MFA enrollment by verifying the first TOTP code
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMFAService } from '@/lib/security/mfaService';
import { log as logger } from '@/lib/logger';
import { withRateLimit, authLimiter } from '@/lib/middleware/rateLimiter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (5 attempts per 15 minutes)
    const rateLimitResult = await withRateLimit(request, authLimiter, 5);
    if (rateLimitResult) return rateLimitResult;

    const body = await request.json();
    const { userId, enrollmentToken, totpCode } = body;

    // Validation
    if (!userId || !enrollmentToken || !totpCode) {
      return NextResponse.json(
        { error: 'userId, enrollmentToken, and totpCode are required' },
        { status: 400 }
      );
    }

    // Complete enrollment
    const mfaService = getMFAService();
    const result = await mfaService.completeEnrollment(userId, enrollmentToken, totpCode);

    if (result.success) {
      logger.info(
        { type: 'api_mfa_enrollment_verified', userId },
        `MFA enrollment completed for user ${userId}`
      );

      return NextResponse.json({
        success: true,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error(
      {
        type: 'api_mfa_verify_enrollment_error',
        error: error instanceof Error ? error.message : 'Unknown',
      },
      'MFA enrollment verification API error'
    );

    return NextResponse.json(
      {
        error: 'Failed to verify MFA enrollment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
