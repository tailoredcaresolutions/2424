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

interface AnalyticsData {
  reportTrends: {
    labels: string[];
    values: number[];
  };
  pswPerformance: Array<{
    name: string;
    reportsCount: number;
    avgResponseTime: number;
    satisfactionScore: number;
  }>;
  topConcerns: Array<{
    concern: string;
    count: number;
    percentage: number;
  }>;
  systemUsage: {
    totalReports: number;
    totalUsers: number;
    avgReportsPerDay: number;
    peakHours: number[];
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(
    '30d'
  );

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData: AnalyticsData = {
        reportTrends: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          values: [45, 52, 48, 61],
        },
        pswPerformance: [
          {
            name: 'Sarah Johnson',
            reportsCount: 87,
            avgResponseTime: 145,
            satisfactionScore: 4.8,
          },
          {
            name: 'Michael Chen',
            reportsCount: 76,
            avgResponseTime: 132,
            satisfactionScore: 4.9,
          },
          {
            name: 'Emma Wilson',
            reportsCount: 68,
            avgResponseTime: 158,
            satisfactionScore: 4.6,
          },
          {
            name: 'James Brown',
            reportsCount: 59,
            avgResponseTime: 167,
            satisfactionScore: 4.5,
          },
        ],
        topConcerns: [
          {
            concern: 'Mobility assistance needed',
            count: 23,
            percentage: 34.2,
          },
          { concern: 'Medication reminder', count: 18, percentage: 26.8 },
          { concern: 'Diet compliance', count: 12, percentage: 17.9 },
          { concern: 'Social engagement', count: 9, percentage: 13.4 },
          { concern: 'Other', count: 5, percentage: 7.7 },
        ],
        systemUsage: {
          totalReports: 1247,
          totalUsers: 45,
          avgReportsPerDay: 41.5,
          peakHours: [9, 10, 14, 15, 16],
        },
      };

      setAnalytics(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeLabel = (range: string) => {
    const labels: Record<string, string> = {
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '90d': 'Last 90 Days',
      '1y': 'Last Year',
    };
    return labels[range];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tcs-blue-primary via-tcs-blue-mid to-tcs-blue-light">
        <Navigation
          user={{
            name: 'Admin User',
            role: 'admin',
            email: 'admin@tailoredcare.ca',
          }}
        />
        <LoadingSpinner fullScreen text="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tcs-blue-primary via-tcs-blue-mid to-tcs-blue-light relative overflow-hidden">
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
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
              Analytics Dashboard
            </h1>
            <p className="text-white/70 text-lg">
              Hyper-precise insights across every PSW shift
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`touch-target rounded-glass-lg border px-4 py-2 text-sm font-semibold transition-all ${
                  timeRange === range
                    ? 'liquid-glass-light text-[var(--tcs-blue-deep)] shadow-[0_12px_25px_rgba(255,255,255,0.25)] border-white/30'
                    : 'liquid-glass-card text-white/70 border-white/20 hover:text-white hover:border-white/30'
                }`}
              >
                {getTimeRangeLabel(range)}
              </button>
            ))}
            <button
              onClick={fetchAnalytics}
              className="touch-target liquid-glass-gold text-[var(--tcs-blue-deep)] rounded-glass-lg px-4 py-2 text-sm font-semibold shadow-[0_10px_25px_rgba(212,165,116,0.4)] hover:shadow-[0_15px_35px_rgba(212,165,116,0.5)] transition-all"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {analytics && (
          <>
            {/* Key Metrics */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Reports"
                value={analytics.systemUsage.totalReports}
                subtitle="All time"
                icon="📋"
                color="aqua"
                trend={{ value: 12.5, isPositive: true }}
              />
              <StatCard
                title="Active Users"
                value={analytics.systemUsage.totalUsers}
                subtitle="Currently active"
                icon="👥"
                color="emerald"
                trend={{ value: 8.3, isPositive: true }}
              />
              <StatCard
                title="Avg Reports/Day"
                value={analytics.systemUsage.avgReportsPerDay.toFixed(1)}
                subtitle="Daily average"
                icon="📊"
                color="violet"
              />
              <StatCard
                title="Peak Hours"
                value={`${analytics.systemUsage.peakHours[0]}am-${analytics.systemUsage.peakHours[analytics.systemUsage.peakHours.length - 1]}pm`}
                subtitle="Busiest times"
                icon="⏰"
                color="gold"
              />
            </div>

            {/* Report Trends */}
            <Card className="mb-8">
              <CardHeader title="Report Trends" icon="📈" />
              <CardContent>
                <div className="space-y-4">
                  {analytics.reportTrends.labels.map((label, index) => {
                    const value = analytics.reportTrends.values[index];
                    const maxValue = Math.max(...analytics.reportTrends.values);
                    const percentage = (value / maxValue) * 100;

                    return (
                      <div key={label} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm font-medium">
                            {label}
                          </span>
                          <span className="text-white text-lg font-bold">
                            {value} reports
                          </span>
                        </div>
                        <div className="bg-white/10 rounded-full h-3 w-full overflow-hidden">
                          <div
                            className="rounded-full h-full bg-gradient-to-r from-[var(--tcs-light-gold)] via-[var(--tcs-gold)] to-[var(--tcs-deep-gold)] shadow-[0_10px_25px_rgba(241,168,82,0.45)] transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* PSW Performance & Top Concerns */}
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* PSW Performance */}
              <Card>
                <CardHeader title="PSW Performance" icon="🏆" />
                <CardContent>
                  <div className="space-y-4">
                    {analytics.pswPerformance.map((psw, index) => (
                      <div
                        key={psw.name}
                        className="bg-white/85 rounded-2xl flex items-center justify-between border border-[#F1E0CC] p-4 transition-all hover:-translate-y-0.5"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="rounded-full flex h-10 w-10 items-center justify-center bg-gradient-to-br from-[var(--tcs-light-gold)] to-[var(--tcs-gold)] font-bold text-[#2C1301]">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-[#1F1B16]">
                              {psw.name}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {psw.reportsCount} reports • {psw.avgResponseTime}
                              ms avg
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-amber-500">⭐</span>
                          <span className="font-bold text-[#1F1B16]">
                            {psw.satisfactionScore}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Concerns */}
              <Card>
                <CardHeader title="Top Concerns" icon="⚠️" />
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topConcerns.map((concern) => (
                      <div key={concern.concern} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 text-sm font-medium">
                            {concern.concern}
                          </span>
                          <Badge variant="info">{concern.count} times</Badge>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="bg-white/10 rounded-full h-2 flex-1 overflow-hidden">
                            <div
                              className="rounded-full h-full bg-gradient-to-r from-[var(--tcs-light-gold)] to-[var(--tcs-gold)] shadow-[0_4px_15px_rgba(241,168,82,0.45)]"
                              style={{ width: `${concern.percentage}%` }}
                            />
                          </div>
                          <span className="text-white/70 text-sm font-semibold">
                            {concern.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Activity Heatmap */}
            <Card>
              <CardHeader title="Activity Heatmap (24 Hours)" icon="🔥" />
              <CardContent>
                <div className="grid grid-cols-12 gap-2">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const isPeak =
                      analytics.systemUsage.peakHours.includes(hour);
                    const activity = isPeak
                      ? 80 + Math.random() * 20
                      : 20 + Math.random() * 40;

                    return (
                      <div
                        key={hour}
                        className="flex flex-col items-center space-y-2"
                        title={`${hour}:00 - Activity: ${activity.toFixed(0)}%`}
                      >
                        <div
                          className={`h-24 w-full rounded-lg transition-all ${
                            isPeak
                              ? 'bg-gradient-to-t from-[#FFB347] via-[#FF7E5F] to-[#FE4E4E]'
                              : activity > 40
                                ? 'bg-gradient-to-t from-[#5EF0FF] to-[#7C8BFF]'
                                : 'bg-white/15'
                          }`}
                          style={{ height: `${activity}px` }}
                        />
                        <span className="text-white/60 text-xs font-medium">
                          {hour}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="text-white/60 mt-4 flex items-center justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="rounded bg-white/15 h-4 w-4"></div>
                    <span>Low Activity</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="rounded h-4 w-4 bg-gradient-to-r from-[#5EF0FF] to-[#7C8BFF]"></div>
                    <span>Medium Activity</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="rounded h-4 w-4 bg-gradient-to-r from-[#FFB347] via-[#FF7E5F] to-[#FE4E4E]"></div>
                    <span>Peak Activity</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <div className="mt-8 flex justify-center">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => console.log('Export PDF')}
                >
                  📄 Export PDF Report
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => console.log('Export CSV')}
                >
                  📥 Export Raw Data (CSV)
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => console.log('Schedule report')}
                >
                  📅 Schedule Report
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
