# 🔄 Arquitetura de Integração End-to-End 360°

> **Data:** 7 de Outubro de 2025  
> **Versão:** 1.0.0  
> **Status:** ✅ Ativo

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Módulos de Integração](#módulos-de-integração)
3. [Fluxos de Dados](#fluxos-de-dados)
4. [Hooks Personalizados](#hooks-personalizados)
5. [Rotas e Endpoints](#rotas-e-endpoints)
6. [Gerenciamento de Estado](#gerenciamento-de-estado)
7. [Resiliência e Fallback](#resiliência-e-fallback)
8. [Cache e Performance](#cache-e-performance)

---

## 🎯 Visão Geral

A arquitetura de integração 360° do YSH Store conecta:

- **Storefront (Next.js)** ↔️ **Backend (Medusa.js)** ↔️ **ERP (Python)**
- Cobertura completa de todas as rotas do app
- Hooks reutilizáveis para cada domínio
- Fallback automático e retry com backoff exponencial
- Cache inteligente com ISR/SSG

### Arquitetura em Camadas

```
┌─────────────────────────────────────────┐
│         Storefront Next.js              │
│  (Routes + Pages + Components)          │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│       Integration Layer                 │
│  • Hooks (useCart, useProducts, etc)    │
│  • Context (CartContext, etc)           │
│  • API Clients (resilient.ts)           │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│        Data Layer                       │
│  • cart.ts, products.ts, quotes.ts      │
│  • Retry + Fallback + Cache             │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│      Backend API (Medusa)               │
│  • /store/* endpoints                   │
│  • Custom B2B modules                   │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         Database + Services             │
│  • PostgreSQL + Redis + Qdrant          │
└─────────────────────────────────────────┘
```

---

## 📦 Módulos de Integração

### 1. **Cart (Carrinho)**

**Status:** ✅ Ativo com retry e fallback

**Endpoints:**

- `POST /store/carts` - Criar carrinho
- `GET /store/carts/{id}` - Recuperar carrinho
- `POST /store/carts/{id}/line-items` - Adicionar item
- `POST /store/carts/{id}/line-items/bulk` - Adicionar múltiplos itens
- `PUT /store/carts/{id}/line-items/{line_id}` - Atualizar item
- `DELETE /store/carts/{id}/line-items/{line_id}` - Remover item
- `POST /store/carts/{id}/complete` - Finalizar pedido
- `POST /store/carts/{id}/approvals` - Criar aprovação

**Hooks:**

- `useCart()` - Context hook para gerenciar carrinho
- `useCartContext()` - Acesso direto ao contexto

**Context:**

- `CartContext` - Estado global do carrinho com optimistic updates

**Rotas:**

- `/cart` - Página do carrinho
- `/checkout` - Checkout

**Data Layer:**

- `lib/data/cart.ts` - Funções server-side com retry

**Features:**

- ✅ Optimistic updates
- ✅ Retry automático (3x com backoff exponencial)
- ✅ Validação de aprovações B2B
- ✅ Cache force-cache

---

### 2. **Products (Produtos)**

**Status:** ✅ Ativo com retry e fallback

**Endpoints:**

- `GET /store/products` - Listar produtos
- `GET /store/products/{id}` - Buscar por ID
- `GET /api/catalog/products` - Catálogo unificado
- `GET /api/catalog/product/{id}` - Produto do catálogo
- `GET /api/catalog/search` - Busca no catálogo

**Hooks:**

- `useProducts(params)` - Listar produtos com filtros
- `useProduct(id, category?)` - Buscar produto específico
- `useCatalogSearch(query, filters)` - Busca no catálogo

**Rotas:**

- `/products` - Listagem geral
- `/products/{handle}` - Detalhes do produto
- `/produtos` - Listagem PT-BR
- `/produtos/{category}` - Por categoria
- `/produtos/kits` - Kits solares
- `/search` - Página de busca

**Data Layer:**

- `lib/data/products.ts` - Produtos Medusa com retry
- `lib/api/catalog-client.ts` - Catálogo unificado
- `lib/data/catalog-enriched.ts` - Dados enriquecidos por IA

**Features:**

- ✅ Retry automático (3x)
- ✅ Fallback para catálogo local
- ✅ Cache ISR (revalidate: 3600s)
- ✅ Busca semântica via Qdrant
- ✅ Imagens otimizadas

---

### 3. **Categories (Categorias)**

**Status:** ✅ Ativo com retry e fallback

**Endpoints:**

- `GET /store/product-categories` - Listar categorias
- `GET /store/product-categories/{id}` - Buscar por ID
- `GET /api/catalog/categories` - Categorias do catálogo

**Hooks:**

- `useCategories(includeStats?)` - Listar categorias

**Rotas:**

- `/categories/{...category}` - Navegação por categorias
- `/produtos` - Categorias PT-BR

**Data Layer:**

- `lib/data/categories.ts` - Categorias Medusa com retry

**Features:**

- ✅ Retry automático (3x)
- ✅ Cache force-cache
- ✅ Hierarquia de categorias

---

### 4. **Collections (Coleções)**

**Status:** ✅ Ativo com retry

**Endpoints:**

- `GET /store/collections` - Listar coleções
- `GET /store/collections/{id}` - Buscar por ID
- `GET /store/collections/{handle}` - Buscar por handle

**Hooks:**

- `useCollections()` - Listar coleções
- `useCollection(handle)` - Buscar coleção

**Rotas:**

- `/collections/{handle}` - Página da coleção

**Data Layer:**

- `lib/data/collections.ts` - Coleções Medusa com retry

**Features:**

- ✅ Retry automático (3x)
- ✅ Cache force-cache

---

### 5. **Orders (Pedidos)**

**Status:** ✅ Ativo com retry

**Endpoints:**

- `GET /store/orders` - Listar pedidos
- `GET /store/orders/{id}` - Detalhes do pedido

**Hooks:**

- `useOrders()` - Listar pedidos
- `useOrder(id)` - Detalhes do pedido

**Rotas:**

- `/account/@dashboard/orders` - Lista de pedidos
- `/account/@dashboard/orders/details/{id}` - Detalhes
- `/order/confirmed/{id}` - Confirmação

**Data Layer:**

- `lib/data/orders.ts` - Pedidos com retry

**Features:**

- ✅ Retry automático (3x)
- ✅ Cache force-cache
- ✅ Payment collections

---

### 6. **Quotes (Cotações B2B)**

**Status:** ✅ Ativo com retry

**Endpoints:**

- `POST /store/quotes` - Criar cotação
- `GET /store/quotes` - Listar cotações
- `GET /store/quotes/{id}` - Detalhes
- `GET /store/quotes/{id}/preview` - Preview do pedido
- `POST /store/quotes/{id}/accept` - Aceitar cotação
- `POST /store/quotes/{id}/reject` - Rejeitar cotação
- `POST /store/quotes/{id}/messages` - Adicionar mensagem

**Hooks:**

- `useQuotes()` - Listar cotações
- `useQuote(id)` - Detalhes da cotação
- `useQuoteMessages(id)` - Mensagens da cotação

**Rotas:**

- `/account/@dashboard/quotes` - Lista de cotações
- `/account/@dashboard/quotes/details/{id}` - Detalhes
- `/cotacao` - Solicitar cotação

**Data Layer:**

- `lib/data/quotes.ts` - Cotações com retry

**Features:**

- ✅ Retry automático (3x)
- ✅ Cache condicional
- ✅ Draft orders integration
- ✅ Messaging system

---

### 7. **Approvals (Aprovações B2B)**

**Status:** ✅ Ativo com retry

**Endpoints:**

- `GET /store/approvals` - Listar aprovações
- `GET /store/approvals/{id}` - Detalhes
- `POST /store/approvals/{id}/approve` - Aprovar
- `POST /store/approvals/{id}/reject` - Rejeitar

**Hooks:**

- `useApprovals(filters)` - Listar aprovações
- `useApproval(id)` - Detalhes da aprovação

**Rotas:**

- `/account/@dashboard/approvals` - Aprovações pendentes

**Data Layer:**

- `lib/data/approvals.ts` - Aprovações com retry

**Features:**

- ✅ Retry automático (3x)
- ✅ Validação de limites
- ✅ Workflow integration

---

### 8. **Companies (Empresas B2B)**

**Status:** ✅ Ativo com retry

**Endpoints:**

- `GET /store/companies/{id}` - Detalhes da empresa
- `GET /store/companies/{id}/employees` - Funcionários

**Hooks:**

- `useCompany(id)` - Detalhes da empresa
- `useEmployees(companyId)` - Funcionários

**Rotas:**

- `/account/@dashboard/company` - Gestão da empresa

**Data Layer:**

- `lib/data/companies.ts` - Empresas com retry

**Features:**

- ✅ Retry automático (3x)
- ✅ Employee management
- ✅ Approval settings

---

### 9. **Customer (Cliente)**

**Status:** ✅ Ativo com retry

**Endpoints:**

- `GET /store/customers/me` - Dados do cliente
- `GET /store/customers/me/addresses` - Endereços

**Hooks:**

- `useCustomer()` - Dados do cliente
- `useAddresses()` - Endereços

**Rotas:**

- `/account/@dashboard/profile` - Perfil
- `/account/@dashboard/addresses` - Endereços

**Data Layer:**

- `lib/data/customer.ts` - Cliente com retry

**Features:**

- ✅ Retry automático (3x)
- ✅ Employee data
- ✅ Company association

---

### 10. **Auth (Autenticação)**

**Status:** ✅ Ativo com retry

**Endpoints:**

- `POST /auth/customer/emailpass` - Login
- `POST /auth/customer/emailpass/register` - Registro
- `GET /auth/session` - Sessão atual

**Hooks:**

- `useAuth()` - Estado de autenticação
- `useSession()` - Sessão atual

**Rotas:**

- `/account/@login` - Página de login

**Features:**

- ✅ Retry automático (3x)
- ✅ Cookie-based sessions
- ✅ JWT tokens

---

### 11. **Catalog (Catálogo Unificado)**

**Status:** ✅ Ativo com retry e fallback

**Endpoints:**

- `GET /api/catalog/products` - Produtos
- `GET /api/catalog/categories` - Categorias
- `GET /api/catalog/kits` - Kits solares
- `GET /api/catalog/manufacturers` - Fabricantes
- `GET /api/catalog/search` - Busca
- `GET /store/catalog` - Catálogo Medusa
- `GET /store/catalog/{category}` - Por categoria
- `GET /store/catalog/{category}/{id}` - Produto específico
- `GET /store/catalog/manufacturers` - Fabricantes
- `GET /store/catalog/search` - Busca

**Hooks:**

- `useCatalog()` - Acesso ao catálogo
- `useCatalogAPI()` - API client
- `useCatalogSearch(query, filters)` - Busca

**Rotas:**

- `/produtos` - Catálogo geral
- `/produtos/{category}` - Por categoria
- `/produtos/kits` - Kits
- `/search` - Busca

**Data Layer:**

- `lib/api/catalog-client.ts` - Client API
- `lib/data/catalog-enriched.ts` - Dados enriquecidos

**Features:**

- ✅ Retry automático (3x)
- ✅ Fallback para dados locais
- ✅ Cache ISR (1 hora)
- ✅ Busca semântica
- ✅ Filtros avançados

---

### 12. **Solar CV (Visão Computacional)**

**Status:** ✅ Ativo com retry

**Endpoints:**

- `POST /store/solar-detection` - Detecção de painéis
- `POST /store/thermal-analysis` - Análise térmica
- `POST /store/photogrammetry` - Fotogrametria 3D

**Hooks:**

- `useSolarCV()` - Serviços CV
- `usePanelDetection()` - Detecção de painéis
- `useThermalAnalysis()` - Análise térmica

**Rotas:**

- `/solar-cv` - Dashboard de CV

**Features:**

- ✅ Retry automático (3x)
- ✅ Upload de imagens
- ✅ Processamento assíncrono
- ✅ NREL Panel Segmentation
- ✅ PV-Hawk integration

---

### 13. **Hélio (IA Assistant)**

**Status:** ✅ Ativo com retry

**Endpoints:**

- `POST /store/rag/ask-helio` - Chat com Hélio
- `POST /store/rag/recommend-products` - Recomendações
- `POST /store/rag/search` - Busca RAG

**Hooks:**

- `useHelio()` - Chat com Hélio
- `useHelioChat()` - Gerenciar conversação

**Rotas:**

- `/dimensionamento` - Assistente de dimensionamento

**Features:**

- ✅ Retry automático (3x)
- ✅ RAG com Qdrant
- ✅ LangChain integration
- ✅ Streaming responses

---

## 🔄 Fluxos de Dados

### Fluxo 1: Adicionar ao Carrinho

```
User Action
    ↓
AddToCart Button
    ↓
addToCartEventBus.emit()
    ↓
CartContext.handleOptimisticAddToCart()
    ├─→ Optimistic Update (instant UI)
    └─→ addToCartBulk()
            ├─→ retryWithBackoff()
            │     ├─→ Attempt 1
            │     ├─→ Attempt 2 (1s delay)
            │     └─→ Attempt 3 (2s delay)
            ↓
        Success: Revalidate cache
        Error: Rollback optimistic update
```

### Fluxo 2: Busca de Produtos

```
Search Input
    ↓
useCatalogSearch(query, filters)
    ↓
Fetch /api/catalog/search
    ├─→ Check cache (1 hour TTL)
    ├─→ Load unified schemas
    ├─→ Apply filters
    └─→ Paginate results
        ↓
    Return with cache headers
        ↓
    Client receives data
        ├─→ Display products
        └─→ Update URL params
```

### Fluxo 3: Cotação (Quote)

```
Cart Ready
    ↓
Request Quote Button
    ↓
createQuote(cartId)
    ├─→ POST /store/quotes
    │     └─→ Create draft order
    ↓
Quote Created
    ├─→ Revalidate quotes cache
    └─→ Redirect to quote details
        ↓
    Merchant reviews & sends
        ↓
    Customer receives notification
        ├─→ Accept → Convert to order
        └─→ Reject → Add message
```

### Fluxo 4: Aprovação (Approval)

```
Cart Exceeds Limit
    ↓
Auto-create Approval
    ├─→ POST /store/carts/{id}/approvals
    ↓
Approval Pending
    ├─→ Notify approvers
    └─→ Block cart completion
        ↓
    Approver reviews
        ├─→ Approve → Enable checkout
        └─→ Reject → Notify requester
```

---

## 🎣 Hooks Personalizados

### Core Hooks

```typescript
// Cart
const { cart, handleDeleteItem, handleUpdateCartQuantity, isUpdatingCart } = useCart()

// Products
const { data, loading, error, refetch } = useProducts({ category: 'panels', limit: 20 })
const { data: product } = useProduct('prod_123', 'panels')

// Search
const { data: results } = useCatalogSearch('monocristalino', { 
  category: 'panels',
  minPrice: 500 
})

// Categories
const { data: categories } = useCategories(true) // includeStats

// Kits
const { data: kits } = useKits({ minPower: 5, maxPower: 15 })

// Integration Status
const status = useIntegrationStatus('cart') // 'active' | 'fallback' | 'offline'

// Route Integration
const { currentModule, pathname } = useRouteIntegration()

// Online Status
const isOnline = useOnlineStatus()

// Combined
const { currentModule, isOnline, integrationStatus, shouldUseFallback } = useIntegrations()
```

---

## 🛣️ Rotas e Endpoints

### Mapa Completo de Rotas

| Rota | Módulo | Endpoints | Cache | Retry |
|------|--------|-----------|-------|-------|
| `/` | home | `/store/products` | ISR 3600s | ✅ |
| `/cart` | cart | `/store/carts/{id}` | force-cache | ✅ |
| `/checkout` | cart | `/store/carts/{id}/complete` | no-cache | ✅ |
| `/products` | products | `/store/products` | ISR 3600s | ✅ |
| `/products/{handle}` | products | `/store/products/{id}` | ISR 3600s | ✅ |
| `/produtos` | catalog | `/api/catalog/products` | ISR 3600s | ✅ |
| `/produtos/{category}` | catalog | `/api/catalog/products?category={category}` | ISR 3600s | ✅ |
| `/produtos/kits` | catalog | `/api/catalog/kits` | ISR 3600s | ✅ |
| `/search` | catalog | `/api/catalog/search` | ISR 300s | ✅ |
| `/categories/{...category}` | categories | `/store/product-categories` | force-cache | ✅ |
| `/collections/{handle}` | collections | `/store/collections` | force-cache | ✅ |
| `/account/@login` | auth | `/auth/customer/emailpass` | no-cache | ✅ |
| `/account/@dashboard` | customer | `/store/customers/me` | force-cache | ✅ |
| `/account/@dashboard/profile` | customer | `/store/customers/me` | force-cache | ✅ |
| `/account/@dashboard/addresses` | customer | `/store/customers/me/addresses` | force-cache | ✅ |
| `/account/@dashboard/orders` | orders | `/store/orders` | force-cache | ✅ |
| `/account/@dashboard/orders/details/{id}` | orders | `/store/orders/{id}` | force-cache | ✅ |
| `/account/@dashboard/quotes` | quotes | `/store/quotes` | force-cache | ✅ |
| `/account/@dashboard/quotes/details/{id}` | quotes | `/store/quotes/{id}` | force-cache | ✅ |
| `/account/@dashboard/approvals` | approvals | `/store/approvals` | force-cache | ✅ |
| `/account/@dashboard/company` | companies | `/store/companies/{id}` | force-cache | ✅ |
| `/order/confirmed/{id}` | orders | `/store/orders/{id}` | force-cache | ✅ |
| `/cotacao` | quotes | `/store/quotes` | no-cache | ✅ |
| `/dimensionamento` | helio | `/store/rag/ask-helio` | no-cache | ✅ |
| `/solar-cv` | solar-cv | `/store/solar-detection` | no-cache | ✅ |
| `/solucoes` | catalog | `/api/catalog/products` | ISR 3600s | ✅ |
| `/store` | catalog | `/api/catalog/products` | ISR 3600s | ✅ |

---

## 💾 Gerenciamento de Estado

### Contexts

```typescript
// CartContext
<CartProvider cart={cart}>
  {children}
</CartProvider>

// ModalContext
<ModalProvider>
  {children}
</ModalProvider>

// SalesChannelContext
<SalesChannelProvider>
  {children}
</SalesChannelProvider>

// LeadQuoteContext
<LeadQuoteProvider>
  {children}
</LeadQuoteProvider>
```

### State Flow

```
Server Component (RSC)
    ↓
Fetch data with retry
    ↓
Pass to Client Component
    ↓
Context Provider
    ↓
useOptimistic for UI updates
    ↓
Server action on mutation
    ↓
Revalidate cache
    ↓
Re-render with fresh data
```

---

## 🛡️ Resiliência e Fallback

### Retry Strategy

```typescript
// Configuração
MAX_RETRIES = 3
RETRY_DELAY_MS = 1000

// Backoff exponencial
Attempt 1: immediate
Attempt 2: 1s delay
Attempt 3: 2s delay
Attempt 4: fail
```

### Fallback Strategy

```typescript
// Products/Catalog
Backend API failed
    ↓
Load from local unified schemas
    ↓
Return with fromFallback: true

// Cart
Backend API failed
    ↓
Create local cart in memory
    ↓
Sync when backend returns
```

### Circuit Breaker

```typescript
// Configuração
failureThreshold: 5
recoveryTimeout: 60000 (1 min)

// Estados
closed: normal operation
open: all requests fail fast
half-open: test if recovered
```

---

## 🚀 Cache e Performance

### Cache Strategy

| Tipo | TTL | Revalidate | Uso |
|------|-----|------------|-----|
| force-cache | ∞ | manual | Cart, Orders |
| ISR | 3600s | on-demand | Products, Catalog |
| ISR | 300s | on-demand | Search |
| no-cache | 0 | always | Auth, Quotes |

### Performance Optimizations

✅ **Image Optimization**

- Next.js Image component
- WebP format
- Lazy loading
- Priority hints

✅ **Code Splitting**

- Dynamic imports
- Route-based splitting
- Component-level splitting

✅ **Data Fetching**

- Parallel requests
- Prefetching
- Deduplication

✅ **Caching**

- Redis for sessions
- Next.js cache
- Browser cache
- CDN (Cloudflare)

---

## 📊 Monitoring

### Métricas Coletadas

- API response times
- Cache hit rates
- Error rates
- Retry attempts
- Fallback usage
- Circuit breaker state

### Health Checks

```typescript
// Per module
GET /api/health/{module}

// All modules
GET /api/health
```

---

## ✅ Checklist de Integração

- [x] Cart: retry + fallback + optimistic
- [x] Products: retry + fallback + cache
- [x] Categories: retry + cache
- [x] Collections: retry + cache
- [x] Orders: retry + cache
- [x] Quotes: retry + cache
- [x] Approvals: retry + cache
- [x] Companies: retry + cache
- [x] Customer: retry + cache
- [x] Auth: retry
- [x] Catalog: retry + fallback + cache
- [x] Solar CV: retry
- [x] Hélio: retry
- [x] Hooks personalizados
- [x] Circuit breaker
- [x] Offline detection
- [x] Integration registry
- [x] Health monitoring

---

## 🎯 Próximos Passos

1. ✅ Implementar testes E2E com Playwright
2. ✅ Adicionar métricas com Sentry
3. ✅ Implementar feature flags com LaunchDarkly
4. ✅ Adicionar logging estruturado com Winston
5. ✅ Criar dashboard de health monitoring

---

**Última Atualização:** 7 de Outubro de 2025  
**Responsável:** YSH Dev Team  
**Status:** ✅ Produção
