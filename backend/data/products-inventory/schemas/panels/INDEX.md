# Índice Completo - Schema de Painéis Solares Medusa.js

Este documento fornece um índice abrangente de todos os arquivos, funções e recursos relacionados ao schema de painéis solares para Medusa.js.

## 📁 Estrutura de Arquivos

```
schemas/
├── panels/
│   ├── README.md                           # Resumo executivo
│   ├── INDEX.md                            # Este arquivo
│   ├── panels-medusa-schema.json           # Schema JSON formal
│   ├── PANELS-SCHEMA-README.md             # Documentação completa
│   ├── convert-panels-to-medusa.js         # Script de conversão
│   └── example-panels-medusa.json          # Exemplos práticos
```

## 📄 Descrição dos Arquivos

### 1. `panels-medusa-schema.json`

**Propósito:** Schema JSON formal (JSON Schema Draft-07) que define a estrutura de painéis solares no padrão Medusa.js

**Conteúdo:**

- Definição de tipos e propriedades
- Regras de validação
- Campos obrigatórios e opcionais
- Estrutura de Product/Variant/Option
- Metadados técnicos especializados

**Uso:**

```bash
# Validação de dados
ajv validate -s panels-medusa-schema.json -d my-panel-data.json
```

### 2. `PANELS-SCHEMA-README.md`

**Propósito:** Documentação técnica completa (450+ linhas)

**Seções:**

- 📋 Visão Geral
- 🎯 Características Principais
- 📦 Estrutura do Schema
- 🚀 Como Usar
- 📊 Campos Técnicos Detalhados
- 🏷️ Sistema de Categorização
- 💡 Boas Práticas
- 🔄 Conversão de Dados
- 📚 Recursos Adicionais

**Quando Consultar:**

- Entender a estrutura completa
- Conhecer campos técnicos
- Aprender boas práticas
- Ver exemplos de uso

### 3. `convert-panels-to-medusa.js`

**Propósito:** Script Node.js para conversão automatizada de painéis

**Funções Principais:**

#### `convertPanelToMedusaSchema(panel, source)`

Converte um painel do formato original para Medusa.js

**Parâmetros:**

- `panel` (Object) - Dados do painel original
- `source` (string) - Fonte dos dados (odex, solfacil, etc)

**Retorna:** Object - Painel no formato Medusa

**Exemplo:**

```javascript
const medusaPanel = convertPanelToMedusaSchema({
  name: "Painel Solar 550W",
  manufacturer: "Canadian Solar",
  power_w: 550,
  price: "R$ 490,00"
}, 'odex');
```

#### `generateHandle(title)`

Gera handle URL-friendly

**Parâmetros:**

- `title` (string) - Título do produto

**Retorna:** string - Handle normalizado

**Exemplo:**

```javascript
generateHandle("Painel Solar Canadian Solar 550W")
// Retorna: "painel-solar-canadian-solar-550w"
```

#### `generateSKU(panel)`

Gera SKU único baseado em características do painel

**Parâmetros:**

- `panel` (Object) - Dados do painel

**Retorna:** string - SKU único

**Exemplo:**

```javascript
generateSKU({
  manufacturer: "Canadian Solar",
  model: "HiKu6",
  power_w: 550,
  technology: "Monocristalino PERC"
})
// Retorna: "CAN-HIKU6-550W-PERC"
```

#### `convertPrice(price)`

Converte preço para centavos

**Parâmetros:**

- `price` (number|string) - Preço em reais

**Retorna:** number - Preço em centavos

**Exemplo:**

```javascript
convertPrice("R$ 490,00")  // Retorna: 49000
convertPrice(490)          // Retorna: 49000
```

#### `normalizeTechnology(technology)`

Normaliza nome de tecnologia

**Parâmetros:**

- `technology` (string) - Tecnologia original

**Retorna:** string - Tecnologia normalizada

**Exemplo:**

```javascript
normalizeTechnology("mono perc")  // Retorna: "Monocristalino PERC"
normalizeTechnology("topcon")     // Retorna: "Monocristalino TOPCon"
```

#### `extractPanelOptions(panel)`

Extrai opções de variação do painel

**Parâmetros:**

- `panel` (Object) - Dados do painel

**Retorna:** Array - Opções de variação

**Exemplo:**

```javascript
extractPanelOptions({
  power_w: 550,
  technology: "Monocristalino PERC"
})
// Retorna: [
//   { title: "Potência", values: ["550W"] },
//   { title: "Tecnologia", values: ["Monocristalino PERC"] }
// ]
```

#### `extractElectricalCharacteristics(panel)`

Extrai características elétricas

**Retorna:** Object com `pmax_w`, `vmp_v`, `imp_a`, `voc_v`, `isc_a`, etc.

#### `extractTemperatureCoefficients(panel)`

Extrai coeficientes de temperatura

**Retorna:** Object com `pmax`, `voc`, `isc`

#### `extractDimensions(panel)`

Extrai dimensões físicas

**Retorna:** Object com `length_mm`, `width_mm`, `thickness_mm`, `weight_kg`

#### `extractMechanicalSpecs(panel)`

Extrai especificações mecânicas

**Retorna:** Object com `frame_material`, `glass_type`, `junction_box`, etc.

#### `extractWarranties(panel)`

Extrai informações de garantias

**Retorna:** Object com `product_warranty_years`, `performance_warranty_years`, etc.

#### `extractCertifications(panel)`

Extrai certificações

**Retorna:** Array de certificações

#### `generateTags(panel)`

Gera tags automaticamente

**Retorna:** Array de tags

#### `getPowerRange(power)`

Determina faixa de potência

**Parâmetros:**

- `power` (number) - Potência em watts

**Retorna:** string - Faixa de potência

**Exemplo:**

```javascript
getPowerRange(550)  // Retorna: "500W - 600W"
getPowerRange(700)  // Retorna: "600W+"
```

#### `convertFile(inputFile, outputFile, source)`

Converte arquivo completo

**Parâmetros:**

- `inputFile` (string) - Caminho do arquivo de entrada
- `outputFile` (string) - Caminho do arquivo de saída
- `source` (string) - Fonte dos dados

**Uso:**

```bash
node convert-panels-to-medusa.js
```

### 4. `example-panels-medusa.json`

**Propósito:** Exemplos práticos de painéis convertidos

**Exemplos Incluídos:**

#### Exemplo 1: Canadian Solar 550W HiKu6

- Tecnologia: Monocristalino PERC
- Eficiência: 21.3%
- Moldura: Preta (Full Black)
- Características: Alta eficiência, garantia de 25 anos

#### Exemplo 2: Odex 585W

- Tecnologia: Monocristalino Half-Cell
- Eficiência: 22.1%
- Características: Custo-benefício, half-cell technology

#### Exemplo 3: JinkoSolar 700W Tiger Neo

- Tecnologia: N-Type TOPCon Bifacial
- Eficiência: 22.8%
- Características: Premium, bifacial (85%), garantia de 30 anos

**Quando Consultar:**

- Ver estrutura completa de um painel
- Entender como preencher variantes
- Aprender a organizar metadados
- Copiar como template

### 5. `README.md`

**Propósito:** Resumo executivo e guia de início rápido

**Conteúdo:**

- Visão geral do projeto
- Lista de arquivos
- Características principais
- Exemplos de uso rápido
- Links para documentação detalhada

**Quando Consultar:**

- Primeira vez usando o schema
- Precisa de referência rápida
- Quer entender o propósito geral

## 🔄 Fluxo de Trabalho Típico

### 1. Conversão de Dados Existentes

```bash
# Passo 1: Preparar dados de entrada
# Coloque arquivos JSON em: ../odex/, ../solfacil/, etc.

# Passo 2: Executar conversão
node convert-panels-to-medusa.js

# Passo 3: Verificar output
ls output/
```

### 2. Conversão Programática

```javascript
// Passo 1: Importar funções
const { 
  convertPanelToMedusaSchema,
  generateHandle,
  generateSKU 
} = require('./convert-panels-to-medusa');

// Passo 2: Preparar dados
const panelData = {
  name: "Painel Solar Canadian Solar 550W",
  manufacturer: "Canadian Solar",
  model: "HiKu6 CS6W-550MS",
  power_w: 550,
  technology: "Monocristalino PERC",
  efficiency: 21.3,
  price: "R$ 490,00"
};

// Passo 3: Converter
const medusaPanel = convertPanelToMedusaSchema(panelData, 'my-source');

// Passo 4: Usar resultado
console.log(medusaPanel);
```

### 3. Importação no Medusa.js

```javascript
// Passo 1: Inicializar cliente Medusa
import { MedusaClient } from "@medusajs/medusa-js"

const medusa = new MedusaClient({
  baseUrl: "http://localhost:9000",
  maxRetries: 3,
})

// Passo 2: Carregar dados convertidos
const panels = require('./output/odex-panels-medusa.json');

// Passo 3: Importar cada painel
for (const panel of panels) {
  const product = await medusa.admin.products.create(panel);
  console.log(`Importado: ${product.title}`);
}
```

## 📊 Mapeamento de Campos

### Campos do Formato Original → Medusa

| Campo Original | Campo Medusa | Transformação |
|---------------|--------------|---------------|
| `name` | `title` | Direto |
| `manufacturer` | `metadata.manufacturer` | Direto |
| `power_w` | `metadata.technical_specs.power_w` | Direto |
| `price` | `variants[0].prices[0].amount` | R$ → centavos |
| `technology` | `metadata.technical_specs.technology` | Normalizado |
| `efficiency` | `metadata.technical_specs.efficiency` | Direto |
| `vmp_v` | `technical_specs.electrical_characteristics.vmp_v` | Direto |
| `imp_a` | `technical_specs.electrical_characteristics.imp_a` | Direto |
| `stock` | `variants[0].inventory_quantity` | Direto |
| `images` | `images[]` | Array |

## 🏷️ Sistema de Tags

### Tags Automáticas por Fabricante

```
tag_canadian_solar
tag_jinko
tag_trina
tag_ja_solar
tag_longi
tag_odex
```

### Tags por Potência

```
tag_545w
tag_550w
tag_555w
tag_585w
tag_600w
tag_700w
```

### Tags por Tecnologia

```
tag_monocristalino
tag_monocristalino_perc
tag_monocristalino_topcon
tag_monocristalino_hjt
tag_policristalino
tag_half_cell
tag_bifacial
tag_n_type
```

### Tags por Características

```
tag_alta_eficiencia (≥21%)
tag_full_black
tag_premium
tag_garantia_25anos
tag_garantia_30anos
```

### Tags por Faixa de Potência

```
tag_ate_300w
tag_300w_400w
tag_400w_500w
tag_500w_600w
tag_600w_mais
```

## 📂 Estrutura de Categorias

```
cat_paineis (raiz)
├── cat_paineis_monocristalino
│   ├── cat_paineis_perc
│   ├── cat_paineis_topcon
│   └── cat_paineis_hjt
├── cat_paineis_policristalino
├── cat_paineis_bifacial
├── cat_paineis_n_type
├── cat_paineis_premium
└── Por Potência
    ├── cat_paineis_ate_300w
    ├── cat_paineis_300w_400w
    ├── cat_paineis_400w_500w
    ├── cat_paineis_500w_600w
    └── cat_paineis_600w_mais
```

## 🔍 Casos de Uso

### Caso 1: Importar Painéis do ODEX

```bash
# 1. Garantir que existe odex-panels.json
ls ../odex/odex-panels.json

# 2. Executar conversão
node convert-panels-to-medusa.js

# 3. Verificar resultado
cat output/odex-panels-medusa.json
```

### Caso 2: Criar Painel Manualmente

```javascript
const fs = require('fs');
const { convertPanelToMedusaSchema } = require('./convert-panels-to-medusa');

const newPanel = {
  name: "Painel Solar Personalizado 600W",
  manufacturer: "Meu Fabricante",
  model: "CUSTOM-600",
  power_w: 600,
  technology: "Monocristalino TOPCon",
  efficiency: 22.5,
  price: "R$ 650,00",
  vmp_v: 43.2,
  imp_a: 13.89,
  voc_v: 51.7,
  isc_a: 14.68
};

const medusaPanel = convertPanelToMedusaSchema(newPanel, 'manual');
fs.writeFileSync('my-custom-panel.json', JSON.stringify(medusaPanel, null, 2));
```

### Caso 3: Validar Dados Antes de Importar

```javascript
const Ajv = require('ajv');
const ajv = new Ajv();

const schema = require('./panels-medusa-schema.json');
const data = require('./output/odex-panels-medusa.json');

const validate = ajv.compile(schema);

for (const panel of data) {
  const valid = validate(panel);
  if (!valid) {
    console.error(`Erro em ${panel.title}:`, validate.errors);
  }
}
```

## 💡 Dicas e Boas Práticas

### ✅ Fazer

1. **Sempre converter preços para centavos**

   ```javascript
   amount: 49000  // R$ 490,00
   ```

2. **Usar handles URL-friendly**

   ```javascript
   handle: "painel-canadian-solar-550w"
   ```

3. **Incluir especificações técnicas completas**

   ```javascript
   metadata: {
     technical_specs: {
       power_w: 550,
       efficiency: 21.3,
       electrical_characteristics: { ... },
       warranties: { ... }
     }
   }
   ```

4. **Manter IDs externos para rastreamento**

   ```javascript
   external_id: "odex_panels_12345"
   ```

5. **Usar tags e categorias consistentes**

   ```javascript
   tags: ["tag_canadian_solar", "tag_550w", "tag_monocristalino_perc"]
   ```

### ❌ Evitar

1. **Preços em reais (deve ser centavos)**

   ```javascript
   // ❌ ERRADO
   amount: 490
   
   // ✅ CORRETO
   amount: 49000
   ```

2. **Handles com espaços ou caracteres especiais**

   ```javascript
   // ❌ ERRADO
   handle: "Painel Canadian Solar 550W"
   
   // ✅ CORRETO
   handle: "painel-canadian-solar-550w"
   ```

3. **Falta de especificações técnicas**

   ```javascript
   // ❌ ERRADO
   metadata: { manufacturer: "Canadian Solar" }
   
   // ✅ CORRETO
   metadata: {
     manufacturer: "Canadian Solar",
     technical_specs: { power_w: 550, ... }
   }
   ```

4. **SKUs duplicados**

   ```javascript
   // Use generateSKU() para garantir unicidade
   sku: generateSKU(panel)
   ```

## 📚 Recursos Adicionais

### Documentação Medusa.js

- [Product Module](https://docs.medusajs.com/resources/commerce-modules/product)
- [Admin API](https://docs.medusajs.com/api/admin)
- [Product Variants](https://docs.medusajs.com/resources/commerce-modules/product/relations#variants)

### Especificações Técnicas

- [IEC 61215](https://webstore.iec.ch/publication/4996) - Teste de módulos fotovoltaicos
- [IEC 61730](https://webstore.iec.ch/publication/5733) - Segurança de módulos
- [INMETRO](http://www.inmetro.gov.br/) - Certificação brasileira

### Ferramentas

- [JSON Schema Validator](https://www.jsonschemavalidator.net/)
- [AJV](https://ajv.js.org/) - Validador JSON Schema para Node.js

## 🆘 Resolução de Problemas

### Erro: "Price must be in cents"

**Problema:** Preço está em reais ao invés de centavos

**Solução:**

```javascript
// Use a função convertPrice
const priceInCents = convertPrice("R$ 490,00");  // 49000
```

### Erro: "Handle must be unique"

**Problema:** Handle duplicado

**Solução:**

```javascript
// Adicione sufixo único
handle: `${generateHandle(title)}-${Date.now()}`
```

### Erro: "Invalid technology"

**Problema:** Tecnologia não normalizada

**Solução:**

```javascript
// Use a função normalizeTechnology
const tech = normalizeTechnology(panel.technology);
```

### Erro: "Missing required field"

**Problema:** Campo obrigatório ausente

**Solução:**

```javascript
// Verifique campos obrigatórios:
// - title
// - handle
// - status
// - variants (pelo menos 1)
```

## 📝 Changelog

### v1.0.0 (2025-10-13)

- ✨ Schema inicial de painéis solares
- ✨ Script de conversão automática
- ✨ 3 exemplos completos
- ✨ Documentação completa (450+ linhas)
- ✨ Suporte a múltiplas tecnologias
- ✨ Sistema de tags e categorias
- ✨ Funções utilitárias exportadas

---

**Desenvolvido para o YSH Medusa B2B Store**
**Data:** 2025-10-13
**Versão:** 1.0.0
