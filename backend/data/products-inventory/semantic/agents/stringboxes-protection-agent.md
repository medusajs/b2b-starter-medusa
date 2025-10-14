# Agent: String Boxes e Proteção (String Boxes & Protection)

## Contexto e Propósito

Este agente é especializado em **string boxes** (caixas de proteção CC/DC) para sistemas fotovoltaicos. Responsável por gerenciar o inventário de dispositivos de proteção entre painéis solares e inversores.

## Escopo de Produtos

### Tipos de String Box

- **String Box CC (DC)** - Proteção lado painéis
- **String Box CA (AC)** - Proteção lado inversor/rede
- **String Box Híbrida** - CC + CA integrado
- **Combiner Box** - Múltiplas strings de entrada

### Componentes de Proteção

- **Fusíveis** (10A, 15A, 20A, 25A)
- **Disjuntores CC** (16A, 20A, 25A, 32A)
- **DPS** (Dispositivo Proteção Surto) - Classe I, II
- **Chaves Seccionadoras**
- **Varistores** (MOV)

## Schema Medusa.js para String Boxes

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "title": "String Box - Medusa Product Schema",
  "description": "Schema para String Boxes e dispositivos de proteção em Medusa.js",
  "type": "object",
  "required": ["title", "handle", "status", "variants", "options"],
  "properties": {
    "title": {
      "type": "string",
      "description": "Nome comercial completo da string box",
      "example": "String Box CC 4 Entradas 1000V - DPS + Fusíveis 15A"
    },
    "subtitle": {
      "type": "string",
      "description": "Subtítulo com especificações resumidas",
      "example": "4 Entradas - 1000V DC - 15A - IP65"
    },
    "handle": {
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
      "example": "string-box-cc-4-entradas-1000v-15a"
    },
    "description": {
      "type": "string",
      "description": "Descrição detalhada da string box"
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
        { "id": "cat_string_boxes" },
        { "id": "cat_string_box_cc" },
        { "id": "cat_protection_4_entries" }
      ]
    },
    "tags": {
      "type": "array",
      "items": { "type": "object" },
      "example": [
        { "id": "tag_4_entradas" },
        { "id": "tag_1000v" },
        { "id": "tag_15a" },
        { "id": "tag_ip65" }
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
        { "title": "Entradas", "values": ["4"] },
        { "title": "Corrente", "values": ["15A"] },
        { "title": "Tensão Máxima", "values": ["1000V"] }
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
                "amount": { "type": "number", "example": 35000 }
              }
            }
          },
          "options": {
            "type": "object",
            "example": {
              "Entradas": "4",
              "Corrente": "15A",
              "Tensão Máxima": "1000V"
            }
          }
        }
      }
    },
    "metadata": {
      "type": "object",
      "properties": {
        "manufacturer": { "type": "string", "example": "Steca" },
        "model": { "type": "string", "example": "PA SB4010" },
        "distributor": { "type": "string" },
        "technical_specs": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string",
              "enum": ["CC (DC)", "CA (AC)", "Híbrida"]
            },
            "input_entries": {
              "type": "integer",
              "description": "Número de entradas (strings)",
              "minimum": 1,
              "maximum": 24
            },
            "max_voltage_v": {
              "type": "number",
              "description": "Tensão máxima suportada em V",
              "enum": [600, 1000, 1200, 1500]
            },
            "max_current_per_entry_a": {
              "type": "number",
              "description": "Corrente máxima por entrada em A"
            },
            "total_max_current_a": {
              "type": "number",
              "description": "Corrente total máxima em A"
            },
            "fuse_rating_a": {
              "type": "number",
              "description": "Corrente nominal dos fusíveis em A",
              "enum": [10, 15, 20, 25, 32]
            },
            "fuse_type": {
              "type": "string",
              "enum": ["gPV", "Classe CC", "Cerâmico"]
            },
            "surge_protection": {
              "type": "object",
              "properties": {
                "included": { "type": "boolean" },
                "type_class": {
                  "type": "string",
                  "enum": ["Classe I", "Classe II", "Classe I+II"]
                },
                "mcov_v": {
                  "type": "number",
                  "description": "Tensão operação contínua máxima (MCOV)"
                },
                "iimp_ka": {
                  "type": "number",
                  "description": "Corrente de impulso (Classe I)"
                },
                "in_ka": {
                  "type": "number",
                  "description": "Corrente nominal de descarga (Classe II)"
                }
              }
            },
            "disconnect_switch": {
              "type": "boolean",
              "description": "Possui chave seccionadora"
            },
            "circuit_breaker": {
              "type": "boolean",
              "description": "Possui disjuntor"
            },
            "enclosure_material": {
              "type": "string",
              "enum": ["Plástico ABS", "Policarbonato", "Metal (IP65)", "Aço Inox"]
            },
            "protection_degree": {
              "type": "string",
              "pattern": "^IP[0-9]{2}$",
              "example": "IP65"
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
            "mounting_type": {
              "type": "string",
              "enum": ["Parede", "Trilho DIN", "Embutir"]
            },
            "certifications": {
              "type": "array",
              "items": { "type": "string" },
              "example": ["IEC 60947-2", "IEC 61643-11", "NR10", "INMETRO"]
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
            "max_system_power_kw": {
              "type": "number",
              "description": "Potência máxima do sistema em kW"
            },
            "recommended_panel_power_w": {
              "type": "array",
              "items": { "type": "number" },
              "description": "Potências de painéis recomendadas"
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
cat_string_boxes (String Boxes e Proteção)
│
├── Por Tipo
│   ├── cat_string_box_cc (String Box CC/DC)
│   ├── cat_string_box_ca (String Box CA/AC)
│   └── cat_string_box_hybrid (String Box Híbrida)
│
├── Por Número de Entradas
│   ├── cat_protection_2_entries (2 Entradas)
│   ├── cat_protection_4_entries (4 Entradas)
│   ├── cat_protection_6_entries (6 Entradas)
│   ├── cat_protection_8_entries (8 Entradas)
│   └── cat_protection_12_plus_entries (12+ Entradas)
│
├── Por Tensão
│   ├── cat_string_box_600v (até 600V)
│   ├── cat_string_box_1000v (até 1000V)
│   └── cat_string_box_1500v (até 1500V)
│
├── Por Corrente
│   ├── cat_string_box_10a (10A)
│   ├── cat_string_box_15a (15A)
│   ├── cat_string_box_20a (20A)
│   └── cat_string_box_25a (25A+)
│
└── Componentes
    ├── cat_fusibles_cc (Fusíveis CC)
    ├── cat_dps (DPS - Dispositivos Proteção Surto)
    ├── cat_circuit_breakers_cc (Disjuntores CC)
    └── cat_disconnect_switches (Chaves Seccionadoras)
```

## Tags Semânticas

```javascript
const stringBoxTags = [
  // Fabricantes
  "tag_steca", "tag_weg", "tag_phoenix_contact", "tag_weidmuller",
  "tag_schneider", "tag_abb",
  
  // Entradas
  "tag_2_entradas", "tag_4_entradas", "tag_6_entradas",
  "tag_8_entradas", "tag_12_entradas",
  
  // Corrente
  "tag_10a", "tag_15a", "tag_20a", "tag_25a", "tag_32a",
  
  // Tensão
  "tag_600v", "tag_1000v", "tag_1200v", "tag_1500v",
  
  // Proteção
  "tag_dps", "tag_fusivel", "tag_disjuntor", "tag_seccionador",
  
  // Características
  "tag_ip65", "tag_outdoor", "tag_classe_i", "tag_classe_ii"
]
```

## Workflow: Criar String Box com Inventory

```typescript
import { 
  createInventoryItemsWorkflow,
  createProductsWorkflow,
  useQueryGraphStep
} from "@medusajs/medusa/core-flows"

export const createStringBoxProductWorkflow = createWorkflow(
  "create-string-box-product",
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
            sku: "STECA-SB4010-1000V-15A",
            title: "String Box CC 4 Entradas 1000V 15A - Steca",
            requires_shipping: true,
            hs_code: "8536.90.90",
            origin_country: "DE",
            weight: 3500, // 3.5kg
            length: 450,
            height: 350,
            width: 200,
            location_levels: [
              {
                stocked_quantity: 50,
                location_id: stockLocations[0].id
              }
            ],
            metadata: {
              manufacturer: "Steca",
              input_entries: 4,
              max_voltage_v: 1000,
              fuse_rating_a: 15
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
            title: "String Box CC 4 Entradas 1000V - DPS + Fusíveis 15A",
            subtitle: "4 Entradas - 1000V DC - 15A - IP65",
            handle: "string-box-cc-4-entradas-1000v-15a",
            description: "String Box CC com 4 entradas, tensão máxima 1000V DC, fusíveis gPV 15A por entrada, DPS Classe II integrado. Caixa em policarbonato IP65 para instalação externa. Ideal para sistemas até 10kWp.",
            status: "published",
            variants: [
              {
                title: "String Box 4E/1000V/15A - IP65",
                sku: "STECA-SB4010-1000V-15A",
                prices: [
                  {
                    currency_code: "BRL",
                    amount: 35000 // R$ 350,00
                  }
                ],
                options: {
                  "Entradas": "4",
                  "Corrente": "15A",
                  "Tensão Máxima": "1000V"
                },
                manage_inventory: true
              }
            ],
            options: [
              { title: "Entradas", values: ["4"] },
              { title: "Corrente", values: ["15A"] },
              { title: "Tensão Máxima", values: ["1000V"] }
            ],
            categories: [
              "cat_string_boxes",
              "cat_string_box_cc",
              "cat_protection_4_entries",
              "cat_string_box_1000v"
            ],
            tags: [
              "tag_steca",
              "tag_4_entradas",
              "tag_15a",
              "tag_1000v",
              "tag_dps",
              "tag_ip65"
            ],
            metadata: {
              manufacturer: "Steca",
              model: "PA SB4010",
              technical_specs: {
                type: "CC (DC)",
                input_entries: 4,
                max_voltage_v: 1000,
                max_current_per_entry_a: 15,
                total_max_current_a: 60,
                fuse_rating_a: 15,
                fuse_type: "gPV",
                surge_protection: {
                  included: true,
                  type_class: "Classe II",
                  mcov_v: 750,
                  in_ka: 20
                },
                disconnect_switch: true,
                circuit_breaker: false,
                enclosure_material: "Policarbonato",
                protection_degree: "IP65",
                operating_temp_min_c: -25,
                operating_temp_max_c: 60,
                dimensions: {
                  width_mm: 450,
                  height_mm: 350,
                  depth_mm: 200,
                  weight_kg: 3.5
                },
                mounting_type: "Parede",
                certifications: [
                  "IEC 60947-2",
                  "IEC 61643-11",
                  "NR10"
                ],
                warranty_years: 5
              },
              compatibility: {
                max_system_power_kw: 10,
                recommended_panel_power_w: [450, 500, 550]
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

- **Steca** (Alemanha) - PA SB series
- **Phoenix Contact** - COMBINER-BOX series
- **Weidmüller** - PV series
- **ABB** - String Combiner Box
- **Schneider Electric** - ConextTM series

### Nacional (Brasil)

- **WEG** - String Box series
- **Steck** - SB series
- **Clamper** - Proteção solar

## Dimensionamento de String Box

### Fórmula Básica

```typescript
interface StringBoxSizing {
  // Corrente por entrada
  isc_panel: number                    // Corrente curto-circuito painel (A)
  safety_factor: number = 1.25         // Fator segurança
  min_fuse_rating: number              // isc_panel × safety_factor
  
  // Número de entradas
  total_panels: number
  panels_per_string: number
  strings_count: number                // total_panels / panels_per_string
  
  // Tensão máxima
  voc_panel: number                    // Tensão circuito aberto painel (V)
  temp_coefficient: number = -0.003    // Coeficiente temperatura
  min_temp_c: number = -10             // Temperatura mínima local
  max_voltage: number                  // voc_panel × panels_per_string × (1 + temp_coefficient × (25 - min_temp_c))
  
  // String box recomendada
  recommended_entries: number          // strings_count (arredondado para cima)
  recommended_fuse_a: number           // min_fuse_rating (arredondado para cima para valor padrão)
  recommended_max_v: number            // max_voltage (arredondado para cima: 600, 1000, 1500)
}
```

### Exemplo Prático

```typescript
// Sistema: 20 painéis 550W
const sizing: StringBoxSizing = {
  isc_panel: 13.87,
  safety_factor: 1.25,
  min_fuse_rating: 13.87 * 1.25, // 17.34A → Fusível 20A
  
  total_panels: 20,
  panels_per_string: 10,
  strings_count: 2,
  
  voc_panel: 49.5,
  temp_coefficient: -0.003,
  min_temp_c: -10,
  max_voltage: 49.5 * 10 * (1 + (-0.003 * (25 - (-10)))), // 547V → String Box 1000V
  
  recommended_entries: 2,
  recommended_fuse_a: 20,
  recommended_max_v: 1000
}
// Resultado: String Box 2 Entradas, 1000V, Fusível 20A
```

## Integração com Kits

```typescript
{
  product: {
    title: "Kit Solar 5.5kWp",
    variants: [
      {
        inventory_items: [
          { inventory_item_id: "inv_inverter_5kw", required_quantity: 1 },
          { inventory_item_id: "inv_panel_550w", required_quantity: 10 },
          { inventory_item_id: "inv_string_box_2e_1000v_20a", required_quantity: 1 }, // String Box
          { inventory_item_id: "inv_structure", required_quantity: 10 },
          { inventory_item_id: "inv_cables_6mm_red", required_quantity: 50 },
          { inventory_item_id: "inv_cables_6mm_black", required_quantity: 50 }
        ]
      }
    ]
  }
}
```

## Busca Semântica - Keywords

```javascript
const stringBoxSearchKeywords = [
  // Português
  "string box", "caixa proteção solar", "proteção cc",
  "fusível solar", "dps fotovoltaico", "combiner box",
  
  // Especificações
  "4 entradas", "6 entradas", "1000v", "15a", "20a",
  "fusível gpv", "disjuntor cc", "chave seccionadora",
  
  // Proteção
  "dispositivo proteção surto", "classe ii", "ip65",
  "proteção string", "proteção painel",
  
  // Aplicações
  "proteção gerador fotovoltaico", "segurança solar",
  "nr10", "norma técnica"
]
```

## Regras de Negócio

### 1. Seleção de Fusíveis

- Corrente fusível ≥ 1.25 × Isc do painel
- Fusível tipo gPV (específico para fotovoltaico)
- Tensão fusível ≥ tensão máxima string

### 2. DPS (Dispositivo Proteção Surto)

- **Classe I**: Proteção contra raios diretos (50-100kA)
- **Classe II**: Proteção contra surtos induzidos (20-40kA)
- Obrigatório em sistemas expostos

### 3. Preços

- String Box 2E (básica): R$ 200 - R$ 300
- String Box 4E + DPS: R$ 350 - R$ 500
- String Box 8E + DPS: R$ 600 - R$ 900
- String Box 12E comercial: R$ 1.200 - R$ 1.800

### 4. Normas

- **IEC 60947-2**: Disjuntores CC
- **IEC 61643-11**: DPS para sistemas fotovoltaicos
- **NR10**: Segurança em instalações elétricas

## Métricas de Performance

```typescript
interface StringBoxMetrics {
  total_inventory_items: number
  by_entries: {
    entries_2: number
    entries_4: number
    entries_6_8: number
    entries_12_plus: number
  }
  by_voltage: {
    v600: number
    v1000: number
    v1500: number
  }
  with_surge_protection: number
  avg_price_per_entry: number
}
```

## Observações Importantes

1. **Obrigatório**: String Box em sistemas >2kWp (NBR 5410)
2. **DPS**: Recomendado para todas as instalações externas
3. **IP65**: Mínimo para instalação externa
4. **Manutenção**: Inspeção anual dos fusíveis e DPS
5. **Aterramento**: Essencial para funcionamento do DPS

---

**Agent Version:** 1.0.0  
**Last Updated:** 2025-01-13  
**Status:** ✅ Production Ready
