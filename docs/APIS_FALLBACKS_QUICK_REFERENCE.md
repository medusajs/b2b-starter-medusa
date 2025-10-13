# APIs Fallbacks & Preloaders - Quick Reference

**Quick guide for implementing resilient APIs with fallbacks**

---

## 🔧 Backend - Using Fallback Wrapper

### Basic Usage

```typescript
import { withFallback } from '@/utils/fallback-wrapper'

const result = await withFallback({
  key: 'resource:123',
  ttlSec: 3600,      // 1 hour fresh
  graceSec: 10800,   // 3 hours stale
  call: async () => {
    const response = await fetch('https://api.example.com/resource/123')
    return response.json()
  },
})

// Check if stale
if (result.stale) {
  return { data: result.data, meta: { stale: true } }
}

return { data: result.data }
```

### With Circuit Breaker

```typescript
const result = await withFallback({
  key: 'pvlib:data:123',
  ttlSec: 21600,  // 6h
  graceSec: 86400, // 24h
  call: async () => callPvlibAPI(),
  circuit: {
    name: 'pvlib-api',
    failureThreshold: 5,
    openDurationMs: 60000,  // 1 minute
    halfOpenSuccesses: 3,
  },
})
```

### Custom Retry Logic

```typescript
const result = await withFallback({
  key: 'aneel:tariff:123',
  ttlSec: 86400,
  call: async () => callAneelAPI(),
  retries: 5,
  baseDelay: 500,
  jitter: true,
  timeoutMs: 10000,
  isRetryable: (error) => {
    // Custom retry logic
    return error.status >= 500 || error.code === 'ECONNRESET'
  },
})
```

---

## 🎨 Storefront - Degraded States

### Using DegradedBanner

```typescript
'use client'

import { useState } from 'react'
import { DegradedBanner } from '@/components/common/DegradedBanner'
import { httpClient } from '@/lib/http-client'

export function MyComponent() {
  const [data, setData] = useState(null)
  const [degraded, setDegraded] = useState(false)
  const [retrying, setRetrying] = useState(false)

  async function loadData() {
    const result = await httpClient.get('/store/resource')
    setData(result.data)
    setDegraded(result.stale || false)
  }

  async function handleRetry() {
    setRetrying(true)
    await loadData()
    setRetrying(false)
  }

  return (
    <>
      {degraded && (
        <DegradedBanner
          message="Exibindo dados estimados"
          onRetry={handleRetry}
          retrying={retrying}
        />
      )}
      {/* Render data */}
    </>
  )
}
```

### Using Loading Skeletons

```typescript
import { Suspense } from 'react'
import { ProductGridSkeleton } from '@/components/common/LoadingSkeleton'

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={12} />}>
      <ProductList />
    </Suspense>
  )
}
```

### Creating loading.tsx

```typescript
// app/[countryCode]/(main)/store/loading.tsx
import { ProductGridSkeleton } from '@/components/common/LoadingSkeleton'

export default function StoreLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProductGridSkeleton count={12} />
    </div>
  )
}
```

---

## 📊 Cache TTL Recommendations

| Resource Type | Fresh TTL | Grace TTL | Rationale |
|---------------|-----------|-----------|-----------|
| **Tariff Data** | 24h | 72h | Changes infrequently |
| **Weather/PVLib** | 6h | 24h | Weather-dependent |
| **Product Catalog** | 1h | 6h | Prices update hourly |
| **Product Details** | 1h | 6h | Inventory changes |
| **User Cart** | 5min | 30min | Frequent updates |
| **Static Content** | 7d | 30d | Rarely changes |

---

## 🔌 Circuit Breaker States

| State | Behavior | When to Use |
|-------|----------|-------------|
| **CLOSED** | Normal operation | Default state |
| **OPEN** | Fail fast | After N failures |
| **HALF_OPEN** | Testing recovery | After timeout |

### Configuration Guidelines

```typescript
{
  name: 'service-name',
  failureThreshold: 5,      // 3-10 depending on criticality
  openDurationMs: 60000,    // 30s-5min
  halfOpenSuccesses: 3,     // 2-5 successes to close
}
```

---

## 🧪 Testing Patterns

### Backend - Fallback Wrapper

```typescript
import { withFallback } from '@/utils/fallback-wrapper'
import { CacheManager } from '@/utils/cache-manager'

jest.mock('@/utils/cache-manager')

describe('My Service', () => {
  let mockCache: jest.Mocked<CacheManager>

  beforeEach(() => {
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
    } as any
    ;(CacheManager.getInstance as jest.Mock).mockReturnValue(mockCache)
  })

  it('should serve stale on failure', async () => {
    mockCache.get.mockResolvedValue({ id: 1, name: 'Cached' })
    
    const call = jest.fn().mockRejectedValue(new Error('Fail'))
    
    const result = await withFallback({
      key: 'test',
      ttlSec: 60,
      call,
      retries: 0,
    })

    expect(result.stale).toBe(true)
    expect(result.data).toEqual({ id: 1, name: 'Cached' })
  })
})
```

### Storefront - Degraded States

```typescript
import { render, screen } from '@testing-library/react'
import { DegradedBanner } from '@/components/common/DegradedBanner'

describe('DegradedBanner', () => {
  it('should show retry button', () => {
    const onRetry = jest.fn()
    
    render(
      <DegradedBanner
        message="Test message"
        onRetry={onRetry}
      />
    )

    const button = screen.getByRole('button', { name: /tentar novamente/i })
    expect(button).toBeInTheDocument()
  })
})
```

---

## 🚀 Performance Checklist

### Backend

- [ ] Timeout set on all external calls (3-5s)
- [ ] Retry only on 5xx/timeout/network errors
- [ ] Circuit breaker for critical upstreams
- [ ] Cache with stale-if-error enabled
- [ ] Error envelopes include `request_id`
- [ ] Metrics tracked (hit rate, failures)

### Storefront

- [ ] Preconnect to backend in layout
- [ ] Loading skeletons for Suspense boundaries
- [ ] Degraded banner for stale data
- [ ] Images optimized (priority, sizes, placeholder)
- [ ] Fonts preloaded with display: swap
- [ ] HTTP client handles 429 with Retry-After

---

## 📈 Monitoring

### Key Metrics

```typescript
// Backend health endpoint
{
  fallbacks: {
    'aneel-tariff': {
      total_calls: 1000,
      cache_hits: 850,
      stale_served: 50,
      hit_rate: 0.85,
    },
  },
  circuit_breakers: {
    'pvlib-api': {
      state: 'CLOSED',
      failures: 0,
    },
  },
}
```

### Alerts

- Circuit breaker OPEN for > 5 minutes
- Stale data served > 20% of requests
- Cache hit rate < 70%
- P95 latency > 2s

---

## 🔗 Related Documentation

- [Full Implementation Report](./APIS_FALLBACKS_PRELOADERS_COMPLETE.md)
- [Backend APIs 360°](../backend/docs/api/BACKEND_APIS_360_IMPLEMENTATION.md)
- [Storefront APIs 360°](../storefront/docs/testing/STOREFRONT_APIS_360_IMPLEMENTATION.md)
- [Circuit Breaker Source](../backend/src/utils/circuit-breaker.ts)
- [Fallback Wrapper Source](../backend/src/utils/fallback-wrapper.ts)
- [HTTP Client Source](../storefront/src/lib/http-client.ts)

---

**Questions?** Check the full implementation report or existing examples in the codebase.
