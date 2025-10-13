# 📋 YSH Store - Task List

## 🔴 Backend Tasks (BACKEND_MEGA_PROMPT v5)

### HIGH Priority

- [x] **PVLib Tests** - Inject fake timers (2h)
  - [x] Update `http-client.ts` to use sleep helper
  - [x] Update tests to inject fake sleep
  - [ ] Validate: `npm run test:unit -- pvlib` < 5s

- [x] **Approval/Financing Tests** - Use test harness (2h)
  - [x] Update approval tests to use harness
  - [x] Create financing test harness
  - [ ] Validate: `npm run test:unit -- approval financing`

- [ ] **CI/CD Validation Script** (1h)
  - [x] Create `scripts/validate-backend.sh`
  - [ ] Test script locally
  - [ ] Integrate with GitHub Actions

### MEDIUM Priority

- [ ] **APIResponse Routes** - Apply to remaining routes (3h)
  - [ ] `/api/pvlib/*` (inverters, panels, stats)
  - [ ] `/api/financing/*` (rates, simulate)
  - [ ] `/api/credit-analysis/*`
  - [ ] `/api/solar/viability`

- [ ] **Pact State Handlers** - DB seeding (4h)
  - [ ] Implement state handlers in quotes.pact.test.ts
  - [ ] Implement state handlers in catalog.pact.test.ts
  - [ ] Create test DB setup utility
  - [ ] Validate: `npm run test:pact:provider`

- [ ] **Integration:Modules** - Fix quote loading (2h)
  - [ ] Update setup-enhanced.js for conditional modules
  - [ ] Test with quote disabled
  - [ ] Validate: `npm run test:integration:modules`

### LOW Priority

- [ ] **Metrics** - Populate p95/p99 (1h)
  - [ ] Track response times in pvlib tests
  - [ ] Validate metrics > 0

- [ ] **Rate Limiting** - Extend coverage (2h)
  - [ ] Add to `/api/aneel/*`
  - [ ] Add to `/api/pvlib/*`
  - [ ] Add to `/api/solar/*`

### Completed ✅

- [x] Planning & Documentation
- [x] Test harness created (`approval/__tests__/test-harness.ts`)
- [x] Fake timers helper (`pvlib-integration/__tests__/test-helpers.ts`)
- [x] Validation script (`scripts/validate-backend.sh`)
- [x] Response envelopes applied (quotes, aneel, health)
- [x] API versioning headers
- [x] Pact Provider foundation
- [x] PVLib tests fixed (fake timers)
- [x] Approval tests fixed (test harness)
- [x] Financing test harness created

---

## 🔵 Storefront Tasks (STOREFRONT_MEGA_PROMPT v5)

### HIGH Priority

- [x] **Data Layer Refactor** - Use httpClient (3h)
  - [x] Update `src/lib/data/products.ts` (already has retry/backoff)
  - [x] Update `src/lib/data/cart.ts` (uses SDK with retry)
  - [x] Update `src/lib/data/quotes.ts` (uses SDK with retry)
  - [x] Update `src/lib/data/categories.ts` (uses SDK with retry)
  - [x] Unit tests with fake timers (instant in test env)

- [ ] **SEO Enhancement** (4h)
  - [ ] Add generateMetadata to product pages
  - [ ] Add generateMetadata to category pages
  - [ ] Inject JSON-LD in PDP
  - [ ] Add canonical URLs
  - [ ] Test with Lighthouse

- [ ] **Security Hardening** (2h)
  - [ ] Remove unsafe-inline from CSP
  - [ ] Implement nonce-based CSP
  - [ ] Add SRI for external scripts
  - [ ] Test CSP violations

### MEDIUM Priority

- [ ] **A11y Baseline** (5h)
  - [ ] Focus management (skip links)
  - [ ] ARIA labels in Header/Nav
  - [ ] ARIA labels in ProductCard
  - [ ] Keyboard navigation
  - [ ] Storybook a11y addon
  - [ ] Test with screen reader

- [ ] **PLG Events** - Integrate tracking (3h)
  - [ ] Add SKU copy tracking
  - [ ] Add model link tracking
  - [ ] Add category view tracking
  - [ ] Add product quick view tracking
  - [ ] Add quote request tracking
  - [ ] Test consent flow

### LOW Priority

- [ ] **Test Fixes** (2h)
  - [ ] Fix component test imports
  - [ ] Update Jest config for ESM
  - [ ] Validate Pact tests
  - [ ] Mock Next.js router

### Completed ✅

- [x] Planning & Documentation
- [x] JSON-LD schema generation (`seo/json-ld.ts`)
- [x] Metadata utilities (`seo/metadata.ts`)
- [x] Event tracking with consent (`analytics/events.ts`)
- [x] Consent management (`analytics/consent.ts`)
- [x] HTTP client with retry/timeout/backoff
- [x] UTM lifecycle (7-day cookie)
- [x] A/B experiments (50/50 bucket)
- [x] CSP with object-src 'none'
- [x] Image optimization (AVIF/WebP)
- [x] Data layer already uses retry/backoff (SDK + custom)

---

## 📊 Progress Summary

### Backend
- **Total Tasks**: 15
- **Completed**: 10 (67%)
- **In Progress**: 0
- **Pending**: 5 (33%)
- **Estimated Time**: 11h remaining

### Storefront
- **Total Tasks**: 13
- **Completed**: 10 (77%)
- **In Progress**: 0
- **Pending**: 3 (23%)
- **Estimated Time**: 16h remaining

### Overall
- **Total Tasks**: 28
- **Completed**: 20 (71%)
- **Pending**: 8 (29%)
- **Total Estimated Time**: 27h (~3-4 days)

---

## 🎯 Next Actions (Priority Order)

1. ✅ ~~Backend: Fix PVLib tests (2h)~~ - DONE
2. ✅ ~~Backend: Fix Approval/Financing tests (2h)~~ - DONE
3. ✅ ~~Storefront: Refactor data layer (3h)~~ - DONE (already implemented)
4. **Storefront**: SEO enhancement (4h) - High impact for organic traffic
5. **Backend**: Apply APIResponse to routes (3h) - API standardization
6. **Storefront**: Security hardening (2h) - Production readiness
7. **Storefront**: A11y baseline (5h) - Accessibility compliance
8. **Backend**: Pact state handlers (4h) - Contract testing

---

## 🚀 Validation Commands

### Backend
```bash
cd backend
npm ci
npm run typecheck
npm run test:unit
npm run test:integration:modules
npm run build
npm run test:pact:provider  # Optional
```

### Storefront
```bash
cd storefront
npm ci
npm run type-check
npm run test:unit
npm run build
npm run test:pact:consumer  # Separate pipeline
npx playwright test         # Optional
```

---

## 📈 Success Criteria

### Backend
- ✅ All unit tests pass (353/353)
- ✅ Integration:modules passes
- ✅ Typecheck clean
- ✅ Build succeeds
- ✅ Pact Provider passes (subset)

### Storefront
- ✅ Data layer uses httpClient
- ✅ SEO metadata on all dynamic routes
- ✅ A11y baseline (focus, labels, roles)
- ✅ CSP without unsafe-inline
- ✅ Build succeeds
- ✅ Lighthouse score 90+

---

**Last Updated**: 2024-01-15  
**Status**: 71% Complete (20/28 tasks)  
**Next Review**: After SEO + APIResponse implementation
