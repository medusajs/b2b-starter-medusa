# 💰 Estratégia de Precificação Inteligente - YSH Solar Platform

**Versão:** 1.0.0  
**Data:** 14 de Outubro de 2025  
**Autor:** YSH Strategy Team

---

## 📊 Visão Geral

Este documento detalha as estratégias de precificação dinâmica, margens inteligentes e fees operacionais da plataforma YSH Solar, incluindo regras de pricing multi-distribuidor e otimização de margens por contexto de venda.

---

## 1. Pricing Inteligente Multi-Distribuidor

### 1.1 Score de Competitividade

**Algoritmo de Classificação de Preços:**

```typescript
interface PriceScore {
  score: 'excellent_deal' | 'good_price' | 'average' | 'expensive';
  delta: number; // Diferença percentual vs melhor preço
  recommendation: string;
}

function calculatePriceScore(
  productPrice: number,
  bestPrice: number,
  worstPrice: number
): PriceScore {
  const delta = ((productPrice - bestPrice) / bestPrice) * 100;
  
  if (delta <= 2) return {
    score: 'excellent_deal',
    delta,
    recommendation: 'Excelente oportunidade - comprar agora'
  };
  
  if (delta <= 5) return {
    score: 'good_price',
    delta,
    recommendation: 'Bom preço - considerar compra'
  };
  
  if (delta <= 10) return {
    score: 'average',
    delta,
    recommendation: 'Preço médio - avaliar alternativas'
  };
  
  return {
    score: 'expensive',
    delta,
    recommendation: 'Preço alto - negociar ou aguardar'
  };
}
```

### 1.2 Estratégia de Markup Dinâmico

**Regra de Negócio RN-PRICING-001:**

```typescript
function calculateDynamicMarkup(priceScore: string, baseMarkup: number): number {
  const markupStrategy = {
    'excellent_deal': baseMarkup + 5,  // 25% → 30% (preço imbatível)
    'good_price': baseMarkup + 2,      // 25% → 27% (ainda competitivo)
    'average': baseMarkup - 3,         // 25% → 22% (reduzir para competir)
    'expensive': baseMarkup - 8        // 25% → 17% (margem mínima)
  };
  
  return markupStrategy[priceScore] || baseMarkup;
}
```

**Exemplo Prático:**

| Produto | Custo NeoSolar | Score | Markup Base | Markup Dinâmico | Preço Final | Margem |
|---------|----------------|-------|-------------|-----------------|-------------|--------|
| Painel 550W | R$ 508 | excellent_deal | 25% | 30% | R$ 660 | R$ 152 (30%) |
| Inversor 5kW | R$ 3.200 | good_price | 25% | 27% | R$ 4.064 | R$ 864 (27%) |
| Estrutura 10p | R$ 850 | average | 25% | 22% | R$ 1.037 | R$ 187 (22%) |
| Cabo Solar 6mm | R$ 4,80 | expensive | 25% | 17% | R$ 5,62 | R$ 0,82 (17%) |

**Total Kit Exemplo:** Custo R$ 4.562,80 → Preço R$ 5.761,62 (26.3% margem média ponderada)

---

## 2. Pricing por Canal de Vendas

### 2.1 Estrutura Multi-Canal

**Regra de Negócio RN-PRICING-002:**

```typescript
enum SalesChannel {
  DIRECT_B2C = 'direct_b2c',        // Venda direta ao consumidor
  INTEGRATOR_B2B = 'integrator_b2b', // Integradores parceiros
  DISTRIBUTOR = 'distributor',       // Revendedores
  MARKETPLACE = 'marketplace',       // Marketplaces externos
  WHITELABEL = 'whitelabel'          // Parceiros white-label
}

interface ChannelPricing {
  baseDiscount: number;    // Desconto base sobre tabela
  volumeBonus: number;     // Bônus adicional por volume
  paymentTerms: number;    // Prazo de pagamento (dias)
  supportLevel: string;    // Nível de suporte incluído
}

const channelPricingRules: Record<SalesChannel, ChannelPricing> = {
  DIRECT_B2C: {
    baseDiscount: 0,
    volumeBonus: 0,
    paymentTerms: 30,
    supportLevel: 'premium'
  },
  INTEGRATOR_B2B: {
    baseDiscount: 15,
    volumeBonus: 5,        // Até +5% por volume
    paymentTerms: 60,
    supportLevel: 'business'
  },
  DISTRIBUTOR: {
    baseDiscount: 20,
    volumeBonus: 3,
    paymentTerms: 75,
    supportLevel: 'standard'
  },
  MARKETPLACE: {
    baseDiscount: 10,
    volumeBonus: 0,
    paymentTerms: 15,      // Marketplace paga rápido
    supportLevel: 'basic'
  },
  WHITELABEL: {
    baseDiscount: 25,
    volumeBonus: 10,       // Até +10% por volume
    paymentTerms: 90,
    supportLevel: 'enterprise'
  }
};
```

### 2.2 Matriz de Comissões por Canal

| Canal | Comissão Vendas | Fee Plataforma | Fee Financeiro | Suporte | Total Fees |
|-------|----------------|----------------|----------------|---------|------------|
| **Direct B2C** | 6.5% | 0% | 2.99% | Incluído | 9.49% |
| **Integrator B2B** | 4% | 1.5% | 0% | Básico | 5.5% |
| **Distributor** | 0% | 2% | 0% | Self-service | 2% |
| **Marketplace** | 0% | 12-15% | 0% | Marketplace | 12-15% |
| **White-label** | 0% | 3% | 0% | Enterprise | 3% |

---

## 3. Pricing Psicológico e Âncoras

### 3.1 Estratégia de Ancoragem

**Regra de Negócio RN-PRICING-003:**

```typescript
interface PricingAnchor {
  showOriginalPrice: boolean;
  discount: number;
  urgencyMessage?: string;
  socialProof?: string;
}

function createPricingAnchor(
  originalPrice: number,
  discountPercent: number
): PricingAnchor {
  return {
    showOriginalPrice: true,
    discount: discountPercent,
    urgencyMessage: discountPercent >= 15 
      ? `🔥 Economize R$ ${(originalPrice * discountPercent / 100).toFixed(2)}!`
      : undefined,
    socialProof: '✓ 1.247 projetos instalados com este kit'
  };
}
```

**Exemplo Visual:**

```text
╔══════════════════════════════════════════════════════╗
║  Kit Solar 5 kWp - Residencial Premium              ║
╠══════════════════════════════════════════════════════╣
║  De: R$ 24.999,00  (preço tabela - âncora)         ║
║  Por: R$ 21.249,15  (15% OFF - integrador)         ║
║  Ou 12× de R$ 1.770,76 sem juros                    ║
║                                                      ║
║  🔥 Economize R$ 3.749,85                           ║
║  ✓ 1.247 projetos instalados                        ║
║  ⏰ Oferta válida até 31/10/2025                    ║
╚══════════════════════════════════════════════════════╝
```

### 3.2 Preços Psicológicos (Charm Pricing)

**Regra de Negócio RN-PRICING-004:**

```typescript
function applyCharmPricing(price: number): number {
  // Arredondar para .99, .95, .90 ou .00 mais próximo
  const cents = price % 1;
  const base = Math.floor(price);
  
  if (cents <= 0.40) return base - 0.01;        // R$ 24.999
  if (cents <= 0.50) return base + 0.49;        // R$ 25.049
  if (cents <= 0.75) return base + 0.95;        // R$ 25.095
  return base + 1;                               // R$ 25.000
}

// Aplicação
const rawPrice = 24_762.37;
const charmPrice = applyCharmPricing(rawPrice); // R$ 24.999
```

---

## 4. Dynamic Pricing por Contexto

### 4.1 Fatores de Ajuste Dinâmico

**Regra de Negócio RN-PRICING-005:**

```typescript
interface DynamicPricingFactors {
  timeOfDay: number;        // Horário do dia
  dayOfWeek: number;        // Dia da semana
  seasonality: number;      // Sazonalidade (verão = alta demanda)
  inventory: number;        // Nível de estoque
  competition: number;      // Pressão competitiva
  customerSegment: number;  // Segmento do cliente
  urgency: number;          // Urgência da venda
}

function calculateDynamicPrice(
  basePrice: number,
  factors: DynamicPricingFactors
): number {
  let multiplier = 1.0;
  
  // Horário (18h-21h = pico de navegação, +2%)
  if (factors.timeOfDay >= 18 && factors.timeOfDay <= 21) {
    multiplier += 0.02;
  }
  
  // Dia da semana (segunda-feira = início de planejamento, -3%)
  if (factors.dayOfWeek === 1) {
    multiplier -= 0.03;
  }
  
  // Sazonalidade (verão = alta demanda solar, +5%)
  if (factors.seasonality === 'summer') {
    multiplier += 0.05;
  }
  
  // Estoque (baixo = aumentar preço, +3%)
  if (factors.inventory < 10) {
    multiplier += 0.03;
  } else if (factors.inventory > 100) {
    multiplier -= 0.05; // Excesso = reduzir
  }
  
  // Competição (alta = reduzir preço, -7%)
  if (factors.competition === 'high') {
    multiplier -= 0.07;
  }
  
  // Segmento (B6 Industrial = preço customizado, -10%)
  if (factors.customerSegment === 'B6') {
    multiplier -= 0.10;
  }
  
  // Urgência (carrinho abandonado = desconto recuperação, -8%)
  if (factors.urgency === 'cart_abandoned') {
    multiplier -= 0.08;
  }
  
  return basePrice * multiplier;
}
```

**Exemplo Prático:**

```typescript
const basePrice = 25_000;

// Cenário 1: Segunda-feira 14h, verão, estoque alto, B2C
const scenario1 = calculateDynamicPrice(basePrice, {
  timeOfDay: 14,
  dayOfWeek: 1,              // -3%
  seasonality: 'summer',     // +5%
  inventory: 120,            // -5%
  competition: 'medium',     // 0%
  customerSegment: 'B1',     // 0%
  urgency: 'normal'          // 0%
});
// Resultado: R$ 24.250 (multiplier: 0.97)

// Cenário 2: Sexta 19h, inverno, estoque baixo, B6 Industrial
const scenario2 = calculateDynamicPrice(basePrice, {
  timeOfDay: 19,             // +2%
  dayOfWeek: 5,              // 0%
  seasonality: 'winter',     // 0%
  inventory: 8,              // +3%
  competition: 'high',       // -7%
  customerSegment: 'B6',     // -10%
  urgency: 'normal'          // 0%
});
// Resultado: R$ 22.000 (multiplier: 0.88)
```

---

## 5. Bundling e Cross-Selling

### 5.1 Estratégia de Bundles

**Regra de Negócio RN-PRICING-006:**

```typescript
interface Bundle {
  id: string;
  name: string;
  products: string[];
  discount: number;
  savings: number;
  margin: number;
}

const strategicBundles: Bundle[] = [
  {
    id: 'residential_complete',
    name: 'Kit Residencial Completo 5kWp',
    products: [
      '10x Painel 550W (NeoSolar)',
      '1x Inversor 5kW (NeoSolar)',
      '1x Estrutura Telhado Cerâmico',
      '100m Cabo Solar 6mm²',
      '1x String Box 2 MPPT'
    ],
    discount: 12,              // 12% vs compra separada
    savings: 1_620,            // R$ 1.620 economia
    margin: 28                 // Mantém 28% margem
  },
  {
    id: 'solar_plus_battery',
    name: 'Solar + Bateria Backup',
    products: [
      'Kit Solar 5kWp',
      'Bateria Lithium 5kWh',
      'Inversor Híbrido'
    ],
    discount: 8,
    savings: 2_400,
    margin: 22                 // Margem menor (bateria competitiva)
  },
  {
    id: 'monitoring_premium',
    name: 'Monitoramento IoT Premium',
    products: [
      'Hardware IoT Gateway',
      '12 meses Dashboard Premium',
      'Alertas SMS ilimitados'
    ],
    discount: 20,
    savings: 240,
    margin: 65                 // Alta margem (SaaS)
  }
];
```

### 5.2 Cross-Sell Inteligente

**Regra de Negócio RN-PRICING-007:**

```typescript
interface CrossSellRule {
  trigger: string;           // Produto/ação que dispara
  offer: string;             // Produto sugerido
  discount: number;          // Desconto adicional
  conversionRate: number;    // Taxa conversão esperada
  marginImpact: number;      // Impacto na margem total
}

const crossSellRules: CrossSellRule[] = [
  {
    trigger: 'Kit Solar > 5kWp',
    offer: 'EV Charger',
    discount: 15,
    conversionRate: 0.18,      // 18% conversão
    marginImpact: +4.2         // +4.2% margem total projeto
  },
  {
    trigger: 'Carrinho > R$ 30k',
    offer: 'Monitoramento IoT Premium',
    discount: 30,
    conversionRate: 0.25,
    marginImpact: +2.8
  },
  {
    trigger: 'Projeto Comercial',
    offer: 'Seguro RC Comercial',
    discount: 0,               // Sem desconto (obrigatório)
    conversionRate: 0.85,
    marginImpact: +1.5
  },
  {
    trigger: 'Checkout Finalizado',
    offer: 'Manutenção Preventiva 3 anos',
    discount: 20,
    conversionRate: 0.12,
    marginImpact: +1.2
  }
];
```

---

## 6. Pricing para Financiamento

### 6.1 Estrutura de Taxas

**Regra de Negócio RN-PRICING-008:**

```typescript
interface FinancingOffer {
  installments: number;
  interestRate: number;      // Taxa mensal
  entryPercent: number;      // Entrada mínima (%)
  yshFee: number;            // Fee YSH (%)
  bankFee: number;           // Fee banco (%)
  totalCost: number;         // CET (Custo Efetivo Total)
}

const financingTiers: FinancingOffer[] = [
  {
    installments: 12,
    interestRate: 0,           // 12× sem juros
    entryPercent: 20,          // Entrada 20%
    yshFee: 1.5,               // YSH 1.5%
    bankFee: 2.5,              // Banco 2.5%
    totalCost: 4.0             // CET 4.0%
  },
  {
    installments: 24,
    interestRate: 0.99,        // 0.99% a.m.
    entryPercent: 10,
    yshFee: 1.0,
    bankFee: 1.8,
    totalCost: 25.9
  },
  {
    installments: 60,
    interestRate: 1.49,        // 1.49% a.m.
    entryPercent: 0,           // Sem entrada
    yshFee: 0.5,
    bankFee: 1.2,
    totalCost: 127.2
  }
];
```

**Exemplo Cálculo:**

```typescript
function calculateFinancing(
  projectValue: number,
  offer: FinancingOffer
): FinancingResult {
  const entry = projectValue * (offer.entryPercent / 100);
  const financed = projectValue - entry;
  
  const monthlyPayment = financed * (
    (offer.interestRate / 100) * Math.pow(1 + offer.interestRate / 100, offer.installments)
  ) / (
    Math.pow(1 + offer.interestRate / 100, offer.installments) - 1
  );
  
  const totalPaid = entry + (monthlyPayment * offer.installments);
  const totalInterest = totalPaid - projectValue;
  
  const yshRevenue = projectValue * (offer.yshFee / 100);
  const bankRevenue = projectValue * (offer.bankFee / 100);
  
  return {
    entry,
    monthlyPayment,
    totalPaid,
    totalInterest,
    yshRevenue,
    bankRevenue
  };
}

// Exemplo: Projeto R$ 50.000 em 24×
const result = calculateFinancing(50_000, financingTiers[1]);
/*
{
  entry: R$ 5.000,
  monthlyPayment: R$ 2.094,32,
  totalPaid: R$ 55.263,68,
  totalInterest: R$ 5.263,68,
  yshRevenue: R$ 500,00 (1%),
  bankRevenue: R$ 900,00 (1.8%)
}
*/
```

---

## 7. Pricing de Serviços Recorrentes

### 7.1 Modelos de Assinatura

**Regra de Negócio RN-PRICING-009:**

```typescript
interface SubscriptionTier {
  name: string;
  monthlyPrice: number;
  annualPrice: number;       // 2 meses grátis
  features: string[];
  margin: number;
  churnRate: number;         // Taxa cancelamento mensal
  ltv: number;               // Lifetime Value (36 meses)
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    name: 'Basic Monitoring',
    monthlyPrice: 49,
    annualPrice: 490,          // R$ 49 × 10 (2 meses grátis)
    features: [
      'Dashboard básico',
      'Alertas email',
      'Relatório mensal'
    ],
    margin: 85,
    churnRate: 0.08,           // 8% churn/mês
    ltv: 980                   // ~20 meses retenção
  },
  {
    name: 'Professional',
    monthlyPrice: 149,
    annualPrice: 1_490,
    features: [
      'Tudo do Basic',
      'Alertas SMS',
      'Análise preditiva IA',
      'API acesso'
    ],
    margin: 78,
    churnRate: 0.04,           // 4% churn/mês
    ltv: 3_725                 // ~25 meses retenção
  },
  {
    name: 'Enterprise',
    monthlyPrice: 499,
    annualPrice: 4_990,
    features: [
      'Tudo do Professional',
      'White-label',
      'SLA 99.9%',
      'Suporte 24/7',
      'Onboarding dedicado'
    ],
    margin: 70,
    churnRate: 0.02,           // 2% churn/mês
    ltv: 24_950                // ~50 meses retenção
  }
];
```

### 7.2 Cálculo de MRR/ARR Target

```typescript
interface RecurringRevenue {
  customers: number;
  avgTicket: number;
  mrr: number;               // Monthly Recurring Revenue
  arr: number;               // Annual Recurring Revenue
  cac: number;               // Customer Acquisition Cost
  ltv: number;               // Lifetime Value
  ltvCacRatio: number;       // Ideal: > 3
}

function calculateRecurringMetrics(
  tier: SubscriptionTier,
  customers: number,
  cac: number
): RecurringRevenue {
  const mrr = customers * tier.monthlyPrice;
  const arr = mrr * 12;
  const ltv = tier.ltv * customers;
  const ltvCacRatio = tier.ltv / cac;
  
  return {
    customers,
    avgTicket: tier.monthlyPrice,
    mrr,
    arr,
    cac,
    ltv: tier.ltv,
    ltvCacRatio
  };
}

// Meta YSH: 1.000 clientes Professional até 2026
const professionalMetrics = calculateRecurringMetrics(
  subscriptionTiers[1],  // Professional
  1000,
  300                    // CAC R$ 300 (marketing + vendas)
);
/*
{
  customers: 1000,
  avgTicket: R$ 149,
  mrr: R$ 149.000,
  arr: R$ 1.788.000,
  cac: R$ 300,
  ltv: R$ 3.725,
  ltvCacRatio: 12.4 (excelente!)
}
*/
```

---

## 8. Pricing Defensivo e Guerra de Preços

### 8.1 Estratégia Price Matching

**Regra de Negócio RN-PRICING-010:**

```typescript
interface PriceMatchPolicy {
  enabled: boolean;
  maxDiscount: number;       // Desconto máximo permitido (%)
  minMargin: number;         // Margem mínima aceitável (%)
  requireProof: boolean;     // Exigir comprovante
  competitors: string[];     // Concorrentes aceitos
  exclusions: string[];      // Produtos excluídos
}

const priceMatchRules: PriceMatchPolicy = {
  enabled: true,
  maxDiscount: 15,           // Máximo 15% desconto
  minMargin: 12,             // Mínimo 12% margem
  requireProof: true,
  competitors: [
    'NeoSolar',
    'Solfácil',
    'Portal Solar',
    '77Sol'
  ],
  exclusions: [
    'Produtos em promoção',
    'Kits customizados',
    'Serviços (HaaS/SaaS)'
  ]
};

function evaluatePriceMatch(
  ourPrice: number,
  competitorPrice: number,
  ourCost: number
): PriceMatchDecision {
  const requiredDiscount = ((ourPrice - competitorPrice) / ourPrice) * 100;
  const matchedMargin = ((competitorPrice - ourCost) / competitorPrice) * 100;
  
  if (requiredDiscount > priceMatchRules.maxDiscount) {
    return {
      approved: false,
      reason: `Desconto necessário (${requiredDiscount.toFixed(1)}%) excede limite (${priceMatchRules.maxDiscount}%)`
    };
  }
  
  if (matchedMargin < priceMatchRules.minMargin) {
    return {
      approved: false,
      reason: `Margem resultante (${matchedMargin.toFixed(1)}%) abaixo do mínimo (${priceMatchRules.minMargin}%)`
    };
  }
  
  return {
    approved: true,
    newPrice: competitorPrice,
    discount: requiredDiscount,
    margin: matchedMargin
  };
}
```

---

## 9. Dashboards e KPIs de Pricing

### 9.1 Métricas Essenciais

```typescript
interface PricingKPIs {
  // Margem
  avgGrossMargin: number;          // Margem bruta média
  avgNetMargin: number;            // Margem líquida média
  marginVariance: number;          // Variação margem vs target
  
  // Conversão
  quoteToSaleRate: number;         // Taxa conversão cotação → venda
  cartAbandonmentRate: number;     // Taxa abandono carrinho
  priceObjectionRate: number;      // Taxa objeção por preço
  
  // Volume
  avgOrderValue: number;           // Ticket médio
  avgItemsPerOrder: number;        // Itens por pedido
  upsellRate: number;              // Taxa upsell
  
  // Financeiro
  totalRevenue: number;            // Receita total
  discountRate: number;            // Taxa desconto média
  paymentTerms: number;            // Prazo pagamento médio
}

// Metas YSH 2025-2026
const pricingTargets: PricingKPIs = {
  avgGrossMargin: 28,              // 28% margem bruta
  avgNetMargin: 18,                // 18% margem líquida
  marginVariance: 0.05,            // ±5% tolerância
  
  quoteToSaleRate: 0.35,           // 35% conversão
  cartAbandonmentRate: 0.42,       // 42% abandono (melhorar!)
  priceObjectionRate: 0.18,        // 18% objeção preço
  
  avgOrderValue: 48_500,           // R$ 48.5k ticket médio
  avgItemsPerOrder: 4.2,           // 4.2 itens/pedido
  upsellRate: 0.28,                // 28% upsell
  
  totalRevenue: 25_000_000,        // R$ 25M ARR
  discountRate: 0.08,              // 8% desconto médio
  paymentTerms: 45                 // 45 dias prazo médio
};
```

---

## 10. Implementação Técnica

### 10.1 API de Pricing

```typescript
// GET /api/pricing/calculate
interface PricingRequest {
  products: Array<{
    sku: string;
    quantity: number;
  }>;
  customerSegment: string;     // B1-B6
  channel: SalesChannel;
  region: string;              // Sudeste, Sul, etc.
  paymentMethod: string;       // cash, financing, etc.
  applyDynamicPricing: boolean;
}

interface PricingResponse {
  items: Array<{
    sku: string;
    basePrice: number;
    discount: number;
    finalPrice: number;
    margin: number;
  }>;
  subtotal: number;
  totalDiscount: number;
  fees: Array<{
    type: string;
    amount: number;
  }>;
  total: number;
  suggestedUpsells: Array<{
    product: string;
    discount: number;
    expectedMargin: number;
  }>;
}
```

### 10.2 Regras de Validação

```typescript
class PricingValidator {
  static validate(request: PricingRequest): ValidationResult {
    const errors: string[] = [];
    
    // Validar margem mínima
    const minMargin = this.calculateMinMargin(request);
    if (minMargin < 0.15) {
      errors.push('Margem abaixo do mínimo viável (15%)');
    }
    
    // Validar desconto máximo
    const totalDiscount = this.calculateTotalDiscount(request);
    if (totalDiscount > 0.25) {
      errors.push('Desconto total excede limite (25%)');
    }
    
    // Validar consistência regional
    if (!this.validateRegionalPricing(request)) {
      errors.push('Pricing inconsistente com região');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
```

---

## 📚 Referências

- **BUSINESS_RULES_EXTRACTED.md** - Regras de negócio completas
- **YSH-SOLAR-360-SPLITS-STRUCTURE.md** - Estrutura de custos regional
- **COMPARATIVE_PRICING_ANALYSIS.md** - Análise multi-distribuidor
- **API_IMPLEMENTATION_STATUS.md** - Status APIs de pricing

---

**Última Atualização:** 14 de Outubro de 2025  
**Próxima Revisão:** Trimestral (Janeiro 2026)
