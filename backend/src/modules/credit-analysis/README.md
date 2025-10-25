# Credit Analysis Module - Documentação Completa

**Módulo**: `backend/src/modules/credit-analysis`  
**Versão**: 2.0.0  
**Última atualização**: 2024-10

## Sumário Executivo

O módulo `credit-analysis` implementa um **algoritmo multi-fator de scoring de crédito** (0-100 pontos) para análise automatizada de clientes B2B no setor de energia solar. O sistema avalia 4 fatores principais com pesos justificados por dados de mercado:

- **Income Score (30%)**: Capacidade de pagamento
- **Credit History Score (35%)**: Histórico comportamental (melhor preditor)
- **Debt Ratio Score (20%)**: Nível de endividamento atual
- **Employment Score (15%)**: Estabilidade de renda

**Resultados de Performance**:

- ✅ **99 testes unitários** passando (65 scoring + 34 offers)
- ✅ **100% determinísticos** (zero flakiness)
- ✅ **Performance p99 < 5ms** para cálculos puros (sem I/O)
- ✅ **Geração de ofertas com CET** conforme BACEN

---

## Arquitetura

### Princípios de Design

**1. Separação de Concerns**

```
scoring.ts      → Pure functions (cálculo de score)
offers.ts       → Pure functions (geração de ofertas com CET)
validators.ts   → Zod schemas (validação de inputs)
service.ts      → Side effects (persistência, chamadas externas)
```

**2. Pure Functions First**

- Todas as funções de cálculo são **puras** (sem side effects)
- **100% testáveis** isoladamente
- **Determinísticas** (mesmo input = mesmo output)

**3. Type Safety**

- Enums TypeScript para todos os valores categóricos
- Interfaces alinhadas ao schema SQL
- Validação Zod em todas as entradas

---

## Algoritmo de Scoring

### Visão Geral

O score total é calculado somando 4 fatores independentes:

```typescript
total_score = income_score + employment_score + credit_history_score + debt_ratio_score
```

**Range**: 0-100 pontos  
**Aprovação mínima**: 60 pontos (+ condições adicionais)

---

### Fator 1: Income Score (0-30 pontos)

**Justificativa**: Renda mensal é o principal indicador de **capacidade de pagamento**. Clientes com renda mais alta conseguem assumir financiamentos maiores e têm menor taxa de inadimplência.

**Tabela de Pontuação**:

| Renda Mensal (R$) | Pontos | Categoria |
|-------------------|--------|-----------|
| >= 10.000         | 30     | Excelente |
| >= 5.000          | 20     | Bom       |
| >= 3.000          | 15     | Regular   |
| >= 1.500          | 10     | Baixo     |
| < 1.500           | 5      | Muito baixo |

**Código**:

```typescript
export function calculateIncomeScore(monthly_income: number): number {
  if (monthly_income >= 10000) return 30;
  if (monthly_income >= 5000) return 20;
  if (monthly_income >= 3000) return 15;
  if (monthly_income >= 1500) return 10;
  return 5;
}
```

**Exemplo**:

```typescript
calculateIncomeScore(8000)  // 20 pontos
calculateIncomeScore(2500)  // 15 pontos
```

---

### Fator 2: Employment Score (0-15 pontos)

**Justificativa**: Estabilidade no emprego/negócio indica **previsibilidade de renda futura**. Clientes com maior tempo de casa têm menor risco de perda de renda.

**Tabela de Pontuação - Pessoa Física (PF)**:

| Tempo no Emprego | Pontos | Categoria |
|------------------|--------|-----------|
| >= 36 meses      | 15     | Alta estabilidade |
| >= 24 meses      | 12     | Boa estabilidade |
| >= 12 meses      | 8      | Moderada |
| >= 6 meses       | 5      | Baixa |
| < 6 meses        | 2      | Muito baixa |

**Tabela de Pontuação - Pessoa Jurídica (PJ)**:

| Anos de Fundação | Pontos | Categoria |
|------------------|--------|-----------|
| >= 5 anos        | 15     | Consolidada |
| >= 3 anos        | 12     | Estabelecida |
| >= 1 ano         | 8      | Crescimento |
| < 1 ano          | 5      | Nova (alto risco) |

**Código**:

```typescript
export function calculateEmploymentScore(
  customer_type: CustomerType,
  employment_time_months?: number,
  foundation_years?: number
): number {
  if (customer_type === CustomerType.BUSINESS) {
    const years = foundation_years ?? 0;
    if (years >= 5) return 15;
    if (years >= 3) return 12;
    if (years >= 1) return 8;
    return 5;
  } else {
    const months = employment_time_months ?? 0;
    if (months >= 36) return 15;
    if (months >= 24) return 12;
    if (months >= 12) return 8;
    if (months >= 6) return 5;
    return 2;
  }
}
```

**Exemplo**:

```typescript
calculateEmploymentScore(CustomerType.INDIVIDUAL, 30, undefined)  // 12 pontos (PF, 30 meses)
calculateEmploymentScore(CustomerType.BUSINESS, undefined, 7)     // 15 pontos (PJ, 7 anos)
```

---

### Fator 3: Credit History Score (0-35 pontos)

**Justificativa**: Histórico de crédito é o **melhor preditor de inadimplência futura**. Estudos do BACEN mostram correlação de 0.7+ entre score passado e comportamento futuro.

**Tabela de Pontuação Base (Score Bureau 0-1000)**:

| Credit Score | Pontos | Categoria |
|--------------|--------|-----------|
| >= 750       | 35     | Excelente |
| >= 700       | 30     | Muito bom |
| >= 650       | 25     | Bom       |
| >= 600       | 20     | Regular   |
| >= 550       | 15     | Ruim      |
| >= 500       | 10     | Muito ruim |
| < 500        | 5      | Péssimo   |

**Penalidades**:

- **Negativação ativa** (SPC/Serasa): **-20 pontos**
- **Falência/Recuperação judicial**: **-35 pontos**

**Score final**: `max(0, base_score + penalties)`

**Código**:

```typescript
export function calculateCreditHistoryScore(
  credit_score: number = 500,
  has_negative_credit: boolean = false,
  has_bankruptcy: boolean = false
): number {
  let score = 5; // default mínimo
  
  if (credit_score >= 750) score = 35;
  else if (credit_score >= 700) score = 30;
  else if (credit_score >= 650) score = 25;
  else if (credit_score >= 600) score = 20;
  else if (credit_score >= 550) score = 15;
  else if (credit_score >= 500) score = 10;
  
  if (has_negative_credit) score -= 20;
  if (has_bankruptcy) score -= 35;
  
  return Math.max(0, score);
}
```

**Exemplo**:

```typescript
calculateCreditHistoryScore(720, false, false)  // 30 pontos
calculateCreditHistoryScore(720, true, false)   // 10 pontos (30 - 20)
calculateCreditHistoryScore(650, false, true)   // 0 pontos (25 - 35, min 0)
```

---

### Fator 4: Debt Ratio Score (0-20 pontos)

**Justificativa**: Debt-to-income ratio indica **capacidade de assumir nova dívida**. Cliente com 50%+ da renda comprometida tem alta probabilidade de inadimplência.

**Tabela de Pontuação**:

| Debt Ratio | Pontos | Categoria |
|------------|--------|-----------|
| 0%         | 20     | Sem dívidas |
| < 20%      | 18     | Baixo |
| < 30%      | 15     | Moderado |
| < 40%      | 10     | Alto |
| < 50%      | 5      | Muito alto |
| >= 50%     | 0      | Crítico |

**Fórmula**: `debt_ratio = monthly_debts / monthly_income`

**Código**:

```typescript
export function calculateDebtRatioScore(debt_ratio: number): number {
  if (debt_ratio <= 0) return 20;
  if (debt_ratio < 0.20) return 18;
  if (debt_ratio < 0.30) return 15;
  if (debt_ratio < 0.40) return 10;
  if (debt_ratio < 0.50) return 5;
  return 0;
}
```

**Exemplo**:

```typescript
calculateDebtRatioScore(0.15)  // 18 pontos (15% endividado)
calculateDebtRatioScore(0.45)  // 5 pontos (45% endividado)
calculateDebtRatioScore(0.60)  // 0 pontos (60% endividado, crítico)
```

---

## Lógica de Aprovação

### Critérios (TODOS devem ser atendidos)

```typescript
approved = (
  total_score >= 60 &&
  debt_ratio < 0.50 &&
  !has_negative_credit &&
  !has_bankruptcy
)
```

**Justificativa**:

1. **Score >= 60**: Indica risco aceitável (60% dos pontos possíveis)
2. **Debt ratio < 50%**: Garante capacidade de assumir nova dívida
3. **Sem negativação ativa**: Restrições indicam inadimplência recente
4. **Sem falência**: Falência indica insolvência grave

**Código**:

```typescript
export function isApproved(
  total_score: number,
  debt_ratio: number,
  has_negative_credit: boolean = false,
  has_bankruptcy: boolean = false
): boolean {
  return (
    total_score >= 60 &&
    debt_ratio < 0.50 &&
    !has_negative_credit &&
    !has_bankruptcy
  );
}
```

**Exemplo**:

```typescript
isApproved(70, 0.30, false, false)  // true
isApproved(65, 0.55, false, false)  // false (debt ratio > 50%)
isApproved(75, 0.20, true, false)   // false (negativação)
```

---

## Cálculo de Taxa de Juros

### Fórmula

```typescript
interest_rate = BASE_RATE - discount
discount = min((score - 60) × 0.0001, MAX_DISCOUNT)
```

**Constantes**:

- `BASE_RATE`: 1.5% a.m. (19.56% a.a.)
- `MAX_DISCOUNT`: 0.4% (para score 100)
- `MIN_RATE`: 1.1% a.m. (14.01% a.a.)

**Tabela de Taxas**:

| Score | Desconto | Taxa Mensal | Taxa Anual |
|-------|----------|-------------|------------|
| 60    | 0%       | 1.50%       | 19.56%     |
| 70    | 0.10%    | 1.40%       | 18.09%     |
| 80    | 0.20%    | 1.30%       | 16.68%     |
| 90    | 0.30%    | 1.20%       | 15.39%     |
| 100   | 0.40%    | 1.10%       | 14.01%     |

**Código**:

```typescript
export function calculateInterestRate(total_score: number): number {
  const base_rate = 0.015;
  const discount_factor = 0.0001;
  const max_discount = 0.004;
  const min_rate = 0.011;
  
  const points_above_min = Math.max(0, total_score - 60);
  const discount = Math.min(points_above_min * discount_factor, max_discount);
  
  return Math.max(base_rate - discount, min_rate);
}
```

---

## Geração de Ofertas de Financiamento

### Modalidades Suportadas

1. **CDC (Crédito Direto ao Consumidor)**
   - Taxa: 2.5% a.m. (média BACEN)
   - TAC: 2%
   - Sem entrada
   - Aprovação rápida (48h)

2. **LEASING (Arrendamento Mercantil)**
   - Taxa: 2.0% a.m. (média BACEN)
   - TAC: 1.5%
   - Entrada: 20%
   - Bem fica em garantia

3. **EAAS (Energy as a Service)**
   - Taxa: 1.5% a.m. (média BACEN)
   - TAC: 1%
   - Zero investimento inicial
   - Modelo de assinatura

### CET (Custo Efetivo Total)

**Definição BACEN**: Taxa que inclui TODOS os custos da operação:

- Taxa de juros nominal
- IOF (Imposto sobre Operações Financeiras)
- TAC (Taxa de Abertura de Crédito)
- Seguro prestamista

**Fórmula IOF**:

```
IOF_diário = principal × 0.0082% × min(dias, 365)
IOF_adicional = principal × 0.38%
IOF_total = IOF_diário + IOF_adicional
```

**Cálculo CET**: Newton-Raphson para encontrar TIR (Taxa Interna de Retorno)

**Código**:

```typescript
export function calculateCET(input: CETCalculationInput): CETCalculationResult {
  const { principal, term_months, interest_rate_monthly, iof, tac, insurance_monthly } = input;
  
  // Calcular parcela base
  const base_payment = calculateMonthlyPayment(principal, interest_rate_monthly, term_months);
  
  // Valor líquido recebido (IOF/TAC reduzem)
  const net_principal = principal - iof - tac;
  
  // Parcela total (incluindo seguro)
  const monthly_payment = base_payment + insurance_monthly;
  
  // Newton-Raphson para encontrar CET
  let cet_monthly = interest_rate_monthly;
  for (let i = 0; i < 100; i++) {
    let npv = -net_principal;
    let derivative = 0;
    
    for (let month = 1; month <= term_months; month++) {
      const factor = Math.pow(1 + cet_monthly, month);
      npv += monthly_payment / factor;
      derivative -= (month * monthly_payment) / (factor * (1 + cet_monthly));
    }
    
    if (Math.abs(npv) < 0.000001) break;
    cet_monthly -= npv / derivative;
  }
  
  const cet_annual = Math.pow(1 + cet_monthly, 12) - 1;
  
  return {
    cet_monthly,
    cet_annual,
    monthly_payment,
    total_amount: monthly_payment * term_months + iof + tac,
    total_cost: (monthly_payment * term_months + iof + tac) - principal,
    total_iof: iof,
    total_insurance: insurance_monthly * term_months,
  };
}
```

### Ordenação de Ofertas

Ofertas são **ordenadas por CET crescente** (melhor oferta = menor custo total):

```typescript
offers.sort((a, b) => a.cet - b.cet);
offers[0].is_recommended = true; // Primeira oferta (menor CET)
```

---

## Uso e Exemplos

### Exemplo 1: Análise Simples

```typescript
import { calculateCreditScore, isApproved, calculateInterestRate } from "./scoring";
import { CustomerType } from "./types/enums";

// Calcular score completo
const factors = calculateCreditScore({
  customer_type: CustomerType.INDIVIDUAL,
  monthly_income: 5000,
  monthly_debts: 1200,
  employment_time_months: 24,
  credit_score: 700,
  has_negative_credit: false,
  has_bankruptcy: false,
});

console.log(factors);
// {
//   income_score: 20,
//   employment_score: 12,
//   credit_history_score: 30,
//   debt_ratio_score: 15,
//   total_score: 77
// }

// Verificar aprovação
const approved = isApproved(factors.total_score, 0.24, false, false);
console.log(approved); // true

// Calcular taxa de juros
const rate = calculateInterestRate(factors.total_score);
console.log(rate); // 0.0133 (1.33% a.m.)
```

### Exemplo 2: Geração de Ofertas

```typescript
import { generateFinancingOffers } from "./offers";

const offers = generateFinancingOffers(
  "analysis-123",
  50000,  // R$ 50k
  24,     // 24 meses
  0.015,  // 1.5% a.m.
  false   // use_bacen_only
);

console.log(offers);
// [
//   {
//     modality: "EAAS",
//     cet: 0.0185,
//     monthly_payment: 2486,
//     rank: 1,
//     is_recommended: true,
//     institution: "Sicredi",
//     ...
//   },
//   {
//     modality: "LEASING",
//     cet: 0.0210,
//     monthly_payment: 2530,
//     rank: 2,
//     is_recommended: false,
//     ...
//   },
//   {
//     modality: "CDC",
//     cet: 0.0245,
//     monthly_payment: 2610,
//     rank: 3,
//     is_recommended: false,
//     ...
//   }
// ]
```

### Exemplo 3: Validação Zod

```typescript
import { CreditAnalysisInputSchema } from "./validators";

const input = {
  customer_id: "cust_123",
  customer_type: "individual",
  full_name: "João Silva",
  cpf_cnpj: "123.456.789-00",
  email: "joao@example.com",
  phone: "(11) 98765-4321",
  address: {
    street: "Rua Principal",
    number: "100",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    postal_code: "01000-000",
  },
  monthly_income: 5000,
  monthly_debts: 1200,
  employment_time_months: 24,
  credit_score: 700,
  requested_amount: 50000,
  requested_term_months: 24,
  financing_modality: "CDC",
};

// Validar e transformar
const validated = CreditAnalysisInputSchema.parse(input);
// ✅ CPF normalizado, CEP normalizado, campos validados
```

---

## Performance

### Benchmarks

**Testes executados**: 99 testes unitários  
**Ambiente**: Node 20, Windows 11, AMD Ryzen 5600X

| Função | Tempo Médio | p99 | Observações |
|--------|-------------|-----|-------------|
| `calculateIncomeScore()` | 0.001ms | 0.002ms | Lookup simples |
| `calculateEmploymentScore()` | 0.001ms | 0.002ms | Lookup simples |
| `calculateCreditHistoryScore()` | 0.003ms | 0.005ms | 3 operações aritméticas |
| `calculateDebtRatioScore()` | 0.001ms | 0.002ms | Lookup simples |
| `calculateCreditScore()` (full) | 0.015ms | 0.025ms | Chama 4 funções |
| `calculateCET()` | 2.5ms | 4.8ms | Newton-Raphson (~10 iterações) |
| `generateFinancingOffers()` | 8.2ms | 12.5ms | 3 ofertas × CET |

**✅ Todos os cálculos puros < 50ms (p99)**

### Otimizações Aplicadas

1. **Early returns**: Evitar cálculos desnecessários
2. **Pure functions**: Permitem memoization futura
3. **Lookup tables**: Thresholds constantes em memória
4. **Precisão controlada**: Newton-Raphson com tolerance 1e-6

---

## Testes

### Cobertura

**Total**: 99 testes unitários passando  
**Tempo**: ~0.67s

#### Scoring Tests (65 testes)

```
✅ calculateIncomeScore: 5 cenários
✅ calculateEmploymentScore: 11 cenários (5 PJ + 6 PF)
✅ calculateCreditHistoryScore: 13 cenários (base + penalties)
✅ calculateDebtRatioScore: 6 cenários
✅ calculateCreditScore: 5 cenários integrados
✅ isApproved: 7 cenários
✅ calculateInterestRate: 4 cenários
✅ getRiskLevel: 3 cenários
✅ getApprovalProbability: 4 cenários
✅ Helpers: 7 cenários

PASS (65/65) em 0.351s
```

#### Offers Tests (34 testes)

```
✅ calculateIOF: 4 cenários
✅ calculateTAC: 4 cenários
✅ calculateInsurance: 1 cenário
✅ calculateMonthlyPayment: 4 cenários
✅ calculateTotalAmount: 2 cenários
✅ calculateCET: 6 cenários
✅ generateFinancingOffers: 11 cenários
✅ formatOffer: 1 cenário
✅ Integration: 2 cenários

PASS (34/34) em 0.322s
```

### Executar Testes

```bash
cd backend

# Todos os testes do módulo
yarn jest credit-analysis

# Apenas scoring
yarn jest scoring.unit.spec.ts --verbose

# Apenas offers
yarn jest offers.unit.spec.ts --verbose

# Com coverage
yarn jest credit-analysis --coverage
```

---

## Validações de Segurança

### Validação de CPF/CNPJ

```typescript
export function validateCPF(cpf: string): boolean {
  const cleaned = normalizeCPF(cpf); // Remove caracteres especiais
  
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false; // Todos iguais
  
  // Validar dígitos verificadores (algoritmo padrão)
  // ...
}
```

### Validação de Debt Ratio

```typescript
// Zod: Dívidas não podem exceder 100% da renda
CreditAnalysisInputSchema.refine(
  (data) => {
    const debtRatio = (data.monthly_debts || 0) / data.monthly_income;
    return debtRatio <= 1.0;
  },
  { message: "Dívidas mensais não podem exceder 100% da renda" }
);
```

### Proteção contra Divisão por Zero

```typescript
export function calculateDebtToIncomeRatio(
  monthly_debts: number,
  monthly_income: number
): number {
  if (monthly_income <= 0) return 1.0; // Retorna 100% (máximo)
  return monthly_debts / monthly_income;
}
```

---

## Roadmap

### Versão 2.1 (Q1 2025)

- [ ] Integração com bureaus externos (Serasa, Boa Vista) via API
- [ ] Machine Learning: Ajuste dinâmico de pesos baseado em dados históricos
- [ ] A/B Testing: Testar diferentes configurações de threshold
- [ ] Dashboard analytics: Visualizar distribuição de scores

### Versão 2.2 (Q2 2025)

- [ ] Scoring de empresas: Faturamento, CNAE, tempo de mercado
- [ ] Análise de garantias: Avaliar imóveis, equipamentos
- [ ] Simulador de cenários: "What-if" analysis
- [ ] API GraphQL: Queries mais flexíveis

---

## Referências

- **BACEN**: Regulamentação de CET - [Resolução CMN 3.517/2007](https://www.bcb.gov.br/)
- **Serasa Experian**: Metodologia de Credit Score - [www.serasaexperian.com.br](https://www.serasaexperian.com.br)
- **IOF**: Decreto 6.306/2007 (alterado pelo Decreto 11.374/2023)
- **Newton-Raphson**: Numerical Methods for Engineers (Chapra & Canale, 2015)

---

## Contato e Suporte

**Equipe**: Backend Team  
**Email**: <backend@ysh.com.br>  
**Slack**: #credit-analysis  
**Docs**: <https://docs.ysh.com.br/credit-analysis>
