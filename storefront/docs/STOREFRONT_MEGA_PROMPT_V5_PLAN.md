# 🎯 STOREFRONT_MEGA_PROMPT v5 - Execution Plan

## Executive Summary

Cirurgical 360° storefront review focusing on SEO, A11y, security hardening, and PLG events with minimal patches.

## Current State Analysis

### ✅ Already Complete
- ✅ HTTP client with timeout/retry/backoff/jitter (`http-client.ts`)
- ✅ 429 handling with Retry-After
- ✅ Error normalization
- ✅ Fake timers support (`__setTestSleepFn`)
- ✅ UTM lifecycle (7-day cookie)
- ✅ A/B experiment bucket (50/50)
- ✅ CSP headers with `object-src 'none'`
- ✅ Image optimization (AVIF/WebP)
- ✅ Remote patterns configured

### ❌ Gaps Identified

1. **Data Layer** - Not using http-client yet
2. **SEO** - Missing generateMetadata, JSON-LD, canonical
3. **A11y** - No focus management, missing ARIA labels
4. **PLG Events** - No tracking (SKU copy, model link, category view)
5. **Security** - CSP could be stricter (remove unsafe-inline in prod)
6. **Tests** - Some component tests failing (import/export issues)

## Execution Plan (6 Steps)

### Step 1: Refactor Data Layer to Use HTTP Client ⚡ HIGH
**Problem**: Data fetchers use raw fetch without retry/timeout
**Solution**: Replace with httpClient

**Files to Update**:
- `src/lib/data/products.ts`
- `src/lib/data/cart.ts`
- `src/lib/data/quotes.ts`
- `src/lib/data/categories.ts`

**Pattern**:
```typescript
// Before
const res = await fetch(url)
const data = await res.json()

// After
const { data } = await httpClient.get(url, { timeoutMs: 10000 })
```

**Validation**: Unit tests with fake timers (<100ms)

---

### Step 2: SEO Enhancement 🔍 HIGH
**Implement**:
1. `generateMetadata` in dynamic routes
2. JSON-LD Product schema in PDP
3. Canonical URLs
4. Open Graph + Twitter Cards

**Files**:
- `src/app/[countryCode]/(main)/products/[handle]/page.tsx`
- `src/app/[countryCode]/(main)/categories/[...category]/page.tsx`
- `src/lib/seo/json-ld.ts` (new)
- `src/lib/seo/metadata.ts` (new)

**Example JSON-LD**:
```typescript
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.title,
  "image": product.thumbnail,
  "offers": {
    "@type": "Offer",
    "price": variant.prices[0].amount / 100,
    "priceCurrency": "BRL"
  }
}
```

---

### Step 3: A11y Baseline 🦾 MEDIUM
**Focus Areas**:
1. Focus management (skip links, focus trap in modals)
2. ARIA labels (buttons, links, forms)
3. Keyboard navigation
4. Color contrast (WCAG AA)

**Components to Fix**:
- `src/modules/layout/components/header/index.tsx`
- `src/modules/layout/components/nav/index.tsx`
- `src/modules/products/components/product-card/index.tsx`
- `src/modules/cart/components/cart-button/index.tsx`

**Pattern**:
```tsx
// Before
<button onClick={handleClick}>Add to Cart</button>

// After
<button 
  onClick={handleClick}
  aria-label={`Add ${product.title} to cart`}
  aria-describedby="cart-status"
>
  Add to Cart
</button>
```

**Validation**: Storybook a11y addon

---

### Step 4: PLG Event Tracking 📊 MEDIUM
**Events to Track**:
1. SKU copy to clipboard
2. Model number link click
3. Category view
4. Product quick view
5. Quote request

**Implementation**:
```typescript
// src/lib/analytics/events.ts
export function trackEvent(event: string, properties: Record<string, any>) {
  if (!hasConsent()) return
  
  // PostHog or custom analytics
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture(event, properties)
  }
}

// Usage
trackEvent('sku_copied', { sku: 'PANEL-550W', category: 'solar-panels' })
```

**Consent Guard**:
```typescript
function hasConsent(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('ysh_analytics_consent') === 'true'
}
```

**Files**:
- `src/lib/analytics/events.ts` (new)
- `src/lib/analytics/consent.ts` (new)
- Update components to call trackEvent

---

### Step 5: Security Hardening 🔒 HIGH
**Improvements**:
1. Remove `unsafe-inline` from CSP (use nonces)
2. Minimize remote patterns (only essential domains)
3. Add Subresource Integrity (SRI) for external scripts
4. Implement nonce-based CSP

**CSP Target**:
```javascript
"script-src 'self' 'nonce-{RANDOM}' https://vercel.live"
"style-src 'self' 'nonce-{RANDOM}'"
```

**Files**:
- `next.config.js` - Update CSP
- `src/app/layout.tsx` - Add nonce to scripts
- `src/middleware.ts` - Generate nonce per request

---

### Step 6: Test Fixes 🧪 LOW
**Issues**:
- Component tests failing (import/export)
- Pact tests isolated but need validation

**Fixes**:
1. Update Jest config for ESM
2. Mock Next.js router properly
3. Separate Pact from unit tests

**Files**:
- `jest.config.json`
- `vitest.config.ts`
- Component test files

---

## Success Criteria

### Must Have (Blocking)
- ✅ Data layer uses httpClient
- ✅ SEO metadata on all dynamic routes
- ✅ A11y baseline (focus, labels, roles)
- ✅ CSP without unsafe-inline
- ✅ Build succeeds
- ✅ Unit tests pass

### Should Have (Non-blocking)
- ✅ JSON-LD on PDP
- ✅ PLG events with consent
- ✅ Storybook a11y checks
- ✅ Component tests pass

### Nice to Have
- ✅ SRI for external scripts
- ✅ Nonce-based CSP
- ✅ Web Vitals monitoring

## Web Vitals Targets

| Metric | Current | Target | Strategy |
|--------|---------|--------|----------|
| LCP | ~2.5s | <2.5s | Image optimization, preload |
| FID/INP | ~100ms | <100ms | Code splitting, defer JS |
| CLS | ~0.1 | <0.1 | Size hints, font-display |
| TTFB | ~800ms | <600ms | Edge caching, CDN |

## Risk Assessment

### Low Risk ✅
- Data layer refactor (backward compatible)
- SEO additions (additive only)
- A11y improvements (progressive enhancement)
- PLG events (opt-in)

### Medium Risk ⚠️
- CSP changes (could break external scripts)
  - Mitigation: Test thoroughly, rollback plan
- Test fixes (could mask real issues)
  - Mitigation: Keep integration tests

### High Risk 🔴
- None identified

## Rollback Strategy

1. **Data Layer**: Revert to raw fetch (5 files)
2. **SEO**: Remove metadata (non-breaking)
3. **CSP**: Revert to unsafe-inline
4. **Events**: Disable tracking calls

## Timeline Estimate

| Step | Effort | Priority |
|------|--------|----------|
| 1. Data Layer | 3h | HIGH |
| 2. SEO | 4h | HIGH |
| 3. A11y | 5h | MEDIUM |
| 4. PLG Events | 3h | MEDIUM |
| 5. Security | 2h | HIGH |
| 6. Test Fixes | 2h | LOW |

**Total**: 19h (~2-3 days)

## Validation Commands

```bash
# Full validation
cd storefront

# 1. Install
npm ci

# 2. Type check
npm run type-check

# 3. Unit tests
npm run test:unit

# 4. Build
npm run build

# 5. Pact (separate pipeline)
npm run test:pact:consumer

# 6. E2E (optional)
npx playwright test

# 7. Lighthouse (local)
npm run build && npm start
# Then run Lighthouse in Chrome DevTools
```

## Monitoring Post-Deploy

### Web Vitals
```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Error Tracking
- Monitor CSP violations via report-uri
- Track failed API calls (429, 5xx)
- Monitor Web Vitals degradation

## Next Steps After Completion

1. Deploy to staging
2. Run Lighthouse audit (target: 90+ all metrics)
3. Test A/B experiments
4. Monitor PLG events
5. Gradual rollout to production

---

**Status**: 📋 Planning Complete  
**Next**: Execute Step 1 (Data Layer Refactor)  
**Owner**: Staff Frontend/Platform Engineer
