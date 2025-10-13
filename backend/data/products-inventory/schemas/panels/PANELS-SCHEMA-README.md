# Schema de Painéis Solares - Padrão Medusa.js

Este schema define a estrutura padronizada para módulos fotovoltaicos (painéis solares) no formato compatível com o **Medusa.js Product Module**.

## 📋 Visão Geral

O schema foi desenvolvido com base na documentação oficial do Medusa.js e nas especificações técnicas da indústria fotovoltaica.

## 🎯 Características Principais

### 1. **Compatibilidade Total com Medusa.js**

- Segue o padrão de Product, ProductVariant, ProductOption do Medusa
- Suporta todos os campos nativos do Medusa Product Module
- Pronto para importação via Medusa API ou workflows

### 2. **Sistema de Variantes Flexível**

- Suporte a múltiplas variantes baseadas em opções (Potência, Tecnologia, Cor da Moldura)
- Cada variante pode ter:
  - SKU único
  - Preços diferenciados
  - Gestão de estoque independente
  - Especificações técnicas próprias

### 3. **Especificações Técnicas Completas**

- **Características elétricas**: Pmax, Vmp, Imp, Voc, Isc
- **Coeficientes de temperatura**: Pmax, Voc, Isc
- **Dimensões e peso**: Comprimento, largura, espessura
- **Especificações mecânicas**: Moldura, vidro, caixa de junção
- **Garantias**: Produto e performance (linear)
- **Certificações**: IEC, UL, INMETRO

### 4. **Gestão de Preços Avançada**

- Suporte a múltiplas moedas
- Preços em centavos (padrão Medusa)
- Tiered pricing (preços por quantidade)
- Price rules para diferentes contextos

### 5. **SEO e Marketing**

- Campos de SEO integrados
- Sistema de tags e categorias
- Gestão de imagens múltiplas
- Descrições ricas

## 📦 Estrutura do Schema

### Campos Principais

```json
{
  "title": "Nome do painel",
  "subtitle": "Subtítulo técnico",
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
      "values": ["545W", "550W", "555W"]
    },
    {
      "title": "Tecnologia",
      "values": ["Monocristalino PERC", "Monocristalino TOPCon"]
    },
    {
      "title": "Cor da Moldura",
      "values": ["Preta", "Prata"]
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
      "title": "Canadian Solar 550W - Mono PERC - Moldura Preta",
      "sku": "CS-HIKU6-550W-PERC-BLACK",
      "options": {
        "Potência": "550W",
        "Tecnologia": "Monocristalino PERC",
        "Cor da Moldura": "Preta"
      },
      "prices": [
        {
          "currency_code": "BRL",
          "amount": 49000
        }
      ],
      "inventory_quantity": 500,
      "manage_inventory": true
    }
  ]
}
```

### Metadata (Especificações Técnicas)

Informações técnicas especializadas para painéis solares:

```json
{
  "metadata": {
    "manufacturer": "Canadian Solar",
    "model": "HiKu6 CS6W-550MS",
    "technical_specs": {
      "power_w": 550,
      "technology": "Monocristalino PERC",
      "efficiency": 21.3,
      "number_of_cells": 144,
      "bifacial": false,
      "electrical_characteristics": {
        "pmax_w": 550,
        "vmp_v": 41.7,
        "imp_a": 13.19,
        "voc_v": 49.8,
        "isc_a": 13.95
      },
      "temperature_coefficients": {
        "pmax": -0.34,
        "voc": -0.25,
        "isc": 0.05
      },
      "warranties": {
        "product_warranty_years": 12,
        "performance_warranty_years": 25,
        "linear_warranty": true
      }
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

const product = await medusa.admin.products.create({
  title: "Módulo Fotovoltaico Canadian Solar 550W",
  subtitle: "550W Monocristalino PERC - Eficiência 21.3%",
  handle: "modulo-canadian-solar-550w-hiku6-mono-perc",
  description: "Módulo fotovoltaico de alta eficiência...",
  status: "published",
  options: [
    { title: "Potência", values: ["550W"] },
    { title: "Tecnologia", values: ["Monocristalino PERC"] }
  ],
  variants: [
    {
      title: "Canadian Solar 550W - Mono PERC",
      sku: "CS-HIKU6-550W-PERC",
      options: {
        "Potência": "550W",
        "Tecnologia": "Monocristalino PERC"
      },
      prices: [
        {
          currency_code: "BRL",
          amount: 49000 // R$ 490,00
        }
      ]
    }
  ],
  metadata: {
    manufacturer: "Canadian Solar",
    technical_specs: {
      power_w: 550,
      efficiency: 21.3
    }
  }
})
```

## 📊 Campos Técnicos Detalhados

### Características Elétricas (STC)

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `pmax_w` | number | Potência máxima (W) | 550 |
| `vmp_v` | number | Tensão no ponto máximo (V) | 41.7 |
| `imp_a` | number | Corrente no ponto máximo (A) | 13.19 |
| `voc_v` | number | Tensão circuito aberto (V) | 49.8 |
| `isc_a` | number | Corrente curto-circuito (A) | 13.95 |

### Coeficientes de Temperatura

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `pmax` | number | Coef. temp. Pmax (%/°C) | -0.34 |
| `voc` | number | Coef. temp. Voc (%/°C) | -0.25 |
| `isc` | number | Coef. temp. Isc (%/°C) | 0.05 |

### Tecnologias Suportadas

- **Monocristalino**: Células de silício monocristalino padrão
- **Monocristalino PERC**: Passivated Emitter and Rear Cell
- **Monocristalino HJT**: Heterojunction Technology
- **Monocristalino TOPCon**: Tunnel Oxide Passivated Contact
- **Policristalino**: Células de silício policristalino
- **Half-Cell**: Células cortadas ao meio
- **Bifacial**: Captação de energia em ambos os lados

## 🏷️ Sistema de Categorização

### Categorias Recomendadas

```
cat_paineis (raiz)
├── cat_paineis_monocristalino
│   ├── cat_paineis_perc
│   ├── cat_paineis_topcon
│   └── cat_paineis_hjt
├── cat_paineis_policristalino
├── cat_paineis_bifacial
└── Por Potência
    ├── cat_paineis_300w_400w
    ├── cat_paineis_400w_500w
    ├── cat_paineis_500w_600w
    └── cat_paineis_600w_mais
```

### Tags Recomendadas

```
# Por Fabricante
tag_canadian_solar, tag_jinko, tag_trina, tag_ja_solar

# Por Potência
tag_545w, tag_550w, tag_555w, tag_600w

# Por Tecnologia
tag_monocristalino, tag_perc, tag_topcon, tag_hjt
tag_half_cell, tag_bifacial

# Por Características
tag_full_black, tag_alta_eficiencia, tag_garantia_25anos
```

## 💡 Boas Práticas

### 1. Nomenclatura de Handles

```javascript
// ✅ BOM
"modulo-canadian-solar-550w-hiku6-mono-perc"

// ❌ EVITAR
"Módulo Canadian Solar 550W HiKu6 Mono PERC"
"painel_550w_cs"
```

### 2. SKUs Únicos

```javascript
// ✅ BOM - Inclui fabricante, série, potência, tecnologia
"CS-HIKU6-550W-PERC-BLACK"

// ❌ EVITAR - Genérico demais
"PAINEL-001"
"550W"
```

### 3. Preços em Centavos

```javascript
// ✅ CORRETO - R$ 490,00 = 49000 centavos
{ currency_code: "BRL", amount: 49000 }

// ❌ ERRADO
{ currency_code: "BRL", amount: 490 }
```

### 4. Especificações Técnicas

Sempre inclua no mínimo:

- ✅ power_w (potência)
- ✅ technology (tecnologia)
- ✅ efficiency (eficiência)
- ✅ electrical_characteristics (características elétricas)
- ✅ warranties (garantias)

## 🔄 Conversão de Dados Existentes

Script disponível em `convert-panels-to-medusa.js`

## 📚 Recursos Adicionais

- [Medusa Product Module](https://docs.medusajs.com/resources/commerce-modules/product)
- [IEC 61215 Standard](https://webstore.iec.ch/publication/4996) - Especificações de painéis
- [CEC Database](https://www.gosolarcalifornia.ca.gov/equipment/pv_modules.php) - Banco de dados de módulos

## 📝 Changelog

### v1.0.0 (2025-10-13)

- Schema inicial baseado em Medusa.js Product Module
- Especificações técnicas completas conforme IEC 61215
- Suporte a variantes e opções
- Metadados especializados para painéis solares
- Documentação completa

---

**Desenvolvido para o YSH Medusa B2B Store**
