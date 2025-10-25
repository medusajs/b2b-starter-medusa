# YSH Solar - Agents Documentation

## 📋 Visão Geral

Este diretório contém os **Agents de Gerenciamento de Inventário** para o YSH (Yello Solar Hub) B2B e-commerce de equipamentos fotovoltaicos. Cada agent é especializado em uma categoria de produto e implementa os padrões **Medusa.js v2.x Product Module** e **Inventory Module**.

## 🤖 Agents Disponíveis

### 1. **Batteries & Storage Agent** (`batteries-storage-agent.md`)

**Responsabilidade**: Sistemas de armazenamento de energia e baterias  
**Categorias**:

- Baterias de Lítio (LFP, NMC)
- Baterias de Chumbo-Ácido (Gel, AGM)
- Sistemas modulares e expansíveis

**Principais Fabricantes**: BYD, Pylontech, LG Chem, Freedom, Victron  
**Capacidades**: 5kWh - 40kWh  
**Aplicações**: Sistemas híbridos, off-grid, backup residencial/comercial

---

### 2. **EV Chargers Agent** (`ev-chargers-agent.md`)

**Responsabilidade**: Carregadores de veículos elétricos  
**Categorias**:

- Wallbox Residencial (3.7kW - 11kW)
- Wallbox Comercial (11kW - 22kW)
- DC Fast Chargers (>50kW)

**Conectores**: Type 1, Type 2, CCS Combo, CHAdeMO  
**Recursos**: Modo Solar, WiFi, Balanceamento de Carga, OCPP  
**Principais Fabricantes**: Wallbox, WEG, Intelbras, ABB, Schneider

---

### 3. **String Boxes & Protection Agent** (`stringboxes-protection-agent.md`)

**Responsabilidade**: Proteção CC/DC para sistemas fotovoltaicos  
**Categorias**:

- String Box CC (2-24 entradas)
- String Box CA
- DPS (Dispositivos Proteção Surto)

**Especificações**: 600V-1500V, 10A-32A, IP65  
**Componentes**: Fusíveis gPV, Disjuntores CC, Chaves Seccionadoras  
**Principais Fabricantes**: Steca, Phoenix Contact, Weidmüller, WEG

---

### 4. **Cables & Connectors Agent** (`cables-connectors-agent.md`)

**Responsabilidade**: Cabos elétricos e conectores fotovoltaicos  
**Categorias**:

- Cabos Fotovoltaicos CC (1.5mm² - 16mm²)
- Cabos CA (2.5mm² - 16mm²)
- Conectores MC4 (Macho/Fêmea/Pares)
- Y-Branches e Extensões

**Especificações**: Dupla isolação XLPE, 1800V DC, UV resistente  
**Certificações**: TÜV, EN 50618, IEC 62930  
**Principais Fabricantes**: Solax, Prysmian, Nexans, Stäubli

---

### 5. **Mounting Structures Agent** (`structures-mounting-agent.md`)

**Responsabilidade**: Estruturas de fixação para painéis solares  
**Categorias**:

- Telhado Cerâmico (Colonial, Portuguesa, Italiana)
- Telhado Metálico (Trapezoidal, Zipado, Ondulado)
- Fibrocimento, Laje, Solo/Carport

**Materiais**: Alumínio Anodizado, Aço Galvanizado, Inox 304/316  
**Componentes**: Trilhos, Grampos, Ganchos, Parafusos  
**Principais Fabricantes**: K2 Systems, Renusol, Schletter, Romagnole

---

### 6. **Kit Builder Agent** 🌟 (`kit-builder-agent.md`)

**Responsabilidade**: Orquestrador de Kits Fotovoltaicos Completos  
**Padrão**: **Medusa.js Inventory Kits** (Multi-Part Products)

**Tipos de Kits**:

- **Grid-Tie** (On-Grid sem bateria)
- **Híbridos** (On-Grid com bateria backup)
- **Off-Grid** (Isolados da rede)
- **Comerciais/Industriais** (20kWp - 100kWp+)
- **Com EV Charger** (integração carregamento veicular)

**Agents Coordenados**:

1. Panels Agent → Painéis solares
2. Inverters Agent → Inversores
3. Structures Agent → Estruturas de fixação
4. Batteries Agent → Baterias
5. Cables Agent → Cabos e conectores
6. String Boxes Agent → Proteção CC
7. EV Chargers Agent → Carregadores EV

---

## 🏗️ Arquitetura: Inventory Kits Pattern

### Multi-Part Products (Medusa.js)

Cada **Kit Solar** é um **produto multi-parte** que referencia múltiplos **inventory items**:

```typescript
{
  product: {
    title: "Kit Solar 5.5kWp - Canadian + Growatt",
    variants: [
      {
        sku: "KIT-5.5KWP-CANADIAN-GROWATT",
        inventory_items: [
          // Geração
          { inventory_item_id: "inv_panel_550w", required_quantity: 10 },
          { inventory_item_id: "inv_inverter_5kw", required_quantity: 1 },
          
          // Estrutura (já é multi-part: trilhos + grampos + ganchos)
          { inventory_item_id: "inv_structure_10p", required_quantity: 1 },
          
          // Proteção
          { inventory_item_id: "inv_string_box", required_quantity: 1 },
          
          // Cabeamento
          { inventory_item_id: "inv_cable_6mm_red", required_quantity: 50 },
          { inventory_item_id: "inv_cable_6mm_black", required_quantity: 50 },
          { inventory_item_id: "inv_mc4_pair", required_quantity: 20 }
        ]
      }
    ]
  }
}
```

### Benefícios

✅ **Estoque Real-Time**: Estoque do kit = MIN(estoque de cada componente / required_quantity)  
✅ **Flexibilidade**: Múltiplas variantes (telhado cerâmico/metálico/laje, com/sem bateria)  
✅ **Rastreabilidade**: Cada componente é rastreado individualmente  
✅ **Preços Dinâmicos**: Preço do kit pode ser menor que soma dos componentes  
✅ **Composição Transparente**: Cliente vê todos os componentes inclusos

---

## 📊 Hierarquia de Categorias

```
Produtos Fotovoltaicos
│
├── Painéis Solares (cat_panels)
│   ├── Por Potência (450-550W)
│   ├── Por Tecnologia (Monocristalino, Policristalino)
│   └── Por Fabricante (Canadian, Jinko, Longi, etc.)
│
├── Inversores (cat_inverters)
│   ├── Grid-Tie (String, Microinversor)
│   ├── Híbridos (On-Grid + Backup)
│   └── Off-Grid (Isolados)
│
├── Estruturas (cat_structures)
│   ├── Telhado Cerâmico
│   ├── Telhado Metálico
│   ├── Fibrocimento/Laje
│   └── Solo/Carport
│
├── Baterias (cat_batteries)
│   ├── Lítio LFP/NMC
│   ├── Chumbo-Ácido/Gel/AGM
│   └── Por Tensão (12V/24V/48V/HV)
│
├── String Boxes (cat_string_boxes)
│   ├── Por Entradas (2E/4E/6E/8E)
│   ├── Por Tensão (600V/1000V/1500V)
│   └── Com DPS integrado
│
├── Cabos & Conectores (cat_cables)
│   ├── Cabos CC (4mm²/6mm²/10mm²)
│   ├── Cabos CA (2.5mm²/10mm²/16mm²)
│   └── Conectores MC4
│
├── Carregadores EV (cat_ev_chargers)
│   ├── Wallbox (3.7kW/7.4kW/11kW/22kW)
│   ├── Por Conector (Type 1/Type 2/CCS)
│   └── Com Modo Solar
│
└── Kits Completos (cat_kits)
    ├── Grid-Tie (2kWp - 100kWp+)
    ├── Híbridos (com bateria)
    ├── Off-Grid (isolados)
    └── Com EV Charger
```

---

## 🔄 Workflows de Criação

### 1. Criar Inventory Item Individual

```typescript
import { createInventoryItemsWorkflow } from "@medusajs/medusa/core-flows"

const result = createInventoryItemsWorkflow.runAsStep({
  input: {
    items: [
      {
        sku: "CANADIAN-CS7N-550TB-AG",
        title: "Painel Solar Canadian 550W",
        requires_shipping: true,
        hs_code: "8541.40.32",
        origin_country: "CN",
        weight: 28000, // 28kg
        location_levels: [
          {
            stocked_quantity: 500,
            location_id: "loc_warehouse_01"
          }
        ]
      }
    ]
  }
})
```

### 2. Criar Produto com Inventory Item

```typescript
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

const product = createProductsWorkflow.runAsStep({
  input: {
    products: [
      {
        title: "Painel Solar Canadian 550W Monocristalino",
        handle: "painel-canadian-550w",
        variants: [
          {
            sku: "CANADIAN-CS7N-550TB-AG",
            prices: [{ currency_code: "BRL", amount: 85000 }],
            manage_inventory: true
          }
        ]
      }
    ]
  }
})
```

### 3. Criar Kit Multi-Part Product

```typescript
// Kit = Produto com inventory_items array
const kit = createProductsWorkflow.runAsStep({
  input: {
    products: [
      {
        title: "Kit Solar 5.5kWp",
        variants: [
          {
            sku: "KIT-5.5KWP",
            inventory_items: [
              { inventory_item_id: "inv_panel", required_quantity: 10 },
              { inventory_item_id: "inv_inverter", required_quantity: 1 },
              { inventory_item_id: "inv_structure", required_quantity: 1 }
            ]
          }
        ]
      }
    ]
  }
})
```

---

## 🎯 Padrões de SKU

### Painéis

`{FABRICANTE}-{MODELO}-{POTENCIA}W`  
Exemplo: `CANADIAN-CS7N-550TB-AG`

### Inversores

`{FABRICANTE}-{MODELO}-{POTENCIA}KW`  
Exemplo: `GROWATT-MIN-5000TL-XH`

### Estruturas

`ESTRUTURA-{TELHADO}-{PAINEIS}P-{ORIENTACAO}-{MATERIAL}`  
Exemplo: `ESTRUTURA-CER-10P-RET-ALU`

### Baterias

`{FABRICANTE}-{MODELO}-{CAPACIDADE}KWH`  
Exemplo: `BYD-BBOX-LVS-12KWH`

### String Boxes

`{FABRICANTE}-{MODELO}-{TENSAO}V-{CORRENTE}A`  
Exemplo: `STECA-SB4010-1000V-15A`

### Cabos

`{FABRICANTE}-{BITOLA}MM-{COR}-{UNIDADE}`  
Exemplo: `SOLAX-6MM-PRETO-METRO`

### Conectores

`{FABRICANTE}-{TIPO}-{CONFIGURACAO}`  
Exemplo: `STAUBLI-MC4-PAR`

### Kits

`KIT-{POTENCIA}KWP-{PAINEL}-{INVERSOR}-{EXTRAS}`  
Exemplo: `KIT-5.5KWP-CANADIAN-GROWATT-CER`

---

## 🔍 Busca Semântica (Gemma 3)

### Keywords por Categoria

**Painéis**:

- "painel solar", "módulo fotovoltaico", "550w", "monocristalino", "canadian"

**Inversores**:

- "inversor", "string", "grid tie", "5kw", "growatt", "mppt"

**Estruturas**:

- "estrutura solar", "telhado ceramico", "trilho aluminio", "fixacao painel"

**Baterias**:

- "bateria solar", "armazenamento", "litio lfp", "12kwh", "byd"

**String Boxes**:

- "string box", "protecao cc", "fusivel solar", "dps", "4 entradas"

**Cabos**:

- "cabo solar", "6mm", "dupla isolacao", "mc4", "conector"

**EV Chargers**:

- "carregador ev", "wallbox", "11kw", "type 2", "modo solar"

**Kits**:

- "kit solar", "kit completo", "5.5kwp", "grid tie", "hibrido"

---

## 📈 Métricas de Performance

### Inventory Health

```typescript
interface InventoryMetrics {
  // Por Categoria
  panels_stock: number
  inverters_stock: number
  batteries_stock: number
  structures_stock: number
  cables_meters: number
  string_boxes_stock: number
  ev_chargers_stock: number
  
  // Kits Disponíveis
  kits_available: number
  kits_out_of_stock: number
  
  // Valor Total
  total_inventory_value_brl: number
  
  // Turnover
  avg_days_to_sell: number
  fast_moving_items: string[]
  slow_moving_items: string[]
}
```

---

## 🛠️ Como Usar

### 1. Criar um Novo Produto Individual

1. Consulte o agent correspondente (ex: `batteries-storage-agent.md`)
2. Copie o workflow de exemplo
3. Ajuste especificações técnicas (metadata)
4. Execute `createInventoryItemsWorkflow` + `createProductsWorkflow`

### 2. Criar um Kit Completo

1. Consulte `kit-builder-agent.md`
2. Identifique os inventory_item_id de cada componente
3. Defina `required_quantity` para cada item
4. Configure variantes (telhado, bateria opcional, etc.)
5. Execute workflow de criação de kit

### 3. Adicionar Nova Categoria

1. Crie novo agent markdown (seguir template dos existentes)
2. Defina schema JSON com `metadata.technical_specs`
3. Crie hierarquia de categorias (`cat_*`)
4. Defina tags semânticas (`tag_*`)
5. Implemente workflow de criação
6. Adicione ao `kit-builder-agent.md` se aplicável

---

## 📚 Referências

### MedusaJS Documentation

- [Product Module](https://docs.medusajs.com/resources/references/product)
- [Inventory Module](https://docs.medusajs.com/resources/references/inventory)
- [Inventory Kits](https://docs.medusajs.com/resources/commerce-modules/inventory/kits)
- [Workflows SDK](https://docs.medusajs.com/learn/advanced-development/workflows)

### Normas Técnicas

- **NBR 5410**: Instalações elétricas de baixa tensão
- **NBR 6123**: Forças devidas ao vento em edificações
- **NBR 8800**: Projeto de estruturas de aço e de estruturas mistas
- **IEC 61215**: Painéis fotovoltaicos - Qualificação
- **IEC 61851-1**: Sistemas de carregamento de VE
- **EN 50618**: Cabos para aplicações fotovoltaicas

---

## 🚀 Status dos Agents

| Agent | Status | Version | Last Updated |
|-------|--------|---------|--------------|
| Batteries & Storage | ✅ Production Ready | 1.0.0 | 2025-01-13 |
| EV Chargers | ✅ Production Ready | 1.0.0 | 2025-01-13 |
| String Boxes | ✅ Production Ready | 1.0.0 | 2025-01-13 |
| Cables & Connectors | ✅ Production Ready | 1.0.0 | 2025-01-13 |
| Mounting Structures | ✅ Production Ready | 1.0.0 | 2025-01-13 |
| Kit Builder | ✅ Production Ready | 1.0.0 | 2025-01-13 |

---

**Maintainer**: YSH Development Team  
**Project**: Yello Solar Hub - B2B E-commerce  
**Framework**: Medusa.js v2.x  
**AI Search**: Gemma 3 Semantic Search

---

*Para dúvidas ou contribuições, consulte a documentação individual de cada agent.*
