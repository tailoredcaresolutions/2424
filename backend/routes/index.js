/**
 * API Routes Index
 * Consolidates all API endpoints from Next.js app/api structure
 */

import express from 'express';

const router = express.Router();

// Import route modules
import healthRoutes from './health.js';
import authRoutes from './auth.js';
import aiRoutes from './ai.js';
import searchRoutes from './search.js';
import backupRoutes from './backup.js';
import monitoringRoutes from './monitoring.js';
import performanceRoutes from './performance.js';

// Mount routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/ai', aiRoutes);
router.use('/search', searchRoutes);
router.use('/backup', backupRoutes);
router.use('/monitoring', monitoringRoutes);
router.use('/performance', performanceRoutes);

export default router;
