# Estratégia de Catálogo Unificado - YSH Solar B2B

## 1. Visão Geral

Estratégia para abstrair distribuidores e criar catálogo unificado focado em **fabricantes → séries → modelos**, com SKUs únicos e precificação multi-distribuidor.

### 1.1 Objetivos

- ✅ **Abstração de Distribuidores**: Foco em fabricantes, não em quem vende
- ✅ **SKUs Únicos**: Um SKU = Um produto físico único (independente do distribuidor)
- ✅ **Precificação Multi-Distribuidor**: Comparação transparente de preços
- ✅ **Modelagem de Benefícios**: Comparar além do preço (garantia, frete, disponibilidade)
- ✅ **Normalização Técnica**: Especificações padronizadas para comparação justa

## 2. Hierarquia de Produtos

```tsx
FABRICANTE (Manufacturer)
  └── SÉRIE (Product Line/Series)
       └── MODELO (Model)
            └── SKU (Stock Keeping Unit)
                 └── OFERTAS (Offers/Listings)
                      ├── Distribuidor A (Preço, Estoque, CD)
                      ├── Distribuidor B (Preço, Estoque, CD)
                      └── Distribuidor C (Preço, Estoque, CD)
```

### 2.1 Exemplo Prático

```tsx
FABRICANTE: DEYE
  └── SÉRIE: SUN-G4 Microinversores
       └── MODELO: SUN-M2250G4-EU-Q0
            └── SKU: DEYE-SUN-M2250G4-EU-Q0
                 ├── FOTUS: R$ 1.850,00 (CD ES, 5 unidades)
                 ├── NEOSOLAR: R$ 1.920,00 (CD SP, 12 unidades)
                 └── ODEX: Indisponível
```

## 3. Modelo de Dados Unificado

### 3.1 Schema: Manufacturer (Fabricante)

```typescript
interface Manufacturer {
  id: string;                    // "deye", "canadian-solar"
  name: string;                  // "DEYE", "Canadian Solar"
  slug: string;                  // "deye"
  country: string;               // "China", "Canada"
  tier: "TIER_1" | "TIER_2" | "TIER_3" | null;
  certifications: string[];      // ["INMETRO", "IEC 61215", "ISO 9001"]
  warranty_years: number;        // Garantia padrão do fabricante
  website: string;
  metadata: {
    founded_year?: number;
    market_share?: number;
    reputation_score?: number;   // 0-100
  };
}
```

### 3.2 Schema: Product Series (Série de Produtos)

```typescript
interface ProductSeries {
  id: string;                    // "deye-sun-g4"
  manufacturer_id: string;       // FK para Manufacturer
  name: string;                  // "SUN-G4 Microinversores"
  slug: string;                  // "sun-g4-microinversores"
  category: ProductCategory;     // "inverters", "panels", "batteries"
  generation: string;            // "G4", "5ª Geração"
  technology: string;            // "String Inverter", "Monocrystalline PERC"
  target_market: string[];       // ["Residencial", "Comercial"]
  release_year: number;
  discontinued: boolean;
  metadata: {
    series_highlights?: string[];
    typical_applications?: string[];
  };
}
```

### 3.3 Schema: Product Model (Modelo)

```typescript
interface ProductModel {
  id: string;                    // "deye-sun-m2250g4-eu-q0"
  series_id: string;             // FK para ProductSeries
  manufacturer_id: string;       // FK para Manufacturer (denormalizado)
  
  // Identificação
  model_number: string;          // "SUN-M2250G4-EU-Q0"
  full_name: string;             // "Microinversor Deye SUN-M2250G4-EU-Q0"
  slug: string;                  // "sun-m2250g4-eu-q0"
  
  // Categorização
  category: ProductCategory;
  subcategory?: string;          // "Microinversor", "Inversor String"
  
  // Especificações Técnicas Normalizadas
  technical_specs: TechnicalSpecs;
  
  // Certificações & Compliance
  certifications: string[];
  inmetro_code?: string;
  
  // Dimensões & Peso
  dimensions: {
    width_mm: number;
    height_mm: number;
    depth_mm: number;
    weight_kg: number;
  };
  
  // Garantias
  warranty: {
    standard_years: number;
    extended_years?: number;
    performance_guarantee?: {
      year_10: number;           // % de potência garantida
      year_25: number;
    };
  };
  
  // Compatibilidades
  compatibility: {
    panels?: string[];           // Fabricantes de painéis compatíveis
    inverters?: string[];
    batteries?: string[];
    max_string_current_a?: number;
  };
  
  // Metadata
  metadata: {
    released_at?: string;
    discontinued_at?: string;
    successor_model_id?: string;
    datasheet_url?: string;
    manual_url?: string;
  };
}
```

### 3.4 Schema: SKU (Stock Keeping Unit)

```typescript
interface SKU {
  id: string;                    // "DEYE-SUN-M2250G4-EU-Q0"
  model_id: string;              // FK para ProductModel
  
  // Variantes (se aplicável)
  variant?: {
    color?: string;
    voltage?: string;            // "220V", "380V"
    configuration?: string;      // "Com WiFi", "Sem WiFi"
  };
  
  // EAN/GTIN
  ean?: string;
  gtin?: string;
  
  // Informações de Estoque Agregado
  total_stock: number;           // Soma de todos os distribuidores
  available_at_distributors: number;  // Quantos distribuidores têm estoque
  
  // Precificação Agregada
  pricing_summary: {
    lowest_price: number;
    highest_price: number;
    avg_price: number;
    median_price: number;
    price_variation_pct: number; // Variação entre menor e maior preço
  };
  
  // Ofertas por Distribuidor
  offers: DistributorOffer[];
  
  // Score de Disponibilidade
  availability_score: number;    // 0-100 (baseado em estoque + distribuidores)
  
  // Metadata
  metadata: {
    first_seen_at: string;
    last_updated_at: string;
    total_distributors: number;
  };
}
```

### 3.5 Schema: Distributor Offer (Oferta de Distribuidor)

```typescript
interface DistributorOffer {
  id: string;
  sku_id: string;                // FK para SKU
  distributor_id: string;        // FK para Distributor
  
  // Identificação no Distribuidor
  distributor_sku: string;       // SKU interno do distribuidor
  distributor_product_id: string;
  
  // Precificação
  pricing: {
    list_price: number;          // Preço de lista
    sale_price?: number;         // Preço promocional
    bulk_pricing?: BulkPricing[];
    currency: string;            // "BRL"
    valid_from: string;
    valid_until?: string;
  };
  
  // Estoque & Disponibilidade
  inventory: {
    available: boolean;
    quantity: number;
    warehouse_location: string;  // "CD ESPÍRITO SANTO"
    lead_time_days: number;      // Tempo de entrega
    min_order_qty: number;
    max_order_qty?: number;
  };
  
  // Logística
  shipping: {
    free_shipping_threshold?: number;
    standard_shipping_cost?: number;
    delivery_time_days: number;
    ships_from: string[];        // Centros de distribuição
  };
  
  // Garantia & Suporte
  warranty: {
    years: number;
    extended_available: boolean;
    support_rating?: number;     // 0-5 estrelas
  };
  
  // Benefícios
  benefits: {
    has_installation_service: boolean;
    technical_support_24_7: boolean;
    return_policy_days: number;
    payment_terms: string[];     // ["Boleto", "Cartão", "Parcelado"]
    financing_available: boolean;
  };
  
  // URLs
  product_url: string;
  image_urls: string[];
  datasheet_url?: string;
  
  // Metadata
  metadata: {
    last_scraped_at: string;
    last_price_update: string;
    price_history?: PriceHistoryEntry[];
    reliability_score?: number;  // 0-100
  };
}
```

### 3.6 Schema: Distributor (Distribuidor)

```typescript
interface Distributor {
  id: string;                    // "fotus", "neosolar"
  name: string;                  // "FOTUS", "NeoSolar"
  slug: string;
  website: string;
  
  // Avaliações
  ratings: {
    overall: number;             // 0-5
    delivery_speed: number;
    product_quality: number;
    customer_service: number;
    price_competitiveness: number;
  };
  
  // Logística
  warehouses: Warehouse[];
  shipping_regions: string[];    // Estados que atende
  
  // Políticas
  policies: {
    min_order_value?: number;
    free_shipping_threshold?: number;
    return_window_days: number;
    warranty_handling: "Direct" | "Through_Manufacturer";
  };
  
  // Metadata
  metadata: {
    cnpj: string;
    founded_year: number;
    market_reputation?: number;  // 0-100
  };
}
```

## 4. Sistema de Precificação Multi-Distribuidor

### 4.1 Comparação de Preços

```typescript
interface PriceComparison {
  sku_id: string;
  product_name: string;
  
  best_offer: {
    distributor: string;
    price: number;
    total_cost: number;         // Inclui frete
    savings_pct: number;        // Economia vs. média
    delivery_days: number;
  };
  
  all_offers: DistributorOfferComparison[];
  
  price_analysis: {
    lowest_price: number;
    highest_price: number;
    avg_price: number;
    median_price: number;
    std_deviation: number;
    price_spread_pct: number;   // (highest - lowest) / avg
  };
  
  recommendations: {
    best_value: string;          // Melhor custo-benefício geral
    fastest_delivery: string;
    most_reliable: string;
    best_support: string;
  };
}

interface DistributorOfferComparison {
  distributor: string;
  price: number;
  shipping_cost: number;
  total_cost: number;
  delivery_days: number;
  in_stock: boolean;
  quantity_available: number;
  
  // Scores (0-100)
  price_score: number;           // Quão competitivo é o preço
  availability_score: number;
  delivery_score: number;
  support_score: number;
  overall_score: number;         // Média ponderada
  
  // Benefícios
  benefits: string[];
  
  // Diferencial vs. melhor oferta
  price_diff: number;            // R$ a mais que a melhor oferta
  price_diff_pct: number;        // % a mais
}
```

### 4.2 Algoritmo de Scoring

```typescript
/**
 * Calcula score geral de uma oferta (0-100)
 * Pesos: Preço 40%, Disponibilidade 25%, Entrega 20%, Suporte 15%
 */
function calculateOfferScore(offer: DistributorOffer, context: PriceContext): number {
  const priceScore = calculatePriceScore(offer.pricing.sale_price || offer.pricing.list_price, context);
  const availabilityScore = calculateAvailabilityScore(offer.inventory);
  const deliveryScore = calculateDeliveryScore(offer.shipping);
  const supportScore = calculateSupportScore(offer.warranty, offer.benefits);
  
  return (
    priceScore * 0.40 +
    availabilityScore * 0.25 +
    deliveryScore * 0.20 +
    supportScore * 0.15
  );
}

function calculatePriceScore(price: number, context: PriceContext): number {
  // Score inversamente proporcional ao preço
  // Melhor preço = 100, Pior preço = 0
  const { lowest, highest } = context;
  if (lowest === highest) return 100;
  
  return 100 - ((price - lowest) / (highest - lowest)) * 100;
}

function calculateAvailabilityScore(inventory: Inventory): number {
  if (!inventory.available) return 0;
  if (inventory.quantity === 0) return 0;
  if (inventory.quantity >= 10) return 100;
  if (inventory.quantity >= 5) return 80;
  if (inventory.quantity >= 2) return 60;
  return 40;
}

function calculateDeliveryScore(shipping: Shipping): number {
  // Quanto menor o tempo de entrega, maior o score
  const days = shipping.delivery_time_days;
  if (days <= 2) return 100;
  if (days <= 5) return 85;
  if (days <= 10) return 70;
  if (days <= 15) return 55;
  if (days <= 20) return 40;
  return 25;
}

function calculateSupportScore(warranty: Warranty, benefits: Benefits): number {
  let score = 0;
  
  // Garantia (40 pontos)
  score += Math.min(warranty.years * 4, 40);
  
  // Benefícios (60 pontos)
  if (benefits.has_installation_service) score += 15;
  if (benefits.technical_support_24_7) score += 15;
  if (benefits.return_policy_days >= 30) score += 10;
  if (benefits.return_policy_days >= 7) score += 5;
  if (benefits.financing_available) score += 10;
  if (benefits.payment_terms.length >= 3) score += 10;
  
  return Math.min(score, 100);
}
```

## 5. Sistema de Benefícios

### 5.1 Matriz de Benefícios

```typescript
interface BenefitAnalysis {
  sku_id: string;
  
  // Comparação por Dimensão
  dimensions: {
    price: DimensionScore[];
    warranty: DimensionScore[];
    delivery: DimensionScore[];
    support: DimensionScore[];
    payment: DimensionScore[];
    stock: DimensionScore[];
  };
  
  // Recomendação Final
  recommendation: {
    best_overall: string;        // Melhor no geral
    best_for_price: string;      // Melhor preço
    best_for_speed: string;      // Entrega mais rápida
    best_for_reliability: string;// Mais confiável
    reasoning: string[];         // Explicações
  };
}

interface DimensionScore {
  distributor: string;
  score: number;                 // 0-100
  value: any;                    // Valor real (preço, dias, etc.)
  rank: number;                  // 1º, 2º, 3º lugar
  highlights: string[];          // Pontos fortes
  concerns: string[];            // Pontos fracos
}
```

### 5.2 Exemplo de Análise

```json
{
  "sku_id": "DEYE-SUN-M2250G4-EU-Q0",
  "recommendation": {
    "best_overall": "NEOSOLAR",
    "best_for_price": "FOTUS",
    "best_for_speed": "ODEX",
    "best_for_reliability": "NEOSOLAR",
    "reasoning": [
      "NEOSOLAR oferece melhor equilíbrio entre preço (R$ 1.920) e confiabilidade (score 95/100)",
      "FOTUS tem menor preço (R$ 1.850) mas estoque limitado (5 unidades)",
      "ODEX mais rápido (2 dias) mas preço 8% acima da média"
    ]
  },
  "dimensions": {
    "price": [
      {
        "distributor": "FOTUS",
        "score": 100,
        "value": 1850.00,
        "rank": 1,
        "highlights": ["Menor preço do mercado", "Economia de R$ 70 vs. média"],
        "concerns": ["Estoque limitado (5 unidades)"]
      },
      {
        "distributor": "NEOSOLAR",
        "score": 91,
        "value": 1920.00,
        "rank": 2,
        "highlights": ["Preço competitivo", "Estoque robusto (12 unidades)"],
        "concerns": []
      }
    ]
  }
}
```

## 6. Normalização de Kits

### 6.1 Desafio Especial: Kits

Kits são compostos por múltiplos equipamentos. Estratégia:

```typescript
interface Kit {
  id: string;                    // "KIT-SOLAR-5KWP-DEYE-CANADIAN"
  type: "kit";
  category: "grid-tie" | "off-grid" | "hybrid";
  
  // Capacidade do Sistema
  system_capacity_kwp: number;   // 5.0
  
  // Componentes (referências a SKUs)
  components: KitComponent[];
  
  // Precificação do Kit
  pricing: {
    total_components_price: number;  // Soma dos componentes individuais
    kit_price: number;                // Preço do kit (geralmente com desconto)
    discount_amount: number;          // Desconto vs. comprar separado
    discount_pct: number;
  };
  
  // Ofertas de Kit por Distribuidor
  kit_offers: KitOffer[];
  
  // Compatibilidade
  installation_type: string[];   // ["Cerâmico", "Metálico", "Solo"]
  suitable_for: string[];        // ["Residencial", "Comercial"]
  
  // Metadata
  metadata: {
    performance_ratio?: number;  // Eficiência esperada do sistema
    estimated_generation_kwh_month?: number;
  };
}

interface KitComponent {
  component_type: "panel" | "inverter" | "structure" | "cable" | "other";
  sku_id: string;
  quantity: number;
  unit_price: number;            // Preço individual do componente
  total_price: number;           // unit_price * quantity
  
  // Referência ao produto
  product_ref: {
    manufacturer: string;
    model: string;
    power_w?: number;
  };
}

interface KitOffer {
  distributor_id: string;
  kit_price: number;
  
  // Composição disponível
  available_components: number;  // Quantos componentes estão em estoque
  total_components: number;
  
  // Alternativas
  substitutions?: KitSubstitution[];  // Se algum componente não disponível
  
  // Lead time
  assembly_time_days: number;    // Tempo para montar o kit
  delivery_time_days: number;
  
  // Benefícios
  includes_installation: boolean;
  includes_project: boolean;
  includes_technical_support: boolean;
}

interface KitSubstitution {
  original_component: string;
  substitute_component: string;
  reason: string;
  price_diff: number;
}
```

### 6.2 Estratégia de Normalização de Kits

1. **Extrair componentes** de cada kit no catálogo atual
2. **Mapear para SKUs unificados** (inverter, painéis, estrutura, etc.)
3. **Calcular preço base** (soma dos componentes)
4. **Identificar desconto de kit** (diferença entre preço kit e soma componentes)
5. **Criar SKU de kit** quando composição é idêntica entre distribuidores
6. **Permitir kits similares** (mesma capacidade, mas componentes diferentes)

### 6.3 Exemplo de Normalização

**Antes (dados brutos):**

```json
{
  "FOTUS-KP04": {
    "panels": ["ASTRONERGY 600W", "qty: 2"],
    "inverter": ["TSUNESS 2.25KW", "qty: 1"],
    "price": 2706.07
  },
  "NEOSOLAR-KIT-1.2KWP": {
    "panels": ["ASTRONERGY 600W BIFACIAL", "qty: 2"],
    "inverter": ["TSUNESS SUN-2250", "qty: 1"],
    "price": 2850.00
  }
}
```

**Depois (normalizado):**

```json
{
  "sku": "KIT-1.2KWP-ASTRONERGY-600W-TSUNESS-2250",
  "system_capacity_kwp": 1.2,
  "components": [
    {
      "type": "panel",
      "sku_id": "ASTRONERGY-ASTRO-N-600W",
      "quantity": 2,
      "unit_price": 520.00,
      "total_price": 1040.00
    },
    {
      "type": "inverter",
      "sku_id": "TSUNESS-SUN-M2250",
      "quantity": 1,
      "unit_price": 1850.00,
      "total_price": 1850.00
    }
  ],
  "pricing": {
    "total_components_price": 2890.00,
    "kit_price": 2706.07,
    "discount_amount": 183.93,
    "discount_pct": 6.36
  },
  "kit_offers": [
    {
      "distributor_id": "FOTUS",
      "kit_price": 2706.07,
      "available_components": 2,
      "total_components": 2
    },
    {
      "distributor_id": "NEOSOLAR",
      "kit_price": 2850.00,
      "available_components": 2,
      "total_components": 2
    }
  ]
}
```

## 7. Geração de SKUs Únicos

### 7.1 Padrão de SKU

```tsx
{FABRICANTE}-{SERIE}-{MODELO}-{VARIANTE}

Exemplos:
- DEYE-SUNG4-M2250-220V
- CANADIAN-HIKU6-CS6R-400MS
- ASTRONERGY-ASTRO-N-600W-BF
```

### 7.2 Algoritmo de Geração

```typescript
function generateSKU(product: ProductModel, variant?: Variant): string {
  const manufacturer = sanitizeForSKU(product.manufacturer_id);
  const series = sanitizeForSKU(product.series_id);
  const model = sanitizeForSKU(product.model_number);
  
  let sku = `${manufacturer}-${series}-${model}`;
  
  if (variant) {
    const variantCode = sanitizeForSKU(
      variant.voltage || variant.color || variant.configuration || ""
    );
    if (variantCode) {
      sku += `-${variantCode}`;
    }
  }
  
  return sku.toUpperCase();
}

function sanitizeForSKU(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9]/g, "")  // Remove caracteres especiais
    .replace(/\s+/g, "-")           // Espaços para hífens
    .substring(0, 20);              // Máximo 20 caracteres por segmento
}
```

### 7.3 Deduplicação

```typescript
/**
 * Identifica se dois produtos de distribuidores diferentes
 * são o mesmo produto físico (mesmo SKU)
 */
function areSameProduct(product1: any, product2: any): boolean {
  // 1. Verificar fabricante
  const sameMfg = normalizeMfg(product1.manufacturer) === normalizeMfg(product2.manufacturer);
  if (!sameMfg) return false;
  
  // 2. Verificar modelo (com fuzzy matching)
  const modelSimilarity = fuzzyMatch(product1.model_number, product2.model_number);
  if (modelSimilarity < 0.9) return false;
  
  // 3. Verificar specs principais
  const specsMatch = compareSpecs(product1.technical_specs, product2.technical_specs);
  if (specsMatch < 0.95) return false;
  
  return true;
}

function compareSpecs(specs1: TechnicalSpecs, specs2: TechnicalSpecs): number {
  const criticalSpecs = ["power_w", "voltage_v", "efficiency"];
  let matches = 0;
  
  for (const spec of criticalSpecs) {
    if (specs1[spec] && specs2[spec]) {
      const diff = Math.abs(specs1[spec] - specs2[spec]);
      const avg = (specs1[spec] + specs2[spec]) / 2;
      const diffPct = diff / avg;
      
      if (diffPct < 0.05) {  // Tolerância de 5%
        matches++;
      }
    }
  }
  
  return matches / criticalSpecs.length;
}
```

## 8. Implementação no Medusa

### 8.1 Estrutura de Módulos

```tsx
backend/src/modules/
  unified-catalog/
    models/
      manufacturer.ts
      product-series.ts
      product-model.ts
      sku.ts
      distributor.ts
      distributor-offer.ts
      kit.ts
      kit-component.ts
    services/
      unified-catalog.ts
      price-comparison.ts
      benefit-analysis.ts
      sku-generator.ts
    workflows/
      sync-distributors.ts
      normalize-products.ts
      generate-skus.ts
      update-pricing.ts
```

### 8.2 Relacionamentos no Medusa

```typescript
// manufacturer.ts
export const Manufacturer = model.define("manufacturer", {
  id: model.id().primaryKey(),
  name: model.text(),
  slug: model.text(),
  country: model.text(),
  tier: model.enum(["TIER_1", "TIER_2", "TIER_3"]).nullable(),
  
  // Relações
  series: model.hasMany(() => ProductSeries),
  models: model.hasMany(() => ProductModel),
});

// product-model.ts
export const ProductModel = model.define("product_model", {
  id: model.id().primaryKey(),
  manufacturer_id: model.text(),
  series_id: model.text(),
  model_number: model.text(),
  
  // Relações
  manufacturer: model.belongsTo(() => Manufacturer, { mappedBy: "models" }),
  series: model.belongsTo(() => ProductSeries, { mappedBy: "models" }),
  skus: model.hasMany(() => SKU),
});

// sku.ts
export const SKU = model.define("sku", {
  id: model.text().primaryKey(),  // "DEYE-SUN-M2250G4-EU-Q0"
  model_id: model.text(),
  
  // Agregados
  total_stock: model.number().default(0),
  available_at_distributors: model.number().default(0),
  
  // Relações
  model: model.belongsTo(() => ProductModel, { mappedBy: "skus" }),
  offers: model.hasMany(() => DistributorOffer),
});

// distributor-offer.ts
export const DistributorOffer = model.define("distributor_offer", {
  id: model.id().primaryKey(),
  sku_id: model.text(),
  distributor_id: model.text(),
  
  // Preço
  list_price: model.number(),
  sale_price: model.number().nullable(),
  
  // Estoque
  available: model.boolean().default(false),
  quantity: model.number().default(0),
  
  // Relações
  sku: model.belongsTo(() => SKU, { mappedBy: "offers" }),
  distributor: model.belongsTo(() => Distributor, { mappedBy: "offers" }),
});
```

### 8.3 API Endpoints

```typescript
// GET /store/catalog/search?q=deye+microinversor
// Busca no catálogo unificado

// GET /store/catalog/sku/:sku_id
// Detalhes de um SKU com todas as ofertas

// GET /store/catalog/sku/:sku_id/compare
// Comparação de preços entre distribuidores

// GET /store/catalog/manufacturers
// Lista de fabricantes

// GET /store/catalog/manufacturers/:id/series
// Séries de um fabricante

// GET /store/catalog/series/:id/models
// Modelos de uma série

// GET /store/catalog/kits?capacity_kwp=5
// Busca de kits por capacidade

// GET /store/catalog/kits/:kit_id/offers
// Ofertas de um kit específico
```

## 9. Scripts de Migração

### 9.1 Pipeline de Normalização

```bash
# 1. Extrair fabricantes únicos
yarn normalize:manufacturers

# 2. Criar séries de produtos
yarn normalize:series

# 3. Normalizar modelos
yarn normalize:models

# 4. Gerar SKUs únicos
yarn normalize:skus

# 5. Mapear ofertas de distribuidores
yarn normalize:offers

# 6. Normalizar kits
yarn normalize:kits

# 7. Validar integridade
yarn validate:unified-catalog
```

### 9.2 Workflow de Sincronização

```typescript
// workflows/sync-distributors.ts
export const syncDistributorsWorkflow = createWorkflow(
  "sync-distributors",
  function (input: { distributor_ids?: string[] }) {
    // 1. Scrape data from distributor APIs
    const rawData = scrapeDistributorsStep(input);
    
    // 2. Normalize product data
    const normalized = normalizeProductsStep(rawData);
    
    // 3. Match to existing SKUs or create new
    const matched = matchToSKUsStep(normalized);
    
    // 4. Update offers and pricing
    const offers = updateOffersStep(matched);
    
    // 5. Recalculate aggregates (stock, pricing summary)
    const aggregated = recalculateAggregatesStep(offers);
    
    return new WorkflowResponse(aggregated);
  }
);
```

## 10. Frontend: Comparação de Preços

### 10.1 Componente de Comparação

```tsx
// storefront/src/modules/products/components/price-comparison.tsx
export function PriceComparison({ skuId }: { skuId: string }) {
  const { data } = usePriceComparison(skuId);
  
  return (
    <div className="price-comparison">
      <h3>Compare Preços</h3>
      
      {/* Best Offer Highlight */}
      <BestOfferCard offer={data.best_offer} />
      
      {/* All Offers Table */}
      <OffersTable 
        offers={data.all_offers}
        onSelect={(offer) => addToCart(offer)}
      />
      
      {/* Price Analysis */}
      <PriceChart analysis={data.price_analysis} />
      
      {/* Recommendations */}
      <Recommendations recs={data.recommendations} />
    </div>
  );
}
```

### 10.2 Filtros & Ordenação

```tsx
interface ComparisonFilters {
  sort_by: "price" | "delivery" | "score" | "availability";
  min_stock?: number;
  max_delivery_days?: number;
  preferred_distributors?: string[];
  include_out_of_stock: boolean;
}
```

## 11. Próximos Passos

### Fase 1: Fundação (Semana 1-2)

- [ ] Criar schemas de banco (Manufacturer, Series, Model, SKU, Offer)
- [ ] Desenvolver algoritmo de geração de SKUs
- [ ] Implementar deduplicação de produtos

### Fase 2: Normalização (Semana 3-4)

- [ ] Script para extrair fabricantes únicos
- [ ] Script para mapear séries de produtos
- [ ] Script para normalizar especificações técnicas
- [ ] Gerar SKUs para todos os produtos atuais

### Fase 3: Precificação (Semana 5)

- [ ] Mapear ofertas de distribuidores para SKUs
- [ ] Implementar sistema de comparação de preços
- [ ] Desenvolver algoritmo de scoring

### Fase 4: Kits (Semana 6)

- [ ] Decompor kits em componentes
- [ ] Mapear componentes para SKUs
- [ ] Implementar precificação de kits

### Fase 5: APIs & Frontend (Semana 7-8)

- [ ] APIs de catálogo unificado
- [ ] Endpoints de comparação
- [ ] Componentes de UI para comparação
- [ ] Dashboard de análise de preços

### Fase 6: Otimização (Semana 9-10)

- [ ] Cache de comparações frequentes
- [ ] Histórico de preços
- [ ] Alertas de variação de preço
- [ ] Relatórios de competitividade

## 12. Métricas de Sucesso

- ✅ **Cobertura**: 95%+ dos produtos com SKU único
- ✅ **Deduplicação**: <2% de duplicatas no catálogo
- ✅ **Ofertas**: Média de 2.5+ ofertas por SKU
- ✅ **Variação de Preço**: Detectar variações >10% entre distribuidores
- ✅ **Performance**: Comparação de preços <200ms
- ✅ **UX**: NPS >8 em facilidade de comparação

---

**Documento Criado**: 2025-10-09  
**Autor**: GitHub Copilot  
**Versão**: 1.0  
**Status**: 🚀 Pronto para implementação
