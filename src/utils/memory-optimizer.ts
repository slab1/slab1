// Memory optimization utilities
import { errorTracker } from './error-tracking';
import { memoryMonitor } from './performance-monitoring';

export interface MemoryOptimizationConfig {
  enableAutomaticCleanup: boolean;
  memoryThreshold: number; // Percentage
  cleanupInterval: number; // milliseconds
  enableComponentCaching: boolean;
}

const defaultConfig: MemoryOptimizationConfig = {
  enableAutomaticCleanup: true,
  memoryThreshold: 80,
  cleanupInterval: 30000,
  enableComponentCaching: true,
};

class MemoryOptimizer {
  private config: MemoryOptimizationConfig;
  private componentCache = new Map<string, any>();
  private observers = new Set<PerformanceObserver>();
  private timeouts = new Set<NodeJS.Timeout>();
  private intervals = new Set<NodeJS.Timeout>();
  private eventListeners = new Map<EventTarget, Array<{ event: string; handler: EventListener }>>();

  constructor(config: Partial<MemoryOptimizationConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.initialize();
  }

  private initialize(): void {
    if (this.config.enableAutomaticCleanup) {
      this.startAutomaticCleanup();
    }
    
    this.setupMemoryMonitoring();
    this.patchMemoryIntensiveAPIs();
  }

  private startAutomaticCleanup(): void {
    const interval = setInterval(() => {
      this.performCleanup();
    }, this.config.cleanupInterval);
    
    this.intervals.add(interval);
  }

  private setupMemoryMonitoring(): void {
    // Monitor DOM nodes
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        let addedNodes = 0;
        mutations.forEach(mutation => {
          addedNodes += mutation.addedNodes.length;
        });
        
        // If too many nodes added, suggest cleanup
        if (addedNodes > 50) {
          this.scheduleCleanup();
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  private patchMemoryIntensiveAPIs(): void {
    // Track timeouts and intervals without patching globals to avoid TypeScript issues
    const originalSetTimeout = window.setTimeout.bind(window);
    const originalSetInterval = window.setInterval.bind(window);
    
    // Override in a way that preserves type safety
    const timeoutTracker = (handler: (...args: any[]) => void, timeout?: number, ...args: any[]) => {
      const timeoutId = originalSetTimeout(() => {
        this.timeouts.delete(timeoutId as any);
        handler(...args);
      }, timeout);
      
      this.timeouts.add(timeoutId as any);
      return timeoutId;
    };

    const intervalTracker = (handler: (...args: any[]) => void, timeout?: number, ...args: any[]) => {
      const intervalId = originalSetInterval(handler, timeout, ...args);
      this.intervals.add(intervalId as any);
      return intervalId;
    };

    // Store references for potential future use without breaking types
    (window as any).__trackedSetTimeout = timeoutTracker;
    (window as any).__trackedSetInterval = intervalTracker;

    // Patch addEventListener to track event listeners
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(event: string, handler: EventListener, options?: any) {
      if (!memoryOptimizer.eventListeners.has(this)) {
        memoryOptimizer.eventListeners.set(this, []);
      }
      memoryOptimizer.eventListeners.get(this)!.push({ event, handler });
      
      return originalAddEventListener.call(this, event, handler, options);
    };
  }

  public scheduleCleanup(): void {
    // Debounce cleanup calls
    setTimeout(() => {
      this.performCleanup();
    }, 1000);
  }

  public performCleanup(): void {
    try {
      const memoryInfo = memoryMonitor.getMemoryUsage();
      
      if (!memoryInfo) return;
      
      const memoryPercentage = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
      
      if (memoryPercentage < this.config.memoryThreshold) {
        return; // No cleanup needed
      }

      console.log(`Starting memory cleanup - Usage: ${memoryPercentage.toFixed(2)}%`);
      
      // Clear component cache
      if (this.config.enableComponentCaching) {
        this.clearComponentCache();
      }
      
      // Clear unused DOM references
      this.clearDOMReferences();
      
      // Clear old event listeners
      this.clearStaleEventListeners();
      
      // Force garbage collection if available
      if ('gc' in window && typeof (window as any).gc === 'function') {
        (window as any).gc();
      }
      
      // Log cleanup results
      setTimeout(() => {
        const newMemoryInfo = memoryMonitor.getMemoryUsage();
        if (newMemoryInfo) {
          const newPercentage = (newMemoryInfo.usedJSHeapSize / newMemoryInfo.jsHeapSizeLimit) * 100;
          const reduction = memoryPercentage - newPercentage;
          
          console.log(`Memory cleanup completed - New usage: ${newPercentage.toFixed(2)}% (${reduction.toFixed(2)}% reduction)`);
          
          errorTracker.captureError(
            `Memory cleanup performed: ${reduction.toFixed(2)}% reduction`,
            'info',
            { 
              before: memoryPercentage, 
              after: newPercentage, 
              reduction,
              type: 'memory_cleanup'
            }
          );
        }
      }, 1000);
      
    } catch (error) {
      console.error('Memory cleanup failed:', error);
      errorTracker.captureError(
        error instanceof Error ? error : new Error(String(error)),
        'warning',
        { type: 'cleanup_error' }
      );
    }
  }

  private clearComponentCache(): void {
    const cacheSize = this.componentCache.size;
    
    // Clear half of the cache (oldest entries)
    const entries = Array.from(this.componentCache.entries());
    const entriesToRemove = entries.slice(0, Math.floor(entries.length / 2));
    
    entriesToRemove.forEach(([key]) => {
      this.componentCache.delete(key);
    });
    
    console.log(`Cleared ${entriesToRemove.length} component cache entries (${cacheSize} -> ${this.componentCache.size})`);
  }

  private clearDOMReferences(): void {
    // Remove orphaned DOM elements
    const orphanedElements = document.querySelectorAll('[data-cleanup]');
    orphanedElements.forEach(element => {
      element.remove();
    });
    
    // Clear any global DOM references
    if (typeof window !== 'undefined' && 'domCache' in window) {
      (window as any).domCache?.clear?.();
    }
  }

  private clearStaleEventListeners(): void {
    let removedListeners = 0;
    
    this.eventListeners.forEach((listeners, target) => {
      // Check if target is still connected to DOM
      if (target instanceof Element && !target.isConnected) {
        listeners.forEach(({ event, handler }) => {
          try {
            target.removeEventListener(event, handler);
            removedListeners++;
          } catch (error) {
            // Ignore errors when removing listeners
          }
        });
        this.eventListeners.delete(target);
      }
    });
    
    if (removedListeners > 0) {
      console.log(`Removed ${removedListeners} stale event listeners`);
    }
  }

  public cacheComponent(key: string, component: any): void {
    if (!this.config.enableComponentCaching) return;
    
    // Limit cache size
    if (this.componentCache.size > 100) {
      const firstKey = this.componentCache.keys().next().value;
      this.componentCache.delete(firstKey);
    }
    
    this.componentCache.set(key, component);
  }

  public getCachedComponent(key: string): any {
    return this.componentCache.get(key);
  }

  public getMemoryStats(): {
    componentCacheSize: number;
    activeTimeouts: number;
    activeIntervals: number;
    trackedEventListeners: number;
    memoryUsage: any;
  } {
    return {
      componentCacheSize: this.componentCache.size,
      activeTimeouts: this.timeouts.size,
      activeIntervals: this.intervals.size,
      trackedEventListeners: Array.from(this.eventListeners.values()).reduce((sum, listeners) => sum + listeners.length, 0),
      memoryUsage: memoryMonitor.getMemoryUsage(),
    };
  }

  public cleanup(): void {
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    
    // Clear all timeouts
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
    
    // Clear caches
    this.componentCache.clear();
    
    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // Clear event listeners
    this.eventListeners.clear();
  }
}

// Create singleton instance
export const memoryOptimizer = new MemoryOptimizer();

// React hook for memory optimization
export function useMemoryOptimizer() {
  return {
    performCleanup: () => memoryOptimizer.performCleanup(),
    scheduleCleanup: () => memoryOptimizer.scheduleCleanup(),
    cacheComponent: (key: string, component: any) => memoryOptimizer.cacheComponent(key, component),
    getCachedComponent: (key: string) => memoryOptimizer.getCachedComponent(key),
    getMemoryStats: () => memoryOptimizer.getMemoryStats(),
  };
}

// Initialize memory optimization
if (typeof window !== 'undefined') {
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    memoryOptimizer.cleanup();
  });
  
  // Monitor for memory pressure
  if ('memory' in performance) {
    memoryMonitor.trackMemoryLeaks();
  }
}