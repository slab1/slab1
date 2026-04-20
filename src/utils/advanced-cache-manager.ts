import { ErrorHandler } from './error-handling';

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size
  enablePersistence?: boolean; // Store in localStorage
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export class AdvancedCacheManager<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: CacheConfig) {
    this.config = config;
    this.startCleanupInterval();
    
    if (config.enablePersistence) {
      this.loadFromStorage();
    }
  }

  set(key: string, data: T, customTtl?: number): void {
    try {
      const ttl = customTtl || this.config.ttl;
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        accessCount: 0,
        lastAccessed: Date.now(),
      };

      // Evict old entries if cache is full
      if (this.cache.size >= this.config.maxSize) {
        this.evictLeastRecentlyUsed();
      }

      this.cache.set(key, entry);

      if (this.config.enablePersistence) {
        this.saveToStorage(key, entry);
      }
    } catch (error) {
      ErrorHandler.handle(error, { context: 'AdvancedCacheManager.set', key });
    }
  }

  get(key: string): T | null {
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        return null;
      }

      const now = Date.now();
      
      // Check if entry has expired
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.removeFromStorage(key);
        return null;
      }

      // Update access statistics
      entry.accessCount++;
      entry.lastAccessed = now;

      return entry.data;
    } catch (error) {
      ErrorHandler.handle(error, { context: 'AdvancedCacheManager.get', key });
      return null;
    }
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.removeFromStorage(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const result = this.cache.delete(key);
    this.removeFromStorage(key);
    return result;
  }

  clear(): void {
    this.cache.clear();
    if (this.config.enablePersistence) {
      localStorage.removeItem(this.getStorageKey());
    }
  }

  getStats() {
    const entries = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      utilization: (this.cache.size / this.config.maxSize) * 100,
      avgAccessCount: entries.reduce((sum, entry) => sum + entry.accessCount, 0) / entries.length || 0,
      oldestEntry: Math.min(...entries.map(entry => entry.timestamp)) || Date.now(),
      newestEntry: Math.max(...entries.map(entry => entry.timestamp)) || Date.now(),
    };
  }

  private evictLeastRecentlyUsed(): void {
    let lruKey = '';
    let lruTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.removeFromStorage(lruKey);
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => {
        this.cache.delete(key);
        this.removeFromStorage(key);
      });
    }, Math.min(this.config.ttl / 4, 60000)); // Cleanup every quarter TTL or 1 minute max
  }

  private getStorageKey(): string {
    return `lovable_cache_${this.constructor.name}`;
  }

  private saveToStorage(key: string, entry: CacheEntry<T>): void {
    try {
      if (!this.config.enablePersistence) return;
      
      const storageKey = this.getStorageKey();
      const existing = JSON.parse(localStorage.getItem(storageKey) || '{}');
      existing[key] = entry;
      localStorage.setItem(storageKey, JSON.stringify(existing));
    } catch (error) {
      // Ignore storage errors - cache will still work in memory
    }
  }

  private removeFromStorage(key: string): void {
    try {
      if (!this.config.enablePersistence) return;
      
      const storageKey = this.getStorageKey();
      const existing = JSON.parse(localStorage.getItem(storageKey) || '{}');
      delete existing[key];
      localStorage.setItem(storageKey, JSON.stringify(existing));
    } catch (error) {
      // Ignore storage errors
    }
  }

  private loadFromStorage(): void {
    try {
      const storageKey = this.getStorageKey();
      const stored = localStorage.getItem(storageKey);
      if (!stored) return;

      const entries = JSON.parse(stored);
      const now = Date.now();

      for (const [key, entry] of Object.entries(entries)) {
        const cacheEntry = entry as CacheEntry<T>;
        // Only load non-expired entries
        if (now - cacheEntry.timestamp <= cacheEntry.ttl) {
          this.cache.set(key, cacheEntry);
        }
      }
    } catch (error) {
      // Ignore storage errors - start with empty cache
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Singleton instances for common use cases
export const restaurantCache = new AdvancedCacheManager({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 100,
  enablePersistence: true,
});

export const userCache = new AdvancedCacheManager({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 50,
  enablePersistence: false, // User data shouldn't be persisted
});

export const searchCache = new AdvancedCacheManager({
  ttl: 2 * 60 * 1000, // 2 minutes
  maxSize: 200,
  enablePersistence: true,
});