# 🏗️ Análise de Arquitetura de APIs - YSH Storefront

**Data**: 07 de outubro de 2025  
**Projeto**: YSH Store - Next.js 15 Storefront  
**Objetivo**: Avaliar estrutura atual das APIs e recomendar melhorias para escalabilidade e manutenibilidade

---

## 📊 Inventário de APIs

### Storefront APIs (`src/app/api/`)

#### 1. **Catalog APIs** (8 endpoints)

| Endpoint | Método | Cache | Propósito |
|----------|--------|-------|-----------|
| `/api/catalog/products` | GET | 1h | Lista produtos por categoria |
| `/api/catalog/kits` | GET | 1h | Lista kits fotovoltaicos |
| `/api/catalog/search` | GET | 30min | Busca unificada |
| `/api/catalog/categories` | GET | 2h | Metadados de categorias |
| `/api/catalog/featured` | GET | 1h | Produtos em destaque |
| `/api/catalog/product/[id]` | GET | 1h | Detalhes de produto |
| `/api/catalog/kit/[id]` | GET | 1h | Detalhes de kit |
| `/api/catalog/distributors` | GET | 2h | Lista distribuidores |

#### 2. **Onboarding APIs** (2 endpoints)

| Endpoint | Método | Cache | Propósito |
|----------|--------|-------|-----------|
| `/api/onboarding/simulate` | POST | No | Simulação solar (PVGIS/NREL) |
| `/api/onboarding/geocode` | POST | 30min | Geocodificação CEP/endereço |

#### 3. **Health APIs** (1 endpoint)

| Endpoint | Método | Cache | Propósito |
|----------|--------|-------|-----------|
| `/api/health` | GET | No | Health check + fallback status |

**Total Storefront APIs**: 11 endpoints

---

### Backend APIs (`backend/src/api/`)

#### Store APIs

- `/store/companies` - Gerenciamento de empresas
- `/store/thermal-analysis` - Análise térmica
- `/store/solar-detection` - Detecção de painéis
- `/store/approvals` - Aprovações

#### Admin APIs

- `/admin/quotes` - Cotações
- `/admin/companies` - Empresas (admin)

**Total Backend APIs**: 6+ endpoints (parcialmente mapeados)

---

## 🔍 Análise Detalhada

### 1. **Padrões de Cache**

#### ✅ Pontos Fortes

1. **Cache em memória implementado**

   ```typescript
   // Pattern usado consistentemente
   const cache = new Map<string, { data: any; timestamp: number }>()
   const CACHE_TTL = 60 * 60 * 1000 // 1 hora
   
   const cached = cache.get(cacheKey)
   if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
       return cached.data
   }
   ```

2. **TTL configurável por endpoint**
   - Featured: 1 hora
   - Products/Kits: 1 hora
   - Categories/Distributors: 2 horas
   - Search: 30 minutos

3. **Cache-Control headers configurados**

   ```typescript
   'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
   ```

#### ⚠️ Problemas Identificados

1. **Cache em memória não compartilhado**
   - Cada instância do Next.js tem seu próprio cache
   - Sem invalidação coordenada entre instâncias
   - Sem persistência (reinício = cache perdido)

2. **Sem estratégia de invalidação**
   - Cache expira apenas por TTL
   - Sem invalidação manual/programática
   - Sem notificação de mudanças

3. **Tipos inconsistentes**

   ```typescript
   // Catalog APIs
   let cache: Map<string, { data: any; timestamp: number }> = new Map()
   
   // Featured API
   let cache: { data: any; timestamp: number } | null = null
   ```

4. **TTL fixo**
   - Não considera horário de pico
   - Não diferencia dados estáticos vs dinâmicos
   - Sem ajuste dinâmico

---

### 2. **Tratamento de Erros**

#### ✅ Pontos Fortes

1. **Try-catch em todas as routes**

   ```typescript
   try {
       // Logic
   } catch (error) {
       return NextResponse.json({
           success: false,
           error: 'Failed to load',
           message: error instanceof Error ? error.message : 'Unknown error'
       }, { status: 500 })
   }
   ```

2. **Status codes apropriados**
   - 200: Sucesso
   - 400: Bad request
   - 404: Not found
   - 500: Server error
   - 503: Service unavailable (health check)

#### ⚠️ Problemas Identificados

1. **Formato de erro inconsistente**

   ```typescript
   // Catalog APIs
   { success: false, error: string, message: string }
   
   // Onboarding APIs
   { error: string }
   
   // Health API
   { healthy: false, error: string }
   ```

2. **Sem error tracking/logging estruturado**
   - Apenas `console.error`
   - Sem contexto (user, request id, timestamp)
   - Sem agregação (Sentry, DataDog)

3. **Sem retry logic**
   - Falhas em external APIs não são retryadas
   - Sem exponential backoff
   - Sem circuit breaker

4. **Mensagens de erro genéricas**

   ```typescript
   { error: "Failed to load products" }
   // Não informa: qual categoria? qual distribuidor? qual foi o erro real?
   ```

---

### 3. **Estrutura de Response**

#### ✅ Pontos Fortes

1. **Response padronizado em Catalog APIs**

   ```typescript
   {
       success: boolean
       data: T
       timestamp: string
   }
   ```

2. **Paginação implementada**

   ```typescript
   {
       products: [...],
       pagination: {
           total: number
           limit: number
           offset: number
           hasMore: boolean
       }
   }
   ```

#### ⚠️ Problemas Identificados

1. **Inconsistência entre APIs**

   ```typescript
   // Catalog APIs
   { success: true, data: {...}, timestamp: string }
   
   // Onboarding simulate
   { /* direct result */ }
   
   // Health check
   { healthy: true, backend: {...}, fallback: {...} }
   ```

2. **Sem versionamento**
   - Mudanças quebram clients antigos
   - Sem `v1`, `v2` no path
   - Sem header `API-Version`

3. **Sem metadata útil**
   - Sem request ID para debugging
   - Sem timing info (duration)
   - Sem rate limit headers

4. **Timestamp inconsistente**

   ```typescript
   // Algumas APIs
   timestamp: new Date().toISOString()
   
   // Outras não têm timestamp
   ```

---

### 4. **Validação de Input**

#### ✅ Pontos Fortes

1. **Query params validados**

   ```typescript
   const category = searchParams.get('category') as ProductCategory
   if (!Object.keys(CATEGORY_FILES).includes(category)) {
       return NextResponse.json({
           error: 'Invalid category',
           validCategories: Object.keys(CATEGORY_FILES)
       }, { status: 400 })
   }
   ```

2. **Type safety com TypeScript**

   ```typescript
   type ProductCategory = 'panels' | 'inverters' | ...
   ```

#### ⚠️ Problemas Identificados

1. **Validação manual repetitiva**
   - Cada endpoint valida manualmente
   - Sem schema validation (Zod, Yup)
   - Duplicação de código

2. **Sanitização limitada**
   - Sem proteção contra injection
   - Sem normalização de inputs
   - Sem rate limiting

3. **Mensagens de erro não estruturadas**

   ```typescript
   { error: "Invalid category" }
   // Melhor seria:
   {
       error: "INVALID_CATEGORY",
       message: "Category 'foo' is not valid",
       validValues: ["panels", "inverters", ...]
   }
   ```

---

### 5. **Performance & Escalabilidade**

#### ✅ Pontos Fortes

1. **Leitura paralela**

   ```typescript
   const [panels, kits, inverters] = await Promise.all([
       fetchProducts({ category: 'panels' }),
       fetchKits({ limit: 4 }),
       fetchProducts({ category: 'inverters' })
   ])
   ```

2. **Filesystem cache (Next.js)**

   ```typescript
   next: { revalidate: 3600 }
   ```

3. **Paginação implementada**
   - Offset/limit
   - hasMore indicator

#### ⚠️ Problemas Identificados

1. **Leitura de arquivo completo**

   ```typescript
   const data = await fs.readFile(filePath, 'utf-8')
   const products = JSON.parse(data) // 986 produtos carregados sempre
   ```

   - Sem streaming
   - Sem index/search engine
   - Memory intensive para grandes datasets

2. **Filtros no JavaScript**

   ```typescript
   const filtered = products.filter(p => {
       if (distributor && p.distributor !== distributor) return false
       // ...mais filtros
   })
   ```

   - Não aproveita índices
   - O(n) complexity para cada request

3. **Sem database**
   - Dados em JSON files
   - Sem queries otimizadas
   - Sem full-text search
   - Sem aggregations

4. **Sem CDN caching**
   - APIs servidas pelo Next.js
   - Sem Vercel Edge Functions
   - Sem CloudFlare Workers

5. **Sem compressão**
   - Responses não comprimidos (gzip/brotli)
   - Payloads grandes (produtos com todas specs)

---

### 6. **Segurança**

#### ✅ Pontos Fortes

1. **Sem exposição de paths do servidor**

   ```typescript
   // Não retorna paths absolutos nos erros
   ```

2. **Rate limiting por Next.js**
   - Middleware do Next.js

#### ⚠️ Problemas Identificados

1. **Sem autenticação/autorização**
   - APIs públicas (ok para catálogo)
   - Mas onboarding/simulate pode ser abusado

2. **Sem rate limiting explícito**
   - Vulnerable a DoS
   - Sem throttling por IP
   - Sem quota por usuário

3. **Sem CORS configurado explicitamente**
   - Next.js default aceita qualquer origin

4. **Sem input sanitization**
   - SQL injection não aplicável (sem DB)
   - Mas XSS possível em search queries

5. **API keys expostas**

   ```typescript
   // Em onboarding/geocode
   headers: { "User-Agent": "yello-solar-hub/1.0" }
   // Nominatim pode banir o UA se abusado
   ```

---

### 7. **Manutenibilidade**

#### ✅ Pontos Fortes

1. **Documentação inline**

   ```typescript
   /**
    * GET /api/catalog/products
    * Retorna produtos do catálogo unificado
    * Query params: ...
    */
   ```

2. **Type definitions**

   ```typescript
   type ProductCategory = 'panels' | 'inverters' | ...
   ```

3. **Separação por domínio**
   - `/catalog/*` - Produtos
   - `/onboarding/*` - Dimensionamento
   - `/health` - Monitoring

#### ⚠️ Problemas Identificados

1. **Código duplicado**

   ```typescript
   // Mesma lógica de cache em 8 arquivos
   const cached = cache.get(cacheKey)
   if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
       return cached.data
   }
   ```

2. **Sem abstração/middleware**
   - Sem shared utilities
   - Sem request/response wrappers
   - Sem dependency injection

3. **Sem testes**
   - Sem unit tests
   - Sem integration tests
   - Sem mock data

4. **Sem OpenAPI/Swagger**
   - Documentação apenas inline
   - Sem spec machine-readable
   - Dificulta client generation

5. **Acoplamento ao filesystem**

   ```typescript
   const catalogPath = path.join(process.cwd(), '../../ysh-erp/...')
   ```

   - Hardcoded paths
   - Dificulta deploy em ambientes diferentes
   - Sem abstração de data source

---

## 🎯 Recomendações Prioritárias

### 🔥 Alta Prioridade (Fazer Agora)

#### 1. **Implementar Cache Distribuído (Redis)**

**Problema**: Cache em memória não escala em múltiplas instâncias.

**Solução**:

```typescript
// lib/cache/redis.ts
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export class CacheManager {
    private static readonly DEFAULT_TTL = 3600 // 1 hora
    
    static async get<T>(key: string): Promise<T | null> {
        const cached = await redis.get(key)
        if (!cached) return null
        return JSON.parse(cached) as T
    }
    
    static async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        await redis.setex(
            key,
            ttl || this.DEFAULT_TTL,
            JSON.stringify(value)
        )
    }
    
    static async invalidate(pattern: string): Promise<void> {
        const keys = await redis.keys(pattern)
        if (keys.length > 0) {
            await redis.del(...keys)
        }
    }
    
    static async invalidateAll(): Promise<void> {
        await redis.flushdb()
    }
}
```

**Uso**:

```typescript
// api/catalog/products/route.ts
export async function GET(request: NextRequest) {
    const cacheKey = `products:${category}:${limit}:${offset}`
    
    // Try cache
    const cached = await CacheManager.get(cacheKey)
    if (cached) {
        return NextResponse.json(cached)
    }
    
    // Load data
    const data = await loadProducts(...)
    
    // Cache with 1h TTL
    await CacheManager.set(cacheKey, data, 3600)
    
    return NextResponse.json(data)
}
```

**Benefícios**:

- ✅ Cache compartilhado entre instâncias
- ✅ Invalidação coordenada
- ✅ Persistência em memória (não perde em restart)
- ✅ TTL gerenciado pelo Redis
- ✅ Suporte a patterns (invalidate `products:*`)

---

#### 2. **Padronizar Response Format**

**Problema**: Inconsistência dificulta consumo das APIs.

**Solução**:

```typescript
// lib/api/response.ts
export type APIResponse<T = any> = {
    success: true
    data: T
    meta: {
        timestamp: string
        requestId: string
        duration: number // ms
    }
} | {
    success: false
    error: {
        code: string
        message: string
        details?: any
    }
    meta: {
        timestamp: string
        requestId: string
        duration: number
    }
}

export class ResponseBuilder {
    private startTime: number
    private requestId: string
    
    constructor() {
        this.startTime = Date.now()
        this.requestId = crypto.randomUUID()
    }
    
    success<T>(data: T, status = 200): NextResponse {
        return NextResponse.json({
            success: true,
            data,
            meta: {
                timestamp: new Date().toISOString(),
                requestId: this.requestId,
                duration: Date.now() - this.startTime
            }
        }, { status })
    }
    
    error(
        code: string,
        message: string,
        status = 500,
        details?: any
    ): NextResponse {
        return NextResponse.json({
            success: false,
            error: { code, message, details },
            meta: {
                timestamp: new Date().toISOString(),
                requestId: this.requestId,
                duration: Date.now() - this.startTime
            }
        }, { status })
    }
}
```

**Uso**:

```typescript
export async function GET(request: NextRequest) {
    const response = new ResponseBuilder()
    
    try {
        const products = await loadProducts(...)
        return response.success({
            products,
            pagination: { total: 986, limit: 50, offset: 0 }
        })
    } catch (error) {
        return response.error(
            'PRODUCTS_LOAD_FAILED',
            'Failed to load products from catalog',
            500,
            { category, originalError: error.message }
        )
    }
}
```

**Benefícios**:

- ✅ Response format consistente
- ✅ Request ID para debugging
- ✅ Duration tracking
- ✅ Error codes estruturados
- ✅ Metadata útil

---

#### 3. **Implementar Validação com Zod**

**Problema**: Validação manual e duplicada.

**Solução**:

```typescript
// lib/api/validation.ts
import { z } from 'zod'

export const ProductsQuerySchema = z.object({
    category: z.enum([
        'panels',
        'inverters',
        'batteries',
        'structures',
        'cables',
        'accessories',
        'stringboxes'
    ]),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
    distributor: z.enum(['FOTUS', 'NEOSOLAR', 'ODEX', 'SOLFACIL', 'FORTLEV']).optional(),
    search: z.string().min(2).max(100).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional()
})

export type ProductsQuery = z.infer<typeof ProductsQuerySchema>

export function validateQuery<T>(
    schema: z.ZodSchema<T>,
    searchParams: URLSearchParams
): { success: true; data: T } | { success: false; error: z.ZodError } {
    const params = Object.fromEntries(searchParams.entries())
    const result = schema.safeParse(params)
    
    if (!result.success) {
        return { success: false, error: result.error }
    }
    
    return { success: true, data: result.data }
}
```

**Uso**:

```typescript
export async function GET(request: NextRequest) {
    const response = new ResponseBuilder()
    const { searchParams } = new URL(request.url)
    
    // Validate
    const validation = validateQuery(ProductsQuerySchema, searchParams)
    
    if (!validation.success) {
        return response.error(
            'INVALID_QUERY_PARAMS',
            'Invalid query parameters',
            400,
            validation.error.format()
        )
    }
    
    const { category, limit, offset, distributor, search } = validation.data
    
    // Continue with validated data...
}
```

**Benefícios**:

- ✅ Validação declarativa
- ✅ Type safety automático
- ✅ Mensagens de erro estruturadas
- ✅ Coerção de tipos (string → number)
- ✅ Reutilizável

---

#### 4. **Implementar Error Tracking (Sentry)**

**Problema**: Erros apenas logados em console.

**Solução**:

```typescript
// lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs'

export function captureAPIError(
    error: Error,
    context: {
        endpoint: string
        method: string
        params?: any
        userId?: string
    }
) {
    Sentry.captureException(error, {
        tags: {
            endpoint: context.endpoint,
            method: context.method
        },
        extra: {
            params: context.params,
            userId: context.userId
        }
    })
}

export function startAPITransaction(name: string) {
    return Sentry.startTransaction({
        name,
        op: 'api.request'
    })
}
```

**Uso**:

```typescript
export async function GET(request: NextRequest) {
    const transaction = startAPITransaction('GET /api/catalog/products')
    
    try {
        // Logic...
        return response.success(data)
    } catch (error) {
        captureAPIError(error as Error, {
            endpoint: '/api/catalog/products',
            method: 'GET',
            params: Object.fromEntries(searchParams)
        })
        
        return response.error('INTERNAL_ERROR', error.message, 500)
    } finally {
        transaction.finish()
    }
}
```

**Benefícios**:

- ✅ Agregação de erros
- ✅ Stack traces
- ✅ Performance monitoring
- ✅ Alertas automáticos
- ✅ Breadcrumbs (request flow)

---

### 🟡 Média Prioridade (Próximos Sprints)

#### 5. **Migrar para Database (PostgreSQL/Prisma)**

**Problema**: JSON files não escalam, queries lentas.

**Solução**:

```typescript
// prisma/schema.prisma
model Product {
    id            String   @id @default(cuid())
    name          String
    sku           String   @unique
    category      String
    distributor   String
    manufacturer  String?
    price_brl     Float
    specifications Json
    image_url     String?
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
    
    @@index([category])
    @@index([distributor])
    @@index([manufacturer])
    @@fulltext([name, sku])
}
```

**Benefícios**:

- ✅ Full-text search
- ✅ Índices otimizados
- ✅ Queries complexas
- ✅ Aggregations
- ✅ Transactions
- ✅ Migrations

---

#### 6. **Implementar Rate Limiting**

**Problema**: APIs vulneráveis a abuse.

**Solução**:

```typescript
// lib/api/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export const rateLimiter = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 requests por hora
    analytics: true
})

export async function checkRateLimit(identifier: string) {
    const { success, limit, remaining, reset } = await rateLimiter.limit(identifier)
    
    return {
        allowed: success,
        limit,
        remaining,
        reset: new Date(reset)
    }
}
```

**Uso**:

```typescript
export async function POST(request: NextRequest) {
    const ip = request.ip || 'anonymous'
    const { allowed, remaining, reset } = await checkRateLimit(ip)
    
    if (!allowed) {
        return NextResponse.json({
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests',
            retryAfter: reset
        }, {
            status: 429,
            headers: {
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': reset.toISOString()
            }
        })
    }
    
    // Continue...
}
```

---

#### 7. **Implementar Versionamento de API**

**Problema**: Mudanças quebram clients antigos.

**Solução**:

```typescript
// app/api/v1/catalog/products/route.ts
export async function GET(request: NextRequest) {
    // V1 implementation
}

// app/api/v2/catalog/products/route.ts
export async function GET(request: NextRequest) {
    // V2 implementation com novos campos
}

// middleware.ts
export function middleware(request: NextRequest) {
    const apiVersion = request.headers.get('API-Version') || 'v1'
    
    if (!['v1', 'v2'].includes(apiVersion)) {
        return NextResponse.json({
            error: 'INVALID_API_VERSION',
            message: 'Supported versions: v1, v2'
        }, { status: 400 })
    }
    
    // Continue...
}
```

---

### 🟢 Baixa Prioridade (Melhorias Futuras)

#### 8. **Implementar GraphQL**

Para queries complexas e reduzir over-fetching.

#### 9. **Implementar Webhooks**

Para notificar clients de mudanças (invalidação de cache).

#### 10. **Implementar API Gateway**

Kong/Tyk para centralizar auth, rate limiting, logging.

---

## 📐 Arquitetura Proposta

### Camadas

```
┌─────────────────────────────────────────┐
│          Client (Next.js App)           │
└─────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────┐
│      API Routes (Next.js 15 App)        │
│  - Validation (Zod)                     │
│  - Rate Limiting (Upstash)              │
│  - Response Builder                     │
└─────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────┐
│       Service Layer (Business Logic)    │
│  - ProductService                       │
│  - KitService                           │
│  - DistributorService                   │
└─────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────┐
│         Data Access Layer (DAL)         │
│  - Prisma ORM                           │
│  - Query builders                       │
└─────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────┐
│        Cache Layer (Redis)              │
│  - Distributed cache                    │
│  - Invalidation strategies              │
└─────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────┐
│      Database (PostgreSQL)              │
│  - Products, Kits, Distributors         │
│  - Full-text search                     │
└─────────────────────────────────────────┘
```

---

## 📊 Comparação Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Cache** | Em memória, isolado por instância | Redis distribuído |
| **Invalidação** | Apenas TTL | Manual + TTL + Webhooks |
| **Response Format** | Inconsistente | Padronizado |
| **Error Handling** | Console.error | Sentry + structured logs |
| **Validation** | Manual | Zod schemas |
| **Rate Limiting** | Não | Upstash + sliding window |
| **Data Source** | JSON files | PostgreSQL + Prisma |
| **Performance** | O(n) filter | Indexed queries |
| **Monitoring** | Básico | Sentry + APM |
| **Security** | Básica | Auth + throttling + sanitization |
| **Versionamento** | Não | v1, v2 |
| **Documentation** | Inline comments | OpenAPI/Swagger |
| **Testing** | Não | Unit + integration |

---

## 🚀 Roadmap de Implementação

### Sprint 1 (1-2 semanas)

- ✅ Implementar ResponseBuilder
- ✅ Implementar validação Zod
- ✅ Padronizar error responses
- ✅ Setup Sentry

### Sprint 2 (2-3 semanas)

- ✅ Setup Redis cache
- ✅ Migrar cache para Redis
- ✅ Implementar invalidação
- ✅ Implementar rate limiting

### Sprint 3 (3-4 semanas)

- ✅ Setup PostgreSQL + Prisma
- ✅ Migrar dados de JSON para DB
- ✅ Implementar queries otimizadas
- ✅ Full-text search

### Sprint 4 (1-2 semanas)

- ✅ Versionamento de API (v1, v2)
- ✅ OpenAPI/Swagger docs
- ✅ Testes automatizados

---

## 💰 Custos Estimados

| Serviço | Custo Mensal | Propósito |
|---------|--------------|-----------|
| **Upstash Redis** | $10-50 | Cache distribuído + rate limiting |
| **PostgreSQL (Supabase)** | $25-100 | Database gerenciado |
| **Sentry** | Free-$26 | Error tracking + APM |
| **Vercel Pro** | $20/mês | Edge functions + bandwidth |
| **Total** | **$55-196/mês** | Infraestrutura completa |

---

## 📚 Recursos Adicionais

### Bibliotecas Recomendadas

```json
{
  "dependencies": {
    "ioredis": "^5.3.2",
    "@upstash/redis": "^1.28.0",
    "@upstash/ratelimit": "^1.0.0",
    "@prisma/client": "^5.9.0",
    "zod": "^3.22.4",
    "@sentry/nextjs": "^7.99.0"
  },
  "devDependencies": {
    "prisma": "^5.9.0",
    "@types/node": "^20.11.0",
    "vitest": "^1.2.0"
  }
}
```

### Links Úteis

- [Next.js API Routes Best Practices](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Zod Documentation](https://zod.dev/)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Sentry Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

---

## ✅ Checklist de Implementação

### Fase 1: Fundação

- [ ] Setup ResponseBuilder
- [ ] Setup Zod validation
- [ ] Padronizar error responses
- [ ] Implementar request ID tracking
- [ ] Setup Sentry

### Fase 2: Cache & Performance

- [ ] Setup Redis (Upstash)
- [ ] Criar CacheManager
- [ ] Migrar cache in-memory para Redis
- [ ] Implementar invalidação patterns
- [ ] Configurar TTL por tipo de dado

### Fase 3: Database

- [ ] Setup PostgreSQL (Supabase)
- [ ] Criar schema Prisma
- [ ] Migrar dados JSON → DB
- [ ] Implementar queries otimizadas
- [ ] Full-text search

### Fase 4: Security & Reliability

- [ ] Implementar rate limiting
- [ ] Configurar CORS
- [ ] Input sanitization
- [ ] Retry logic com exponential backoff
- [ ] Circuit breaker

### Fase 5: Developer Experience

- [ ] Versionamento (v1, v2)
- [ ] OpenAPI/Swagger
- [ ] Testes automatizados
- [ ] CI/CD pipelines

---

**Status**: 🔄 Análise Completa  
**Próximo Passo**: Implementar ResponseBuilder + Zod validation  
**Prioridade**: 🔥 Alta  
**Estimativa**: 2-3 sprints para implementação completa
