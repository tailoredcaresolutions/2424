/**
 * Health Monitoring Service - PSW Voice Documentation System
 *
 * Comprehensive health monitoring with metrics collection
 * Features:
 * - Real-time system metrics (CPU, memory, disk)
 * - Service health checks (database, Ollama, filesystem)
 * - Performance tracking
 * - Alert thresholds
 * - Historical metrics storage
 */

import os from 'os';
import fs from 'fs';
import { getEncryptedDb } from '../database/encryptedDb.ts';
import { log as logger } from '../logger.ts';

interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    loadAverage: number[];
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  uptime: number;
}

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastCheck: string;
  message?: string;
}

interface HealthReport {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  system: SystemMetrics;
  services: ServiceHealth[];
  alerts: Alert[];
}

interface Alert {
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  metric?: string;
  value?: number;
  threshold?: number;
}

export class HealthMonitor {
  private alertThresholds = {
    cpu: { warning: 70, critical: 90 },
    memory: { warning: 80, critical: 95 },
    disk: { warning: 85, critical: 95 },
    responseTime: { warning: 1000, critical: 5000 }, // ms
  };

  /**
   * Get comprehensive health report
   */
  public async getHealthReport(): Promise<HealthReport> {
    const timestamp = new Date().toISOString();

    // Collect system metrics
    const systemMetrics = await this.collectSystemMetrics();

    // Check all services
    const services = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkOllamaHealth(),
      this.checkFilesystemHealth(),
    ]);

    // Generate alerts based on metrics and service health
    const alerts = this.generateAlerts(systemMetrics, services);

    // Determine overall health status
    const overall = this.determineOverallHealth(services, alerts);

    return {
      overall,
      timestamp,
      system: systemMetrics,
      services,
      alerts,
    };
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<SystemMetrics> {
    // CPU metrics
    const cpus = os.cpus();
    const loadAverage = os.loadavg();

    // Calculate CPU usage
    let totalIdle = 0;
    let totalTick = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    }

    const cpuUsage = 100 - ~~((100 * totalIdle) / totalTick);

    // Memory metrics
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercentage = (usedMem / totalMem) * 100;

    // Disk metrics
    const diskInfo = await this.getDiskInfo();

    return {
      timestamp: new Date().toISOString(),
      cpu: {
        usage: cpuUsage,
        loadAverage,
        cores: cpus.length,
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        percentage: memPercentage,
      },
      disk: diskInfo,
      uptime: os.uptime(),
    };
  }

  /**
   * Get disk usage information
   */
  private async getDiskInfo(): Promise<{
    total: number;
    used: number;
    free: number;
    percentage: number;
  }> {
    try {
      const dbPath = process.env.LOCAL_DB_PATH || './data/psw_data.db';
      const dbDir = dbPath.substring(0, dbPath.lastIndexOf('/'));

      // Get filesystem stats for the database directory
      const stats = fs.statSync(dbDir);

      // Estimate disk usage (simplified for cross-platform compatibility)
      // In production, you might want to use a library like 'diskusage' or 'check-disk-space'
      const total = 500 * 1024 * 1024 * 1024; // Assume 500GB (placeholder)
      const used = stats.size || 0;
      const free = total - used;
      const percentage = (used / total) * 100;

      return { total, used, free, percentage };
    } catch (error) {
      logger.error(
        {
          type: 'disk_info_error',
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Failed to get disk info'
      );

      return { total: 0, used: 0, free: 0, percentage: 0 };
    }
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();

    try {
      const db = getEncryptedDb();

      // Test query
      const result = db
        .prepare('SELECT COUNT(*) as count FROM psw_users')
        .get() as { count: number };

      const responseTime = Date.now() - startTime;

      // Check response time thresholds
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (responseTime > this.alertThresholds.responseTime.critical) {
        status = 'unhealthy';
      } else if (responseTime > this.alertThresholds.responseTime.warning) {
        status = 'degraded';
      }

      return {
        name: 'Database',
        status,
        responseTime,
        lastCheck: new Date().toISOString(),
        message:
          status === 'healthy'
            ? 'Operational'
            : `Slow response: ${responseTime}ms`,
      };
    } catch (error) {
      return {
        name: 'Database',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Check Ollama AI service health
   */
  private async checkOllamaHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('http://localhost:11434/api/tags', {
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return {
          name: 'Ollama AI',
          status: 'unhealthy',
          responseTime,
          lastCheck: new Date().toISOString(),
          message: `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      const hasModel = data.models?.some((m: any) =>
        m.name.includes('llama3.3')
      );

      return {
        name: 'Ollama AI',
        status: hasModel ? 'healthy' : 'degraded',
        responseTime,
        lastCheck: new Date().toISOString(),
        message: hasModel ? 'Llama 3.3 70B available' : 'Model not found',
      };
    } catch (error) {
      return {
        name: 'Ollama AI',
        status: 'degraded', // AI is optional, so degraded instead of unhealthy
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Service unreachable',
      };
    }
  }

  /**
   * Check filesystem health
   */
  private async checkFilesystemHealth(): Promise<ServiceHealth> {
    try {
      const dbPath = process.env.LOCAL_DB_PATH || './data/psw_data.db';
      const backupDir = process.env.BACKUP_DIR || './backups';

      const dbExists = fs.existsSync(dbPath);
      const backupDirExists = fs.existsSync(backupDir);

      if (!dbExists) {
        return {
          name: 'Filesystem',
          status: 'unhealthy',
          lastCheck: new Date().toISOString(),
          message: 'Database file not found',
        };
      }

      if (!backupDirExists) {
        return {
          name: 'Filesystem',
          status: 'degraded',
          lastCheck: new Date().toISOString(),
          message: 'Backup directory not found',
        };
      }

      // Check disk space
      const dbStats = fs.statSync(dbPath);
      const dbSize = dbStats.size / 1024 / 1024; // MB

      return {
        name: 'Filesystem',
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        message: `Database size: ${dbSize.toFixed(2)} MB`,
      };
    } catch (error) {
      return {
        name: 'Filesystem',
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        message:
          error instanceof Error ? error.message : 'Filesystem check failed',
      };
    }
  }

  /**
   * Generate alerts based on metrics and service health
   */
  private generateAlerts(
    metrics: SystemMetrics,
    services: ServiceHealth[]
  ): Alert[] {
    const alerts: Alert[] = [];
    const timestamp = new Date().toISOString();

    // CPU alerts
    if (metrics.cpu.usage >= this.alertThresholds.cpu.critical) {
      alerts.push({
        level: 'critical',
        message: `CPU usage critical: ${metrics.cpu.usage.toFixed(1)}%`,
        timestamp,
        metric: 'cpu',
        value: metrics.cpu.usage,
        threshold: this.alertThresholds.cpu.critical,
      });
    } else if (metrics.cpu.usage >= this.alertThresholds.cpu.warning) {
      alerts.push({
        level: 'warning',
        message: `CPU usage high: ${metrics.cpu.usage.toFixed(1)}%`,
        timestamp,
        metric: 'cpu',
        value: metrics.cpu.usage,
        threshold: this.alertThresholds.cpu.warning,
      });
    }

    // Memory alerts
    if (metrics.memory.percentage >= this.alertThresholds.memory.critical) {
      alerts.push({
        level: 'critical',
        message: `Memory usage critical: ${metrics.memory.percentage.toFixed(1)}%`,
        timestamp,
        metric: 'memory',
        value: metrics.memory.percentage,
        threshold: this.alertThresholds.memory.critical,
      });
    } else if (
      metrics.memory.percentage >= this.alertThresholds.memory.warning
    ) {
      alerts.push({
        level: 'warning',
        message: `Memory usage high: ${metrics.memory.percentage.toFixed(1)}%`,
        timestamp,
        metric: 'memory',
        value: metrics.memory.percentage,
        threshold: this.alertThresholds.memory.warning,
      });
    }

    // Disk alerts
    if (metrics.disk.percentage >= this.alertThresholds.disk.critical) {
      alerts.push({
        level: 'critical',
        message: `Disk usage critical: ${metrics.disk.percentage.toFixed(1)}%`,
        timestamp,
        metric: 'disk',
        value: metrics.disk.percentage,
        threshold: this.alertThresholds.disk.critical,
      });
    } else if (metrics.disk.percentage >= this.alertThresholds.disk.warning) {
      alerts.push({
        level: 'warning',
        message: `Disk usage high: ${metrics.disk.percentage.toFixed(1)}%`,
        timestamp,
        metric: 'disk',
        value: metrics.disk.percentage,
        threshold: this.alertThresholds.disk.warning,
      });
    }

    // Service health alerts
    for (const service of services) {
      if (service.status === 'unhealthy') {
        alerts.push({
          level: 'critical',
          message: `Service unhealthy: ${service.name} - ${service.message}`,
          timestamp,
        });
      } else if (service.status === 'degraded') {
        alerts.push({
          level: 'warning',
          message: `Service degraded: ${service.name} - ${service.message}`,
          timestamp,
        });
      }
    }

    return alerts;
  }

  /**
   * Determine overall health status
   */
  private determineOverallHealth(
    services: ServiceHealth[],
    alerts: Alert[]
  ): 'healthy' | 'degraded' | 'unhealthy' {
    // Any critical alert means unhealthy
    if (alerts.some((a) => a.level === 'critical')) {
      return 'unhealthy';
    }

    // Any unhealthy service means overall unhealthy
    if (services.some((s) => s.status === 'unhealthy')) {
      return 'unhealthy';
    }

    // Any warning alert or degraded service means degraded
    if (
      alerts.some((a) => a.level === 'warning') ||
      services.some((s) => s.status === 'degraded')
    ) {
      return 'degraded';
    }

    return 'healthy';
  }

  /**
   * Store health metrics to database for historical tracking
   */
  public async storeMetrics(report: HealthReport): Promise<void> {
    try {
      const db = getEncryptedDb();

      // Create metrics table if not exists
      db.exec(`
        CREATE TABLE IF NOT EXISTS health_metrics (
          metric_id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          overall_status TEXT NOT NULL,
          cpu_usage REAL,
          memory_percentage REAL,
          disk_percentage REAL,
          alert_count INTEGER,
          critical_alert_count INTEGER
        );

        CREATE INDEX IF NOT EXISTS idx_health_metrics_timestamp
        ON health_metrics(timestamp DESC);
      `);

      // Insert metrics
      const criticalAlerts = report.alerts.filter(
        (a) => a.level === 'critical'
      ).length;

      db.prepare(
        `
        INSERT INTO health_metrics (
          overall_status, cpu_usage, memory_percentage, disk_percentage,
          alert_count, critical_alert_count
        ) VALUES (?, ?, ?, ?, ?, ?)
      `
      ).run(
        report.overall,
        report.system.cpu.usage,
        report.system.memory.percentage,
        report.system.disk.percentage,
        report.alerts.length,
        criticalAlerts
      );

      // Cleanup old metrics (keep last 30 days)
      db.prepare(
        `
        DELETE FROM health_metrics
        WHERE timestamp < datetime('now', '-30 days')
      `
      ).run();
    } catch (error) {
      logger.error(
        {
          type: 'health_metrics_store_error',
          error: error instanceof Error ? error.message : 'Unknown',
        },
        'Failed to store health metrics'
      );
    }
  }
}

// Singleton instance
let healthMonitorInstance: HealthMonitor | null = null;

export function getHealthMonitor(): HealthMonitor {
  if (!healthMonitorInstance) {
    healthMonitorInstance = new HealthMonitor();
  }
  return healthMonitorInstance;
}
