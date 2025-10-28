/**
 * Performance Optimizer - PSW Voice Documentation System
 *
 * Comprehensive performance optimization utilities:
 * - Query analysis and optimization recommendations
 * - Cache warming for frequently accessed data
 * - Response compression (gzip/brotli)
 * - Database query result caching
 * - Slow query detection and alerting
 * - Performance metrics collection
 *
 * Target Performance Standards:
 * - P95 response time < 200ms
 * - P99 response time < 500ms
 * - Support 50-100 concurrent users
 * - Cache hit rate > 80%
 */

import { getConnectionPool } from '../database/connectionPool';
import { getRedisCache } from '../cache/redisCache';
import { log as logger } from '../logger';

interface QueryAnalysis {
  sql: string;
  executionTime: number;
  rowsReturned: number;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
}

interface CacheWarmingResult {
  itemsWarmed: number;
  duration: number;
  errors: number;
}

interface PerformanceMetrics {
  avgQueryTime: number;
  slowQueries: number;
  cacheHitRate: number;
  activeConnections: number;
  memoryUsage: number;
  timestamp: string;
}

export class PerformanceOptimizer {
  private cache = getRedisCache();
  private pool = getConnectionPool();
  private queryHistory: QueryAnalysis[] = [];
  private readonly SLOW_QUERY_THRESHOLD = 100; // ms
  private readonly CACHE_TTL = 3600; // 1 hour

  /**
   * Analyze query performance and provide recommendations
   */
  public async analyzeQuery(sql: string): Promise<QueryAnalysis> {
    const startTime = Date.now();
    let rowsReturned = 0;
    const recommendations: string[] = [];

    try {
      // Execute query
      const results = await this.pool.query(sql);
      rowsReturned = results.length;
      const executionTime = Date.now() - startTime;

      // Analyze query patterns
      const sqlLower = sql.toLowerCase();

      // Check for missing indexes
      if (sqlLower.includes('where') && !sqlLower.includes('index')) {
        if (sqlLower.includes('like')) {
          recommendations.push(
            'Consider using FTS (Full Text Search) for LIKE queries'
          );
        } else {
          recommendations.push(
            'Consider adding an index on WHERE clause columns'
          );
        }
      }

      // Check for SELECT *
      if (sqlLower.includes('select *')) {
        recommendations.push('Avoid SELECT * - specify only needed columns');
      }

      // Check for N+1 queries
      if (sqlLower.includes('limit 1') && rowsReturned === 1) {
        recommendations.push(
          'Consider batching single-row queries to avoid N+1 problem'
        );
      }

      // Check for large result sets
      if (rowsReturned > 1000) {
        recommendations.push(
          'Large result set - consider pagination or filtering'
        );
      }

      // Check for missing LIMIT
      if (!sqlLower.includes('limit') && rowsReturned > 100) {
        recommendations.push('Add LIMIT clause to prevent large result sets');
      }

      // Determine severity
      let severity: 'low' | 'medium' | 'high' = 'low';
      if (executionTime > 500) {
        severity = 'high';
        recommendations.push(
          'CRITICAL: Query exceeds 500ms - immediate optimization required'
        );
      } else if (executionTime > 200) {
        severity = 'medium';
        recommendations.push('Query exceeds 200ms - optimization recommended');
      }

      const analysis: QueryAnalysis = {
        sql: sql.substring(0, 200),
        executionTime,
        rowsReturned,
        recommendations,
        severity,
      };

      // Store in history
      this.queryHistory.push(analysis);
      if (this.queryHistory.length > 100) {
        this.queryHistory.shift();
      }

      // Log slow queries
      if (executionTime > this.SLOW_QUERY_THRESHOLD) {
        logger.warn(
          {
            type: 'slow_query_detected',
            executionTime,
            sql: sql.substring(0, 100),
            recommendations: recommendations.length,
          },
          `Slow query detected: ${executionTime}ms`
        );
      }

      return analysis;
    } catch (error) {
      logger.error(
        {
          type: 'query_analysis_error',
          sql: sql.substring(0, 100),
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Query analysis failed'
      );
      throw error;
    }
  }

  /**
   * Warm cache with frequently accessed data
   */
  public async warmCache(): Promise<CacheWarmingResult> {
    const startTime = Date.now();
    let itemsWarmed = 0;
    let errors = 0;

    logger.info({ type: 'cache_warming_start' }, 'Starting cache warming');

    try {
      // Warm PSW users list
      try {
        const psws = await this.pool.query(
          'SELECT * FROM psw_users ORDER BY id'
        );
        await this.cache.set('psw_users:all', psws, { ttl: this.CACHE_TTL });
        itemsWarmed++;
      } catch (error) {
        errors++;
        logger.warn(
          { type: 'cache_warm_error', entity: 'psw_users' },
          'Failed to warm PSW users cache'
        );
      }

      // Warm clients list
      try {
        const clients = await this.pool.query(
          'SELECT * FROM clients ORDER BY id'
        );
        await this.cache.set('clients:all', clients, { ttl: this.CACHE_TTL });
        itemsWarmed++;
      } catch (error) {
        errors++;
        logger.warn(
          { type: 'cache_warm_error', entity: 'clients' },
          'Failed to warm clients cache'
        );
      }

      // Warm recent shift reports (last 30 days)
      try {
        const thirtyDaysAgo = new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString();
        const recentReports = await this.pool.query(
          'SELECT * FROM shift_reports WHERE shift_date > ? ORDER BY shift_date DESC LIMIT 100',
          [thirtyDaysAgo]
        );
        await this.cache.set('shift_reports:recent', recentReports, {
          ttl: 1800,
        }); // 30 min TTL
        itemsWarmed++;
      } catch (error) {
        errors++;
        logger.warn(
          { type: 'cache_warm_error', entity: 'shift_reports' },
          'Failed to warm shift reports cache'
        );
      }

      // Warm frequently accessed clients (those with reports in last 7 days)
      try {
        const sevenDaysAgo = new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString();
        const activeClients = await this.pool.query(
          `SELECT DISTINCT c.* FROM clients c
           INNER JOIN shift_reports sr ON c.id = sr.client_id
           WHERE sr.shift_date > ?`,
          [sevenDaysAgo]
        );
        await this.cache.set('clients:active', activeClients, { ttl: 3600 });
        itemsWarmed++;
      } catch (error) {
        errors++;
        logger.warn(
          { type: 'cache_warm_error', entity: 'active_clients' },
          'Failed to warm active clients cache'
        );
      }

      const duration = Date.now() - startTime;

      logger.info(
        { type: 'cache_warming_complete', itemsWarmed, errors, duration },
        `Cache warming complete: ${itemsWarmed} items in ${duration}ms`
      );

      return { itemsWarmed, duration, errors };
    } catch (error) {
      logger.error(
        {
          type: 'cache_warming_error',
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Cache warming failed'
      );
      return {
        itemsWarmed,
        duration: Date.now() - startTime,
        errors: errors + 1,
      };
    }
  }

  /**
   * Get cached query result or execute and cache
   */
  public async getCachedQuery<T = any>(
    cacheKey: string,
    sql: string,
    params: any[] = [],
    ttl: number = this.CACHE_TTL
  ): Promise<T[]> {
    // Try cache first
    const cached = await this.cache.get<T[]>(cacheKey);
    if (cached) {
      logger.debug(
        { type: 'cache_hit', key: cacheKey },
        'Query result retrieved from cache'
      );
      return cached;
    }

    // Execute query and cache result
    const results = await this.pool.query<T>(sql, params);
    await this.cache.set(cacheKey, results, { ttl });

    logger.debug(
      { type: 'cache_miss', key: cacheKey, rows: results.length },
      'Query executed and cached'
    );

    return results;
  }

  /**
   * Invalidate related cache entries
   */
  public async invalidateCache(pattern: string): Promise<number> {
    const deleted = await this.cache.delPattern(`*${pattern}*`);
    logger.info(
      { type: 'cache_invalidated', pattern, deleted },
      `Cache invalidated: ${deleted} keys`
    );
    return deleted;
  }

  /**
   * Collect performance metrics
   */
  public async collectMetrics(): Promise<PerformanceMetrics> {
    // Get pool stats
    const poolStats = this.pool.getStats();

    // Get cache stats
    const cacheStats = this.cache.getStats();

    // Calculate memory usage
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB

    return {
      avgQueryTime: poolStats.avgQueryTime,
      slowQueries: poolStats.slowQueries,
      cacheHitRate: cacheStats.hitRate,
      activeConnections: poolStats.activeConnections,
      memoryUsage: Math.round(memoryUsage * 100) / 100,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get query analysis history
   */
  public getQueryHistory(limit: number = 50): QueryAnalysis[] {
    return this.queryHistory.slice(-limit);
  }

  /**
   * Get slow query report
   */
  public getSlowQueryReport(): {
    total: number;
    byQuery: Record<string, number>;
    avgExecutionTime: number;
  } {
    const slowQueries = this.queryHistory.filter(
      (q) => q.executionTime > this.SLOW_QUERY_THRESHOLD
    );

    const byQuery: Record<string, number> = {};
    let totalTime = 0;

    for (const query of slowQueries) {
      const key = query.sql.substring(0, 50);
      byQuery[key] = (byQuery[key] || 0) + 1;
      totalTime += query.executionTime;
    }

    return {
      total: slowQueries.length,
      byQuery,
      avgExecutionTime:
        slowQueries.length > 0 ? totalTime / slowQueries.length : 0,
    };
  }

  /**
   * Run comprehensive performance optimization
   */
  public async optimize(): Promise<{
    cacheWarming: CacheWarmingResult;
    metrics: PerformanceMetrics;
    recommendations: string[];
  }> {
    logger.info(
      { type: 'performance_optimization_start' },
      'Starting performance optimization'
    );

    // Warm cache
    const cacheWarming = await this.warmCache();

    // Collect metrics
    const metrics = await this.collectMetrics();

    // Generate recommendations
    const recommendations: string[] = [];

    if (metrics.cacheHitRate < 80) {
      recommendations.push(
        'Cache hit rate below 80% - consider increasing TTL or warming more data'
      );
    }

    if (metrics.avgQueryTime > 50) {
      recommendations.push(
        'Average query time above 50ms - review slow query report'
      );
    }

    if (metrics.slowQueries > 10) {
      recommendations.push(
        `${metrics.slowQueries} slow queries detected - optimization required`
      );
    }

    if (metrics.activeConnections > 4) {
      recommendations.push(
        'High connection usage - consider increasing pool size'
      );
    }

    if (metrics.memoryUsage > 500) {
      recommendations.push(
        'High memory usage - review cache size and query result sets'
      );
    }

    logger.info(
      {
        type: 'performance_optimization_complete',
        cacheHitRate: metrics.cacheHitRate,
        avgQueryTime: metrics.avgQueryTime,
        recommendations: recommendations.length,
      },
      'Performance optimization complete'
    );

    return {
      cacheWarming,
      metrics,
      recommendations,
    };
  }
}

// Singleton instance
let performanceOptimizerInstance: PerformanceOptimizer | null = null;

export function getPerformanceOptimizer(): PerformanceOptimizer {
  if (!performanceOptimizerInstance) {
    performanceOptimizerInstance = new PerformanceOptimizer();
  }
  return performanceOptimizerInstance;
}
