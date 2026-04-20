
// Centralized API integration layer with error handling and caching
import { supabase } from '@/integrations/supabase/client';
import { errorTracker } from './error-tracking';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  key: string;
}

class ApiIntegration {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  // Generic API call with caching and error handling
  async apiCall<T>(
    operation: () => Promise<T>,
    cacheConfig?: CacheConfig
  ): Promise<ApiResponse<T>> {
    try {
      // Check cache first
      if (cacheConfig) {
        const cached = this.getFromCache(cacheConfig.key);
        if (cached) {
          return { data: cached, error: null, loading: false };
        }
      }

      const data = await operation();

      // Store in cache
      if (cacheConfig) {
        this.setCache(cacheConfig.key, data, cacheConfig.ttl);
      }

      return { data, error: null, loading: false };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errorTracker.captureError(errorMessage, 'error', { operation: operation.name });
      return { data: null, error: errorMessage, loading: false };
    }
  }

  // Retry mechanism for failed API calls
  async retryApiCall<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
      }
    }

    throw lastError!;
  }

  // Batch API calls
  async batchApiCalls<T>(operations: Array<() => Promise<T>>): Promise<ApiResponse<T>[]> {
    const results = await Promise.allSettled(operations.map(op => op()));
    
    return results.map(result => {
      if (result.status === 'fulfilled') {
        return { data: result.value, error: null, loading: false };
      } else {
        return { data: null, error: result.reason.message, loading: false };
      }
    });
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

export const apiIntegration = new ApiIntegration();
