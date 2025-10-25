# Plano de Implementação End-to-End - YSH Medusa.js + Ollama

**Versão:** 1.0.0  
**Data:** 13 de outubro de 2025  
**Stack:** Medusa.js v2.x + Ollama + LLMs OSS (20B+)

---

## 🎯 Visão Geral

Este documento detalha o plano completo de implementação do sistema de inventário da **Yello Solar Hub (YSH)** utilizando:

- **Medusa.js v2.x** - Commerce Platform
- **Inventory Module** - Gestão de estoque
- **Product Module** - Catálogo de produtos
- **Ollama** - Runtime local para LLMs
- **LLMs Open Source** - Modelos 20B+ para automação

---

## 🤖 Stack de IA - Ollama + OSS Models

### Modelos Recomendados para YSH

#### 1. **Llama 3.1 70B** (Preferencial)

```bash
# Instalar via Ollama
ollama pull llama3.1:70b

# Uso otimizado para YSH
ollama run llama3.1:70b
```

**Características:**

- ✅ 70 bilhões de parâmetros
- ✅ Contexto: 128K tokens
- ✅ Excelente para geração de descrições
- ✅ Multilíngue (PT-BR nativo)
- ✅ Raciocínio avançado

**Casos de Uso YSH:**

- Geração de descrições de produtos
- Análise de especificações técnicas
- Categorização automática
- Geração de tags e metadata
- Recomendações de produtos

#### 2. **Mistral Large 2** (Alternativa)

```bash
ollama pull mistral-large:latest
```

**Características:**

- ✅ 123B parâmetros
- ✅ Contexto: 128K tokens
- ✅ Excelente em tarefas técnicas
- ✅ Rápido e eficiente

**Casos de Uso YSH:**

- Extração de dados técnicos
- Validação de especificações
- Comparação de produtos
- Análise de compatibilidade

#### 3. **DeepSeek Coder V2** (Código)

```bash
ollama pull deepseek-coder-v2:latest
```

**Características:**

- ✅ 236B parâmetros
- ✅ Especializado em código
- ✅ Suporte Python, JavaScript, TypeScript

**Casos de Uso YSH:**

- Geração de workflows Medusa
- Scripts de conversão de dados
- Automação de importação
- Testes automatizados

#### 4. **Qwen 2.5 72B** (Multimodal)

```bash
ollama pull qwen2.5:72b
```

**Características:**

- ✅ 72B parâmetros
- ✅ Excelente em português
- ✅ Multimodal (texto + imagem)

**Casos de Uso YSH:**

- Análise de imagens de produtos
- OCR de datasheets
- Extração de especificações de PDFs
- Validação de qualidade de imagem

---

## 🏗️ Arquitetura da Solução

### Stack Completo

```
┌─────────────────────────────────────────────────────┐
│                 Frontend (Admin + Store)             │
│           Next.js 14 + Medusa Admin + React          │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│              Medusa.js Backend v2.x                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   Product    │  │  Inventory   │  │   Order    │ │
│  │   Module     │  │   Module     │  │   Module   │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│              PostgreSQL Database                     │
│        Products | Inventory | Orders | Users         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              Ollama + LLM Stack                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Llama 3.1   │  │   Mistral    │  │  DeepSeek  │ │
│  │     70B      │  │   Large 2    │  │  Coder V2  │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│           Data Processing Pipeline                   │
│  CSV/JSON → AI Processing → Medusa Import → DB      │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Fases de Implementação

### **Fase 1: Setup Inicial** (Semana 1)

#### 1.1 Instalar Ollama e Modelos

```bash
# Windows
# Download de https://ollama.com/download/windows
# Instalar Ollama Desktop

# Baixar modelos
ollama pull llama3.1:70b
ollama pull mistral-large:latest
ollama pull deepseek-coder-v2:latest
ollama pull qwen2.5:72b

# Verificar instalação
ollama list
```

#### 1.2 Configurar Medusa.js

```bash
# Criar projeto Medusa
npx create-medusa-app@latest

# Nome do projeto
ysh-medusa-backend

# Selecionar:
# - PostgreSQL
# - Redis
# - Next.js Starter (Storefront)
# - Medusa Admin

cd ysh-medusa-backend

# Instalar dependências adicionais
npm install @langchain/community
npm install @langchain/ollama
npm install langchain
```

#### 1.3 Estrutura de Diretórios YSH

```
ysh-medusa-backend/
├── src/
│   ├── admin/                    # Medusa Admin customizations
│   ├── api/                      # Custom API routes
│   │   ├── ai/                   # AI-powered endpoints
│   │   │   ├── product-description/route.ts
│   │   │   ├── categorization/route.ts
│   │   │   └── compatibility/route.ts
│   │   └── import/               # Import endpoints
│   │       ├── odex/route.ts
│   │       ├── solfacil/route.ts
│   │       └── fotus/route.ts
│   ├── workflows/                # Custom workflows
│   │   ├── import-products/
│   │   ├── create-inventory-kits/
│   │   └── ai-enrichment/
│   ├── subscribers/              # Event handlers
│   ├── jobs/                     # Scheduled jobs
│   └── modules/                  # Custom modules
│       └── ai-service/           # AI integration module
│           ├── index.ts
│           ├── ollama-client.ts
│           └── prompts/
├── data/                         # Data files
│   └── distributor_datasets/    # Your current data
└── scripts/                      # Utility scripts
    ├── import-inventory.ts
    ├── enrich-products.ts
    └── generate-kits.ts
```

---

### **Fase 2: Módulo de IA com Ollama** (Semana 2)

#### 2.1 Criar AI Service Module

```typescript
// src/modules/ai-service/ollama-client.ts

import { Ollama } from '@langchain/ollama'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

export class OllamaAIService {
  private llm: Ollama

  constructor() {
    this.llm = new Ollama({
      baseUrl: 'http://localhost:11434',
      model: 'llama3.1:70b',
      temperature: 0.7,
    })
  }

  /**
   * Gera descrição de produto otimizada para SEO
   */
  async generateProductDescription(product: {
    name: string
    manufacturer: string
    category: string
    specs: Record<string, any>
  }): Promise<string> {
    const prompt = PromptTemplate.fromTemplate(`
Você é um especialista em energia solar fotovoltaica e redator técnico.

Crie uma descrição de produto profissional, técnica e otimizada para SEO em português brasileiro para:

**Produto:** {name}
**Fabricante:** {manufacturer}
**Categoria:** {category}
**Especificações:**
{specs}

A descrição deve:
1. Ser clara e técnica (150-200 palavras)
2. Destacar principais características e benefícios
3. Mencionar aplicações práticas
4. Incluir palavras-chave SEO naturalmente
5. Ser persuasiva mas factual

IMPORTANTE: Retorne APENAS o texto da descrição, sem títulos ou formatação markdown.
`)

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser())

    return await chain.invoke({
      name: product.name,
      manufacturer: product.manufacturer,
      category: product.category,
      specs: JSON.stringify(product.specs, null, 2),
    })
  }

  /**
   * Categoriza produto automaticamente
   */
  async categorizeProduct(product: {
    name: string
    description?: string
  }): Promise<string[]> {
    const prompt = PromptTemplate.fromTemplate(`
Analise este produto fotovoltaico e retorne as categorias apropriadas.

**Produto:** {name}
**Descrição:** {description}

Categorias disponíveis:
- cat_inversores (subcategorias: grid_tie, hibrido, off_grid, microinversor)
- cat_paineis (subcategorias: monocristalino, policristalino, perc, topcon, hjt, bifacial)
- cat_estruturas (subcategorias: solo, telhado, carport)
- cat_stringboxes
- cat_cabos
- cat_baterias
- cat_acessorios
- cat_kits (subcategorias: grid_tie, hibrido)

Retorne APENAS uma lista JSON com as categorias aplicáveis, do mais geral ao mais específico.
Exemplo: ["cat_inversores", "cat_inversores_grid_tie", "cat_inversores_monofasico"]
`)

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser())

    const result = await chain.invoke({
      name: product.name,
      description: product.description || '',
    })

    // Parse JSON response
    try {
      return JSON.parse(result)
    } catch {
      // Fallback: extract array from text
      const match = result.match(/\[([^\]]+)\]/)
      if (match) {
        return JSON.parse(match[0])
      }
      return []
    }
  }

  /**
   * Gera tags automaticamente
   */
  async generateTags(product: {
    name: string
    manufacturer: string
    category: string
    specs: Record<string, any>
  }): Promise<string[]> {
    const prompt = PromptTemplate.fromTemplate(`
Analise este produto fotovoltaico e gere tags relevantes para busca e filtros.

**Produto:** {name}
**Fabricante:** {manufacturer}
**Categoria:** {category}
**Especificações:** {specs}

Gere tags nos seguintes formatos:
- tag_fabricante (ex: tag_growatt, tag_canadian_solar)
- tag_potencia (ex: tag_550w, tag_5kw)
- tag_tecnologia (ex: tag_monocristalino, tag_perc, tag_topcon)
- tag_caracteristica (ex: tag_bifacial, tag_alta_eficiencia)
- tag_aplicacao (ex: tag_residencial, tag_comercial)

Retorne APENAS uma lista JSON com 5-10 tags relevantes.
Exemplo: ["tag_growatt", "tag_5kw", "tag_hibrido", "tag_residencial"]
`)

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser())

    const result = await chain.invoke({
      name: product.name,
      manufacturer: product.manufacturer,
      category: product.category,
      specs: JSON.stringify(product.specs, null, 2),
    })

    try {
      return JSON.parse(result)
    } catch {
      const match = result.match(/\[([^\]]+)\]/)
      if (match) {
        return JSON.parse(match[0])
      }
      return []
    }
  }

  /**
   * Extrai especificações técnicas de texto não estruturado
   */
  async extractTechnicalSpecs(
    text: string,
    category: string
  ): Promise<Record<string, any>> {
    const prompt = PromptTemplate.fromTemplate(`
Você é um engenheiro especializado em sistemas fotovoltaicos.

Extraia as especificações técnicas do seguinte texto sobre um produto da categoria "{category}":

{text}

Retorne um JSON estruturado com as especificações, usando campos padronizados.

Para inversores: power_w, voltage_v, phases, mppt_count, efficiency, max_current_a
Para painéis: power_w, technology, efficiency, vmp_v, imp_a, voc_v, isc_a
Para baterias: capacity_kwh, voltage_v, cycles, chemistry, warranty_years

Retorne APENAS o JSON, sem texto adicional.
`)

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser())

    const result = await chain.invoke({ text, category })

    try {
      return JSON.parse(result)
    } catch {
      // Try to extract JSON from markdown code block
      const match = result.match(/```json\n([\s\S]+?)\n```/)
      if (match) {
        return JSON.parse(match[1])
      }
      return {}
    }
  }

  /**
   * Analisa compatibilidade entre produtos (ex: inversor + painéis)
   */
  async analyzeCompatibility(
    product1: any,
    product2: any
  ): Promise<{
    compatible: boolean
    score: number
    issues: string[]
    recommendations: string[]
  }> {
    const prompt = PromptTemplate.fromTemplate(`
Você é um engenheiro de sistemas fotovoltaicos.

Analise a compatibilidade técnica entre estes dois produtos:

**Produto 1:**
{product1}

**Produto 2:**
{product2}

Avalie:
1. Compatibilidade elétrica (tensão, corrente, potência)
2. Compatibilidade física (dimensões, peso)
3. Compatibilidade de comunicação (protocolos)
4. Recomendações de otimização

Retorne um JSON com:
{{
  "compatible": true/false,
  "score": 0-100,
  "issues": ["lista de problemas"],
  "recommendations": ["lista de recomendações"]
}}

Retorne APENAS o JSON.
`)

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser())

    const result = await chain.invoke({
      product1: JSON.stringify(product1, null, 2),
      product2: JSON.stringify(product2, null, 2),
    })

    try {
      return JSON.parse(result)
    } catch {
      const match = result.match(/```json\n([\s\S]+?)\n```/)
      if (match) {
        return JSON.parse(match[1])
      }
      return {
        compatible: false,
        score: 0,
        issues: ['Erro na análise'],
        recommendations: [],
      }
    }
  }
}
```

#### 2.2 Criar Workflow de Enriquecimento AI

```typescript
// src/workflows/ai-enrichment/index.ts

import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
} from '@medusajs/framework/workflows-sdk'
import { Modules } from '@medusajs/framework/utils'
import { OllamaAIService } from '../../modules/ai-service/ollama-client'

const enrichProductWithAIStep = createStep(
  'enrich-product-with-ai',
  async ({ productId }: { productId: string }, { container }) => {
    const productModuleService = container.resolve(Modules.PRODUCT)
    const aiService = new OllamaAIService()

    // 1. Buscar produto
    const product = await productModuleService.retrieveProduct(productId, {
      relations: ['variants', 'tags', 'categories'],
    })

    // 2. Gerar descrição se não existir ou for genérica
    if (
      !product.description ||
      product.description.length < 100
    ) {
      const description = await aiService.generateProductDescription({
        name: product.title,
        manufacturer: product.metadata?.manufacturer || '',
        category: product.metadata?.category || '',
        specs: product.metadata?.technical_specs || {},
      })

      product.description = description
    }

    // 3. Categorizar automaticamente
    const categories = await aiService.categorizeProduct({
      name: product.title,
      description: product.description,
    })

    // 4. Gerar tags
    const tags = await aiService.generateTags({
      name: product.title,
      manufacturer: product.metadata?.manufacturer || '',
      category: product.metadata?.category || '',
      specs: product.metadata?.technical_specs || {},
    })

    // 5. Atualizar produto
    const updated = await productModuleService.updateProducts([
      {
        id: productId,
        description: product.description,
        tags: tags.map(tag => ({ value: tag })),
        categories: categories.map(cat => ({ id: cat })), // Assumes categories exist
      },
    ])

    return new StepResponse(
      {
        product: updated[0],
        enrichments: {
          description_generated: true,
          categories_added: categories.length,
          tags_added: tags.length,
        },
      },
      { productId }
    )
  },
  async ({ productId }, { container }) => {
    // Compensação: reverter para estado original se necessário
    console.log(`Compensating AI enrichment for product ${productId}`)
  }
)

export const enrichProductWorkflow = createWorkflow(
  'enrich-product-with-ai-workflow',
  (input: { productId: string }) => {
    const result = enrichProductWithAIStep(input)

    return new WorkflowResponse(result)
  }
)
```

---

### **Fase 3: Importação de Inventário** (Semanas 3-4)

#### 3.1 Workflow de Importação ODEX

```typescript
// src/workflows/import-products/import-odex.ts

import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
  transform,
} from '@medusajs/framework/workflows-sdk'
import {
  createInventoryItemsWorkflow,
  createProductsWorkflow,
  useQueryGraphStep,
} from '@medusajs/medusa/core-flows'
import { Modules } from '@medusajs/framework/utils'
import { OllamaAIService } from '../../modules/ai-service/ollama-client'
import fs from 'fs'
import path from 'path'

interface ODEXProduct {
  id: string
  name: string
  manufacturer: string
  model: string
  category: string
  price: string
  image: string
  availability: string
  description: string
  pricing: {
    price: number
    currency: string
  }
}

const importODEXProductsStep = createStep(
  'import-odex-products',
  async (
    { filePath }: { filePath: string },
    { container }
  ) => {
    // 1. Ler arquivo JSON
    const data: ODEXProduct[] = JSON.parse(
      fs.readFileSync(filePath, 'utf-8')
    )

    console.log(`📦 Importando ${data.length} produtos ODEX...`)

    // 2. Buscar Stock Location ODEX
    const { data: stockLocations } = await useQueryGraphStep({
      entity: 'stock_location',
      fields: ['*'],
      filters: {
        name: 'ODEX - Centro de Distribuição São Paulo',
      },
    }).run({ container })

    const locationId = stockLocations[0]?.id

    if (!locationId) {
      throw new Error('Stock Location ODEX não encontrada')
    }

    // 3. Preparar dados para import
    const aiService = new OllamaAIService()
    const inventoryItems = []
    const products = []

    for (const item of data) {
      // 3.1 Gerar SKU único
      const sku = item.id.replace('odex_inverters_', '')

      // 3.2 Criar inventory item
      inventoryItems.push({
        sku,
        title: item.name,
        requires_shipping: true,
        origin_country: 'BR',
        hs_code: item.category === 'inverters' ? '8504.40.90' : '8541.40.32',
        location_levels: [
          {
            stocked_quantity: item.availability === 'disponivel' ? 50 : 0,
            location_id: locationId,
          },
        ],
        metadata: {
          source: 'odex',
          external_id: item.id,
          manufacturer: item.manufacturer,
          category: item.category,
        },
      })

      // 3.3 Gerar descrição com AI (se necessário)
      let description = item.description
      if (description.length < 100) {
        try {
          description = await aiService.generateProductDescription({
            name: item.name,
            manufacturer: item.manufacturer,
            category: item.category,
            specs: {},
          })
        } catch (error) {
          console.warn(`⚠️  Erro ao gerar descrição para ${item.name}`)
        }
      }

      // 3.4 Gerar tags com AI
      let tags: string[] = []
      try {
        tags = await aiService.generateTags({
          name: item.name,
          manufacturer: item.manufacturer,
          category: item.category,
          specs: {},
        })
      } catch (error) {
        console.warn(`⚠️  Erro ao gerar tags para ${item.name}`)
      }

      // 3.5 Preparar produto
      products.push({
        title: item.name,
        handle: item.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-'),
        description,
        status: item.availability === 'disponivel' ? 'published' : 'draft',
        variants: [
          {
            title: item.name,
            sku,
            prices: [
              {
                currency_code: 'BRL',
                amount: Math.round(item.pricing.price * 100), // Convert to cents
              },
            ],
            options: {
              'Default Option': 'Default Variant',
            },
            manage_inventory: true,
          },
        ],
        options: [
          {
            title: 'Default Option',
            values: ['Default Variant'],
          },
        ],
        images: item.image
          ? [{ url: `https://plataforma.odex.com.br${item.image}` }]
          : [],
        tags: tags.map(tag => ({ value: tag })),
        metadata: {
          source: 'odex',
          external_id: item.id,
          manufacturer: item.manufacturer,
          category: item.category,
        },
        external_id: item.id,
      })
    }

    return new StepResponse(
      {
        inventoryItems,
        products,
        count: data.length,
      },
      { filePath }
    )
  },
  async ({ filePath }, { container }) => {
    console.log(`Compensating import for ${filePath}`)
  }
)

export const importODEXWorkflow = createWorkflow(
  'import-odex-products-workflow',
  (input: { category: 'inverters' | 'panels' | 'structures' | 'stringboxes' }) => {
    // 1. Determinar arquivo
    const filePath = transform({ category: input.category }, (data) => {
      return path.join(
        __dirname,
        `../../../data/distributor_datasets/odex/odex-${data.category}.json`
      )
    })

    // 2. Importar dados
    const { inventoryItems, products, count } = importODEXProductsStep({
      filePath,
    })

    // 3. Criar inventory items
    const createdInventory = createInventoryItemsWorkflow.runAsStep({
      input: { items: inventoryItems },
    })

    // 4. Associar inventory IDs aos produtos
    const productsWithInventory = transform(
      { products, inventory: createdInventory },
      (data) => {
        return data.products.map((product, index) => ({
          ...product,
          variants: product.variants.map(variant => ({
            ...variant,
            inventory_items: [
              {
                inventory_item_id: data.inventory.inventoryItems[index].id,
                required_quantity: 1,
              },
            ],
          })),
        }))
      }
    )

    // 5. Criar produtos
    const createdProducts = createProductsWorkflow.runAsStep({
      input: { products: productsWithInventory },
    })

    return new WorkflowResponse({
      products: createdProducts,
      count,
      message: `✅ ${count} produtos ODEX importados com sucesso`,
    })
  }
)
```

#### 3.2 API Route para Importação

```typescript
// src/api/import/odex/route.ts

import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { importODEXWorkflow } from '../../../workflows/import-products/import-odex'

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { category } = req.body as {
    category: 'inverters' | 'panels' | 'structures' | 'stringboxes'
  }

  try {
    const { result } = await importODEXWorkflow(req.scope).run({
      input: { category },
    })

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}
```

---

### **Fase 4: Inventory Kits (Fotus)** (Semanas 5-6)

#### 4.1 Workflow de Criação de Kits

```typescript
// src/workflows/create-inventory-kits/fotus-kits.ts

import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
  transform,
} from '@medusajs/framework/workflows-sdk'
import {
  createInventoryItemsWorkflow,
  createProductsWorkflow,
  useQueryGraphStep,
} from '@medusajs/medusa/core-flows'
import { OllamaAIService } from '../../modules/ai-service/ollama-client'

interface FotusKit {
  id: string
  name: string
  power_kw: number
  type: 'grid-tie' | 'hybrid'
  components: {
    inverter: {
      manufacturer: string
      model: string
      power_w: number
      quantity: number
    }
    panels: {
      manufacturer: string
      model: string
      power_w: number
      quantity: number
    }
    structure: {
      type: string
      quantity: number
    }
    cables: {
      type: string
      length_m: number
    }
    stringbox?: {
      entries: number
      quantity: number
    }
    battery?: {
      manufacturer: string
      capacity_kwh: number
      quantity: number
    }
  }
  price: number
}

const createKitProductStep = createStep(
  'create-kit-product',
  async ({ kit }: { kit: FotusKit }, { container }) => {
    const aiService = new OllamaAIService()

    // 1. Buscar componentes existentes no inventário
    const { data: inverters } = await useQueryGraphStep({
      entity: 'inventory_item',
      fields: ['id', 'sku', 'title', 'metadata'],
      filters: {
        'metadata.category': 'inverters',
        'metadata.manufacturer': kit.components.inverter.manufacturer,
      },
    }).run({ container })

    const { data: panels } = await useQueryGraphStep({
      entity: 'inventory_item',
      fields: ['id', 'sku', 'title', 'metadata'],
      filters: {
        'metadata.category': 'panels',
        'metadata.power_w': kit.components.panels.power_w,
      },
    }).run({ container })

    // ... buscar outros componentes

    // 2. Montar inventory kit
    const inventoryItems = [
      {
        inventory_item_id: inverters[0]?.id,
        required_quantity: kit.components.inverter.quantity,
      },
      {
        inventory_item_id: panels[0]?.id,
        required_quantity: kit.components.panels.quantity,
      },
      // ... outros componentes
    ]

    // 3. Gerar descrição do kit com AI
    const description = await aiService.generateProductDescription({
      name: kit.name,
      manufacturer: 'Fotus Kit',
      category: 'kits',
      specs: kit.components,
    })

    // 4. Gerar tags
    const tags = await aiService.generateTags({
      name: kit.name,
      manufacturer: 'Fotus',
      category: 'kits',
      specs: kit.components,
    })

    // 5. Criar produto kit
    const product = {
      title: kit.name,
      subtitle: `${kit.power_kw}kW ${kit.type === 'hybrid' ? 'Híbrido' : 'Grid-Tie'}`,
      handle: kit.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-'),
      description,
      status: 'published',
      variants: [
        {
          title: kit.name,
          sku: `KIT-${kit.power_kw}KW-${kit.type.toUpperCase()}`,
          prices: [
            {
              currency_code: 'BRL',
              amount: Math.round(kit.price * 100),
            },
          ],
          options: {
            Configuração: 'Standard',
          },
          inventory_items: inventoryItems, // ⭐ Inventory Kit!
        },
      ],
      options: [
        {
          title: 'Configuração',
          values: ['Standard'],
        },
      ],
      tags: tags.map(tag => ({ value: tag })),
      categories: ['cat_kits', `cat_kits_${kit.type.replace('-', '_')}`],
      metadata: {
        source: 'fotus',
        kit_type: kit.type,
        system_power_kw: kit.power_kw,
        components: kit.components,
      },
      external_id: kit.id,
    }

    return new StepResponse(
      {
        product,
        kit,
      },
      { kitId: kit.id }
    )
  }
)

export const createFotusKitsWorkflow = createWorkflow(
  'create-fotus-kits-workflow',
  (input: { kits: FotusKit[] }) => {
    const products = []

    for (const kit of input.kits) {
      const { product } = createKitProductStep({ kit })
      products.push(product)
    }

    const created = createProductsWorkflow.runAsStep({
      input: { products },
    })

    return new WorkflowResponse({
      products: created,
      count: input.kits.length,
    })
  }
)
```

---

### **Fase 5: Automações e Jobs** (Semana 7)

#### 5.1 Job Diário de Enriquecimento

```typescript
// src/jobs/daily-product-enrichment.ts

import { MedusaContainer } from '@medusajs/framework/types'
import { enrichProductWorkflow } from '../workflows/ai-enrichment'
import { Modules } from '@medusajs/framework/utils'

export default async function dailyProductEnrichment(
  container: MedusaContainer
) {
  const productModuleService = container.resolve(Modules.PRODUCT)

  console.log('🤖 Iniciando enriquecimento diário de produtos...')

  // 1. Buscar produtos sem descrição completa
  const products = await productModuleService.listProducts({
    filters: {
      $or: [
        { description: null },
        { tags: { $size: 0 } },
        { categories: { $size: 0 } },
      ],
    },
    take: 50, // Processar 50 por dia
  })

  console.log(`📦 ${products.length} produtos para enriquecer`)

  // 2. Enriquecer cada produto
  for (const product of products) {
    try {
      await enrichProductWorkflow(container).run({
        input: { productId: product.id },
      })
      console.log(`✅ ${product.title} enriquecido`)
    } catch (error) {
      console.error(`❌ Erro ao enriquecer ${product.title}:`, error.message)
    }
  }

  console.log('✨ Enriquecimento diário concluído!')
}

export const config = {
  name: 'daily-product-enrichment',
  schedule: '0 2 * * *', // 2:00 AM todos os dias
}
```

#### 5.2 Subscriber de Produto Criado

```typescript
// src/subscribers/product-created-enrichment.ts

import type { SubscriberConfig, SubscriberArgs } from '@medusajs/framework'
import { enrichProductWorkflow } from '../workflows/ai-enrichment'

export default async function handleProductCreated({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log(`🆕 Novo produto criado: ${data.id}`)

  // Enriquecer automaticamente
  try {
    await enrichProductWorkflow(container).run({
      input: { productId: data.id },
    })
    console.log(`✅ Produto ${data.id} enriquecido automaticamente`)
  } catch (error) {
    console.error(`❌ Erro ao enriquecer produto ${data.id}:`, error.message)
  }
}

export const config: SubscriberConfig = {
  event: 'product.created',
}
```

---

### **Fase 6: Dashboard e Monitoramento** (Semana 8)

#### 6.1 Widget do Admin - Status de Inventário

```typescript
// src/admin/widgets/inventory-status.tsx

import { defineWidgetConfig } from '@medusajs/admin-sdk'
import { Container, Heading, Text } from '@medusajs/ui'
import { useEffect, useState } from 'react'

const InventoryStatusWidget = () => {
  const [stats, setStats] = useState({
    total_products: 0,
    total_inventory_items: 0,
    low_stock_items: 0,
    out_of_stock_items: 0,
  })

  useEffect(() => {
    // Fetch inventory stats
    fetch('/admin/inventory/stats')
      .then(res => res.json())
      .then(data => setStats(data))
  }, [])

  return (
    <Container>
      <Heading level="h2">Status do Inventário YSH</Heading>
      <div className="grid grid-cols-4 gap-4 mt-4">
        <div className="p-4 bg-blue-50 rounded">
          <Text className="text-sm text-gray-600">Total de Produtos</Text>
          <Text className="text-2xl font-bold">{stats.total_products}</Text>
        </div>
        <div className="p-4 bg-green-50 rounded">
          <Text className="text-sm text-gray-600">Itens de Inventário</Text>
          <Text className="text-2xl font-bold">{stats.total_inventory_items}</Text>
        </div>
        <div className="p-4 bg-yellow-50 rounded">
          <Text className="text-sm text-gray-600">Estoque Baixo</Text>
          <Text className="text-2xl font-bold text-yellow-600">
            {stats.low_stock_items}
          </Text>
        </div>
        <div className="p-4 bg-red-50 rounded">
          <Text className="text-sm text-gray-600">Sem Estoque</Text>
          <Text className="text-2xl font-bold text-red-600">
            {stats.out_of_stock_items}
          </Text>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: 'product.list.before',
})

export default InventoryStatusWidget
```

---

## 🎯 Checklist de Implementação

### ✅ Semana 1: Setup

- [ ] Instalar Ollama Desktop
- [ ] Baixar modelos: Llama 3.1 70B, Mistral Large 2, DeepSeek Coder V2
- [ ] Criar projeto Medusa.js
- [ ] Configurar PostgreSQL e Redis
- [ ] Estruturar diretórios

### ✅ Semana 2: AI Module

- [ ] Criar OllamaAIService
- [ ] Implementar generateProductDescription()
- [ ] Implementar categorizeProduct()
- [ ] Implementar generateTags()
- [ ] Implementar extractTechnicalSpecs()
- [ ] Implementar analyzeCompatibility()
- [ ] Criar workflow de enriquecimento

### ✅ Semanas 3-4: Importação

- [ ] Criar workflow de importação ODEX
- [ ] Criar workflow de importação Solfacil
- [ ] Criar workflow de importação Fotus
- [ ] Implementar API routes de importação
- [ ] Testar importação de cada categoria
- [ ] Validar dados importados

### ✅ Semanas 5-6: Inventory Kits

- [ ] Mapear componentes dos kits Fotus
- [ ] Criar workflow de criação de kits
- [ ] Associar inventory items aos kits
- [ ] Testar reserva de inventário
- [ ] Validar atualização de estoque

### ✅ Semana 7: Automações

- [ ] Criar job diário de enriquecimento
- [ ] Criar subscriber de produto criado
- [ ] Implementar alertas de estoque baixo
- [ ] Configurar logs e monitoramento

### ✅ Semana 8: Dashboard

- [ ] Criar widgets do Admin
- [ ] Implementar relatórios
- [ ] Treinar equipe
- [ ] Go-live!

---

## 📊 Métricas de Sucesso

| Métrica | Target | Como Medir |
|---------|--------|------------|
| Produtos Importados | 482 | Count no DB |
| Taxa de Enriquecimento AI | >95% | Produtos com descrição + tags |
| Tempo de Importação | <30min | Log de workflows |
| Acurácia de Categorização | >90% | Revisão manual amostra |
| Disponibilidade de Kits | >95% | Check de componentes |
| Tempo de Resposta AI | <5s | Monitoramento |

---

## 🚀 Próximos Passos Pós Go-Live

1. **Integração com Distribuidores**
   - API sync automático com ODEX
   - Webhook de atualizações Solfacil
   - Feed de produtos Fotus

2. **Machine Learning**
   - Modelo de recomendação de produtos
   - Previsão de demanda
   - Otimização de preços

3. **Expansão**
   - Novos distribuidores
   - Novas categorias
   - Marketplace

---

**Desenvolvido por:** YSH Engineering Team  
**Stack:** Medusa.js v2.x + Ollama + LLMs OSS  
**Status:** 🚀 Ready to Implement
