# 🚀 STOREFRONT MEGA PROMPT V6 - Plano de Implementação

**Stack:** Next.js 15, React 19, TypeScript 5  
**Objetivo:** Performance, SEO, A11y, Segurança com patches mínimos

---

## 🎯 Objetivos

### Performance & UX
- ✅ HTTP client unificado (timeout/backoff/jitter/429)
- [ ] Loading states + skeletons
- [ ] Preconnect/preload otimizados
- [ ] next/image com remotePatterns mínimos

### SEO & A11y
- [ ] generateMetadata em rotas dinâmicas
- [ ] JSON-LD Product em PDP
- [ ] Canonical URLs consistentes
- [ ] ARIA labels/roles/focus management

### Segurança
- [ ] CSP sem unsafe-inline (produção)
- [ ] remotePatterns mínimos
- [ ] Remover dangerouslyAllowSVG

---

## 📝 Plano (6 Passos)

### ✅ Passo 1: HTTP Client Unificado
**Arquivo:** `src/lib/http.ts`

**Implementado:**
```typescript
export class HttpClient {
  - timeout com AbortController
  - exponential backoff com jitter
  - 429 com Retry-After parsing
  - normalização de erros
  - test-friendly (delays near-zero)
}
```

**Validação:** Arquivo criado ✅

---

### Passo 2: Refatorar Data Fetchers
**Arquivos:** 
- `src/lib/data/products.ts`
- `src/lib/data/categories.ts`
- `src/lib/data/cart.ts`

**Mudanças:**
- Remover retry manual
- Usar httpClient.fetch()
- Silenciar logs em testes

---

### Passo 3: SEO - Metadata & JSON-LD
**Arquivos:**
- `src/app/[countryCode]/(main)/products/[handle]/page.tsx`
- `src/app/[countryCode]/(main)/categories/[...category]/page.tsx`

**Implementar:**
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: product.title,
    description: product.description,
    openGraph: { ... },
    twitter: { ... },
    alternates: { canonical: ... }
  }
}

// JSON-LD Product
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.title,
  "offers": { ... }
}
</script>
```

---

### Passo 4: Segurança - CSP & Images
**Arquivo:** `next.config.js`

**Mudanças:**
```javascript
// CSP sem unsafe-inline em produção
script-src 'self' 'nonce-{random}'
style-src 'self' 'nonce-{random}'

// remotePatterns mínimos
remotePatterns: [
  { protocol: 'https', hostname: 'medusa-public-images.s3.eu-west-1.amazonaws.com' },
  { protocol: 'https', hostname: 'yellosolarhub.com' },
]
```

---

### Passo 5: Loading States & Skeletons
**Arquivos:**
- `src/app/[countryCode]/(main)/loading.tsx`
- `src/app/[countryCode]/(main)/products/[handle]/loading.tsx`
- `src/modules/skeletons/`

**Implementar:**
- ProductCardSkeleton
- ProductDetailSkeleton
- CategoryGridSkeleton

---

### Passo 6: A11y Baseline
**Arquivos:**
- `src/modules/layout/components/header/index.tsx`
- `src/modules/products/components/product-card/index.tsx`

**Implementar:**
```typescript
// Skip links
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

// ARIA labels
<button aria-label="Add to cart">
<nav aria-label="Main navigation">
```

---

## 🧪 Validações

### Typecheck
```bash
cd storefront
npm run type-check
```

### Testes
```bash
npm run test:unit
```

### Build
```bash
npm run build
```

### Pact (separado)
```bash
npm run test:pact:consumer
```

---

## ✅ Critérios de Aceite

### Performance
- [ ] HTTP client com timeout/backoff/jitter
- [ ] 429 handling com Retry-After
- [ ] Logs silenciados em testes
- [ ] Loading states em rotas principais

### SEO
- [ ] generateMetadata em PDP/Categories
- [ ] JSON-LD Product em PDP
- [ ] Canonical URLs consistentes

### Segurança
- [ ] CSP sem unsafe-inline (produção)
- [ ] remotePatterns mínimos
- [ ] object-src 'none'

### A11y
- [ ] Skip links
- [ ] ARIA labels em componentes principais
- [ ] Keyboard navigation

---

## 📊 Progresso

| Fase | Status | Tempo |
|------|--------|-------|
| HTTP Client | ✅ | 30min |
| Data Refactor | ⏳ | 1h |
| SEO | ⏳ | 1.5h |
| Segurança | ⏳ | 1h |
| Loading States | ⏳ | 1h |
| A11y | ⏳ | 1.5h |

**Total:** ~6.5 horas

---

**Status:** Fase 1 completa, iniciando Fase 2
