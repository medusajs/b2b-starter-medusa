# 📋 Índice de Arquivos - Schema Inversores Medusa.js

## 📁 Estrutura de Arquivos

```
schemas/
├── README.md                                    # Este arquivo - índice geral
├── INVERTERS-SCHEMA-README.md                   # Documentação completa do schema
├── inverters-medusa-schema.json                 # Schema JSON formal (JSON Schema Draft-07)
├── convert-inverters-to-medusa.js               # Script de conversão
├── example-odex-inverters-medusa.json           # Exemplo prático (3 inversores SAJ)
└── INDEX.md                                     # Este arquivo
```

---

## 📄 Descrição dos Arquivos

### 1. **README.md** (Você está aqui)

**Resumo executivo** do projeto com visão geral de todos os componentes.

**Contém:**

- ✅ O que foi desenvolvido
- 📦 Estrutura de arquivos
- 🎯 Conceitos principais
- 🔗 Integração com Medusa.js
- 🔄 Fluxo de conversão

**Para quem:** Gestores, desenvolvedores iniciantes, overview do projeto

---

### 2. **INVERTERS-SCHEMA-README.md**

**Documentação técnica completa** com 450+ linhas de guias detalhados.

**Contém:**

- 📖 Visão geral e características
- 🏗️ Estrutura detalhada do schema
- 🚀 Como usar (API, Workflows, importação)
- 🔄 Conversão de dados existentes
- 📊 Campos técnicos detalhados
- 🏷️ Sistema de categorização
- 💡 Boas práticas
- 🔍 Validação de schema

**Para quem:** Desenvolvedores implementando a integração

**Tópicos principais:**

1. Product Fields (title, handle, status)
2. Options (eixos de variação)
3. Variants (combinações com preços)
4. Metadata (specs técnicas)
5. Categories & Tags
6. Pricing (centavos)
7. Inventory management

---

### 3. **inverters-medusa-schema.json**

**Schema JSON formal** seguindo JSON Schema Draft-07.

**Tipo:** Definição de schema técnico  
**Formato:** JSON Schema  
**Uso:** Validação de dados com ferramentas como AJV

**Principais seções:**

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "title": "Inversor Solar - Medusa Product Schema",
  "type": "object",
  "required": ["title", "handle", "status", "variants", "options"],
  "properties": {
    "title": {...},
    "handle": {...},
    "options": {...},
    "variants": {...},
    "metadata": {...}
  },
  "examples": [...]
}
```

**Validação:**

- ✅ Campos obrigatórios
- ✅ Tipos de dados
- ✅ Formatos (URL, date-time, pattern)
- ✅ Enumerações (status, type, phases)
- ✅ Validações customizadas

**Para quem:** Sistemas automatizados, validação de dados

---

### 4. **convert-inverters-to-medusa.js**

**Script Node.js** para conversão automática de dados.

**Tipo:** Script executável  
**Formato:** JavaScript (Node.js)  
**Uso:** Converter dados antigos para formato Medusa

**Funções principais:**

```javascript
// Converter um inversor
convertInverterToMedusaSchema(oldData)

// Converter múltiplos
convertMultipleInverters(arrayOfOldData)

// Utilitários
generateHandle(name)
generateSKU(data)
```

**Recursos:**

- ✅ Gera handles únicos
- ✅ Cria SKUs padronizados
- ✅ Converte preços para centavos
- ✅ Extrai opções automaticamente
- ✅ Categoriza inteligentemente
- ✅ Gera tags relevantes
- ✅ Mantém rastreabilidade

**Execução:**

```bash
# Converter arquivo específico
node convert-inverters-to-medusa.js

# Ou importar como módulo
const { convertInverterToMedusaSchema } = require('./convert-inverters-to-medusa')
```

**Para quem:** Desenvolvedores executando conversão em massa

---

### 5. **example-odex-inverters-medusa.json**

**Exemplo prático** com 3 inversores SAJ já convertidos.

**Tipo:** Dados de exemplo  
**Formato:** JSON array  
**Uso:** Referência e testes

**Conteúdo:**

- ✅ SAJ R5-3K-T2 (3kW, R$ 1.599,00)
- ✅ SAJ R5-4.2K-T2 (4.2kW, R$ 1.899,00)
- ✅ SAJ R5-5K-T2 (5kW, R$ 2.499,00)

**Demonstra:**

- Estrutura completa de produto Medusa
- Options: Potência, Voltagem, Fases
- Variants com preços em centavos
- Metadata técnico
- Categorias e tags
- Imagens processadas

**Para quem:** Desenvolvedores aprendendo o formato, testes de importação

---

## 🎯 Fluxo de Uso Recomendado

### 1️⃣ **Entendimento Inicial**

```
README.md → INVERTERS-SCHEMA-README.md (seções iniciais)
```

Comece aqui para entender o projeto e conceitos básicos.

### 2️⃣ **Implementação**

```
INVERTERS-SCHEMA-README.md (completo) → inverters-medusa-schema.json
```

Leia a documentação completa e consulte o schema para validações.

### 3️⃣ **Conversão de Dados**

```
convert-inverters-to-medusa.js → example-odex-inverters-medusa.json
```

Execute o script e compare resultado com o exemplo.

### 4️⃣ **Validação**

```javascript
const ajv = new Ajv()
const schema = require('./inverters-medusa-schema.json')
const validate = ajv.compile(schema)
validate(convertedData)
```

### 5️⃣ **Importação para Medusa**

```javascript
await createProductWorkflow(container).run({
  input: convertedData
})
```

---

## 🔑 Pontos-Chave para Cada Perfil

### 👔 **Gestores / Product Owners**

**Leia:** `README.md`

**Focos:**

- Compatibilidade com Medusa.js
- Sistema de variantes flexível
- Gestão de preços avançada
- Metadados técnicos completos

---

### 👨‍💻 **Desenvolvedores Backend**

**Leia:** `INVERTERS-SCHEMA-README.md` + `convert-inverters-to-medusa.js`

**Focos:**

- Estrutura de Product/Variant/Option
- Conversão de dados existentes
- Integração com Medusa API/Workflows
- Validação com AJV

---

### 🧪 **QA / Testadores**

**Leia:** `INVERTERS-SCHEMA-README.md` (Boas Práticas) + `example-odex-inverters-medusa.json`

**Focos:**

- Validação de dados
- Casos de teste
- Comparação com exemplos
- Verificação de preços (centavos!)

---

### 🎨 **Frontend / UI**

**Leia:** `README.md` + `example-odex-inverters-medusa.json`

**Focos:**

- Estrutura de exibição de produtos
- Options (seletores de variantes)
- Preços (conversão de centavos)
- Imagens e metadados

---

## 📊 Cheat Sheet

### Campos Obrigatórios

```json
{
  "title": "Nome do produto",
  "handle": "url-slug",
  "status": "published | draft | proposed | rejected",
  "options": [{title: "...", values: [...]}],
  "variants": [{title, sku, options, prices}]
}
```

### Preços (SEMPRE em centavos!)

```javascript
R$ 1.599,00 → { currency_code: "BRL", amount: 159900 }
R$ 10.450,50 → { currency_code: "BRL", amount: 1045050 }
```

### Options vs Variants

```
Options = Eixos de variação (Potência, Voltagem, Fases)
Variants = Combinações específicas (3kW + 220V + Monofásico)
```

### IDs de Categorias/Tags

```
Categorias: cat_inversores, cat_inversores_grid_tie
Tags: tag_saj, tag_3kw, tag_monofasico
```

---

## 🔗 Links Rápidos

### Documentação Medusa.js

- [Product Module](https://docs.medusajs.com/resources/commerce-modules/product)
- [Product Models](https://github.com/medusajs/medusa/tree/develop/packages/modules/product/src/models)
- [Multi-Part Products](https://docs.medusajs.com/user-guide/products/create/multi-part)
- [Bundle Products](https://docs.medusajs.com/user-guide/products/create/bundle)

### Ferramentas

- [AJV (Validação JSON Schema)](https://ajv.js.org/)
- [JSON Schema Documentation](https://json-schema.org/)
- [Medusa Admin](http://localhost:9000/admin)

---

## 🤝 Contribuindo

### Reportar Problemas

1. Descreva o problema específico
2. Forneça exemplo de dados
3. Inclua erro/comportamento esperado

### Sugerir Melhorias

1. Teste com dados reais
2. Valide compatibilidade com Medusa
3. Documente caso de uso
4. Submeta com exemplos

---

## 📝 Changelog

### v1.0.0 (2025-10-13)

- ✅ Schema inicial completo
- ✅ Documentação detalhada
- ✅ Script de conversão
- ✅ Exemplos práticos
- ✅ Validação JSON Schema
- ✅ Suporte a variantes e opções
- ✅ Metadados técnicos especializados

---

## 🆘 FAQ Rápido

**Q: Qual arquivo devo ler primeiro?**  
A: `README.md` para overview, depois `INVERTERS-SCHEMA-README.md` para detalhes.

**Q: Como converter meus dados antigos?**  
A: Use `convert-inverters-to-medusa.js`, veja exemplos em `example-odex-inverters-medusa.json`.

**Q: Como validar os dados convertidos?**  
A: Use AJV com `inverters-medusa-schema.json`.

**Q: Preços são em reais ou centavos?**  
A: **SEMPRE em centavos!** R$ 1.599,00 = 159900.

**Q: Preciso criar categorias antes?**  
A: Sim, crie no Medusa Admin antes de importar produtos.

**Q: Como importo para o Medusa?**  
A: Via API REST, Workflows, ou Admin Dashboard (Import).

---

**Desenvolvido para YSH Medusa B2B Store**  
*Data: 2025-10-13*  
*Versão: 1.0.0*
