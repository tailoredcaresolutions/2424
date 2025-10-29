/**
 * Database Connection Pool - PSW Voice Documentation System
 *
 * Connection pooling for better-sqlite3 with:
 * - Multiple read connections for concurrent queries
 * - Single write connection for ACID compliance
 * - Automatic connection recycling
 * - Connection health monitoring
 * - Query timeout handling
 *
 * Note: SQLite uses WAL mode for concurrent reads
 */

import Database from 'better-sqlite3-multiple-ciphers';
import { log as logger } from '../logger.ts';

interface PoolConfig {
  maxReadConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
}

interface PoolStats {
  activeConnections: number;
  idleConnections: number;
  totalQueries: number;
  slowQueries: number;
  avgQueryTime: number;
}

class DatabaseConnection {
  public db: Database.Database;
  public isActive: boolean = false;
  public lastUsed: number = Date.now();
  public queryCount: number = 0;

  constructor(dbPath: string, encryptionKey: string) {
    this.db = new Database(dbPath, { readonly: false });

    // Configure encryption
    this.db.pragma(`cipher='sqlcipher'`);
    this.db.pragma(`key='${encryptionKey}'`);
    this.db.pragma(`cipher_page_size=4096`);
    this.db.pragma(`kdf_iter=256000`);
    this.db.pragma(`cipher_hmac_algorithm=HMAC_SHA512`);
    this.db.pragma(`cipher_kdf_algorithm=PBKDF2_HMAC_SHA512`);

    // Performance optimizations
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = -64000');
    this.db.pragma('temp_store = MEMORY');
    this.db.pragma('mmap_size = 30000000000');
  }

  public markUsed(): void {
    this.isActive = true;
    this.lastUsed = Date.now();
    this.queryCount++;
  }

  public release(): void {
    this.isActive = false;
    this.lastUsed = Date.now();
  }

  public close(): void {
    this.db.close();
  }
}

export class ConnectionPool {
  private config: PoolConfig;
  private readConnections: DatabaseConnection[] = [];
  private writeConnection: DatabaseConnection | null = null;
  private dbPath: string;
  private encryptionKey: string;
  private stats = {
    totalQueries: 0,
    slowQueries: 0,
    queryTimes: [] as number[],
  };

  constructor(config?: Partial<PoolConfig>) {
    this.config = {
      maxReadConnections: 5, // 5 concurrent read connections
      connectionTimeout: 30000, // 30 seconds
      idleTimeout: 300000, // 5 minutes
      ...config,
    };

    this.dbPath = process.env.LOCAL_DB_PATH || './data/psw_data.db';
    this.encryptionKey =
      process.env.DATABASE_ENCRYPTION_KEY || 'CHANGE_THIS_IN_PRODUCTION';

    // Initialize connections
    this.initialize();

    // Start idle connection cleanup
    this.startIdleCleanup();
  }

  /**
   * Initialize connection pool
   */
  private initialize(): void {
    try {
      // Create write connection
      this.writeConnection = new DatabaseConnection(
        this.dbPath,
        this.encryptionKey
      );

      // Create initial read connections
      for (let i = 0; i < Math.min(2, this.config.maxReadConnections); i++) {
        const conn = new DatabaseConnection(this.dbPath, this.encryptionKey);
        this.readConnections.push(conn);
      }

      logger.info(
        {
          type: 'connection_pool_init',
          readConnections: this.readConnections.length,
          maxConnections: this.config.maxReadConnections,
        },
        'Database connection pool initialized'
      );
    } catch (error) {
      logger.error(
        {
          type: 'connection_pool_init_error',
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Failed to initialize connection pool'
      );
      throw error;
    }
  }

  /**
   * Get a read connection from the pool
   */
  private async getReadConnection(): Promise<DatabaseConnection> {
    // Find an idle connection
    let conn = this.readConnections.find((c) => !c.isActive);

    // If no idle connection and we can create more
    if (!conn && this.readConnections.length < this.config.maxReadConnections) {
      conn = new DatabaseConnection(this.dbPath, this.encryptionKey);
      this.readConnections.push(conn);

      logger.info(
        {
          type: 'connection_pool_expand',
          totalConnections: this.readConnections.length,
        },
        'Connection pool expanded'
      );
    }

    // Wait for an available connection if pool is full
    if (!conn) {
      conn = await this.waitForConnection();
    }

    conn.markUsed();
    return conn;
  }

  /**
   * Wait for an available connection
   */
  private async waitForConnection(): Promise<DatabaseConnection> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const conn = this.readConnections.find((c) => !c.isActive);

        if (conn) {
          clearInterval(interval);
          resolve(conn);
        } else if (Date.now() - startTime > this.config.connectionTimeout) {
          clearInterval(interval);
          reject(new Error('Connection timeout: No available connections'));
        }
      }, 10); // Check every 10ms
    });
  }

  /**
   * Execute a read query (SELECT)
   */
  public async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const startTime = Date.now();
    let conn: DatabaseConnection | null = null;

    try {
      conn = await this.getReadConnection();
      const result = conn.db.prepare(sql).all(...params) as T[];

      this.recordQuery(Date.now() - startTime);
      return result;
    } catch (error) {
      logger.error(
        {
          type: 'pool_query_error',
          sql: sql.substring(0, 100),
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Query execution error'
      );
      throw error;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  /**
   * Execute a write query (INSERT, UPDATE, DELETE)
   */
  public async execute(
    sql: string,
    params: any[] = []
  ): Promise<Database.RunResult> {
    const startTime = Date.now();

    if (!this.writeConnection) {
      throw new Error('Write connection not available');
    }

    try {
      this.writeConnection.markUsed();
      const result = this.writeConnection.db.prepare(sql).run(...params);

      this.recordQuery(Date.now() - startTime);
      return result;
    } catch (error) {
      logger.error(
        {
          type: 'pool_execute_error',
          sql: sql.substring(0, 100),
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Execute statement error'
      );
      throw error;
    } finally {
      this.writeConnection.release();
    }
  }

  /**
   * Execute a transaction
   */
  public async transaction<T>(
    callback: (db: Database.Database) => T
  ): Promise<T> {
    if (!this.writeConnection) {
      throw new Error('Write connection not available');
    }

    const startTime = Date.now();

    try {
      this.writeConnection.markUsed();

      // Begin transaction
      this.writeConnection.db.prepare('BEGIN').run();

      try {
        const result = callback(this.writeConnection.db);

        // Commit transaction
        this.writeConnection.db.prepare('COMMIT').run();

        this.recordQuery(Date.now() - startTime);
        return result;
      } catch (error) {
        // Rollback on error
        this.writeConnection.db.prepare('ROLLBACK').run();
        throw error;
      }
    } catch (error) {
      logger.error(
        {
          type: 'pool_transaction_error',
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Transaction error'
      );
      throw error;
    } finally {
      this.writeConnection.release();
    }
  }

  /**
   * Record query statistics
   */
  private recordQuery(duration: number): void {
    this.stats.totalQueries++;
    this.stats.queryTimes.push(duration);

    // Keep only last 1000 query times
    if (this.stats.queryTimes.length > 1000) {
      this.stats.queryTimes.shift();
    }

    // Track slow queries (>100ms)
    if (duration > 100) {
      this.stats.slowQueries++;
      logger.warn(
        { type: 'slow_query', duration },
        `Slow query detected: ${duration}ms`
      );
    }
  }

  /**
   * Get pool statistics
   */
  public getStats(): PoolStats {
    const activeConnections = this.readConnections.filter(
      (c) => c.isActive
    ).length;
    const idleConnections = this.readConnections.filter(
      (c) => !c.isActive
    ).length;

    const avgQueryTime =
      this.stats.queryTimes.length > 0
        ? this.stats.queryTimes.reduce((a, b) => a + b, 0) /
          this.stats.queryTimes.length
        : 0;

    return {
      activeConnections,
      idleConnections,
      totalQueries: this.stats.totalQueries,
      slowQueries: this.stats.slowQueries,
      avgQueryTime: Math.round(avgQueryTime * 100) / 100,
    };
  }

  /**
   * Start idle connection cleanup
   */
  private startIdleCleanup(): void {
    setInterval(() => {
      const now = Date.now();

      // Close idle connections (keep at least 2)
      for (let i = this.readConnections.length - 1; i >= 2; i--) {
        const conn = this.readConnections[i];

        if (!conn.isActive && now - conn.lastUsed > this.config.idleTimeout) {
          conn.close();
          this.readConnections.splice(i, 1);

          logger.info(
            {
              type: 'connection_pool_cleanup',
              remainingConnections: this.readConnections.length,
            },
            'Idle connection closed'
          );
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Close all connections
   */
  public async close(): Promise<void> {
    // Close all read connections
    for (const conn of this.readConnections) {
      conn.close();
    }

    // Close write connection
    if (this.writeConnection) {
      this.writeConnection.close();
    }

    logger.info({ type: 'connection_pool_closed' }, 'Connection pool closed');
  }
}

// Singleton instance
let connectionPoolInstance: ConnectionPool | null = null;

export function getConnectionPool(
  config?: Partial<PoolConfig>
): ConnectionPool {
  if (!connectionPoolInstance) {
    connectionPoolInstance = new ConnectionPool(config);
  }
  return connectionPoolInstance;
}
