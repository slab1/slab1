
// Performance monitoring utilities
export const performanceUtils = {
  // Measure component render time
  measureRender: (componentName: string) => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      if (renderTime > 16) { // > 1 frame at 60fps
        console.warn(`[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`);
      }
    };
  },

  // Measure API call time
  measureApiCall: async <T>(apiCall: () => Promise<T>, callName: string): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const callTime = endTime - startTime;
      
      if (callTime > 1000) { // > 1 second
        console.warn(`[Performance] API call ${callName} took ${callTime.toFixed(2)}ms`);
      } else {
        console.log(`[Performance] API call ${callName} took ${callTime.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const callTime = endTime - startTime;
      console.error(`[Performance] API call ${callName} failed after ${callTime.toFixed(2)}ms:`, error);
      throw error;
    }
  },

  // Debounce function for search inputs
  debounce: <T extends (...args: any[]) => void>(func: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  },

  // Throttle function for scroll events
  throttle: <T extends (...args: any[]) => void>(func: T, limit: number): T => {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  }
};

// Memory leak detection
export const memoryMonitor = {
  logMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('[Memory]', {
        used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
      });
    }
  },

  startMonitoring: (interval: number = 30000) => {
    return setInterval(memoryMonitor.logMemoryUsage, interval);
  }
};
