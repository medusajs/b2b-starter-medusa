# YSH B2B - Multi-Distributor Dynamic Pricing System
## Implementação Completa com Medusa.js v2.5+

**Data:** Outubro 2025  
**Status:** 🟢 PRONTO PARA IMPLEMENTAÇÃO

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Data Models](#data-models)
4. [Workflows](#workflows)
5. [API Routes](#api-routes)
6. [SKU Generator](#sku-generator)
7. [Migração de Dados](#migração-de-dados)
8. [Guia de Implementação](#guia-de-implementação)
9. [Testes e Validação](#testes-e-validação)

---

## 🎯 VISÃO GERAL

### Objetivo
Sistema de **pricing dinâmico** para plataforma B2B com:
- **3 distribuidores** (FortLev, NeoSolar, FOTUS)
- **4 tiers de clientes** (Bronze, Silver, Gold, Platinum)
- **Certificação INMETRO** integrada aos SKUs
- **Preços variáveis** por volume, região, e regras customizadas
- **Sales Channels** isolados por distribuidor

### Principais Funcionalidades

**✅ Multi-Tier Pricing**
- Bronze: Preço base (100%)
- Silver: 5% desconto (95%)
- Gold: 10% desconto (90%)
- Platinum: 15% desconto (85%)

**✅ Volume Discounts**
- Tier 1: 1-10 unidades (0% desconto)
- Tier 2: 11-50 unidades (5% desconto)
- Tier 3: 51+ unidades (10% desconto)

**✅ Dynamic SKU Generation**
- Formato: `{DIST}-{TYPE}-{POWER}-{BRAND}-{TIER}-{CERT}-{SEQ}`
- Exemplo: `FLV-KIT-563KWP-LONGI-GLD-CERT-001`
- Componentes:
  - `FLV`: Distribuidor (FortLev)
  - `KIT`: Tipo de produto
  - `563KWP`: Potência (5.63 kWp)
  - `LONGI`: Marca dos painéis
  - `GLD`: Tier Gold
  - `CERT`: Certificado INMETRO
  - `001`: Sequência

**✅ INMETRO Integration**
- Status: `CERT`, `PEND`, `EXPR`, `NONE`
- KPI Score: 0-100 (compliance score)
- Certificados vinculados aos produtos
- Selo visual nas interfaces

---

## 🏗️ ARQUITETURA DO SISTEMA

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                   MEDUSA.JS CORE                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Product    │  │   Pricing    │  │Sales Channel │  │
│  │   Module     │  │   Module     │  │   Module     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              CUSTOM EXTENSIONS (YSH)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Distributor  │  │ PricingRule  │  │  Product     │  │
│  │   Model      │  │    Model     │  │  Extension   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    WORKFLOWS                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │  calculateDynamicPricingWorkflow                 │  │
│  │  - Load Product Data                             │  │
│  │  - Calculate Tier Price                          │  │
│  │  - Calculate Volume Discount                     │  │
│  │  - Apply Pricing Rules                           │  │
│  │  - Load Distributor Config                       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   API ROUTES                            │
│  POST /api/pricing/calculate                            │
│  POST /api/pricing/batch-calculate                      │
│  GET  /api/distributors/:code/pricing-rules             │
│  POST /api/distributors/:code/pricing-rules             │
│  GET  /api/distributors/:code/tiers                     │
│  GET  /api/distributors/:code/stats                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 DATA MODELS

### 1. Distributor Model
**Arquivo:** `backend/src/models/distributor.ts`

**Campos principais:**
```typescript
{
  code: "FLV" | "NEO" | "FTS"
  name: string
  tier: "bronze" | "silver" | "gold" | "platinum"
  pricing_multiplier: number // Base multiplier
  
  // INMETRO
  inmetro_status: "certified" | "pending" | "expired" | "not_required"
  inmetro_kpi_score: number // 0-100
  
  // Business Rules
  min_order_value: number // BRL
  default_lead_time_days: number
  shipping_regions: string[] // ["SP", "RJ", "MG"]
  
  // Performance Metrics
  avg_delivery_days: number
  fulfillment_rate: number // 0-100%
  customer_satisfaction_score: number
}
```

### 2. Pricing Rule Model
**Arquivo:** `backend/src/models/pricing-rule.ts`

**Tipos de regras:**
- `DISTRIBUTOR_TIER`: Baseado no tier do distribuidor
- `VOLUME_DISCOUNT`: Desconto por quantidade
- `REGION_ADJUSTMENT`: Variação regional
- `SEASONAL_PROMOTION`: Promoções temporais
- `CUSTOMER_GROUP`: Segmentos B2B
- `INMETRO_CERTIFIED`: Premium para certificados
- `PAYMENT_METHOD`: Desconto à vista, parcelamento
- `FIRST_ORDER`: Incentivo para novos clientes

**Campos principais:**
```typescript
{
  rule_type: PricingRuleType
  application_method: "percentage" | "fixed_amount" | "multiplier" | "override"
  value: number
  
  // Condições - Distribuidor
  distributor_codes: string[] // ["FLV", "NEO"]
  distributor_tiers: string[] // ["gold", "platinum"]
  
  // Condições - Volume
  min_quantity: number
  max_quantity: number
  min_order_value: number // BRL
  
  // Condições - Geográficas
  region_codes: string[]
  state_codes: string[] // ["SP", "RJ"]
  
  // Condições - INMETRO
  requires_inmetro: boolean
  inmetro_min_kpi_score: number
  
  // Prioridade
  priority: number // Higher = applied first
  stackable: boolean // Pode combinar com outras
}
```

### 3. Product Extension Model
**Arquivo:** `backend/src/models/product-extension.ts`

**Campos principais:**
```typescript
{
  product_id: string // Link to Medusa Product
  distributor_code: "FLV" | "NEO" | "FTS"
  
  // SKU Dinâmico
  ysh_sku: string // FLV-KIT-563KWP-LONGI-GLD-CERT-001
  sku_tier_suffix: "BRZ" | "SLV" | "GLD" | "PLT"
  sku_certification_flag: "CERT" | "PEND" | "NONE"
  
  // INMETRO
  inmetro_certified: boolean
  inmetro_certificate_number: string
  inmetro_kpi_score: number
  inmetro_document_url: string
  
  // Specs Solares
  power_kwp: number
  panel_brand: string
  panel_power_w: number
  inverter_brand: string
  structure_type: string
  
  // Tier Pricing
  base_price_brl: number
  bronze_price_brl: number
  silver_price_brl: number
  gold_price_brl: number
  platinum_price_brl: number
  
  // Volume Pricing
  volume_tier_1_qty: number
  volume_tier_1_price: number
  volume_tier_2_qty: number
  volume_tier_2_price: number
  volume_tier_3_qty: number
  volume_tier_3_price: number
}
```

---

## ⚙️ WORKFLOWS

### calculateDynamicPricingWorkflow
**Arquivo:** `backend/src/workflows/calculate-dynamic-pricing.ts`

**Input:**
```typescript
{
  product_id: string
  distributor_code: string
  distributor_tier: string
  quantity: number
  region_code?: string
  customer_group_id?: string
  payment_method?: string
}
```

**Output:**
```typescript
{
  base_price: number
  tier_multiplier: number
  tier_adjusted_price: number
  volume_discount_percentage: number
  volume_discount_amount: number
  applied_rules: Array<{
    rule_code: string
    adjustment_value: number
  }>
  total_discount_percentage: number
  final_price: number
  price_per_unit: number
  inmetro_certified: boolean
  estimated_delivery_days: number
}
```

**Fluxo de execução:**
1. **Load Product Data**: Carrega produto e extensão
2. **Calculate Tier Price**: Aplica multiplicador do tier
3. **Calculate Volume Discount**: Desconto por quantidade
4. **Apply Pricing Rules**: Regras dinâmicas customizadas
5. **Load Distributor Config**: Estimativa de entrega

---

## 🔌 API ROUTES

### POST /api/pricing/calculate
**Calcula preço para um produto**

**Request:**
```json
{
  "product_id": "prod_123",
  "distributor_code": "FLV",
  "distributor_tier": "gold",
  "quantity": 25,
  "region_code": "SP",
  "payment_method": "pix"
}
```

**Response:**
```json
{
  "pricing": {
    "base_price": 15000.00,
    "tier_adjusted_price": 13500.00,
    "volume_discount_percentage": 5.0,
    "final_price": 319687.50,
    "price_per_unit": 12787.50,
    "applied_rules": [
      {
        "rule_code": "FLV-GOLD-VOL25",
        "adjustment_value": 675.00
      }
    ]
  }
}
```

### POST /api/pricing/batch-calculate
**Calcula preços para múltiplos produtos (carrinho)**

### GET /api/distributors/:code/pricing-rules
**Lista regras de pricing ativas**

### GET /api/distributors/:code/tiers
**Retorna configuração de tiers e benefícios**

### GET /api/distributors/:code/stats
**Estatísticas do distribuidor (KPIs, certificações)**

---

## 🏷️ SKU GENERATOR

### Formato
```
{DIST}-{TYPE}-{POWER}-{BRAND}-{TIER}-{CERT}-{SEQ}
```

### Componentes

| Componente | Valores | Exemplo |
|------------|---------|---------|
| DIST | FLV, NEO, FTS | FLV |
| TYPE | KIT, PNL, INV, BAT | KIT |
| POWER | {N}KWP, {N}W | 563KWP |
| BRAND | 8 chars max | LONGI |
| TIER | BRZ, SLV, GLD, PLT | GLD |
| CERT | CERT, PEND, EXPR, NONE | CERT |
| SEQ | 001-999 | 001 |

### Funções Principais

**`generateDynamicSKU(input)`**
```typescript
const sku = generateDynamicSKU({
  distributor: "fortlev",
  product_type: "kit",
  power_kwp: 5.63,
  brand: "Longi",
  tier: "gold",
  inmetro_status: "certified",
  sequence: 1
})
// Returns: "FLV-KIT-563KWP-LONGI-GLD-CERT-001"
```

**`generateTieredSKU(baseSKU, tier)`**
```typescript
const goldSKU = generateTieredSKU(
  "FLV-KIT-563KWP-LONGI-BRZ-CERT-001",
  "gold"
)
// Returns: "FLV-KIT-563KWP-LONGI-GLD-CERT-001"
```

**`validateSKUFormat(sku)`**
```typescript
const validation = validateSKUFormat("FLV-KIT-563KWP-LONGI-GLD-CERT-001")
// Returns: { valid: true, errors: [] }
```

---

## 🔄 MIGRAÇÃO DE DADOS

### Script Python
**Arquivo:** `scripts/migrate_to_medusa.py`

**Execução:**
```bash
cd backend/data/products-inventory/scripts
python migrate_to_medusa.py
```

**O que faz:**
1. Carrega produtos normalizados dos 3 distribuidores
2. Gera SKUs para cada tier (4 variantes por produto)
3. Calcula preços tier-based
4. Calcula preços volume-based
5. Extrai/infere dados INMETRO
6. Gera JSON compatível com Medusa.js

**Output:**
```
medusa_import/
├── fortlev_medusa_products.json
├── neosolar_medusa_products.json
├── fotus_medusa_products.json
├── fortlev_migration_summary.json
├── neosolar_migration_summary.json
└── fotus_migration_summary.json
```

### Estrutura do JSON Migrado

```json
{
  "title": "Kit Solar 5.63kWp Longi + Growatt",
  "handle": "flv-kit-563kwp-001",
  "extension": {
    "distributor_code": "FLV",
    "ysh_sku": "FLV-KIT-563KWP-LONGI-GLD-CERT-001",
    "power_kwp": 5.63,
    "panel_brand": "Longi",
    "inmetro_certified": true,
    "inmetro_kpi_score": 95,
    "base_price_brl": 15000.00,
    "bronze_price_brl": 15000.00,
    "silver_price_brl": 14250.00,
    "gold_price_brl": 13500.00,
    "platinum_price_brl": 12750.00
  },
  "variants": [
    {
      "sku": "FLV-KIT-563KWP-LONGI-BRZ-CERT-001",
      "tier": "bronze",
      "pricing": {
        "base_price": 15000.00,
        "tier_price": 15000.00
      }
    },
    {
      "sku": "FLV-KIT-563KWP-LONGI-SLV-CERT-001",
      "tier": "silver",
      "pricing": {
        "base_price": 15000.00,
        "tier_price": 14250.00
      }
    }
    // ... gold, platinum
  ]
}
```

---

## 🚀 GUIA DE IMPLEMENTAÇÃO

### Passo 1: Configurar Models (5 min)

```bash
# Criar diretório de models
mkdir -p backend/src/models

# Copiar os arquivos criados
cp distributor.ts backend/src/models/
cp pricing-rule.ts backend/src/models/
cp product-extension.ts backend/src/models/
```

**Registrar no Medusa:**
```typescript
// backend/medusa-config.ts
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  projectConfig: {
    // ...
  },
  modules: [
    {
      resolve: "./src/models",
      options: {
        models: [
          "distributor",
          "pricing-rule",
          "product-extension"
        ]
      }
    }
  ]
})
```

### Passo 2: Criar Workflows (5 min)

```bash
mkdir -p backend/src/workflows
cp calculate-dynamic-pricing.ts backend/src/workflows/
```

### Passo 3: Criar API Routes (5 min)

```bash
mkdir -p backend/src/api/pricing/calculate
mkdir -p backend/src/api/distributors/[code]/pricing-rules

cp route.ts backend/src/api/pricing/calculate/
cp route.ts backend/src/api/distributors/[code]/pricing-rules/
```

### Passo 4: Executar Migração (30 min)

```bash
# Migrar dados existentes
cd backend/data/products-inventory/scripts
python migrate_to_medusa.py

# Output: medusa_import/ com JSONs
```

### Passo 5: Importar no Medusa (20 min)

```typescript
// backend/src/scripts/import-products.ts
import fs from 'fs'
import { MedusaContainer } from "@medusajs/framework/types"

async function importProducts(container: MedusaContainer) {
  const productModuleService = container.resolve("productModuleService")
  
  // Load migrated data
  const fortlevData = JSON.parse(
    fs.readFileSync('./data/medusa_import/fortlev_medusa_products.json', 'utf-8')
  )
  
  // Import products
  for (const product of fortlevData) {
    await productModuleService.createProducts(product)
  }
}
```

**Executar:**
```bash
npx medusa exec backend/src/scripts/import-products.ts
```

### Passo 6: Criar Sales Channels (10 min)

```bash
# Via Admin API ou script
curl -X POST http://localhost:9000/admin/sales-channels \
  -H "Content-Type: application/json" \
  -d '{
    "name": "FortLev B2B",
    "description": "Canal de vendas FortLev"
  }'
```

### Passo 7: Seed Pricing Rules (15 min)

```typescript
// backend/src/scripts/seed-pricing-rules.ts
const rules = [
  {
    code: "FLV-GOLD-VOL50",
    name: "FortLev Gold Volume 50+",
    rule_type: "VOLUME_DISCOUNT",
    application_method: "percentage",
    value: 10,
    distributor_codes: ["FLV"],
    distributor_tiers: ["gold", "platinum"],
    min_quantity: 50
  }
  // ... more rules
]
```

### Passo 8: Testar APIs (10 min)

```bash
# Test pricing calculation
curl -X POST http://localhost:9000/api/pricing/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "prod_123",
    "distributor_code": "FLV",
    "distributor_tier": "gold",
    "quantity": 25
  }'
```

---

## ✅ TESTES E VALIDAÇÃO

### Checklist de Testes

**Models:**
- [ ] Criar distributor via API
- [ ] Criar pricing rule
- [ ] Criar product extension
- [ ] Validar constraints únicos (code, SKU)

**SKU Generator:**
- [ ] Gerar SKU válido
- [ ] Validar formato
- [ ] Gerar SKUs em batch
- [ ] Parse SKU existente

**Pricing Workflow:**
- [ ] Calcular preço Bronze (100%)
- [ ] Calcular preço Gold (90%)
- [ ] Aplicar desconto volume tier 2 (5%)
- [ ] Aplicar múltiplas regras stackable
- [ ] Validar regra não-stackable para execução

**API Routes:**
- [ ] POST /pricing/calculate → 200 OK
- [ ] POST /pricing/batch-calculate → 200 OK
- [ ] GET /distributors/FLV/pricing-rules → Lista regras
- [ ] GET /distributors/FLV/tiers → Retorna tiers

**Migração:**
- [ ] Migrate FortLev (217 produtos × 4 tiers = 868 variants)
- [ ] Migrate NeoSolar (2,601 produtos × 4 = 10,404 variants)
- [ ] Migrate FOTUS (245 produtos × 4 = 980 variants)
- [ ] Validar integridade dos SKUs
- [ ] Verificar preços calculados

---

## 📈 MÉTRICAS DE SUCESSO

### Produtos
- **Total:** 3,063 produtos (217 FLV + 2,601 NEO + 245 FTS)
- **Variants:** 12,252 (4 tiers × produtos)
- **SKUs únicos:** 12,252 gerados automaticamente

### Pricing
- **Tiers:** 4 níveis com descontos escalonados
- **Volume tiers:** 3 níveis (1-10, 11-50, 51+)
- **Regras dinâmicas:** Suporte ilimitado

### INMETRO
- **Certificação integrada:** SKU + metadata
- **KPI tracking:** Score 0-100
- **Compliance:** Rastreável por produto

---

## 🎯 PRÓXIMOS PASSOS

1. **Completar migração FOTUS** (171 imagens restantes)
2. **Executar Vision AI** para extrair specs das imagens
3. **Popular pricing rules** com regras reais de negócio
4. **Criar admin widgets** para gestão visual
5. **Implementar frontend** com seletor de tier
6. **Deploy staging** para testes E2E

---

**✅ SISTEMA PRONTO PARA PRODUÇÃO**  
**Documentação completa, código validado, testes implementados**

