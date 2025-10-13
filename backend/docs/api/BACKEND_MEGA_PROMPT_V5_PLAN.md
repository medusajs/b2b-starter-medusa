# 🎯 BACKEND_MEGA_PROMPT v5 - Execution Plan

## Executive Summary

Cirurgical 360° backend review focusing on API standardization, test stability, and production readiness with minimal patches.

## Current State Analysis

### ✅ Already Complete (from v2)
- Response envelopes (`APIResponse`) applied to quotes, aneel, health
- API versioning (`X-API-Version`) in custom routes
- Rate limiting with Redis + headers
- Cache clear safety (SCAN+DEL)
- Pact Provider foundation (fixtures + tests)
- Global middlewares (request ID, error handler)

### ❌ Gaps Identified

1. **PVLib Tests** - Timeout issues (30s waits), no fake timers
2. **Approval/Financing Tests** - Manager injection failures
3. **Remaining Routes** - Missing APIResponse envelopes
4. **Pact Provider** - State handlers not implemented
5. **Metrics** - p95/p99 not populated in tests
6. **Integration Tests** - Quote module loading when disabled

## Execution Plan (8 Steps)

### Step 1: Fix PVLib Tests (Priority: HIGH)
**Problem**: Tests timeout waiting for real delays
**Solution**: Inject fake timers via test helpers

```typescript
// src/modules/pvlib-integration/__tests__/test-helpers.ts
export function __setTestSleepFn(fn: (ms: number) => Promise<void>);
export async function sleep(ms: number): Promise<void>;
```

**Files**:
- `src/modules/pvlib-integration/__tests__/test-helpers.ts` (new)
- `src/modules/pvlib-integration/client/http-client.ts` (use sleep helper)
- `src/modules/pvlib-integration/__tests__/http-client.unit.spec.ts` (inject fake)

**Validation**: `npm run test:unit -- pvlib` < 5s

---

### Step 2: Fix Approval/Financing Tests (Priority: HIGH)
**Problem**: Manager/repository injection fails with @InjectManager
**Solution**: Create test harness for mock injection

```typescript
// src/modules/approval/__tests__/test-harness.ts
export function createMockApprovalRepository();
export function injectMocksIntoService(service, mocks);
```

**Files**:
- `src/modules/approval/__tests__/test-harness.ts` (new)
- `src/modules/financing/__tests__/test-harness.ts` (new)
- Update test files to use harness

**Validation**: `npm run test:unit -- approval financing`

---

### Step 3: Apply APIResponse to Remaining Routes (Priority: MEDIUM)
**Routes Missing Envelopes**:
- `/api/pvlib/*` (inverters, panels, stats)
- `/api/financing/*` (rates, simulate)
- `/api/credit-analysis/*`
- `/api/solar/viability`

**Pattern**:
```typescript
// Before
res.json({ data });

// After
APIResponse.success(res, data);
res.setHeader("X-API-Version", "v2024-01");
```

**Files**: ~10 route files
**Validation**: Manual API testing + typecheck

---

### Step 4: Implement Pact State Handlers (Priority: MEDIUM)
**Current**: Stub state handlers (console.log only)
**Target**: Real DB seeding with fixtures

```typescript
stateHandlers: {
  "quote 123 exists": async () => {
    await testDb.quotes.upsert(QUOTE_FIXTURES.quote_123);
  },
}
```

**Files**:
- `pact/provider/quotes.pact.test.ts`
- `pact/provider/catalog.pact.test.ts`
- `pact/test-db-setup.ts` (new)

**Validation**: `npm run test:pact:provider`

---

### Step 5: Populate Metrics in Tests (Priority: LOW)
**Problem**: p95/p99 = 0 in pvlib tests
**Solution**: Track response times in mock

```typescript
const responseTimes: number[] = [];
fetchMock.mockImplementation(async () => {
  const start = Date.now();
  await sleep(Math.random() * 100);
  responseTimes.push(Date.now() - start);
  return { ok: true, json: async () => ({}) };
});
```

**Files**:
- `src/modules/pvlib-integration/__tests__/http-client.unit.spec.ts`

**Validation**: Metrics test passes with p95/p99 > 0

---

### Step 6: Fix Integration:Modules Quote Loading (Priority: MEDIUM)
**Problem**: Tests fail when quote module disabled
**Solution**: Conditional module loading in test setup

```typescript
// integration-tests/setup-enhanced.js
const enabledModules = process.env.ENABLED_MODULES?.split(',') || [];
if (!enabledModules.includes('quote')) {
  // Skip quote-dependent tests
}
```

**Files**:
- `integration-tests/setup-enhanced.js`
- `jest.config.js`

**Validation**: `npm run test:integration:modules`

---

### Step 7: Enhance Rate Limiting Coverage (Priority: LOW)
**Current**: Only `/store/*` and CV routes
**Target**: All public APIs

**Routes to Add**:
- `/api/aneel/*`
- `/api/pvlib/*`
- `/api/solar/*`

**Pattern**:
```typescript
export const middlewares = [rateLimitMiddleware({ limit: 100, window: 60 })];
```

**Files**: ~5 middleware files
**Validation**: Unit tests for rate limit

---

### Step 8: CI/CD Validation Script (Priority: HIGH)
**Create**: `scripts/validate-backend.sh`

```bash
#!/bin/bash
set -e
npm ci
npm run typecheck
npm run test:unit
npm run test:integration:modules
npm run build
echo "✅ Backend validation complete"
```

**Files**:
- `scripts/validate-backend.sh` (new)
- `.github/workflows/backend-ci.yml` (update)

**Validation**: Run script locally

---

## Success Criteria

### Must Have (Blocking)
- ✅ All unit tests pass (329+)
- ✅ Integration:modules passes
- ✅ Typecheck clean (ignore pre-existing errors)
- ✅ Build succeeds

### Should Have (Non-blocking)
- ✅ Pact Provider passes (subset)
- ✅ p95/p99 metrics > 0
- ✅ All custom routes use APIResponse

### Nice to Have
- ✅ Rate limiting on all public APIs
- ✅ CI/CD validation script
- ✅ Test execution < 60s

## Risk Mitigation

### High Risk Changes
- **PVLib client modification** - Could break production
  - Mitigation: Use DI pattern, fallback to real setTimeout
  
- **Approval service mocking** - Could mask real issues
  - Mitigation: Keep integration tests with real DB

### Low Risk Changes
- APIResponse application - Backward compatible
- Test harness creation - Test-only code
- Documentation updates - Zero runtime impact

## Rollback Plan

1. **PVLib**: Revert sleep helper, use real timeouts
2. **Approval**: Remove test harness, skip failing tests
3. **APIResponse**: Revert route changes (3-5 files)
4. **Pact**: Disable provider tests (non-critical)

## Timeline Estimate

| Step | Effort | Priority |
|------|--------|----------|
| 1. PVLib Tests | 2h | HIGH |
| 2. Approval Tests | 2h | HIGH |
| 3. APIResponse Routes | 3h | MEDIUM |
| 4. Pact State Handlers | 4h | MEDIUM |
| 5. Metrics Population | 1h | LOW |
| 6. Integration:Modules | 2h | MEDIUM |
| 7. Rate Limiting | 2h | LOW |
| 8. CI/CD Script | 1h | HIGH |

**Total**: 17h (~2-3 days)

## Validation Commands

```bash
# Full validation suite
cd backend

# 1. Dependencies
npm ci

# 2. Type check (ignore pre-existing errors)
npm run typecheck 2>&1 | grep -v "pre-existing"

# 3. Unit tests
npm run test:unit

# 4. Integration tests
npm run test:integration:modules

# 5. Pact Provider (optional)
docker-compose -f ../docker/docker-compose.foss.yml up -d pact-broker
npm run dev &
sleep 10
npm run test:pact:provider

# 6. Build
npm run build

# 7. Cleanup
docker-compose -f ../docker/docker-compose.foss.yml down
```

## Next Steps After Completion

1. Deploy to staging environment
2. Run smoke tests
3. Monitor error rates
4. Gradual rollout to production
5. Update runbooks with new patterns

---

**Status**: 📋 Planning Complete  
**Next**: Execute Step 1 (PVLib Tests)  
**Owner**: Staff Backend/Platform Engineer
