/**
 * 🗄️ Distributed Cache Manager (Redis)
 * 
 * Provides a unified caching interface using Redis for distributed caching.
 * Supports TTL, invalidation patterns, and automatic JSON serialization.
 * 
 * Falls back to in-memory cache if Redis is unavailable.
 * 
 * @module lib/cache/redis
 */

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
    // Default TTLs in seconds
    DEFAULT_TTL: 3600, // 1 hour
    PRODUCTS_TTL: 3600, // 1 hour
    KITS_TTL: 3600, // 1 hour
    CATEGORIES_TTL: 7200, // 2 hours
    DISTRIBUTORS_TTL: 7200, // 2 hours
    SEARCH_TTL: 1800, // 30 minutes
    FEATURED_TTL: 3600, // 1 hour

    // Redis connection
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,

    // Key prefix for namespacing
    KEY_PREFIX: 'ysh:api:',

    // Fallback to in-memory cache
    USE_REDIS: process.env.USE_REDIS !== 'false'
}

/**
 * In-memory cache fallback
 */
class InMemoryCache {
    private cache = new Map<string, { data: any; expires: number }>()

    async get<T>(key: string): Promise<T | null> {
        const entry = this.cache.get(key)
        if (!entry) return null

        if (Date.now() > entry.expires) {
            this.cache.delete(key)
            return null
        }

        return entry.data as T
    }

    async set(key: string, value: any, ttl: number): Promise<void> {
        this.cache.set(key, {
            data: value,
            expires: Date.now() + ttl * 1000
        })
    }

    async del(...keys: string[]): Promise<void> {
        keys.forEach(key => this.cache.delete(key))
    }

    async keys(pattern: string): Promise<string[]> {
        const regex = new RegExp(
            '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
        )
        return Array.from(this.cache.keys()).filter(key => regex.test(key))
    }

    async flushdb(): Promise<void> {
        this.cache.clear()
    }

    async ping(): Promise<string> {
        return 'PONG'
    }
}

/**
 * Redis client singleton
 */
let redisClient: InMemoryCache | null = null

/**
 * Initialize Redis client
 * 
 * Note: Currently using in-memory cache.
 * To enable Redis, install ioredis and uncomment Redis code.
 */
function getRedisClient(): InMemoryCache {
    if (redisClient) return redisClient

    // For now, always use in-memory cache
    // To enable Redis:
    // 1. npm install ioredis
    // 2. Uncomment Redis import and implementation
    // 3. Set USE_REDIS=true in .env

    console.log('[Cache] Using in-memory cache')
    redisClient = new InMemoryCache()
    return redisClient

    /* Redis implementation (uncomment after installing ioredis):
    
    import { Redis } from 'ioredis'
    
    if (!CACHE_CONFIG.USE_REDIS) {
      console.log('[Cache] Using in-memory cache (Redis disabled)')
      redisClient = new InMemoryCache()
      return redisClient
    }
    
    try {
      const redis = new Redis(CACHE_CONFIG.REDIS_URL, {
        password: CACHE_CONFIG.REDIS_PASSWORD,
        lazyConnect: true,
        retryStrategy(times: number) {
          const delay = Math.min(times * 50, 2000)
          return delay
        },
        maxRetriesPerRequest: 3
      })
      
      redis.on('error', (err: Error) => {
        console.error('[Cache] Redis error:', err)
        redis.disconnect()
        redisClient = new InMemoryCache()
      })
      
      redis.on('connect', () => {
        console.log('[Cache] Redis connected')
      })
      
      redisClient = redis as any
      return redisClient
    } catch (error) {
      console.error('[Cache] Failed to initialize Redis:', error)
      redisClient = new InMemoryCache()
      return redisClient
    }
    */
}/**
 * Cache Manager
 */
export class CacheManager {
    private static client = getRedisClient()

    /**
     * Build cache key with prefix
     */
    private static buildKey(key: string): string {
        return `${CACHE_CONFIG.KEY_PREFIX}${key}`
    }

    /**
     * Get value from cache
     */
    static async get<T>(key: string): Promise<T | null> {
        try {
            const fullKey = this.buildKey(key)
            const cached = await this.client.get<string>(fullKey)

            if (!cached) return null

            return JSON.parse(cached) as T
        } catch (error) {
            console.error('[Cache] Get error:', error)
            return null
        }
    }

    /**
     * Set value in cache with TTL
     */
    static async set<T>(
        key: string,
        value: T,
        ttl: number = CACHE_CONFIG.DEFAULT_TTL
    ): Promise<void> {
        try {
            const fullKey = this.buildKey(key)
            const serialized = JSON.stringify(value)

            // Always use InMemoryCache interface
            await this.client.set(fullKey, serialized, ttl)
        } catch (error) {
            console.error('[Cache] Set error:', error)
        }
    }

    /**
     * Delete specific keys
     */
    static async del(...keys: string[]): Promise<void> {
        try {
            const fullKeys = keys.map(k => this.buildKey(k))
            await this.client.del(...fullKeys)
        } catch (error) {
            console.error('[Cache] Delete error:', error)
        }
    }

    /**
     * Invalidate by pattern (e.g., "products:*")
     */
    static async invalidate(pattern: string): Promise<number> {
        try {
            const fullPattern = this.buildKey(pattern)
            const keys = await this.client.keys(fullPattern)

            if (keys.length === 0) return 0

            await this.client.del(...keys)
            return keys.length
        } catch (error) {
            console.error('[Cache] Invalidate error:', error)
            return 0
        }
    }

    /**
     * Invalidate all cache
     */
    static async invalidateAll(): Promise<void> {
        try {
            await this.client.flushdb()
        } catch (error) {
            console.error('[Cache] Invalidate all error:', error)
        }
    }

    /**
     * Get or set pattern (cache-aside)
     */
    static async getOrSet<T>(
        key: string,
        factory: () => Promise<T>,
        ttl: number = CACHE_CONFIG.DEFAULT_TTL
    ): Promise<T> {
        // Try to get from cache
        const cached = await this.get<T>(key)
        if (cached !== null) {
            return cached
        }

        // Generate value
        const value = await factory()

        // Store in cache
        await this.set(key, value, ttl)

        return value
    }

    /**
     * Check cache health
     */
    static async health(): Promise<boolean> {
        try {
            const result = await this.client.ping()
            return result === 'PONG'
        } catch (error) {
            return false
        }
    }

    /**
     * Get cache statistics
     */
    static async stats(): Promise<{
        type: 'redis' | 'memory'
        connected: boolean
        keys?: number
    }> {
        try {
            const connected = await this.health()
            const pattern = this.buildKey('*')
            const keys = await this.client.keys(pattern)

            return {
                type: 'memory', // Always memory for now
                connected,
                keys: keys.length
            }
        } catch (error) {
            return {
                type: 'memory',
                connected: false
            }
        }
    }
}

/**
 * Cache key builders for different resources
 */
export const CacheKeys = {
    products: (category: string, filters?: Record<string, any>) => {
        const filterStr = filters ? `:${JSON.stringify(filters)}` : ''
        return `products:${category}${filterStr}`
    },

    product: (id: string) => `product:${id}`,

    kits: (filters?: Record<string, any>) => {
        const filterStr = filters ? `:${JSON.stringify(filters)}` : ''
        return `kits${filterStr}`
    },

    kit: (id: string) => `kit:${id}`,

    categories: () => 'categories',

    distributors: () => 'distributors',

    search: (query: string, category?: string) => {
        const categoryStr = category ? `:${category}` : ''
        return `search:${query}${categoryStr}`
    },

    featured: () => 'featured'
}

/**
 * TTL constants for different resource types
 */
export const CacheTTL = {
    PRODUCTS: CACHE_CONFIG.PRODUCTS_TTL,
    KITS: CACHE_CONFIG.KITS_TTL,
    CATEGORIES: CACHE_CONFIG.CATEGORIES_TTL,
    DISTRIBUTORS: CACHE_CONFIG.DISTRIBUTORS_TTL,
    SEARCH: CACHE_CONFIG.SEARCH_TTL,
    FEATURED: CACHE_CONFIG.FEATURED_TTL
}
