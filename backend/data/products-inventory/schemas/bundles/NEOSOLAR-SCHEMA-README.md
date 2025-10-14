# 📦 NeoSolar Schemas - Medusa.js v2.x

## 🎯 Visão Geral

Schemas específicos para produtos **NeoSolar** seguindo padrões Medusa.js v2.x:

- ✅ **Kits Solares** (Off-Grid, On-Grid, Híbridos)
- ✅ **Baterias** (Chumbo-Ácido, Lítio, LiFePO4)
- ✅ **Inventory Kits Pattern** (Multi-part Products)
- ✅ **Conversão Automática** de dados NeoSolar

---

## 📁 Arquivos

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| **neosolar-kits-medusa-schema.json** | Schema para kits NeoSolar | ✅ |
| **neosolar-batteries-medusa-schema.json** | Schema para baterias | ✅ |
| **convert-neosolar-to-medusa.js** | Conversor automático | ✅ |
| **NEOSOLAR-SCHEMA-README.md** | Esta documentação | ✅ |

---

## 🔄 Conversão Rápida

### 1. Converter Kits NeoSolar

```bash
cd schemas/bundles/
node convert-neosolar-to-medusa.js
```

**Input:** `../../distributors/neosolar/neosolar-kits-normalized.json`
**Output:** `neosolar-kits-medusa.json`

### 2. Resultado

```json
{
  "metadata": {
    "generated_at": "2025-10-14T12:00:00Z",
    "version": "2.0.0",
    "medusa_version": "v2.x",
    "total_products": 100
  },
  "stats": {
    "processed": 95,
    "skipped": 3,
    "errors": 2
  },
  "products": [
    {
      "title": "Kit Energia Solar Off Grid - 1.38kWp 200Ah 48V Lítio",
      "sku": "NEO-OG-1.38KWP-22691",
      "handle": "kit-energia-solar-off-grid-138kwp-litio-48v",
      "variants": [{
        "inventory_items": [
          {
            "inventory_item_id": "inv_item_panel_NEO-22691_0",
            "required_quantity": 3,
            "component_type": "panel"
          }
        ]
      }]
    }
  ]
}
```

---

## 📋 Características dos Schemas

### 🎯 Kits NeoSolar

**Tipos de Sistema:**

- `Solar Kit Off-Grid` → Sistemas autônomos com bateria
- `Solar Kit On-Grid` → Sistemas conectados à rede
- `Solar Kit Híbrido` → Sistemas com bateria + rede

**SKUs Padronizados:**

- Off-Grid: `NEO-OG-{POWER}KWP-{ID}`
- On-Grid: `NEO-GT-{POWER}KWP-{ID}`
- Híbrido: `NEO-HY-{POWER}KWP-{ID}`

**Categorias Automáticas:**

```
cat_kits
cat_kits_neosolar
cat_kits_off_grid        # Baseado no tipo
cat_kits_ate_1kwp        # Baseado na potência
```

**Tags Automáticas:**

```
tag_neosolar
tag_off_grid             # Baseado no tipo
tag_1kwp                 # Baseado na potência
tag_litio                # Baseado na bateria
tag_sunova               # Baseado nos painéis
```

### 🔋 Baterias

**Tecnologias Suportadas:**

- `Chumbo-Ácido` / `Chumbo-Ácido AGM` / `Chumbo-Ácido Gel`
- `Lítio` / `LiFePO4` / `Lítio NMC`

**Especificações Técnicas:**

- Capacidade (Ah / kWh)
- Voltagem (6V, 12V, 24V, 48V)
- Ciclos de vida
- DOD recomendado
- Temperaturas de operação
- Eficiência round-trip

---

## 🎨 Estrutura dos Produtos

### Kit Off-Grid Exemplo

```json
{
  "title": "Kit Energia Solar Off Grid - 1.38kWp 200Ah 48V Lítio",
  "subtitle": "1.38kWp Off-Grid - 3x 460W Sunova + Bateria Lítio 48V 200Ah",
  "handle": "kit-energia-solar-off-grid-138kwp-litio-48v",
  "external_id": "NEO-22691",
  "options": [
    {
      "title": "Potência",
      "values": ["1.38kWp"]
    },
    {
      "title": "Tipo de Sistema",
      "values": ["Off-Grid"]
    },
    {
      "title": "Voltagem Bateria",
      "values": ["48V"]
    },
    {
      "title": "Capacidade Bateria",
      "values": ["200Ah"]
    },
    {
      "title": "Tecnologia Bateria",
      "values": ["Lítio"]
    }
  ],
  "variants": [{
    "sku": "NEO-OG-1.38KWP-48V-200AH-LI",
    "manage_inventory": false,
    "inventory_items": [
      {
        "inventory_item_id": "inv_item_panel_sunova_460w",
        "required_quantity": 3,
        "component_type": "panel"
      },
      {
        "inventory_item_id": "inv_item_mppt_epever_30a",
        "required_quantity": 1,
        "component_type": "charge_controller"
      },
      {
        "inventory_item_id": "inv_item_battery_li_48v_200ah",
        "required_quantity": 1,
        "component_type": "battery"
      }
    ],
    "prices": [
      {
        "currency_code": "BRL",
        "amount": 850000
      },
      {
        "currency_code": "BRL",
        "amount": 807500,
        "min_quantity": 2,
        "max_quantity": 4
      },
      {
        "currency_code": "BRL",
        "amount": 765000,
        "min_quantity": 5
      }
    ]
  }],
  "metadata": {
    "distributor": "neosolar",
    "product_type": "kit",
    "is_bundle": true,
    "neosolar_specs": {
      "system_type": "Solar Kit Off-Grid",
      "potencia_kwp": 1.38,
      "estimated_autonomy_hours": 48,
      "estimated_generation_kwh_month": 207,
      "components": {
        "panels": [{
          "brand": "Sunova",
          "power_w": 460,
          "quantity": 3
        }],
        "batteries": [{
          "brand": "Alta Performance",
          "capacity_ah": 200,
          "voltage_v": 48,
          "technology": "Lítio",
          "quantity": 1
        }]
      }
    }
  }
}
```

---

## 🎯 Aplicações

### Off-Grid

- Locais sem acesso à rede elétrica
- Sítios, fazendas e casas de campo
- Sistemas autônomos com autonomia energética
- Backup de energia para equipamentos essenciais

### On-Grid

- Residências urbanas
- Comércios e pequenas empresas
- Redução da conta de energia
- Microgeração distribuída

### Híbrido

- Backup + economia
- Sistemas críticos
- Horários de ponta
- Autonomia parcial

---

## 🔧 Configuração do Conversor

### Parâmetros

```javascript
const CONFIG = {
    INPUT_FILE: '../neosolar/neosolar-kits-normalized.json',
    OUTPUT_FILE: 'neosolar-kits-medusa.json',
    MAX_PRODUCTS: 100, // Limite para teste
    BASE_CURRENCY: 'BRL'
};
```

### Customização

**Alterar limite de produtos:**

```javascript
MAX_PRODUCTS: 1000  // Processar até 1000 kits
```

**Alterar desconto tiered:**

```javascript
// No método generateTieredPricing
Math.round(baseAmount * 0.90)  // 10% desconto
```

**Filtrar por tipo:**

```javascript
// Adicionar no início do convertKit
if (!kitData.type.includes('Off-Grid')) {
    return null; // Ignorar não Off-Grid
}
```

---

## ✅ Validação

### Verificar SKUs únicos

```bash
jq '.products[].variants[].sku' neosolar-kits-medusa.json | sort | uniq -d
```

### Verificar handles únicos

```bash
jq '.products[].handle' neosolar-kits-medusa.json | sort | uniq -d
```

### Validar preços

```bash
jq '.products[].variants[].prices[].amount' neosolar-kits-medusa.json | awk '$1 <= 0'
```

### Estatísticas

```bash
jq '.stats' neosolar-kits-medusa.json
```

---

## 🚀 Próximos Passos

1. **Executar conversão completa**
2. **Importar no Medusa.js** usando `import-catalog-to-medusa.ts`
3. **Criar inventory items** para componentes individuais
4. **Configurar price rules** por região/customer group
5. **Processar imagens** com Vision AI

---

**Criado por:** YSH Solar Development Team  
**Data:** 14 de Outubro de 2025  
**Versão:** 2.0.0
