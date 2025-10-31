'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import {
  StatCard,
  Badge,
  LoadingSpinner,
} from '@/components/ui';

interface DashboardStats {
  totalReports: number;
  totalUsers: number;
  activeUsers: number;
  systemHealth: string;
  aiPerformance: {
    avgResponseTime: number;
    errorRate: number;
  };
  recentActivity: Array<{
    id: number;
    type: string;
    message: string;
    timestamp: string;
    user?: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch system health
      const healthRes = await fetch('/api/monitoring/dashboard');
      const healthData = await healthRes.json();

      // Fetch performance metrics
      const perfRes = await fetch('/api/performance/metrics');
      const perfData = await perfRes.json();

      // Mock data for now (will be replaced with real data)
      const mockStats: DashboardStats = {
        totalReports: 1247,
        totalUsers: 45,
        activeUsers: 12,
        systemHealth: healthData.success ? 'healthy' : 'warning',
        aiPerformance: {
          avgResponseTime: perfData.data?.metrics?.avgQueryTime || 150,
          errorRate: 0.8,
        },
        recentActivity: [
          {
            id: 1,
            type: 'report',
            message: 'New shift report created',
            timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
            user: 'Sarah Johnson',
          },
          {
            id: 2,
            type: 'user',
            message: 'User enrolled in MFA',
            timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
            user: 'Michael Chen',
          },
          {
            id: 3,
            type: 'backup',
            message: 'Automated backup completed',
            timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
          },
          {
            id: 4,
            type: 'system',
            message: 'Performance optimization completed',
            timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
          },
          {
            id: 5,
            type: 'security',
            message: 'Security audit log exported',
            timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
            user: 'Admin',
          },
        ],
      };

      setStats(mockStats);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      report: '📋',
      user: '👤',
      backup: '💾',
      system: '⚙️',
      security: '🔒',
    };
    return icons[type] || '📌';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
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
        <LoadingSpinner fullScreen text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tcs-blue-deep via-tcs-blue-dark to-tcs-blue-primary relative overflow-hidden">
      {/* Enhanced background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[var(--tcs-gold)]/8 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[var(--tcs-blue-light)]/8 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
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
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">Admin Dashboard</h1>
            <p className="text-white/70 text-lg">
              PSW Voice Documentation System • Enterprise Control Center
            </p>
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

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Reports"
            value={stats?.totalReports || 0}
            subtitle="All time"
            icon="📋"
            color="gold"
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            subtitle={`${stats?.activeUsers || 0} active now`}
            icon="👥"
            color="emerald"
          />
          <StatCard
            title="System Health"
            value={stats?.systemHealth === 'healthy' ? 'Excellent' : 'Warning'}
            subtitle="All systems operational"
            icon="💚"
            color={stats?.systemHealth === 'healthy' ? 'emerald' : 'rose'}
          />
          <StatCard
            title="AI Performance"
            value={`${stats?.aiPerformance.avgResponseTime || 0}ms`}
            subtitle={`${stats?.aiPerformance.errorRate || 0}% error rate`}
            icon="🤖"
            color="violet"
            trend={{ value: 15.3, isPositive: false }}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="liquid-glass-card rounded-glass-lg p-6 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">⚡</span>
              <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              <Link href="/admin/monitoring">
                <button
                  className="liquid-glass-light w-full rounded-glass-lg border border-white/20 text-white h-24 flex-col hover:border-[var(--tcs-gold)]/40 transition-all shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_35px_rgba(212,165,116,0.4)] touch-target"
                >
                  <span className="mb-1 text-2xl">📊</span>
                  <span className="text-sm font-semibold">Monitoring</span>
                </button>
              </Link>
              <Link href="/admin/users">
                <button className="liquid-glass-light w-full rounded-glass-lg border border-white/20 text-white h-24 flex-col hover:border-[var(--tcs-gold)]/40 transition-all shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_35px_rgba(212,165,116,0.4)] touch-target">
                  <span className="mb-1 text-2xl">👥</span>
                  <span className="text-sm font-semibold">Users</span>
                </button>
              </Link>
              <Link href="/search">
                <button className="liquid-glass-light w-full rounded-glass-lg border border-white/20 text-white h-24 flex-col hover:border-[var(--tcs-gold)]/40 transition-all shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_35px_rgba(212,165,116,0.4)] touch-target">
                  <span className="mb-1 text-2xl">🔍</span>
                  <span className="text-sm font-semibold">Search</span>
                </button>
              </Link>
              <Link href="/reports">
                <button className="liquid-glass-light w-full rounded-glass-lg border border-white/20 text-white h-24 flex-col hover:border-[var(--tcs-gold)]/40 transition-all shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_35px_rgba(212,165,116,0.4)] touch-target">
                  <span className="mb-1 text-2xl">📋</span>
                  <span className="text-sm font-semibold">Reports</span>
                </button>
              </Link>
              <Link href="/admin/backups">
                <button className="liquid-glass-light w-full rounded-glass-lg border border-white/20 text-white h-24 flex-col hover:border-[var(--tcs-gold)]/40 transition-all shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_35px_rgba(212,165,116,0.4)] touch-target">
                  <span className="mb-1 text-2xl">💾</span>
                  <span className="text-sm font-semibold">Backups</span>
                </button>
              </Link>
              <Link href="/admin/audit-logs">
                <button className="liquid-glass-light w-full rounded-glass-lg border border-white/20 text-white h-24 flex-col hover:border-[var(--tcs-gold)]/40 transition-all shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_35px_rgba(212,165,116,0.4)] touch-target">
                  <span className="mb-1 text-2xl">📜</span>
                  <span className="text-sm font-semibold">Audit Logs</span>
                </button>
              </Link>
              <Link href="/analytics">
                <button className="liquid-glass-light w-full rounded-glass-lg border border-white/20 text-white h-24 flex-col hover:border-[var(--tcs-gold)]/40 transition-all shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_35px_rgba(212,165,116,0.4)] touch-target">
                  <span className="mb-1 text-2xl">📈</span>
                  <span className="text-sm font-semibold">Analytics</span>
                </button>
              </Link>
              <Link href="/settings">
                <button className="liquid-glass-light w-full rounded-glass-lg border border-white/20 text-white h-24 flex-col hover:border-[var(--tcs-gold)]/40 transition-all shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_35px_rgba(212,165,116,0.4)] touch-target">
                  <span className="mb-1 text-2xl">⚙️</span>
                  <span className="text-sm font-semibold">Settings</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity & System Status */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="liquid-glass-card rounded-glass-lg p-6 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
              </div>
              <button
                onClick={fetchDashboardData}
                className="touch-target liquid-glass-light text-white rounded-glass-md px-3 py-1.5 text-xs font-semibold border border-white/20 hover:border-white/30 transition-all"
              >
                🔄 Refresh
              </button>
            </div>
            <div className="space-y-3">
              {stats?.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="liquid-glass-light rounded-glass-md flex items-start space-x-3 border border-white/15 p-4 transition-all hover:border-white/30 hover:-translate-y-0.5"
                >
                  <span className="text-2xl">
                    {getActivityIcon(activity.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">
                      {activity.message}
                    </p>
                    {activity.user && (
                      <p className="text-xs text-white/60">
                        by {activity.user}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-white/50">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                  <Badge
                    variant={activity.type === 'security' ? 'warning' : 'info'}
                    size="sm"
                  >
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="liquid-glass-card rounded-glass-lg p-6 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">💻</span>
              <h2 className="text-2xl font-bold text-white">System Status</h2>
            </div>
            <div className="space-y-4">
              <div className="liquid-glass-light rounded-glass-md flex items-center justify-between border border-white/15 p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-medium text-white">Database</p>
                    <p className="text-xs text-white/60">
                      Connected & healthy
                    </p>
                  </div>
                </div>
                <Badge variant="success">Online</Badge>
              </div>

              <div className="liquid-glass-light rounded-glass-md flex items-center justify-between border border-white/15 p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className="font-medium text-white">AI Model</p>
                    <p className="text-xs text-white/60">
                      Llama 3.3 70B operational
                    </p>
                  </div>
                </div>
                <Badge variant="success">Running</Badge>
              </div>

              <div className="liquid-glass-light rounded-glass-md flex items-center justify-between border border-white/15 p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-medium text-white">Redis Cache</p>
                    <p className="text-xs text-white/60">85% hit rate</p>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>

              <div className="liquid-glass-light rounded-glass-md flex items-center justify-between border border-white/15 p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💾</span>
                  <div>
                    <p className="font-medium text-white">Backups</p>
                    <p className="text-xs text-white/60">Last: 2 hours ago</p>
                  </div>
                </div>
                <Badge variant="success">Automated</Badge>
              </div>

              <Link href="/admin/monitoring">
                <button className="touch-target liquid-glass-gold text-[var(--tcs-blue-deep)] rounded-glass-lg w-full px-6 py-3 mt-4 font-semibold shadow-[0_10px_25px_rgba(212,165,116,0.4)] hover:shadow-[0_15px_35px_rgba(212,165,116,0.5)] transition-all">
                  View Full Monitoring Dashboard →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
