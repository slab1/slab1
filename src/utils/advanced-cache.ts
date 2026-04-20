// Advanced caching utility with TTL support
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class AdvancedCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
    };
  }

  getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number, tags?: string[]): Promise<T> {
    const cached = this.get<T>(key);
    if (cached) return Promise.resolve(cached);

    return fetcher().then(data => {
      this.set(key, data, ttl);
      return data;
    });
  }

  clearByTag(tag: string): void {
    this.invalidatePattern(tag);
  }
}

export const advancedCache = new AdvancedCache();
export const restaurantCache = new AdvancedCache(10 * 60 * 1000); // 10 minutes for restaurants
export const cacheUtils = {
  invalidate: (pattern: string) => advancedCache.invalidatePattern(pattern),
  clear: () => advancedCache.clear(),
  getStats: () => advancedCache.getStats(),
  generateKey: (...parts: (string | number | object)[]) => {
    return parts.map(p => typeof p === 'object' ? JSON.stringify(p) : String(p)).join(':');
  }
};
export default advancedCache;
