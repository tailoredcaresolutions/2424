/**
 * Authentication Routes
 * Converted from: app/api/auth/mfa/*/route.ts
 * MFA enrollment and verification
 */

import express from 'express';
import { getMFAService } from '../lib/security/mfaService.js';
import { log as logger } from '../lib/logger.js';

const router = express.Router();

/**
 * POST /api/auth/mfa/enroll
 * Initiates MFA enrollment for a user
 */
router.post('/mfa/enroll', async (req, res) => {
  try {
    const { userId, username } = req.body;

    // Validation
    if (!userId || !username) {
      return res.status(400).json({
        error: 'userId and username are required',
      });
    }

    // Start MFA enrollment
    const mfaService = getMFAService();
    const enrollment = await mfaService.enrollUser(userId, username);

    logger.info({
      type: 'api_mfa_enroll',
      userId,
      username,
    }, `MFA enrollment initiated for user ${userId}`);

    res.json({
      success: true,
      data: {
        qrCode: enrollment.qrCodeDataUrl,
        backupCodes: enrollment.backupCodes,
        enrollmentToken: enrollment.enrollmentToken,
      },
      message: 'Scan the QR code with your authenticator app and save your backup codes',
    });
  } catch (error) {
    logger.error({
      type: 'api_mfa_enroll_error',
      error: error instanceof Error ? error.message : 'Unknown',
    }, 'MFA enrollment API error');

    res.status(500).json({
      error: 'Failed to initiate MFA enrollment',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/auth/mfa/verify
 * Verify TOTP code
 */
router.post('/mfa/verify', async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({
        error: 'userId and code are required',
      });
    }

    const mfaService = getMFAService();
    const result = await mfaService.verifyCode(userId, code);

    if (result.success) {
      logger.info({
        type: 'api_mfa_verify_success',
        userId,
      }, 'MFA verification successful');

      res.json({
        success: true,
        message: 'MFA verification successful',
      });
    } else {
      logger.warn({
        type: 'api_mfa_verify_failed',
        userId,
      }, 'MFA verification failed');

      res.status(401).json({
        success: false,
        error: 'Invalid MFA code',
      });
    }
  } catch (error) {
    logger.error({
      type: 'api_mfa_verify_error',
      error: error instanceof Error ? error.message : 'Unknown',
    }, 'MFA verification API error');

    res.status(500).json({
      error: 'Failed to verify MFA code',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/auth/mfa/verify-enrollment
 * Complete MFA enrollment
 */
router.post('/mfa/verify-enrollment', async (req, res) => {
  try {
    const { userId, enrollmentToken, code } = req.body;

    if (!userId || !enrollmentToken || !code) {
      return res.status(400).json({
        error: 'userId, enrollmentToken, and code are required',
      });
    }

    const mfaService = getMFAService();
    const result = await mfaService.verifyEnrollment(userId, enrollmentToken, code);

    if (result.success) {
      logger.info({
        type: 'api_mfa_enrollment_complete',
        userId,
      }, 'MFA enrollment completed');

      res.json({
        success: true,
        message: 'MFA enrollment completed successfully',
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid enrollment verification',
      });
    }
  } catch (error) {
    logger.error({
      type: 'api_mfa_verify_enrollment_error',
      error: error instanceof Error ? error.message : 'Unknown',
    }, 'MFA enrollment verification error');

    res.status(500).json({
      error: 'Failed to complete MFA enrollment',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/auth/mfa/verify-backup-code
 * Verify backup recovery code
 */
router.post('/mfa/verify-backup-code', async (req, res) => {
  try {
    const { userId, backupCode } = req.body;

    if (!userId || !backupCode) {
      return res.status(400).json({
        error: 'userId and backupCode are required',
      });
    }

    const mfaService = getMFAService();
    const result = await mfaService.verifyBackupCode(userId, backupCode);

    if (result.success) {
      logger.info({
        type: 'api_mfa_backup_code_used',
        userId,
      }, 'Backup code verified successfully');

      res.json({
        success: true,
        message: 'Backup code verified successfully',
      });
    } else {
      logger.warn({
        type: 'api_mfa_backup_code_failed',
        userId,
      }, 'Invalid backup code');

      res.status(401).json({
        success: false,
        error: 'Invalid backup code',
      });
    }
  } catch (error) {
    logger.error({
      type: 'api_mfa_backup_code_error',
      error: error instanceof Error ? error.message : 'Unknown',
    }, 'Backup code verification error');

    res.status(500).json({
      error: 'Failed to verify backup code',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
