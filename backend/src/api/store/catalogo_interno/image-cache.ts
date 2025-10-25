/**
 * Image Cache Service
 * High-performance in-memory cache for images with pre-loading
 */

import fs from 'fs/promises';
import path from 'path';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    hits: number;
    ttl: number;
}

interface CacheStats {
    size: number;
    entries: number;
    hit_rate: number;
    total_hits: number;
    total_misses: number;
}

class ImageCacheService {
    private cache: Map<string, CacheEntry<any>>;
    private readonly MAX_SIZE = 1000; // Max cached entries
    private readonly DEFAULT_TTL = 3600000; // 1 hour in ms
    private totalHits = 0;
    private totalMisses = 0;
    private startTime = Date.now();

    constructor() {
        this.cache = new Map();
    }

    /**
     * Get item from cache
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            this.totalMisses++;
            return null;
        }

        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            this.totalMisses++;
            return null;
        }

        entry.hits++;
        this.totalHits++;
        return entry.data as T;
    }

    /**
     * Set item in cache
     */
    set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
        // Implement LRU eviction if cache is full
        if (this.cache.size >= this.MAX_SIZE && !this.cache.has(key)) {
            const oldestKey = this.findLeastRecentlyUsed();
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            hits: 0,
            ttl
        });
    }

    /**
     * Check if key exists in cache
     */
    has(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) return false;

        // Check expiration
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Clear entire cache
     */
    clear(): void {
        this.cache.clear();
        this.totalHits = 0;
        this.totalMisses = 0;
    }

    /**
     * Get cache statistics
     */
    getStats(): CacheStats {
        const total = this.totalHits + this.totalMisses;
        return {
            size: this.getSize(),
            entries: this.cache.size,
            hit_rate: total > 0 ? this.totalHits / total : 0,
            total_hits: this.totalHits,
            total_misses: this.totalMisses
        };
    }

    /**
     * Get cache size in bytes (approximate)
     */
    private getSize(): number {
        let size = 0;
        this.cache.forEach(entry => {
            size += JSON.stringify(entry.data).length;
        });
        return size;
    }

    /**
     * Find least recently used entry
     */
    private findLeastRecentlyUsed(): string | null {
        let oldestKey: string | null = null;
        let oldestTime = Date.now();

        this.cache.forEach((entry, key) => {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        });

        return oldestKey;
    }

    /**
     * Warm up cache with data
     */
    async warmUp(keys: string[], loader: (key: string) => Promise<any>): Promise<void> {
        const promises = keys.map(async key => {
            try {
                const data = await loader(key);
                this.set(key, data);
            } catch (error) {
                console.error(`Failed to warm up cache for key ${key}:`, error);
            }
        });

        await Promise.all(promises);
    }

    /**
     * Get uptime in seconds
     */
    getUptimeSeconds(): number {
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
}

// Singleton instance
let imageCacheInstance: ImageCacheService | null = null;

export function getImageCache(): ImageCacheService {
    if (!imageCacheInstance) {
        imageCacheInstance = new ImageCacheService();
    }
    return imageCacheInstance;
}

export default ImageCacheService;
