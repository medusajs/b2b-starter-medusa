# Unit Tests - Solar Workflows Q1 2025

## 📊 Test Coverage

Cobertura de testes unitários para os **4 workflows prioritários** implementados no Q1 2025.

**Total Test Suites**: 3  
**Total Test Cases**: ~50+ testes  
**Status**: ✅ **Implementado** (aguardando execução)

---

## 🧪 Test Suites

### 1. Index Module Queries Tests

**File**: `backend/src/workflows/solar/__tests__/index-queries.unit.spec.ts`

#### analyzeSolarFleetWorkflow Tests

- ✅ Should analyze solar fleet successfully
- ✅ Should filter by capacity range (min/max kWp)
- ✅ Should filter by status (active/inactive)
- ✅ Should handle empty result set
- ✅ Should complete under 200ms (performance test)

**Coverage**:
- Input validation
- Filtering logic (category, capacity, status)
- Aggregation calculations (total, avg)
- Performance benchmarks

#### getSolarOrdersWithCompanyWorkflow Tests

- ✅ Should retrieve solar orders with company data
- ✅ Should filter by order status
- ✅ Should include solar metadata
- ✅ Should calculate total solar capacity
- ✅ Should handle pagination
- ✅ Should complete under 300ms (performance test)

**Coverage**:
- Remote links (Order ↔ Company)
- Metadata filtering
- Pagination
- Performance with joins

---

### 2. Solar Feasibility Validation Tests

**File**: `backend/src/workflows/hooks/__tests__/validate-solar-feasibility.unit.spec.ts`

#### Blocking Errors Tests

- ✅ Should block project with low irradiation (< 3.5 kWh/m²/dia)
- ✅ Should block project with insufficient roof area
- ✅ Should block project with very low capacity (< 1.5 kWp)

**Coverage**:
- Minimum irradiation threshold
- Area calculation (~7m²/kWp)
- Minimum capacity validation

#### Viable Projects Tests

- ✅ Should validate viable residential project
- ✅ Should validate viable commercial project
- ✅ Should validate viable industrial project

**Coverage**:
- Different building types
- Capacity ranges (5-100 kWp)
- Roof types compatibility

#### Warnings Tests

- ✅ Should warn about low irradiation (marginal 3.5-4.0)
- ✅ Should warn about tight roof area (< 20% margem)
- ✅ Should warn about crane requirement (laje + >30kWp)

**Coverage**:
- Non-blocking warnings
- Marginal conditions
- Equipment requirements

#### Installation Complexity Tests

- ✅ Should calculate low complexity (residential, ceramic, ≤10kWp)
- ✅ Should calculate medium complexity (residential laje, ≤10kWp)
- ✅ Should calculate high complexity (laje + >30kWp)
- ✅ Should calculate very high complexity (industrial + >50kWp)

**Coverage**:
- Complexity levels (low/medium/high/very_high)
- Crane requirement logic
- Building type × capacity combinations

#### Edge Cases Tests

- ✅ Should skip validation for non-solar products
- ✅ Should handle missing metadata gracefully
- ✅ Should handle extreme values (8.5 kWh/m²/dia, 200kWp)

**Coverage**:
- Product type filtering
- Error handling for incomplete data
- Extreme values (desert irradiation, mega systems)

---

### 3. Tax-Inclusive Promotions Tests

**File**: `backend/src/workflows/promotion/__tests__/create-solar-promo.unit.spec.ts`

#### createSolarPromotionWorkflow Tests

- ✅ Should create promotion with tax-inclusive discount
- ✅ Should create fixed discount promotion
- ✅ Should apply capacity targeting (min/max kWp)
- ✅ Should apply building type targeting
- ✅ Should respect usage limit

**Coverage**:
- Tax-inclusive flag validation
- Discount types (percentage vs fixed)
- Target rules (capacity, building_type)
- Campaign limits

#### createSolarFreeShippingWorkflow Tests

- ✅ Should create free shipping promotion (residential)
- ✅ Should create free shipping for all building types
- ✅ Should apply installation complexity filters
- ✅ Should exclude crane-required installations
- ✅ Should apply minimum capacity filter

**Coverage**:
- Residential-only filter
- Complexity targeting (low/medium only)
- Crane exclusion logic
- Capacity threshold

#### Tax-Inclusive Calculation Tests (Theoretical)

- ✅ Should calculate percentage discount correctly
- ✅ Should calculate fixed discount correctly
- ✅ Should respect maximum discount limits

**Coverage**:
- Mathematical correctness (10% × R$ 11.800 = R$ 1.180)
- Fixed discount (R$ 2.000 off after tax)
- Boundary conditions (50% off max)

#### Edge Cases & Validation Tests

- ✅ Should reject invalid discount type
- ✅ Should reject negative discount value
- ✅ Should reject end_date before start_date
- ✅ Should handle duplicate promotion code gracefully

**Coverage**:
- Input validation errors
- Business rule validation
- Duplicate prevention
- Date logic validation

---

## 🚀 Running Tests

### All Unit Tests

```powershell
cd backend
yarn test:unit
```

### Specific Test Suite

```powershell
# Index queries only
yarn test:unit workflows/solar/__tests__/index-queries.unit.spec.ts

# Feasibility validation only
yarn test:unit workflows/hooks/__tests__/validate-solar-feasibility.unit.spec.ts

# Promotions only
yarn test:unit workflows/promotion/__tests__/create-solar-promo.unit.spec.ts
```

### Watch Mode (Auto-rerun)

```powershell
yarn test:unit --watch
```

### Coverage Report

```powershell
yarn test:unit --coverage
```

---

## 📈 Expected Coverage Metrics

### Target Coverage

| Metric | Target | Current |
|--------|--------|---------|
| Lines | ≥80% | TBD |
| Branches | ≥75% | TBD |
| Functions | ≥90% | TBD |
| Statements | ≥80% | TBD |

### Files Covered

- ✅ `workflows/solar/index-queries.ts`
- ✅ `workflows/hooks/validate-solar-feasibility.ts`
- ✅ `workflows/hooks/validate-solar-checkout.ts`
- ✅ `workflows/promotion/create-solar-promo.ts`

---

## 🧩 Test Structure

### Unit Test Pattern

```typescript
describe("WorkflowName", () => {
  it("should perform expected behavior", async () => {
    const input = { /* test data */ };
    
    const { result } = await workflow.run({ input });
    
    expect(result).toBeDefined();
    expect((result as any).property).toBe(expected_value);
  });
});
```

### Performance Test Pattern

```typescript
it("should complete under Xms", async () => {
  const start = Date.now();
  
  await workflow.run({ input });
  
  const duration = Date.now() - start;
  console.log(`Workflow took ${duration}ms`);
  
  expect(duration).toBeLessThan(X);
});
```

### Edge Case Pattern

```typescript
it("should handle edge case gracefully", async () => {
  const input = { /* extreme/invalid data */ };
  
  const { result } = await workflow.run({ input });
  
  // Verify graceful handling (no crash)
  expect(result).toBeDefined();
  // Or verify expected error
  await expect(workflow.run({ input })).rejects.toThrow();
});
```

---

## 🐛 Known Issues & TODOs

### Type Casting

Alguns testes usam `(result as any)` devido a tipos desconhecidos do workflow.run():

```typescript
const { result } = await workflow.run({ input });
expect((result as any).is_feasible).toBe(true); // Type assertion
```

**TODO**: Criar interfaces TypeScript explícitas para result types.

### Mocking Dependencies

Testes atuais são **integration-style** (executam workflows reais).

**TODO**: Adicionar mocks para:
- Database queries
- External APIs
- Module services

### Missing Test Categories

- ⏳ **Integration Tests**: HTTP routes (`test:integration:http`)
- ⏳ **E2E Tests**: Fluxos completos de checkout
- ⏳ **Load Tests**: Performance sob carga

---

## 📚 Test Data Fixtures

### Sample Solar Cart Metadata

```typescript
const viable_residential_project = {
  tipo_produto: "sistema_solar",
  solar_irradiation_kwh_m2_day: 5.5,
  roof_area_m2: 50,
  solar_capacity_kw: 5.5,
  roof_type: "ceramica",
  building_type: "residencial",
};

const inviable_low_irradiation = {
  tipo_produto: "sistema_solar",
  solar_irradiation_kwh_m2_day: 3.0, // < 3.5
  roof_area_m2: 50,
  solar_capacity_kw: 5.5,
  roof_type: "ceramica",
  building_type: "residencial",
};

const high_complexity_industrial = {
  tipo_produto: "sistema_solar",
  solar_irradiation_kwh_m2_day: 5.8,
  roof_area_m2: 500,
  solar_capacity_kw: 70,
  roof_type: "laje",
  building_type: "industrial",
};
```

### Sample Promotion Input

```typescript
const percentage_promotion = {
  code: "SOLAR10OFF",
  description: "10% off em sistemas solares",
  discount_type: "percentage" as const,
  discount_value: 10,
  start_date: new Date("2025-01-01"),
  end_date: new Date("2025-12-31"),
};

const fixed_promotion = {
  code: "SOLAR5K",
  description: "R$ 5.000 de desconto",
  discount_type: "fixed" as const,
  discount_value: 500000, // cents
  start_date: new Date("2025-01-01"),
  end_date: new Date("2025-12-31"),
};

const targeted_promotion = {
  code: "COMMERCIAL15",
  description: "15% off para comercial",
  discount_type: "percentage" as const,
  discount_value: 15,
  min_capacity_kwp: 10,
  max_capacity_kwp: 50,
  building_types: ["comercial"],
  start_date: new Date("2025-01-01"),
  end_date: new Date("2025-12-31"),
};
```

---

## ✅ Test Checklist

### Before Committing

- [x] All tests have descriptive names
- [x] Each test validates single behavior
- [x] Edge cases are covered
- [x] Performance benchmarks included
- [ ] **TODO**: Tests pass without errors
- [ ] **TODO**: Coverage report generated
- [ ] **TODO**: No skipped tests (`.skip()`)

### CI/CD Integration

- [ ] **TODO**: Tests run on pre-commit hook
- [ ] **TODO**: Tests run on GitHub Actions
- [ ] **TODO**: Coverage report uploaded to Codecov
- [ ] **TODO**: Failing tests block deployment

---

## 🎯 Next Steps

1. **Execute Tests**: Run `yarn test:unit` e corrigir falhas
2. **Integration Tests**: Criar HTTP tests em `integration-tests/http/`
3. **Mocking**: Adicionar mocks para database/services
4. **Coverage**: Atingir 80%+ de cobertura
5. **CI/CD**: Integrar tests no pipeline

---

## 📚 References

### Testing Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Medusa Testing Utils](https://docs.medusajs.com/learn/testing)
- [TypeScript Jest](https://kulshekhar.github.io/ts-jest/)

### Internal Docs

- `backend/docs/WORKFLOW_HOOKS.md`
- `backend/docs/TAX_INCLUSIVE_PROMOTIONS.md`
- `backend/docs/INDEX_MODULE_QUERIES.md` (TODO)

---

## ✅ Implementation Status

- ✅ **Index Queries Tests**: 10+ test cases (performance, filtering, pagination)
- ✅ **Feasibility Tests**: 20+ test cases (blocking, warnings, complexity, edge cases)
- ✅ **Promotions Tests**: 20+ test cases (tax-inclusive, targeting, validation)
- ⏳ **Test Execution**: Pending first run
- ⏳ **Coverage Report**: Pending generation
- ⏳ **CI Integration**: Pending setup

**Status**: 🟡 **Tests Written** (aguardando execução e correções)
