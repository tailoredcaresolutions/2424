/**
 * Advanced Search Engine - PSW Voice Documentation System
 *
 * Full-text search, filtering, and query capabilities for shift reports
 * Supports complex queries, date ranges, and multi-field search
 */

import Database from 'better-sqlite3';
import path from 'path';
import { log as logger } from '../logger.ts';

export interface SearchFilters {
  query?: string;
  pswId?: number;
  clientId?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  concernsOnly?: boolean;
  includeDeleted?: boolean;
  sortBy?: 'date' | 'psw' | 'client' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: number;
  pswId: number;
  pswName: string;
  clientId: number;
  clientName: string;
  shiftDate: string;
  shiftType: string;
  activities: string;
  concerns: string;
  relevanceScore?: number;
  createdAt: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: SearchFilters;
}

export class AdvancedSearchEngine {
  private db: Database.Database;

  constructor() {
    const dbPath =
      process.env.DATABASE_PATH ||
      path.join(process.cwd(), 'psw_documentation.db');
    this.db = new Database(dbPath);
    this.initializeFTS();
  }

  /**
   * Initialize Full-Text Search (FTS5)
   */
  private initializeFTS(): void {
    // Create FTS5 virtual table for full-text search
    this.db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS shift_reports_fts USING fts5(
        id UNINDEXED,
        activities,
        concerns,
        notes,
        content='shift_reports',
        content_rowid='id'
      );

      -- Trigger to keep FTS index updated on INSERT
      CREATE TRIGGER IF NOT EXISTS shift_reports_ai AFTER INSERT ON shift_reports BEGIN
        INSERT INTO shift_reports_fts(rowid, id, activities, concerns, notes)
        VALUES (new.id, new.id, new.activities, new.concerns, new.notes);
      END;

      -- Trigger to keep FTS index updated on UPDATE
      CREATE TRIGGER IF NOT EXISTS shift_reports_au AFTER UPDATE ON shift_reports BEGIN
        UPDATE shift_reports_fts SET
          activities = new.activities,
          concerns = new.concerns,
          notes = new.notes
        WHERE rowid = old.id;
      END;

      -- Trigger to keep FTS index updated on DELETE
      CREATE TRIGGER IF NOT EXISTS shift_reports_ad AFTER DELETE ON shift_reports BEGIN
        DELETE FROM shift_reports_fts WHERE rowid = old.id;
      END;
    `);

    logger.info(
      { type: 'fts_initialized' },
      'Full-text search index initialized'
    );
  }

  /**
   * Advanced search with full-text and filters
   */
  public search(filters: SearchFilters): SearchResponse {
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    const page = Math.floor(offset / limit) + 1;

    let query = `
      SELECT
        sr.id,
        sr.psw_id as pswId,
        psw.name as pswName,
        sr.client_id as clientId,
        c.name as clientName,
        sr.shift_date as shiftDate,
        sr.shift_type as shiftType,
        sr.activities,
        sr.concerns,
        sr.created_at as createdAt
    `;

    let countQuery = 'SELECT COUNT(*) as total';

    let fromClause = `
      FROM shift_reports sr
      INNER JOIN psw_users psw ON sr.psw_id = psw.id
      INNER JOIN clients c ON sr.client_id = c.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    // Full-text search
    if (filters.query && filters.query.trim()) {
      fromClause = `
        FROM shift_reports_fts fts
        INNER JOIN shift_reports sr ON fts.rowid = sr.id
        INNER JOIN psw_users psw ON sr.psw_id = psw.id
        INNER JOIN clients c ON sr.client_id = c.id
      `;

      conditions.push('shift_reports_fts MATCH ?');
      params.push(this.sanitizeFTSQuery(filters.query));

      // Add relevance score for FTS
      query = query.replace(
        'sr.created_at as createdAt',
        'sr.created_at as createdAt, rank as relevanceScore'
      );
    }

    // Filter by PSW
    if (filters.pswId) {
      conditions.push('sr.psw_id = ?');
      params.push(filters.pswId);
    }

    // Filter by Client
    if (filters.clientId) {
      conditions.push('sr.client_id = ?');
      params.push(filters.clientId);
    }

    // Date range
    if (filters.dateFrom) {
      conditions.push('sr.shift_date >= ?');
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      conditions.push('sr.shift_date <= ?');
      params.push(filters.dateTo);
    }

    // Status filter
    if (filters.status) {
      conditions.push('sr.status = ?');
      params.push(filters.status);
    }

    // Concerns only
    if (filters.concernsOnly) {
      conditions.push("(sr.concerns IS NOT NULL AND sr.concerns != '')");
    }

    // Exclude deleted (default)
    if (!filters.includeDeleted) {
      conditions.push('sr.deleted_at IS NULL');
    }

    // Build WHERE clause
    const whereClause =
      conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Sorting
    let orderClause = 'ORDER BY ';
    switch (filters.sortBy) {
      case 'date':
        orderClause += 'sr.shift_date';
        break;
      case 'psw':
        orderClause += 'psw.name';
        break;
      case 'client':
        orderClause += 'c.name';
        break;
      case 'relevance':
        orderClause += filters.query ? 'rank' : 'sr.created_at';
        break;
      default:
        orderClause += 'sr.shift_date';
    }
    orderClause += ` ${filters.sortOrder || 'desc'}`;

    // Execute count query
    const fullCountQuery = countQuery + fromClause + whereClause;
    const countResult = this.db.prepare(fullCountQuery).get(...params) as {
      total: number;
    };
    const total = countResult.total;

    // Execute search query
    const fullQuery =
      query + fromClause + whereClause + orderClause + ` LIMIT ? OFFSET ?`;
    const results = this.db
      .prepare(fullQuery)
      .all(...params, limit, offset) as SearchResult[];

    const totalPages = Math.ceil(total / limit);

    logger.info(
      {
        type: 'search_executed',
        query: filters.query,
        total,
        returned: results.length,
      },
      'Search executed'
    );

    return {
      results,
      total,
      page,
      pageSize: limit,
      totalPages,
      filters,
    };
  }

  /**
   * Sanitize FTS query to prevent injection
   */
  private sanitizeFTSQuery(query: string): string {
    // Remove special FTS operators if not intended
    // Allow basic phrase search with quotes
    return query
      .replace(/[^\w\s"]/g, ' ')
      .trim()
      .split(/\s+/)
      .map((term) => {
        // If term is quoted, keep quotes
        if (term.startsWith('"') && term.endsWith('"')) {
          return term;
        }
        // Otherwise, add wildcard for prefix matching
        return `${term}*`;
      })
      .join(' OR ');
  }

  /**
   * Get search suggestions (autocomplete)
   */
  public getSuggestions(prefix: string, limit: number = 10): string[] {
    const query = `
      SELECT DISTINCT activities
      FROM shift_reports
      WHERE activities LIKE ? OR concerns LIKE ?
      LIMIT ?
    `;

    const pattern = `%${prefix}%`;
    const results = this.db
      .prepare(query)
      .all(pattern, pattern, limit) as Array<{ activities: string }>;

    // Extract unique words/phrases matching the prefix
    const suggestions = new Set<string>();
    const prefixLower = prefix.toLowerCase();

    for (const row of results) {
      const text = row.activities.toLowerCase();
      const words = text.split(/\s+/);

      for (const word of words) {
        if (word.startsWith(prefixLower) && word.length > prefixLower.length) {
          suggestions.add(word);
          if (suggestions.size >= limit) break;
        }
      }
    }

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Get saved searches (future feature)
   */
  public getSavedSearches(
    userId: number
  ): Array<{ id: number; name: string; filters: SearchFilters }> {
    // Placeholder for saved searches feature
    return [];
  }

  /**
   * Export search results to CSV
   */
  public exportToCSV(filters: SearchFilters): string {
    const results = this.search({
      ...filters,
      limit: 10000,
      offset: 0,
    }).results;

    const headers = [
      'ID',
      'Date',
      'PSW',
      'Client',
      'Shift Type',
      'Activities',
      'Concerns',
    ];
    const rows = results.map((r) => [
      r.id,
      r.shiftDate,
      r.pswName,
      r.clientName,
      r.shiftType,
      `"${r.activities.replace(/"/g, '""')}"`,
      `"${(r.concerns || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join(
      '\n'
    );

    logger.info(
      {
        type: 'search_exported_csv',
        rows: rows.length,
      },
      'Search results exported to CSV'
    );

    return csv;
  }

  /**
   * Close database connection
   */
  public close(): void {
    this.db.close();
  }
}

// Singleton instance
let searchEngineInstance: AdvancedSearchEngine | null = null;

export function getSearchEngine(): AdvancedSearchEngine {
  if (!searchEngineInstance) {
    searchEngineInstance = new AdvancedSearchEngine();
  }
  return searchEngineInstance;
}
