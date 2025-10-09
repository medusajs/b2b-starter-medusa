# 🚀 API Improvements Implementation Guide

**Data**: 07 de outubro de 2025  
**Projeto**: YSH Store - Storefront API Modernization  
**Status**: ✅ Fundação Implementada

---

## 📦 Arquivos Criados

### 1. **API Response Builder** ✅

**Arquivo**: `src/lib/api/response.ts`

**Funcionalidades**:

- ✅ Standardized `APIResponse<T>` type
- ✅ Success/error response builders
- ✅ Request ID tracking (auto-generated ou from headers)
- ✅ Response time tracking
- ✅ Type-safe error codes
- ✅ Helper methods (validationError, notFound, rateLimitExceeded, etc.)
- ✅ Development stack traces

**Uso**:

```typescript
import { createResponseBuilder } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  const response = createResponseBuilder(request)
  
  try {
    const data = await fetchData()
    return response.success(data)
  } catch (error) {
    return response.error('INTERNAL_ERROR', error.message)
  }
}
```

---

### 2. **Input Validation with Zod** ✅

**Arquivo**: `src/lib/api/validation.ts`

**Schemas Definidos**:

- ✅ `ProductsQuerySchema` - Validates product queries
- ✅ `KitsQuerySchema` - Validates kit queries
- ✅ `SearchQuerySchema` - Validates search queries
- ✅ `SolarSimulationSchema` - Validates simulation inputs
- ✅ `GeocodingSchema` - Validates geocoding requests
- ✅ `PaginationSchema` - Reusable pagination
- ✅ Custom refinements (minPrice ≤ maxPrice)

**Helper Functions**:

- ✅ `validateQuery()` - Validate URLSearchParams
- ✅ `validateBody()` - Validate JSON body
- ✅ `validateParams()` - Validate path params
- ✅ `formatZodError()` - Format errors for API response

**Uso**:

```typescript
import { validateQuery, ProductsQuerySchema, formatZodError } from '@/lib/api/validation'

const validation = validateQuery(ProductsQuerySchema, searchParams)

if (!validation.success) {
  return response.validationError(
    'Invalid query parameters',
    formatZodError(validation.error)
  )
}

const { category, limit, offset } = validation.data // Type-safe!
```

---

### 3. **Cache Manager** ✅

**Arquivo**: `src/lib/cache/redis.ts`

**Funcionalidades**:

- ✅ In-memory cache implementation (ready for Redis upgrade)
- ✅ TTL support (configurable per resource type)
- ✅ Key namespacing (`ysh:api:...`)
- ✅ Pattern-based invalidation (`products:*`)
- ✅ Cache-aside pattern with `getOrSet()`
- ✅ Health checks
- ✅ Stats/monitoring

**Pre-configured TTLs**:

```typescript
export const CacheTTL = {
  PRODUCTS: 3600,      // 1 hour
  KITS: 3600,          // 1 hour
  CATEGORIES: 7200,    // 2 hours
  DISTRIBUTORS: 7200,  // 2 hours
  SEARCH: 1800,        // 30 minutes
  FEATURED: 3600       // 1 hour
}
```

**Key Builders**:

```typescript
export const CacheKeys = {
  products: (category, filters) => `products:${category}:${JSON.stringify(filters)}`,
  product: (id) => `product:${id}`,
  kits: (filters) => `kits:${JSON.stringify(filters)}`,
  // ... more builders
}
```

**Uso**:

```typescript
import { CacheManager, CacheKeys, CacheTTL } from '@/lib/cache/redis'

// Get or compute
const data = await CacheManager.getOrSet(
  CacheKeys.products('panels', { distributor: 'FOTUS' }),
  async () => loadProducts(...),
  CacheTTL.PRODUCTS
)

// Invalidate by pattern
await CacheManager.invalidate('products:*')
```

---

### 4. **Example Usage Guide** ✅

**Arquivo**: `src/lib/api/example.ts`

**Demonstra**:

- ✅ Complete GET endpoint with caching
- ✅ POST endpoint with body validation
- ✅ Error handling patterns
- ✅ Cache invalidation strategies
- ✅ Performance monitoring
- ✅ Request tracking

---

### 5. **Architecture Evaluation** ✅

**Arquivo**: `API_ARCHITECTURE_EVALUATION.md`

**Conteúdo**:

- ✅ Complete API inventory (11 storefront + backend)
- ✅ Cache strategy analysis
- ✅ Error handling review
- ✅ Response format analysis
- ✅ Security assessment
- ✅ Prioritized recommendations
- ✅ Implementation roadmap
- ✅ Cost estimates

---

## 🛠️ Próximos Passos

### Fase 1: Migrar Endpoints Existentes (ALTA PRIORIDADE)

#### 1.1. Atualizar `/api/catalog/products/route.ts`

**Mudanças**:

```typescript
// ANTES
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    if (!category) {
      return NextResponse.json({ error: 'Category required' }, { status: 400 })
    }
    
    // Manual cache check
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }
    
    // Load data...
    return NextResponse.json({ success: true, data, timestamp })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DEPOIS
import { createResponseBuilder } from '@/lib/api/response'
import { validateQuery, ProductsQuerySchema, formatZodError } from '@/lib/api/validation'
import { CacheManager, CacheKeys, CacheTTL } from '@/lib/cache/redis'

export async function GET(request: NextRequest) {
  const response = createResponseBuilder(request)
  
  try {
    // Validate
    const { searchParams } = new URL(request.url)
    const validation = validateQuery(ProductsQuerySchema, searchParams)
    
    if (!validation.success) {
      return response.validationError(
        'Invalid query parameters',
        formatZodError(validation.error)
      )
    }
    
    const query = validation.data
    
    // Cache-aside pattern
    const data = await CacheManager.getOrSet(
      CacheKeys.products(query.category, query),
      () => loadProducts(query),
      CacheTTL.PRODUCTS
    )
    
    return response.success(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${CacheTTL.PRODUCTS}`
      }
    })
  } catch (error) {
    return response.error(
      'PRODUCTS_LOAD_FAILED',
      'Failed to load products',
      { status: 500, includeStack: true }
    )
  }
}
```

**Benefícios**:

- ✅ Validação automática com mensagens estruturadas
- ✅ Cache distribuído (pronto para Redis)
- ✅ Response format padronizado
- ✅ Request tracking
- ✅ Error codes estruturados

#### 1.2. Endpoints a Migrar (Ordem de Prioridade)

**Sprint 1** (Esta semana):

1. ✅ `/api/catalog/products` - Produtos (mais usado)
2. ✅ `/api/catalog/kits` - Kits (segundo mais usado)
3. ✅ `/api/catalog/search` - Busca (terceiro mais usado)

**Sprint 2** (Próxima semana):
4. ✅ `/api/catalog/featured` - Destaque
5. ✅ `/api/catalog/product/[id]` - Detalhes produto
6. ✅ `/api/catalog/kit/[id]` - Detalhes kit

**Sprint 3** (Semana seguinte):
7. ✅ `/api/catalog/categories` - Categorias
8. ✅ `/api/catalog/distributors` - Distribuidores
9. ✅ `/api/onboarding/simulate` - Simulação
10. ✅ `/api/onboarding/geocode` - Geocodificação

---

### Fase 2: Adicionar Monitoramento (ALTA PRIORIDADE)

#### 2.1. Setup Sentry

**Instalar**:

```powershell
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Configurar** (`sentry.config.ts`):

```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% das requests
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA
})
```

**Usar em APIs**:

```typescript
import * as Sentry from '@sentry/nextjs'

export async function GET(request: NextRequest) {
  const transaction = Sentry.startTransaction({
    name: 'GET /api/catalog/products',
    op: 'api.request'
  })
  
  try {
    // ... logic
    return response.success(data)
  } catch (error) {
    Sentry.captureException(error, {
      tags: { endpoint: '/api/catalog/products' },
      extra: { query: searchParams.toString() }
    })
    
    return response.error(...)
  } finally {
    transaction.finish()
  }
}
```

---

### Fase 3: Rate Limiting (MÉDIA PRIORIDADE)

#### 3.1. Setup Upstash

**Instalar**:

```powershell
npm install @upstash/ratelimit @upstash/redis
```

**Criar middleware** (`middleware.ts`):

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'),
  analytics: true
})

export async function middleware(request: NextRequest) {
  // Only rate limit API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // Skip health check
  if (request.nextUrl.pathname === '/api/health') {
    return NextResponse.next()
  }
  
  const ip = request.ip || 'anonymous'
  const { success, limit, remaining, reset } = await rateLimiter.limit(ip)
  
  if (!success) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests'
      }
    }, {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString()
      }
    })
  }
  
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  
  return response
}

export const config = {
  matcher: '/api/:path*'
}
```

---

### Fase 4: Database Migration (BAIXA PRIORIDADE)

**Por que migrar para DB?**

- ✅ Full-text search nativo
- ✅ Queries otimizadas com índices
- ✅ Aggregations (stats, grouping)
- ✅ Relacionamentos (products ↔ kits)
- ✅ Transactions
- ✅ Migrations versionadas

**Stack Recomendada**:

- **PostgreSQL**: Database
- **Prisma**: ORM
- **Supabase**: Hosting (free tier: 500MB)

**Schema Example**:

```prisma
model Product {
  id            String   @id @default(cuid())
  sku           String   @unique
  name          String
  category      String
  distributor   String
  manufacturer  String?
  price_brl     Float
  
  // Search
  search_vector Unsupported("tsvector")?
  
  // Metadata
  specifications Json
  image_url     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Indexes
  @@index([category])
  @@index([distributor])
  @@index([manufacturer])
  @@fulltext([name, sku])
}
```

**Migration Script**:

```typescript
// scripts/migrate-json-to-db.ts
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs/promises'

const prisma = new PrismaClient()

async function migrate() {
  // Read JSON files
  const files = ['panels', 'inverters', 'batteries', ...]
  
  for (const category of files) {
    const data = await fs.readFile(`${catalogPath}/${category}.json`, 'utf-8')
    const products = JSON.parse(data)
    
    // Bulk insert
    await prisma.product.createMany({
      data: products.map(p => ({
        sku: p.sku,
        name: p.name,
        category,
        distributor: p.distributor,
        manufacturer: p.manufacturer,
        price_brl: p.price_brl,
        specifications: p,
        image_url: p.image_url
      })),
      skipDuplicates: true
    })
    
    console.log(`✅ Migrated ${products.length} products from ${category}`)
  }
}

migrate()
```

---

## 📊 Progresso Atual

### ✅ Implementado (Fase 1)

- [x] ResponseBuilder com request tracking
- [x] Zod schemas para todas as APIs
- [x] CacheManager com in-memory fallback
- [x] Cache key builders
- [x] TTL configuration
- [x] Example usage guide
- [x] Architecture evaluation document

### 🔄 Em Progresso (Fase 2)

- [ ] Migrar `/api/catalog/products` para novo padrão
- [ ] Migrar `/api/catalog/kits` para novo padrão
- [ ] Migrar `/api/catalog/search` para novo padrão

### ⏳ Pendente (Fase 3+)

- [ ] Setup Sentry
- [ ] Setup Upstash rate limiting
- [ ] Migrar todos os endpoints
- [ ] Adicionar testes automatizados
- [ ] Implementar API versioning (v1, v2)
- [ ] OpenAPI/Swagger docs
- [ ] Database migration (opcional)

---

## 🎯 Métricas de Sucesso

### Before vs After

| Métrica | Antes | Depois (Meta) |
|---------|-------|---------------|
| **Response Format** | 3 diferentes | 1 padronizado |
| **Error Tracking** | console.log | Sentry + structured logs |
| **Cache Hit Rate** | ~40% (estimado) | 70%+ |
| **API Latency (p95)** | ~500ms | <300ms |
| **Rate Limiting** | Não | 100 req/h |
| **Test Coverage** | 0% | 70%+ |
| **Request Tracking** | Não | 100% |
| **Validation Errors** | Generic | Structured |

---

## 💡 Tips & Best Practices

### 1. **Sempre valide inputs**

```typescript
// ❌ Não faça
const category = searchParams.get('category')
if (!category) return error(...)

// ✅ Faça
const validation = validateQuery(ProductsQuerySchema, searchParams)
if (!validation.success) return response.validationError(...)
```

### 2. **Use cache-aside pattern**

```typescript
// ❌ Não faça (manual)
const cached = cache.get(key)
if (cached) return cached
const data = await load()
cache.set(key, data)
return data

// ✅ Faça (abstracted)
return await CacheManager.getOrSet(key, () => load(), TTL)
```

### 3. **Track todas as requests**

```typescript
// ✅ Sempre use ResponseBuilder
const response = createResponseBuilder(request) // Auto request ID

// ✅ Log com context
console.log(`[API] Request ${response.getRequestId()} took ${response.getElapsedTime()}ms`)
```

### 4. **Invalide cache quando necessário**

```typescript
// Após update no backend
await CacheManager.invalidate('products:panels*')
```

### 5. **Use error codes, não strings**

```typescript
// ❌ Não faça
return response.error('ERROR', 'Something went wrong')

// ✅ Faça
return response.error('PRODUCTS_LOAD_FAILED', 'Failed to load products')
```

---

## 🚦 Status & Next Action

**Current Status**: ✅ Foundation Complete  
**Next Action**: Migrate first 3 endpoints (products, kits, search)  
**ETA**: 2-3 days  
**Blocker**: None

**Comando para começar**:

```powershell
# Instalar dependência Zod (se necessário)
npm install zod

# Testar cache manager
npm run dev
# Acesse http://localhost:3000/api/health

# Verificar tipos
npm run type-check
```

---

**Última Atualização**: 07/10/2025  
**Autor**: GitHub Copilot Agent  
**Revisão**: Pending
