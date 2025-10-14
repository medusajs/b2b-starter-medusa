# Agent: Estruturas de Fixação (Mounting Structures)

## Contexto e Propósito

Este agente é especializado em **estruturas de fixação e montagem** para painéis solares fotovoltaicos. Responsável por gerenciar o inventário de estruturas metálicas, trilhos, grampos e acessórios de montagem.

## Escopo de Produtos

### Tipos de Estruturas

- **Estruturas para Telhado Cerâmico** (Colonial, Portuguesa, Italiana)
- **Estruturas para Telhado Metálico** (Trapezoidal, Zipado, Ondulado)
- **Estruturas para Telhado de Fibrocimento** (Ondulado, Flat)
- **Estruturas para Laje** (Base lastro, fixação química)
- **Estruturas para Solo** (Carport, ground-mount)

### Componentes

- **Trilhos** (Alumínio, 3m/4m/5m)
- **Grampos de Fixação** (Terminais, Intermediários, Universais)
- **Ganchos** (Cerâmica, Metálico, Fibrocimento)
- **Presilhas e Parafusos**
- **Kits de Aterramento**

## Schema Medusa.js para Estruturas

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "title": "Estrutura de Fixação Solar - Medusa Product Schema",
  "description": "Schema para estruturas de montagem fotovoltaica em Medusa.js",
  "type": "object",
  "required": ["title", "handle", "status", "variants", "options"],
  "properties": {
    "title": {
      "type": "string",
      "description": "Nome comercial completo da estrutura",
      "example": "Estrutura Solar para Telhado Cerâmico - Alumínio - Kit 10 Painéis Retrato"
    },
    "subtitle": {
      "type": "string",
      "description": "Subtítulo com especificações resumidas",
      "example": "Alumínio Anodizado - 10 Painéis Retrato - Telha Colonial/Portuguesa"
    },
    "handle": {
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
      "example": "estrutura-ceramico-aluminio-10-paineis-retrato"
    },
    "description": {
      "type": "string",
      "description": "Descrição detalhada da estrutura"
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
        { "id": "cat_structures" },
        { "id": "cat_structure_ceramic_roof" },
        { "id": "cat_structure_10_panels" }
      ]
    },
    "tags": {
      "type": "array",
      "items": { "type": "object" },
      "example": [
        { "id": "tag_ceramico" },
        { "id": "tag_aluminio" },
        { "id": "tag_10_paineis" },
        { "id": "tag_retrato" }
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
        { "title": "Tipo de Telhado", "values": ["Cerâmico"] },
        { "title": "Capacidade", "values": ["10 Painéis"] },
        { "title": "Orientação", "values": ["Retrato"] }
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
                "amount": { "type": "number", "example": 95000 }
              }
            }
          },
          "options": {
            "type": "object",
            "example": {
              "Tipo de Telhado": "Cerâmico",
              "Capacidade": "10 Painéis",
              "Orientação": "Retrato"
            }
          },
          "inventory_items": {
            "type": "array",
            "description": "Multi-part product: estrutura composta de trilhos, grampos, ganchos",
            "items": {
              "type": "object",
              "properties": {
                "inventory_item_id": { "type": "string" },
                "required_quantity": { "type": "number" }
              }
            },
            "example": [
              { "inventory_item_id": "inv_trilho_4m_aluminio", "required_quantity": 6 },
              { "inventory_item_id": "inv_grampo_terminal", "required_quantity": 40 },
              { "inventory_item_id": "inv_gancho_ceramico", "required_quantity": 20 },
              { "inventory_item_id": "inv_parafuso_m8", "required_quantity": 80 }
            ]
          }
        }
      }
    },
    "metadata": {
      "type": "object",
      "properties": {
        "manufacturer": { "type": "string", "example": "K2 Systems" },
        "model": { "type": "string", "example": "MiniRail Kit Cerâmico" },
        "distributor": { "type": "string" },
        "technical_specs": {
          "type": "object",
          "properties": {
            "roof_type": {
              "type": "string",
              "enum": [
                "Cerâmico Colonial",
                "Cerâmico Portuguesa",
                "Cerâmico Italiana",
                "Metálico Trapezoidal",
                "Metálico Zipado",
                "Metálico Ondulado",
                "Fibrocimento Ondulado",
                "Fibrocimento Flat",
                "Laje Concreto",
                "Laje Impermeabilizada",
                "Solo/Carport"
              ]
            },
            "material": {
              "type": "string",
              "enum": [
                "Alumínio Anodizado",
                "Alumínio Extrudado",
                "Aço Galvanizado",
                "Aço Inox 304",
                "Aço Inox 316"
              ]
            },
            "panel_capacity": {
              "type": "integer",
              "description": "Quantidade de painéis suportados",
              "minimum": 1,
              "maximum": 100
            },
            "panel_orientation": {
              "type": "string",
              "enum": ["Retrato", "Paisagem", "Ambas"]
            },
            "max_panel_dimensions": {
              "type": "object",
              "properties": {
                "length_mm": { "type": "number", "example": 2278 },
                "width_mm": { "type": "number", "example": 1134 },
                "thickness_mm": { "type": "number", "example": 35 }
              }
            },
            "installation_angle_degrees": {
              "type": "object",
              "properties": {
                "min": { "type": "number" },
                "max": { "type": "number" },
                "recommended": { "type": "number" }
              },
              "example": {
                "min": 5,
                "max": 60,
                "recommended": 15
              }
            },
            "load_capacity": {
              "type": "object",
              "properties": {
                "static_load_pa": {
                  "type": "number",
                  "description": "Carga estática em Pa (neve, poeira)"
                },
                "wind_load_pa": {
                  "type": "number",
                  "description": "Carga de vento em Pa"
                },
                "max_system_weight_kg": {
                  "type": "number",
                  "description": "Peso máximo total do sistema"
                }
              }
            },
            "corrosion_resistance": {
              "type": "string",
              "enum": ["Zona Rural", "Zona Urbana", "Zona Costeira", "Zona Industrial"]
            },
            "rail_length_options_m": {
              "type": "array",
              "items": { "type": "number" },
              "example": [3, 4, 5]
            },
            "rail_profile": {
              "type": "string",
              "description": "Perfil do trilho",
              "example": "40x40mm"
            },
            "grounding_included": {
              "type": "boolean",
              "description": "Kit de aterramento incluso"
            },
            "adjustable_tilt": {
              "type": "boolean",
              "description": "Inclinação ajustável"
            },
            "ballast_required": {
              "type": "boolean",
              "description": "Requer lastro (para lajes)"
            },
            "ballast_weight_kg": {
              "type": "number",
              "description": "Peso do lastro necessário"
            },
            "certifications": {
              "type": "array",
              "items": { "type": "string" },
              "example": ["TÜV", "IEC 61215", "ABNT NBR 8800", "Wind Tunnel Test"]
            },
            "warranty_years": {
              "type": "integer",
              "description": "Garantia em anos"
            }
          }
        },
        "kit_composition": {
          "type": "object",
          "description": "Composição do kit de estrutura",
          "properties": {
            "rails": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "description": { "type": "string" },
                  "quantity": { "type": "number" },
                  "length_m": { "type": "number" }
                }
              },
              "example": [
                { "description": "Trilho Alumínio 40x40mm", "quantity": 6, "length_m": 4 }
              ]
            },
            "clamps": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "description": { "type": "string" },
                  "quantity": { "type": "number" }
                }
              },
              "example": [
                { "description": "Grampo Terminal", "quantity": 40 },
                { "description": "Grampo Intermediário", "quantity": 20 }
              ]
            },
            "hooks": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "description": { "type": "string" },
                  "quantity": { "type": "number" }
                }
              },
              "example": [
                { "description": "Gancho para Telha Cerâmica", "quantity": 20 }
              ]
            },
            "fasteners": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "description": { "type": "string" },
                  "quantity": { "type": "number" }
                }
              },
              "example": [
                { "description": "Parafuso M8x30 Inox", "quantity": 80 },
                { "description": "Porca M8 Inox", "quantity": 80 },
                { "description": "Arruela M8 Inox", "quantity": 160 }
              ]
            },
            "grounding_kit": {
              "type": "object",
              "properties": {
                "included": { "type": "boolean" },
                "description": { "type": "string" },
                "quantity": { "type": "number" }
              }
            }
          }
        },
        "installation": {
          "type": "object",
          "properties": {
            "estimated_time_hours": {
              "type": "number",
              "description": "Tempo estimado de instalação em horas"
            },
            "crew_size": {
              "type": "integer",
              "description": "Tamanho da equipe recomendado"
            },
            "tools_required": {
              "type": "array",
              "items": { "type": "string" },
              "example": [
                "Furadeira",
                "Chave Allen 6mm",
                "Chave Inglesa",
                "Nível",
                "Trena",
                "Linha de Pedreiro"
              ]
            },
            "special_requirements": {
              "type": "array",
              "items": { "type": "string" },
              "example": [
                "Verificar estado do telhado",
                "Reforçar estrutura se necessário",
                "Impermeabilização de pontos de fixação"
              ]
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
cat_structures (Estruturas de Fixação)
│
├── Por Tipo de Telhado
│   ├── cat_structure_ceramic_roof (Telhado Cerâmico)
│   │   ├── cat_structure_colonial (Colonial)
│   │   ├── cat_structure_portuguesa (Portuguesa)
│   │   └── cat_structure_italiana (Italiana)
│   ├── cat_structure_metal_roof (Telhado Metálico)
│   │   ├── cat_structure_trapezoidal (Trapezoidal)
│   │   ├── cat_structure_zipado (Zipado)
│   │   └── cat_structure_corrugated (Ondulado)
│   ├── cat_structure_fiber_cement (Fibrocimento)
│   ├── cat_structure_slab (Laje)
│   └── cat_structure_ground (Solo/Carport)
│
├── Por Capacidade
│   ├── cat_structure_4_panels (até 4 Painéis)
│   ├── cat_structure_6_panels (5-6 Painéis)
│   ├── cat_structure_10_panels (7-10 Painéis)
│   ├── cat_structure_20_panels (11-20 Painéis)
│   └── cat_structure_large (>20 Painéis)
│
├── Por Material
│   ├── cat_structure_aluminum (Alumínio)
│   ├── cat_structure_galvanized_steel (Aço Galvanizado)
│   └── cat_structure_stainless_steel (Aço Inox)
│
├── Por Orientação
│   ├── cat_structure_portrait (Retrato)
│   ├── cat_structure_landscape (Paisagem)
│   └── cat_structure_adjustable (Ajustável)
│
└── Componentes Avulsos
    ├── cat_rails (Trilhos)
    ├── cat_clamps (Grampos)
    ├── cat_hooks (Ganchos)
    └── cat_fasteners (Parafusos/Presilhas)
```

## Tags Semânticas

```javascript
const structureTags = [
  // Fabricantes
  "tag_k2_systems", "tag_renusol", "tag_schletter", "tag_unirac",
  "tag_romagnole", "tag_neoenergia",
  
  // Telhados
  "tag_ceramico", "tag_metalico", "tag_fibrocimento",
  "tag_laje", "tag_solo", "tag_carport",
  
  // Material
  "tag_aluminio", "tag_aco_galvanizado", "tag_inox",
  
  // Capacidade
  "tag_4_paineis", "tag_6_paineis", "tag_10_paineis",
  "tag_20_paineis",
  
  // Orientação
  "tag_retrato", "tag_paisagem", "tag_ajustavel",
  
  // Características
  "tag_anodizado", "tag_zona_costeira", "tag_lastro",
  "tag_inclinacao_ajustavel"
]
```

## Workflow: Criar Estrutura Multi-Part Product

```typescript
import { 
  createInventoryItemsWorkflow,
  createProductsWorkflow,
  useQueryGraphStep
} from "@medusajs/medusa/core-flows"

export const createStructureProductWorkflow = createWorkflow(
  "create-structure-product",
  () => {
    // 1. Stock Location
    const { data: stockLocations } = useQueryGraphStep({
      entity: "stock_location",
      fields: ["*"],
      filters: { name: "Main Warehouse" }
    })

    // 2. Criar Inventory Items para COMPONENTES
    const inventoryItems = createInventoryItemsWorkflow.runAsStep({
      input: {
        items: [
          // Trilhos
          {
            sku: "TRILHO-ALU-4M-40X40",
            title: "Trilho Alumínio 4m 40x40mm",
            requires_shipping: true,
            hs_code: "7610.90.00",
            origin_country: "BR",
            weight: 3500, // 3.5kg por trilho
            location_levels: [{ stocked_quantity: 200, location_id: stockLocations[0].id }]
          },
          // Grampos
          {
            sku: "GRAMPO-TERMINAL-ALU",
            title: "Grampo Terminal Alumínio",
            requires_shipping: true,
            weight: 85,
            location_levels: [{ stocked_quantity: 1000, location_id: stockLocations[0].id }]
          },
          // Ganchos
          {
            sku: "GANCHO-CERAMICO-INOX",
            title: "Gancho para Telha Cerâmica Inox",
            requires_shipping: true,
            weight: 120,
            location_levels: [{ stocked_quantity: 500, location_id: stockLocations[0].id }]
          },
          // Parafusos
          {
            sku: "PARAFUSO-M8X30-INOX",
            title: "Parafuso M8x30 Inox + Porca + Arruela",
            requires_shipping: true,
            weight: 25,
            location_levels: [{ stocked_quantity: 5000, location_id: stockLocations[0].id }]
          }
        ]
      }
    })

    // 3. Criar Produto ESTRUTURA (Multi-Part usando Inventory Items)
    const products = createProductsWorkflow.runAsStep({
      input: {
        products: [
          {
            title: "Estrutura Solar para Telhado Cerâmico - Alumínio - Kit 10 Painéis Retrato",
            subtitle: "Alumínio Anodizado - 10 Painéis Retrato - Telha Colonial/Portuguesa",
            handle: "estrutura-ceramico-aluminio-10-paineis-retrato",
            description: "Kit completo de estrutura em alumínio anodizado para fixação de 10 painéis solares em orientação retrato sobre telhado cerâmico (colonial/portuguesa). Inclui trilhos 4m, grampos terminais, ganchos e parafusos inox. Garantia 20 anos contra corrosão.",
            status: "published",
            variants: [
              {
                title: "Estrutura Cerâmico 10P Retrato - Alumínio",
                sku: "ESTRUTURA-CER-10P-RET-ALU",
                prices: [
                  {
                    currency_code: "BRL",
                    amount: 95000 // R$ 950,00
                  }
                ],
                options: {
                  "Tipo de Telhado": "Cerâmico",
                  "Capacidade": "10 Painéis",
                  "Orientação": "Retrato"
                },
                manage_inventory: true,
                
                // 🔥 MULTI-PART PRODUCT: Estrutura composta de múltiplos inventory items
                inventory_items: [
                  { 
                    inventory_item_id: inventoryItems[0].id, // Trilho 4m
                    required_quantity: 6 
                  },
                  { 
                    inventory_item_id: inventoryItems[1].id, // Grampo Terminal
                    required_quantity: 40 
                  },
                  { 
                    inventory_item_id: inventoryItems[2].id, // Gancho Cerâmico
                    required_quantity: 20 
                  },
                  { 
                    inventory_item_id: inventoryItems[3].id, // Parafuso M8
                    required_quantity: 80 
                  }
                ]
              }
            ],
            options: [
              { title: "Tipo de Telhado", values: ["Cerâmico"] },
              { title: "Capacidade", values: ["10 Painéis"] },
              { title: "Orientação", values: ["Retrato"] }
            ],
            categories: [
              "cat_structures",
              "cat_structure_ceramic_roof",
              "cat_structure_10_panels"
            ],
            tags: [
              "tag_ceramico",
              "tag_aluminio",
              "tag_10_paineis",
              "tag_retrato"
            ],
            metadata: {
              manufacturer: "K2 Systems",
              model: "MiniRail Kit Cerâmico 10P",
              technical_specs: {
                roof_type: "Cerâmico Colonial",
                material: "Alumínio Anodizado",
                panel_capacity: 10,
                panel_orientation: "Retrato",
                max_panel_dimensions: {
                  length_mm: 2278,
                  width_mm: 1134,
                  thickness_mm: 35
                },
                installation_angle_degrees: {
                  min: 5,
                  max: 30,
                  recommended: 15
                },
                load_capacity: {
                  static_load_pa: 3000,
                  wind_load_pa: 2400,
                  max_system_weight_kg: 280
                },
                corrosion_resistance: "Zona Costeira",
                rail_length_options_m: [4],
                rail_profile: "40x40mm",
                grounding_included: true,
                adjustable_tilt: false,
                ballast_required: false,
                certifications: [
                  "TÜV",
                  "ABNT NBR 8800",
                  "Wind Tunnel Test"
                ],
                warranty_years: 20
              },
              kit_composition: {
                rails: [
                  { description: "Trilho Alumínio 40x40mm 4m", quantity: 6, length_m: 4 }
                ],
                clamps: [
                  { description: "Grampo Terminal Alumínio", quantity: 40 },
                  { description: "Grampo Intermediário Alumínio", quantity: 20 }
                ],
                hooks: [
                  { description: "Gancho para Telha Cerâmica Inox", quantity: 20 }
                ],
                fasteners: [
                  { description: "Parafuso M8x30 Inox", quantity: 80 },
                  { description: "Porca M8 Inox", quantity: 80 },
                  { description: "Arruela M8 Inox", quantity: 160 }
                ],
                grounding_kit: {
                  included: true,
                  description: "Kit Aterramento com Presilhas",
                  quantity: 1
                }
              },
              installation: {
                estimated_time_hours: 4,
                crew_size: 2,
                tools_required: [
                  "Furadeira",
                  "Chave Allen 6mm",
                  "Chave Inglesa",
                  "Nível",
                  "Trena"
                ],
                special_requirements: [
                  "Verificar estado das telhas",
                  "Impermeabilização dos pontos de fixação"
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

## Cálculo de Estrutura Necessária

```typescript
interface StructureCalculation {
  // Entrada
  panel_count: number
  panel_dimensions: { length_mm: number, width_mm: number }
  orientation: "Retrato" | "Paisagem"
  roof_type: string
  
  // Cálculo
  rows: number
  panels_per_row: number
  rail_count: number
  rail_length_m: number
  
  // Componentes
  terminal_clamps: number     // 4 por painel
  intermediate_clamps: number // (painéis - 1) × 2 por linha
  hooks: number               // 2 por trilho
  
  // Resultado
  recommended_sku: string
}

// Exemplo: 10 painéis 550W em retrato
const calc: StructureCalculation = {
  panel_count: 10,
  panel_dimensions: { length_mm: 2278, width_mm: 1134 },
  orientation: "Retrato",
  roof_type: "Cerâmico",
  
  rows: 2,                  // 2 linhas de 5 painéis
  panels_per_row: 5,
  rail_count: 6,            // 3 trilhos por linha × 2 linhas
  rail_length_m: 4,         // (1134mm × 5) = 5670mm → trilho 4m × 2 = 8m suficiente
  
  terminal_clamps: 40,      // 4 × 10 painéis
  intermediate_clamps: 20,  // (5-1) × 2 × 2 linhas = 16 (arredondar para 20)
  hooks: 20,                // 2 por trilho × (3 trilhos × 2 linhas + 2 extremos) ≈ 20
  
  recommended_sku: "ESTRUTURA-CER-10P-RET-ALU"
}
```

## Integração com Kits Solares

```typescript
{
  product: {
    title: "Kit Solar 5.5kWp",
    variants: [
      {
        inventory_items: [
          { inventory_item_id: "inv_inverter_5kw", required_quantity: 1 },
          { inventory_item_id: "inv_panel_550w", required_quantity: 10 },
          
          // Estrutura como multi-part product
          { inventory_item_id: "inv_structure_cer_10p_ret", required_quantity: 1 },
          // ☝️ Este item automaticamente consome:
          //    - 6× Trilho 4m
          //    - 40× Grampo Terminal
          //    - 20× Gancho Cerâmico
          //    - 80× Parafuso M8
          
          { inventory_item_id: "inv_string_box", required_quantity: 1 },
          { inventory_item_id: "inv_cable_6mm_red", required_quantity: 50 },
          { inventory_item_id: "inv_cable_6mm_black", required_quantity: 50 }
        ]
      }
    ]
  }
}
```

## Principais Fabricantes

### Internacional (Tier 1)

- **K2 Systems** (Alemanha) - MiniRail, CrossRail
- **Renusol** (Alemanha) - InterSole, VarioSole
- **Schletter** (Alemanha) - Rapid series
- **Unirac** (EUA) - SolarMount series

### Nacional (Brasil)

- **Romagnole** - Estruturas completas
- **Neoenergia** - Linha residencial/comercial
- **GreenSolar** - Estruturas econômicas

## Busca Semântica - Keywords

```javascript
const structureSearchKeywords = [
  // Português
  "estrutura solar", "estrutura fotovoltaica", "fixacao painel",
  "suporte painel", "kit montagem", "trilho solar",
  
  // Telhados
  "telhado ceramico", "telha colonial", "telha portuguesa",
  "telhado metalico", "telha trapezoidal", "fibrocimento",
  "laje", "solo", "carport",
  
  // Orientação
  "retrato", "paisagem", "vertical", "horizontal",
  
  // Material
  "aluminio", "aco galvanizado", "inox", "anodizado",
  
  // Componentes
  "trilho", "grampo", "gancho", "presilha",
  
  // Capacidade
  "4 paineis", "6 paineis", "10 paineis", "estrutura completa"
]
```

## Regras de Negócio

### 1. Dimensionamento

- **Trilhos**: Espaçamento máximo 1,2m entre trilhos
- **Ganchos**: 2 por trilho mínimo (cargas de vento)
- **Grampos**: 4 por painel (terminais) + intermediários
- **Inclinação**: Mínimo 5° (escoamento água), ideal 10-15°

### 2. Materiais por Zona

- **Zona Rural/Urbana**: Alumínio anodizado ou aço galvanizado
- **Zona Costeira**: Alumínio anodizado ou aço inox 304
- **Zona Industrial**: Aço inox 316

### 3. Preços

- Estrutura 4P (Cerâmico): R$ 400 - R$ 550
- Estrutura 6P (Cerâmico): R$ 600 - R$ 800
- Estrutura 10P (Cerâmico): R$ 950 - R$ 1.200
- Estrutura Solo: R$ 180 - R$ 250 por painel

### 4. Normas

- **ABNT NBR 8800**: Estruturas metálicas
- **ABNT NBR 6123**: Forças devidas ao vento
- **Wind Tunnel Test**: Túnel de vento (cargas dinâmicas)

## Métricas de Performance

```typescript
interface StructureMetrics {
  total_kits_in_stock: number
  by_roof_type: {
    ceramic: number
    metal: number
    fiber_cement: number
    slab: number
    ground: number
  }
  by_capacity: {
    panels_4: number
    panels_6: number
    panels_10: number
    panels_20_plus: number
  }
  avg_price_per_panel: number
  total_inventory_value: number
}
```

## Observações Importantes

1. **Cálculo Estrutural**: Sempre considerar NBR 6123 (ventos)
2. **Impermeabilização**: Obrigatória em pontos de fixação
3. **Aterramento**: Kit de aterramento deve conectar todos os trilhos
4. **Garantia**: Mínimo 10 anos (alumínio), 20 anos (fabricantes premium)
5. **Inspeção**: Anual (aperto parafusos, corrosão)

---

**Agent Version:** 1.0.0  
**Last Updated:** 2025-01-13  
**Status:** ✅ Production Ready
