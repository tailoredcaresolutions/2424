'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
      <div className="min-h-screen bg-gradient-to-br from-[#030817] via-[#050d1f] to-[#0b142c]">
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
            <h1 className="text-white text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-white/70 mt-2">
              PSW Voice Documentation System • Enterprise Control Center
            </p>
          </div>
        </div>

        {error && (
          <div className="border-red-500/40 rounded-2xl text-red-100 mb-6 border bg-gradient-to-r from-[#3B0F0F] to-[#5B1A1A] p-4 shadow-[0_15px_40px_rgba(59,15,15,0.5)]">
            ⚠️ {error}
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
          <Card>
            <CardHeader title="Quick Actions" icon="⚡" />
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                <Link href="/admin/monitoring">
                  <Button
                    variant="ghost"
                    fullWidth
                    className="border-white/15 text-white h-24 flex-col border hover:text-[#2C1301]"
                  >
                    <span className="mb-1 text-2xl">📊</span>
                    <span className="text-sm">Monitoring</span>
                  </Button>
                </Link>
                <Link href="/admin/users">
                  <Button
                    variant="ghost"
                    fullWidth
                    className="border-white/15 text-white h-24 flex-col border hover:text-[#2C1301]"
                  >
                    <span className="mb-1 text-2xl">👥</span>
                    <span className="text-sm">Users</span>
                  </Button>
                </Link>
                <Link href="/search">
                  <Button
                    variant="ghost"
                    fullWidth
                    className="border-white/15 text-white h-24 flex-col border hover:text-[#2C1301]"
                  >
                    <span className="mb-1 text-2xl">🔍</span>
                    <span className="text-sm">Search</span>
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button
                    variant="ghost"
                    fullWidth
                    className="border-white/15 text-white h-24 flex-col border hover:text-[#2C1301]"
                  >
                    <span className="mb-1 text-2xl">📋</span>
                    <span className="text-sm">Reports</span>
                  </Button>
                </Link>
                <Link href="/admin/backups">
                  <Button
                    variant="ghost"
                    fullWidth
                    className="border-white/15 text-white h-24 flex-col border hover:text-[#2C1301]"
                  >
                    <span className="mb-1 text-2xl">💾</span>
                    <span className="text-sm">Backups</span>
                  </Button>
                </Link>
                <Link href="/admin/audit-logs">
                  <Button
                    variant="ghost"
                    fullWidth
                    className="border-white/15 text-white h-24 flex-col border hover:text-[#2C1301]"
                  >
                    <span className="mb-1 text-2xl">📜</span>
                    <span className="text-sm">Audit Logs</span>
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button
                    variant="ghost"
                    fullWidth
                    className="border-white/15 text-white h-24 flex-col border hover:text-[#2C1301]"
                  >
                    <span className="mb-1 text-2xl">📈</span>
                    <span className="text-sm">Analytics</span>
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button
                    variant="ghost"
                    fullWidth
                    className="border-white/15 text-white h-24 flex-col border hover:text-[#2C1301]"
                  >
                    <span className="mb-1 text-2xl">⚙️</span>
                    <span className="text-sm">Settings</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & System Status */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader
              title="Recent Activity"
              icon="📊"
              action={
                <Button size="sm" variant="ghost" onClick={fetchDashboardData}>
                  🔄 Refresh
                </Button>
              }
            />
            <CardContent className="space-y-3">
              {stats?.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-2xl bg-white/85 flex items-start space-x-3 border border-[#F1E0CC] p-3 transition-all hover:-translate-y-0.5"
                >
                  <span className="text-2xl">
                    {getActivityIcon(activity.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1F1B16]">
                      {activity.message}
                    </p>
                    {activity.user && (
                      <p className="text-xs text-[#7A6A58]">
                        by {activity.user}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-[#9A8A78]">
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
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader title="System Status" icon="💻" />
            <CardContent className="space-y-4">
              <div className="bg-white/85 rounded-2xl flex items-center justify-between border border-[#F1E0CC] p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-medium text-[#1F1B16]">Database</p>
                    <p className="text-xs text-[#7A6A58]">
                      Connected & healthy
                    </p>
                  </div>
                </div>
                <Badge variant="success">Online</Badge>
              </div>

              <div className="bg-white/85 rounded-2xl flex items-center justify-between border border-[#F1E0CC] p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className="font-medium text-[#1F1B16]">AI Model</p>
                    <p className="text-xs text-[#7A6A58]">
                      Llama 3.3 70B operational
                    </p>
                  </div>
                </div>
                <Badge variant="success">Running</Badge>
              </div>

              <div className="bg-white/85 rounded-2xl flex items-center justify-between border border-[#F1E0CC] p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-medium text-[#1F1B16]">Redis Cache</p>
                    <p className="text-xs text-[#7A6A58]">85% hit rate</p>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>

              <div className="bg-white/85 rounded-2xl flex items-center justify-between border border-[#F1E0CC] p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💾</span>
                  <div>
                    <p className="font-medium text-[#1F1B16]">Backups</p>
                    <p className="text-xs text-[#7A6A58]">Last: 2 hours ago</p>
                  </div>
                </div>
                <Badge variant="success">Automated</Badge>
              </div>

              <Link href="/admin/monitoring">
                <Button variant="primary" fullWidth className="mt-4">
                  View Full Monitoring Dashboard →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
