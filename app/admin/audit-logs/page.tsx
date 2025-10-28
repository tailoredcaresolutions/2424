'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardHeader, Button, Table, Pagination, Badge, Modal, ModalFooter, LoadingSpinner } from '@/components/ui';

interface AuditLog {
  id: number;
  timestamp: string;
  userId: number;
  username: string;
  action: string;
  category: 'auth' | 'user' | 'report' | 'system' | 'security';
  details: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [filters, setFilters] = useState({
    category: 'all',
    userId: '',
    action: '',
    startDate: '',
    endDate: '',
    success: 'all'
  });

  const pageSize = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockLogs: AuditLog[] = Array.from({ length: 100 }, (_, i) => {
        const categories: AuditLog['category'][] = ['auth', 'user', 'report', 'system', 'security'];
        const actions = ['login', 'logout', 'create', 'update', 'delete', 'view', 'export', 'backup'];
        const users = ['admin', 'sarah.johnson', 'michael.chen', 'emma.wilson', 'system'];

        const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const category = categories[Math.floor(Math.random() * categories.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const username = users[Math.floor(Math.random() * users.length)];
        const success = Math.random() > 0.1;

        return {
          id: i + 1,
          timestamp: timestamp.toISOString(),
          userId: Math.floor(Math.random() * 20) + 1,
          username,
          action,
          category,
          details: `User ${action} ${category} at ${timestamp.toLocaleString()}`,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          success
        };
      });

      // Apply filters
      let filtered = mockLogs;

      if (filters.category !== 'all') {
        filtered = filtered.filter(log => log.category === filters.category);
      }

      if (filters.userId) {
        filtered = filtered.filter(log => log.userId.toString() === filters.userId);
      }

      if (filters.action) {
        filtered = filtered.filter(log => log.action.toLowerCase().includes(filters.action.toLowerCase()));
      }

      if (filters.success !== 'all') {
        filtered = filtered.filter(log => log.success.toString() === filters.success);
      }

      // Sort by timestamp descending
      filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Paginate
      const start = (currentPage - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      setLogs(paginated);
      setTotalLogs(filtered.length);
      setTotalPages(Math.ceil(filtered.length / pageSize));
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const exportLogs = async (format: 'csv' | 'json') => {
    try {
      if (format === 'csv') {
        const csv = [
          ['ID', 'Timestamp', 'User', 'Action', 'Category', 'Success', 'IP Address', 'Details'].join(','),
          ...logs.map(log =>
            [
              log.id,
              log.timestamp,
              log.username,
              log.action,
              log.category,
              log.success,
              log.ipAddress,
              `"${log.details}"`
            ].join(',')
          )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const json = JSON.stringify(logs, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      userId: '',
      action: '',
      startDate: '',
      endDate: '',
      success: 'all'
    });
    setCurrentPage(1);
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      auth: 'info',
      user: 'success',
      report: 'info',
      system: 'warning',
      security: 'danger'
    };
    return <Badge variant={variants[category] || 'info'}>{category}</Badge>;
  };

  const getSuccessBadge = (success: boolean) => {
    return (
      <Badge variant={success ? 'success' : 'danger'}>
        {success ? '✅ Success' : '❌ Failed'}
      </Badge>
    );
  };

  const columns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      width: '180px',
      render: (value: string) => new Date(value).toLocaleString()
    },
    {
      key: 'username',
      header: 'User',
      width: '150px'
    },
    {
      key: 'action',
      header: 'Action',
      width: '120px',
      render: (value: string) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    {
      key: 'category',
      header: 'Category',
      width: '120px',
      align: 'center' as const,
      render: (value: string) => getCategoryBadge(value)
    },
    {
      key: 'success',
      header: 'Status',
      width: '120px',
      align: 'center' as const,
      render: (value: boolean) => getSuccessBadge(value)
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      width: '140px'
    },
    {
      key: 'id',
      header: 'Actions',
      width: '100px',
      align: 'center' as const,
      render: (_: any, row: AuditLog) => (
        <Button size="sm" variant="ghost" onClick={() => handleViewDetails(row)}>
          View
        </Button>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030817] via-[#050d1f] to-[#0b142c]">
      <Navigation user={{ name: 'Admin User', role: 'admin', email: 'admin@tailoredcare.ca' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600 mt-2">Track all system activity and user actions</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button size="sm" variant="ghost" onClick={() => exportLogs('json')}>
              📄 Export JSON
            </Button>
            <Button size="sm" variant="success" onClick={() => exportLogs('csv')}>
              📥 Export CSV
            </Button>
            <Button size="sm" variant="primary" onClick={fetchLogs}>
              🔄 Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader title="Filters" icon="🔍" />
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
                >
                  <option value="all">All</option>
                  <option value="auth">Auth</option>
                  <option value="user">User</option>
                  <option value="report">Report</option>
                  <option value="system">System</option>
                  <option value="security">Security</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={filters.userId}
                  onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                  placeholder="Filter by user"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <input
                  type="text"
                  value={filters.action}
                  onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                  placeholder="Filter by action"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.success}
                  onChange={(e) => setFilters({ ...filters, success: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
                >
                  <option value="all">All</option>
                  <option value="true">Success</option>
                  <option value="false">Failed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-bold">{totalLogs}</span> total logs
              </p>
              <Button size="sm" variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Logs Table */}
        {loading ? (
          <LoadingSpinner size="lg" text="Loading audit logs..." />
        ) : (
          <>
            <Table
              columns={columns}
              data={logs}
              loading={loading}
              emptyMessage="No audit logs found"
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalLogs}
                  itemsPerPage={pageSize}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={`Audit Log #${selectedLog.id}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Timestamp</p>
                <p className="text-base text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">User</p>
                <p className="text-base text-gray-900">
                  {selectedLog.username} (ID: {selectedLog.userId})
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Action</p>
                <p className="text-base text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                  {selectedLog.action}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Category</p>
                <div className="mt-1">{getCategoryBadge(selectedLog.category)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <div className="mt-1">{getSuccessBadge(selectedLog.success)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">IP Address</p>
                <p className="text-base text-gray-900 font-mono">{selectedLog.ipAddress}</p>
              </div>
            </div>

            <hr />

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Details</p>
              <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">
                {selectedLog.details}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">User Agent</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg font-mono break-all">
                {selectedLog.userAgent}
              </p>
            </div>
          </div>

          <ModalFooter>
            <Button variant="ghost" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => console.log('View related logs')}>
              View Related Logs
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
