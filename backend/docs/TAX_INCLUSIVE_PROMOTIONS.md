# Promoções Tax-Inclusive - Medusa v2.8.5

## 🎯 Overview

**Tax-Inclusive Promotions** (Medusa v2.8.5) permitem criar descontos que são aplicados **DEPOIS dos impostos**, garantindo que o valor anunciado seja exatamente o que o cliente recebe.

Isso é especialmente importante no mercado brasileiro onde o ICMS (18% em média) é um valor significativo, e descontos pré-imposto podem confundir clientes.

## 💰 Diferença: Tax-Inclusive vs Standard

### Exemplo Real: Sistema Solar R$ 10.000,00

#### ❌ SEM Tax-Inclusive (Padrão Medusa < v2.8.5)

```
Produto: R$ 10.000,00
Desconto 10%: R$ 1.000,00 (sobre valor base)
Subtotal: R$ 9.000,00
ICMS 18%: R$ 1.620,00 (sobre 9.000)
TOTAL FINAL: R$ 10.620,00

Desconto REAL para cliente: R$ 1.000,00
Valor anunciado: "10% OFF"
Expectativa cliente: Pagar R$ 10.800,00 (R$ 12.000 - 10%)
Realidade: Paga R$ 10.620,00
❌ Diferença de R$ 180,00 causa confusão
```

#### ✅ COM Tax-Inclusive (v2.8.5)

```
Produto: R$ 10.000,00
ICMS 18%: R$ 1.800,00
Total com imposto: R$ 11.800,00
Desconto 10% tax-inclusive: R$ 1.180,00 (sobre total)
TOTAL FINAL: R$ 10.620,00

Desconto REAL para cliente: R$ 1.180,00
Valor anunciado: "10% OFF"
Expectativa cliente: Pagar 90% de R$ 11.800 = R$ 10.620
Realidade: Paga R$ 10.620,00
✅ Expectativa = Realidade
```

## 🛠️ Implementação

### Workflow: createSolarPromotionWorkflow

**Localização**: `backend/src/workflows/promotion/create-solar-promo.ts`

**Key Feature**:

```typescript
const promotionInput: CreatePromotionDTO = {
  code: "SOLAR10OFF",
  is_tax_inclusive: true, // 🎯 MAGIC LINE
  
  application_method: {
    type: "percentage",
    value: 10, // 10%
    target_type: "items",
    target_rules: [
      {
        attribute: "product.metadata.tipo_produto",
        operator: "eq",
        values: ["sistema_solar"],
      },
    ],
  },
};
```

### Targeting por Capacidade

Criar promoção apenas para sistemas ≥ 5 kWp:

```typescript
{
  code: "SOLAR10OFF-LARGE",
  discount_type: "percentage",
  discount_value: 10,
  min_capacity_kwp: 5, // Filtro por capacidade
  building_types: ["residential"], // Apenas residencial
}
```

**Target Rules Geradas**:

```typescript
target_rules: [
  {
    attribute: "product.metadata.tipo_produto",
    operator: "eq",
    values: ["sistema_solar"],
  },
  {
    attribute: "product.metadata.solar_capacity_kw",
    operator: "gte",
    values: [5],
  },
  {
    attribute: "product.metadata.building_type",
    operator: "in",
    values: ["residential"],
  },
]
```

### Workflow: createSolarFreeShippingWorkflow

**Localização**: `backend/src/workflows/promotion/create-solar-promo.ts`

**Frete Grátis Condicional**:

- ✅ Residential sem guindaste → Frete 100% grátis
- ⚠️ Commercial/Industrial com guindaste → Desconto parcial (implementação futura)

```typescript
{
  code: "FREESHIP-RESIDENTIAL",
  min_capacity_kwp: 3,
  residential_only: true, // Apenas residential
}
```

**Rules Geradas**:

```typescript
rules: [
  {
    attribute: "cart.metadata.tipo_produto",
    operator: "eq",
    values: ["sistema_solar"],
  },
  {
    attribute: "cart.metadata.building_type",
    operator: "eq",
    values: ["residential"],
  },
  {
    attribute: "cart.metadata.installation_complexity",
    operator: "in",
    values: ["low", "medium"], // Não high ou very_high
  },
  {
    attribute: "cart.metadata.crane_required",
    operator: "eq",
    values: [false],
  },
  {
    attribute: "cart.metadata.solar_capacity_kw",
    operator: "gte",
    values: [3],
  },
]
```

## 🌐 API Routes

### POST /admin/solar/promotions

**Criar Promoção Solar**

**Body**:

```json
{
  "code": "SOLAR10OFF",
  "description": "10% de desconto em sistemas residenciais acima de 5kWp",
  "discount_type": "percentage",
  "discount_value": 10,
  "min_capacity_kwp": 5,
  "max_capacity_kwp": 50,
  "building_types": ["residential"],
  "start_date": "2025-01-01T00:00:00Z",
  "end_date": "2025-12-31T23:59:59Z",
  "usage_limit": 100
}
```

**Response 201**:

```json
{
  "promotion": {
    "id": "promo_01J...",
    "code": "SOLAR10OFF",
    "is_tax_inclusive": true
  },
  "campaign": {
    "id": "camp_01J...",
    "name": "Campanha Solar: SOLAR10OFF"
  },
  "tax_inclusive_note": "Desconto aplicado DEPOIS dos impostos conforme v2.8.5",
  "message": "Promoção SOLAR10OFF criada com sucesso!"
}
```

### POST /admin/solar/promotions/free-shipping

**Criar Promoção de Frete Grátis**

**Body**:

```json
{
  "code": "FREESHIP-RESIDENTIAL",
  "min_capacity_kwp": 3,
  "residential_only": true
}
```

**Response 201**:

```json
{
  "promotion": {
    "id": "promo_01J...",
    "code": "FREESHIP-RESIDENTIAL",
    "is_automatic": true
  },
  "residential_only": true,
  "note": "Frete grátis apenas para instalações residenciais sem guindaste",
  "message": "Promoção de frete grátis FREESHIP-RESIDENTIAL criada com sucesso!"
}
```

## 📊 Exemplos de Promoções

### 1. Desconto Percentual - Residential

```bash
curl -X POST http://localhost:9000/admin/solar/promotions \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SOLAR10OFF",
    "description": "10% OFF em sistemas residenciais",
    "discount_type": "percentage",
    "discount_value": 10,
    "min_capacity_kwp": 3,
    "building_types": ["residential"],
    "usage_limit": 50
  }'
```

**Aplicação**:

- Sistema 5 kWp residencial: R$ 25.000 + ICMS 18% = R$ 29.500
- Desconto 10% tax-inclusive: R$ 2.950
- Total final: R$ 26.550

### 2. Desconto Fixo - Commercial Large

```bash
curl -X POST http://localhost:9000/admin/solar/promotions \
  -H "Content-Type: application/json" \
  -d '{
    "code": "COMMERCIAL5K",
    "description": "R$ 5.000 OFF em sistemas comerciais acima de 30kWp",
    "discount_type": "fixed",
    "discount_value": 500000,
    "min_capacity_kwp": 30,
    "building_types": ["commercial"],
    "usage_limit": 20
  }'
```

**Aplicação**:

- Sistema 40 kWp comercial: R$ 180.000 + ICMS 18% = R$ 212.400
- Desconto fixo: R$ 5.000
- Total final: R$ 207.400

### 3. Frete Grátis - Residential Only

```bash
curl -X POST http://localhost:9000/admin/solar/promotions/free-shipping \
  -H "Content-Type: application/json" \
  -d '{
    "code": "FREESHIP3KW",
    "min_capacity_kwp": 3,
    "residential_only": true
  }'
```

**Aplicação**:

- ✅ Residential 5 kWp cerâmica → Frete R$ 800 → **R$ 0**
- ✅ Residential 8 kWp metálico → Frete R$ 1.200 → **R$ 0**
- ❌ Commercial 10 kWp laje → Frete R$ 2.500 → **R$ 2.500** (não elegível)
- ❌ Residential 35 kWp guindaste → Frete R$ 5.000 → **R$ 5.000** (não elegível)

## 🎯 Casos de Uso Estratégicos

### Black Friday Solar 2025

```json
{
  "code": "BLACKFRIDAY2025",
  "description": "Black Friday: 15% OFF em todos os sistemas solares",
  "discount_type": "percentage",
  "discount_value": 15,
  "start_date": "2025-11-25T00:00:00Z",
  "end_date": "2025-11-29T23:59:59Z",
  "usage_limit": 200
}
```

### Incentivo Grandes Projetos

```json
{
  "code": "INDUSTRIAL20K",
  "description": "R$ 20.000 OFF em projetos industriais acima de 100kWp",
  "discount_type": "fixed",
  "discount_value": 2000000,
  "min_capacity_kwp": 100,
  "building_types": ["industrial"],
  "usage_limit": 10
}
```

### Frete Grátis Nacional

```json
{
  "code": "FREESHIP-ALL",
  "min_capacity_kwp": 5,
  "residential_only": false
}
```

## 🚀 Benefícios para Mercado BR

### 1. Transparência

✅ Valor anunciado = Valor real  
✅ Cliente entende exatamente quanto vai economizar  
✅ Reduz taxa de abandono de carrinho por confusão

### 2. Competitividade

✅ Descontos maiores sem comprometer margem  
✅ Possibilidade de promoções mais agressivas  
✅ Frete grátis condicional aumenta conversão

### 3. Compliance

✅ Segue Lei de Precificação Brasileira  
✅ Desconto aplicado sobre valor com impostos  
✅ Alinhado com expectativa do consumidor BR

## 📚 References

- [Medusa v2.8.5 Release Notes](https://github.com/medusajs/medusa/releases/tag/v2.8.5)
- [Tax-Inclusive Promotions PR](https://github.com/medusajs/medusa/pull/xxxxx)
- Internal: `backend/src/workflows/promotion/create-solar-promo.ts`
- Internal: `backend/src/api/admin/solar/promotions/route.ts`
