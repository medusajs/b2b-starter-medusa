# 📋 YSH Store - Task List

## 🔴 Backend Tasks (BACKEND_MEGA_PROMPT v5)

### HIGH Priority

- [ ] **PVLib Tests** - Inject fake timers (2h)
  - [ ] Update `http-client.ts` to use sleep helper
  - [ ] Update tests to inject fake sleep
  - [ ] Validate: `npm run test:unit -- pvlib` < 5s

- [ ] **Approval/Financing Tests** - Use test harness (2h)
  - [ ] Update approval tests to use harness
  - [ ] Update financing tests to use harness
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

---

## 🔵 Storefront Tasks (STOREFRONT_MEGA_PROMPT v5)

### HIGH Priority

- [ ] **Data Layer Refactor** - Use httpClient (3h)
  - [ ] Update `src/lib/data/products.ts`
  - [ ] Update `src/lib/data/cart.ts`
  - [ ] Update `src/lib/data/quotes.ts`
  - [ ] Update `src/lib/data/categories.ts`
  - [ ] Unit tests with fake timers

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

---

## 📊 Progress Summary

### Backend
- **Total Tasks**: 15
- **Completed**: 7 (47%)
- **In Progress**: 0
- **Pending**: 8 (53%)
- **Estimated Time**: 17h remaining

### Storefront
- **Total Tasks**: 13
- **Completed**: 9 (69%)
- **In Progress**: 0
- **Pending**: 4 (31%)
- **Estimated Time**: 19h remaining

### Overall
- **Total Tasks**: 28
- **Completed**: 16 (57%)
- **Pending**: 12 (43%)
- **Total Estimated Time**: 36h (~4-5 days)

---

## 🎯 Next Actions (Priority Order)

1. **Backend**: Fix PVLib tests (2h) - Blocking unit tests
2. **Backend**: Fix Approval/Financing tests (2h) - Blocking unit tests
3. **Storefront**: Refactor data layer (3h) - Foundation for resilience
4. **Storefront**: SEO enhancement (4h) - High impact for organic traffic
5. **Backend**: Apply APIResponse to routes (3h) - API standardization
6. **Storefront**: Security hardening (2h) - Production readiness

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
**Status**: Planning Complete, Implementation Started  
**Next Review**: After completing HIGH priority tasks
