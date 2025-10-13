# Storefront APIs - Quick Start Guide

**Quick reference for developers consuming backend APIs**

---

## 🚀 Using the HTTP Client

### Basic Usage

```typescript
import { httpClient } from '@/lib/http-client'

// GET request
const products = await httpClient.get('/store/products')

// POST request
const quote = await httpClient.post('/store/quotes', {
  message: 'Hello',
  items: [{ id: '123', quantity: 10 }],
})

// With custom config
const data = await httpClient.get('/store/products', {
  timeoutMs: 10000,
  retries: 5,
  headers: {
    'x-publishable-api-key': 'pk_xxx',
  },
})
```

### Configuration Options

```typescript
interface HttpClientConfig {
  timeoutMs?: number        // Default: 30000 (30s)
  retries?: number          // Default: 3
  baseDelayMs?: number      // Default: 1000 (1s)
  jitter?: boolean          // Default: true
  headers?: Record<string, string>
}
```

### Error Handling

```typescript
import { NormalizedError } from '@/lib/http-client'

try {
  const data = await httpClient.get('/store/products')
} catch (error: NormalizedError) {
  console.error(`Error ${error.status}: ${error.message}`)
  console.error(`Code: ${error.code}`)
  console.error(`Request ID: ${error.request_id}`)
  
  if (error.status === 429) {
    console.log(`Retry after ${error.retry_after} seconds`)
  }
}
```

---

## 🧪 Writing Tests with Fake Timers

### Setup

```typescript
import { __setTestSleepFn, __resetSleepFn } from '@/lib/http-client'

describe('My Data Layer', () => {
  let fakeSleep: jest.Mock

  beforeEach(() => {
    // Replace real setTimeout with instant resolution
    fakeSleep = jest.fn(() => Promise.resolve())
    __setTestSleepFn(fakeSleep)
    
    // Mock fetch
    global.fetch = jest.fn()
  })

  afterEach(() => {
    __resetSleepFn()
    jest.clearAllMocks()
  })

  it('should retry on 500 error', async () => {
    // Arrange: Fail twice, succeed third time
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Error' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Error' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'success' }),
      })

    // Act
    const result = await myDataFunction()

    // Assert
    expect(result).toEqual({ data: 'success' })
    expect(global.fetch).toHaveBeenCalledTimes(3)
    expect(fakeSleep).toHaveBeenCalledTimes(2)
    
    // Verify backoff timing (no real delays!)
    expect(fakeSleep).toHaveBeenNthCalledWith(1, 1000)  // 1st retry: 1s
    expect(fakeSleep).toHaveBeenNthCalledWith(2, 2000)  // 2nd retry: 2s
  })

  it('should handle 429 rate limit', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Map([['Retry-After', '60']]),
        json: async () => ({ message: 'Rate limit' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'success' }),
      })

    await myDataFunction()

    // Verify it waited for Retry-After duration
    expect(fakeSleep).toHaveBeenCalledWith(60000)  // 60 seconds
  })
})
```

---

## 📝 Writing Pact Consumer Tests

### Basic Structure

```typescript
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'

pactWith(
  {
    consumer: 'ysh-storefront',
    provider: 'ysh-backend',
    port: 8080,
    pactfileWriteMode: 'update',
    dir: './pacts',
  },
  (provider) => {
    describe('My API Contract', () => {
      describe('GET /store/resource', () => {
        beforeEach(async () => {
          await provider.addInteraction({
            state: 'resource exists',
            uponReceiving: 'a request for resource',
            withRequest: {
              method: 'GET',
              path: '/store/resource',
              query: {
                limit: '20',
              },
              headers: {
                'x-publishable-api-key': Matchers.string('pk_test_xxx'),
              },
            },
            willRespondWith: {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
              },
              body: {
                data: Matchers.eachLike({
                  id: Matchers.string('res_123'),
                  name: Matchers.string('Resource Name'),
                }),
                count: Matchers.integer(10),
              },
            },
          })
        })

        it('returns list of resources', async () => {
          const response = await fetch(
            'http://localhost:8080/store/resource?limit=20',
            {
              headers: {
                'x-publishable-api-key': 'pk_test_xxx',
              },
            }
          )

          expect(response.status).toBe(200)
          const data = await response.json()
          expect(data.data).toBeDefined()
          expect(Array.isArray(data.data)).toBe(true)
        })
      })
    })
  }
)
```

### Running Pact Tests

```powershell
# Run consumer tests
npm run test:pact:consumer

# Publish to Pact Broker
npm run test:pact:publish
```

---

## 🛡️ Middleware Features

### UTM Parameters

UTM params are automatically captured and stored for 7 days:

```typescript
// User visits: /br/store?utm_source=google&utm_campaign=solar
// Cookie set: ysh_utm_params = {"utm_source":"google","utm_campaign":"solar"}
// Available for analytics tracking
```

### A/B Experiments

Users are automatically assigned to bucket A or B (50/50):

```typescript
// Cookie: ysh_exp_bucket = "A" or "B"
// Use in components:
import Cookies from 'js-cookie'

const bucket = Cookies.get('ysh_exp_bucket')
if (bucket === 'A') {
  // Show variant A
} else {
  // Show variant B
}
```

### Region Handling

URLs are automatically prefixed with country code:

```
/store → /br/store (redirect)
/products → /br/store (redirect + SEO)
/catalogo → /br/categories (redirect + SEO)
```

---

## 🔒 Security Best Practices

### Content Security Policy

Already configured in `next.config.js`:

- ✅ `object-src 'none'` - Prevents object/embed attacks
- ✅ No `unsafe-eval` in production
- ✅ Explicit image sources only
- ✅ Frame ancestors blocked

### Image Handling

```typescript
// ✅ Good: Use Next.js Image component
import Image from 'next/image'

<Image
  src="/images/product.jpg"
  alt="Product"
  width={500}
  height={500}
/>

// ❌ Bad: Direct img tag with external source
<img src="https://untrusted.com/image.svg" />
```

### API Keys

```typescript
// ✅ Good: Use environment variables
const headers = {
  'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
}

// ❌ Bad: Hardcoded keys
const headers = {
  'x-publishable-api-key': 'pk_live_abc123',
}
```

---

## 📊 Common Patterns

### Fetching Products

```typescript
import { httpClient } from '@/lib/http-client'
import { getAuthHeaders } from '@/lib/data/cookies'

export async function getProducts(regionId: string) {
  const headers = await getAuthHeaders()
  
  return httpClient.get('/store/products', {
    headers: {
      ...headers,
      'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
    },
    retries: 3,
    timeoutMs: 10000,
  })
}
```

### Handling Rate Limits

```typescript
import { NormalizedError } from '@/lib/http-client'
import { toast } from '@/components/ui/toast'

try {
  const data = await httpClient.get('/store/products')
} catch (error: NormalizedError) {
  if (error.status === 429) {
    toast.error(
      `Too many requests. Please try again in ${error.retry_after} seconds.`
    )
  } else {
    toast.error('Failed to load products. Please try again.')
  }
}
```

### Pagination

```typescript
export async function getProductsPaginated(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit
  
  const response = await httpClient.get('/store/products', {
    headers: {
      'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
    },
  })
  
  return {
    products: response.products,
    total: response.count,
    hasMore: response.count > offset + limit,
  }
}
```

---

## 🧪 Test Commands

```powershell
# Unit tests (fast, no Pact)
npm run test:unit

# Pact consumer tests
npm run test:pact:consumer

# Type checking
npm run type-check

# Build
npm run build

# E2E tests
npm run test:e2e
```

---

## 📖 Additional Resources

- [Full Implementation Report](./STOREFRONT_APIS_360_IMPLEMENTATION.md)
- [HTTP Client Source](../../src/lib/http-client.ts)
- [HTTP Client Tests](../../src/lib/__tests__/http-client.test.ts)
- [Pact Tests](../../src/pact/products-api.pact.test.ts)
- [Middleware](../../src/middleware.ts)

---

**Questions?** Check the implementation report or existing data layer examples in `src/lib/data/`
