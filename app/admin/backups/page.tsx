'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Table,
  Badge,
  Modal,
  ModalFooter,
  LoadingSpinner,
} from '@/components/ui';

interface Backup {
  id: number;
  filename: string;
  size: number;
  createdAt: string;
  type: 'automatic' | 'manual';
  status: 'completed' | 'in_progress' | 'failed';
  duration: number;
  records: number;
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockBackups: Backup[] = Array.from({ length: 15 }, (_, i) => {
        const now = Date.now();
        const daysAgo = i * 0.25; // Every 6 hours
        const timestamp = new Date(now - daysAgo * 24 * 60 * 60 * 1000);

        return {
          id: i + 1,
          filename: `backup_${timestamp.toISOString().split('T')[0]}_${timestamp.getHours()}-00.db`,
          size: 5000000 + Math.random() * 2000000,
          createdAt: timestamp.toISOString(),
          type: i % 4 === 0 ? 'manual' : 'automatic',
          status: Math.random() > 0.95 ? 'failed' : 'completed',
          duration: 2000 + Math.random() * 3000,
          records: 1200 + Math.floor(Math.random() * 100),
        };
      });

      setBackups(mockBackups);
    } catch (error) {
      console.error('Failed to fetch backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setCreating(true);
    try {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        await fetchBackups();
        alert('Backup created successfully!');
      } else {
        alert('Failed to create backup');
      }
    } catch (error) {
      console.error('Backup creation error:', error);
      alert('Error creating backup');
    } finally {
      setCreating(false);
    }
  };

  const downloadBackup = async (backup: Backup) => {
    try {
      // Simulate download
      console.log('Downloading backup:', backup.filename);
      alert(`Download started: ${backup.filename}`);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const restoreBackup = async () => {
    if (!selectedBackup) return;

    try {
      setRestoreProgress(0);

      // Simulate restore process
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setRestoreProgress(i);
      }

      alert('Backup restored successfully!');
      setShowRestoreModal(false);
      setRestoreProgress(0);
    } catch (error) {
      console.error('Restore error:', error);
      alert('Failed to restore backup');
    }
  };

  const deleteBackup = async () => {
    if (!selectedBackup) return;

    try {
      console.log('Deleting backup:', selectedBackup.id);
      await fetchBackups();
      setShowDeleteModal(false);
      alert('Backup deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'manual' ? 'info' : 'default'}>
        {type === 'manual' ? '👤 Manual' : '⚙️ Auto'}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger'> = {
      completed: 'success',
      in_progress: 'warning',
      failed: 'danger',
    };
    const icons: Record<string, string> = {
      completed: '✅',
      in_progress: '⏳',
      failed: '❌',
    };
    return (
      <Badge variant={variants[status]}>
        {icons[status]} {status}
      </Badge>
    );
  };

  const columns = [
    {
      key: 'filename',
      header: 'Filename',
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'size',
      header: 'Size',
      width: '100px',
      render: (value: number) => formatBytes(value),
    },
    {
      key: 'records',
      header: 'Records',
      width: '100px',
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'type',
      header: 'Type',
      width: '120px',
      align: 'center' as const,
      render: (value: string) => getTypeBadge(value),
    },
    {
      key: 'status',
      header: 'Status',
      width: '140px',
      align: 'center' as const,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: 'duration',
      header: 'Duration',
      width: '100px',
      render: (value: number) => formatDuration(value),
    },
    {
      key: 'createdAt',
      header: 'Created',
      width: '180px',
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      key: 'id',
      header: 'Actions',
      width: '250px',
      align: 'center' as const,
      render: (_: any, row: Backup) => (
        <div className="flex items-center justify-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => downloadBackup(row)}
            disabled={row.status !== 'completed'}
          >
            📥
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedBackup(row);
              setShowRestoreModal(true);
            }}
            disabled={row.status !== 'completed'}
          >
            🔄 Restore
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedBackup(row);
              setShowDeleteModal(true);
            }}
          >
            🗑️
          </Button>
        </div>
      ),
    },
  ];

  const stats = {
    total: backups.length,
    completed: backups.filter((b) => b.status === 'completed').length,
    failed: backups.filter((b) => b.status === 'failed').length,
    totalSize: backups.reduce((sum, b) => sum + b.size, 0),
  };

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 text-4xl font-bold">
              Backup Management
            </h1>
            <p className="text-gray-600 mt-2">
              Create, restore, and manage database backups
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button size="sm" variant="ghost" onClick={fetchBackups}>
              🔄 Refresh
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={createBackup}
              loading={creating}
            >
              ➕ Create Backup
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="mb-2 text-4xl font-bold text-[#1B365D]">
                {stats.total}
              </p>
              <p className="text-gray-600 text-sm">Total Backups</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="text-green-600 mb-2 text-4xl font-bold">
                {stats.completed}
              </p>
              <p className="text-gray-600 text-sm">Completed</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="text-red-600 mb-2 text-4xl font-bold">
                {stats.failed}
              </p>
              <p className="text-gray-600 text-sm">Failed</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="text-purple-600 mb-2 text-4xl font-bold">
                {formatBytes(stats.totalSize)}
              </p>
              <p className="text-gray-600 text-sm">Total Size</p>
            </div>
          </Card>
        </div>

        {/* Backup Configuration Info */}
        <Card className="mb-6">
          <CardHeader title="Backup Configuration" icon="⚙️" />
          <CardContent>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div>
                <p className="text-gray-600 mb-1 text-sm">Schedule</p>
                <p className="text-gray-900 text-lg font-bold">Every 6 hours</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1 text-sm">Retention</p>
                <p className="text-gray-900 text-lg font-bold">30 days</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1 text-sm">Location</p>
                <p className="text-gray-900 text-lg font-bold">/backups</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1 text-sm">Encryption</p>
                <Badge variant="success">🔒 AES-256</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backups Table */}
        {loading ? (
          <LoadingSpinner size="lg" text="Loading backups..." />
        ) : (
          <Card>
            <CardHeader
              title={`Backups (${backups.length})`}
              icon="💾"
              action={
                <p className="text-gray-600 text-sm">
                  Last backup:{' '}
                  {backups[0]
                    ? new Date(backups[0].createdAt).toLocaleString()
                    : 'Never'}
                </p>
              }
            />
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={backups}
                loading={loading}
                emptyMessage="No backups found"
              />
            </div>
          </Card>
        )}
      </div>

      {/* Restore Confirmation Modal */}
      {selectedBackup && (
        <Modal
          isOpen={showRestoreModal}
          onClose={() => {
            if (restoreProgress === 0) {
              setShowRestoreModal(false);
            }
          }}
          title="Restore Backup"
          size="md"
        >
          <div className="space-y-4">
            {restoreProgress === 0 ? (
              <>
                <div className="bg-amber-50 border-amber-200 rounded-lg border p-4">
                  <p className="text-amber-900 mb-2 font-medium">⚠️ Warning</p>
                  <p className="text-amber-800 text-sm">
                    Restoring this backup will replace all current data with the
                    backup data. This action cannot be undone.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Backup File:</span>
                    <span className="font-mono text-sm font-medium">
                      {selectedBackup.filename}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Size:</span>
                    <span className="font-medium">
                      {formatBytes(selectedBackup.size)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Records:</span>
                    <span className="font-medium">
                      {selectedBackup.records.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Created:</span>
                    <span className="font-medium">
                      {new Date(selectedBackup.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border-blue-200 rounded-lg border p-4">
                  <p className="text-blue-800 text-sm">
                    💡 Tip: Create a backup of current data before restoring.
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-900 text-center text-lg font-medium">
                  Restoring backup... {restoreProgress}%
                </p>
                <div className="bg-gray-200 rounded-full h-4 w-full overflow-hidden">
                  <div
                    className="rounded-full h-full bg-gradient-to-r from-[#1B365D] to-[#D4A574] transition-all"
                    style={{ width: `${restoreProgress}%` }}
                  />
                </div>
                <p className="text-gray-600 text-center text-sm">
                  Please wait... Do not close this window.
                </p>
              </div>
            )}
          </div>

          {restoreProgress === 0 && (
            <ModalFooter>
              <Button
                variant="ghost"
                onClick={() => setShowRestoreModal(false)}
              >
                Cancel
              </Button>
              <Button variant="warning" onClick={restoreBackup}>
                Restore Backup
              </Button>
            </ModalFooter>
          )}
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {selectedBackup && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Backup"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete backup{' '}
              <span className="font-mono font-bold">
                {selectedBackup.filename}
              </span>
              ?
            </p>
            <p className="text-gray-600 text-sm">
              This action cannot be undone. The backup file will be permanently
              removed.
            </p>
          </div>

          <ModalFooter>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={deleteBackup}>
              Delete Backup
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
