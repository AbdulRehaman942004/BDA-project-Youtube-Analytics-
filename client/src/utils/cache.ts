/**
 * Frontend cache utility using localStorage
 * Provides caching for API responses with TTL
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class FrontendCache {
  private prefix = 'yt_trends_cache_';

  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(this.prefix + key);
      if (!cached) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();
      const age = now - entry.timestamp;

      // Check if entry has expired
      if (age > entry.ttl) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    try {
      const defaultTTL = 5 * 60 * 1000; // 5 minutes default
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || defaultTTL
      };

      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.error('Cache set error:', error);
      // If quota exceeded, clear old entries
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearOldEntries();
        try {
          localStorage.setItem(this.prefix + key, JSON.stringify({
            data,
            timestamp: Date.now(),
            ttl: ttl || 5 * 60 * 1000
          }));
        } catch (e) {
          console.error('Failed to cache after cleanup:', e);
        }
      }
    }
  }

  /**
   * Delete a specific cache entry
   */
  delete(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Clear expired entries
   */
  clearOldEntries(): void {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry: CacheEntry<any> = JSON.parse(cached);
            if (now - entry.timestamp > entry.ttl) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove invalid entries
          localStorage.removeItem(key);
        }
      }
    });
  }
}

// Export singleton instance
export const frontendCache = new FrontendCache();

// Cleanup expired entries on load
if (typeof window !== 'undefined') {
  frontendCache.clearOldEntries();
}

export default frontendCache;

