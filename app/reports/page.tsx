'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import {
  Card,
  CardHeader,
  Button,
  Table,
  Pagination,
  Badge,
  Modal,
  ModalFooter,
  LoadingSpinner,
} from '@/components/ui';

interface Report {
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
  updatedAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const pageSize = 15;

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockReports: Report[] = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        pswId: Math.floor(Math.random() * 20) + 1,
        pswName: [
          'Sarah Johnson',
          'Michael Chen',
          'Emma Wilson',
          'James Brown',
        ][Math.floor(Math.random() * 4)],
        clientId: Math.floor(Math.random() * 30) + 1,
        clientName: ['Client A', 'Client B', 'Client C', 'Client D'][
          Math.floor(Math.random() * 4)
        ],
        shiftDate: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split('T')[0],
        status: ['completed', 'pending', 'draft'][
          Math.floor(Math.random() * 3)
        ],
        activities:
          'Personal care, medication administration, meal preparation',
        concerns:
          Math.random() > 0.7 ? 'Minor mobility issues noted' : undefined,
        notes: 'Shift completed successfully',
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      // Filter by status
      const filtered =
        filterStatus === 'all'
          ? mockReports
          : mockReports.filter((r) => r.status === filterStatus);

      // Paginate
      const start = (currentPage - 1) * pageSize;
      const paginatedReports = filtered.slice(start, start + pageSize);

      setReports(paginatedReports);
      setTotalReports(filtered.length);
      setTotalPages(Math.ceil(filtered.length / pageSize));
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleDeleteReport = (report: Report) => {
    setSelectedReport(report);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedReport) return;

    try {
      // API call to delete report
      console.log('Deleting report:', selectedReport.id);

      // Refresh reports
      await fetchReports();
      setShowDeleteModal(false);
      setSelectedReport(null);
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  const exportToCSV = () => {
    const csv = [
      [
        'ID',
        'Date',
        'PSW',
        'Client',
        'Status',
        'Activities',
        'Concerns',
        'Notes',
      ].join(','),
      ...reports.map((r) =>
        [
          r.id,
          r.shiftDate,
          r.pswName,
          r.clientName,
          r.status,
          `"${r.activities}"`,
          `"${r.concerns || ''}"`,
          `"${r.notes || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info'> = {
      completed: 'success',
      pending: 'warning',
      draft: 'info',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
    },
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
      key: 'status',
      header: 'Status',
      width: '120px',
      align: 'center' as const,
      render: (value: string) => getStatusBadge(value),
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
      key: 'id',
      header: 'Actions',
      width: '200px',
      align: 'center' as const,
      render: (_: any, row: Report) => (
        <div className="flex items-center justify-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleViewReport(row)}
          >
            👁️ View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteReport(row)}
          >
            🗑️ Delete
          </Button>
        </div>
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
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-white text-4xl font-bold">
              Reports Management
            </h1>
            <p className="text-white/70 mt-2">
              View, manage, and export all shift reports
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button size="sm" variant="primary" onClick={exportToCSV}>
              📥 Export CSV
            </Button>
            <Button size="sm" variant="ghost" onClick={fetchReports}>
              🔄 Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-wrap items-center gap-4 p-4">
            <span className="text-sm font-medium text-[#5C4C3C]">
              Filter by status:
            </span>
            {['all', 'completed', 'pending', 'draft'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  setCurrentPage(1);
                }}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  filterStatus === status
                    ? 'border-transparent bg-gradient-to-r from-[var(--tcs-light-gold)] to-[var(--tcs-gold)] text-[#2C1301] shadow-[0_12px_25px_rgba(241,168,82,0.35)]'
                    : 'bg-white/80 hover:bg-white border-[#F1E0CC] text-[#5C4C3C]'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
            <div className="flex-1" />
            <span className="text-sm text-[#7A6A58]">
              Total:{' '}
              <span className="font-bold text-[#2C1301]">{totalReports}</span>{' '}
              reports
            </span>
          </div>
        </Card>

        {/* Reports Table */}
        {loading ? (
          <LoadingSpinner size="lg" text="Loading reports..." />
        ) : (
          <>
            <Table
              columns={columns}
              data={reports}
              loading={loading}
              emptyMessage="No reports found"
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalReports}
                  itemsPerPage={pageSize}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* View Report Modal */}
      {selectedReport && (
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title={`Report #${selectedReport.id} - ${selectedReport.pswName}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-[#7A6A58]">PSW</p>
                <p className="text-base text-[#1F1B16]">
                  {selectedReport.pswName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-[#7A6A58]">Client</p>
                <p className="text-base text-[#1F1B16]">
                  {selectedReport.clientName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-[#7A6A58]">Shift Date</p>
                <p className="text-base text-[#1F1B16]">
                  {new Date(selectedReport.shiftDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-[#7A6A58]">Status</p>
                <div className="mt-1">
                  {getStatusBadge(selectedReport.status)}
                </div>
              </div>
            </div>

            <hr />

            <div>
              <p className="mb-2 text-sm font-medium text-[#7A6A58]">
                Activities
              </p>
              <p className="bg-white/85 rounded-2xl border border-[#F1E0CC] p-3 text-base text-[#1F1B16]">
                {selectedReport.activities}
              </p>
            </div>

            {selectedReport.concerns && (
              <div>
                <p className="mb-2 text-sm font-medium text-[#7A6A58]">
                  Concerns
                </p>
                <p className="rounded-2xl border border-[#F5D98B] bg-gradient-to-r from-[#FFF4C7] to-[#FFE6A7] p-3 text-base text-[#1F1B16]">
                  {selectedReport.concerns}
                </p>
              </div>
            )}

            {selectedReport.notes && (
              <div>
                <p className="mb-2 text-sm font-medium text-[#7A6A58]">Notes</p>
                <p className="rounded-2xl bg-gradient-to-r from-[#E3ECFF] to-[#D0DBFF] p-3 text-base text-[#1F1B16]">
                  {selectedReport.notes}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs text-[#9A8A78]">
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(selectedReport.createdAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Updated:</span>{' '}
                {new Date(selectedReport.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="ghost" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => console.log('Edit report:', selectedReport.id)}
            >
              Edit Report
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {selectedReport && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Report"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-[#1F1B16]">
              Are you sure you want to delete report{' '}
              <span className="font-bold">#{selectedReport.id}</span>?
            </p>
            <p className="text-sm text-[#7A6A58]">
              This action cannot be undone. The report will be permanently
              removed from the system.
            </p>
          </div>

          <ModalFooter>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete Report
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
