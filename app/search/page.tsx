'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import {
  Table,
  Pagination,
  Badge,
  LoadingSpinner,
} from '@/components/ui';

interface SearchFilters {
  query: string;
  pswId?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  sortBy?: 'date' | 'psw' | 'client' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

interface SearchResult {
  id: number;
  pswId: number;
  pswName: string;
  clientId: number;
  clientName: string;
  shiftDate: string;
  status: string;
  activities: string;
  concerns?: string;
  notes?: string;
  createdAt: string;
}

interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'relevance',
    sortOrder: 'desc',
  });
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const performSearch = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        query: filters.query,
        page: currentPage.toString(),
        pageSize: '10',
        ...(filters.pswId && { pswId: filters.pswId }),
        ...(filters.clientId && { clientId: filters.clientId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.status && { status: filters.status }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data);
      } else {
        console.error('Search failed:', data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    if (filters.query) {
      performSearch();
    }
  }, [filters.query, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    performSearch();
  };

  const exportToCSV = async () => {
    try {
      const params = new URLSearchParams({
        query: filters.query,
        format: 'csv',
        ...(filters.pswId && { pswId: filters.pswId }),
        ...(filters.clientId && { clientId: filters.clientId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.status && { status: filters.status }),
      });

      const response = await fetch(`/api/search?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `search-results-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> =
      {
        completed: 'success',
        pending: 'warning',
        draft: 'info',
        error: 'danger',
      };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const columns = [
    {
      key: 'shiftDate',
      header: 'Date',
      width: '120px',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'pswName',
      header: 'PSW',
      width: '150px',
    },
    {
      key: 'clientName',
      header: 'Client',
      width: '150px',
    },
    {
      key: 'activities',
      header: 'Activities',
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      align: 'center' as const,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: 'id',
      header: 'Actions',
      width: '100px',
      align: 'center' as const,
      render: (value: number) => (
        <button
          onClick={() => (window.location.href = `/reports/${value}`)}
          className="touch-target liquid-glass-light text-white rounded-glass-md px-3 py-1.5 text-xs font-semibold border border-white/20 hover:border-white/30 transition-all"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-tcs-blue-primary via-tcs-blue-mid to-tcs-blue-light relative overflow-hidden">
      {/* Enhanced background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[var(--tcs-gold)]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[var(--tcs-blue-light)]/8 rounded-full blur-3xl" />
      </div>

      <Navigation
        user={{
          name: 'Admin User',
          role: 'admin',
          email: 'admin@tailoredcare.ca',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-4xl md:text-5xl font-bold mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">Search Reports</h1>
          <p className="text-white/70 text-lg">
            Full-text search across every shift report and note
          </p>
        </div>

        {/* Search Form */}
        <div className="liquid-glass-card rounded-glass-lg mb-8 p-6 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
          <form onSubmit={handleSearch}>
            {/* Main search input */}
            <div className="mb-4 flex gap-3">
              <input
                type="text"
                value={filters.query}
                onChange={(e) =>
                  setFilters({ ...filters, query: e.target.value })
                }
                placeholder="Search reports, activities, concerns, notes..."
                className="liquid-glass-light flex-1 rounded-glass-md border border-white/20 px-4 py-3 text-white placeholder-white/60 focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
              />
              <button
                type="submit"
                disabled={!filters.query || loading}
                className="touch-target liquid-glass-gold text-white rounded-glass-lg px-6 py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '🔄 Searching...' : '🔍 Search'}
              </button>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="touch-target liquid-glass-light text-white rounded-glass-lg px-4 py-3 font-semibold border border-white/20 hover:border-white/30 transition-all"
              >
                {showAdvanced ? '⬆️ Hide Filters' : '⬇️ Advanced Filters'}
              </button>
            </div>

              {/* Advanced filters */}
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-4 border-t border-white/20 pt-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-white/90">
                      PSW ID
                    </label>
                    <input
                      type="text"
                      value={filters.pswId || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, pswId: e.target.value })
                      }
                      placeholder="Filter by PSW"
                      className="liquid-glass-light w-full rounded-glass-md border border-white/20 px-3 py-2 text-white placeholder-white/60 focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-white/90">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={filters.clientId || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, clientId: e.target.value })
                      }
                      placeholder="Filter by client"
                      className="liquid-glass-light w-full rounded-glass-md border border-white/20 px-3 py-2 text-white placeholder-white/60 focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-white/90">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={filters.startDate || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, startDate: e.target.value })
                      }
                      className="liquid-glass-light w-full rounded-glass-md border border-white/20 px-3 py-2 text-white focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-white/90">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={filters.endDate || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, endDate: e.target.value })
                      }
                      className="liquid-glass-light w-full rounded-glass-md border border-white/20 px-3 py-2 text-white focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-white/90">
                      Status
                    </label>
                    <select
                      value={filters.status || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                      className="liquid-glass-light w-full rounded-glass-md border border-white/20 px-3 py-2 text-white focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
                    >
                      <option value="" className="bg-[var(--tcs-blue-dark)]">All statuses</option>
                      <option value="completed" className="bg-[var(--tcs-blue-dark)]">Completed</option>
                      <option value="pending" className="bg-[var(--tcs-blue-dark)]">Pending</option>
                      <option value="draft" className="bg-[var(--tcs-blue-dark)]">Draft</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-white/90">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy || 'relevance'}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          sortBy: e.target.value as any,
                        })
                      }
                      className="liquid-glass-light w-full rounded-glass-md border border-white/20 px-3 py-2 text-white focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
                    >
                      <option value="relevance" className="bg-[var(--tcs-blue-dark)]">Relevance</option>
                      <option value="date" className="bg-[var(--tcs-blue-dark)]">Date</option>
                      <option value="psw" className="bg-[var(--tcs-blue-dark)]">PSW</option>
                      <option value="client" className="bg-[var(--tcs-blue-dark)]">Client</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-white/90">
                      Sort Order
                    </label>
                    <select
                      value={filters.sortOrder || 'desc'}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          sortOrder: e.target.value as any,
                        })
                      }
                      className="liquid-glass-light w-full rounded-glass-md border border-white/20 px-3 py-2 text-white focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
                    >
                      <option value="desc" className="bg-[var(--tcs-blue-dark)]">Descending</option>
                      <option value="asc" className="bg-[var(--tcs-blue-dark)]">Ascending</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        setFilters({
                          query: filters.query,
                          sortBy: 'relevance',
                          sortOrder: 'desc',
                        });
                      }}
                      className="touch-target liquid-glass-light text-white rounded-glass-md w-full px-4 py-2 text-sm font-semibold border border-white/20 hover:border-white/30 transition-all"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </form>
        </div>

        {/* Results */}
        {loading && <LoadingSpinner size="lg" text="Searching..." />}

        {searchResults && !loading && (
          <>
            {/* Results header */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-white/80">
                Found{' '}
                <span className="font-bold">{searchResults.totalResults}</span>{' '}
                results
                {filters.query && ` for "${filters.query}"`}
              </p>
              <button
                onClick={exportToCSV}
                disabled={searchResults.totalResults === 0}
                className="touch-target liquid-glass-gold text-white rounded-glass-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📥 Export CSV
              </button>
            </div>

            {/* Results table */}
            {searchResults.totalResults > 0 ? (
              <>
                <Table
                  columns={columns}
                  data={searchResults.results}
                  emptyMessage="No results found"
                />

                {/* Pagination */}
                {searchResults.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={searchResults.page}
                      totalPages={searchResults.totalPages}
                      onPageChange={setCurrentPage}
                      totalItems={searchResults.totalResults}
                      itemsPerPage={searchResults.pageSize}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="liquid-glass-card rounded-glass-lg p-12 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
                <div className="text-center">
                  <p className="mb-4 text-6xl">🔍</p>
                  <h3 className="mb-2 text-xl font-bold text-white">
                    No results found
                  </h3>
                  <p className="mb-6 text-white/70">
                    Try adjusting your search query or filters
                  </p>
                  <button
                    onClick={() => {
                      setFilters({
                        query: '',
                        sortBy: 'relevance',
                        sortOrder: 'desc',
                      });
                      setSearchResults(null);
                    }}
                    className="touch-target liquid-glass-light text-white rounded-glass-lg px-6 py-2 font-semibold border border-white/20 hover:border-white/30 transition-all"
                  >
                    Clear search
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!searchResults && !loading && (
          <div className="liquid-glass-card rounded-glass-lg p-12 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
            <div className="text-center">
              <p className="mb-4 text-6xl">🔍</p>
              <h3 className="mb-2 text-2xl font-bold text-white">
                Search Reports
              </h3>
              <p className="mb-6 text-white/70">
                Enter keywords to search across all shift reports, activities,
                concerns, and notes
              </p>
              <div className="space-y-1 text-sm text-white/60">
                <p>💡 Tip: Use advanced filters to narrow down your search</p>
                <p>
                  💡 Tip: Search supports full-text search with relevance
                  ranking
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
