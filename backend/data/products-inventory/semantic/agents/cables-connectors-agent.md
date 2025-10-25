# Agent: Cabos e Conectores Fotovoltaicos (Cables & Connectors)

## Contexto e Propósito

Este agente é especializado em **cabos elétricos e conectores** para sistemas fotovoltaicos. Responsável por gerenciar o inventário de cabos CC/CA, conectores MC4, terminais e acessórios de conexão.

## Escopo de Produtos

### Tipos de Cabos

- **Cabos Fotovoltaicos CC** (1,5mm² - 10mm²)
- **Cabos CA (Energia)** (2,5mm² - 16mm²)
- **Cabos Flexíveis** (Solax/Energyflex)
- **Cabos para Aterramento** (Verde/Verde-Amarelo)

### Conectores e Acessórios

- **Conectores MC4** (Macho/Fêmea)
- **Y-Branches** (Paralelo 2-1, 3-1)
- **Extensões MC4**
- **Ferramentas** (Alicate crimpagem, extrator MC4)
- **Terminais** (Pré-isolados, Anel)

## Schema Medusa.js para Cabos

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "title": "Cabo/Conector Fotovoltaico - Medusa Product Schema",
  "description": "Schema para cabos e conectores em Medusa.js",
  "type": "object",
  "required": ["title", "handle", "status", "variants", "options"],
  "properties": {
    "title": {
      "type": "string",
      "description": "Nome comercial completo do cabo/conector",
      "example": "Cabo Solar Fotovoltaico 6mm² - Preto - Solax (Metro)"
    },
    "subtitle": {
      "type": "string",
      "description": "Subtítulo com especificações resumidas",
      "example": "6mm² - 1800V DC - Dupla Isolação - UV Resistente"
    },
    "handle": {
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
      "example": "cabo-solar-6mm-preto-metro"
    },
    "description": {
      "type": "string",
      "description": "Descrição detalhada do cabo/conector"
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
        { "id": "cat_cables" },
        { "id": "cat_cables_pv_dc" },
        { "id": "cat_cables_6mm" }
      ]
    },
    "tags": {
      "type": "array",
      "items": { "type": "object" },
      "example": [
        { "id": "tag_6mm" },
        { "id": "tag_preto" },
        { "id": "tag_dupla_isolacao" },
        { "id": "tag_uv_resistente" }
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
        { "title": "Bitola", "values": ["6mm²"] },
        { "title": "Cor", "values": ["Preto"] },
        { "title": "Unidade", "values": ["Metro"] }
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
                "amount": { "type": "number", "example": 650 }
              }
            }
          },
          "options": {
            "type": "object",
            "example": {
              "Bitola": "6mm²",
              "Cor": "Preto",
              "Unidade": "Metro"
            }
          }
        }
      }
    },
    "metadata": {
      "type": "object",
      "properties": {
        "manufacturer": { "type": "string", "example": "Solax" },
        "model": { "type": "string", "example": "Energyflex 6mm²" },
        "distributor": { "type": "string" },
        "product_type": {
          "type": "string",
          "enum": ["Cabo CC (DC)", "Cabo CA (AC)", "Conector", "Acessório", "Ferramenta"]
        },
        "technical_specs": {
          "type": "object",
          "properties": {
            "cross_section_mm2": {
              "type": "number",
              "description": "Seção transversal em mm²",
              "enum": [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50]
            },
            "conductor_material": {
              "type": "string",
              "enum": ["Cobre nu", "Cobre estanhado"]
            },
            "conductor_class": {
              "type": "integer",
              "description": "Classe do condutor (flexibilidade)",
              "enum": [4, 5, 6]
            },
            "stranding": {
              "type": "string",
              "description": "Formação do condutor",
              "example": "133x0.25mm"
            },
            "insulation_type": {
              "type": "string",
              "enum": ["XLPE", "EPR", "PVC", "Dupla XLPE"]
            },
            "insulation_thickness_mm": {
              "type": "number",
              "description": "Espessura isolação em mm"
            },
            "sheath_material": {
              "type": "string",
              "description": "Material da capa externa"
            },
            "max_voltage_v": {
              "type": "number",
              "description": "Tensão máxima em V",
              "enum": [600, 1000, 1200, 1500, 1800]
            },
            "max_current_a": {
              "type": "number",
              "description": "Corrente máxima admissível em A"
            },
            "temperature_rating_c": {
              "type": "number",
              "description": "Temperatura máxima operação em °C",
              "enum": [90, 105, 120]
            },
            "uv_resistance": {
              "type": "boolean",
              "description": "Resistente a raios UV"
            },
            "halogen_free": {
              "type": "boolean",
              "description": "Livre de halogênios (LSZH)"
            },
            "flame_retardant": {
              "type": "boolean",
              "description": "Retardante de chamas"
            },
            "outdoor_rated": {
              "type": "boolean",
              "description": "Uso externo"
            },
            "color": {
              "type": "string",
              "enum": ["Preto", "Vermelho", "Azul", "Verde", "Verde-Amarelo", "Branco"]
            },
            "sold_by": {
              "type": "string",
              "enum": ["Metro", "Rolo 100m", "Rolo 500m", "Unidade", "Par"]
            },
            "certifications": {
              "type": "array",
              "items": { "type": "string" },
              "example": ["TÜV", "EN 50618", "IEC 62930", "INMETRO"]
            },
            "warranty_years": {
              "type": "integer",
              "description": "Garantia em anos"
            }
          }
        },
        "connector_specs": {
          "type": "object",
          "description": "Especificações para conectores MC4, Y-branches, etc.",
          "properties": {
            "connector_type": {
              "type": "string",
              "enum": ["MC4 Macho", "MC4 Fêmea", "MC4 Par", "Y-Branch", "Extensão"]
            },
            "max_voltage_v": { "type": "number" },
            "max_current_a": { "type": "number" },
            "cable_cross_section_range_mm2": {
              "type": "object",
              "properties": {
                "min": { "type": "number" },
                "max": { "type": "number" }
              }
            },
            "contact_resistance_mohm": {
              "type": "number",
              "description": "Resistência de contato em mΩ"
            },
            "protection_degree": { "type": "string" },
            "material": {
              "type": "string",
              "example": "PPO - Óxido de Polifenileno"
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
cat_cables (Cabos e Conectores)
│
├── Cabos CC (DC)
│   ├── cat_cables_pv_dc (Cabos Fotovoltaicos)
│   │   ├── cat_cables_1_5mm (1,5mm²)
│   │   ├── cat_cables_2_5mm (2,5mm²)
│   │   ├── cat_cables_4mm (4mm²)
│   │   ├── cat_cables_6mm (6mm²)
│   │   └── cat_cables_10mm (10mm²)
│   └── cat_cables_grounding (Cabos Aterramento)
│
├── Cabos CA (AC)
│   ├── cat_cables_ac_power (Cabos Energia)
│   └── cat_cables_ac_signal (Cabos Sinal/Dados)
│
├── Conectores
│   ├── cat_connectors_mc4 (Conectores MC4)
│   │   ├── cat_mc4_male (MC4 Macho)
│   │   ├── cat_mc4_female (MC4 Fêmea)
│   │   └── cat_mc4_pair (MC4 Par)
│   ├── cat_y_branches (Y-Branches)
│   └── cat_extensions (Extensões)
│
└── Acessórios
    ├── cat_tools (Ferramentas)
    ├── cat_terminals (Terminais)
    └── cat_cable_ties (Abraçadeiras/Amarrações)
```

## Tags Semânticas

```javascript
const cableTags = [
  // Fabricantes
  "tag_solax", "tag_prysmian", "tag_nexans", "tag_condupar",
  "tag_cobrecom", "tag_staubli", "tag_weidmuller",
  
  // Bitolas
  "tag_1_5mm", "tag_2_5mm", "tag_4mm", "tag_6mm",
  "tag_10mm", "tag_16mm",
  
  // Cores
  "tag_preto", "tag_vermelho", "tag_azul", "tag_verde",
  
  // Características
  "tag_dupla_isolacao", "tag_uv_resistente", "tag_flexivel",
  "tag_xlpe", "tag_epr", "tag_halogen_free",
  
  // Conectores
  "tag_mc4", "tag_par_mc4", "tag_y_branch", "tag_extensao"
]
```

## Workflow: Criar Cabo com Inventory

```typescript
import { 
  createInventoryItemsWorkflow,
  createProductsWorkflow,
  useQueryGraphStep
} from "@medusajs/medusa/core-flows"

export const createCableProductWorkflow = createWorkflow(
  "create-cable-product",
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
            sku: "SOLAX-6MM-PRETO-METRO",
            title: "Cabo Solar Fotovoltaico 6mm² Preto (Metro)",
            requires_shipping: true,
            hs_code: "8544.49.00",
            origin_country: "BR",
            weight: 85, // 85g por metro
            length: 1000, // 1 metro
            height: 10,
            width: 10,
            location_levels: [
              {
                stocked_quantity: 5000, // 5000 metros em estoque
                location_id: stockLocations[0].id
              }
            ],
            metadata: {
              manufacturer: "Solax",
              cross_section_mm2: 6,
              color: "Preto",
              sold_by: "Metro"
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
            title: "Cabo Solar Fotovoltaico 6mm² - Preto - Solax (Metro)",
            subtitle: "6mm² - 1800V DC - Dupla Isolação - UV Resistente",
            handle: "cabo-solar-6mm-preto-metro",
            description: "Cabo fotovoltaico Solax 6mm² para sistemas solares. Condutor de cobre estanhado, dupla isolação em XLPE, resistente a raios UV, temperatura máxima 120°C. Certificado TÜV e EN 50618. Vendido por metro linear.",
            status: "published",
            variants: [
              {
                title: "Cabo Solar 6mm² Preto (Metro)",
                sku: "SOLAX-6MM-PRETO-METRO",
                prices: [
                  {
                    currency_code: "BRL",
                    amount: 650 // R$ 6,50 por metro
                  }
                ],
                options: {
                  "Bitola": "6mm²",
                  "Cor": "Preto",
                  "Unidade": "Metro"
                },
                manage_inventory: true
              }
            ],
            options: [
              { title: "Bitola", values: ["6mm²"] },
              { title: "Cor", values: ["Preto"] },
              { title: "Unidade", values: ["Metro"] }
            ],
            categories: [
              "cat_cables",
              "cat_cables_pv_dc",
              "cat_cables_6mm"
            ],
            tags: [
              "tag_solax",
              "tag_6mm",
              "tag_preto",
              "tag_dupla_isolacao",
              "tag_uv_resistente"
            ],
            metadata: {
              manufacturer: "Solax",
              model: "Energyflex 6mm²",
              product_type: "Cabo CC (DC)",
              technical_specs: {
                cross_section_mm2: 6,
                conductor_material: "Cobre estanhado",
                conductor_class: 5,
                stranding: "133x0.25mm",
                insulation_type: "Dupla XLPE",
                insulation_thickness_mm: 0.7,
                max_voltage_v: 1800,
                max_current_a: 58,
                temperature_rating_c: 120,
                uv_resistance: true,
                halogen_free: true,
                flame_retardant: true,
                outdoor_rated: true,
                color: "Preto",
                sold_by: "Metro",
                certifications: [
                  "TÜV",
                  "EN 50618",
                  "IEC 62930"
                ],
                warranty_years: 25
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

## Tabela de Dimensionamento de Cabos

| Bitola | Corrente Máxima (A) | Aplicação Típica | Sistemas até |
|--------|---------------------|------------------|--------------|
| 1,5mm² | 13A | Monitoramento, sinais | - |
| 2,5mm² | 21A | String boxes, CA | 2kWp |
| 4mm² | 32A | Strings CC, CA | 5kWp |
| 6mm² | 58A | Strings CC, entrada inversores | 10kWp |
| 10mm² | 80A | Múltiplas strings, CA principal | 20kWp |
| 16mm² | 110A | Entrada inversores grandes | 30kWp+ |

## Cálculo de Queda de Tensão

```typescript
interface VoltageDrop {
  // Parâmetros
  current_a: number           // Corrente em A
  length_m: number            // Comprimento em metros
  cross_section_mm2: number   // Seção do cabo em mm²
  voltage_v: number           // Tensão do sistema em V
  
  // Constantes
  resistivity_copper: number = 0.0172  // Ω·mm²/m (20°C)
  max_drop_percent: number = 3         // 3% máximo NBR 5410
  
  // Cálculo
  resistance_ohm: number      // (resistivity × length × 2) / cross_section
  voltage_drop_v: number      // current × resistance
  voltage_drop_percent: number // (voltage_drop / voltage) × 100
  
  // Validação
  acceptable: boolean         // voltage_drop_percent <= max_drop_percent
}

// Exemplo: Sistema 500V, 20A, 30m, cabo 6mm²
const drop: VoltageDrop = {
  current_a: 20,
  length_m: 30,
  cross_section_mm2: 6,
  voltage_v: 500,
  
  resistivity_copper: 0.0172,
  max_drop_percent: 3,
  
  resistance_ohm: (0.0172 * 30 * 2) / 6, // 0.172Ω
  voltage_drop_v: 20 * 0.172,            // 3.44V
  voltage_drop_percent: (3.44 / 500) * 100, // 0.69%
  
  acceptable: true // ✅ 0.69% < 3%
}
```

## Conectores MC4

### Workflow: Criar Conector MC4

```typescript
{
  product: {
    title: "Conector MC4 Par (Macho + Fêmea) - Staubli",
    variants: [
      {
        sku: "STAUBLI-MC4-PAR",
        prices: [{ currency_code: "BRL", amount: 1800 }], // R$ 18,00
        options: {
          "Tipo": "Par (M+F)",
          "Bitola": "2.5-6mm²"
        }
      }
    ],
    metadata: {
      connector_specs: {
        connector_type: "MC4 Par",
        max_voltage_v: 1500,
        max_current_a: 30,
        cable_cross_section_range_mm2: { min: 2.5, max: 6 },
        contact_resistance_mohm: 0.5,
        protection_degree: "IP68",
        material: "PPO - Óxido de Polifenileno"
      }
    }
  }
}
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
          { inventory_item_id: "inv_structure", required_quantity: 10 },
          { inventory_item_id: "inv_string_box", required_quantity: 1 },
          
          // Cabos CC (6mm² - 50m vermelho + 50m preto)
          { inventory_item_id: "inv_cable_6mm_red", required_quantity: 50 },
          { inventory_item_id: "inv_cable_6mm_black", required_quantity: 50 },
          
          // Conectores MC4 (20 pares para 10 painéis)
          { inventory_item_id: "inv_mc4_pair", required_quantity: 20 },
          
          // Cabos CA (10mm² - 20m)
          { inventory_item_id: "inv_cable_ac_10mm", required_quantity: 20 },
          
          // Aterramento (10mm² verde - 30m)
          { inventory_item_id: "inv_cable_ground_10mm", required_quantity: 30 }
        ]
      }
    ]
  }
}
```

## Busca Semântica - Keywords

```javascript
const cableSearchKeywords = [
  // Português
  "cabo solar", "cabo fotovoltaico", "cabo pv",
  "cabo dupla isolacao", "cabo energyflex", "cabo solax",
  "conector mc4", "mc4 macho", "mc4 femea",
  "extensao mc4", "y-branch", "paralelo mc4",
  
  // Bitolas
  "4mm", "6mm", "10mm", "cabo fino", "cabo grosso",
  
  // Características
  "uv resistente", "xlpe", "flexivel", "dupla isolacao",
  "halogen free", "retardante chamas",
  
  // Aplicações
  "cabo string", "cabo inversor", "cabo painel",
  "cabo aterramento", "cabo ca", "cabo energia"
]
```

## Principais Fabricantes

### Cabos

- **Solax** - Energyflex series (nacional)
- **Prysmian** - Afumex Solar (internacional)
- **Nexans** - Sunlight series
- **Condupar** - Cabo Solar series
- **Cobrecom** - Solartec series

### Conectores

- **Stäubli** - MC4 Original (Suíça)
- **Weidmüller** - MC4 Compatible
- **Phoenix Contact** - SUNCLIX series
- **Amphenol** - H4 series

## Regras de Negócio

### 1. Dimensionamento

- **Corrente máxima**: Isc × 1.25 (fator segurança)
- **Queda tensão**: Máximo 3% (NBR 5410)
- **Temperatura**: Considerar 120°C para cabos CC
- **UV**: Obrigatório para instalação externa

### 2. Instalação

- Conexões MC4: aperto manual (não usar alicate)
- Cabo CC: vermelho (+) / preto (-)
- Comprimento mínimo: evitar tensão mecânica
- Proteção UV: eletrodutos ou calhas

### 3. Preços (por metro)

- 4mm²: R$ 4,50 - R$ 6,00
- 6mm²: R$ 6,50 - R$ 8,50
- 10mm²: R$ 11,00 - R$ 14,00
- MC4 Par: R$ 15,00 - R$ 25,00

### 4. Certificações

- **EN 50618**: Cabos fotovoltaicos
- **IEC 62930**: Cabos CC para PV
- **TÜV**: Certificação qualidade

## Métricas de Performance

```typescript
interface CableMetrics {
  total_meters_in_stock: number
  by_cross_section: {
    mm2_4: number
    mm2_6: number
    mm2_10: number
    mm2_16: number
  }
  connectors_stock: {
    mc4_pairs: number
    y_branches: number
    extensions: number
  }
  avg_price_per_meter: number
  total_inventory_value: number
}
```

## Observações Importantes

1. **Dupla isolação**: Obrigatória para cabos CC fotovoltaicos
2. **UV**: Degradação em 2-3 anos se sem proteção UV
3. **MC4**: Conectores originais Stäubli recomendados (maior durabilidade)
4. **Cores**: Vermelho (+) / Preto (-) padrão internacional
5. **Vida útil**: 25-30 anos para cabos certificados

---

**Agent Version:** 1.0.0  
**Last Updated:** 2025-01-13  
**Status:** ✅ Production Ready
