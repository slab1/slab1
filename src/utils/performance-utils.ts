// Performance utilities
export const measurePerformance = <T>(
  name: string,
  fn: () => T
): T => {
  const startTime = performance.now();
  const result = fn();
  const duration = performance.now() - startTime;
  
  if (duration > 100) {
    console.warn(`Performance: ${name} took ${duration.toFixed(2)}ms`);
  }
  
  return result;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
