# Schema de Painéis Solares - Padrão Medusa.js

Este diretório contém o schema padronizado para **módulos fotovoltaicos (painéis solares)** compatível com o **Medusa.js Product Module**.

## 📁 Arquivos

- **`panels-medusa-schema.json`** - Schema JSON formal (JSON Schema Draft-07)
- **`PANELS-SCHEMA-README.md`** - Documentação completa (450+ linhas)
- **`convert-panels-to-medusa.js`** - Script de conversão automatizada
- **`example-panels-medusa.json`** - 3 exemplos práticos de painéis convertidos

## 🎯 Características do Schema

### ✅ Compatibilidade Total com Medusa.js

- Estrutura Product/ProductVariant/ProductOption nativa do Medusa
- Preços em centavos (padrão Medusa)
- Suporte a múltiplas moedas e variantes
- Gestão de estoque integrada

### 🔧 Especificações Técnicas Completas

**Características Elétricas (STC):**

- Potência máxima (Pmax)
- Tensão no ponto máximo (Vmp)
- Corrente no ponto máximo (Imp)
- Tensão circuito aberto (Voc)
- Corrente curto-circuito (Isc)

**Coeficientes de Temperatura:**

- Coeficiente de temperatura de Pmax (%/°C)
- Coeficiente de temperatura de Voc (%/°C)
- Coeficiente de temperatura de Isc (%/°C)

**Especificações Mecânicas:**

- Dimensões completas (comprimento, largura, espessura)
- Peso
- Tipo de moldura e cor
- Tipo de vidro e espessura
- Caixa de junção
- Conectores

**Garantias:**

- Garantia de produto (anos)
- Garantia de performance (anos)
- Garantia linear
- Performance aos 25 anos

**Certificações:**

- IEC 61215, IEC 61730
- INMETRO
- UL 1703 (quando aplicável)

### 🎨 Sistema de Variantes Flexível

Suporte a múltiplas opções de variação:

```json
{
  "options": [
    { "title": "Potência", "values": ["545W", "550W", "555W"] },
    { "title": "Tecnologia", "values": ["Mono PERC", "TOPCon"] },
    { "title": "Cor da Moldura", "values": ["Preta", "Prata"] }
  ]
}
```

### 🏷️ Categorização Automática

- Categorias por faixa de potência
- Categorias por tecnologia
- Tags por fabricante
- Tags por características (bifacial, full black, alta eficiência)

## 🚀 Como Usar

### 1. Conversão de Dados Existentes

```bash
node convert-panels-to-medusa.js
```

O script processa automaticamente:

- `odex-panels.json` → `odex-panels-medusa.json`
- `solfacil-panels.json` → `solfacil-panels-medusa.json`
- `fotus-panels.json` → `fotus-panels-medusa.json`

### 2. Conversão Programática

```javascript
const { convertPanelToMedusaSchema } = require('./convert-panels-to-medusa');

const panelData = {
  name: "Painel Solar Canadian Solar 550W",
  manufacturer: "Canadian Solar",
  model: "HiKu6 CS6W-550MS",
  power_w: 550,
  technology: "Monocristalino PERC",
  efficiency: 21.3,
  price: "R$ 490,00"
};

const medusaPanel = convertPanelToMedusaSchema(panelData, 'my-source');
```

### 3. Importação no Medusa.js

```javascript
import { MedusaClient } from "@medusajs/medusa-js"

const medusa = new MedusaClient({
  baseUrl: "http://localhost:9000",
  maxRetries: 3,
})

const product = await medusa.admin.products.create(medusaPanel)
```

## 📊 Exemplos

O arquivo `example-panels-medusa.json` contém 3 exemplos completos:

1. **Canadian Solar 550W HiKu6** - Monocristalino PERC, moldura preta
2. **Odex 585W** - Monocristalino Half-Cell
3. **JinkoSolar 700W Tiger Neo** - N-Type TOPCon Bifacial (premium)

## 🔍 Tecnologias Suportadas

- **Monocristalino** - Células de silício monocristalino padrão
- **Monocristalino PERC** - Passivated Emitter and Rear Cell
- **Monocristalino HJT** - Heterojunction Technology
- **Monocristalino TOPCon** - Tunnel Oxide Passivated Contact
- **Policristalino** - Células de silício policristalino
- **Half-Cell** - Células cortadas ao meio
- **Bifacial** - Captação de energia em ambos os lados
- **N-Type** - Células tipo N de alta eficiência

## 📈 Estrutura de Categorias

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

## 💰 Gestão de Preços

Preços sempre em **centavos** (padrão Medusa):

```javascript
// R$ 490,00 = 49000 centavos
{
  "prices": [
    {
      "currency_code": "BRL",
      "amount": 49000
    }
  ]
}
```

## 🔗 Rastreabilidade

Cada produto mantém IDs externos para rastreamento:

```json
{
  "external_id": "odex_inverters_ODEX-PAINEL-ODEX-585W",
  "variants": [
    {
      "external_id": "odex_inverters_ODEX-PAINEL-ODEX-585W"
    }
  ]
}
```

## 📚 Documentação Completa

Consulte `PANELS-SCHEMA-README.md` para documentação detalhada incluindo:

- Estrutura completa do schema
- Explicação de campos
- Boas práticas
- Exemplos de uso
- Validação de dados
- Integração com Medusa API

## 🔧 Funções Utilitárias

O script `convert-panels-to-medusa.js` exporta várias funções úteis:

- `convertPanelToMedusaSchema()` - Conversão completa
- `generateHandle()` - Gera handle URL-friendly
- `generateSKU()` - Gera SKU único
- `convertPrice()` - Converte preço para centavos
- `normalizeTechnology()` - Normaliza nomes de tecnologias
- `extractPanelOptions()` - Extrai opções de variação
- `generateTags()` - Gera tags automaticamente

## ✨ Principais Vantagens

1. **Padronização** - Estrutura uniforme para todos os painéis
2. **Automação** - Conversão automatizada de múltiplos formatos
3. **Rastreabilidade** - IDs externos preservados
4. **Flexibilidade** - Suporte a variantes complexas
5. **SEO** - Handles otimizados e tags organizadas
6. **Validação** - Schema JSON para validação automática

---

**Desenvolvido para o YSH Medusa B2B Store**
