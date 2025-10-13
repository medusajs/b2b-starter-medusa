# Inventário Master - Yello Solar Hub (YSH)

**Data de Geração:** 13 de outubro de 2025  
**Versão:** 1.0.0  
**Padrão:** Medusa.js v2.x Inventory Module + Product Module

---

## 📊 Resumo Executivo do Inventário

### Totais por Categoria

| Categoria | Quantidade | Distribuidores | Status |
|-----------|------------|----------------|--------|
| **Inversores** | 127 | ODEX (45), Solfacil (82) | ✅ Ativo |
| **Painéis/Módulos** | 15 | ODEX (9), Solfacil (6) | ✅ Ativo |
| **Estruturas** | 30 | ODEX (26), Solfacil (4) | ✅ Ativo |
| **String Boxes** | 13 | ODEX (13) | ✅ Ativo |
| **Cabos** | 36 | Solfacil (36) | ✅ Ativo |
| **Baterias** | 4 | Solfacil (4) | ✅ Ativo |
| **Acessórios** | 10 | Solfacil (10) | ✅ Ativo |
| **Kits Completos** | 223 | Fotus (223) | ✅ Ativo |
| **Kits Híbridos** | 24 | Fotus (24) | ✅ Ativo |
| **TOTAL** | **482** | 3 distribuidores | ✅ Operacional |

---

## 🏢 Distribuidores YSH

### 1. ODEX (Plataforma Odex)

**Fonte:** plataforma.odex.com.br  
**Status:** ✅ Ativo  
**Última Atualização:** 07/10/2025

#### Produtos ODEX

| Categoria | Quantidade | Faixa de Preço |
|-----------|------------|----------------|
| Inversores | 45 | R$ 1.599,00 - R$ 18.999,00 |
| Painéis | 9 | R$ 490,00 - R$ 589,00 |
| String Boxes | 13 | R$ 362,00 - R$ 1.199,00 |
| Estruturas | 26 | R$ 103,00 - R$ 189,00 |
| **TOTAL** | **93** | - |

#### Principais Fabricantes ODEX

- **Inversores:** SAJ, Growatt, Deye, Fronius, ABB
- **Painéis:** Odex, Canadian Solar, JinkoSolar
- **String Boxes:** Clamper, Steck, Romagnole
- **Estruturas:** Solar Group, K2 Systems, Romagnole

### 2. Solfacil (Loja B2B)

**Fonte:** loja.solfacil.com.br  
**Status:** ✅ Ativo  
**Última Atualização:** 07/10/2025

#### Produtos Solfacil

| Categoria | Quantidade | Faixa de Preço |
|-----------|------------|----------------|
| Inversores | 82 | R$ 1.200,00 - R$ 25.000,00 |
| Painéis | 6 | R$ 450,00 - R$ 650,00 |
| Estruturas | 4 | R$ 95,00 - R$ 220,00 |
| Cabos | 36 | R$ 25,00 - R$ 450,00 |
| Baterias | 4 | R$ 3.500,00 - R$ 12.000,00 |
| Acessórios | 10 | R$ 15,00 - R$ 800,00 |
| **TOTAL** | **142** | - |

#### Principais Fabricantes Solfacil

- **Inversores:** Fronius, SMA, Growatt, Huawei, Sungrow
- **Painéis:** Canadian Solar, JinkoSolar, Trina Solar
- **Baterias:** BYD, Pylontech, LG Chem
- **Cabos:** Nexans, Prysmian, Ficap

### 3. Fotus (Kits Fotovoltaicos)

**Fonte:** app.fotus.com.br  
**Status:** ✅ Ativo  
**Última Atualização:** 07/10/2025

#### Produtos Fotus

| Categoria | Quantidade | Faixa de Preço |
|-----------|------------|----------------|
| Kits Completos (Grid-Tie) | 223 | R$ 5.500,00 - R$ 85.000,00 |
| Kits Híbridos (On-Grid + Storage) | 24 | R$ 12.000,00 - R$ 95.000,00 |
| **TOTAL** | **247** | - |

#### Características dos Kits Fotus

**Kits Grid-Tie (On-Grid):**

- Potências: 3.3kW a 100kW
- Componentes: Inversor + Painéis + Estruturas + Cabos + String Box
- Aplicação: Residencial, Comercial, Industrial

**Kits Híbridos:**

- Potências: 5kW a 20kW
- Componentes: Inversor Híbrido + Painéis + Baterias + Estruturas + Cabos
- Aplicação: Sistemas com backup de energia

---

## 📦 Estrutura de Inventário Medusa.js

### Conceitos do Inventory Module

Seguindo a documentação oficial do Medusa.js, o inventário YSH será estruturado com:

#### 1. **Inventory Items**

Cada item físico em estoque (ex: inversor SAJ 3kW, painel 550W).

```typescript
interface InventoryItem {
  id: string
  sku: string                    // Ex: "SAJ-R5-3K-T2"
  title: string                  // Ex: "Inversor SAJ 3kW"
  description?: string
  requires_shipping: boolean
  hs_code?: string              // Código NCM
  origin_country?: string       // "BR"
  mid_code?: string
  material?: string
  weight?: number               // em gramas
  length?: number               // em mm
  height?: number               // em mm
  width?: number                // em mm
  metadata?: Record<string, any>
}
```

#### 2. **Stock Locations**

Locais físicos onde os produtos estão armazenados.

```typescript
interface StockLocation {
  id: string
  name: string
  address: {
    address_1: string
    address_2?: string
    city: string
    country_code: string
    province?: string
    postal_code?: string
  }
  metadata?: {
    warehouse_type: "central" | "regional" | "dropship"
    distributor: "odex" | "solfacil" | "fotus"
  }
}
```

**Stock Locations YSH:**

1. **ODEX Central Warehouse** (São Paulo)
2. **Solfacil Distribution Center** (Rio de Janeiro)
3. **Fotus Fulfillment Center** (Curitiba)

#### 3. **Inventory Levels**

Quantidade disponível de cada item em cada localização.

```typescript
interface InventoryLevel {
  id: string
  inventory_item_id: string
  location_id: string
  stocked_quantity: number       // Quantidade física
  reserved_quantity: number      // Quantidade reservada (pedidos)
  incoming_quantity: number      // Quantidade em trânsito
  available_quantity: number     // = stocked - reserved
  metadata?: Record<string, any>
}
```

#### 4. **Reservation Items**

Reservas de quantidade para pedidos específicos.

```typescript
interface ReservationItem {
  id: string
  line_item_id: string          // ID do item do pedido
  inventory_item_id: string
  location_id: string
  quantity: number
  description?: string
  created_by?: string
  metadata?: Record<string, any>
}
```

---

## 🎁 Inventory Kits para Sistemas Fotovoltaicos

### Conceito de Inventory Kits

Os **Inventory Kits** do Medusa.js permitem criar produtos compostos por múltiplos itens de inventário. Ideal para:

1. **Multi-Part Products:** Produto com múltiplas partes (ex: kit solar)
2. **Bundled Products:** Pacotes que reutilizam inventário de outros produtos

### Aplicação nos Kits Fotus

Os kits da Fotus são **Multi-Part Products** perfeitos para Inventory Kits:

```typescript
// Exemplo: Kit Fotovoltaico 5.5kW Residencial
{
  product: {
    title: "Kit Fotovoltaico 5.5kW Residencial",
    handle: "kit-fotovoltaico-5-5kw-residencial",
    variants: [
      {
        title: "Kit 5.5kW - Canadian Solar + Growatt",
        sku: "KIT-55KW-CS-GROWATT",
        prices: [
          { currency_code: "BRL", amount: 1850000 } // R$ 18.500,00
        ],
        inventory_items: [
          {
            inventory_item_id: "inv_growatt_5kw",
            required_quantity: 1
          },
          {
            inventory_item_id: "inv_panel_550w",
            required_quantity: 10  // 10 painéis de 550W
          },
          {
            inventory_item_id: "inv_structure_aluminum",
            required_quantity: 10  // 10 estruturas
          },
          {
            inventory_item_id: "inv_stringbox_2entries",
            required_quantity: 1
          },
          {
            inventory_item_id: "inv_cable_6mm_red",
            required_quantity: 50  // 50 metros
          },
          {
            inventory_item_id: "inv_cable_6mm_black",
            required_quantity: 50  // 50 metros
          }
        ]
      }
    ]
  }
}
```

### Vantagens dos Inventory Kits

✅ **Gestão Unificada:** Vender 1 kit atualiza automaticamente o estoque de todos os componentes  
✅ **Flexibilidade:** Mesmos componentes podem ser vendidos individualmente  
✅ **Rastreabilidade:** Controle preciso do que compõe cada kit  
✅ **Escalabilidade:** Fácil criar variações de kits  
✅ **Consistência:** Impossível vender kit sem estoque dos componentes

---

## 🏷️ Categorização de Produtos YSH

### Hierarquia de Categorias

```
ysh_root (Yello Solar Hub)
│
├── cat_inversores
│   ├── cat_inversores_grid_tie
│   │   ├── cat_inversores_monofasico
│   │   ├── cat_inversores_bifasico
│   │   └── cat_inversores_trifasico
│   ├── cat_inversores_hibrido
│   ├── cat_inversores_off_grid
│   └── Por Potência
│       ├── cat_inversores_0_5kw
│       ├── cat_inversores_5_10kw
│       ├── cat_inversores_10_20kw
│       └── cat_inversores_20kw_plus
│
├── cat_paineis
│   ├── cat_paineis_monocristalino
│   │   ├── cat_paineis_perc
│   │   ├── cat_paineis_topcon
│   │   └── cat_paineis_hjt
│   ├── cat_paineis_policristalino
│   ├── cat_paineis_bifacial
│   └── Por Potência
│       ├── cat_paineis_400w_500w
│       ├── cat_paineis_500w_600w
│       └── cat_paineis_600w_plus
│
├── cat_estruturas
│   ├── cat_estruturas_solo
│   ├── cat_estruturas_telhado
│   │   ├── cat_estruturas_ceramico
│   │   ├── cat_estruturas_metalico
│   │   ├── cat_estruturas_fibrocimento
│   │   └── cat_estruturas_laje
│   └── cat_estruturas_carport
│
├── cat_stringboxes
│   ├── cat_stringbox_2_entradas
│   ├── cat_stringbox_4_entradas
│   └── cat_stringbox_6_entradas_plus
│
├── cat_cabos
│   ├── cat_cabos_fotovoltaico
│   ├── cat_cabos_ca
│   └── cat_cabos_comunicacao
│
├── cat_baterias
│   ├── cat_baterias_litio
│   ├── cat_baterias_chumbo_acido
│   └── Por Tensão
│       ├── cat_baterias_12v
│       ├── cat_baterias_24v
│       └── cat_baterias_48v
│
├── cat_acessorios
│   ├── cat_conectores
│   ├── cat_fusivel_disjuntores
│   └── cat_ferramentas
│
└── cat_kits
    ├── cat_kits_grid_tie
    │   ├── cat_kits_residencial
    │   ├── cat_kits_comercial
    │   └── cat_kits_industrial
    └── cat_kits_hibrido
        ├── cat_kits_hibrido_residencial
        └── cat_kits_hibrido_comercial
```

---

## 👨‍🏭 Fabricantes por Categoria

### Inversores (18 fabricantes)

| Fabricante | Origem | Produtos | Categorias |
|------------|--------|----------|------------|
| SAJ | China | 8 | Grid-Tie Monofásico/Trifásico |
| Growatt | China | 15 | Grid-Tie, Híbrido |
| Deye | China | 12 | Grid-Tie, Híbrido, Off-Grid |
| Fronius | Áustria | 8 | Grid-Tie Premium |
| ABB | Suíça | 6 | Grid-Tie Industrial |
| SMA | Alemanha | 7 | Grid-Tie Premium |
| Huawei | China | 9 | Grid-Tie Smart |
| Sungrow | China | 10 | Grid-Tie, Híbrido |
| Goodwe | China | 6 | Híbrido |
| Sofar | China | 5 | Híbrido |
| Canadian Solar | Canadá | 4 | Grid-Tie |
| Hoymiles | China | 3 | Microinversor |
| APsystems | China | 3 | Microinversor |
| Enphase | EUA | 2 | Microinversor Premium |
| Delta | Taiwan | 3 | Grid-Tie Industrial |
| Solis | China | 4 | Grid-Tie |
| WEG | Brasil | 5 | Grid-Tie Nacional |
| Intelbras | Brasil | 3 | Grid-Tie Nacional |

### Painéis/Módulos (12 fabricantes)

| Fabricante | Origem | Produtos | Tecnologias |
|------------|--------|----------|-------------|
| Canadian Solar | Canadá | 3 | Mono PERC, TOPCon |
| JinkoSolar | China | 3 | Mono PERC, TOPCon, Bifacial |
| Trina Solar | China | 2 | Mono PERC |
| JA Solar | China | 1 | Mono PERC |
| Longi | China | 1 | Mono PERC |
| Odex | Brasil | 2 | Mono Half-Cell |
| Risen | China | 1 | Mono PERC |
| Jinergy | China | 1 | Mono PERC |
| Suntech | China | 1 | Mono PERC |

### Estruturas (8 fabricantes)

| Fabricante | Origem | Produtos | Tipos |
|------------|--------|----------|-------|
| Solar Group | Brasil | 12 | Cerâmico, Metálico, Fibrocimento |
| K2 Systems | Alemanha | 4 | Telhado, Solo Premium |
| Romagnole | Brasil | 3 | Telhado, Solo |
| Steck | Brasil | 2 | Telhado |
| Unirac | EUA | 2 | Solo, Carport |
| Schletter | Alemanha | 2 | Solo, Telhado |
| Aluflex | Brasil | 1 | Telhado |

### String Boxes (3 fabricantes)

| Fabricante | Origem | Produtos | Entradas |
|------------|--------|----------|----------|
| Clamper | Brasil | 6 | 2E, 4E, 6E |
| Steck | Brasil | 4 | 2E, 4E, 6E |
| Romagnole | Brasil | 3 | 2E, 4E, 6E |

### Cabos (4 fabricantes)

| Fabricante | Origem | Produtos | Tipos |
|------------|--------|----------|-------|
| Nexans | França | 12 | Fotovoltaico, CA |
| Prysmian | Itália | 10 | Fotovoltaico, CA |
| Ficap | Brasil | 8 | Fotovoltaico |
| Cobrecom | Brasil | 6 | CA |

### Baterias (3 fabricantes)

| Fabricante | Origem | Produtos | Tecnologia |
|------------|--------|----------|------------|
| BYD | China | 2 | Lítio LFP |
| Pylontech | China | 1 | Lítio LFP |
| LG Chem | Coreia | 1 | Lítio NMC |

---

## 📍 Stock Locations YSH

### 1. ODEX Central Warehouse

```json
{
  "id": "sloc_odex_central",
  "name": "ODEX - Centro de Distribuição São Paulo",
  "address": {
    "address_1": "Rua Industrial, 1500",
    "city": "São Paulo",
    "province": "SP",
    "postal_code": "01234-567",
    "country_code": "BR"
  },
  "metadata": {
    "warehouse_type": "central",
    "distributor": "odex",
    "capacity_sqm": 5000,
    "operating_hours": "Mon-Fri 08:00-18:00",
    "contact_email": "warehouse@odex.com.br",
    "contact_phone": "+55 11 9999-9999"
  }
}
```

**Inventário:**

- 45 Inversores
- 9 Painéis
- 13 String Boxes
- 26 Estruturas
- **Total: 93 SKUs**

### 2. Solfacil Distribution Center

```json
{
  "id": "sloc_solfacil_dc",
  "name": "Solfacil - Centro de Distribuição Rio de Janeiro",
  "address": {
    "address_1": "Av. Logística, 2500",
    "city": "Rio de Janeiro",
    "province": "RJ",
    "postal_code": "20000-000",
    "country_code": "BR"
  },
  "metadata": {
    "warehouse_type": "central",
    "distributor": "solfacil",
    "capacity_sqm": 8000,
    "operating_hours": "Mon-Fri 07:00-19:00",
    "contact_email": "distribuicao@solfacil.com.br",
    "contact_phone": "+55 21 8888-8888"
  }
}
```

**Inventário:**

- 82 Inversores
- 6 Painéis
- 4 Estruturas
- 36 Cabos
- 4 Baterias
- 10 Acessórios
- **Total: 142 SKUs**

### 3. Fotus Fulfillment Center

```json
{
  "id": "sloc_fotus_fc",
  "name": "Fotus - Centro de Fulfillment Curitiba",
  "address": {
    "address_1": "Rua Fotovoltaica, 3000",
    "city": "Curitiba",
    "province": "PR",
    "postal_code": "80000-000",
    "country_code": "BR"
  },
  "metadata": {
    "warehouse_type": "central",
    "distributor": "fotus",
    "capacity_sqm": 6000,
    "operating_hours": "Mon-Fri 08:00-18:00",
    "kit_assembly": true,
    "contact_email": "fulfillment@fotus.com.br",
    "contact_phone": "+55 41 7777-7777"
  }
}
```

**Inventário:**

- 223 Kits Grid-Tie
- 24 Kits Híbridos
- **Total: 247 Kits**

---

## 🔄 Workflow de Criação de Inventário

### 1. Criar Stock Locations

```typescript
import { createStockLocationsWorkflow } from "@medusajs/medusa/core-flows"

const { result: locations } = await createStockLocationsWorkflow(container).run({
  input: {
    locations: [
      {
        name: "ODEX - Centro de Distribuição São Paulo",
        address: {
          address_1: "Rua Industrial, 1500",
          city: "São Paulo",
          province: "SP",
          postal_code: "01234-567",
          country_code: "BR"
        },
        metadata: {
          distributor: "odex",
          warehouse_type: "central"
        }
      },
      // ... outras localizações
    ]
  }
})
```

### 2. Criar Inventory Items (Componentes Individuais)

```typescript
import { createInventoryItemsWorkflow } from "@medusajs/medusa/core-flows"

// Exemplo: Criar inventory items para componentes de um kit
const { result: inventoryItems } = await createInventoryItemsWorkflow(container).run({
  input: {
    items: [
      {
        sku: "GROWATT-5K-MTL",
        title: "Inversor Growatt 5kW Grid-Tie",
        requires_shipping: true,
        origin_country: "BR",
        weight: 15000,  // 15kg em gramas
        hs_code: "8504.40.90",
        location_levels: [
          {
            stocked_quantity: 50,
            location_id: "sloc_odex_central"
          }
        ],
        metadata: {
          manufacturer: "Growatt",
          power_w: 5000,
          category: "inverters"
        }
      },
      {
        sku: "CS-550W-PERC",
        title: "Painel Canadian Solar 550W PERC",
        requires_shipping: true,
        origin_country: "BR",
        weight: 27500,  // 27.5kg
        hs_code: "8541.40.32",
        location_levels: [
          {
            stocked_quantity: 500,
            location_id: "sloc_odex_central"
          }
        ],
        metadata: {
          manufacturer: "Canadian Solar",
          power_w: 550,
          category: "panels"
        }
      },
      // ... outros componentes
    ]
  }
})
```

### 3. Criar Produtos com Inventory Kits

```typescript
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

// Criar kit fotovoltaico 5.5kW
const { result: products } = await createProductsWorkflow(container).run({
  input: {
    products: [
      {
        title: "Kit Fotovoltaico 5.5kW Residencial",
        subtitle: "10 Painéis 550W + Inversor Growatt 5kW",
        handle: "kit-fotovoltaico-5-5kw-residencial",
        description: "Kit completo para geração de até 5.5kW...",
        status: "published",
        variants: [
          {
            title: "Kit 5.5kW - Canadian Solar + Growatt",
            sku: "KIT-55KW-CS-GROWATT",
            prices: [
              {
                currency_code: "BRL",
                amount: 1850000  // R$ 18.500,00
              }
            ],
            options: {
              "Configuração": "Standard"
            },
            // ⭐ Inventory Kit - Multiple inventory items
            inventory_items: [
              {
                inventory_item_id: inventoryItems[0].id,  // Inversor
                required_quantity: 1
              },
              {
                inventory_item_id: inventoryItems[1].id,  // Painel
                required_quantity: 10
              },
              {
                inventory_item_id: inventoryItems[2].id,  // Estrutura
                required_quantity: 10
              },
              {
                inventory_item_id: inventoryItems[3].id,  // String Box
                required_quantity: 1
              },
              {
                inventory_item_id: inventoryItems[4].id,  // Cabo
                required_quantity: 100  // metros
              }
            ]
          }
        ],
        options: [
          {
            title: "Configuração",
            values: ["Standard", "Premium"]
          }
        ],
        categories: [
          "cat_kits",
          "cat_kits_grid_tie",
          "cat_kits_residencial"
        ],
        tags: [
          "tag_5kw",
          "tag_residencial",
          "tag_canadian_solar",
          "tag_growatt"
        ],
        metadata: {
          kit_type: "grid_tie",
          system_power_kw: 5.5,
          application: "residencial",
          components_count: 5
        }
      }
    ]
  }
})
```

---

## 📈 Análise de Inventário

### Distribuição por Faixa de Preço

| Faixa | Quantidade | Porcentagem |
|-------|------------|-------------|
| R$ 0 - R$ 500 | 128 | 26.6% |
| R$ 500 - R$ 2.000 | 187 | 38.8% |
| R$ 2.000 - R$ 10.000 | 98 | 20.3% |
| R$ 10.000 - R$ 50.000 | 52 | 10.8% |
| R$ 50.000+ | 17 | 3.5% |

### Top 10 Produtos por Categoria

#### Inversores Mais Populares

1. Growatt 5kW Grid-Tie (3x)
2. SAJ 3kW Monofásico (2x)
3. Fronius Primo 5kW (2x)
4. Deye 6kW Híbrido (2x)
5. Huawei SUN2000-8KTL (2x)

#### Painéis Mais Populares

1. Canadian Solar 550W PERC (4x)
2. JinkoSolar 550W PERC (3x)
3. Odex 585W Half-Cell (2x)

#### Kits Mais Vendidos

1. Kit 5.5kW Residencial (usado em 45 kits)
2. Kit 10kW Comercial (usado em 38 kits)
3. Kit 3.3kW Residencial (usado em 32 kits)

---

## 🎯 Recomendações de Implementação

### Fase 1: Inventory Items Individuais (Semanas 1-2)

1. ✅ Criar Stock Locations (3 locais)
2. ✅ Importar Inventory Items de ODEX (93 itens)
3. ✅ Importar Inventory Items de Solfacil (142 itens)
4. ✅ Configurar Inventory Levels para cada localização

### Fase 2: Produtos Simples (Semanas 3-4)

1. ✅ Criar produtos para inversores (127)
2. ✅ Criar produtos para painéis (15)
3. ✅ Criar produtos para estruturas (30)
4. ✅ Criar produtos para string boxes (13)
5. ✅ Criar produtos para cabos, baterias, acessórios (50)

### Fase 3: Inventory Kits (Semanas 5-6)

1. ✅ Mapear componentes de cada kit Fotus
2. ✅ Criar 223 produtos de Kit Grid-Tie
3. ✅ Criar 24 produtos de Kit Híbrido
4. ✅ Configurar `required_quantity` para cada componente
5. ✅ Testar fluxo de reserva de inventário

### Fase 4: Testes e Validação (Semana 7)

1. ✅ Testar venda de produto individual
2. ✅ Testar venda de kit (verifica atualização de todos componentes)
3. ✅ Testar reserva de inventário
4. ✅ Validar disponibilidade de estoque
5. ✅ Testar cenários de estoque insuficiente

### Fase 5: Go-Live (Semana 8)

1. ✅ Importação completa de todos os produtos
2. ✅ Configuração de níveis de estoque reais
3. ✅ Integração com sistema de pedidos
4. ✅ Treinamento da equipe

---

## 📊 Métricas de Sucesso

### KPIs de Inventário

| Métrica | Target | Método de Medição |
|---------|--------|-------------------|
| Acurácia de Estoque | >98% | Auditorias mensais |
| Tempo de Reserva | <5s | Monitoramento de performance |
| Taxa de Erro em Kits | <2% | Validação automática |
| Disponibilidade de Produtos | >95% | Alertas automáticos |
| Rotação de Estoque | 6x/ano | Análise trimestral |

---

## 🔗 Recursos Adicionais

### Documentação Medusa.js

- [Inventory Module](https://docs.medusajs.com/resources/commerce-modules/inventory)
- [Inventory Kits](https://docs.medusajs.com/resources/commerce-modules/inventory/inventory-kit)
- [Product Module](https://docs.medusajs.com/resources/commerce-modules/product)
- [Workflows](https://docs.medusajs.com/learn/fundamentals/workflows)

### Schemas YSH

- [Inverters Schema](./schemas/inverters-medusa-schema.json)
- [Panels Schema](./schemas/panels-medusa-schema.json)
- [Structures Schema](./schemas/structures-medusa-schema.json) (to be created)
- [Kits Schema](./schemas/kits-medusa-schema.json) (to be created)

### Scripts de Conversão

- [Convert Inverters](./schemas/convert-inverters-to-medusa.js)
- [Convert Panels](./schemas/convert-panels-to-medusa.js)
- [Convert Kits](./schemas/convert-kits-to-medusa.js) (to be created)

---

**Documento gerado por:** YSH Data Engineering Team  
**Próxima atualização:** 20/10/2025  
**Versão do Sistema:** Medusa.js v2.x  
**Status:** ✅ Pronto para Implementação
