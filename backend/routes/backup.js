/**
 * Backup Routes
 * Converted from: app/api/backup/create/route.ts
 * Database backup creation
 */

import express from 'express';
import { getBackupService } from '../lib/backup/backupService.js';
import { log as logger } from '../lib/logger.js';

const router = express.Router();

/**
 * POST /api/backup/create
 * Creates a database backup on demand
 */
router.post('/create', async (req, res) => {
  try {
    logger.info({ type: 'api_backup_create_started' }, 'Backup creation requested');

    const backupService = getBackupService();
    const result = await backupService.createBackup();

    if (result.success) {
      res.json({
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
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    logger.error({
      type: 'api_backup_create_error',
      error: error instanceof Error ? error.message : 'Unknown',
    }, 'Backup creation API error');

    res.status(500).json({
      error: 'Failed to create backup',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
