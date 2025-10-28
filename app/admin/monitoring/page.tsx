'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardHeader, CardContent, StatCard, Button, Badge, LoadingSpinner } from '@/components/ui';

interface SystemMetrics {
  cpu: { usage: number; cores: number };
  memory: { used: number; total: number; percentage: number };
  disk: { used: number; total: number; percentage: number };
  uptime: number;
}

interface ServiceStatus {
  database: {
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    encrypted: boolean;
  };
  ollama: {
    status: 'healthy' | 'warning' | 'error';
    model: string;
    responseTime: number;
  };
  redis: {
    status: 'healthy' | 'warning' | 'error';
    connected: boolean;
    hitRate?: number;
  };
}

interface HealthData {
  timestamp: string;
  status: string;
  system: SystemMetrics;
  services: ServiceStatus;
  recentBackup?: {
    timestamp: string;
    size: number;
  };
}

export default function MonitoringDashboard() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchHealthData();

    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/monitoring/dashboard');
      const data = await response.json();

      if (data.success) {
        setHealthData(data.data);
        setError(null);
      } else {
        setError('Failed to fetch health data');
      }
    } catch (err) {
      setError('Error connecting to monitoring API');
      console.error('Monitoring error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadge = (status: 'healthy' | 'warning' | 'error') => {
    const variants = {
      healthy: 'success',
      warning: 'warning',
      error: 'danger'
    } as const;

    const labels = {
      healthy: '✅ Healthy',
      warning: '⚠️ Warning',
      error: '❌ Error'
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getMetricColor = (percentage: number): 'green' | 'amber' | 'red' => {
    if (percentage < 70) return 'green';
    if (percentage < 85) return 'amber';
    return 'red';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#030817] via-[#050d1f] to-[#0b142c]">
        <Navigation user={{ name: 'Admin User', role: 'admin', email: 'admin@tailoredcare.ca' }} />
        <LoadingSpinner fullScreen text="Loading monitoring dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030817] via-[#050d1f] to-[#0b142c]">
      <Navigation user={{ name: 'Admin User', role: 'admin', email: 'admin@tailoredcare.ca' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">System Monitoring</h1>
            <p className="text-gray-600 mt-2">Real-time health and performance metrics</p>
            {healthData && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {new Date(healthData.timestamp).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              variant={autoRefresh ? 'success' : 'ghost'}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
            </Button>
            <Button size="sm" variant="primary" onClick={fetchHealthData}>
              🔄 Refresh Now
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            ⚠️ {error}
          </div>
        )}

        {/* System Overview Stats */}
        {healthData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Overall Status"
                value={healthData.status === 'healthy' ? 'Healthy' : 'Warning'}
                subtitle="System operational"
                icon="💚"
                color={healthData.status === 'healthy' ? 'green' : 'amber'}
              />
              <StatCard
                title="CPU Usage"
                value={`${healthData.system.cpu.usage.toFixed(1)}%`}
                subtitle={`${healthData.system.cpu.cores} cores`}
                icon="🖥️"
                color={getMetricColor(healthData.system.cpu.usage)}
              />
              <StatCard
                title="Memory Usage"
                value={`${healthData.system.memory.percentage.toFixed(1)}%`}
                subtitle={`${formatBytes(healthData.system.memory.used)} / ${formatBytes(healthData.system.memory.total)}`}
                icon="💾"
                color={getMetricColor(healthData.system.memory.percentage)}
              />
              <StatCard
                title="System Uptime"
                value={formatUptime(healthData.system.uptime)}
                subtitle="Continuous operation"
                icon="⏱️"
                color="blue"
              />
            </div>

            {/* Service Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Database Status */}
              <Card>
                <CardHeader title="Database Status" icon="🗄️" />
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Status</span>
                      {getStatusBadge(healthData.services.database.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Response Time</span>
                      <span className="text-gray-900 font-semibold">
                        {healthData.services.database.responseTime.toFixed(1)}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Encryption</span>
                      <Badge variant={healthData.services.database.encrypted ? 'success' : 'danger'}>
                        {healthData.services.database.encrypted ? '🔒 AES-256' : '⚠️ Not encrypted'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Type</span>
                      <span className="text-gray-900">SQLite + SQLCipher</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Model Status */}
              <Card>
                <CardHeader title="AI Model Status" icon="🤖" />
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Status</span>
                      {getStatusBadge(healthData.services.ollama.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Model</span>
                      <span className="text-gray-900 font-semibold">
                        {healthData.services.ollama.model}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Response Time</span>
                      <span className="text-gray-900 font-semibold">
                        {healthData.services.ollama.responseTime.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Provider</span>
                      <span className="text-gray-900">Ollama (Local)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Redis Cache Status */}
              <Card>
                <CardHeader title="Redis Cache Status" icon="⚡" />
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Status</span>
                      {getStatusBadge(healthData.services.redis.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Connection</span>
                      <Badge variant={healthData.services.redis.connected ? 'success' : 'danger'}>
                        {healthData.services.redis.connected ? '✅ Connected' : '❌ Disconnected'}
                      </Badge>
                    </div>
                    {healthData.services.redis.hitRate !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">Hit Rate</span>
                        <span className="text-gray-900 font-semibold">
                          {healthData.services.redis.hitRate.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Type</span>
                      <span className="text-gray-900">Redis 7.0+</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Backup Status */}
              <Card>
                <CardHeader title="Backup Status" icon="💾" />
                <CardContent>
                  <div className="space-y-4">
                    {healthData.recentBackup ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">Last Backup</span>
                          <span className="text-gray-900 font-semibold">
                            {new Date(healthData.recentBackup.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">Backup Size</span>
                          <span className="text-gray-900 font-semibold">
                            {formatBytes(healthData.recentBackup.size)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">Schedule</span>
                          <Badge variant="success">Every 6 hours</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">Retention</span>
                          <span className="text-gray-900">30 days</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-600">No recent backups found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Disk Usage */}
            <Card>
              <CardHeader title="Disk Usage" icon="💿" />
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 font-medium">
                      {formatBytes(healthData.system.disk.used)} / {formatBytes(healthData.system.disk.total)}
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      {healthData.system.disk.percentage.toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        healthData.system.disk.percentage < 70
                          ? 'bg-green-500'
                          : healthData.system.disk.percentage < 85
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${healthData.system.disk.percentage}%` }}
                    />
                  </div>

                  <p className="text-sm text-gray-600">
                    {healthData.system.disk.percentage > 85 && (
                      <span className="text-red-600 font-medium">
                        ⚠️ Warning: Disk usage is high. Consider cleaning up old backups or expanding storage.
                      </span>
                    )}
                    {healthData.system.disk.percentage <= 85 && healthData.system.disk.percentage > 70 && (
                      <span className="text-amber-600 font-medium">
                        ⚠️ Disk usage approaching limit. Monitor closely.
                      </span>
                    )}
                    {healthData.system.disk.percentage <= 70 && (
                      <span className="text-green-600 font-medium">
                        ✅ Disk usage is healthy.
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
