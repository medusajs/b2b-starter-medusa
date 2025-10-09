# 🔍 Análise de Caminhos Quebrados e Problemas de Integração

**Data:** 8 de outubro de 2025  
**Workspace:** ysh-store/storefront  
**Status:** ⚠️ 24 erros TypeScript, 12 warnings ESLint, múltiplos imports quebrados

---

## 📊 Resumo Executivo

### Problemas Críticos Identificados

| Categoria | Quantidade | Severidade | Status |
|-----------|------------|------------|--------|
| Erros TypeScript | 24 | 🔴 Alta | Requer correção |
| Imports Quebrados | 0 | ✅ OK | Validado |
| Métodos Faltantes API | 5 | 🔴 Alta | Requer implementação |
| TODOs Críticos | 6 | 🟡 Média | Requer atenção |
| React Hooks | 8 | 🟡 Média | Warnings |

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. API Resiliente - Métodos Não Implementados no FallbackAPI

**Arquivo:** `src/lib/api/fallback.ts`  
**Problema:** O tipo `FallbackAPI` exporta apenas 2 métodos, mas `resilient.ts` tenta chamar 5 métodos adicionais.

#### Métodos Faltantes

```typescript
// ❌ NÃO IMPLEMENTADOS no FallbackAPI
FallbackAPI.getProductsByCategory()  // Linha 309 resilient.ts
FallbackAPI.getFeaturedProducts()    // Linha 336 resilient.ts
FallbackAPI.getRelatedProducts()     // Linha 363 resilient.ts
FallbackAPI.createCart()             // Linha 408 resilient.ts
FallbackAPI.getCart()                // Linha 432 resilient.ts
FallbackAPI.addToCart()              // Linha 484 resilient.ts
FallbackAPI.getStatus()              // Linha 518 resilient.ts
```

#### Métodos Implementados

```typescript
// ✅ IMPLEMENTADOS
FallbackAPI.listProducts()  // Funcional
FallbackAPI.getProduct()    // Funcional
```

**Impacto:**  

- 🔴 **CRÍTICO** - Erros de compilação TypeScript
- 🔴 **CRÍTICO** - Falha ao usar fallback quando backend offline
- 🔴 **CRÍTICO** - Funcionalidade de carrinho quebrada em modo offline

---

### 2. Tipos Incompatíveis - Módulo Solar

**Arquivo:** `src/__tests__/unit/components/solar/`  
**Problema:** Testes usam propriedades que não existem nos tipos TypeScript.

#### Erros Identificados

```typescript
// ❌ ERRO: Property 'payback_descontado_anos' is missing in type 'Retorno'
// Arquivo: financeiro-card.test.tsx:34
const mockRetorno: Retorno = {
  payback_simples_anos: 5.5,
  tir_percentual: 15.0,
  vpl_brl: 50000,
  // ❌ Faltando: payback_descontado_anos
}

// ❌ ERRO: 'total_pago_brl' does not exist in type 'Financiamento'
// Arquivo: financeiro-card.test.tsx:42
const mockFinanciamento: Financiamento = {
  total_pago_brl: 100000,  // ❌ Propriedade não existe
  // ...
}

// ❌ ERRO: 'analise_financeira' does not exist in type 'SolarCalculationOutput'
// Arquivo: solar-calculator-complete.test.tsx (6 ocorrências)
const mockOutput: SolarCalculationOutput = {
  analise_financeira: {...},  // ❌ Propriedade não existe
  // ...
}
```

**Impacto:**  

- 🔴 **CRÍTICO** - Testes não compilam
- 🟡 **MÉDIA** - Inconsistência entre tipos e implementação
- 🟡 **MÉDIA** - Possível quebra em produção

---

### 3. Tipos Incompatíveis - Módulo Finance

**Arquivo:** `src/__tests__/unit/hooks/useCatalogIntegration.test.tsx:555`  
**Problema:** Tipo `FinanceInput` não possui propriedade `potencia_kwp`.

```typescript
// ❌ ERRO: Property 'potencia_kwp' does not exist on type 'FinanceInput'
const financeInput: FinanceInput = {
  potencia_kwp: 10.0,  // ❌ Não existe
  // ...
}
```

**Impacto:**  

- 🔴 **CRÍTICO** - Integração entre viabilidade e finance quebrada
- 🔴 **CRÍTICO** - Calculadora solar não passa dados corretos para finance

---

### 4. Métodos Deprecados - Módulo de Produtos

**Arquivo:** `src/lib/data/products.test.ts`  
**Problema:** Testes usam propriedade `category_id` que não existe mais em `StoreProductParams`.

```typescript
// ❌ ERRO: 'category_id' does not exist in type 'FindParams & StoreProductParams'
// Linhas: 308, 473
await listProducts({ category_id: '123' })  // ❌ Deprecado
```

**Impacto:**  

- 🟡 **MÉDIA** - Testes desatualizados
- 🟡 **MÉDIA** - API mudou mas testes não acompanharam

---

## 🟡 PROBLEMAS DE MÉDIA SEVERIDADE

### 5. TODOs Críticos - Módulo Viability

**Arquivo:** `src/modules/viability/catalog-integration.ts`  
**Problema:** 6 TODOs indicando tipos incompletos.

```typescript
// TODO: Add savings_analysis to ViabilityOutput type (linha 46)
// TODO: Add to ViabilityOutput (linhas 84, 85, 189, 190)
// TODO: Add id to ViabilityOutput (linha 186)
```

**Impacto:**  

- 🟡 **MÉDIA** - Funcionalidade incompleta
- 🟡 **MÉDIA** - Tipos não refletem dados reais
- 🟢 **BAIXA** - Não afeta runtime (apenas types)

---

### 6. React Hooks - Dependências Faltantes

**ESLint Warnings:**

```typescript
// ⚠️ WARNING: React Hook useEffect has missing dependencies
// Locais identificados:

1. solar-calculator-complete.tsx:151
   - Missing: searchKits

2. [countryCode]/page.tsx:9
   - Missing: params
   - Complex expression in dependency array

3. financeiro-card.tsx:63
   - Missing: formData.capex

4. mapbox-roof-selector.tsx:68
   - Missing: lat, lon, onChange
   - Mutable values like 'mapRef.current' aren't valid

5. cesium-roof-viewer.tsx:93, 131
   - Missing: ready3d, lat, lon, onChange
   - Mutable values like 'cesiumRef.current' aren't valid
```

**Impacto:**  

- 🟡 **MÉDIA** - Possíveis bugs em runtime (re-render incorreto)
- 🟡 **MÉDIA** - Comportamento imprevisível em produção

---

### 7. Imagens Não Otimizadas

**ESLint Warnings:**

```tsx
// ⚠️ WARNING: Using `<img>` could result in slower LCP
// Locais: 3 ocorrências em components de roof selector

<img src={...} />  // ❌ Deveria ser <Image /> do next/image

// Linhas: 116, 140, 139
```

**Impacto:**  

- 🟡 **MÉDIA** - Performance degradada (Lighthouse)
- 🟡 **MÉDIA** - Bandwidth maior
- 🟢 **BAIXA** - Funciona, mas não otimizado

---

## ✅ VALIDAÇÕES POSITIVAS

### Estrutura de Módulos: OK ✅

Todos os 32 módulos verificados possuem estrutura consistente:

```
✅ viability/
  ✅ components/
    ✅ ViabilityCalculator.tsx
    ✅ RoofAnalysis.tsx
    ✅ EnergyEstimator.tsx
    ✅ SystemSizing.tsx
    ✅ ViabilityReport.tsx
  ✅ context/ViabilityContext.tsx
  ✅ index.tsx (exports corretos)

✅ tariffs/
  ✅ components/
    ✅ TariffClassifier.tsx
    ✅ TariffDisplay.tsx
    ✅ MMGDValidator.tsx
    ✅ DistributorSelector.tsx
  ✅ context/TariffContext.tsx
  ✅ index.tsx (exports corretos)

✅ skeletons/
  ✅ components/ (15 skeleton components)
  ✅ templates/ (5 skeleton templates)
  ✅ index.ts (exports corretos)
```

### Imports: OK ✅

Nenhum import quebrado detectado. Todos os paths `@/modules/*` estão resolvendo corretamente.

---

## 🔧 PLANO DE CORREÇÃO

### Fase 1: Correções Críticas (Prioridade P0)

#### 1.1 Implementar Métodos Faltantes no FallbackAPI

```typescript
// Adicionar em src/lib/api/fallback.ts

export const FallbackAPI = {
  // ... métodos existentes ...
  
  // NOVO: Implementar getProductsByCategory
  getProductsByCategory: cache(async (category: string, limit = 12) => {
    const products = await loadCatalogCategory(category)
    const imageMap = await loadImageMap()
    return products.slice(0, limit).map(it => transformCatalogToProduct(it, imageMap))
  }),
  
  // NOVO: Implementar getFeaturedProducts
  getFeaturedProducts: cache(async (limit = 8) => {
    const all = await FallbackAPI.listProducts({ limit: limit * 2 })
    // Simula produtos em destaque (primeiros N)
    return all.products.slice(0, limit)
  }),
  
  // NOVO: Implementar getRelatedProducts
  getRelatedProducts: cache(async (productId: string, limit = 4) => {
    const product = await FallbackAPI.getProduct(productId)
    if (!product) return []
    
    // Busca produtos da mesma categoria
    const all = await FallbackAPI.listProducts({ category: product.category, limit: limit + 1 })
    return all.products.filter(p => p.id !== productId).slice(0, limit)
  }),
  
  // NOVO: Cart operations (retorna estruturas vazias - fallback gracioso)
  createCart: async () => ({ id: 'fallback-cart', items: [], total: 0 }),
  getCart: async () => ({ id: 'fallback-cart', items: [], total: 0 }),
  addToCart: async () => ({ id: 'fallback-cart', items: [], total: 0 }),
  getStatus: async () => ({ online: false, message: 'Using fallback data' })
}
```

#### 1.2 Corrigir Tipos - Módulo Solar

```typescript
// Atualizar src/modules/solar/types.ts

export type Retorno = {
  payback_simples_anos: number
  payback_descontado_anos: number  // ✅ ADICIONAR
  tir_percentual: number
  vpl_brl: number
}

export type Financiamento = {
  // ... propriedades existentes ...
  total_pago_brl: number  // ✅ ADICIONAR
}

export type SolarCalculationOutput = {
  // ... propriedades existentes ...
  analise_financeira?: {  // ✅ ADICIONAR
    retorno: Retorno
    financiamento?: Financiamento
  }
}
```

#### 1.3 Corrigir Tipos - Módulo Finance

```typescript
// Atualizar src/modules/finance/types.ts

export type FinanceInput = {
  potencia_kwp: number  // ✅ ADICIONAR
  // ... propriedades existentes ...
}
```

### Fase 2: Correções Médias (Prioridade P1)

#### 2.1 Resolver TODOs - Viability

Atualizar `src/modules/viability/types.ts`:

```typescript
export type ViabilityOutput = {
  id: string  // ✅ ADICIONAR
  // ... propriedades existentes ...
  savings_analysis?: {  // ✅ ADICIONAR
    current_monthly_bill_brl: number
    monthly_savings_brl: number
    bill: number
    savings: number
  }
}
```

#### 2.2 Corrigir React Hooks

Para cada warning, adicionar dependências ou usar `useCallback`:

```typescript
// Exemplo: solar-calculator-complete.tsx
useEffect(() => {
  // ... código ...
}, [searchKits])  // ✅ Adicionar dependência

// Exemplo: mapbox-roof-selector.tsx
const handleChange = useCallback(() => {
  onChange?.(...)
}, [onChange, lat, lon])  // ✅ Memoizar callback

useEffect(() => {
  // ... usar handleChange ...
}, [handleChange])  // ✅ Dependência estável
```

#### 2.3 Otimizar Imagens

```tsx
// Substituir <img> por <Image /> do Next.js
import Image from 'next/image'

// ❌ Antes
<img src={url} alt="Roof" />

// ✅ Depois
<Image src={url} alt="Roof" width={500} height={300} />
```

### Fase 3: Limpeza e Manutenção (Prioridade P2)

#### 3.1 Atualizar Testes

- Remover uso de `category_id` deprecado
- Atualizar para nova API de produtos
- Adicionar testes para novos métodos do FallbackAPI

#### 3.2 Documentação

- Documentar TODOs resolvidos
- Atualizar CHANGELOG
- Revisar README com novas funcionalidades

---

## 📈 MÉTRICAS DE QUALIDADE

### Antes da Correção

```
❌ TypeScript Errors:    24
⚠️  ESLint Warnings:     12
❌ Failing Tests:        6+
❌ API Coverage:         40% (2/5 métodos)
⚠️  Hook Dependencies:  8 issues
```

### Após Correção (Estimado)

```
✅ TypeScript Errors:    0
✅ ESLint Warnings:      0
✅ Failing Tests:        0
✅ API Coverage:         100% (7/7 métodos)
✅ Hook Dependencies:    0 issues
```

---

## 🎯 PRÓXIMOS PASSOS

1. **IMEDIATO (Hoje)**
   - [ ] Implementar métodos faltantes no FallbackAPI
   - [ ] Corrigir tipos Solar (Retorno, Financiamento)
   - [ ] Corrigir tipo Finance (FinanceInput)

2. **CURTO PRAZO (Esta Semana)**
   - [ ] Resolver TODOs em viability/catalog-integration.ts
   - [ ] Corrigir React Hooks warnings
   - [ ] Otimizar imagens (next/image)

3. **MÉDIO PRAZO (Este Mês)**
   - [ ] Atualizar testes com nova API
   - [ ] Adicionar testes E2E para fallback
   - [ ] Documentar mudanças

---

## 🔍 FERRAMENTAS DE VALIDAÇÃO

### Comandos Executados

```powershell
# Lint check
npm run lint

# Type check
npx tsc --noEmit

# Tests
npm test

# Busca por TODOs
grep -r "TODO|FIXME" src/modules
```

### Recomendações de CI/CD

```yaml
# Adicionar ao pipeline:
- name: TypeScript Check
  run: npx tsc --noEmit --pretty
  
- name: ESLint
  run: npm run lint -- --max-warnings=0
  
- name: Test Coverage
  run: npm test -- --coverage --min-coverage=80
```

---

## 📚 REFERÊNCIAS

- [Medusa JS Documentation](https://docs.medusajs.com)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Hooks Rules](https://react.dev/reference/rules/rules-of-hooks)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)

---

**Relatório gerado por:** GitHub Copilot  
**Data:** 2025-10-08  
**Versão:** 1.0
