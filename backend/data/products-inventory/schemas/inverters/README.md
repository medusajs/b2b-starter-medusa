# 📦 Schema Medusa.js para Inversores Solares

## 🎯 Resumo Executivo

Este diretório contém o **schema consolidado e padronizado** para inversores solares, compatível com o **Medusa.js Product Module**.

### O que foi desenvolvido

✅ **Schema JSON completo** (`inverters-medusa-schema.json`)

- Baseado na documentação oficial do Medusa.js
- Compatível com Product, ProductVariant, ProductOption
- Suporte a variantes, opções, preços e metadados técnicos

✅ **Documentação detalhada** (`INVERTERS-SCHEMA-README.md`)

- Guia completo de uso
- Exemplos práticos
- Boas práticas
- Campos técnicos especializados

✅ **Script de conversão** (`convert-inverters-to-medusa.js`)

- Converte dados existentes para o novo formato
- Gera handles e SKUs automaticamente
- Mantém rastreabilidade dos dados originais

---

## 📁 Arquivos

### 1. `inverters-medusa-schema.json`

**Schema JSON formal** seguindo o padrão JSON Schema Draft-07.

**Principais características:**

- ✅ Campos obrigatórios: `title`, `handle`, `status`, `variants`, `options`
- ✅ Suporte a múltiplas variantes com opções (Potência, Voltagem, Fases)
- ✅ Sistema de preços em centavos (padrão Medusa)
- ✅ Metadados técnicos especializados para inversores
- ✅ Validação de tipos e formatos

**Exemplo mínimo:**

```json
{
  "title": "Inversor SAJ 3kW",
  "handle": "inversor-saj-3kw",
  "status": "published",
  "options": [
    {"title": "Potência", "values": ["3kW"]}
  ],
  "variants": [
    {
      "title": "SAJ 3kW",
      "sku": "SAJ-3KW",
      "options": {"Potência": "3kW"},
      "prices": [{"currency_code": "BRL", "amount": 159900}]
    }
  ]
}
```

---

### 2. `INVERTERS-SCHEMA-README.md`

**Documentação completa** com 450+ linhas de guias e exemplos.

**Conteúdo:**

- 📖 Visão geral e características
- 🏗️ Estrutura detalhada do schema
- 🚀 Como usar (API, Workflows, importação em massa)
- 🔄 Conversão de dados existentes
- 📊 Campos técnicos detalhados
- 🏷️ Sistema de categorização
- 💡 Boas práticas
- 🔍 Validação de schema

**Principais seções:**

1. **Product Fields**: título, descrição, handle, status
2. **Options**: eixos de variação (Potência, Voltagem, Fases)
3. **Variants**: combinações específicas de opções com preços
4. **Metadata**: especificações técnicas, fonte, SEO

---

### 3. `convert-inverters-to-medusa.js`

**Script de conversão automática** de dados antigos para o novo formato.

**Funcionalidades:**

- ✅ Gera handles únicos e URL-friendly
- ✅ Cria SKUs padronizados
- ✅ Converte preços para centavos
- ✅ Extrai opções e variantes automaticamente
- ✅ Categoriza por tipo, potência e fases
- ✅ Gera tags inteligentemente
- ✅ Mantém rastreabilidade (external_id, source_data)

**Uso:**

```bash
# Via Node.js
node convert-inverters-to-medusa.js

# Ou importar como módulo
const { convertInverterToMedusaSchema } = require('./convert-inverters-to-medusa')
const medusaProduct = convertInverterToMedusaSchema(oldInverterData)
```

---

## 🎓 Conceitos Principais

### 1. **Product vs Variant**

```
Product (Inversor SAJ R5)
├── Option: Potência → [3kW, 4.2kW, 5kW]
├── Option: Voltagem → [220V, 380V]
└── Option: Fases → [Monofásico, Trifásico]

Variants (combinações)
├── SAJ R5 - 3kW / 220V / Monofásico   → SKU: SAJ-R5-3KW-220V-MONO
├── SAJ R5 - 4.2kW / 220V / Monofásico → SKU: SAJ-R5-4.2KW-220V-MONO
└── SAJ R5 - 5kW / 380V / Trifásico    → SKU: SAJ-R5-5KW-380V-TRI
```

### 2. **Options (Opções)**

São os **eixos de variação** do produto:

- Potência: 3kW, 4.2kW, 5kW
- Voltagem: 220V, 380V
- Fases: Monofásico, Trifásico

### 3. **Variants (Variantes)**

São **combinações específicas** das opções:

- Cada variante tem seu próprio SKU, preço e estoque
- Exemplo: "3kW + 220V + Monofásico" = 1 variante

### 4. **Preços em Centavos**

```javascript
R$ 1.599,00 → 159900 centavos
R$ 10.450,50 → 1045050 centavos
```

---

## 🔗 Integração com Medusa.js

### Via API REST

```javascript
POST /admin/products
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Inversor SAJ 3kW",
  "handle": "inversor-saj-3kw",
  "status": "published",
  "options": [...],
  "variants": [...]
}
```

### Via Workflows (Recomendado)

```typescript
import { createProductWorkflow } from "@medusajs/medusa/core-flows"

await createProductWorkflow(container).run({
  input: medusaProductData
})
```

### Via Importação em Massa

```bash
# Admin Dashboard
Admin → Products → Import

# CLI
medusa seed -f inverters-medusa.json
```

---

## 📊 Estrutura de Dados Técnicos

### Metadados Especializados

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
      "max_dc_voltage_v": 550,
      "protection_degree": "IP65",
      "communication": ["WiFi", "Ethernet"],
      "certifications": ["INMETRO"],
      "warranty_years": 10
    }
  }
}
```

### Categorias e Tags

**Categorias (hierárquicas):**

```
cat_inversores
├── cat_inversores_grid_tie
│   ├── cat_inversores_monofasicos
│   ├── cat_inversores_bifasicos
│   └── cat_inversores_trifasicos
├── cat_inversores_off_grid
├── cat_inversores_hybrid
└── cat_microinversores
```

**Tags (flat):**

```
tag_saj, tag_growatt, tag_fronius
tag_3kw, tag_5kw, tag_10kw
tag_wifi, tag_bluetooth, tag_2mppt
```

---

## ✅ Validação de Dados

### Uso com AJV

```javascript
import Ajv from "ajv"
import addFormats from "ajv-formats"

const ajv = new Ajv()
addFormats(ajv)

const schema = require('./inverters-medusa-schema.json')
const validate = ajv.compile(schema)

const isValid = validate(myInverterData)
if (!isValid) {
  console.error('Erros de validação:', validate.errors)
}
```

---

## 🔄 Fluxo de Conversão

```mermaid
graph LR
    A[Dados Antigos] --> B[Script de Conversão]
    B --> C[Validação Schema]
    C --> D[Formato Medusa]
    D --> E[Importação]
    E --> F[Medusa Database]
```

**Etapas:**

1. **Input**: Dados no formato antigo (odex, solfacil, neosolar)
2. **Conversão**: Script gera formato Medusa.js
3. **Validação**: AJV valida contra schema
4. **Output**: JSON pronto para importação
5. **Importação**: Via API, Workflow ou Admin

---

## 🎯 Próximos Passos

### 1. **Preparar Categorias e Tags no Medusa**

```bash
# Criar categorias via Admin ou API
POST /admin/product-categories
{
  "name": "Inversores",
  "handle": "cat_inversores"
}
```

### 2. **Converter Dados Existentes**

```bash
node convert-inverters-to-medusa.js
```

### 3. **Validar Conversão**

```javascript
const ajv = new Ajv()
const validate = ajv.compile(schema)
validate(convertedData)
```

### 4. **Importar para Medusa**

```javascript
// Via workflow
await createProductWorkflow(container).run({
  input: convertedData
})
```

### 5. **Verificar no Admin**

```
http://localhost:9000/admin/products
```

---

## 📚 Referências

### Documentação Medusa.js

- [Product Module](https://docs.medusajs.com/resources/commerce-modules/product)
- [Product Models](https://github.com/medusajs/medusa/tree/develop/packages/modules/product/src/models)
- [Multi-Part Products](https://docs.medusajs.com/user-guide/products/create/multi-part)
- [Bundle Products](https://docs.medusajs.com/user-guide/products/create/bundle)

### Conteúdo Obtido das URLs

✅ Estrutura de Product, ProductVariant, ProductOption
✅ Sistema de options e variants
✅ Preços em centavos com currency_code
✅ Metadata customizável
✅ Inventory kits (para bundles)
✅ Workflows para criação de produtos

---

## 🤝 Suporte

Para dúvidas ou problemas:

1. Consulte o `INVERTERS-SCHEMA-README.md`
2. Verifique exemplos no schema JSON
3. Teste com o script de conversão
4. Valide com AJV antes de importar

---

**Desenvolvido para YSH Medusa B2B Store**
*Data: 2025-10-13*
