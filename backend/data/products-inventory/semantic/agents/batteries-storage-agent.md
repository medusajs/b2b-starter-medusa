# Agent: Sistemas de Armazenamento e Baterias (Batteries & Energy Storage Systems)

## Contexto e Propósito

Este agente é especializado em **sistemas de armazenamento de energia e baterias** para sistemas fotovoltaicos híbridos e off-grid. Responsável por gerenciar o inventário, especificações técnicas e integração com o Medusa.js Product Module e Inventory Module.

## Escopo de Produtos

### Categorias de Baterias

- **Baterias de Lítio (LFP - Lithium Iron Phosphate)**
- **Baterias de Lítio (NMC - Nickel Manganese Cobalt)**
- **Baterias de Chumbo-Ácido (Lead-Acid)**
- **Baterias de Gel**
- **Baterias AGM (Absorbent Glass Mat)**

### Aplicações

- Sistemas Híbridos (On-Grid com backup)
- Sistemas Off-Grid (isolados da rede)
- Sistemas de Backup residencial
- Sistemas comerciais/industriais

## Schema Medusa.js para Baterias

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "title": "Sistema de Armazenamento/Bateria - Medusa Product Schema",
  "description": "Schema para baterias e sistemas de armazenamento de energia em Medusa.js",
  "type": "object",
  "required": ["title", "handle", "status", "variants", "options"],
  "properties": {
    "title": {
      "type": "string",
      "description": "Nome comercial completo da bateria",
      "example": "Bateria BYD Battery-Box Premium LVS 12.0 - 12kWh Lítio LFP"
    },
    "subtitle": {
      "type": "string",
      "description": "Subtítulo com especificações resumidas",
      "example": "12kWh Lítio LFP - 48V DC - Modular"
    },
    "handle": {
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
      "example": "bateria-byd-battery-box-premium-lvs-12kwh"
    },
    "description": {
      "type": "string",
      "description": "Descrição detalhada do sistema de armazenamento"
    },
    "status": {
      "type": "string",
      "enum": ["draft", "proposed", "published", "rejected"],
      "default": "published"
    },
    "categories": {
      "type": "array",
      "items": { "type": "object" },
      "example": [
        { "id": "cat_baterias" },
        { "id": "cat_baterias_litio" },
        { "id": "cat_baterias_48v" }
      ]
    },
    "tags": {
      "type": "array",
      "items": { "type": "object" },
      "example": [
        { "id": "tag_byd" },
        { "id": "tag_12kwh" },
        { "id": "tag_lfp" },
        { "id": "tag_modular" }
      ]
    },
    "options": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "values": { "type": "array", "items": { "type": "string" } }
        }
      },
      "example": [
        { "title": "Capacidade", "values": ["12kWh"] },
        { "title": "Tensão", "values": ["48V"] },
        { "title": "Tecnologia", "values": ["Lítio LFP"] }
      ]
    },
    "variants": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["title", "sku", "prices", "options"],
        "properties": {
          "title": { "type": "string" },
          "sku": { "type": "string" },
          "manage_inventory": { "type": "boolean", "default": true },
          "prices": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["currency_code", "amount"],
              "properties": {
                "currency_code": { "type": "string", "example": "BRL" },
                "amount": { "type": "number", "example": 3500000 }
              }
            }
          },
          "options": {
            "type": "object",
            "example": {
              "Capacidade": "12kWh",
              "Tensão": "48V",
              "Tecnologia": "Lítio LFP"
            }
          }
        }
      }
    },
    "metadata": {
      "type": "object",
      "properties": {
        "manufacturer": { "type": "string", "example": "BYD" },
        "model": { "type": "string", "example": "Battery-Box Premium LVS 12.0" },
        "distributor": { "type": "string" },
        "technical_specs": {
          "type": "object",
          "properties": {
            "technology": {
              "type": "string",
              "enum": ["Lítio LFP", "Lítio NMC", "Chumbo-Ácido", "AGM", "Gel"]
            },
            "capacity_kwh": {
              "type": "number",
              "description": "Capacidade nominal em kWh"
            },
            "capacity_ah": {
              "type": "number",
              "description": "Capacidade em Ah"
            },
            "nominal_voltage_v": {
              "type": "number",
              "description": "Tensão nominal em V",
              "enum": [12, 24, 48, 96, 400, 800]
            },
            "usable_capacity_kwh": {
              "type": "number",
              "description": "Capacidade utilizável em kWh"
            },
            "dod_percent": {
              "type": "number",
              "description": "Profundidade de descarga (DoD) em %",
              "minimum": 0,
              "maximum": 100
            },
            "max_charge_power_kw": {
              "type": "number",
              "description": "Potência máxima de carga em kW"
            },
            "max_discharge_power_kw": {
              "type": "number",
              "description": "Potência máxima de descarga em kW"
            },
            "max_charge_current_a": {
              "type": "number",
              "description": "Corrente máxima de carga em A"
            },
            "max_discharge_current_a": {
              "type": "number",
              "description": "Corrente máxima de descarga em A"
            },
            "round_trip_efficiency": {
              "type": "number",
              "description": "Eficiência round-trip em %",
              "minimum": 0,
              "maximum": 100
            },
            "cycle_life": {
              "type": "integer",
              "description": "Vida útil em ciclos"
            },
            "operating_temp_min_c": {
              "type": "number",
              "description": "Temperatura mínima de operação em °C"
            },
            "operating_temp_max_c": {
              "type": "number",
              "description": "Temperatura máxima de operação em °C"
            },
            "dimensions": {
              "type": "object",
              "properties": {
                "width_mm": { "type": "number" },
                "height_mm": { "type": "number" },
                "depth_mm": { "type": "number" },
                "weight_kg": { "type": "number" }
              }
            },
            "modular": {
              "type": "boolean",
              "description": "Se o sistema é modular/expansível"
            },
            "modules_quantity": {
              "type": "integer",
              "description": "Quantidade de módulos inclusos"
            },
            "expandable_to_kwh": {
              "type": "number",
              "description": "Capacidade máxima expansível em kWh"
            },
            "communication": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": ["CAN", "RS485", "Ethernet", "WiFi", "Bluetooth"]
              }
            },
            "compatible_inverters": {
              "type": "array",
              "items": { "type": "string" },
              "description": "Lista de inversores compatíveis"
            },
            "certifications": {
              "type": "array",
              "items": { "type": "string" },
              "example": ["CE", "IEC 62619", "UN38.3", "INMETRO"]
            },
            "warranty_years": {
              "type": "integer",
              "description": "Garantia em anos"
            },
            "warranty_cycles": {
              "type": "integer",
              "description": "Garantia em ciclos"
            }
          }
        }
      }
    }
  }
}
```

## Hierarquia de Categorias

```
cat_baterias (Baterias e Armazenamento)
│
├── cat_baterias_litio (Baterias de Lítio)
│   ├── cat_baterias_lfp (LFP - Lithium Iron Phosphate)
│   └── cat_baterias_nmc (NMC - Nickel Manganese Cobalt)
│
├── cat_baterias_chumbo_acido (Baterias de Chumbo-Ácido)
│   ├── cat_baterias_gel (Gel)
│   └── cat_baterias_agm (AGM)
│
├── Por Tensão
│   ├── cat_baterias_12v
│   ├── cat_baterias_24v
│   ├── cat_baterias_48v
│   └── cat_baterias_alta_tensao (>400V)
│
├── Por Capacidade
│   ├── cat_baterias_0_5kwh (0-5kWh)
│   ├── cat_baterias_5_10kwh (5-10kWh)
│   ├── cat_baterias_10_20kwh (10-20kWh)
│   └── cat_baterias_20kwh_plus (>20kWh)
│
└── Por Aplicação
    ├── cat_baterias_residencial
    ├── cat_baterias_comercial
    └── cat_baterias_industrial
```

## Tags Semânticas

```javascript
const batteryTags = [
  // Fabricantes
  "tag_byd", "tag_pylontech", "tag_lg_chem", "tag_tesla",
  "tag_freedom", "tag_moura", "tag_victron",
  
  // Tecnologia
  "tag_litio", "tag_lfp", "tag_nmc", "tag_chumbo_acido",
  "tag_gel", "tag_agm",
  
  // Capacidade
  "tag_5kwh", "tag_10kwh", "tag_12kwh", "tag_15kwh",
  
  // Tensão
  "tag_12v", "tag_24v", "tag_48v", "tag_400v", "tag_800v",
  
  // Características
  "tag_modular", "tag_expansivel", "tag_alta_tensao",
  "tag_baixa_tensao", "tag_solar", "tag_backup"
]
```

## Inventory Item para Baterias

```typescript
interface BatteryInventoryItem {
  sku: string                    // Ex: "BYD-BBOX-LVS-12KWH"
  title: string                  // Ex: "BYD Battery-Box Premium LVS 12.0"
  description?: string
  requires_shipping: true
  hs_code: string               // Ex: "8507.60.00" (Baterias de Lítio)
  origin_country: string        // Ex: "CN"
  weight: number                // em kg
  length: number                // em mm
  height: number                // em mm
  width: number                 // em mm
  metadata: {
    manufacturer: string
    technology: string
    capacity_kwh: number
    voltage_v: number
    modular: boolean
  }
}
```

## Principais Fabricantes

### Tier 1 (Premium)

- **BYD** - Battery-Box series
- **LG Chem** - RESU series
- **Tesla** - Powerwall
- **Pylontech** - US2000, US3000, Force series

### Tier 2 (Mid-range)

- **Freedom** - Série residencial/comercial
- **Victron Energy** - GX Series
- **Dyness** - PowerBox series

### Tier 3 (Entrada)

- **Moura** - Clean series
- **Heliar** - Solar series

## Workflow: Criar Bateria com Inventory

```typescript
import { 
  createInventoryItemsWorkflow,
  createProductsWorkflow,
  useQueryGraphStep
} from "@medusajs/medusa/core-flows"
import { createWorkflow, transform } from "@medusajs/framework/workflows-sdk"

export const createBatteryProductWorkflow = createWorkflow(
  "create-battery-product",
  () => {
    // 1. Obter Stock Location
    const { data: stockLocations } = useQueryGraphStep({
      entity: "stock_location",
      fields: ["*"],
      filters: { name: "Solfacil Distribution Center" }
    })

    // 2. Criar Inventory Item para a Bateria
    const inventoryItems = createInventoryItemsWorkflow.runAsStep({
      input: {
        items: [
          {
            sku: "BYD-BBOX-LVS-12KWH",
            title: "BYD Battery-Box Premium LVS 12.0 - 12kWh",
            requires_shipping: true,
            hs_code: "8507.60.00",
            origin_country: "CN",
            weight: 125000, // 125kg em gramas
            length: 690,
            height: 1150,
            width: 600,
            location_levels: [
              {
                stocked_quantity: 10,
                location_id: stockLocations[0].id
              }
            ],
            metadata: {
              manufacturer: "BYD",
              technology: "Lítio LFP",
              capacity_kwh: 12.0,
              voltage_v: 48,
              modular: true
            }
          }
        ]
      }
    })

    // 3. Criar Produto da Bateria
    const products = createProductsWorkflow.runAsStep({
      input: {
        products: [
          {
            title: "Bateria BYD Battery-Box Premium LVS 12.0 - 12kWh Lítio LFP",
            subtitle: "12kWh Lítio LFP - 48V DC - Modular",
            handle: "bateria-byd-battery-box-premium-lvs-12kwh",
            description: "Sistema de armazenamento modular BYD Battery-Box Premium LVS com 12kWh de capacidade. Tecnologia Lítio LFP de alta segurança e longa vida útil. Compatível com principais inversores híbridos do mercado.",
            status: "published",
            variants: [
              {
                title: "BYD Battery-Box LVS 12.0 - 12kWh / 48V / LFP",
                sku: "BYD-BBOX-LVS-12KWH",
                prices: [
                  {
                    currency_code: "BRL",
                    amount: 3500000 // R$ 35.000,00
                  }
                ],
                options: {
                  "Capacidade": "12kWh",
                  "Tensão": "48V",
                  "Tecnologia": "Lítio LFP"
                },
                manage_inventory: true
              }
            ],
            options: [
              { title: "Capacidade", values: ["12kWh"] },
              { title: "Tensão", values: ["48V"] },
              { title: "Tecnologia", values: ["Lítio LFP"] }
            ],
            categories: [
              "cat_baterias",
              "cat_baterias_litio",
              "cat_baterias_lfp",
              "cat_baterias_48v"
            ],
            tags: [
              "tag_byd",
              "tag_12kwh",
              "tag_lfp",
              "tag_modular",
              "tag_48v"
            ],
            metadata: {
              manufacturer: "BYD",
              model: "Battery-Box Premium LVS 12.0",
              technical_specs: {
                technology: "Lítio LFP",
                capacity_kwh: 12.0,
                capacity_ah: 250,
                nominal_voltage_v: 48,
                usable_capacity_kwh: 11.04,
                dod_percent: 92,
                max_charge_power_kw: 3.0,
                max_discharge_power_kw: 3.0,
                round_trip_efficiency: 96.5,
                cycle_life: 6000,
                operating_temp_min_c: -10,
                operating_temp_max_c: 50,
                modular: true,
                modules_quantity: 3,
                expandable_to_kwh: 40.0,
                communication: ["CAN", "RS485"],
                compatible_inverters: [
                  "Growatt SPH",
                  "Sungrow SH-RT",
                  "Deye SUN-HG",
                  "Victron MultiPlus"
                ],
                certifications: [
                  "CE",
                  "IEC 62619",
                  "UN38.3"
                ],
                warranty_years: 10,
                warranty_cycles: 6000
              }
            }
          }
        ]
      }
    })

    return { inventoryItems, products }
  }
)
```

## Busca Semântica - Keywords

```javascript
const batterySearchKeywords = [
  // Português
  "bateria solar", "bateria fotovoltaica", "armazenamento energia",
  "backup energia", "bateria hibrida", "bateria off grid",
  "bateria litio", "bateria lfp", "bateria 48v",
  
  // Especificações
  "12kwh", "capacidade bateria", "ciclos vida",
  "profundidade descarga", "dod", "round trip",
  
  // Marcas
  "byd battery box", "pylontech us2000", "lg chem resu",
  "tesla powerwall", "freedom bateria",
  
  // Aplicações
  "bateria residencial", "bateria comercial", "sistema backup",
  "energia reserva", "autonomia", "no break solar"
]
```

## Regras de Negócio

### 1. Compatibilidade com Inversores

- Verificar tensão compatível (12V, 24V, 48V, HV)
- Validar protocolo de comunicação (CAN, RS485)
- Confirmar potência de carga/descarga adequada

### 2. Dimensionamento

- Capacidade mínima: consumo diário × dias de autonomia
- Considerar DoD para capacidade real utilizável
- Margem de segurança: +20-30%

### 3. Preços e Estoque

- Preço por kWh: R$ 2.500 - R$ 3.500 (Lítio)
- Preço por kWh: R$ 800 - R$ 1.200 (Chumbo-Ácido)
- Lead time: 30-45 dias (importadas), 15-20 dias (nacionais)

### 4. Garantia

- Lítio: 10 anos ou 6.000 ciclos
- Chumbo-Ácido: 2-5 anos

## Integração com Kits

Para criar um Kit Híbrido com bateria:

```typescript
{
  product: {
    title: "Kit Solar Híbrido 5.5kWp + Bateria 10kWh",
    variants: [
      {
        inventory_items: [
          { inventory_item_id: "inv_inverter_hybrid_5kw", required_quantity: 1 },
          { inventory_item_id: "inv_panel_550w", required_quantity: 10 },
          { inventory_item_id: "inv_battery_10kwh", required_quantity: 1 },
          { inventory_item_id: "inv_structure", required_quantity: 10 },
          { inventory_item_id: "inv_cables", required_quantity: 100 }
        ]
      }
    ]
  }
}
```

## Métricas de Performance

```typescript
interface BatteryMetrics {
  total_inventory_items: number
  by_technology: {
    lithium_lfp: number
    lithium_nmc: number
    lead_acid: number
  }
  by_voltage: {
    v12: number
    v24: number
    v48: number
    high_voltage: number
  }
  by_capacity: {
    small: number    // 0-5kWh
    medium: number   // 5-10kWh
    large: number    // 10-20kWh
    xlarge: number   // >20kWh
  }
  avg_price_per_kwh: number
  stock_value_total: number
}
```

## Observações Importantes

1. **Transporte Especial**: Baterias de lítio requerem documentação UN38.3
2. **Instalação**: Requer profissional certificado
3. **Reciclagem**: Fabricante deve ter programa de logística reversa
4. **Segurança**: Certificações obrigatórias (CE, INMETRO)
5. **Compatibilidade**: Sempre verificar lista de inversores compatíveis

---

**Agent Version:** 1.0.0  
**Last Updated:** 2025-10-13  
**Status:** ✅ Production Ready
