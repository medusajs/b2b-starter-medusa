# Agent: Carregadores de Veículos Elétricos (EV Chargers)

## Contexto e Propósito

Este agente é especializado em **carregadores de veículos elétricos (EV Chargers)** integrados a sistemas fotovoltaicos. Responsável por gerenciar o inventário, especificações técnicas e integração com o Medusa.js Product Module e Inventory Module.

## Escopo de Produtos

### Categorias de Carregadores

- **Wallbox Residencial** (até 11kW)
- **Wallbox Comercial** (11kW - 22kW)
- **Carregadores Trifásicos** (22kW - 50kW)
- **Carregadores DC Rápidos** (>50kW)

### Tipos de Conectores

- **Type 1** (SAE J1772) - Padrão americano/asiático
- **Type 2** (Mennekes/IEC 62196) - Padrão europeu/brasileiro
- **CCS Combo 1** (Type 1 + DC)
- **CCS Combo 2** (Type 2 + DC)
- **CHAdeMO** - Padrão japonês DC
- **GB/T** - Padrão chinês

### Aplicações

- Residencial (garagem, carport)
- Comercial (empresas, shopping centers)
- Frotas (táxis, delivery)
- Estacionamentos públicos

## Schema Medusa.js para Carregadores EV

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "title": "Carregador de Veículo Elétrico - Medusa Product Schema",
  "description": "Schema para EV Chargers em Medusa.js",
  "type": "object",
  "required": ["title", "handle", "status", "variants", "options"],
  "properties": {
    "title": {
      "type": "string",
      "description": "Nome comercial completo do carregador",
      "example": "Wallbox Pulsar Plus 11kW Type 2 - Carregador EV Inteligente"
    },
    "subtitle": {
      "type": "string",
      "description": "Subtítulo com especificações resumidas",
      "example": "11kW AC - Type 2 - WiFi/Bluetooth - Modo Solar"
    },
    "handle": {
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
      "example": "wallbox-pulsar-plus-11kw-type2"
    },
    "description": {
      "type": "string",
      "description": "Descrição detalhada do carregador"
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
        { "id": "cat_ev_chargers" },
        { "id": "cat_ev_wallbox" },
        { "id": "cat_ev_11kw" }
      ]
    },
    "tags": {
      "type": "array",
      "items": { "type": "object" },
      "example": [
        { "id": "tag_wallbox" },
        { "id": "tag_11kw" },
        { "id": "tag_type2" },
        { "id": "tag_solar_mode" }
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
        { "title": "Potência", "values": ["11kW"] },
        { "title": "Conector", "values": ["Type 2"] },
        { "title": "Conectividade", "values": ["WiFi + Bluetooth"] }
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
                "amount": { "type": "number", "example": 450000 }
              }
            }
          },
          "options": {
            "type": "object",
            "example": {
              "Potência": "11kW",
              "Conector": "Type 2",
              "Conectividade": "WiFi + Bluetooth"
            }
          }
        }
      }
    },
    "metadata": {
      "type": "object",
      "properties": {
        "manufacturer": { "type": "string", "example": "Wallbox" },
        "model": { "type": "string", "example": "Pulsar Plus" },
        "distributor": { "type": "string" },
        "technical_specs": {
          "type": "object",
          "properties": {
            "charger_type": {
              "type": "string",
              "enum": ["AC Level 1", "AC Level 2", "DC Fast Charger"]
            },
            "charging_power_kw": {
              "type": "number",
              "description": "Potência de carregamento em kW",
              "enum": [3.7, 7.4, 11, 22, 50, 100, 150, 350]
            },
            "max_current_a": {
              "type": "number",
              "description": "Corrente máxima em Amperes"
            },
            "voltage_range": {
              "type": "object",
              "properties": {
                "min_v": { "type": "number" },
                "max_v": { "type": "number" }
              }
            },
            "phases": {
              "type": "integer",
              "enum": [1, 3],
              "description": "Monofásico (1) ou Trifásico (3)"
            },
            "connector_type": {
              "type": "string",
              "enum": ["Type 1", "Type 2", "CCS Combo 1", "CCS Combo 2", "CHAdeMO", "GB/T"]
            },
            "cable_length_m": {
              "type": "number",
              "description": "Comprimento do cabo em metros"
            },
            "cable_attached": {
              "type": "boolean",
              "description": "Se o cabo é fixo ou socket apenas"
            },
            "efficiency_percent": {
              "type": "number",
              "description": "Eficiência de conversão em %",
              "minimum": 90,
              "maximum": 100
            },
            "solar_mode": {
              "type": "boolean",
              "description": "Suporte para modo solar (carrega apenas com excedente)"
            },
            "load_balancing": {
              "type": "boolean",
              "description": "Balanceamento dinâmico de carga"
            },
            "smart_features": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "WiFi",
                  "Bluetooth",
                  "4G/LTE",
                  "Ethernet",
                  "RFID",
                  "APP Mobile",
                  "OCPP 1.6",
                  "OCPP 2.0",
                  "API REST",
                  "Energy Monitoring",
                  "Timer Schedule"
                ]
              }
            },
            "protection_degree": {
              "type": "string",
              "pattern": "^IP[0-9]{2}$",
              "example": "IP54"
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
            "installation_type": {
              "type": "string",
              "enum": ["Wall Mount", "Pole Mount", "Floor Stand"]
            },
            "certifications": {
              "type": "array",
              "items": { "type": "string" },
              "example": ["CE", "IEC 61851-1", "INMETRO", "FCC"]
            },
            "warranty_years": {
              "type": "integer",
              "description": "Garantia em anos"
            }
          }
        },
        "compatibility": {
          "type": "object",
          "properties": {
            "electric_vehicles": {
              "type": "array",
              "items": { "type": "string" },
              "description": "Lista de veículos compatíveis"
            },
            "inverter_integration": {
              "type": "array",
              "items": { "type": "string" },
              "description": "Inversores solares compatíveis para modo solar"
            }
          }
        }
      }
    }
  }
}
```

## Hierarquia de Categorias

```tsx
cat_ev_chargers (Carregadores EV)
│
├── Por Tipo
│   ├── cat_ev_wallbox (Wallbox)
│   ├── cat_ev_portable (Portátil)
│   ├── cat_ev_dc_fast (DC Rápido)
│   └── cat_ev_ultra_fast (Ultra-Rápido >150kW)
│
├── Por Potência
│   ├── cat_ev_3_7kw (3.7kW)
│   ├── cat_ev_7_4kw (7.4kW)
│   ├── cat_ev_11kw (11kW)
│   ├── cat_ev_22kw (22kW)
│   └── cat_ev_fast (>50kW)
│
├── Por Conector
│   ├── cat_ev_type1 (Type 1 - J1772)
│   ├── cat_ev_type2 (Type 2 - Mennekes)
│   ├── cat_ev_ccs (CCS Combo)
│   └── cat_ev_chademo (CHAdeMO)
│
├── Por Aplicação
│   ├── cat_ev_residential (Residencial)
│   ├── cat_ev_commercial (Comercial)
│   └── cat_ev_public (Público)
│
└── Recursos Especiais
    ├── cat_ev_solar_mode (Modo Solar)
    ├── cat_ev_smart (Inteligente/WiFi)
    └── cat_ev_load_balancing (Balanceamento de Carga)
```

## Tags Semânticas

```javascript
const evChargerTags = [
  // Fabricantes
  "tag_wallbox", "tag_weg", "tag_intelbras", "tag_schneider",
  "tag_abb", "tag_tesla", "tag_legrand",
  
  // Potência
  "tag_3_7kw", "tag_7_4kw", "tag_11kw", "tag_22kw",
  
  // Conectores
  "tag_type1", "tag_type2", "tag_ccs", "tag_chademo",
  
  // Recursos
  "tag_solar_mode", "tag_wifi", "tag_bluetooth", "tag_rfid",
  "tag_load_balancing", "tag_smart_charging", "tag_ocpp",
  
  // Aplicações
  "tag_residential", "tag_commercial", "tag_fleet"
]
```

## Workflow: Criar Carregador EV com Inventory

```typescript
import { 
  createInventoryItemsWorkflow,
  createProductsWorkflow,
  useQueryGraphStep
} from "@medusajs/medusa/core-flows"

export const createEVChargerProductWorkflow = createWorkflow(
  "create-ev-charger-product",
  () => {
    // 1. Stock Location
    const { data: stockLocations } = useQueryGraphStep({
      entity: "stock_location",
      fields: ["*"],
      filters: { name: "Main Warehouse" }
    })

    // 2. Criar Inventory Item
    const inventoryItems = createInventoryItemsWorkflow.runAsStep({
      input: {
        items: [
          {
            sku: "WALLBOX-PULSAR-PLUS-11KW-T2",
            title: "Wallbox Pulsar Plus 11kW Type 2",
            requires_shipping: true,
            hs_code: "8504.40.90",
            origin_country: "ES",
            weight: 8000, // 8kg
            length: 165,
            height: 406,
            width: 193,
            location_levels: [
              {
                stocked_quantity: 25,
                location_id: stockLocations[0].id
              }
            ],
            metadata: {
              manufacturer: "Wallbox",
              charging_power_kw: 11,
              connector_type: "Type 2",
              solar_mode: true
            }
          }
        ]
      }
    })

    // 3. Criar Produto
    const products = createProductsWorkflow.runAsStep({
      input: {
        products: [
          {
            title: "Wallbox Pulsar Plus 11kW Type 2 - Carregador EV Inteligente",
            subtitle: "11kW AC - Type 2 - WiFi/Bluetooth - Modo Solar",
            handle: "wallbox-pulsar-plus-11kw-type2",
            description: "Carregador inteligente Wallbox Pulsar Plus com 11kW de potência. Conector Type 2, conectividade WiFi e Bluetooth, modo solar para carregamento com excedente fotovoltaico. Aplicativo móvel completo para monitoramento e agendamento.",
            status: "published",
            variants: [
              {
                title: "Wallbox Pulsar Plus 11kW / Type 2 / WiFi+BT",
                sku: "WALLBOX-PULSAR-PLUS-11KW-T2",
                prices: [
                  {
                    currency_code: "BRL",
                    amount: 450000 // R$ 4.500,00
                  }
                ],
                options: {
                  "Potência": "11kW",
                  "Conector": "Type 2",
                  "Conectividade": "WiFi + Bluetooth"
                },
                manage_inventory: true
              }
            ],
            options: [
              { title: "Potência", values: ["11kW"] },
              { title: "Conector", values: ["Type 2"] },
              { title: "Conectividade", values: ["WiFi + Bluetooth"] }
            ],
            categories: [
              "cat_ev_chargers",
              "cat_ev_wallbox",
              "cat_ev_11kw",
              "cat_ev_solar_mode"
            ],
            tags: [
              "tag_wallbox",
              "tag_11kw",
              "tag_type2",
              "tag_solar_mode",
              "tag_wifi",
              "tag_smart_charging"
            ],
            metadata: {
              manufacturer: "Wallbox",
              model: "Pulsar Plus",
              technical_specs: {
                charger_type: "AC Level 2",
                charging_power_kw: 11,
                max_current_a: 16,
                voltage_range: {
                  min_v: 220,
                  max_v: 240
                },
                phases: 1,
                connector_type: "Type 2",
                cable_length_m: 7,
                cable_attached: true,
                efficiency_percent: 95,
                solar_mode: true,
                load_balancing: true,
                smart_features: [
                  "WiFi",
                  "Bluetooth",
                  "APP Mobile",
                  "OCPP 1.6",
                  "Energy Monitoring",
                  "Timer Schedule"
                ],
                protection_degree: "IP54",
                operating_temp_min_c: -25,
                operating_temp_max_c: 40,
                dimensions: {
                  width_mm: 165,
                  height_mm: 406,
                  depth_mm: 193,
                  weight_kg: 8
                },
                installation_type: "Wall Mount",
                certifications: [
                  "CE",
                  "IEC 61851-1",
                  "INMETRO"
                ],
                warranty_years: 2
              },
              compatibility: {
                electric_vehicles: [
                  "BMW i3",
                  "Nissan Leaf",
                  "Tesla Model 3 (adaptador)",
                  "BYD Dolphin",
                  "Chevrolet Bolt"
                ],
                inverter_integration: [
                  "Fronius Symo",
                  "SMA Sunny Boy",
                  "Growatt",
                  "Sungrow"
                ]
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

## Principais Fabricantes

### Internacional

- **Wallbox** (Espanha) - Pulsar, Commander series
- **ABB** - Terra series
- **Schneider Electric** - EVlink series
- **Tesla** - Wall Connector
- **Siemens** - VersiCharge series

### Nacional (Brasil)

- **WEG** - W-Line EV Charger
- **Intelbras** - Carregador EV series
- **Legrand** - Green'Up series

## Integração com Sistema Solar

### Modo Solar (Solar Mode)

```typescript
interface SolarModeConfig {
  enable_solar_mode: boolean
  min_surplus_power_kw: number      // Mínimo de excedente para iniciar
  max_grid_consumption_kw: number   // Máximo permitido da rede
  inverter_communication: {
    protocol: "Modbus TCP" | "Modbus RTU" | "SunSpec"
    ip_address?: string
    port?: number
  }
  charging_strategy: "surplus_only" | "surplus_priority" | "time_of_use"
}
```

### Workflow: EV Charger + Solar

```typescript
// Kit Solar + EV Charger
{
  product: {
    title: "Kit Solar 10kWp + Carregador EV 11kW",
    variants: [
      {
        inventory_items: [
          { inventory_item_id: "inv_inverter_10kw", required_quantity: 1 },
          { inventory_item_id: "inv_panel_550w", required_quantity: 18 },
          { inventory_item_id: "inv_ev_charger_11kw", required_quantity: 1 },
          { inventory_item_id: "inv_structure", required_quantity: 18 },
          { inventory_item_id: "inv_energy_meter", required_quantity: 1 }
        ]
      }
    ]
  }
}
```

## Busca Semântica - Keywords

```javascript
const evChargerSearchKeywords = [
  // Português
  "carregador veículo elétrico", "carregador ev", "wallbox",
  "carregador carro elétrico", "estação carregamento",
  
  // Especificações
  "11kw", "22kw", "type 2", "mennekes", "trifásico",
  
  // Recursos
  "modo solar", "carregamento solar", "wifi", "inteligente",
  "app mobile", "agendamento", "monitoramento",
  
  // Marcas
  "wallbox pulsar", "weg ev", "intelbras carregador",
  
  // Aplicações
  "residencial", "comercial", "frota", "condomínio"
]
```

## Regras de Negócio

### 1. Dimensionamento

- **3.7kW**: Carregamento lento (8-10h para 40kWh)
- **7.4kW**: Carregamento noturno (4-6h para 40kWh)
- **11kW**: Carregamento padrão (2-4h para 40kWh)
- **22kW**: Carregamento rápido (1-2h para 40kWh)

### 2. Instalação Elétrica

- 11kW: Circuito 220V monofásico (50A) ou bifásico (32A)
- 22kW: Circuito 380V trifásico (32A)
- Disjuntor diferencial residual (DR) obrigatório
- Aterramento adequado

### 3. Integração Solar

- Inversor com medidor bidirecional
- Protocolo Modbus ou SunSpec
- Lógica de controle de excedente

### 4. Preços

- Wallbox 7.4kW: R$ 2.500 - R$ 3.500
- Wallbox 11kW: R$ 4.000 - R$ 6.000
- Wallbox 22kW: R$ 8.000 - R$ 12.000
- DC Fast Charger: R$ 80.000+

## Métricas de Performance

```typescript
interface EVChargerMetrics {
  total_chargers: number
  by_power: {
    kw_3_7: number
    kw_7_4: number
    kw_11: number
    kw_22: number
  }
  by_features: {
    solar_mode: number
    smart_charging: number
    load_balancing: number
  }
  avg_price_per_kw: number
  solar_integration_rate: number
}
```

## Observações Importantes

1. **Normas**: NBR IEC 61851-1 (carregamento de VE)
2. **Instalação**: Eletricista certificado + projeto elétrico
3. **Certificação**: INMETRO obrigatório para comercialização
4. **Garantia**: Mínimo 2 anos (padrão europeu/brasileiro)
5. **Conectividade**: WiFi/4G para monitoramento remoto

---

**Agent Version:** 1.0.0  
**Last Updated:** 2025-01-13  
**Status:** ✅ Production Ready
