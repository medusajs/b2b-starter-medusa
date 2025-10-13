# Schema de Inversores Solares - Padrão Medusa.js

Este schema define a estrutura padronizada para inversores solares no formato compatível com o **Medusa.js Product Module**.

## 📋 Visão Geral

O schema foi desenvolvido com base na documentação oficial do Medusa.js:

- [Product Module Documentation](https://docs.medusajs.com/resources/commerce-modules/product)
- [Medusa Product Models](https://github.com/medusajs/medusa/tree/develop/packages/modules/product/src/models)
- [Create Multi-Part Products](https://docs.medusajs.com/user-guide/products/create/multi-part)
- [Create Bundle Products](https://docs.medusajs.com/user-guide/products/create/bundle)

## 🎯 Características Principais

### 1. **Compatibilidade Total com Medusa.js**

- Segue o padrão de Product, ProductVariant, ProductOption do Medusa
- Suporta todos os campos nativos do Medusa Product Module
- Pronto para importação via Medusa API ou workflows

### 2. **Sistema de Variantes Flexível**

- Suporte a múltiplas variantes baseadas em opções (Potência, Voltagem, Fases)
- Cada variante pode ter:
  - SKU único
  - Preços diferenciados
  - Gestão de estoque independente
  - Especificações técnicas próprias

### 3. **Gestão de Preços Avançada**

- Suporte a múltiplas moedas
- Preços em centavos (padrão Medusa)
- Tiered pricing (preços por quantidade)
- Price rules para diferentes contextos (customer groups, regions)

### 4. **Metadados Técnicos Completos**

- Especificações elétricas detalhadas
- Informações de certificação
- Dados de garantia
- Rastreabilidade de fonte

### 5. **SEO e Marketing**

- Campos de SEO integrados
- Sistema de tags e categorias
- Gestão de imagens múltiplas
- Descrições ricas

## 📦 Estrutura do Schema

### Campos Principais

```json
{
  "title": "Nome do produto",
  "subtitle": "Subtítulo opcional",
  "handle": "url-slug-unico",
  "description": "Descrição detalhada",
  "status": "published | draft | proposed | rejected",
  "discountable": true,
  "options": [...],
  "variants": [...],
  "metadata": {...}
}
```

### Options (Opções de Variação)

As opções definem os **eixos de variação** do produto:

```json
{
  "options": [
    {
      "title": "Potência",
      "values": ["3kW", "4.2kW", "5kW"]
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

### Variants (Variantes do Produto)

Cada variante é uma **combinação específica** das opções:

```json
{
  "variants": [
    {
      "title": "SAJ R5-3K-T2 - 3kW / 220V / Monofásico",
      "sku": "SAJ-R5-3K-T2-220V-MONO",
      "options": {
        "Potência": "3kW",
        "Voltagem": "220V",
        "Fases": "Monofásico"
      },
      "prices": [
        {
          "currency_code": "BRL",
          "amount": 159900
        }
      ],
      "inventory_quantity": 15,
      "manage_inventory": true,
      "allow_backorder": false
    }
  ]
}
```

### Metadata (Metadados Customizados)

Informações específicas de inversores solares:

```json
{
  "metadata": {
    "manufacturer": "SAJ",
    "distributor": "ODEX",
    "technical_specs": {
      "type": "GRID_TIE",
      "power_kw": 3.0,
      "voltage_v": 220,
      "phases": "Monofásico",
      "mppt_count": 2,
      "efficiency": 97.6,
      "protection_degree": "IP65",
      "communication": ["WiFi", "Ethernet"],
      "certifications": ["INMETRO", "IEC 62109"],
      "warranty_years": 10
    }
  }
}
```

## 🚀 Como Usar

### 1. Criação de Produto via Medusa API

```javascript
import { MedusaClient } from "@medusajs/medusa-js"

const medusa = new MedusaClient({
  baseUrl: "http://localhost:9000",
  maxRetries: 3,
})

// Autenticar
await medusa.admin.auth.getToken({
  email: "admin@example.com",
  password: "password"
})

// Criar produto
const product = await medusa.admin.products.create({
  title: "Inversor Grid-Tie SAJ R5-3K-T2 BRL 3kW",
  subtitle: "3kW Monofásico 220V - 2 MPPT",
  handle: "inversor-saj-r5-3k-t2-3kw-monofasico-220v",
  description: "Inversor Grid-Tie de alta eficiência...",
  status: "published",
  discountable: true,
  options: [
    { title: "Potência", values: ["3kW"] },
    { title: "Voltagem", values: ["220V"] },
    { title: "Fases", values: ["Monofásico"] }
  ],
  variants: [
    {
      title: "SAJ R5-3K-T2 - 3kW / 220V / Monofásico",
      sku: "SAJ-R5-3K-T2-220V-MONO",
      options: {
        "Potência": "3kW",
        "Voltagem": "220V",
        "Fases": "Monofásico"
      },
      prices: [
        {
          currency_code: "BRL",
          amount: 159900 // R$ 1.599,00
        }
      ],
      manage_inventory: true,
      inventory_quantity: 15
    }
  ],
  metadata: {
    manufacturer: "SAJ",
    distributor: "ODEX",
    technical_specs: {
      type: "GRID_TIE",
      power_kw: 3.0,
      mppt_count: 2,
      efficiency: 97.6
    }
  }
})
```

### 2. Criação via Workflow (Recomendado)

```typescript
import { createProductWorkflow } from "@medusajs/medusa/core-flows"

const { result } = await createProductWorkflow(container)
  .run({
    input: {
      title: "Inversor Grid-Tie SAJ R5-3K-T2 BRL 3kW",
      // ... resto dos dados
    }
  })
```

### 3. Importação em Massa

Para importar múltiplos inversores de uma vez, use o formato CSV ou JSON em lote:

```bash
# Via Medusa Admin Dashboard
Admin > Products > Import

# Via CLI
medusa seed -f inverters-import.json
```

## 🔄 Conversão de Dados Existentes

Para converter seus dados atuais de inversores para este schema:

```javascript
// Exemplo de transformação
function transformToMedusaSchema(oldInverterData) {
  return {
    title: oldInverterData.name,
    handle: generateHandle(oldInverterData.name),
    description: oldInverterData.description,
    status: oldInverterData.availability === 'disponivel' ? 'published' : 'draft',
    external_id: oldInverterData.id,
    
    options: [
      {
        title: "Potência",
        values: [oldInverterData.technical_specs?.power_kw + "kW"]
      },
      {
        title: "Voltagem", 
        values: [oldInverterData.technical_specs?.voltage_v + "V"]
      },
      {
        title: "Fases",
        values: [oldInverterData.technical_specs?.phases]
      }
    ],
    
    variants: [
      {
        title: `${oldInverterData.manufacturer} - ${oldInverterData.technical_specs?.power_kw}kW`,
        sku: generateSKU(oldInverterData),
        options: {
          "Potência": oldInverterData.technical_specs?.power_kw + "kW",
          "Voltagem": oldInverterData.technical_specs?.voltage_v + "V",
          "Fases": oldInverterData.technical_specs?.phases
        },
        prices: [
          {
            currency_code: oldInverterData.pricing?.currency || "BRL",
            amount: Math.round(oldInverterData.pricing?.price * 100)
          }
        ]
      }
    ],
    
    metadata: {
      manufacturer: oldInverterData.manufacturer,
      distributor: oldInverterData.source,
      technical_specs: oldInverterData.technical_specs,
      source_data: {
        source_id: oldInverterData.id,
        imported_at: new Date().toISOString()
      }
    }
  }
}

function generateHandle(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function generateSKU(data) {
  return `${data.manufacturer}-${data.model || 'default'}`
    .toUpperCase()
    .replace(/\s+/g, '-')
}
```

## 📊 Campos Técnicos Detalhados

### Especificações Elétricas

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `type` | enum | Tipo de inversor | "GRID_TIE", "OFF_GRID", "HYBRID", "MICROINVERSOR" |
| `power_w` | number | Potência em Watts | 3000 |
| `power_kw` | number | Potência em kW | 3.0 |
| `voltage_v` | number | Tensão de operação | 220 |
| `phases` | enum | Número de fases | "Monofásico", "Bifásico", "Trifásico" |
| `mppt_count` | integer | Número de MPPTs | 2 |
| `efficiency` | number | Eficiência máxima (%) | 97.6 |

### Características DC (Entrada)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `max_dc_voltage_v` | number | Tensão DC máxima |
| `min_dc_voltage_v` | number | Tensão DC mínima |
| `max_dc_current_a` | number | Corrente DC máxima |

### Características AC (Saída)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nominal_ac_voltage_v` | number | Tensão AC nominal |
| `ac_frequency_hz` | number | Frequência AC (50 ou 60 Hz) |

### Proteção e Ambiente

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `protection_degree` | string | Grau de proteção IP | "IP65" |
| `operating_temp_min_c` | number | Temp. mínima operação | -25 |
| `operating_temp_max_c` | number | Temp. máxima operação | 60 |

## 🏷️ Sistema de Categorização

### Categorias Recomendadas

```tsx
cat_inversores (raiz)
├── cat_inversores_grid_tie
│   ├── cat_inversores_monofasicos
│   ├── cat_inversores_bifasicos
│   └── cat_inversores_trifasicos
├── cat_inversores_off_grid
├── cat_inversores_hybrid
└── cat_microinversores
```

### Tags Recomendadas

```tsx
# Por Fabricante
tag_saj, tag_growatt, tag_fronius, tag_sma, tag_deye

# Por Potência
tag_1kw, tag_3kw, tag_5kw, tag_10kw, tag_20kw

# Por Características
tag_wifi, tag_bluetooth, tag_ethernet
tag_2mppt, tag_3mppt, tag_4mppt
tag_monofasico, tag_bifasico, tag_trifasico
```

## 💡 Boas Práticas

### 1. Nomenclatura de Handles

```javascript
// ✅ BOM
"inversor-saj-r5-3k-t2-3kw-monofasico-220v"

// ❌ EVITAR
"Inversor SAJ R5 3K T2 3kW Monofásico 220V"
"inversor_saj_r5_3k_t2"
```

### 2. SKUs Únicos

```javascript
// ✅ BOM - Inclui fabricante, modelo, potência, voltagem
"SAJ-R5-3K-T2-220V-MONO"

// ❌ EVITAR - Genérico demais
"INV-001"
"INVERSOR-3KW"
```

### 3. Preços em Centavos

```javascript
// ✅ CORRETO - R$ 1.599,00 = 159900 centavos
{ currency_code: "BRL", amount: 159900 }

// ❌ ERRADO
{ currency_code: "BRL", amount: 1599 }
{ currency_code: "BRL", amount: 1599.00 }
```

### 4. Gestão de Estoque

```javascript
// ✅ Para produtos físicos com estoque controlado
{
  manage_inventory: true,
  allow_backorder: false,
  inventory_quantity: 15
}

// ✅ Para produtos sob encomenda
{
  manage_inventory: false,
  allow_backorder: true,
  inventory_quantity: 0
}
```

## 🔍 Validação de Schema

Use ferramentas como `ajv` para validar seus dados:

```bash
npm install ajv ajv-formats
```

```javascript
import Ajv from "ajv"
import addFormats from "ajv-formats"

const ajv = new Ajv()
addFormats(ajv)

const schema = require('./inverters-medusa-schema.json')
const validate = ajv.compile(schema)

const isValid = validate(myInverterData)
if (!isValid) {
  console.error(validate.errors)
}
```

## 📚 Recursos Adicionais

- [Medusa Product Module](https://docs.medusajs.com/resources/commerce-modules/product)
- [Medusa JS SDK](https://docs.medusajs.com/resources/commerce-modules/product/js-sdk)
- [Product Workflows](https://docs.medusajs.com/resources/commerce-modules/product/workflows)
- [Admin API Reference](https://docs.medusajs.com/resources/references/admin)

## 🤝 Contribuindo

Para sugerir melhorias neste schema:

1. Teste com dados reais de inversores
2. Valide a compatibilidade com Medusa.js
3. Documente casos de uso específicos
4. Submeta feedback com exemplos

## 📝 Changelog

### v1.0.0 (2025-10-13)

- Schema inicial baseado em Medusa.js Product Module
- Suporte completo a variantes e opções
- Metadados técnicos especializados para inversores
- Exemplos de uso e conversão de dados
- Documentação completa

---

## 🏢 Desenvolvido para o YSH Medusa B2B Store
