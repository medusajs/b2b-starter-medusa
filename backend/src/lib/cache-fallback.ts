/**
 * Cache Fallback - stale-if-error
 */

export interface CacheConfig {
  ttl: number
  grace: number
  key: string
}

export interface CachedData<T> {
  data: T
  expires_at: number
  grace_until: number
}

export interface FetchResult<T> {
  data: T
  meta: {
    stale: boolean
    source: 'fresh' | 'cache' | 'fallback'
  }
}

export async function fetchWithFallback<T>(
  cache: any,
  config: CacheConfig,
  fetchFn: () => Promise<T>
): Promise<FetchResult<T>> {
  const now = Date.now()
  const cached = await cache.get<CachedData<T>>(config.key)
  
  if (cached && now < cached.expires_at) {
    return { data: cached.data, meta: { stale: false, source: 'cache' } }
  }
  
  if (cached && now < cached.grace_until) {
    try {
      const fresh = await fetchFn()
      await cache.set(config.key, {
        data: fresh,
        expires_at: now + config.ttl,
        grace_until: now + config.ttl + config.grace
      }, config.ttl + config.grace)
      return { data: fresh, meta: { stale: false, source: 'fresh' } }
    } catch (error) {
      console.warn(`[Cache] Using stale for ${config.key}`)
      return { data: cached.data, meta: { stale: true, source: 'fallback' } }
    }
  }
  
  const fresh = await fetchFn()
  await cache.set(config.key, {
    data: fresh,
    expires_at: now + config.ttl,
    grace_until: now + config.ttl + config.grace
  }, config.ttl + config.grace)
  return { data: fresh, meta: { stale: false, source: 'fresh' } }
}

export const CACHE_CONFIGS = {
  ANEEL_TARIFFS: { ttl: 86400000, grace: 604800000 },
  SOLAR_CALCULATOR: { ttl: 3600000, grace: 86400000 },
  CATALOG: { ttl: 3600000, grace: 43200000 }
}
