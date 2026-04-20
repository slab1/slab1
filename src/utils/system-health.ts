import { supabase } from '@/integrations/supabase/client';
import { performanceMonitor } from './performance-monitoring';

export interface SystemHealthCheck {
  database: boolean;
  storage: boolean;
  auth: boolean;
  api: boolean;
  timestamp: Date;
  details: {
    databaseLatency?: number;
    storageLatency?: number;
    authLatency?: number;
  };
}

export class SystemHealthMonitor {
  private lastCheck: SystemHealthCheck | null = null;
  private checkInterval: number = 30000; // 30 seconds

  async performHealthCheck(): Promise<SystemHealthCheck> {
    const startTime = Date.now();
    const healthCheck: SystemHealthCheck = {
      database: false,
      storage: false,
      auth: false,
      api: false,
      timestamp: new Date(),
      details: {}
    };

    // Test database connection
    try {
      const dbStart = performance.now();
      const { error } = await supabase
        .from('restaurants')
        .select('id')
        .limit(1);
      
      healthCheck.database = !error;
      healthCheck.details.databaseLatency = performance.now() - dbStart;
    } catch {
      healthCheck.database = false;
    }

    // Test auth
    try {
      const authStart = performance.now();
      const { data } = await supabase.auth.getSession();
      healthCheck.auth = true;
      healthCheck.details.authLatency = performance.now() - authStart;
    } catch {
      healthCheck.auth = false;
    }

    // Test storage (if applicable)
    try {
      const storageStart = performance.now();
      const { data } = await supabase.storage.listBuckets();
      healthCheck.storage = !!data;
      healthCheck.details.storageLatency = performance.now() - storageStart;
    } catch {
      healthCheck.storage = false;
    }

    // Overall API health
    healthCheck.api = healthCheck.database && healthCheck.auth;

    // Track performance
    const duration = Date.now() - startTime;
    performanceMonitor.startMeasure('system_health_check');

    this.lastCheck = healthCheck;
    return healthCheck;
  }

  getLastHealthCheck(): SystemHealthCheck | null {
    return this.lastCheck;
  }

  startMonitoring(callback?: (health: SystemHealthCheck) => void): () => void {
    const interval = setInterval(async () => {
      const health = await this.performHealthCheck();
      callback?.(health);
    }, this.checkInterval);

    // Initial check
    this.performHealthCheck().then(health => callback?.(health));

    return () => clearInterval(interval);
  }

  isSystemHealthy(): boolean {
    if (!this.lastCheck) return true; // Assume healthy if no check yet
    
    return this.lastCheck.database && 
           this.lastCheck.auth && 
           this.lastCheck.api;
  }

  getSystemStatus(): 'healthy' | 'degraded' | 'unhealthy' {
    if (!this.lastCheck) return 'healthy';
    
    const { database, auth, storage, api } = this.lastCheck;
    
    if (database && auth && api) {
      return 'healthy';
    } else if (database || auth) {
      return 'degraded';
    } else {
      return 'unhealthy';
    }
  }
}

export const systemHealthMonitor = new SystemHealthMonitor();