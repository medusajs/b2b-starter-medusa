# API Resilient System - YSH Store

Sistema de APIs resiliente com fallback automático para catálogo local quando o backend Medusa está offline.

## 🎯 Objetivo

Garantir que o storefront continue funcionando mesmo se o backend Medusa estiver inacessível, fornecendo:

- Listagem de produtos do catálogo unificado
- Detalhes de produtos
- Carrinho local (localStorage)
- Experiência degradada mas funcional

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│  Resilient API Client (resilient.ts)                        │
│  - Tenta backend Medusa primeiro                            │
│  - Retry com exponential backoff                            │
│  - Circuit breaker pattern                                  │
│  - Fallback automático se falhar                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │  Backend OK? ✓
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend Medusa (http://localhost:9000)                     │
│  - Produtos completos com preços dinâmicos                  │
│  - Carrinho persistente                                     │
│  - Checkout e pagamentos                                    │
└─────────────────────────────────────────────────────────────┘

                 │  Backend OFF? ✗
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Fallback API (fallback.ts)                                 │
│  - Lê catálogo unificado (JSON)                             │
│  - Carrega IMAGE_MAP.json                                   │
│  - Carrinho em localStorage                                 │
│  - Dados estáticos mas funcionais                           │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Arquivos

### 1. `fallback.ts`

API que fornece dados do catálogo local quando o backend está offline.

**Funcionalidades**:

- `checkBackendHealth()` - Verifica se backend está online
- `loadCatalogCategory()` - Carrega categoria do catálogo unificado
- `fallbackListProducts()` - Lista produtos com paginação
- `fallbackGetProduct()` - Busca produto por ID/SKU
- `fallbackGetRelatedProducts()` - Produtos relacionados
- `fallbackCreateCart()` - Cria carrinho local (localStorage)
- `fallbackAddToCart()` - Adiciona item ao carrinho local

### 2. `resilient.ts`

Cliente API que tenta backend primeiro e faz fallback automaticamente.

**Funcionalidades**:

- `listProducts()` - Lista produtos (backend ou fallback)
- `getProduct()` - Busca produto (backend ou fallback)
- `getFeaturedProducts()` - Produtos em destaque
- `createCart()` - Cria carrinho (backend ou local)
- `addToCart()` - Adiciona ao carrinho (backend ou local)
- `healthCheck()` - Verifica saúde do backend

**Features**:

- ✅ Retry automático com exponential backoff (1s, 2s, 4s)
- ✅ Timeout de 10s por requisição
- ✅ Circuit breaker (após 3 falhas consecutivas usa fallback)
- ✅ Cache do React Server Components
- ✅ Fallback transparente para o usuário

## 🚀 Como Usar

### Exemplo 1: Listar Produtos

```typescript
import { ResilientAPI } from '@/lib/api/resilient'

export default async function ProductsPage() {
  // Tenta backend, fallback automático se offline
  const response = await ResilientAPI.listProducts({
    category: 'inverters',
    limit: 12,
    fallback: true // ativa fallback (padrão: true)
  })
  
  const { data, fromFallback, backendOnline } = response
  
  return (
    <div>
      {fromFallback && <p>Modo Offline - Catálogo Local</p>}
      
      {data?.products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### Exemplo 2: Detalhes de Produto

```typescript
import { ResilientAPI } from '@/lib/api/resilient'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const response = await ResilientAPI.getProduct(params.id)
  
  if (!response.data?.product) {
    return <div>Produto não encontrado</div>
  }
  
  const { product } = response.data
  const { fromFallback } = response
  
  return (
    <div>
      {fromFallback && <FallbackBadge />}
      <h1>{product.title}</h1>
      <p>{product.description}</p>
      <p>R$ {product.price}</p>
    </div>
  )
}
```

### Exemplo 3: Adicionar ao Carrinho

```typescript
'use client'

import { ResilientAPI } from '@/lib/api/resilient'
import { useState } from 'react'

export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  
  async function handleAddToCart() {
    setLoading(true)
    
    try {
      const response = await ResilientAPI.addToCart(
        'cart_id_here',
        productId,
        1
      )
      
      if (response.fromFallback) {
        alert('Produto adicionado ao carrinho local (modo offline)')
      } else {
        alert('Produto adicionado ao carrinho!')
      }
    } catch (error) {
      alert('Erro ao adicionar produto')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <button onClick={handleAddToCart} disabled={loading}>
      {loading ? 'Adicionando...' : 'Adicionar ao Carrinho'}
    </button>
  )
}
```

### Exemplo 4: Health Check

```typescript
import { ResilientAPI } from '@/lib/api/resilient'

export async function HealthIndicator() {
  const isHealthy = await ResilientAPI.healthCheck()
  const status = ResilientAPI.getBackendStatus()
  
  return (
    <div>
      <p>Backend: {status.online ? '🟢 Online' : '🔴 Offline'}</p>
      <p>Erros consecutivos: {status.errorCount}</p>
      {status.lastError && <p>Último erro: {status.lastError}</p>}
    </div>
  )
}
```

## 🎨 Componentes UI

### OfflineBanner

Banner que aparece no topo do site quando o backend está offline.

```tsx
import { OfflineBanner } from '@/components/ui/offline-banner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <OfflineBanner />
        {children}
      </body>
    </html>
  )
}
```

### FallbackBadge

Badge que indica que os dados vêm do catálogo local.

```tsx
import { FallbackBadge } from '@/components/ui/offline-banner'

{fromFallback && <FallbackBadge />}
```

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# .env.local

# URL do backend Medusa
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Path para catálogo unificado (opcional)
CATALOG_PATH=/path/to/ysh-erp/data/catalog/unified_schemas

# Path para mapa de imagens (opcional)
IMAGE_MAP_PATH=/path/to/ysh-erp/data/catalog/images/IMAGE_MAP.json
```

### Ajustar Timeouts e Retries

Edite as constantes em `resilient.ts`:

```typescript
const MAX_RETRIES = 3            // Máximo de tentativas
const RETRY_DELAY_MS = 1000      // Delay inicial entre retries (exponential)
const REQUEST_TIMEOUT_MS = 10000 // Timeout de requisição (10s)
```

### Ajustar Circuit Breaker

Edite as constantes em `fallback.ts`:

```typescript
const HEALTH_CHECK_TIMEOUT = 5000      // Timeout do health check (5s)
const HEALTH_CHECK_INTERVAL = 30000    // Intervalo de verificação (30s)
const MAX_ERROR_COUNT = 3              // Erros antes de ativar fallback
```

## 📊 Health Check Endpoint

O sistema inclui um endpoint de health check:

```bash
GET /api/health
```

**Response**:

```json
{
  "healthy": true,
  "backend": {
    "online": true,
    "lastCheck": "2025-10-07T12:00:00.000Z",
    "errorCount": 0,
    "lastError": null
  },
  "fallback": {
    "available": true,
    "active": false
  },
  "timestamp": "2025-10-07T12:00:00.000Z"
}
```

**Status Codes**:

- `200` - Backend saudável
- `503` - Backend offline (fallback ativo)
- `500` - Erro interno

## 🧪 Testes

### Testar Modo Offline

1. **Desligar backend Medusa**:

```bash
# Pare o container ou servidor Medusa
docker-compose stop backend
```

2. **Acessar storefront**:

```bash
npm run dev
```

3. **Verificar comportamento**:

- ✅ Banner de offline aparece no topo
- ✅ Produtos carregam do catálogo local
- ✅ Carrinho funciona com localStorage
- ✅ Badge "Catálogo Local" aparece nos produtos

### Testar Reconexão

1. **Religar backend**:

```bash
docker-compose start backend
```

2. **Clicar em "Reconectar"** no banner offline

3. **Verificar**:

- ✅ Banner desaparece
- ✅ Dados voltam a vir do backend
- ✅ Carrinho sincroniza (se implementado)

## 🎯 Funcionalidades Disponíveis

### Com Backend Online (Modo Normal)

- ✅ Listagem completa de produtos
- ✅ Detalhes de produtos
- ✅ Preços dinâmicos e promoções
- ✅ Carrinho persistente
- ✅ Checkout e pagamentos
- ✅ Pedidos e rastreamento
- ✅ Cotações B2B
- ✅ Chat Hélio (RAG)

### Com Backend Offline (Modo Fallback)

- ✅ Listagem de produtos (catálogo estático)
- ✅ Detalhes de produtos
- ✅ Busca por nome/SKU/fabricante
- ✅ Filtro por categoria
- ✅ Carrinho local (localStorage)
- ⚠️ Preços estáticos (última sincronização)
- ❌ Checkout e pagamentos (indisponíveis)
- ❌ Pedidos (indisponíveis)
- ❌ Chat Hélio (indisponíveis)

## 🔄 Sincronização de Carrinho

Quando o backend volta online, você pode implementar sincronização:

```typescript
async function syncLocalCartToBackend() {
  const localCart = FallbackAPI.getCart()
  if (!localCart) return
  
  // Cria carrinho no backend
  const { data } = await ResilientAPI.createCart(false)
  if (!data?.cart) return
  
  // Adiciona itens do carrinho local
  for (const item of localCart.items) {
    await ResilientAPI.addToCart(
      data.cart.id,
      item.product_id,
      item.quantity,
      false
    )
  }
  
  // Limpa carrinho local
  FallbackAPI.clearCart()
  
  return data.cart
}
```

## 📈 Monitoramento

### Logs no Console

O sistema gera logs úteis para debug:

```
[Resilient] Retrying after 1000ms... (2 retries left)
[Resilient] Error fetching /store/products: HTTP 503
[Resilient] Using fallback for listProducts
[Fallback] Failed to load category inverters: ENOENT
```

### Métricas Sugeridas

Para produção, adicione métricas:

```typescript
// Em resilient.ts
import { trackMetric } from '@/lib/monitoring'

trackMetric('api.backend.requests', 1, { endpoint, success: true })
trackMetric('api.backend.latency', latency, { endpoint })
trackMetric('api.fallback.activations', 1, { reason: 'timeout' })
```

## 🚨 Tratamento de Erros

### Erros Silenciados

- Timeouts (tenta fallback automaticamente)
- HTTP 5xx (tenta fallback)
- Network errors (tenta fallback)

### Erros Propagados

- HTTP 4xx (erro do cliente, não usa fallback)
- Validações (produto não encontrado no fallback)

## 🎓 Boas Práticas

1. **Sempre use fallback em páginas públicas**:

```typescript
const response = await ResilientAPI.listProducts({ fallback: true })
```

2. **Desabilite fallback em ações críticas**:

```typescript
// Checkout DEVE usar backend
const order = await createOrder({ fallback: false })
```

3. **Informe o usuário quando em modo offline**:

```tsx
{fromFallback && (
  <div className="alert">
    Você está navegando no catálogo offline. 
    Algumas funcionalidades estão limitadas.
  </div>
)}
```

4. **Cache agressivo para dados estáticos**:

```typescript
// Produtos mudam pouco, cache por 1h
const response = await ResilientAPI.getProduct(id, true)
```

5. **Monitore saúde periodicamente**:

```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    await ResilientAPI.healthCheck()
  }, 30000) // 30s
  
  return () => clearInterval(interval)
}, [])
```

## 🔮 Próximos Passos

- [ ] Sincronização automática de carrinho local → backend
- [ ] Cache Redis para fallback mais rápido
- [ ] Service Worker para offline completo (PWA)
- [ ] Métricas e alertas de fallback (DataDog, Sentry)
- [ ] UI de "Modo Offline" mais elaborada
- [ ] Sincronização em background quando reconectar

---

**Mantido por**: Equipe YSH Dev  
**Última atualização**: 07/10/2025  
**Versão**: 1.0.0
