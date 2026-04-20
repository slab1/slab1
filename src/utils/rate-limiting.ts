/**
 * Client-side rate limiting utilities
 * Note: This is for UX purposes only - server-side rate limiting is still required
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class ClientRateLimit {
  private limits: Map<string, RateLimitEntry> = new Map();
  
  private cleanExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now >= entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
  
  public checkLimit(identifier: string, config: RateLimitConfig): { allowed: boolean; retryAfter?: number } {
    this.cleanExpiredEntries();
    
    const now = Date.now();
    const entry = this.limits.get(identifier);
    
    if (!entry) {
      // First request for this identifier
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return { allowed: true };
    }
    
    if (now >= entry.resetTime) {
      // Window has expired, reset
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return { allowed: true };
    }
    
    if (entry.count >= config.maxRequests) {
      // Rate limit exceeded
      return { 
        allowed: false, 
        retryAfter: Math.ceil((entry.resetTime - now) / 1000) 
      };
    }
    
    // Increment counter
    entry.count++;
    return { allowed: true };
  }
  
  public reset(identifier: string): void {
    this.limits.delete(identifier);
  }
  
  public resetAll(): void {
    this.limits.clear();
  }
}

export const clientRateLimit = new ClientRateLimit();

// Common rate limiting configurations
export const RATE_LIMITS = {
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  search: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 requests per minute
  upload: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 uploads per minute
};

export function createRateLimitedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  identifier: string,
  config: RateLimitConfig
): T {
  return (async (...args: Parameters<T>) => {
    const result = clientRateLimit.checkLimit(identifier, config);
    
    if (!result.allowed) {
      throw new Error(`Rate limit exceeded. Try again in ${result.retryAfter} seconds.`);
    }
    
    return await fn(...args);
  }) as T;
}