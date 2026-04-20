// Performance optimizer stub
export const performanceOptimizer = {
  initialize: () => {
    if (import.meta.env.DEV) {
      console.log('Performance optimizer initialized');
    }
  }
};

export const initPerformanceOptimizations = () => {
  performanceOptimizer.initialize();
};

export default performanceOptimizer;
