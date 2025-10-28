/**
 * MFA Enrollment API - Start MFA Setup
 * POST /api/auth/mfa/enroll
 *
 * Initiates MFA enrollment for a user
 * Returns QR code and backup codes
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
    const { userId, username } = body;

    // Validation
    if (!userId || !username) {
      return NextResponse.json(
        { error: 'userId and username are required' },
        { status: 400 }
      );
    }

    // Start MFA enrollment
    const mfaService = getMFAService();
    const enrollment = await mfaService.enrollUser(userId, username);

    logger.info(
      { type: 'api_mfa_enroll', userId, username },
      `MFA enrollment initiated for user ${userId}`
    );

    return NextResponse.json({
      success: true,
      data: {
        qrCode: enrollment.qrCodeDataUrl,
        backupCodes: enrollment.backupCodes,
        enrollmentToken: enrollment.enrollmentToken,
      },
      message: 'Scan the QR code with your authenticator app and save your backup codes',
    });
  } catch (error) {
    logger.error(
      {
        type: 'api_mfa_enroll_error',
        error: error instanceof Error ? error.message : 'Unknown',
      },
      'MFA enrollment API error'
    );

    return NextResponse.json(
      {
        error: 'Failed to initiate MFA enrollment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
