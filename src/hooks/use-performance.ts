
import { useState, useEffect, useCallback } from 'react';
import { performanceMonitor, type PerformanceMetric, type VitalMetrics } from '@/utils/performance-monitoring';

export interface PerformanceHookResult {
  metrics: PerformanceMetric[];
  vitals: Partial<VitalMetrics>;
  isLoading: boolean;
  refresh: () => void;
}

export function usePerformance(): PerformanceHookResult {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [vitals, setVitals] = useState<Partial<VitalMetrics>>({});
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setIsLoading(true);
    try {
      const currentMetrics = performanceMonitor.getMetrics();
      const currentVitals = performanceMonitor.getWebVitals();
      
      setMetrics(currentMetrics);
      setVitals(currentVitals);
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    refresh();

    // Set up periodic refresh
    const interval = setInterval(refresh, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [refresh]);

  return {
    metrics,
    vitals,
    isLoading,
    refresh,
  };
}

export function useComponentPerformance(componentName: string) {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [mountTime, setMountTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    setMountTime(startTime);

    return () => {
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      setRenderTime(totalTime);
      
      // Log performance if it's slow
      if (totalTime > 16) { // More than one frame (60fps)
        console.warn(`Component ${componentName} took ${totalTime}ms to render`);
      }
    };
  }, [componentName]);

  return {
    renderTime,
    mountTime,
  };
}
