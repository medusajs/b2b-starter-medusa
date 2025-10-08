# ☀️ YSH Solar Calculator - Integração End-to-End Completa

## 📋 Visão Geral

Documentação completa da integração end-to-end do sistema de cálculo solar, cobrindo backend APIs, client libraries, React hooks e componentes de UI em cobertura 360º.

## 🏗️ Arquitetura da Solução

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js/React)                  │
├─────────────────────────────────────────────────────────────────┤
│  📄 Pages                                                        │
│  └─ /dimensionamento/page.tsx                                   │
│     └─ <SolarCalculatorComplete />                              │
│                                                                  │
│  🎨 Components                                                   │
│  ├─ solar-calculator-complete.tsx (Form + Orchestration)        │
│  ├─ solar-results.tsx (Main results component)                  │
│  ├─ dimensionamento-card.tsx (Technical specs)                  │
│  ├─ financeiro-card.tsx (Financial analysis)                    │
│  ├─ kits-recomendados-card.tsx (Product recommendations)        │
│  ├─ impacto-ambiental-card.tsx (Environmental impact)           │
│  └─ conformidade-card.tsx (MMGD compliance)                     │
│                                                                  │
│  🪝 Hooks                                                        │
│  ├─ useSolarCalculator() - Main calculation hook                │
│  ├─ useSolarKits() - Kit recommendations                        │
│  ├─ useCalculatorInfo() - Service info                          │
│  ├─ useCalculatorHealth() - Health monitoring                   │
│  └─ usePersistedCalculation() - Local storage                   │
│                                                                  │
│  📚 Lib                                                          │
│  └─ solar-calculator-client.ts (HTTP client + validation)       │
│                                                                  │
│  🎯 Types                                                        │
│  └─ solar-calculator.ts (Shared TypeScript interfaces)          │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Medusa/Node.js)                    │
├─────────────────────────────────────────────────────────────────┤
│  🚀 API Routes                                                   │
│  └─ /store/solar/calculator                                     │
│     ├─ POST - Calculate system                                  │
│     └─ GET  - Service info                                      │
│                                                                  │
│  ⚙️ Services                                                     │
│  ├─ calculator.ts - Main calculation engine                     │
│  │  ├─ calcularDimensionamento()                                │
│  │  ├─ calcularFinanceiro()                                     │
│  │  ├─ calcularImpactoAmbiental()                               │
│  │  └─ validarConformidade()                                    │
│  │                                                               │
│  └─ kit-matcher.ts - Product catalog integration                │
│     ├─ findMatchingKits()                                       │
│     └─ calculateMatchScore() (0-100 points)                     │
│                                                                  │
│  🗄️ Data Layer                                                   │
│  └─ Medusa RemoteQuery → Product Catalog                        │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Arquivos Criados

### Frontend

#### Tipos (`storefront/src/types/`)

- ✅ `solar-calculator.ts` - Interfaces TypeScript compartilhadas
  - `SolarCalculationInput` - Entrada do cálculo
  - `SolarCalculationOutput` - Resultado completo
  - `Dimensionamento`, `AnaliseFinanceira`, `ImpactoAmbiental`, etc.
  - `UseSolarCalculatorReturn` - Retorno dos hooks

#### Lib (`storefront/src/lib/`)

- ✅ `solar-calculator-client.ts` - Cliente HTTP tipado
  - `SolarCalculatorClient` class
  - `calculateSolarSystem()` - Função de conveniência
  - `validateCalculationInput()` - Validação client-side
  - `sanitizeCalculationInput()` - Limpeza de dados

#### Hooks (`storefront/src/hooks/`)

- ✅ `use-solar-calculator.ts` - React hooks customizados
  - `useSolarCalculator()` - Gerenciamento de cálculos com cache
  - `useSolarKits()` - Busca de kits recomendados
  - `useCalculatorInfo()` - Informações do serviço
  - `useCalculatorHealth()` - Monitor de saúde
  - `usePersistedCalculation()` - Persistência local
  - `useDebounce()` - Debounce para inputs

#### Components (`storefront/src/components/solar/`)

- ✅ `solar-calculator-complete.tsx` - Componente principal integrado
- ✅ `solar-results.tsx` - Orquestrador de resultados
- ✅ `dimensionamento-card.tsx` - Card de especificações técnicas
- ✅ `financeiro-card.tsx` - Card de análise financeira
- ✅ `kits-recomendados-card.tsx` - Card de kits com expansão
- ✅ `impacto-ambiental-card.tsx` - Card de impacto ambiental
- ✅ `conformidade-card.tsx` - Card de conformidade MMGD
- ✅ `index.ts` - Barrel export

### Backend

#### Services (`backend/src/modules/solar/services/`)

- ✅ `calculator.ts` - Motor de cálculo solar
  - Dimensionamento com HSP por estado
  - Análise financeira (CAPEX, ROI, TIR, VPL)
  - Impacto ambiental (CO₂, árvores, carros)
  - Conformidade MMGD (ANEEL 1.059/2023)
  
- ✅ `kit-matcher.ts` - Matching de kits do catálogo
  - Integração com Medusa RemoteQuery
  - Sistema de pontuação 0-100
  - Extração de metadados de produtos

#### API (`backend/src/api/store/solar/calculator/`)

- ✅ `route.ts` - Endpoints REST
  - POST - Cálculo completo
  - GET - Informações do serviço
  - Validação robusta de entrada
  - Tratamento de erros estruturado

- ✅ `middlewares.ts` - API versioning

#### Tests (`backend/`)

- ✅ `test-calculator.http` - Suite de testes REST Client

#### Docs (`backend/`)

- ✅ `SOLAR_CALCULATOR_IMPLEMENTATION.md` - Documentação técnica

## 🔄 Fluxo de Integração End-to-End

### 1. User Input (Frontend)

```tsx
// User preenche formulário em solar-calculator-complete.tsx
<input type="number" value={consumo} onChange={...} />
<select value={uf} onChange={...} />
```

### 2. Validation (Client-side)

```typescript
// lib/solar-calculator-client.ts
const validation = validateCalculationInput(input);
if (!validation.valid) {
  setValidationErrors(validation.errors);
  return;
}
```

### 3. API Request (HTTP Client)

```typescript
// hooks/use-solar-calculator.ts
const calculate = async (input) => {
  const calculation = await solarCalculatorClient.calculate(input);
  setResult(calculation);
  saveCalculation(calculation); // Persistir localmente
};
```

### 4. Backend Processing (API Route)

```typescript
// api/store/solar/calculator/route.ts
export async function POST(req, res) {
  const input = validateCalculatorRequest(req.body);
  const query = req.scope.resolve("query");
  const resultado = await solarCalculatorService.calculate(input, query);
  res.json({ success: true, calculation: resultado });
}
```

### 5. Calculation (Service Layer)

```typescript
// modules/solar/services/calculator.ts
async calculate(input, query) {
  const dimensionamento = this.calcularDimensionamento(input);
  const kits = await this.buscarKitsRecomendados(dimensionamento, input, query);
  const financeiro = this.calcularFinanceiro(dimensionamento, kits[0], input);
  const impacto = this.calcularImpactoAmbiental(dimensionamento.geracao_anual_kwh);
  const conformidade = this.validarConformidade(dimensionamento, input);
  return { dimensionamento, kits_recomendados: kits, financeiro, impacto_ambiental: impacto, conformidade };
}
```

### 6. Kit Matching (Catalog Integration)

```typescript
// modules/solar/services/kit-matcher.ts
async findMatchingKits(criteria, query) {
  const { data: products } = await query.graph({
    entity: "product",
    filters: { metadata: { potencia_kwp: { $gte: kwp_min, $lte: kwp_max } } }
  });
  return products.map(p => ({
    ...extractMetadata(p),
    match_score: calculateMatchScore(p, criteria)
  }));
}
```

### 7. Response (Structured Data)

```json
{
  "success": true,
  "calculation": {
    "dimensionamento": { "kwp_proposto": 4.95, ... },
    "kits_recomendados": [{ "kit_id": "...", "match_score": 95, ... }],
    "financeiro": { "capex": { ... }, "economia": { ... }, "retorno": { ... } },
    "impacto_ambiental": { "co2_evitado_toneladas": 82.5, ... },
    "conformidade": { "conforme": true, ... }
  },
  "metadata": { "calculated_at": "...", "api_version": "v1" }
}
```

### 8. UI Rendering (Components)

```tsx
// components/solar/solar-results.tsx
<SolarResults calculation={result}>
  <DimensionamentoCard dimensionamento={...} />
  <FinanceiroCard financeiro={...} />
  <KitsRecomendadosCard kits={...} onKitSelect={...} />
  <ImpactoAmbientalCard impacto={...} />
</SolarResults>
```

## 🎨 Features Implementadas

### Frontend

#### 1. Formulário Interativo

- ✅ Campos validados em tempo real
- ✅ Seleção de estado com 27 opções
- ✅ Oversizing configurável (100%, 114%, 130%, 145%, 160%)
- ✅ Tipo de sistema (on-grid, off-grid, híbrido)
- ✅ Fase elétrica (mono, bi, trifásico)
- ✅ Tipo de telhado (cerâmico, metálico, laje, fibrocimento)
- ✅ Feedback visual de erros
- ✅ Loading state durante cálculo

#### 2. Resultados Visuais

- ✅ **Dimensionamento**: kWp, painéis, inversor, área, geração
- ✅ **Financeiro**: CAPEX detalhado, economia (mensal/anual/25 anos), ROI (payback, TIR, VPL)
- ✅ **Kits**: Lista ranqueada com score, componentes expansíveis, CTA de cotação
- ✅ **Impacto**: CO₂ evitado, árvores equivalentes, carros equivalentes
- ✅ **Conformidade**: Alertas MMGD, observações técnicas

#### 3. Gerenciamento de Estado

- ✅ Cache de cálculos recentes (últimos 10)
- ✅ Persistência no localStorage (expira em 7 dias)
- ✅ Debounce para inputs
- ✅ Health check do serviço

### Backend

#### 1. Cálculos Técnicos

- ✅ HSP específico por estado (27 estados)
- ✅ Performance Ratio 82%
- ✅ Degradação 0,5% a.a.
- ✅ Projeção 25 anos
- ✅ Simulação mensal de geração

#### 2. Análise Financeira

- ✅ CAPEX: Equipamentos, instalação, projeto, homologação
- ✅ Economia: Mensal, anual, 25 anos, percentual
- ✅ ROI: Payback simples/descontado, TIR, VPL
- ✅ Financiamento: Parcelas, economia líquida

#### 3. Integração com Catálogo

- ✅ Query de produtos via RemoteQuery
- ✅ Filtro por potência (±15% tolerância)
- ✅ Sistema de pontuação multi-critério
- ✅ Extração de componentes (painéis, inversores, baterias, estrutura)
- ✅ Fallback para kits mock

#### 4. Validação MMGD

- ✅ Limite de oversizing (160% máximo)
- ✅ Limite de potência por fase
- ✅ Alertas e observações
- ✅ Conformidade com ANEEL 1.059/2023

## 🧪 Como Testar

### 1. Iniciar Backend

```powershell
cd ysh-store
.\dev.ps1
```

### 2. Testar API (REST Client)

Abra `backend/test-calculator.http` no VS Code e execute:

- GET `/store/solar/calculator` - Info do serviço
- POST `/store/solar/calculator` - Cálculo básico (SP, 450 kWh)
- POST com localização completa
- POST com financiamento
- POST com consumo mensal array

### 3. Testar Frontend

```powershell
cd storefront
npm run dev
```

Navegue para: `http://localhost:8000/br/dimensionamento`

### 4. Fluxo de Teste Completo

1. Preencha consumo: **450 kWh/mês**
2. Selecione estado: **SP**
3. Oversizing: **130%** (recomendado)
4. Tipo: **On-Grid**
5. Fase: **Bifásico**
6. Telhado: **Cerâmico**
7. Clique em **"🧮 Calcular Sistema Solar"**

**Resultado Esperado**:

- Sistema de ~4.95 kWp
- 9 painéis de 550W
- Inversor de 4.2 kW
- Investimento ~R$ 17.300
- Payback ~3.5 anos
- Economia R$ 410/mês
- Kits ranqueados com score

## 📊 Dados Técnicos

### Estados Brasileiros (HSP)

```typescript
AC: 4.5  AL: 5.5  AM: 4.7  AP: 4.9  BA: 5.7  CE: 5.8  DF: 5.4
ES: 5.0  GO: 5.5  MA: 5.3  MG: 5.4  MS: 5.2  MT: 5.3  PA: 4.8
PB: 5.9  PE: 5.8  PI: 5.6  PR: 4.8  RJ: 5.0  RN: 5.9  RO: 4.9
RR: 4.6  RS: 4.6  SC: 4.5  SE: 5.6  SP: 5.1  TO: 5.4
```

### Tarifas de Energia (R$/kWh)

```typescript
AC: 0.75  AL: 0.78  AM: 0.72  BA: 0.80  CE: 0.76  DF: 0.72
ES: 0.74  GO: 0.73  MG: 0.82  PR: 0.79  RJ: 0.88  RS: 0.85
SC: 0.77  SP: 0.78  [Demais]: 0.75
```

### Parâmetros de Cálculo

- **Performance Ratio**: 82%
- **Degradação Anual**: 0,5%
- **Área por kWp**: 6,5 m²
- **Potência Inversor**: 85% dos painéis
- **Taxa de desconto (VPL)**: 8% a.a.
- **SELIC (financiamento)**: 11,75% a.a.

## 🚀 Próximos Passos

### Integração com Produtos

```typescript
// Ao clicar em "Solicitar Cotação"
const handleKitSelect = (kitId: string) => {
  // TODO: Redirecionar para página do produto
  router.push(`/produtos/kits/${kitId}`);
  
  // OU: Abrir modal de cotação
  setQuoteModal({ open: true, kitId });
};
```

### Melhorias Futuras

- [ ] Exportar PDF com resultados
- [ ] Compartilhar cálculo via link
- [ ] Comparar múltiplos cenários
- [ ] Simulação de sombreamento
- [ ] Análise sazonal detalhada
- [ ] Dimensionamento de baterias (off-grid/híbrido)
- [ ] Integração com Google Maps (área de telhado)
- [ ] Histórico de cálculos por usuário
- [ ] Dashboard de monitoramento pós-instalação

## 📞 Suporte

Para dúvidas técnicas sobre a integração:

- Backend: Verifique logs em `console.log('[Calculator] ...')`
- Frontend: Verifique DevTools console
- API: Teste com `test-calculator.http`
- Erros: Verifique `error` state nos hooks

---

**Status**: ✅ **Integração End-to-End Completa**  
**Cobertura**: 360º (Backend → Client → Hooks → UI)  
**Última Atualização**: 2024-10-07  
**Autor**: YSH Development Team
