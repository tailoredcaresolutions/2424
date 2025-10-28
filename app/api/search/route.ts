/**
 * Advanced Search API
 * Full-text search and filtering for shift reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSearchEngine, SearchFilters } from '@/lib/search/advancedSearch';
import { log as logger } from '@/lib/logger';

/**
 * GET /api/search
 * Advanced search with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: SearchFilters = {
      query: searchParams.get('q') || undefined,
      pswId: searchParams.get('pswId')
        ? parseInt(searchParams.get('pswId')!)
        : undefined,
      clientId: searchParams.get('clientId')
        ? parseInt(searchParams.get('clientId')!)
        : undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      status: searchParams.get('status') || undefined,
      concernsOnly: searchParams.get('concernsOnly') === 'true',
      includeDeleted: searchParams.get('includeDeleted') === 'true',
      sortBy: (searchParams.get('sortBy') as any) || 'date',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : 50,
      offset: searchParams.get('offset')
        ? parseInt(searchParams.get('offset')!)
        : 0,
    };

    const searchEngine = getSearchEngine();
    const results = searchEngine.search(filters);

    logger.info(
      {
        type: 'search_request',
        query: filters.query,
        total: results.total,
      },
      'Search request processed'
    );

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error(
      {
        type: 'search_error',
        error: error instanceof Error ? error.message : 'Unknown',
      },
      'Search request failed'
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Search request failed',
      },
      { status: 500 }
    );
  }
}
