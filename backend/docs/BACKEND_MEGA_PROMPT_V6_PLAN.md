# 🔧 BACKEND MEGA PROMPT V6 - Plano de Implementação Cirúrgica

**Stack:** Medusa 2.10.3, MikroORM 6.4, TypeScript 5, Node >=20  
**Objetivo:** Revisão 360° com patches mínimos, sem mudanças destrutivas

---

## ✅ Status Atual (Já Implementado)

### Infraestrutura
- ✅ APIResponse com envelopes padronizados (success/error)
- ✅ APIVersionManager com suporte a versionamento
- ✅ RateLimiter com Redis + headers X-RateLimit-*
- ✅ CacheManager.clear() usando SCAN+DEL (sem KEYS)
- ✅ CACHE/WORKFLOW Redis em produção (medusa-config.ts)
- ✅ Solar CV middleware com rate limiting

### Rotas Padronizadas
- ✅ `/store/health` - APIResponse + X-API-Version
- ✅ `/store/solar/calculator` - APIResponse + X-API-Version
- ✅ `/aneel/tariffs` - APIResponse + X-API-Version

---

## 🎯 Objetivos do V6

### 1. Padronização de Contratos API
- [ ] Aplicar APIResponse em rotas remanescentes
- [ ] X-API-Version em todas as respostas custom
- [ ] Retry-After em 429 (além de CV)
- [ ] X-RateLimit-* headers globais

### 2. Resiliência e Observabilidade
- [ ] Request ID em todos os logs (Pino)
- [ ] Health com contadores de fallback
- [ ] Métricas de cache hit/miss

### 3. Testes Estáveis
- [ ] integration:modules com guard para quote desativado
- [ ] Pact Provider com fixtures estáveis
- [ ] pvlib tests com timeout DI/fake timers

### 4. Versionamento Global
- [ ] Middleware apiVersionMiddleware em middlewares.ts
- [ ] Suporte a header Accept: version=1.0.0
- [ ] Query param ?version=1.0.0

---

## 📝 Plano de Implementação (8 Passos)

### **Passo 1: Padronizar Rotas Financing**
**Arquivos:** `src/api/financing/simulate/route.ts`, `src/api/financing/rates/route.ts`

**Mudanças:**
```typescript
// Antes
res.json({ simulation, rate_info })

// Depois
APIResponse.success(res, { simulation, rate_info })
res.setHeader("X-API-Version", APIVersionManager.formatVersion(...))
```

**Validação:** `npm run typecheck && npm run test:unit`

---

### **Passo 2: Padronizar Rotas PVLib**
**Arquivos:** 
- `src/api/pvlib/stats/route.ts`
- `src/api/pvlib/inverters/route.ts`
- `src/api/pvlib/panels/route.ts`
- `src/api/pvlib/validate-mppt/route.ts`

**Mudanças:**
```typescript
// Adicionar em todos
import { APIResponse } from "../../../utils/api-response"
import { APIVersionManager } from "../../../utils/api-versioning"

// Substituir res.json() por APIResponse.success()
// Adicionar X-API-Version header
```

**Validação:** `npm run typecheck`

---

### **Passo 3: Middleware Global de Versionamento**
**Arquivo:** `src/api/middlewares.ts`

**Mudanças:**
```typescript
import { apiVersionMiddleware } from "../utils/api-versioning"
import { requestIdMiddleware } from "../utils/api-response"

export const middlewares = [
  requestIdMiddleware,
  apiVersionMiddleware(),
  // ... existing middlewares
]
```

**Validação:** `npm run dev` (verificar headers em /store/health)

---

### **Passo 4: Rate Limiter Global com Retry-After**
**Arquivo:** `src/api/middlewares.ts`

**Mudanças:**
```typescript
import { rateLimiter } from "../utils/rate-limiter"

// Aplicar rate limiting moderado em rotas públicas
const publicRateLimiter = rateLimiter.middleware({
  windowMs: 15 * 60 * 1000, // 15 min
  maxRequests: 100,
  skip: (req) => req.url.startsWith('/admin') // Skip admin routes
})

export const middlewares = [
  requestIdMiddleware,
  apiVersionMiddleware(),
  publicRateLimiter,
  // ... existing
]
```

**Validação:** Testar 429 com curl (verificar Retry-After header)

---

### **Passo 5: Pact Provider com Fixtures Estáveis**
**Arquivos:** 
- `pact/fixtures/catalog.ts` (criar)
- `pact/fixtures/quotes.ts` (criar)
- `pact/provider/catalog.pact.test.ts`

**Mudanças:**
```typescript
// pact/fixtures/catalog.ts
export const mockCatalogProducts = [
  {
    id: "prod_test_001",
    sku: "PANEL-TEST-550W",
    title: "Test Solar Panel 550W",
    // ... stable test data
  }
]

// pact/provider/catalog.pact.test.ts
import { mockCatalogProducts } from "../fixtures/catalog"

beforeEach(() => {
  // Stub catalog service
  jest.spyOn(catalogService, 'list').mockResolvedValue(mockCatalogProducts)
})
```

**Validação:** `npm run test:pact:provider`

---

### **Passo 6: Integration Tests com Quote Module Guard**
**Arquivo:** `integration-tests/setup-enhanced.js`

**Mudanças:**
```javascript
// Melhorar stub do quote module
const QUOTE_MODULE_ENABLED = process.env.ENABLE_QUOTE_MODULE === 'true'

if (!QUOTE_MODULE_ENABLED) {
  console.log('⚠️  Quote module disabled, using comprehensive stub')
  
  jest.mock('../src/modules/quote/service', () => ({
    default: class QuoteModuleService {
      async list() { return [] }
      async retrieve() { return null }
      async create() { throw new Error('Quote module disabled') }
      async update() { throw new Error('Quote module disabled') }
    }
  }))
}
```

**Validação:** `npm run test:integration:modules`

---

### **Passo 7: PVLib Tests com Timeout DI**
**Arquivo:** `src/modules/pvlib-integration/service.ts`

**Mudanças:**
```typescript
export default class PVLibIntegrationService {
  private requestTimeout: number

  constructor(options?: { requestTimeout?: number }) {
    this.requestTimeout = options?.requestTimeout ?? 30000 // 30s default
  }

  async callPythonService(endpoint: string, data: any) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout)
    
    try {
      const response = await fetch(endpoint, {
        signal: controller.signal,
        // ...
      })
      return response
    } finally {
      clearTimeout(timeoutId)
    }
  }
}
```

**Testes:**
```typescript
// __tests__/pvlib.unit.spec.ts
describe('PVLibIntegrationService', () => {
  it('should timeout after configured duration', async () => {
    const service = new PVLibIntegrationService({ requestTimeout: 100 })
    
    await expect(
      service.callPythonService('http://slow-endpoint', {})
    ).rejects.toThrow('timeout')
  })
})
```

**Validação:** `npm run test:unit`

---

### **Passo 8: Observabilidade - Request ID em Logs**
**Arquivo:** `src/utils/logger.ts`

**Mudanças:**
```typescript
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  serializers: {
    req: (req) => ({
      id: req.id || req.requestId,
      method: req.method,
      url: req.url,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
})

// Middleware para injetar logger com request_id
export function loggerMiddleware(req: any, res: any, next: any) {
  const requestId = req.requestId || req.headers['x-request-id']
  req.log = logger.child({ request_id: requestId })
  next()
}
```

**Validação:** Verificar logs com `request_id` field

---

## 🧪 Validações Finais

### Typecheck
```bash
cd backend
npm run typecheck
```

### Testes Unitários
```bash
npm run test:unit
```

### Testes de Integração (Modules)
```bash
npm run test:integration:modules
```

### Pact Provider
```bash
npm run test:pact:provider
```

### Build
```bash
npm run build
```

---

## ✅ Critérios de Aceite

### Contratos Padronizados
- [ ] Todas as rotas custom retornam envelope APIResponse
- [ ] X-API-Version presente em todas as respostas
- [ ] 429 responses incluem Retry-After header
- [ ] X-RateLimit-* headers em rotas públicas

### Resiliência
- [ ] Cache.clear() usa SCAN+DEL (já implementado)
- [ ] PVLib com timeout configurável via DI
- [ ] Health endpoint com contadores de fallback

### Testes Estáveis
- [ ] integration:modules passa com quote desativado
- [ ] Pact Provider passa com fixtures estáveis
- [ ] pvlib tests não flakey (timeout DI)

### Observabilidade
- [ ] Logs Pino com request_id em todos os handlers
- [ ] Health endpoint expõe métricas de cache/fallback
- [ ] Duração de requests logada

---

## 📊 Métricas de Sucesso

| Métrica | Antes | Meta V6 |
|---------|-------|---------|
| Rotas padronizadas | 3/20 | 20/20 |
| X-API-Version coverage | 15% | 100% |
| integration:modules pass rate | 80% | 100% |
| Pact Provider pass rate | 60% | 100% |
| pvlib test flakiness | 20% | 0% |

---

## 🚀 Próximos Passos (Pós-V6)

1. **Approval/Financing Test Harness** - Criar mocks de manager/repository
2. **OpenAPI/Swagger Spec** - Gerar spec completo com envelopes
3. **API Gateway** - Rate limiting distribuído (Kong/Traefik)
4. **Distributed Tracing** - Jaeger/OpenTelemetry integration

---

**Estimativa:** 4-6 horas de implementação + 2 horas de validação  
**Risco:** Baixo (mudanças não destrutivas, backward compatible)  
**Prioridade:** Alta (fundação para confiabilidade)
