# 📦 Schemas Medusa.js v2.x - YSH Solar B2B E-commerce

## 📋 Índice Geral

Este diretório contém schemas JSON completos para todas as categorias de produtos do YSH Solar, compatíveis com **Medusa.js v2.x** usando os padrões mais recentes:

- ✅ **Product Module** (Product, ProductVariant, ProductOption)
- ✅ **Inventory Module** (Inventory Items, Inventory Levels, Stock Locations)
- ✅ **Inventory Kits Pattern** (Multi-part Products & Bundles)
- ✅ **Pricing Module** (Tiered Pricing, Price Rules por Customer Group/Region)
- ✅ **JSON Schema Draft-07** (Validação formal)

---

## 📁 Estrutura de Schemas

```tsx
schemas/
├── README-SCHEMAS.md                        # Este arquivo
├── inverters/
│   ├── inverters-medusa-schema.json
│   ├── INVERTERS-SCHEMA-README.md
│   ├── convert-inverters-to-medusa.js
│   └── example-odex-inverters-medusa.json
├── panels/
│   ├── panels-medusa-schema.json
│   ├── PANELS-SCHEMA-README.md
│   ├── convert-panels-to-medusa.js
│   └── example-panels-medusa.json
├── batteries/
│   └── batteries-medusa-schema.json         # ✨ NOVO
├── ev-chargers/
│   └── ev-chargers-medusa-schema.json       # ✨ NOVO
├── structures/
│   ├── structures-medusa-schema.json
│   └── convert-structures-to-medusa.js
├── kits/ (DEPRECATED - usar bundles/)
│   ├── kits-medusa-schema.json
│   └── convert-kits-to-medusa.js
└── bundles/
    └── bundles-medusa-schema.json           # ✨ NOVO (com Inventory Kits)
```

---

## 🎯 Schemas Disponíveis

### 1. **Inversores** (`inverters/`)

**Status:** ✅ Completo (documentação + exemplos + conversão)

**Schema:** `inverters-medusa-schema.json`

**Características:**

- Suporte a Grid-Tie, Híbrido, Off-Grid, Microinversor
- Options: Potência (kW), Voltagem (V), Fases (Mono/Bi/Tri), MPPTs
- Tiered Pricing por quantidade
- Price Rules por customer group (B2B/Integrador/Varejo)
- 30+ campos técnicos (max_input_current, efficiency, mppt_range, etc)

**Categorias:**

```tsx
cat_inversores
cat_inversores_grid_tie
cat_inversores_hibrido
cat_inversores_off_grid
cat_inversores_microinversor
cat_inversores_1_5kw
cat_inversores_5_10kw
cat_inversores_10_20kw
cat_inversores_20_50kw
cat_inversores_50_100kw
```

**Exemplo SKU:** `GROWATT-MIC5000-5KW-220V-MONO`

---

### 2. **Painéis Solares** (`panels/`)

**Status:** ✅ Completo (documentação + exemplos + conversão)

**Schema:** `panels-medusa-schema.json`

**Características:**

- Tecnologias: Monocristalino, PERC, TOPCon, HJT, Bifacial, Half-Cell
- Options: Potência (W), Tecnologia, Cor da Moldura
- Especificações elétricas completas (Pmax, Vmp, Imp, Voc, Isc)
- Coeficientes de temperatura
- Dimensões e peso
- Garantias (produto + performance linear)

**Categorias:**

```tsx
cat_paineis
cat_paineis_monocristalino
cat_paineis_policristalino
cat_paineis_bifacial
cat_paineis_half_cell
cat_paineis_400_500w
cat_paineis_500_600w
cat_paineis_600_700w
```

**Exemplo SKU:** `CS-HIKU6-550W-MONO-PERC`

---

### 3. **Baterias/Armazenamento** (`batteries/`)

**Status:** ✨ NOVO - Completo

**Schema:** `batteries-medusa-schema.json`

**Características:**

- Tecnologias: Lítio LFP/NMC, Chumbo-Ácido, AGM, Gel
- Options: Capacidade (kWh), Voltagem (V), Tecnologia
- Especificações: DoD, cycle_life, round_trip_efficiency
- Sistema modular/expansível (expansion_capacity)
- Comunicação: CAN, RS485, Modbus TCP
- BMS features (balanceamento, proteções)
- Compatible inverters array

**Categorias:**

```tsx
cat_baterias
cat_baterias_litio
cat_baterias_chumbo_acido
cat_baterias_5_15kwh
cat_baterias_15_30kwh
cat_baterias_30_50kwh
```

**Exemplo SKU:** `BYD-BBOX-LVS-12KWH-48V`

**Tiered Pricing:**

```json
[
  { "amount": 1500000, "rules": [] },                      // Padrão
  { "amount": 1425000, "min_quantity": 2, "max_quantity": 4 },  // 5% off
  { "amount": 1350000, "min_quantity": 5 },                     // 10% off
  { "amount": 1275000, "rules": { "customer.groups.id": "cusgrp_b2b" } }  // 15% B2B
]
```

---

### 4. **Carregadores EV** (`ev-chargers/`)

**Status:** ✨ NOVO - Completo

**Schema:** `ev-chargers-medusa-schema.json`

**Características:**

- Potências: 3.7kW, 7.4kW, 11kW, 22kW
- Options: Potência (kW), Conector (Type 1/2/CCS/CHAdeMO), Cabo (3m/5m/7m)
- Modo Solar (carregamento com excedente PV)
- Load Balancing dinâmico
- Smart features: WiFi, Bluetooth, RFID, App Mobile
- Protocolos: OCPP 1.6/2.0, Modbus TCP
- Proteção IP54/IP65

**Categorias:**

```tsx
cat_ev_chargers
cat_ev_chargers_wallbox
cat_ev_chargers_poste
cat_ev_chargers_7kw
cat_ev_chargers_11kw
cat_ev_chargers_22kw
```

**Exemplo SKU:** `WALLBOX-PULSAR-11KW-T2-5M`

**Tiered Pricing:**

```json
[
  { "amount": 520000, "rules": [] },                      // Padrão: R$ 5.200,00
  { "amount": 494000, "min_quantity": 5, "max_quantity": 9 },  // 5% off para 5-9 unidades
  { "amount": 468000, "min_quantity": 10 },                    // 10% off para 10+ unidades
  { "amount": 442000, "rules": { "customer.groups.id": "cusgrp_b2b" } }  // 15% B2B
]
```

---

### 5. **Estruturas** (`structures/`)

**Status:** ⚠️ Básico (schema simples, precisa atualização para multi-part)

**Schema:** `structures-medusa-schema.json`

**Necessita:**

- ✅ Implementar Inventory Kits pattern (rails + clamps + hooks como inventory items separados)
- ✅ Options: Tipo de Telhado, Quantidade de Painéis, Material
- ✅ Especificações: load_capacity, material, mounting_angle
- ✅ inventory_items array com required_quantity para cada componente

**Categorias sugeridas:**

```tsx
cat_estruturas
cat_estruturas_ceramico
cat_estruturas_metalico
cat_estruturas_fibrocimento
cat_estruturas_laje
cat_estruturas_solo
```

**Exemplo SKU:** `SG-CERAMIC-10P-AL-ANOD`

---

### 6. **Kits/Bundles** (`bundles/`)

**Status:** ✨ NOVO - Completo (com Inventory Kits)

**Schema:** `bundles-medusa-schema.json`

**🔥 PADRÃO INVENTORY KITS:**

```json
{
  "variants": [
    {
      "title": "5.5kWp / Cerâmico / 220V",
      "sku": "KIT-5.5KWP-CERAMICO-220V",
      "manage_inventory": false,  // Kit não tem estoque próprio
      "inventory_items": [
        {
          "inventory_item_id": "inv_item_panel_cs_550w",
          "required_quantity": 10
        },
        {
          "inventory_item_id": "inv_item_inv_growatt_5k",
          "required_quantity": 1
        },
        {
          "inventory_item_id": "inv_item_struct_sg_ceramic_10p",
          "required_quantity": 1
        },
        {
          "inventory_item_id": "inv_item_stringbox_4e",
          "required_quantity": 1
        },
        {
          "inventory_item_id": "inv_item_cable_6mm_red",
          "required_quantity": 50
        },
        {
          "inventory_item_id": "inv_item_cable_6mm_black",
          "required_quantity": 50
        },
        {
          "inventory_item_id": "inv_item_mc4_pair",
          "required_quantity": 11
        }
      ],
      "prices": [
        {
          "currency_code": "BRL",
          "amount": 1580000  // R$ 15.800,00
        }
      ]
    }
  ]
}
```

**Características:**

- ✅ Inventory Kits pattern (estoque calculado dos componentes)
- ✅ Options: Potência (kWp), Tipo de Telhado, Voltagem, Com Bateria
- ✅ Metadata rico: system_specs, kit_composition, installation, warranty
- ✅ Tipos: Grid-Tie, Híbrido, Off-Grid, Comercial, Industrial
- ✅ Cálculos: ratio painéis/inversor, geração estimada, área necessária

**Categorias:**

```tsx
cat_kits
cat_kits_grid_tie
cat_kits_hibrido
cat_kits_off_grid
cat_kits_residencial
cat_kits_comercial
cat_kits_3_5kwp
cat_kits_5_10kwp
cat_kits_10_20kwp
```

**Exemplo SKU:** `KIT-5.5KWP-CERAMICO-220V`

---

## 🔄 Padrões do Medusa.js

### 1. Product Fields (Comuns a todos)

```json
{
  "title": "Nome do produto",
  "subtitle": "Descrição curta",
  "handle": "nome-do-produto-url-friendly",
  "description": "Descrição detalhada",
  "status": "published",              // draft | published | archived
  "is_giftcard": false,
  "discountable": true,
  "external_id": "odex_abc123",
  "thumbnail": "url/para/imagem.webp",
  "weight": 12.5,                     // kg
  "length": 2100,                     // mm
  "height": 1050,                     // mm
  "width": 35,                        // mm
  "hs_code": "8541.40.16",            // NCM
  "origin_country": "CN",             // ISO code
  "material": "Alumínio anodizado"
}
```

---

### 2. Options (Eixos de Variação)

```json
{
  "options": [
    {
      "title": "Potência",
      "values": ["5kW", "6kW", "8kW"]
    },
    {
      "title": "Voltagem",
      "values": ["220V", "380V"]
    },
    {
      "title": "Fases",
      "values": ["Monofásico", "Trifásico"]
    }
  ]
}
```

---

### 3. Variants (Combinações)

```json
{
  "variants": [
    {
      "title": "5kW / 220V / Monofásico",
      "sku": "GROWATT-MIC5000-5KW-220V-MONO",
      "barcode": "7891234567890",
      "manage_inventory": true,           // Cria inventory_item automaticamente
      "allow_backorder": false,
      "weight": 12.5,
      "options": {
        "Potência": "5kW",
        "Voltagem": "220V",
        "Fases": "Monofásico"
      },
      "prices": [
        // Ver seção de Pricing abaixo
      ]
    }
  ]
}
```

---

### 4. Pricing (Tiered Pricing + Price Rules)

#### a) **Preço Padrão**

```json
{
  "currency_code": "BRL",
  "amount": 500000,           // R$ 5.000,00 em centavos
  "rules": []
}
```

#### b) **Tiered Pricing (Por Quantidade)**

```json
[
  {
    "currency_code": "BRL",
    "amount": 500000,         // Padrão: R$ 5.000,00
    "rules": []
  },
  {
    "currency_code": "BRL",
    "amount": 475000,         // 5% off: R$ 4.750,00
    "min_quantity": 5,
    "max_quantity": 9
  },
  {
    "currency_code": "BRL",
    "amount": 450000,         // 10% off: R$ 4.500,00
    "min_quantity": 10
  }
]
```

#### c) **Price Rules (Por Customer Group)**

```json
{
  "currency_code": "BRL",
  "amount": 425000,           // 15% off para B2B: R$ 4.250,00
  "rules": {
    "customer.groups.id": "cusgrp_b2b_integrador"
  }
}
```

#### d) **Price Rules (Por Região)**

```json
{
  "currency_code": "BRL",
  "amount": 450000,           // Preço especial região Sul: R$ 4.500,00
  "rules": {
    "region.id": "reg_sul_brasil"
  }
}
```

#### e) **Price Rules Combinados**

```json
{
  "currency_code": "BRL",
  "amount": 400000,           // R$ 4.000,00
  "min_quantity": 10,         // Compra 10+ unidades
  "rules": {
    "customer.groups.id": "cusgrp_b2b_integrador",  // E é B2B
    "item_total": [
      {
        "operator": "gte",
        "value": 5000000        // E carrinho >= R$ 50.000,00
      }
    ]
  }
}
```

---

### 5. Inventory Kits (Multi-Part Products)

#### a) **Criar Inventory Items (Componentes)**

```typescript
import { createInventoryItemsWorkflow } from "@medusajs/medusa/core-flows"

const { result: inventoryItems } = await createInventoryItemsWorkflow(container).run({
  input: {
    items: [
      {
        sku: "CS-550W-PANEL",
        title: "Painel Canadian Solar 550W",
        location_levels: [
          {
            stocked_quantity: 500,
            location_id: "sloc_warehouse_sp"
          }
        ]
      },
      {
        sku: "GROWATT-5K-INV",
        title: "Inversor Growatt 5kW",
        location_levels: [
          {
            stocked_quantity: 50,
            location_id: "sloc_warehouse_sp"
          }
        ]
      },
      {
        sku: "SG-CERAMIC-10P",
        title: "Estrutura Cerâmico 10 Painéis",
        location_levels: [
          {
            stocked_quantity: 100,
            location_id: "sloc_warehouse_sp"
          }
        ]
      }
    ]
  }
})
```

#### b) **Criar Kit usando Inventory Items**

```typescript
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

const { result: products } = await createProductsWorkflow(container).run({
  input: {
    products: [
      {
        title: "Kit Solar 5.5kWp Grid-Tie",
        handle: "kit-solar-5-5kwp-grid-tie",
        variants: [
          {
            title: "5.5kWp Completo",
            sku: "KIT-5.5KWP-COMPLETE",
            prices: [
              {
                currency_code: "BRL",
                amount: 1580000  // R$ 15.800,00
              }
            ],
            options: {
              "Potência": "5.5kWp"
            },
            // 🔥 INVENTORY KITS: Array de componentes
            inventory_items: [
              {
                inventory_item_id: inventoryItems[0].id,  // Painel 550W
                required_quantity: 10
              },
              {
                inventory_item_id: inventoryItems[1].id,  // Inversor 5kW
                required_quantity: 1
              },
              {
                inventory_item_id: inventoryItems[2].id,  // Estrutura
                required_quantity: 1
              }
            ]
          }
        ],
        options: [
          {
            title: "Potência",
            values: ["5.5kWp"]
          }
        ]
      }
    ]
  }
})
```

#### c) **Cálculo de Estoque do Kit**

O Medusa calcula automaticamente o estoque disponível do kit:

```tsx
Kit Stock = MIN(
  floor(Panel Stock / 10),      // 500 painéis / 10 = 50 kits
  floor(Inverter Stock / 1),    // 50 inversores / 1 = 50 kits
  floor(Structure Stock / 1)    // 100 estruturas / 1 = 100 kits
)

Kit Stock = MIN(50, 50, 100) = 50 kits disponíveis
```

---

## 🚀 Fluxo de Importação

### 1. **Validar Schema**

```bash
npm install -g ajv-cli

ajv validate -s batteries-medusa-schema.json -d my-battery-data.json
```

### 2. **Converter Dados Existentes**

```bash
node convert-inverters-to-medusa.js
node convert-panels-to-medusa.js
```

### 3. **Criar Produtos via Workflow**

#### a) **Produto Simples (Painel, Inversor, Bateria, EV Charger)**

```typescript
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

const { result } = await createProductsWorkflow(container).run({
  input: {
    products: [
      {
        title: "Bateria BYD 12kWh",
        handle: "bateria-byd-12kwh",
        status: "published",
        variants: [
          {
            title: "12kWh / 48V",
            sku: "BYD-BBOX-12KWH-48V",
            manage_inventory: true,  // Cria inventory_item
            prices: [
              {
                currency_code: "BRL",
                amount: 1500000
              }
            ],
            options: {
              "Capacidade": "12kWh",
              "Voltagem": "48V"
            }
          }
        ],
        options: [
          {
            title: "Capacidade",
            values: ["12kWh"]
          },
          {
            title: "Voltagem",
            values: ["48V"]
          }
        ]
      }
    ]
  }
})
```

#### b) **Multi-Part Product (Estrutura)**

```typescript
// 1. Criar inventory items dos componentes
const { result: rails } = await createInventoryItemsWorkflow(container).run({
  input: {
    items: [
      {
        sku: "SG-RAIL-3M",
        title: "Trilho 3m Alumínio",
        location_levels: [{ stocked_quantity: 200, location_id: "sloc_sp" }]
      }
    ]
  }
})

const { result: clamps } = await createInventoryItemsWorkflow(container).run({
  input: {
    items: [
      {
        sku: "SG-CLAMP-CERAMIC",
        title: "Presilha Cerâmico",
        location_levels: [{ stocked_quantity: 1000, location_id: "sloc_sp" }]
      }
    ]
  }
})

// 2. Criar produto estrutura referenciando os components
const { result: structure } = await createProductsWorkflow(container).run({
  input: {
    products: [
      {
        title: "Estrutura Cerâmico 10 Painéis",
        variants: [
          {
            title: "Kit Completo",
            sku: "SG-CERAMIC-10P",
            inventory_items: [
              {
                inventory_item_id: rails[0].id,
                required_quantity: 6  // 6 trilhos
              },
              {
                inventory_item_id: clamps[0].id,
                required_quantity: 40  // 40 presilhas
              }
            ],
            prices: [{ currency_code: "BRL", amount: 180000 }],
            options: { "Quantidade": "10 Painéis" }
          }
        ],
        options: [{ title: "Quantidade", values: ["10 Painéis"] }]
      }
    ]
  }
})
```

#### c) **Bundle Product (Kit Completo)**

```typescript
// 1. Criar inventory items de TODOS os componentes
// (painéis, inversor, estrutura, string box, cabos, conectores)

// 2. Criar kit bundle
const { result: kit } = await createProductsWorkflow(container).run({
  input: {
    products: [
      {
        title: "Kit Solar 5.5kWp Grid-Tie",
        handle: "kit-solar-5-5kwp-grid-tie",
        variants: [
          {
            title: "5.5kWp Completo",
            sku: "KIT-5.5KWP",
            manage_inventory: false,  // Kit não tem estoque próprio
            inventory_items: [
              { inventory_item_id: "inv_panel_cs_550w", required_quantity: 10 },
              { inventory_item_id: "inv_inv_growatt_5k", required_quantity: 1 },
              { inventory_item_id: "inv_struct_ceramic_10p", required_quantity: 1 },
              { inventory_item_id: "inv_stringbox_4e", required_quantity: 1 },
              { inventory_item_id: "inv_cable_6mm_red", required_quantity: 50 },
              { inventory_item_id: "inv_cable_6mm_black", required_quantity: 50 },
              { inventory_item_id: "inv_mc4_pair", required_quantity: 11 }
            ],
            prices: [
              { currency_code: "BRL", amount: 1580000 }  // Preço do kit completo
            ],
            options: { "Potência": "5.5kWp" }
          }
        ],
        options: [{ title: "Potência", values: ["5.5kWp"] }]
      }
    ]
  }
})
```

---

## 🏷️ Sistema de Categorização

### Categorias (Hierárquicas)

```tsx
cat_inversores
├── cat_inversores_grid_tie
├── cat_inversores_hibrido
├── cat_inversores_off_grid
├── cat_inversores_microinversor
├── cat_inversores_1_5kw
├── cat_inversores_5_10kw
└── cat_inversores_10_20kw

cat_paineis
├── cat_paineis_monocristalino
├── cat_paineis_policristalino
├── cat_paineis_bifacial
├── cat_paineis_400_500w
├── cat_paineis_500_600w
└── cat_paineis_600_700w

cat_baterias
├── cat_baterias_litio
├── cat_baterias_chumbo_acido
├── cat_baterias_5_15kwh
├── cat_baterias_15_30kwh
└── cat_baterias_30_50kwh

cat_ev_chargers
├── cat_ev_chargers_wallbox
├── cat_ev_chargers_poste
├── cat_ev_chargers_7kw
├── cat_ev_chargers_11kw
└── cat_ev_chargers_22kw

cat_estruturas
├── cat_estruturas_ceramico
├── cat_estruturas_metalico
├── cat_estruturas_fibrocimento
├── cat_estruturas_laje
└── cat_estruturas_solo

cat_kits
├── cat_kits_grid_tie
├── cat_kits_hibrido
├── cat_kits_off_grid
├── cat_kits_residencial
├── cat_kits_comercial
├── cat_kits_3_5kwp
├── cat_kits_5_10kwp
└── cat_kits_10_20kwp
```

### Tags (Flat, para busca)

```tsx
Fabricantes:
tag_growatt, tag_canadian_solar, tag_byd, tag_wallbox, tag_fronius, tag_goodwe, tag_sungrow, tag_jinko, tag_longi, tag_trina

Especificações:
tag_5kw, tag_10kw, tag_550w, tag_12kwh, tag_11kw, tag_220v, tag_380v, tag_monofasico, tag_trifasico, tag_type2

Tecnologias:
tag_mono_perc, tag_topcon, tag_bifacial, tag_half_cell, tag_litio_lfp, tag_litio_nmc, tag_modo_solar, tag_wifi, tag_ocpp

Aplicações:
tag_residencial, tag_comercial, tag_industrial, tag_off_grid, tag_hibrido, tag_grid_tie, tag_ceramico, tag_metalico

Qualidade:
tag_tier1, tag_tier2, tag_tier3, tag_premium, tag_modular, tag_expansivel
```

---

## 📊 Metadados Técnicos

Cada categoria tem metadados específicos em `metadata.technical_specs`:

### Inversores

```json
{
  "power_kw": 5.0,
  "input_voltage_range_v": { "min": 100, "max": 550 },
  "max_input_current_a": 13.0,
  "mppt_quantity": 2,
  "mppt_voltage_range_v": { "min": 90, "max": 520 },
  "max_efficiency_percent": 98.4,
  "phases": "Monofásico",
  "output_voltage_v": 220,
  "max_output_current_a": 25.0,
  "grid_connection": true,
  "battery_compatible": false,
  "communication_protocol": ["RS485", "WiFi", "Ethernet"]
}
```

### Painéis

```json
{
  "power_w": 550,
  "efficiency_percent": 21.3,
  "technology": "Monocristalino PERC",
  "cells_quantity": 144,
  "vmp_v": 41.5,
  "imp_a": 13.25,
  "voc_v": 49.8,
  "isc_a": 14.05,
  "temp_coeff_pmax_percent": -0.35,
  "temp_coeff_voc_percent": -0.27,
  "temp_coeff_isc_percent": 0.05,
  "warranty_years": 12,
  "performance_warranty_years": 25
}
```

### Baterias

```json
{
  "capacity_kwh": 12.0,
  "voltage_v": 48,
  "technology": "Lítio LFP (LiFePO4)",
  "dod_percent": 92,
  "cycle_life": 6000,
  "round_trip_efficiency_percent": 96.5,
  "max_charge_current_a": 100,
  "max_discharge_current_a": 100,
  "modular": true,
  "expansion_capacity": { "min_kwh": 5, "max_kwh": 40, "step_kwh": 2.5 },
  "communication_protocol": ["CAN", "RS485"],
  "warranty_years": 10
}
```

### Carregadores EV

```json
{
  "charging_power_kw": 11,
  "phases": "Monofásico",
  "connector_type": "Type 2 (Mennekes)",
  "cable_length_m": 5,
  "solar_mode": true,
  "load_balancing": true,
  "smart_features": ["WiFi", "Bluetooth", "RFID", "App Mobile"],
  "communication_protocol": ["WiFi", "Bluetooth", "OCPP 1.6"],
  "protection_degree": "IP54",
  "warranty_years": 2
}
```

### Kits/Bundles

```json
{
  "kit_type": "Grid-Tie",
  "system_specs": {
    "total_power_kwp": 5.5,
    "inverter_power_kw": 5.0,
    "ratio": 1.1,
    "estimated_generation_kwh_month": 825,
    "panel_quantity": 10,
    "area_required_m2": 28,
    "roof_type": "Cerâmico",
    "voltage_v": "220V",
    "phases": "Monofásico"
  },
  "kit_composition": {
    "panels": [...],
    "inverters": [...],
    "structures": [...],
    "stringboxes": [...],
    "cables": [...],
    "connectors": [...]
  }
}
```

---

## 🔍 Validação de Schemas

### Instalar AJV CLI

```bash
npm install -g ajv-cli
```

### Validar um arquivo de dados

```bash
ajv validate -s batteries-medusa-schema.json -d my-battery-data.json
```

### Validar múltiplos arquivos

```bash
ajv validate -s ev-chargers-medusa-schema.json -d "ev-chargers-*.json"
```

---

## 💡 Boas Práticas

### 1. **Handle Generation**

```javascript
function generateHandle(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove acentos
    .replace(/[^a-z0-9]+/g, '-')      // Substitui caracteres especiais por -
    .replace(/^-+|-+$/g, '')          // Remove - no início/fim
    .substring(0, 100)                // Limita tamanho
}

// Exemplo:
generateHandle("Bateria BYD Battery-Box Premium LVS 12kWh")
// → "bateria-byd-battery-box-premium-lvs-12kwh"
```

### 2. **SKU Generation**

```javascript
function generateSKU(product) {
  const manufacturer = product.manufacturer.substring(0, 10).toUpperCase()
  const model = product.model.substring(0, 15).toUpperCase().replace(/\s+/g, '-')
  const specs = [
    product.power_kw ? `${product.power_kw}KW` : '',
    product.capacity_kwh ? `${product.capacity_kwh}KWH` : '',
    product.voltage_v ? `${product.voltage_v}V` : '',
    product.phases ? product.phases.substring(0, 4).toUpperCase() : ''
  ].filter(Boolean).join('-')

  return `${manufacturer}-${model}-${specs}`
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9-]/g, '')
}

// Exemplo Inversor:
generateSKU({
  manufacturer: "Growatt",
  model: "MIC 5000TL-X",
  power_kw: 5,
  voltage_v: 220,
  phases: "Monofásico"
})
// → "GROWATT-MIC5000TL-X-5KW-220V-MONO"

// Exemplo Bateria:
generateSKU({
  manufacturer: "BYD",
  model: "Battery-Box Premium LVS",
  capacity_kwh: 12,
  voltage_v: 48
})
// → "BYD-BATTERYBOX-12KWH-48V"
```

### 3. **Price Conversion (BRL → Centavos)**

```javascript
function convertPriceToCents(price) {
  if (typeof price === 'number') {
    return Math.round(price * 100)
  }
  
  if (typeof price === 'string') {
    // Remove símbolos de moeda e espaços
    const cleaned = price
      .replace(/R\$|USD|\$|€/g, '')
      .replace(/\s+/g, '')
      .trim()
    
    // Substitui vírgula por ponto (formato BR → US)
    const normalized = cleaned.replace(/\./g, '').replace(',', '.')
    
    const number = parseFloat(normalized)
    return Math.round(number * 100)
  }
  
  return 0
}

// Exemplos:
convertPriceToCents("R$ 5.000,00")     // → 500000
convertPriceToCents("5000.00")         // → 500000
convertPriceToCents(5000)              // → 500000
convertPriceToCents("R$ 15.800,50")    // → 1580050
```

### 4. **Inventory Items Mapping**

```javascript
// Manter um mapa de SKU → inventory_item_id
const skuToInventoryIdMap = {
  "CS-550W-PANEL": "inv_item_01JABY123",
  "GROWATT-MIC5000": "inv_item_01JABY456",
  "SG-CERAMIC-10P": "inv_item_01JABY789",
  "STRINGBOX-4E-15A": "inv_item_01JABYABC",
  "CABLE-6MM-RED": "inv_item_01JABYDEF",
  "CABLE-6MM-BLACK": "inv_item_01JABYGHI",
  "MC4-PAIR": "inv_item_01JABYJKL"
}

function getInventoryItemId(sku) {
  return skuToInventoryIdMap[sku] || `inv_item_${sku.toLowerCase()}`
}
```

---

## 📚 Recursos Adicionais

### Documentação Medusa.js v2.x

- [Product Module](https://docs.medusajs.com/resources/commerce-modules/product)
- [Inventory Module](https://docs.medusajs.com/resources/commerce-modules/inventory)
- [Inventory Kits Pattern](https://docs.medusajs.com/resources/commerce-modules/inventory/inventory-kit)
- [Price Rules](https://docs.medusajs.com/resources/commerce-modules/pricing/price-rules)
- [Product Variant Inventory](https://docs.medusajs.com/resources/commerce-modules/product/variant-inventory)
- [Product Model Reference](https://docs.medusajs.com/resources/references/product/models/Product)

### Scripts de Conversão

- `convert-inverters-to-medusa.js` - Converte inversores ODEX/Solfacil/Neosolar
- `convert-panels-to-medusa.js` - Converte painéis ODEX/Solfacil/Neosolar
- `convert-structures-to-medusa.js` - Template para estruturas
- `convert-kits-to-medusa.js` - Converte kits FOTUS/Neosolar

---

## 🎯 Próximos Passos

### 1. **Criar Inventory Items para Componentes**

```typescript
// Criar inventory items para TODOS os componentes individuais
// (painéis, inversores, estruturas, string boxes, cabos, conectores, baterias, EV chargers)

await createInventoryItemsWorkflow(container).run({
  input: {
    items: [
      // Painéis
      { sku: "CS-550W", title: "Painel CS 550W", location_levels: [...] },
      { sku: "JINKO-700W", title: "Painel Jinko 700W", location_levels: [...] },
      
      // Inversores
      { sku: "GROWATT-5K", title: "Inversor Growatt 5kW", location_levels: [...] },
      { sku: "GOODWE-10K", title: "Inversor Goodwe 10kW", location_levels: [...] },
      
      // Estruturas (componentes separados)
      { sku: "SG-RAIL-3M", title: "Trilho 3m", location_levels: [...] },
      { sku: "SG-CLAMP-CERAMIC", title: "Presilha Cerâmico", location_levels: [...] },
      { sku: "SG-HOOK-CERAMIC", title: "Gancho Cerâmico", location_levels: [...] },
      
      // String Boxes
      { sku: "STRINGBOX-4E-15A", title: "String Box 4E 15A", location_levels: [...] },
      
      // Cabos
      { sku: "CABLE-6MM-RED", title: "Cabo 6mm² Vermelho", location_levels: [...] },
      { sku: "CABLE-6MM-BLACK", title: "Cabo 6mm² Preto", location_levels: [...] },
      
      // Conectores
      { sku: "MC4-PAIR", title: "MC4 Par", location_levels: [...] },
      
      // Baterias
      { sku: "BYD-12KWH", title: "BYD 12kWh", location_levels: [...] },
      
      // EV Chargers
      { sku: "WALLBOX-11KW", title: "Wallbox 11kW", location_levels: [...] }
    ]
  }
})
```

### 2. **Criar Produtos Simples**

```typescript
// Painéis, Inversores, Baterias, EV Chargers
// (manage_inventory: true para criar inventory_item automaticamente)
```

### 3. **Criar Produtos Multi-Part (Estruturas)**

```typescript
// Estruturas com inventory_items array referenciando trilhos, presilhas, ganchos
```

### 4. **Criar Bundles (Kits Completos)**

```typescript
// Kits com inventory_items array referenciando TODOS os componentes
```

### 5. **Configurar Price Rules**

```typescript
// Customer Groups: B2B, Integrador, Varejo
// Regions: Sul, Sudeste, Centro-Oeste, Nordeste, Norte
// Tiered Pricing por quantidade (5-9, 10+)
```

### 6. **Popular Categorias e Tags**

```typescript
// Criar categorias hierárquicas
// Criar tags flat para busca
```

---

## ✅ Checklist de Implementação

- [x] Schema Inversores (completo)
- [x] Schema Painéis (completo)
- [x] Schema Baterias (✨ novo)
- [x] Schema Carregadores EV (✨ novo)
- [x] Schema Bundles/Kits com Inventory Kits (✨ novo)
- [ ] Schema Estruturas (atualizar para multi-part)
- [ ] Schema String Boxes
- [ ] Schema Cabos/Conectores
- [ ] Schema Acessórios
- [ ] Criar migrations de categorias
- [ ] Criar migrations de tags
- [ ] Implementar workflows de importação
- [ ] Popular inventory items
- [ ] Popular produtos simples
- [ ] Popular produtos multi-part
- [ ] Popular bundles/kits
- [ ] Configurar price rules
- [ ] Configurar tiered pricing
- [ ] Integrar busca semântica (Gemma 3)

---

## 📧 Suporte

Para dúvidas ou sugestões sobre os schemas, consulte:

- Documentação Medusa.js: <https://docs.medusajs.com>
- Agents criados: `/semantic/agents/`
- README de cada categoria: `INVERTERS-SCHEMA-README.md`, `PANELS-SCHEMA-README.md`, etc

---

**Última atualização:** 13/10/2025  
**Versão:** 2.0.0 (Medusa.js v2.x com Inventory Kits + Price Rules)
