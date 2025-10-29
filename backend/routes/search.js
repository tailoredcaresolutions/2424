/**
 * Search Routes
 * Converted from: app/api/search/route.ts
 * Advanced search with filters
 */

import express from 'express';
import { getSearchEngine } from '../lib/search/advancedSearch.ts';
import { log as logger } from '../lib/logger.ts';

const router = express.Router();

/**
 * GET /api/search
 * Advanced search with filters
 */
router.get('/', async (req, res) => {
  try {
    const filters = {
      query: req.query.q || undefined,
      pswId: req.query.pswId ? parseInt(req.query.pswId) : undefined,
      clientId: req.query.clientId ? parseInt(req.query.clientId) : undefined,
      dateFrom: req.query.dateFrom || undefined,
      dateTo: req.query.dateTo || undefined,
      status: req.query.status || undefined,
      concernsOnly: req.query.concernsOnly === 'true',
      includeDeleted: req.query.includeDeleted === 'true',
      sortBy: req.query.sortBy || 'date',
      sortOrder: req.query.sortOrder || 'desc',
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
    };

    const searchEngine = getSearchEngine();
    const results = searchEngine.search(filters);

    logger.info({
      type: 'search_request',
      query: filters.query,
      total: results.total,
    }, 'Search request processed');

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error({
      type: 'search_error',
      error: error instanceof Error ? error.message : 'Unknown',
    }, 'Search request failed');

    res.status(500).json({
      success: false,
      error: 'Search request failed',
    });
  }
});

export default router;
