import { ErrorHandler } from './error-handling';
import { systemDiagnostics } from './system-diagnostics';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface UserAction {
  action: string;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, any>;
}

class ProductionMonitoring {
  private metrics: PerformanceMetric[] = [];
  private userActions: UserAction[] = [];
  private maxMetrics = 1000;
  private maxActions = 500;
  private isEnabled = process.env.NODE_ENV === 'production';

  init() {
    if (!this.isEnabled) return;

    this.setupPerformanceObserver();
    this.setupErrorTracking();
    this.setupUserTracking();
    this.startHealthChecks();
  }

  private setupPerformanceObserver() {
    try {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackMetric({
              name: entry.name,
              value: entry.duration || (entry as any).transferSize || 0,
              timestamp: Date.now(),
              metadata: {
                entryType: entry.entryType,
                startTime: entry.startTime,
              },
            });
          }
        });

        observer.observe({ entryTypes: ['navigation', 'resource', 'measure', 'paint'] });
      }
    } catch (error) {
      ErrorHandler.handle(error, { context: 'ProductionMonitoring.setupPerformanceObserver' });
    }
  }

  private setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: 'Unhandled Promise Rejection',
        reason: event.reason,
        stack: event.reason?.stack,
      });
    });
  }

  private setupUserTracking() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackUserAction({
        action: document.visibilityState === 'visible' ? 'page_visible' : 'page_hidden',
        timestamp: Date.now(),
      });
    });

    // Track user engagement
    let lastActivity = Date.now();
    const updateActivity = () => {
      lastActivity = Date.now();
    };

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for inactive users
    setInterval(() => {
      const inactive = Date.now() - lastActivity;
      if (inactive > 300000) { // 5 minutes
        this.trackUserAction({
          action: 'user_inactive',
          timestamp: Date.now(),
          metadata: { inactiveTime: inactive },
        });
      }
    }, 60000); // Check every minute
  }

  private startHealthChecks() {
    setInterval(() => {
      const health = systemDiagnostics.getSystemHealth();
      
      this.trackMetric({
        name: 'memory_usage',
        value: health.memory.percentage,
        timestamp: Date.now(),
      });

      this.trackMetric({
        name: 'storage_usage',
        value: health.storage.localStorage.percentage,
        timestamp: Date.now(),
      });

      if (!health.network.online) {
        this.trackUserAction({
          action: 'network_offline',
          timestamp: Date.now(),
        });
      }
    }, 60000); // Every minute
  }

  trackMetric(metric: PerformanceMetric) {
    if (!this.isEnabled) return;

    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log critical performance issues
    if (metric.name === 'navigation' && metric.value > 5000) {
      console.warn('Slow page load detected:', metric.value + 'ms');
    }
  }

  trackUserAction(action: UserAction) {
    if (!this.isEnabled) return;

    this.userActions.push(action);
    if (this.userActions.length > this.maxActions) {
      this.userActions = this.userActions.slice(-this.maxActions);
    }
  }

  trackError(errorInfo: any) {
    if (!this.isEnabled) return;

    systemDiagnostics.logError(JSON.stringify(errorInfo));
    
    // In production, you might want to send this to an external service
    console.error('Production error tracked:', errorInfo);
  }

  getMetrics(since?: number): PerformanceMetric[] {
    const cutoff = since || Date.now() - 3600000; // Last hour by default
    return this.metrics.filter(m => m.timestamp >= cutoff);
  }

  getUserActions(since?: number): UserAction[] {
    const cutoff = since || Date.now() - 3600000; // Last hour by default
    return this.userActions.filter(a => a.timestamp >= cutoff);
  }

  generateInsights() {
    const recentMetrics = this.getMetrics();
    const recentActions = this.getUserActions();

    const avgLoadTime = recentMetrics
      .filter(m => m.name === 'navigation')
      .reduce((sum, m, _, arr) => sum + m.value / arr.length, 0);

    const errorCount = systemDiagnostics.getSystemHealth().errors.count;
    const userEngagement = recentActions.filter(a => a.action !== 'user_inactive').length;

    return {
      performance: {
        avgLoadTime: avgLoadTime.toFixed(0) + 'ms',
        totalMetrics: recentMetrics.length,
      },
      errors: {
        count: errorCount,
        rate: ((errorCount / recentActions.length) * 100).toFixed(2) + '%',
      },
      engagement: {
        totalActions: recentActions.length,
        activeActions: userEngagement,
        engagementRate: ((userEngagement / recentActions.length) * 100).toFixed(2) + '%',
      },
    };
  }

  exportData() {
    return {
      metrics: this.getMetrics(),
      userActions: this.getUserActions(),
      systemHealth: systemDiagnostics.getSystemHealth(),
      insights: this.generateInsights(),
      timestamp: new Date().toISOString(),
    };
  }

  runHealthChecks() {
    const health = systemDiagnostics.getSystemHealth();
    const insights = this.generateInsights();
    
    return [
      {
        service: 'Database',
        status: health.errors.count === 0 ? 'healthy' : 'degraded',
        message: health.errors.count === 0 ? 'All connections active' : `${health.errors.count} errors detected`
      },
      {
        service: 'Memory',
        status: health.memory.percentage < 80 ? 'healthy' : 'degraded',
        message: `${health.memory.percentage.toFixed(1)}% used`
      },
      {
        service: 'Network',
        status: health.network.online ? 'healthy' : 'unhealthy',
        message: health.network.online ? 'Connected' : 'Offline'
      },
      {
        service: 'Performance',
        status: parseFloat(insights.performance.avgLoadTime) < 3000 ? 'healthy' : 'degraded',
        message: `Avg load time: ${insights.performance.avgLoadTime}`
      }
    ];
  }

  getSystemMetrics() {
    const health = systemDiagnostics.getSystemHealth();
    const insights = this.generateInsights();
    
    return {
      memory: health.memory,
      errors: {
        rate: health.errors.count / Math.max(this.userActions.length, 1)
      },
      uptime: performance.now(),
      performance: insights.performance
    };
  }
}

export const productionMonitoring = new ProductionMonitoring();