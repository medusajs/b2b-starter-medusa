# 📦 Unified Catalog Module

Módulo Medusa 2.4 para gerenciamento de catálogo unificado com comparação de preços multi-distribuidor.

## 📋 Visão Geral

O **Unified Catalog Module** centraliza produtos de múltiplos distribuidores em um catálogo único, permitindo:

- ✅ Deduplicação inteligente de produtos
- ✅ Comparação de preços entre distribuidores
- ✅ Classificação TIER de fabricantes
- ✅ Normalização de kits solares
- ✅ Recomendações baseadas em perfil energético

## 🏗️ Arquitetura

### Modelos

#### 1. Manufacturer

Fabricantes de equipamentos solares com classificação de qualidade.

```typescript
{
  name: "DEYE",
  slug: "deye",
  tier: "TIER_1", // TIER_1, TIER_2, TIER_3, UNKNOWN
  country: "China",
  product_count: 60,
  aliases: ["DEYE", "DEYE SOLAR"]
}
```

#### 2. SKU

Produtos únicos com especificações técnicas unificadas.

```typescript
{
  sku_code: "DEYE-INV-SUN5K-240V-5000W",
  manufacturer_id: "deye",
  category: "inverters",
  technical_specs: {
    potencia_w: 5000,
    tensao_v: 240,
    fases: "monofásico"
  },
  lowest_price: 5780.00,
  highest_price: 5920.00,
  total_offers: 3
}
```

#### 3. DistributorOffer

Ofertas de distribuidores para cada SKU.

```typescript
{
  sku_id: "sku_xxxxx",
  distributor_name: "FOTUS",
  price: 5850.00,
  stock_status: "in_stock",
  stock_quantity: 15,
  lead_time_days: 7
}
```

#### 4. Kit

Kits solares pré-configurados com componentes linkados.

```typescript
{
  kit_code: "KIT-1_2KWP-ASTRONERGY-TSUNESS",
  system_capacity_kwp: 1.2,
  components: [
    {
      type: "panel",
      sku_id: "ASTRONERGY-PAN-ASTRON600W",
      quantity: 2,
      confidence: 95
    }
  ],
  kit_price: 2706.07,
  discount_pct: 6.36
}
```

## 🚀 Uso

### Buscar SKUs

```typescript
const catalogService = container.resolve("unifiedCatalog");

const skus = await catalogService.searchSKUs({
  category: "inverters",
  manufacturer_id: "deye",
  min_price: 1000,
  max_price: 10000
});
```

### Comparar Preços

```typescript
const comparison = await catalogService.compareSKUPrices("sku_xxxxx");

console.log(comparison.comparison);
// {
//   lowest_price: 5780.00,
//   highest_price: 5920.00,
//   max_savings: "140.00",
//   max_savings_pct: "2.42",
//   total_offers: 3
// }
```

### Recomendar Kits

```typescript
const monthlyConsumption = 500; // kWh/mês

const recommendedKits = await catalogService.recommendKitsByConsumption(
  monthlyConsumption
);
```

## 📡 APIs REST

### GET /store/catalog/skus

Lista SKUs com filtros.

**Query params:**

- `category`: Categoria do produto
- `manufacturer_id`: Slug do fabricante
- `min_price`: Preço mínimo
- `max_price`: Preço máximo
- `search`: Busca por texto
- `limit`: Limite de resultados (padrão: 20)
- `offset`: Offset para paginação

**Response:**

```json
{
  "skus": [...],
  "count": 564,
  "limit": 20,
  "offset": 0
}
```

### GET /store/catalog/skus/:id

Detalhes de um SKU com ofertas.

**Response:**

```json
{
  "sku": {
    "sku_code": "DEYE-INV-SUN5K-240V-5000W",
    "manufacturer": {...},
    "lowest_price": 5780.00
  },
  "offers": [...]
}
```

### GET /store/catalog/skus/:id/compare

Compara preços entre distribuidores.

**Response:**

```json
{
  "sku": {...},
  "offers": [
    {
      "distributor_name": "ODEX",
      "price": 5780.00,
      "is_best_price": true,
      "savings_vs_highest": "140.00"
    }
  ],
  "comparison": {
    "max_savings": "140.00",
    "max_savings_pct": "2.42"
  }
}
```

## 🎨 Frontend Integration

### Server Action

```typescript
// storefront/src/lib/data/catalog.ts
import { compareSKUPrices } from "@/lib/data/catalog";

const comparison = await compareSKUPrices("sku_xxxxx");
```

### React Component

```tsx
import { PriceComparisonComponent } from "@/modules/products/components/price-comparison";

<PriceComparisonComponent comparison={comparison} />
```

## 📊 Padronização de SKUs

### Por Categoria

#### Painéis Solares

```tsx
Padrão: {FABRICANTE}-PAN-{MODELO}-{POTÊNCIA}W
Exemplo: CANADIAN-PAN-CS7N-550W
```

#### Inversores

```tsx
Padrão: {FABRICANTE}-INV-{MODELO}-{TENSÃO}V-{POTÊNCIA}W
Exemplo: DEYE-INV-SUN5K-240V-5000W
```

#### Baterias

```tsx
Padrão: {FABRICANTE}-BAT-{MODELO}-{CAPACIDADE}AH-{TENSÃO}V
Exemplo: BYD-BAT-HVS-200AH-48V
```

### Por Classe Consumidora

#### Residencial (até 500 kWh/mês)

- Kits: 1-5 kWp
- Inversores: monofásicos 127/220V
- Orçamento: R$ 5.000 - R$ 25.000

#### Comercial (500-2.000 kWh/mês)

- Kits: 5-20 kWp
- Inversores: trifásicos 380V
- Orçamento: R$ 25.000 - R$ 100.000

#### Industrial (>2.000 kWh/mês)

- Kits: 20-100+ kWp
- Inversores: trifásicos 380V/440V
- Orçamento: R$ 100.000+

## 🔧 Setup

### 1. Registrar Módulo

```typescript
// backend/medusa-config.ts
import { UNIFIED_CATALOG_MODULE } from "./src/modules/unified-catalog";

export default defineConfig({
  modules: {
    [UNIFIED_CATALOG_MODULE]: {
      resolve: "./modules/unified-catalog",
    },
  },
});
```

### 2. Gerar Migrations

```bash
yarn medusa db:generate UnifiedCatalog
```

### 3. Aplicar Migrations

```bash
yarn medusa db:migrate
```

### 4. Seed de Dados

```bash
yarn seed:catalog
```

Importa:

- 37 fabricantes
- 564 SKUs únicos
- ~1.400 ofertas de distribuidores
- 101 kits normalizados

## 📚 Documentação Completa

Veja `docs/implementation/UNIFIED_CATALOG_IMPLEMENTATION.md` para documentação detalhada incluindo:

- Exemplos de integração com Hélio (copiloto solar)
- Fluxos de recomendação por perfil energético
- Estratégias de sincronização de preços
- Roadmap de funcionalidades futuras

## 🎯 Métricas

- **564 SKUs** únicos indexados
- **103 produtos** (20.2%) com ofertas múltiplas
- **5-20%** economia potencial
- **101 kits** normalizados
- **37 fabricantes** classificados

---

**Status**: ✅ Implementação Completa  
**Versão**: 1.0.0  
**Licença**: Proprietary
