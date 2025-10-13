# 🎯 STOREFRONT V7 - Plano de Execução

**Data:** 2025-01-XX  
**Escopo:** storefront/ (Next 15, React 19, TS 5)  
**Objetivo:** Performance (Web Vitals), SEO, A11y, Segurança, PLG

---

## ✅ Status Atual (Análise)

### Infraestrutura Existente
- ✅ HTTP client unificado (`src/lib/http.ts`)
  - Timeout/backoff/jitter/429 handling
  - Test-friendly (1ms delays em test)
- ✅ `getProductByHandle` usando `products_enhanced`
  - Retry logic com backoff
  - notFound() para 404
  - Error handling robusto

### P0: PDP Error 500
**Status:** ⚠️ **INVESTIGAÇÃO NECESSÁRIA**

**Hipótese (do documento):**
- `products_enhanced` pode não existir no backend
- Fallback para `/store/products` pode ser necessário
- Imagens podem estar falhando (database vs internal catalog)

**Diagnóstico:**
```bash
# 1. Verificar endpoint backend
curl -H "x-publishable-api-key: pk_..." \
  "http://localhost:9000/store/products_enhanced?handle=kit-solar-5kw"

# 2. Logs storefront
docker logs ysh-store-storefront-1 --tail=100 | grep -i error

# 3. Teste com produto inexistente
curl http://localhost:8000/br/products/produto-invalido
# Deve retornar 404, não 500
```

---

## 📋 Plano de 7 Passos

### ✅ Passo 1: Diagnóstico PDP (30min) - PRIORIDADE
**Status:** 🔄 **EM PROGRESSO**

#### Ações
1. [ ] Verificar se `/store/products_enhanced` existe no backend
2. [ ] Testar endpoint diretamente com curl
3. [ ] Analisar logs do storefront para stack trace
4. [ ] Identificar se erro é 404 (produto não existe) ou 500 (backend error)

#### Correções Potenciais

**Se endpoint não existe:**
```typescript
// src/lib/data/products.ts
export const getProductByHandle = async (handle: string, regionId: string) => {
  try {
    // Fallback: tentar products_enhanced, depois products
    let product;
    
    try {
      product = await fetchFromEnhanced(handle, regionId);
    } catch (enhancedError) {
      console.warn('[Products] Enhanced API failed, falling back to standard API');
      product = await fetchFromStandard(handle, regionId);
    }
    
    if (!product) {
      notFound();
    }
    
    return product;
  } catch (error: any) {
    // ... error handling ...
  }
};
```

**Se imagens estão falhando:**
```typescript
// Adicionar fallback de imagem
const productWithFallback = {
  ...product,
  thumbnail: product.thumbnail || '/placeholder-product.jpg',
  images: product.images?.length > 0 
    ? product.images 
    : [{ url: '/placeholder-product.jpg' }]
};
```

---

### ✅ Passo 2: HTTP Client (JÁ IMPLEMENTADO)
**Status:** ✅ **COMPLETO**

- [x] `src/lib/http.ts` criado
- [x] AbortController timeout (30s default)
- [x] Exponential backoff com jitter
- [x] 429 com Retry-After parsing
- [x] Test-friendly (1ms delays)
- [x] Normalized errors (HttpError interface)

---

### ✅ Passo 3: Data Layer (JÁ IMPLEMENTADO)
**Status:** ✅ **COMPLETO**

- [x] `getProductByHandle` com retry logic
- [x] notFound() para 404
- [x] Error handling robusto
- [x] Test-friendly delays (1ms em test)

**Melhorias Pendentes:**
- [ ] Adicionar fallback para products_enhanced → products
- [ ] Adicionar degraded state para erros 503/504
- [ ] Unit tests com fake timers

---

### 🔄 Passo 4: UI/UX (45min)
**Status:** ⏳ **PENDENTE**

#### Preloaders
- [ ] `app/[countryCode]/(main)/loading.tsx` (grid skeleton)
- [ ] `app/[countryCode]/(main)/products/[handle]/loading.tsx` (PDP skeleton)
- [ ] `app/[countryCode]/(main)/categories/[...category]/loading.tsx`
- [ ] `app/[countryCode]/(checkout)/cart/loading.tsx`

#### Degraded State
```typescript
// components/ui/degraded-banner.tsx
export function DegradedBanner({ 
  message = "Exibindo dados em cache. Alguns preços podem estar desatualizados.",
  onRetry 
}: DegradedBannerProps) {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">{message}</p>
          {onRetry && (
            <button onClick={onRetry} className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-600">
              Tentar novamente →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### 🔄 Passo 5: SEO/A11y (45min)
**Status:** ⏳ **PENDENTE**

#### SEO - Metadata
```typescript
// app/[countryCode]/(main)/products/[handle]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductByHandle(params.handle, params.countryCode);
  
  return {
    title: `${product.title} | Yello Solar Hub`,
    description: product.description?.substring(0, 160),
    openGraph: {
      title: product.title,
      description: product.description,
      images: [product.thumbnail],
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
      images: [product.thumbnail],
    },
  };
}
```

#### SEO - JSON-LD
```typescript
// lib/seo/json-ld.ts
export function generateProductJsonLd(product: StoreProduct) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    sku: product.variants?.[0]?.sku,
    brand: {
      '@type': 'Brand',
      name: product.metadata?.manufacturer || 'Yello Solar Hub',
    },
    offers: {
      '@type': 'Offer',
      price: product.variants?.[0]?.calculated_price?.calculated_amount,
      priceCurrency: 'BRL',
      availability: product.variants?.[0]?.inventory_quantity > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
    },
  };
}
```

#### A11y - Skip Links
```typescript
// components/layout/skip-link.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
    >
      Pular para o conteúdo principal
    </a>
  );
}
```

---

### 🔄 Passo 6: Segurança (30min)
**Status:** ⏳ **PENDENTE**

#### CSP Headers
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://medusa-public-images.s3.eu-west-1.amazonaws.com https://yellosolarhub.com",
      "font-src 'self' data:",
      "connect-src 'self' http://localhost:9000 https://api.yellosolarhub.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'medusa-public-images.s3.eu-west-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'yellosolarhub.com',
      },
      // Localhost apenas em dev
      ...(process.env.NODE_ENV === 'development' ? [{
        protocol: 'http',
        hostname: 'localhost',
      }] : []),
    ],
  },
};
```

---

### 🔄 Passo 7: Pages B2B (Curto Prazo)
**Status:** ⏳ **PENDENTE**

#### Approvals Page
```typescript
// app/[countryCode]/(main)/account/approvals/page.tsx
export default async function ApprovalsPage() {
  const approvals = await getApprovals();
  
  return (
    <div>
      <h1>Minhas Aprovações</h1>
      <ApprovalsList approvals={approvals} />
    </div>
  );
}
```

#### Quotes Page
```typescript
// app/[countryCode]/(main)/account/quotes/page.tsx
export default async function QuotesPage() {
  const quotes = await getQuotes();
  
  return (
    <div>
      <h1>Minhas Cotações</h1>
      <QuotesList quotes={quotes} />
    </div>
  );
}
```

---

## 🧪 Validações

### TypeCheck
```bash
npm run type-check
```

### Testes Unitários
```bash
npm run test:unit
```

### Build
```bash
npm run build
```

### E2E (Opcional)
```bash
npx playwright install
npm run test:e2e
```

---

## 📊 Progresso

- ✅ **Passo 1:** Diagnóstico PDP - **EM PROGRESSO**
- ✅ **Passo 2:** HTTP Client - **100%**
- ✅ **Passo 3:** Data Layer - **90%** (falta fallback)
- ⏳ **Passo 4:** UI/UX - **0%**
- ⏳ **Passo 5:** SEO/A11y - **0%**
- ⏳ **Passo 6:** Segurança - **0%**
- ⏳ **Passo 7:** Pages B2B - **0%**

**Total:** 40% completo

---

## 🎯 Critérios de Aceite

- [ ] PDP sem 500 (404 → notFound(), erros → UI amigável)
- [x] Data layer resiliente (timeouts/retries/429)
- [ ] Unit tests com fake timers
- [ ] Preloaders e degraded state
- [ ] JSON-LD em PDP
- [ ] CSP aplicada
- [ ] Web Vitals estáveis

**Status:** 1/7 critérios atendidos (14%)

---

**Tempo Total Estimado:** 4h  
**Prioridade:** P0 (PDP) → SEO/A11y → Segurança → B2B Pages
