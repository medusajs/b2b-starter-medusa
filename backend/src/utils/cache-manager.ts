/**
 * 🗄️ YSH API Cache Manager
 * Redis-based distributed caching for API responses and data
 */

import Redis from 'ioredis';

// ============================================================================
// Cache Configuration
// ============================================================================

export interface CacheConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
    keyPrefix: string;
    defaultTTL: number; // in seconds
    compression: boolean;
}

const defaultConfig: CacheConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    keyPrefix: 'ysh:solar-cv:',
    defaultTTL: 3600, // 1 hour
    compression: true,
};

// ============================================================================
// Cache Key Generator
// ============================================================================

export class CacheKeyGenerator {
    static solarDetection(lat: number, lon: number, zoom: number): string {
        return `solar-detection:${lat.toFixed(6)}:${lon.toFixed(6)}:${zoom}`;
    }

    static thermalAnalysis(imageHash: string): string {
        return `thermal-analysis:${imageHash}`;
    }

    static photogrammetry(projectName: string, imageCount: number): string {
        return `photogrammetry:${projectName}:${imageCount}`;
    }

    static healthCheck(service: string): string {
        return `health:${service}`;
    }

    static withPrefix(key: string, prefix?: string): string {
        const keyPrefix = prefix || defaultConfig.keyPrefix;
        return `${keyPrefix}${key}`;
    }
}

// ============================================================================
// Cache Manager
// ============================================================================

export class CacheManager {
    private static instance: CacheManager;
    private redis: Redis;
    private config: CacheConfig;

    private constructor(config: Partial<CacheConfig> = {}) {
        this.config = { ...defaultConfig, ...config };
        this.redis = new Redis({
            host: this.config.host,
            port: this.config.port,
            password: this.config.password,
            db: this.config.db,
            lazyConnect: true,
        }); this.setupEventHandlers();
    }

    static getInstance(config?: Partial<CacheConfig>): CacheManager {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager(config);
        }
        return CacheManager.instance;
    }

    // ============================================================================
    // Core Cache Operations
    // ============================================================================

    async get<T>(key: string): Promise<T | null> {
        try {
            const fullKey = CacheKeyGenerator.withPrefix(key);
            const data = await this.redis.get(fullKey);

            if (!data) return null;

            return this.config.compression
                ? this.decompress(JSON.parse(data))
                : JSON.parse(data);
        } catch (error) {
            console.warn('[Cache] Get error:', error);
            return null;
        }
    }

    async set<T>(
        key: string,
        value: T,
        ttl?: number
    ): Promise<void> {
        try {
            const fullKey = CacheKeyGenerator.withPrefix(key);
            const serialized = this.config.compression
                ? JSON.stringify(this.compress(value))
                : JSON.stringify(value);

            const expiry = ttl || this.config.defaultTTL;
            await this.redis.setex(fullKey, expiry, serialized);
        } catch (error) {
            console.warn('[Cache] Set error:', error);
        }
    }

    async delete(key: string): Promise<void> {
        try {
            const fullKey = CacheKeyGenerator.withPrefix(key);
            await this.redis.del(fullKey);
        } catch (error) {
            console.warn('[Cache] Delete error:', error);
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            const fullKey = CacheKeyGenerator.withPrefix(key);
            const result = await this.redis.exists(fullKey);
            return result === 1;
        } catch (error) {
            console.warn('[Cache] Exists error:', error);
            return false;
        }
    }

    async clear(pattern?: string): Promise<void> {
        try {
            const fullPattern = pattern
                ? CacheKeyGenerator.withPrefix(pattern)
                : CacheKeyGenerator.withPrefix('*');

            // Use SCAN instead of KEYS to avoid blocking Redis in production
            const keysToDelete: string[] = [];
            let cursor = '0';
            const batchSize = 100;

            do {
                const [nextCursor, keys] = await this.redis.scan(
                    cursor,
                    'MATCH',
                    fullPattern,
                    'COUNT',
                    batchSize
                );
                cursor = nextCursor;
                keysToDelete.push(...keys);

                // Delete in batches to avoid memory issues
                if (keysToDelete.length >= batchSize) {
                    const batch = keysToDelete.splice(0, batchSize);
                    if (batch.length > 0) {
                        await this.redis.del(...batch);
                    }
                }
            } while (cursor !== '0');

            // Delete remaining keys
            if (keysToDelete.length > 0) {
                await this.redis.del(...keysToDelete);
            }
        } catch (error) {
            console.warn('[Cache] Clear error:', error);
        }
    }

    // ============================================================================
    // Advanced Operations
    // ============================================================================

    async getOrSet<T>(
        key: string,
        factory: () => Promise<T>,
        ttl?: number
    ): Promise<T> {
        let value = await this.get<T>(key);
        if (value !== null) {
            return value;
        }

        value = await factory();
        await this.set(key, value, ttl);
        return value;
    }

    async invalidateByPattern(pattern: string): Promise<void> {
        await this.clear(pattern);
    }

    // ============================================================================
    // Health and Monitoring
    // ============================================================================

    async ping(): Promise<boolean> {
        try {
            const result = await this.redis.ping();
            return result === 'PONG';
        } catch {
            return false;
        }
    }

    async getStats(): Promise<{
        connected: boolean;
        dbSize: number;
        memory: any;
    }> {
        try {
            const [dbSize, memory] = await Promise.all([
                this.redis.dbsize(),
                this.redis.info('memory'),
            ]);

            return {
                connected: true,
                dbSize,
                memory: this.parseRedisInfo(memory),
            };
        } catch {
            return {
                connected: false,
                dbSize: 0,
                memory: null,
            };
        }
    }

    // ============================================================================
    // Private Methods
    // ============================================================================

    private setupEventHandlers(): void {
        this.redis.on('connect', () => {
            console.log('[Cache] Connected to Redis');
        });

        this.redis.on('error', (error) => {
            console.error('[Cache] Redis error:', error);
        });

        this.redis.on('ready', () => {
            console.log('[Cache] Redis ready');
        });
    }

    private compress(data: any): any {
        // Simple compression - in production, use a proper compression library
        // For now, just return as-is since JSON is already compressed
        return data;
    }

    private decompress(data: any): any {
        return data;
    }

    private parseRedisInfo(info: string): any {
        const lines = info.split('\r\n');
        const result: any = {};

        lines.forEach(line => {
            if (line.includes(':')) {
                const [key, value] = line.split(':');
                result[key] = value;
            }
        });

        return result;
    }

    // ============================================================================
    // Cleanup
    // ============================================================================

    async disconnect(): Promise<void> {
        await this.redis.disconnect();
    }
}

// ============================================================================
// Cache Decorators
// ============================================================================

export function cached(ttl?: number) {
    return function (
        target: any,
        propertyName: string,
        descriptor: PropertyDescriptor
    ) {
        const method = descriptor.value;
        const cache = CacheManager.getInstance();

        descriptor.value = async function (...args: any[]) {
            const key = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;

            return cache.getOrSet(
                key,
                () => method.apply(this, args),
                ttl
            );
        };
    };
}

export function cacheInvalidate(pattern: string) {
    return function (
        target: any,
        propertyName: string,
        descriptor: PropertyDescriptor
    ) {
        const method = descriptor.value;
        const cache = CacheManager.getInstance();

        descriptor.value = async function (...args: any[]) {
            const result = await method.apply(this, args);
            await cache.invalidateByPattern(pattern);
            return result;
        };
    };
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const cacheManager = CacheManager.getInstance();