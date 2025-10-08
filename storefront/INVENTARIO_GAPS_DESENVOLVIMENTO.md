# 📦 Inventário de Gaps e Plano de Desenvolvimento

**Data:** Outubro 8, 2025  
**Status:** 🔴 Desenvolvimento Iniciado  
**Prioridade:** CRÍTICA

---

## 📊 Inventário Completo de Gaps

### 🔴 Prioridade CRÍTICA (Iniciar Imediatamente)

#### 1. Compliance Module (30% → 100%)

**Gaps Identificados:**

```tsx
❌ src/modules/compliance/data/
   └── distribuidoras.json (0 bytes)
   └── limites-prodist.json (não existe)
   └── templates-dossie.json (não existe)

❌ src/modules/compliance/validators/
   └── prodist-validator.ts (não existe)
   └── checklist-validator.ts (não existe)
   └── dossie-validator.ts (não existe)

❌ src/modules/compliance/generators/
   └── dossie-generator.ts (não existe)
   └── checklist-generator.ts (não existe)
   └── pdf-generator.ts (não existe)

❌ src/modules/compliance/components/
   └── ComplianceWizard.tsx (não existe)
   └── ComplianceForm.tsx (não existe)
   └── ValidationResults.tsx (não existe)
   └── DossiePreview.tsx (não existe)
   └── ChecklistView.tsx (não existe)

❌ src/modules/compliance/index.tsx (não existe)
❌ src/modules/compliance/page.tsx (não existe)
❌ src/modules/compliance/integrations.tsx (não existe)

✅ src/modules/compliance/types.ts (existe - 200 linhas)
```

**Esforço Estimado:** 40 horas (1 semana)

---

#### 2. Insurance Module (20% → 100%)

**Gaps Identificados:**

```tsx
❌ src/modules/insurance/ (pasta vazia)
   
TUDO FALTANDO:
❌ types.ts
❌ index.tsx
❌ data/seguradoras.json
❌ data/coberturas.json
❌ data/precos-base.json
❌ services/cotacao-service.ts
❌ services/apolice-service.ts
❌ services/sinistro-service.ts
❌ validators/risco-validator.ts
❌ validators/cobertura-validator.ts
❌ generators/proposta-generator.ts
❌ generators/apolice-generator.ts
❌ components/InsuranceQuoteForm.tsx
❌ components/PolicyCard.tsx
❌ components/CoverageSelector.tsx
❌ components/QuoteComparison.tsx
❌ page.tsx
❌ integrations.tsx
```

**Esforço Estimado:** 48 horas (1.5 semanas)

---

#### 3. Solar-CV Module (40% → 100%)

**Gaps Identificados:**

```tsx
✅ src/modules/solar-cv/index.tsx (existe - UI skeleton)
✅ src/modules/solar-cv/components/panel-detection.tsx (existe - mock)
❌ src/modules/solar-cv/components/thermal-analysis.tsx (placeholder)
❌ src/modules/solar-cv/components/photogrammetry.tsx (placeholder)

❌ Backend Integration:
   └── API endpoints retornam mock
   └── Sem processamento real de IA
   └── Sem validação de imagens

❌ src/lib/api/solar-cv-client.ts (mock data)
❌ Backend service não existe
```

**Esforço Estimado:** 60 horas (2 semanas) - inclui backend

---

### 🟡 Prioridade ALTA (Próximas 2 Semanas)

#### 4. Account Module (90% → 100%)

**Gaps Identificados:**

```tsx
❌ src/modules/account/index.tsx (não existe)
❌ src/modules/account/context/AccountContext.tsx (não existe)
❌ src/modules/account/hooks/useAccount.ts (não existe)
❌ src/modules/account/hooks/useCalculations.ts (não existe)
❌ src/modules/account/types.ts (não existe)

✅ Componentes (todos existem)
⚠️ Backend integration incompleta
```

**Esforço Estimado:** 16 horas (2 dias)

---

#### 5. Onboarding Module (60% → 100%)

**Gaps Identificados:**

```tsx
✅ Backend services (NASA, NREL, PVGIS)
✅ Schemas JSON
✅ Orquestração

❌ src/modules/onboarding/components/OnboardingFlow.tsx
❌ src/modules/onboarding/components/LocationStep.tsx
❌ src/modules/onboarding/components/ConsumptionStep.tsx
❌ src/modules/onboarding/components/RoofStep.tsx
❌ src/modules/onboarding/components/ResultsStep.tsx
❌ src/modules/onboarding/components/ProgressIndicator.tsx
❌ src/modules/onboarding/index.tsx
❌ src/app/[countryCode]/onboarding/page.tsx
❌ src/app/[countryCode]/onboarding/step/[id]/page.tsx
```

**Esforço Estimado:** 32 horas (4 dias)

---

#### 6. Quotes Module (70% → 100%)

**Gaps Identificados:**

```tsx
✅ src/modules/quotes/components/solar-integration.tsx (completo)

❌ src/modules/quotes/index.tsx
❌ src/modules/quotes/types.ts
❌ src/modules/quotes/context/QuotesContext.tsx
❌ src/modules/quotes/components/QuotesList.tsx
❌ src/modules/quotes/components/QuoteForm.tsx
❌ src/modules/quotes/components/QuoteDetails.tsx
❌ src/modules/quotes/hooks/useQuotes.ts
❌ src/modules/quotes/hooks/useQuote.ts
❌ src/lib/data/quotes.ts (CRUD functions)
```

**Esforço Estimado:** 24 horas (3 dias)

---

### ⚪ Prioridade MÉDIA (Próximo Mês)

#### 7. Logistics Module (0% → 80%)

**Tudo Faltando:**

```tsx
❌ src/modules/logistics/
   └── types.ts
   └── index.tsx
   └── services/correios-api.ts
   └── services/transportadoras-api.ts
   └── components/FreteCalculator.tsx
   └── components/RastreamentoView.tsx
   └── components/ShippingOptions.tsx
   └── integrations.tsx
   └── page.tsx
```

**Esforço Estimado:** 40 horas (1 semana)

---

#### 8. Warranty Module (0% → 70%)

**Tudo Faltando:**

```tsx
❌ src/modules/warranty/
   └── types.ts
   └── index.tsx
   └── components/WarrantyCard.tsx
   └── components/WarrantyForm.tsx
   └── components/WarrantyList.tsx
   └── components/ClaimForm.tsx
   └── services/warranty-service.ts
   └── page.tsx
```

**Esforço Estimado:** 32 horas (4 dias)

---

#### 9. Support Module (0% → 60%)

**Tudo Faltando:**

```tsx
❌ src/modules/support/
   └── types.ts
   └── index.tsx
   └── components/TicketForm.tsx
   └── components/TicketList.tsx
   └── components/KnowledgeBase.tsx
   └── components/FAQSection.tsx
   └── services/ticket-service.ts
   └── page.tsx
```

**Esforço Estimado:** 32 horas (4 dias)

---

## 🎯 Plano de Desenvolvimento - 6 Semanas

### Semana 1-2: Módulos Críticos (Compliance + Insurance)

**Sprint 1: Compliance Module**

```tsx
Dias 1-2: Data & Validators
- [ ] distribuidoras.json (8 distribuidoras)
- [ ] limites-prodist.json
- [ ] prodist-validator.ts
- [ ] checklist-validator.ts

Dias 3-4: Generators & Components
- [ ] dossie-generator.ts
- [ ] pdf-generator.ts
- [ ] ComplianceWizard.tsx
- [ ] ComplianceForm.tsx

Dia 5: Integration & Testing
- [ ] ValidationResults.tsx
- [ ] DossiePreview.tsx
- [ ] index.tsx + page.tsx
- [ ] Testes unitários
```

**Sprint 2: Insurance Module**

```tsx
Dias 1-2: Foundation
- [ ] types.ts
- [ ] data/seguradoras.json
- [ ] data/coberturas.json
- [ ] risco-validator.ts

Dias 3-4: Services & Components
- [ ] cotacao-service.ts
- [ ] apolice-service.ts
- [ ] InsuranceQuoteForm.tsx
- [ ] PolicyCard.tsx

Dia 5: Integration & Testing
- [ ] CoverageSelector.tsx
- [ ] QuoteComparison.tsx
- [ ] index.tsx + page.tsx
- [ ] Testes unitários
```

### Semana 3: Solar-CV Backend + Account/Quotes/Onboarding

**Sprint 3A: Solar-CV Backend**

```tsx
Dias 1-3: Backend Implementation
- [ ] FastAPI service setup
- [ ] Panel detection model integration
- [ ] API endpoints reais
- [ ] Substituir mock data

Dias 4-5: Frontend Integration
- [ ] Conectar frontend ao backend
- [ ] Implementar thermal-analysis
- [ ] Implementar photogrammetry
- [ ] Error handling & validação
```

**Sprint 3B: Account Module**

```tsx
Dia 1: Core Files
- [ ] index.tsx
- [ ] types.ts
- [ ] AccountContext.tsx

Dia 2: Hooks & Integration
- [ ] useAccount.ts
- [ ] useCalculations.ts
- [ ] Backend integration
- [ ] Testes
```

### Semana 4: Onboarding + Quotes

**Sprint 4A: Onboarding UI**

```tsx
Dias 1-2: Flow Components
- [ ] OnboardingFlow.tsx
- [ ] LocationStep.tsx
- [ ] ConsumptionStep.tsx

Dias 3-4: Additional Steps
- [ ] RoofStep.tsx
- [ ] ResultsStep.tsx
- [ ] ProgressIndicator.tsx

Dia 5: Routes & Integration
- [ ] page.tsx
- [ ] step/[id]/page.tsx
- [ ] index.tsx
```

**Sprint 4B: Quotes CRUD**

```tsx
Dias 1-2: Core
- [ ] types.ts
- [ ] QuotesContext.tsx
- [ ] CRUD functions

Dias 3-4: Components
- [ ] QuotesList.tsx
- [ ] QuoteForm.tsx
- [ ] QuoteDetails.tsx

Dia 5: Integration
- [ ] useQuotes.ts
- [ ] useQuote.ts
- [ ] Testes
```

### Semana 5: Logistics + Warranty

**Sprint 5A: Logistics**

```tsx
Dias 1-2: Services
- [ ] types.ts
- [ ] correios-api.ts
- [ ] transportadoras-api.ts

Dias 3-5: Components
- [ ] FreteCalculator.tsx
- [ ] RastreamentoView.tsx
- [ ] ShippingOptions.tsx
- [ ] Integration with checkout
```

**Sprint 5B: Warranty**

```tsx
Dias 1-2: Foundation
- [ ] types.ts
- [ ] warranty-service.ts

Dias 3-5: Components
- [ ] WarrantyCard.tsx
- [ ] WarrantyForm.tsx
- [ ] WarrantyList.tsx
- [ ] ClaimForm.tsx
```

### Semana 6: Support + Testing + Documentation

**Sprint 6: Support & Quality**

```tsx
Dias 1-3: Support Module
- [ ] types.ts
- [ ] ticket-service.ts
- [ ] TicketForm.tsx
- [ ] TicketList.tsx
- [ ] KnowledgeBase.tsx

Dias 4-5: Quality & Docs
- [ ] Test coverage >70%
- [ ] E2E tests critical flows
- [ ] Update documentation
- [ ] Performance audit
```

---

## 📈 Métricas de Progresso

### Baseline (Hoje)

- Módulos 100% Funcionais: **9**
- Cobertura Real: **68%**
- Test Coverage: **0%**
- Componentes Faltantes: **~60**

### Meta Semana 2

- Módulos 100% Funcionais: **11** (+2: Compliance, Insurance)
- Cobertura Real: **74%**
- Componentes Desenvolvidos: **+20**

### Meta Semana 4

- Módulos 100% Funcionais: **15** (+4: Solar-CV, Account, Onboarding, Quotes)
- Cobertura Real: **83%**
- Test Coverage: **40%**
- Componentes Desenvolvidos: **+45**

### Meta Semana 6

- Módulos 100% Funcionais: **18** (+3: Logistics, Warranty, Support)
- Cobertura Real: **95%**
- Test Coverage: **70%**
- Componentes Desenvolvidos: **+60**
- Lighthouse Score: **90+**

---

## 🚀 Começando Agora

### Arquivos Sendo Criados (Prioridade Máxima)

1. **Compliance Module - Data Layer**
   - distribuidoras.json
   - limites-prodist.json

2. **Compliance Module - Validators**
   - prodist-validator.ts

3. **Compliance Module - Components**
   - ComplianceWizard.tsx
   - ComplianceForm.tsx

4. **Account Module - Core**
   - index.tsx
   - types.ts
   - AccountContext.tsx

5. **Quotes Module - Core**
   - index.tsx
   - types.ts
   - QuotesContext.tsx

---

**Status:** 🟢 Desenvolvimento Iniciado  
**Próxima Revisão:** Fim da Semana 1  
**Responsável:** Development Team
