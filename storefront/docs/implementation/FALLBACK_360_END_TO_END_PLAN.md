# 🛡️ Sistema de Fallback End-to-End 360º - YSH Storefront

> **Data:** 13 de Outubro de 2025  
> **Status:** 🚧 Em Implementação  
> **Objetivo:** Garantir resiliência completa em todas as buyer journeys

---

## 📋 Visão Geral

### Objetivo

Implementar um sistema de fallback robusto e recuperável que garanta que **nenhuma jornada do comprador** seja interrompida por falhas de API do backend. O sistema deve:

1. ✅ **Detectar** falhas automaticamente
2. ✅ **Recuperar** dados de fontes alternativas
3. ✅ **Manter** estado local quando necessário
4. ✅ **Sincronizar** automaticamente quando backend retornar
5. ✅ **Informar** usuário sobre status de forma transparente
6. ✅ **Rastrear** métricas de fallback para monitoring

### Princípios de Design

```typescript
// Princípios fundamentais do sistema de fallback

1. **Fail Gracefully** - Nunca mostrar tela branca ou erro genérico
2. **Recover Automatically** - Retry automático com backoff exponencial
3. **Cache Smart** - Cache inteligente com invalidação apropriada
4. **Inform User** - Comunicação clara sobre estado da aplicação
5. **Preserve Data** - Estado local persistido até confirmação
6. **Sync Later** - Queue de operações pendentes com sync automático
```

---

## 🗺️ Mapeamento de Jornadas e APIs Críticas

### Jornada 1: Descoberta → Compra Simples

**APIs Críticas:**

| Endpoint | Método | Criticidade | Fallback Atual | Fallback Necessário |
|----------|--------|-------------|----------------|---------------------|
| `/store/products` | GET | 🔴 Alta | ✅ 3 níveis | - |
| `/store/products/:id` | GET | 🔴 Alta | ✅ 3 níveis | - |
| `/store/categories` | GET | 🟡 Média | ✅ 3 níveis | - |
| `/store/carts` | POST | 🔴 Alta | ❌ Nenhum | Local storage |
| `/store/carts/:id/line-items` | POST | 🔴 Alta | ❌ Nenhum | Queue + retry |
| `/store/carts/:id` | GET | 🟡 Média | ❌ Nenhum | Local cache |
| `/store/checkout` | POST | 🔴 Crítica | ❌ Nenhum | Queue + validation |

**Pontos de Falha:**
1. ❌ **Add to Cart** - Sem fallback, falha bloqueia jornada
2. ❌ **Checkout** - Sem retry, pode perder pedido
3. ❌ **Cart Sync** - Se backend cai, carrinho some

---

### Jornada 2: Análise Solar → Kit Completo

**APIs Críticas:**

| Endpoint | Método | Criticidade | Fallback Atual | Fallback Necessário |
|----------|--------|-------------|----------------|---------------------|
| `/api/solar-calculator` | POST | 🔴 Alta | ❌ Nenhum | Local calculation |
| `/api/viability` | POST | 🟡 Média | ❌ Nenhum | Simplified calc |
| `/api/tariffs` | GET | 🟡 Média | ❌ Nenhum | Cached database |
| `/api/finance/bacen-rates` | GET | 🟢 Baixa | ✅ Cache 24h | - |
| `/store/products?kits` | GET | 🔴 Alta | ✅ 3 níveis | - |

**Pontos de Falha:**
1. ❌ **Solar Calculator** - Sem fallback, bloqueia dimensionamento
2. ❌ **Viability API** - Sem fallback, usuário perde análise
3. ⚠️ **Tariffs** - Dados podem estar desatualizados

---

### Jornada 3: Lead → Cliente B2B

**APIs Críticas:**

| Endpoint | Método | Criticidade | Fallback Necessário |
|----------|--------|-------------|---------------------|
| `/api/onboarding/leads` | POST | 🔴 Alta | Queue local + sync |
| `/api/onboarding/geocode` | GET | 🟡 Média | Fallback Google Maps |
| `/store/customers` | POST | 🔴 Alta | Queue local + retry |
| `/store/customers/me` | GET | 🟡 Média | Session cache |
| `/api/documents/upload` | POST | 🟡 Média | Queue com multipart |

**Pontos de Falha:**
1. ❌ **Lead Creation** - Sem queue, perde leads
2. ❌ **Customer Registration** - Sem retry, usuário desiste
3. ❌ **Document Upload** - Sem queue, perde arquivos

---

### Jornada 4: Cotação B2B → Pedido

**APIs Críticas:**

| Endpoint | Método | Criticidade | Fallback Necessário |
|----------|--------|-------------|---------------------|
| `/store/quotes` | POST | 🔴 Alta | Queue local + sync |
| `/store/quotes/:id` | GET | 🟡 Média | Local cache |
| `/store/approvals` | POST | 🔴 Alta | Queue + notification |
| `/store/approvals/:id` | PATCH | 🔴 Alta | Queue + retry |
| `/store/orders` | POST | 🔴 Crítica | Queue + validation |

**Pontos de Falha:**
1. ❌ **Quote Creation** - Sem queue, perde cotações
2. ❌ **Approval Flow** - Sem retry, bloqueia aprovações
3. ❌ **Order Placement** - Sem queue, pedidos podem ser perdidos

---

### Jornada 5: Computer Vision → Proposta

**APIs Críticas:**

| Endpoint | Método | Criticidade | Fallback Necessário |
|----------|--------|-------------|---------------------|
| `/api/solar-cv/detect` | POST | 🟡 Média | Manual fallback UI |
| `/api/solar-cv/thermal` | POST | 🟢 Baixa | Optional feature |

**Pontos de Falha:**
1. ⚠️ **CV Detection** - Pode falhar, mas tem alternativa manual

---

### Jornada 7: Pós-Venda → Suporte

**APIs Críticas:**

| Endpoint | Método | Criticidade | Fallback Necessário |
|----------|--------|-------------|---------------------|
| `/store/orders/:id` | GET | 🟡 Média | Local cache |
| `/api/support/tickets` | POST | 🟡 Média | Queue local + email |
| `/api/tracking` | GET | 🟢 Baixa | Static message |

---

## 🏗️ Arquitetura do Sistema de Fallback

### Camadas de Resiliência

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: API Call with Retry Logic                        │
│  - Exponential backoff (1s, 2s, 4s, 8s)                   │
│  - Timeout detection (10s default)                         │
│  - Network error handling                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓ (falha)
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Cache Layer (IndexedDB/LocalStorage)             │
│  - Cached responses (TTL configurável)                      │
│  - Stale-while-revalidate pattern                          │
│  - Optimistic updates                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓ (falha)
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Local Queue & State Management                   │
│  - Pending operations queue                                 │
│  - Local state persistence                                  │
│  - Background sync when online                              │
└─────────────────────────────────────────────────────────────┘
                          ↓ (falha)
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: Graceful Degradation UI                          │
│  - Error boundaries                                         │
│  - Fallback UI components                                   │
│  - User-friendly messages                                   │
│  - Manual retry actions                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Componentes do Sistema

### 1. Resilient HTTP Client

**Arquivo:** `src/lib/http-client-resilient.ts`

```typescript
/**
 * Cliente HTTP resiliente com retry, timeout e fallback
 */

import { sdk } from "@/lib/config"

export interface RequestConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  cacheTTL?: number
  cacheKey?: string
  fallbackData?: any
}

export interface RequestResult<T> {
  data: T | null
  error: Error | null
  source: 'api' | 'cache' | 'fallback'
  timestamp: number
  isFallback: boolean
}

class ResilientHttpClient {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
  private pendingQueue: Map<string, RequestConfig> = new Map()
  private retryQueue: Map<string, { config: RequestConfig; attempts: number }> = new Map()

  /**
   * Faz request resiliente com retry e fallback
   */
  async request<T>(config: RequestConfig): Promise<RequestResult<T>> {
    const {
      url,
      method,
      body,
      headers = {},
      timeout = 10000,
      retries = 3,
      cacheTTL,
      cacheKey,
      fallbackData,
    } = config

    // 1. Tentar buscar do cache (se configurado)
    if (cacheKey && this.hasValidCache(cacheKey)) {
      const cached = this.getFromCache<T>(cacheKey)
      if (cached) {
        // Revalidate em background
        this.revalidateInBackground(config)
        return {
          data: cached,
          error: null,
          source: 'cache',
          timestamp: Date.now(),
          isFallback: false,
        }
      }
    }

    // 2. Tentar fazer request real
    try {
      const data = await this.executeWithRetry<T>(config, retries)
      
      // Salvar no cache se configurado
      if (cacheKey && cacheTTL) {
        this.saveToCache(cacheKey, data, cacheTTL)
      }

      // Remover da fila de retry se estava lá
      this.retryQueue.delete(cacheKey || url)

      return {
        data,
        error: null,
        source: 'api',
        timestamp: Date.now(),
        isFallback: false,
      }
    } catch (error) {
      console.error(`[ResilientHttpClient] Request failed after ${retries} retries:`, error)

      // 3. Tentar buscar do cache (mesmo expirado)
      if (cacheKey) {
        const staleCache = this.getFromCache<T>(cacheKey, true)
        if (staleCache) {
          console.warn('[ResilientHttpClient] Using stale cache')
          return {
            data: staleCache,
            error: error as Error,
            source: 'cache',
            timestamp: Date.now(),
            isFallback: true,
          }
        }
      }

      // 4. Usar fallback data se disponível
      if (fallbackData) {
        console.warn('[ResilientHttpClient] Using fallback data')
        return {
          data: fallbackData as T,
          error: error as Error,
          source: 'fallback',
          timestamp: Date.now(),
          isFallback: true,
        }
      }

      // 5. Adicionar à fila de retry se for operação crítica
      if (method !== 'GET') {
        this.addToRetryQueue(cacheKey || url, config)
      }

      // 6. Retornar erro
      return {
        data: null,
        error: error as Error,
        source: 'api',
        timestamp: Date.now(),
        isFallback: false,
      }
    }
  }

  /**
   * Executa request com retry e backoff exponencial
   */
  private async executeWithRetry<T>(
    config: RequestConfig,
    maxRetries: number
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Timeout da requisição
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), config.timeout)

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}${config.url}`,
          {
            method: config.method,
            headers: {
              'Content-Type': 'application/json',
              ...config.headers,
            },
            body: config.body ? JSON.stringify(config.body) : undefined,
            signal: controller.signal,
          }
        )

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        return data
      } catch (error) {
        lastError = error as Error
        
        // Não fazer retry no último attempt
        if (attempt < maxRetries) {
          // Backoff exponencial: 1s, 2s, 4s, 8s
          const delay = Math.pow(2, attempt) * 1000
          console.warn(
            `[ResilientHttpClient] Attempt ${attempt + 1}/${maxRetries + 1} failed. Retrying in ${delay}ms...`
          )
          await this.sleep(delay)
        }
      }
    }

    throw lastError || new Error('Request failed')
  }

  /**
   * Revalida cache em background
   */
  private async revalidateInBackground(config: RequestConfig): Promise<void> {
    try {
      const data = await this.executeWithRetry(config, 1)
      if (config.cacheKey && config.cacheTTL) {
        this.saveToCache(config.cacheKey, data, config.cacheTTL)
      }
    } catch (error) {
      // Silently fail - já estamos usando cache
      console.debug('[ResilientHttpClient] Background revalidation failed:', error)
    }
  }

  /**
   * Verifica se tem cache válido
   */
  private hasValidCache(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return false

    const age = Date.now() - cached.timestamp
    return age < cached.ttl
  }

  /**
   * Busca do cache
   */
  private getFromCache<T>(key: string, allowStale = false): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const age = Date.now() - cached.timestamp
    if (!allowStale && age >= cached.ttl) return null

    return cached.data as T
  }

  /**
   * Salva no cache
   */
  private saveToCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Adiciona à fila de retry
   */
  private addToRetryQueue(key: string, config: RequestConfig): void {
    this.retryQueue.set(key, { config, attempts: 0 })
  }

  /**
   * Processa fila de retry
   */
  async processRetryQueue(): Promise<void> {
    const entries = Array.from(this.retryQueue.entries())
    
    for (const [key, { config, attempts }] of entries) {
      if (attempts >= 10) {
        console.error(`[ResilientHttpClient] Max retry attempts reached for ${key}`)
        this.retryQueue.delete(key)
        continue
      }

      try {
        await this.request(config)
        console.log(`[ResilientHttpClient] Successfully processed queued request: ${key}`)
      } catch (error) {
        console.warn(`[ResilientHttpClient] Retry failed for ${key}. Attempt ${attempts + 1}/10`)
        this.retryQueue.set(key, { config, attempts: attempts + 1 })
      }
    }
  }

  /**
   * Limpa cache expirado
   */
  clearExpiredCache(): void {
    const now = Date.now()
    for (const [key, { timestamp, ttl }] of this.cache.entries()) {
      if (now - timestamp >= ttl) {
        this.cache.delete(key)
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Singleton
export const resilientHttp = new ResilientHttpClient()

// Setup: processar fila a cada 30s
if (typeof window !== 'undefined') {
  setInterval(() => {
    resilientHttp.processRetryQueue()
    resilientHttp.clearExpiredCache()
  }, 30000)
}
```

---

### 2. Cart Resilience Layer

**Arquivo:** `src/lib/data/cart-resilient.ts`

```typescript
/**
 * Camada de resiliência para operações de carrinho
 */

import { resilientHttp } from "@/lib/http-client-resilient"

interface LocalCart {
  id: string | null
  items: LocalCartItem[]
  lastSync: number
  pendingOperations: PendingOperation[]
}

interface LocalCartItem {
  variantId: string
  quantity: number
  title: string
  thumbnail?: string
  price: number
  addedAt: number
}

interface PendingOperation {
  id: string
  type: 'add' | 'update' | 'remove'
  data: any
  timestamp: number
  attempts: number
}

const STORAGE_KEY = 'ysh_local_cart'
const MAX_RETRY_ATTEMPTS = 5

class CartResilientLayer {
  /**
   * Adiciona item ao carrinho com fallback local
   */
  async addToCart(variantId: string, quantity: number): Promise<void> {
    // 1. Tentar adicionar no backend
    try {
      const result = await resilientHttp.request({
        url: '/store/carts/line-items',
        method: 'POST',
        body: { variantId, quantity },
        retries: 2,
        timeout: 5000,
      })

      if (result.data) {
        // Sucesso - atualizar cache local
        this.updateLocalCart(result.data)
        return
      }
    } catch (error) {
      console.warn('[CartResilience] Backend add failed, using local fallback')
    }

    // 2. Fallback: salvar localmente
    this.addToLocalCart(variantId, quantity)
    
    // 3. Adicionar à fila de sincronização
    this.queueOperation({
      id: `add-${variantId}-${Date.now()}`,
      type: 'add',
      data: { variantId, quantity },
      timestamp: Date.now(),
      attempts: 0,
    })
  }

  /**
   * Busca carrinho com fallback local
   */
  async getCart(): Promise<LocalCart> {
    // 1. Tentar buscar do backend
    const result = await resilientHttp.request<any>({
      url: '/store/carts',
      method: 'GET',
      retries: 1,
      timeout: 5000,
      cacheTTL: 60000, // 1 minuto
      cacheKey: 'cart',
    })

    if (result.data && !result.isFallback) {
      // Atualizar cache local
      this.updateLocalCart(result.data)
      return this.transformToLocalCart(result.data)
    }

    // 2. Fallback: buscar local
    return this.getLocalCart()
  }

  /**
   * Sincroniza carrinho local com backend
   */
  async syncCart(): Promise<boolean> {
    const localCart = this.getLocalCart()
    
    if (localCart.pendingOperations.length === 0) {
      return true // Nada para sincronizar
    }

    let successCount = 0
    const operations = [...localCart.pendingOperations]

    for (const op of operations) {
      try {
        if (op.attempts >= MAX_RETRY_ATTEMPTS) {
          console.error(`[CartResilience] Max attempts reached for operation ${op.id}`)
          this.removeFromQueue(op.id)
          continue
        }

        // Executar operação
        await this.executeOperation(op)
        
        // Remover da fila se sucesso
        this.removeFromQueue(op.id)
        successCount++
      } catch (error) {
        console.warn(`[CartResilience] Sync failed for operation ${op.id}:`, error)
        this.incrementOperationAttempts(op.id)
      }
    }

    return successCount === operations.length
  }

  /**
   * Verifica se há operações pendentes
   */
  hasPendingOperations(): boolean {
    const cart = this.getLocalCart()
    return cart.pendingOperations.length > 0
  }

  /**
   * Conta de itens no carrinho (local + backend)
   */
  getItemCount(): number {
    const cart = this.getLocalCart()
    return cart.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  // ============================================
  // Métodos privados
  // ============================================

  private getLocalCart(): LocalCart {
    if (typeof window === 'undefined') {
      return this.getEmptyCart()
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return this.getEmptyCart()

      return JSON.parse(stored)
    } catch (error) {
      console.error('[CartResilience] Failed to parse local cart:', error)
      return this.getEmptyCart()
    }
  }

  private saveLocalCart(cart: LocalCart): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    } catch (error) {
      console.error('[CartResilience] Failed to save local cart:', error)
    }
  }

  private addToLocalCart(variantId: string, quantity: number): void {
    const cart = this.getLocalCart()
    
    const existingIndex = cart.items.findIndex(item => item.variantId === variantId)
    
    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity
    } else {
      cart.items.push({
        variantId,
        quantity,
        title: 'Produto (sincronizando...)',
        price: 0,
        addedAt: Date.now(),
      })
    }

    this.saveLocalCart(cart)
  }

  private updateLocalCart(backendCart: any): void {
    const cart = this.getLocalCart()
    cart.id = backendCart.id
    cart.lastSync = Date.now()
    // Atualizar items com dados do backend
    cart.items = this.transformBackendItems(backendCart.items || [])
    this.saveLocalCart(cart)
  }

  private queueOperation(operation: PendingOperation): void {
    const cart = this.getLocalCart()
    cart.pendingOperations.push(operation)
    this.saveLocalCart(cart)
  }

  private removeFromQueue(operationId: string): void {
    const cart = this.getLocalCart()
    cart.pendingOperations = cart.pendingOperations.filter(op => op.id !== operationId)
    this.saveLocalCart(cart)
  }

  private incrementOperationAttempts(operationId: string): void {
    const cart = this.getLocalCart()
    const op = cart.pendingOperations.find(o => o.id === operationId)
    if (op) {
      op.attempts++
      this.saveLocalCart(cart)
    }
  }

  private async executeOperation(op: PendingOperation): Promise<void> {
    switch (op.type) {
      case 'add':
        await resilientHttp.request({
          url: '/store/carts/line-items',
          method: 'POST',
          body: op.data,
          retries: 1,
        })
        break
      case 'update':
        await resilientHttp.request({
          url: `/store/carts/line-items/${op.data.lineItemId}`,
          method: 'PATCH',
          body: { quantity: op.data.quantity },
          retries: 1,
        })
        break
      case 'remove':
        await resilientHttp.request({
          url: `/store/carts/line-items/${op.data.lineItemId}`,
          method: 'DELETE',
          retries: 1,
        })
        break
    }
  }

  private transformBackendItems(items: any[]): LocalCartItem[] {
    return items.map(item => ({
      variantId: item.variant_id,
      quantity: item.quantity,
      title: item.title,
      thumbnail: item.thumbnail,
      price: item.unit_price || 0,
      addedAt: Date.now(),
    }))
  }

  private transformToLocalCart(backendCart: any): LocalCart {
    return {
      id: backendCart.id,
      items: this.transformBackendItems(backendCart.items || []),
      lastSync: Date.now(),
      pendingOperations: [],
    }
  }

  private getEmptyCart(): LocalCart {
    return {
      id: null,
      items: [],
      lastSync: 0,
      pendingOperations: [],
    }
  }
}

// Singleton
export const cartResilience = new CartResilientLayer()

// Setup: sync a cada 60s
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (navigator.onLine) {
      cartResilience.syncCart().catch(console.error)
    }
  }, 60000)

  // Sync quando volta online
  window.addEventListener('online', () => {
    console.log('[CartResilience] Connection restored, syncing cart...')
    cartResilience.syncCart().catch(console.error)
  })
}
```

---

### 3. Error Boundary com Fallback UI

**Arquivo:** `src/components/error-boundary-resilient.tsx`

```typescript
'use client'

import React from 'react'
import { Button } from '@medusajs/ui'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundaryResilient extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    
    // Chamar callback se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Enviar para error tracking (Sentry, PostHog, etc.)
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('error_boundary_triggered', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      })
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600">
              Algo deu errado
            </h2>
            <p className="mt-2 text-gray-600">
              Ocorreu um erro inesperado. Seus dados estão seguros.
            </p>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Detalhes técnicos
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={this.handleReset} variant="secondary">
              Tentar novamente
            </Button>
            <Button onClick={() => window.location.href = '/'}>
              Voltar ao início
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

## 📊 Plano de Implementação

### Sprint 1: Fundação (Semana 1)

**Objetivo:** Implementar infraestrutura base de fallback

**Tasks:**

1. ✅ **ResilientHttpClient**
   - [ ] Criar cliente HTTP com retry e timeout
   - [ ] Implementar cache em memória
   - [ ] Implementar fila de retry
   - [ ] Testes unitários
   - **Estimativa:** 1 dia

2. ✅ **CartResilientLayer**
   - [ ] Implementar cache local de carrinho
   - [ ] Implementar fila de operações pendentes
   - [ ] Sincronização automática
   - [ ] Testes de integração
   - **Estimativa:** 1.5 dias

3. ✅ **ErrorBoundaryResilient**
   - [ ] Criar error boundary com UI de fallback
   - [ ] Integrar com error tracking
   - [ ] Adicionar em rotas críticas
   - **Estimativa:** 0.5 dia

4. ✅ **Monitoring Setup**
   - [ ] Setup PostHog events para fallbacks
   - [ ] Criar dashboard de métricas
   - [ ] Alertas para high fallback rate
   - **Estimativa:** 1 dia

**Total Sprint 1:** 4 dias

---

### Sprint 2: Cart & Checkout (Semana 2)

**Objetivo:** Garantir resiliência completa no fluxo de compra

**Tasks:**

1. ✅ **Integrar Cart Resilience**
   - [ ] Substituir calls diretas por `cartResilience`
   - [ ] UI indicator de pending sync
   - [ ] Toast notifications para sync events
   - **Estimativa:** 1 dia

2. ✅ **Checkout Resilience**
   - [ ] Queue de order placement
   - [ ] Validação local antes de submit
   - [ ] Retry automático com confirmação
   - **Estimativa:** 1.5 dias

3. ✅ **Payment Resilience**
   - [ ] Fallback para payment providers
   - [ ] Retry para payment confirmation
   - [ ] Estado intermediário com recovery
   - **Estimativa:** 1.5 dias

**Total Sprint 2:** 4 dias

---

### Sprint 3: Quotes & Approvals (Semana 3)

**Objetivo:** Resiliência em jornadas B2B

**Tasks:**

1. ✅ **Quote Creation Resilience**
   - [ ] Queue local de quotes
   - [ ] Sync automático
   - [ ] Draft offline
   - **Estimativa:** 1 dia

2. ✅ **Approval Flow Resilience**
   - [ ] Queue de approval decisions
   - [ ] Notificações com retry
   - [ ] Estado de pending sync
   - **Estimativa:** 1.5 dias

3. ✅ **Document Upload Resilience**
   - [ ] Queue de uploads com multipart
   - [ ] Progress tracking
   - [ ] Retry para falhas
   - **Estimativa:** 1.5 dias

**Total Sprint 3:** 4 dias

---

### Sprint 4: Solar & Advanced Features (Semana 4)

**Objetivo:** Resiliência em features avançadas

**Tasks:**

1. ✅ **Solar Calculator Offline**
   - [ ] Implementar cálculos localmente (PVLib.js)
   - [ ] Cache de dados de irradiação por estado
   - [ ] Fallback para calculations
   - **Estimativa:** 2 dias

2. ✅ **Viability & Finance Offline**
   - [ ] Cálculos simplificados localmente
   - [ ] Cache de taxas BACEN
   - [ ] Fallback UI
   - **Estimativa:** 1 dia

3. ✅ **Testing E2E com Falhas**
   - [ ] Playwright tests com network interceptors
   - [ ] Simular falhas em cada jornada
   - [ ] Validar fallbacks funcionam
   - **Estimativa:** 1 dia

**Total Sprint 4:** 4 dias

---

## 🎯 Métricas de Sucesso

### KPIs de Resiliência

| Métrica | Alvo | Como Medir |
|---------|------|------------|
| **Fallback Rate** | < 5% | % de requests que usam fallback |
| **Sync Success Rate** | > 98% | % de operações em queue sincronizadas |
| **Error Recovery Time** | < 60s | Tempo médio até sync após falha |
| **Data Loss Rate** | 0% | Operações perdidas definitivamente |
| **User Retry Rate** | < 10% | % de usuários que clicam "retry" |
| **Cart Abandonment (failures)** | < 2% | % de abandonos por erro técnico |

### Eventos de Tracking

```typescript
// PostHog events para monitoring

// 1. Fallback acionado
posthog.capture('fallback_triggered', {
  endpoint: string,
  method: string,
  error_type: string,
  fallback_source: 'cache' | 'local' | 'queue',
  journey: string,
})

// 2. Sync bem-sucedido
posthog.capture('sync_success', {
  operation_type: string,
  items_synced: number,
  queue_size: number,
  time_in_queue_ms: number,
})

// 3. Sync falhou
posthog.capture('sync_failed', {
  operation_type: string,
  attempts: number,
  error: string,
  will_retry: boolean,
})

// 4. Usuário retentou manualmente
posthog.capture('user_retry_action', {
  context: string,
  journey_step: string,
  success: boolean,
})
```

---

## 🧪 Testes

### Cenários de Teste

**1. Backend Completamente Offline**

```typescript
// Teste: Adicionar item ao carrinho com backend down
test('should add to cart locally when backend is down', async () => {
  // Setup: Simular backend offline
  await page.route('**/store/carts/**', route => route.abort())
  
  // Act: Adicionar produto ao carrinho
  await page.click('[data-testid="add-to-cart"]')
  
  // Assert: Item deve estar no carrinho local
  const count = await page.textContent('[data-testid="cart-count"]')
  expect(count).toBe('1')
  
  // Assert: UI deve mostrar "sync pendente"
  const syncIndicator = await page.locator('[data-testid="sync-pending"]')
  await expect(syncIndicator).toBeVisible()
})

// Teste: Sync automático quando backend volta
test('should sync cart when backend comes back online', async () => {
  // Setup: Carrinho local com 3 itens
  await page.evaluate(() => {
    localStorage.setItem('ysh_local_cart', JSON.stringify({
      items: [
        { variantId: 'var_1', quantity: 2 },
        { variantId: 'var_2', quantity: 1 },
      ],
      pendingOperations: [
        { type: 'add', data: { variantId: 'var_1', quantity: 2 } },
      ],
    }))
  })
  
  // Act: Restaurar backend e esperar sync
  await page.reload()
  await page.waitForTimeout(2000) // Esperar sync automático
  
  // Assert: Operações pendentes devem ser zeradas
  const pendingOps = await page.evaluate(() => {
    const cart = JSON.parse(localStorage.getItem('ysh_local_cart') || '{}')
    return cart.pendingOperations?.length || 0
  })
  expect(pendingOps).toBe(0)
})
```

**2. Timeout de API**

```typescript
// Teste: Timeout deve acionar cache
test('should use cache when API times out', async () => {
  // Setup: Simular timeout (delay > 10s)
  await page.route('**/store/products', route => {
    return new Promise(resolve => {
      setTimeout(() => resolve(route.fulfill({ body: '[]' })), 15000)
    })
  })
  
  // Act: Navegar para página de produtos
  await page.goto('/br/products')
  
  // Assert: Produtos do cache devem ser exibidos
  const products = await page.locator('[data-testid="product-card"]')
  await expect(products).toHaveCount(12) // Cache tinha 12 produtos
  
  // Assert: Mensagem de fallback deve aparecer
  const message = await page.textContent('[data-testid="fallback-message"]')
  expect(message).toContain('cache')
})
```

---

## 📚 Documentação

### User Guide

**Para Usuários Finais:**

**"O que significa 'Sincronizando...'?"**

Quando você adiciona produtos ao carrinho e vê a mensagem "Sincronizando...", significa que suas ações estão sendo salvas localmente no seu navegador e serão enviadas ao servidor assim que a conexão estiver estável.

Seus produtos **não serão perdidos** e você pode continuar comprando normalmente.

**"Posso finalizar a compra enquanto está sincronizando?"**

Sim! Antes de processar o pagamento, o sistema garante que todos os itens sejam confirmados com o servidor. Se houver algum problema, você será avisado antes de pagar.

---

### Developer Guide

**Como adicionar fallback em uma nova feature:**

```typescript
// 1. Use ResilientHttpClient para todas as API calls
import { resilientHttp } from '@/lib/http-client-resilient'

// 2. Configure cache e fallback data
const result = await resilientHttp.request({
  url: '/store/my-endpoint',
  method: 'GET',
  cacheTTL: 300000, // 5 minutos
  cacheKey: 'my-feature-data',
  fallbackData: [], // Dados padrão se tudo falhar
  retries: 3,
})

// 3. Trate o source do resultado
if (result.isFallback) {
  // Mostrar UI indicando dados podem estar desatualizados
  showWarning('Dados podem estar desatualizados')
}

// 4. Use ErrorBoundary para proteção
<ErrorBoundaryResilient>
  <MyFeatureComponent />
</ErrorBoundaryResilient>
```

---

## 🚀 Próximos Passos

### Após Implementação Completa

1. **Performance Optimization**
   - IndexedDB em vez de LocalStorage
   - Service Worker para cache avançado
   - Background Sync API do browser

2. **Advanced Features**
   - Offline-first mode completo
   - PWA com manifest e service worker
   - Push notifications para sync status

3. **Monitoring Avançado**
   - APM integration (New Relic, DataDog)
   - Real User Monitoring (RUM)
   - Session replay para debug

---

**Documento criado em:** 13 de Outubro de 2025  
**Autor:** Equipe YSH Solar Hub  
**Status:** 🚧 Em Implementação  
**Próxima revisão:** Após Sprint 1

