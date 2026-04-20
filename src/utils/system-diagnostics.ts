import { ErrorHandler } from './error-handling';

export interface SystemHealth {
  memory: {
    used: number;
    limit: number;
    percentage: number;
  };
  performance: {
    navigationStart: number;
    loadComplete: number;
    totalLoadTime: number;
  };
  storage: {
    localStorage: {
      used: number;
      available: number;
      percentage: number;
    };
    sessionStorage: {
      used: number;
      available: number;
      percentage: number;
    };
  };
  network: {
    online: boolean;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
  errors: {
    count: number;
    recent: string[];
  };
}

class SystemDiagnostics {
  private errorLog: string[] = [];
  private maxErrorLog = 50;

  getSystemHealth(): SystemHealth {
    try {
      return {
        memory: this.getMemoryInfo(),
        performance: this.getPerformanceInfo(),
        storage: this.getStorageInfo(),
        network: this.getNetworkInfo(),
        errors: this.getErrorInfo(),
      };
    } catch (error) {
      ErrorHandler.handle(error, { context: 'SystemDiagnostics.getSystemHealth' });
      return this.getDefaultHealth();
    }
  }

  private getMemoryInfo() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }
    return { used: 0, limit: 0, percentage: 0 };
  }

  private getPerformanceInfo() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      return {
        navigationStart: navigation.startTime || 0,
        loadComplete: navigation.loadEventEnd || 0,
        totalLoadTime: (navigation.loadEventEnd || 0) - (navigation.startTime || 0),
      };
    }
    return { navigationStart: 0, loadComplete: 0, totalLoadTime: 0 };
  }

  private getStorageInfo() {
    const getStorageSize = (storage: Storage) => {
      let total = 0;
      for (const key in storage) {
        if (Object.prototype.hasOwnProperty.call(storage, key)) {
          total += (storage[key]?.length || 0) + key.length;
        }
      }
      return total;
    };

    const localStorageUsed = getStorageSize(localStorage);
    const sessionStorageUsed = getStorageSize(sessionStorage);
    const estimatedLimit = 5 * 1024 * 1024; // 5MB typical limit

    return {
      localStorage: {
        used: localStorageUsed,
        available: estimatedLimit - localStorageUsed,
        percentage: (localStorageUsed / estimatedLimit) * 100,
      },
      sessionStorage: {
        used: sessionStorageUsed,
        available: estimatedLimit - sessionStorageUsed,
        percentage: (sessionStorageUsed / estimatedLimit) * 100,
      },
    };
  }

  private getNetworkInfo() {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
    };
  }

  private getErrorInfo() {
    return {
      count: this.errorLog.length,
      recent: this.errorLog.slice(-10),
    };
  }

  logError(error: string) {
    this.errorLog.push(`${new Date().toISOString()}: ${error}`);
    if (this.errorLog.length > this.maxErrorLog) {
      this.errorLog = this.errorLog.slice(-this.maxErrorLog);
    }
  }

  private getDefaultHealth(): SystemHealth {
    return {
      memory: { used: 0, limit: 0, percentage: 0 },
      performance: { navigationStart: 0, loadComplete: 0, totalLoadTime: 0 },
      storage: {
        localStorage: { used: 0, available: 0, percentage: 0 },
        sessionStorage: { used: 0, available: 0, percentage: 0 },
      },
      network: { online: navigator.onLine },
      errors: { count: 0, recent: [] },
    };
  }

  generateReport(): string {
    const health = this.getSystemHealth();
    
    return `
System Health Report - ${new Date().toISOString()}
=================================================

Memory Usage:
- Used: ${(health.memory.used / 1024 / 1024).toFixed(2)} MB
- Limit: ${(health.memory.limit / 1024 / 1024).toFixed(2)} MB
- Percentage: ${health.memory.percentage.toFixed(2)}%

Performance:
- Total Load Time: ${health.performance.totalLoadTime.toFixed(0)}ms

Storage:
- LocalStorage: ${health.storage.localStorage.percentage.toFixed(2)}% used
- SessionStorage: ${health.storage.sessionStorage.percentage.toFixed(2)}% used

Network:
- Online: ${health.network.online}
- Connection Type: ${health.network.effectiveType || 'Unknown'}
- Downlink: ${health.network.downlink || 'Unknown'} Mbps
- RTT: ${health.network.rtt || 'Unknown'}ms

Errors:
- Total Count: ${health.errors.count}
- Recent Errors: ${health.errors.recent.length}
    `;
  }

  startMonitoring(intervalMs = 30000) {
    const monitor = () => {
      const health = this.getSystemHealth();
      
      // Alert on high memory usage
      if (health.memory.percentage > 90) {
        console.warn('High memory usage detected:', health.memory.percentage.toFixed(2) + '%');
      }
      
      // Alert on storage issues
      if (health.storage.localStorage.percentage > 80) {
        console.warn('LocalStorage almost full:', health.storage.localStorage.percentage.toFixed(2) + '%');
      }
      
      // Alert on network issues
      if (!health.network.online) {
        console.warn('Network offline detected');
      }
    };

    // Initial check
    monitor();
    
    // Set up periodic monitoring
    return setInterval(monitor, intervalMs);
  }

  runFullDiagnostics() {
    const health = this.getSystemHealth();
    const report = this.generateReport();
    
    return {
      health,
      report,
      timestamp: new Date().toISOString(),
      recommendations: this.getRecommendations(health)
    };
  }

  private getRecommendations(health: SystemHealth): string[] {
    const recommendations: string[] = [];
    
    if (health.memory.percentage > 80) {
      recommendations.push('Consider optimizing memory usage or clearing caches');
    }
    
    if (health.storage.localStorage.percentage > 80) {
      recommendations.push('Clear localStorage or optimize data storage');
    }
    
    if (health.errors.count > 10) {
      recommendations.push('Review and resolve recent errors');
    }
    
    if (!health.network.online) {
      recommendations.push('Check network connectivity');
    }
    
    return recommendations;
  }
}

export const systemDiagnostics = new SystemDiagnostics();