'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
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
        <Button
          size="sm"
          variant="ghost"
          onClick={() => (window.location.href = `/reports/${value}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030817] via-[#050d1f] to-[#0b142c]">
      <Navigation
        user={{
          name: 'Admin User',
          role: 'admin',
          email: 'admin@tailoredcare.ca',
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-4xl font-bold">Search Reports</h1>
          <p className="text-white/70 mt-2">
            Full-text search across every shift report and note
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent>
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
                  className="input-premium flex-1"
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!filters.query || loading}
                >
                  {loading ? '🔄 Searching...' : '🔍 Search'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? '⬆️ Hide Filters' : '⬇️ Advanced Filters'}
                </Button>
              </div>

              {/* Advanced filters */}
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-4 border-t border-[#F1E0CC] pt-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#7A6A58]">
                      PSW ID
                    </label>
                    <input
                      type="text"
                      value={filters.pswId || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, pswId: e.target.value })
                      }
                      placeholder="Filter by PSW"
                      className="input-premium w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#7A6A58]">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={filters.clientId || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, clientId: e.target.value })
                      }
                      placeholder="Filter by client"
                      className="input-premium w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#7A6A58]">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={filters.startDate || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, startDate: e.target.value })
                      }
                      className="input-premium w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#7A6A58]">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={filters.endDate || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, endDate: e.target.value })
                      }
                      className="input-premium w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#7A6A58]">
                      Status
                    </label>
                    <select
                      value={filters.status || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                      className="input-premium w-full"
                    >
                      <option value="">All statuses</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#7A6A58]">
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
                      className="input-premium w-full"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="date">Date</option>
                      <option value="psw">PSW</option>
                      <option value="client">Client</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#7A6A58]">
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
                      className="input-premium w-full"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      fullWidth
                      onClick={() => {
                        setFilters({
                          query: filters.query,
                          sortBy: 'relevance',
                          sortOrder: 'desc',
                        });
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

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
              <Button
                size="sm"
                variant="primary"
                onClick={exportToCSV}
                disabled={searchResults.totalResults === 0}
              >
                📥 Export CSV
              </Button>
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
              <Card>
                <CardContent>
                  <div className="py-12 text-center">
                    <p className="mb-4 text-4xl">🔍</p>
                    <h3 className="mb-2 text-xl font-bold text-[#1F1B16]">
                      No results found
                    </h3>
                    <p className="mb-6 text-[#7A6A58]">
                      Try adjusting your search query or filters
                    </p>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setFilters({
                          query: '',
                          sortBy: 'relevance',
                          sortOrder: 'desc',
                        });
                        setSearchResults(null);
                      }}
                    >
                      Clear search
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Empty state */}
        {!searchResults && !loading && (
          <Card>
            <CardContent>
              <div className="py-12 text-center">
                <p className="mb-4 text-6xl">🔍</p>
                <h3 className="mb-2 text-2xl font-bold text-[#1F1B16]">
                  Search Reports
                </h3>
                <p className="mb-6 text-[#7A6A58]">
                  Enter keywords to search across all shift reports, activities,
                  concerns, and notes
                </p>
                <div className="space-y-1 text-sm text-[#9A8A78]">
                  <p>💡 Tip: Use advanced filters to narrow down your search</p>
                  <p>
                    💡 Tip: Search supports full-text search with relevance
                    ranking
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
