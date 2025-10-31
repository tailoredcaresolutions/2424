'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import {
  Card,
  CardHeader,
  CardContent,
  StatCard,
  Button,
  Badge,
  LoadingSpinner,
} from '@/components/ui';

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
      error: 'danger',
    } as const;

    const labels = {
      healthy: '✅ Healthy',
      warning: '⚠️ Warning',
      error: '❌ Error',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getMetricColor = (percentage: number): 'emerald' | 'gold' | 'rose' => {
    if (percentage < 70) return 'emerald';
    if (percentage < 85) return 'gold';
    return 'rose';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tcs-blue-deep via-tcs-blue-dark to-tcs-blue-primary">
        <Navigation
          user={{
            name: 'Admin User',
            role: 'admin',
            email: 'admin@tailoredcare.ca',
          }}
        />
        <LoadingSpinner fullScreen text="Loading monitoring dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tcs-blue-deep via-tcs-blue-dark to-tcs-blue-primary relative overflow-hidden">
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
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
              System Monitoring
            </h1>
            <p className="text-white/70 text-lg">
              Real-time health and performance metrics
            </p>
            {healthData && (
              <p className="text-white/60 mt-2 text-sm">
                Last updated: {new Date(healthData.timestamp).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`touch-target rounded-glass-lg px-4 py-2 text-sm font-semibold transition-all ${
                autoRefresh
                  ? 'liquid-glass-gold text-[var(--tcs-blue-deep)] shadow-[0_10px_25px_rgba(212,165,116,0.4)]'
                  : 'liquid-glass-light text-white border border-white/20'
              }`}
            >
              {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
            </button>
            <button
              onClick={fetchHealthData}
              className="touch-target liquid-glass-gold text-[var(--tcs-blue-deep)] rounded-glass-lg px-4 py-2 text-sm font-semibold shadow-[0_10px_25px_rgba(212,165,116,0.4)] hover:shadow-[0_15px_35px_rgba(212,165,116,0.5)] transition-all"
            >
              🔄 Refresh Now
            </button>
          </div>
        </div>

        {error && (
          <div className="liquid-glass-card border-red-500/40 rounded-glass-lg text-red-100 mb-6 border p-6 shadow-[0_15px_40px_rgba(239,68,68,0.4)]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        {/* System Overview Stats */}
        {healthData && (
          <>
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Overall Status"
                value={healthData.status === 'healthy' ? 'Healthy' : 'Warning'}
                subtitle="System operational"
                icon="💚"
                color={healthData.status === 'healthy' ? 'emerald' : 'gold'}
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
                color="aqua"
              />
            </div>

            {/* Service Status Grid */}
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                      <span className="text-gray-700 font-medium">
                        Response Time
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {healthData.services.database.responseTime.toFixed(1)}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">
                        Encryption
                      </span>
                      <Badge
                        variant={
                          healthData.services.database.encrypted
                            ? 'success'
                            : 'danger'
                        }
                      >
                        {healthData.services.database.encrypted
                          ? '🔒 AES-256'
                          : '⚠️ Not encrypted'}
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
                      <span className="text-gray-700 font-medium">
                        Response Time
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {healthData.services.ollama.responseTime.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">
                        Provider
                      </span>
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
                      <span className="text-gray-700 font-medium">
                        Connection
                      </span>
                      <Badge
                        variant={
                          healthData.services.redis.connected
                            ? 'success'
                            : 'danger'
                        }
                      >
                        {healthData.services.redis.connected
                          ? '✅ Connected'
                          : '❌ Disconnected'}
                      </Badge>
                    </div>
                    {healthData.services.redis.hitRate !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">
                          Hit Rate
                        </span>
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
                          <span className="text-gray-700 font-medium">
                            Last Backup
                          </span>
                          <span className="text-gray-900 font-semibold">
                            {new Date(
                              healthData.recentBackup.timestamp
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">
                            Backup Size
                          </span>
                          <span className="text-gray-900 font-semibold">
                            {formatBytes(healthData.recentBackup.size)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">
                            Schedule
                          </span>
                          <Badge variant="success">Every 6 hours</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">
                            Retention
                          </span>
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
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-gray-700 font-medium">
                      {formatBytes(healthData.system.disk.used)} /{' '}
                      {formatBytes(healthData.system.disk.total)}
                    </span>
                    <span className="text-gray-900 text-2xl font-bold">
                      {healthData.system.disk.percentage.toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="bg-gray-200 rounded-full h-4 w-full overflow-hidden">
                    <div
                      className={`rounded-full h-full transition-all ${
                        healthData.system.disk.percentage < 70
                          ? 'bg-green-500'
                          : healthData.system.disk.percentage < 85
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${healthData.system.disk.percentage}%` }}
                    />
                  </div>

                  <p className="text-gray-600 text-sm">
                    {healthData.system.disk.percentage > 85 && (
                      <span className="text-red-600 font-medium">
                        ⚠️ Warning: Disk usage is high. Consider cleaning up old
                        backups or expanding storage.
                      </span>
                    )}
                    {healthData.system.disk.percentage <= 85 &&
                      healthData.system.disk.percentage > 70 && (
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
