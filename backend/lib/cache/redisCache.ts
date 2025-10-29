/**
 * Redis Cache Service - PSW Voice Documentation System
 *
 * High-performance caching layer for:
 * - Session management
 * - API response caching
 * - Query result caching
 * - Rate limiting state
 *
 * Features:
 * - Automatic serialization/deserialization
 * - TTL (Time To Live) support
 * - Cache invalidation patterns
 * - Graceful degradation (falls back if Redis unavailable)
 */

import Redis, { RedisOptions } from 'ioredis';
import { log as logger } from '../logger.js';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix for namespacing
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
}

export class RedisCache {
  private client: Redis | null = null;
  private isConnected: boolean = false;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
  };

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Redis connection
   */
  private async initialize(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const redisOptions: RedisOptions = {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
      };

      this.client = new Redis(redisUrl, redisOptions);

      // Event handlers
      this.client.on('connect', () => {
        logger.info({ type: 'redis_connect' }, 'Redis connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info({ type: 'redis_ready' }, 'Redis ready');
      });

      this.client.on('error', (error) => {
        logger.error(
          { type: 'redis_error', error: error.message },
          'Redis connection error'
        );
        this.isConnected = false;
        this.stats.errors++;
      });

      this.client.on('close', () => {
        logger.warn({ type: 'redis_close' }, 'Redis connection closed');
        this.isConnected = false;
      });

      // Try to connect
      await this.client.connect();
    } catch (error) {
      logger.warn(
        {
          type: 'redis_init_failed',
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Redis initialization failed - operating without cache'
      );
      this.client = null;
      this.isConnected = false;
    }
  }

  /**
   * Get value from cache
   */
  public async get<T = any>(
    key: string,
    options?: CacheOptions
  ): Promise<T | null> {
    if (!this.isAvailable()) {
      this.stats.misses++;
      return null;
    }

    try {
      const prefixedKey = this.getPrefixedKey(key, options?.prefix);
      const value = await this.client!.get(prefixedKey);

      if (value === null) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;

      // Try to parse JSON, fallback to raw string
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      logger.error(
        {
          type: 'redis_get_error',
          key,
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Redis GET error'
      );
      this.stats.errors++;
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set value in cache
   */
  public async set(
    key: string,
    value: any,
    options?: CacheOptions
  ): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const prefixedKey = this.getPrefixedKey(key, options?.prefix);
      const serialized =
        typeof value === 'string' ? value : JSON.stringify(value);

      if (options?.ttl) {
        await this.client!.setex(prefixedKey, options.ttl, serialized);
      } else {
        await this.client!.set(prefixedKey, serialized);
      }

      this.stats.sets++;
      return true;
    } catch (error) {
      logger.error(
        {
          type: 'redis_set_error',
          key,
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Redis SET error'
      );
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  public async del(key: string, options?: CacheOptions): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const prefixedKey = this.getPrefixedKey(key, options?.prefix);
      await this.client!.del(prefixedKey);
      this.stats.deletes++;
      return true;
    } catch (error) {
      logger.error(
        {
          type: 'redis_del_error',
          key,
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Redis DEL error'
      );
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  public async delPattern(
    pattern: string,
    options?: CacheOptions
  ): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      const prefixedPattern = this.getPrefixedKey(pattern, options?.prefix);
      const keys = await this.client!.keys(prefixedPattern);

      if (keys.length === 0) {
        return 0;
      }

      const deleted = await this.client!.del(...keys);
      this.stats.deletes += deleted;
      return deleted;
    } catch (error) {
      logger.error(
        {
          type: 'redis_del_pattern_error',
          pattern,
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Redis DEL pattern error'
      );
      this.stats.errors++;
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  public async exists(key: string, options?: CacheOptions): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const prefixedKey = this.getPrefixedKey(key, options?.prefix);
      const result = await this.client!.exists(prefixedKey);
      return result === 1;
    } catch (error) {
      logger.error(
        {
          type: 'redis_exists_error',
          key,
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Redis EXISTS error'
      );
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Set TTL on existing key
   */
  public async expire(
    key: string,
    seconds: number,
    options?: CacheOptions
  ): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const prefixedKey = this.getPrefixedKey(key, options?.prefix);
      const result = await this.client!.expire(prefixedKey, seconds);
      return result === 1;
    } catch (error) {
      logger.error(
        {
          type: 'redis_expire_error',
          key,
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Redis EXPIRE error'
      );
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Increment counter (atomic)
   */
  public async incr(
    key: string,
    options?: CacheOptions
  ): Promise<number | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const prefixedKey = this.getPrefixedKey(key, options?.prefix);
      const value = await this.client!.incr(prefixedKey);
      return value;
    } catch (error) {
      logger.error(
        {
          type: 'redis_incr_error',
          key,
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Redis INCR error'
      );
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Get with callback (cache-aside pattern)
   */
  public async getOrSet<T = any>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T | null> {
    // Try cache first
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Fetch from source
    try {
      const value = await fetcher();
      if (value !== null && value !== undefined) {
        await this.set(key, value, options);
      }
      return value;
    } catch (error) {
      logger.error(
        {
          type: 'redis_get_or_set_error',
          key,
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Redis getOrSet error'
      );
      return null;
    }
  }

  /**
   * Flush all cache
   */
  public async flushAll(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.client!.flushall();
      logger.warn({ type: 'redis_flush_all' }, 'Redis cache flushed');
      return true;
    } catch (error) {
      logger.error(
        {
          type: 'redis_flush_error',
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Redis FLUSHALL error'
      );
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats & { hitRate: number; isConnected: boolean } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      isConnected: this.isConnected,
    };
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
    };
  }

  /**
   * Check if Redis is available
   */
  public isAvailable(): boolean {
    return this.client !== null && this.isConnected;
  }

  /**
   * Get prefixed key
   */
  private getPrefixedKey(key: string, prefix?: string): string {
    const defaultPrefix = 'psw:';
    const finalPrefix = prefix || defaultPrefix;
    return `${finalPrefix}${key}`;
  }

  /**
   * Close Redis connection
   */
  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
      logger.info({ type: 'redis_disconnect' }, 'Redis disconnected');
    }
  }
}

// Singleton instance
let redisCacheInstance: RedisCache | null = null;

export function getRedisCache(): RedisCache {
  if (!redisCacheInstance) {
    redisCacheInstance = new RedisCache();
  }
  return redisCacheInstance;
}
