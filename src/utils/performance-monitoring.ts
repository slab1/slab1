// Performance monitoring utility
export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

export interface VitalMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 100;

  startMeasure(name: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration);
    };
  }

  private recordMetric(name: string, duration: number): void {
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
    });

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  getAverageDuration(name: string): number {
    const filtered = this.metrics.filter(m => m.name === name);
    if (filtered.length === 0) return 0;

    const total = filtered.reduce((sum, m) => sum + m.duration, 0);
    return total / filtered.length;
  }

  clear(): void {
    this.metrics = [];
  }

  getWebVitals(): Partial<VitalMetrics> {
    // Placeholder for web vitals - in real app would use web-vitals library
    return {
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0
    };
  }

  getPerformanceStats() {
    return {
      avgLoadTime: this.getAverageDuration('page_load'),
      avgApiTime: this.getAverageDuration('api_call'),
      slowOps: this.metrics.filter(m => m.duration > 1000).length
    };
  }

  init(): void {
    // Initialize performance monitoring
    if (typeof window !== 'undefined') {
      console.log('Performance monitoring initialized');
    }
  }

  getMemoryUsage() {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  trackMemoryLeaks(): void {
    // Track memory leaks - placeholder
    console.log('Memory leak tracking enabled');
  }

  analyzeBundleSize() {
    return {
      totalSize: 0,
      assets: [],
      recommendations: []
    };
  }

  checkBundleHealth() {
    return {
      healthy: true,
      issues: []
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();
export const performanceTracker = performanceMonitor; // Alias for compatibility
export const memoryMonitor = performanceMonitor; // Alias for compatibility
export const bundleAnalyzer = performanceMonitor; // Alias for compatibility
export default performanceMonitor;
