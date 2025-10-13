## Inventário Fortlev — Extração Detalhada de Produtos (13/10/2025)

### Painéis Solares

| Produto | Modelo/Série | Preço |
|---------|--------------|-------|
| PAINEL DMEGC 610 WP DM610G12RT-B66HSW BF | DM610G12RT-B66HSW BF | R$ 567,71 |
| PAINEL LONGI LR7-72HTH-630M HORIZON | LR7-72HTH-630M | R$ 695,83 |
| PAINEL BYD BYD-530W-MLK-36 - 530W | BYD-530W-MLK-36 | R$ 728,12 |
| PAINEL BYD BYD575HRP72S - 575W | BYD575HRP72S | R$ 966,67 |

### Inversores

| Produto | Modelo/Série | Preço |
|---------|--------------|-------|
| HUAWEI HIBRIDO 4KW - 220V - 2 MPPT - AFCI | SUN2000-4KTL-L1 | R$ 4.467,91 |
| HUAWEI ON-GRID 75KW - 220V - 7 MPPT - AFCI | SUN2000-75K-MGL0-BR | R$ 49.856,68 |
| GROWATT MAC-36KTL3-XL2 - 220V - 3MPPT | MAC-36KTL3-XL2 | R$ 19.427,26 |
| GROWATT ON-GRID 30KW - 220V - 3 MPPT - AFCI | MAC30KTL3-XL2 | R$ 17.490,64 |
| ... | ... | ... |

### Estruturas

| Produto | Preço |
|---------|-------|
| PERFIL SUPORTE SMART 2,70M | R$ 80,07 |
| PERF ACAB US75X51X225 1,70MM S400GD ZM310 - ST1 - | R$ 12,87 |
| TESOURA 3300MM ESP 1,95 - FLS | R$ 273,20 |
| PILAR 2425MM ESP 1,95 - FLS | R$ 182,81 |
| ... | ... |

### Dutos e Cabos

| Produto | Preço |
|---------|-------|
| DUTO CORRUGADO CONDUFORT PEAD DN 63 - NBR 680N - (MULT. 100M) | R$ 16,74 |
| CABO 1X6MM VERMELHO 1,8KV | R$ 9,71 |
| CABO PRETO 4MM2 | R$ 6,93 |
| ... | ... |

### Acessórios e Outros

| Produto | Preço |
|---------|-------|
| TC ENPHASE P/ ENVOY-S 220/380V | R$ 334,31 |
| SMART METER FOXESS DDSU666 | R$ 686,58 |
| BASE P/ BATERIA AXE | R$ 284,46 |
| ... | ... |

**Observações:**

- Nem todos os campos (categoria, fabricante, capacidade, série) estão explicitamente presentes nos CSVs; muitas vezes, essas informações estão embutidas no nome do produto ou modelo.
- Todos os itens acima são do distribuidor: **Fortlev**.
- Para lista completa ou outros campos, consultar os arquivos originais ou solicitar detalhamento adicional.

# Sistema RAG e Busca Semântica - YSH

**Versão:** 1.0.0  
**Data:** 13 de outubro de 2025  
**Stack:** Ollama + Gemma 3 + Codex OSS + LangChain + ChromaDB

---

## 🎯 Visão Geral

Sistema completo de **RAG (Retrieval-Augmented Generation)** e **Busca Semântica** para o inventário da Yello Solar Hub, utilizando:

- **Ollama** - Runtime local para LLMs
- **Gemma 3 27B** - Modelo principal da Google DeepMind
- **Codex OSS** - Geração de código e queries
- **LangChain** - Framework para aplicações LLM
- **ChromaDB** - Vector database para embeddings
- **Agentes Multi-Modal** - Orquestração de tarefas complexas

---

## 🤖 Arquitetura RAG

```tsx
┌─────────────────────────────────────────────────────────┐
│                    Frontend (API Request)                │
│          "Quero um inversor 5kW para residencial"       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  RAG Orchestrator Agent                  │
│     ┌──────────────────────────────────────────┐        │
│     │  1. Query Understanding                   │        │
│     │  2. Intent Classification                 │        │
│     │  3. Agent Selection                       │        │
│     └──────────────────────────────────────────┘        │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┬────────────────────┐
         ▼                       ▼                    ▼
┌─────────────────┐    ┌─────────────────┐   ┌─────────────────┐
│ Semantic Search │    │  Product Agent  │   │ Technical Agent │
│     Agent       │    │                 │   │                 │
│                 │    │ - Filtering     │   │ - Specs Check   │
│ - Embeddings    │    │ - Price Range   │   │ - Compatibility │
│ - Vector Search │    │ - Availability  │   │ - Calculations  │
│ - Reranking     │    │ - Ranking       │   │ - Validation    │
└────────┬────────┘    └────────┬────────┘   └────────┬────────┘
         │                      │                      │
         └──────────────────────┴──────────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │   ChromaDB Vector   │
                    │      Database       │
                    │                     │
                    │ - Product Vectors   │
                    │ - Metadata          │
                    │ - Similarity Search │
                    └─────────┬───────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │  Response Generator │
                    │   (Gemma 3 27B)     │
                    │                     │
                    │ - Context Injection │
                    │ - Answer Generation │
                    │ - Source Citation   │
                    └─────────┬───────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │   Formatted Result  │
                    │  + Recommendations  │
                    └─────────────────────┘
```

---

## 📦 Instalação e Setup

### 1. Instalar Dependências

```bash
# Backend dependencies
cd ysh-medusa-backend
npm install langchain @langchain/community @langchain/ollama
npm install chromadb chromadb-default-embed
npm install uuid cohere-ai

# Python dependencies (para embeddings)
pip install chromadb sentence-transformers
pip install ollama langchain-community
```

### 2. Instalar Modelos Ollama

```bash
# Gemma 3 27B (Modelo principal)
ollama pull gemma2:27b

# Nomic Embed Text (Embeddings)
ollama pull nomic-embed-text

# Codestral (Código e queries)
ollama pull codestral:latest

# Llama 3.1 70B (Backup/fallback)
ollama pull llama3.1:70b

# Verificar modelos instalados
ollama list
```

### 3. Configurar ChromaDB

```bash
# Iniciar ChromaDB Server
docker run -p 8000:8000 chromadb/chroma

# Ou local
chroma run --path ./chroma_db
```

---

## 🧠 Implementação do Sistema RAG

### 1. Vector Database Service

```typescript
// src/modules/rag/vector-store.ts

import { ChromaClient, Collection } from 'chromadb'
import { OllamaEmbeddings } from '@langchain/ollama'
import { Document } from 'langchain/document'

export interface ProductDocument {
  id: string
  content: string
  metadata: {
    product_id: string
    title: string
    category: string
    manufacturer: string
    price: number
    power_w?: number
    efficiency?: number
    technology?: string
    [key: string]: any
  }
}

export class VectorStoreService {
  private client: ChromaClient
  private embeddings: OllamaEmbeddings
  private collection: Collection | null = null

  constructor() {
    this.client = new ChromaClient({
      path: process.env.CHROMA_URL || 'http://localhost:8000',
    })

    this.embeddings = new OllamaEmbeddings({
      model: 'nomic-embed-text',
      baseUrl: 'http://localhost:11434',
    })
  }

  /**
   * Inicializa a collection no ChromaDB
   */
  async initialize() {
    try {
      this.collection = await this.client.getOrCreateCollection({
        name: 'ysh_products',
        metadata: { 'hnsw:space': 'cosine' },
      })
      console.log('✅ Vector store inicializado')
    } catch (error) {
      console.error('❌ Erro ao inicializar vector store:', error)
      throw error
    }
  }

  /**
   * Adiciona produtos ao vector store
   */
  async addProducts(products: ProductDocument[]) {
    if (!this.collection) {
      await this.initialize()
    }

    console.log(`📦 Adicionando ${products.length} produtos ao vector store...`)

    // Preparar documentos
    const documents = products.map(p => p.content)
    const metadatas = products.map(p => p.metadata)
    const ids = products.map(p => p.id)

    // Gerar embeddings
    const embeddings = await this.embeddings.embedDocuments(documents)

    // Adicionar ao ChromaDB
    await this.collection!.add({
      ids,
      documents,
      metadatas,
      embeddings,
    })

    console.log(`✅ ${products.length} produtos adicionados ao vector store`)
  }

  /**
   * Busca semântica por similaridade
   */
  async semanticSearch(
    query: string,
    filters?: Record<string, any>,
    limit: number = 10
  ): Promise<{
    results: ProductDocument[]
    distances: number[]
  }> {
    if (!this.collection) {
      await this.initialize()
    }

    // Gerar embedding da query
    const queryEmbedding = await this.embeddings.embedQuery(query)

    // Buscar no ChromaDB
    const results = await this.collection!.query({
      queryEmbeddings: [queryEmbedding],
      nResults: limit,
      where: filters,
    })

    // Formatar resultados
    const products: ProductDocument[] = []
    const distances: number[] = []

    if (results.ids && results.ids[0]) {
      for (let i = 0; i < results.ids[0].length; i++) {
        products.push({
          id: results.ids[0][i],
          content: results.documents![0][i] as string,
          metadata: results.metadatas![0][i] as any,
        })
        distances.push(results.distances![0][i])
      }
    }

    return { results: products, distances }
  }

  /**
   * Busca híbrida (semântica + filtros)
   */
  async hybridSearch(
    query: string,
    filters: {
      category?: string
      manufacturer?: string
      price_min?: number
      price_max?: number
      power_min?: number
      power_max?: number
    },
    limit: number = 10
  ) {
    // Construir filtros ChromaDB
    const whereFilters: Record<string, any> = {}

    if (filters.category) {
      whereFilters['category'] = { $eq: filters.category }
    }
    if (filters.manufacturer) {
      whereFilters['manufacturer'] = { $eq: filters.manufacturer }
    }
    if (filters.price_min || filters.price_max) {
      whereFilters['price'] = {}
      if (filters.price_min) whereFilters['price'].$gte = filters.price_min
      if (filters.price_max) whereFilters['price'].$lte = filters.price_max
    }

    return this.semanticSearch(query, whereFilters, limit)
  }

  /**
   * Limpa o vector store
   */
  async clear() {
    if (this.collection) {
      await this.client.deleteCollection({ name: 'ysh_products' })
      this.collection = null
      console.log('🗑️  Vector store limpo')
    }
  }
}
```

### 2. RAG Orchestrator Agent

```typescript
// src/modules/rag/orchestrator.ts

import { ChatOllama } from '@langchain/ollama'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { VectorStoreService } from './vector-store'

export interface QueryIntent {
  type: 'search' | 'compare' | 'recommend' | 'calculate' | 'question'
  category?: string
  filters: {
    price_range?: [number, number]
    power_range?: [number, number]
    manufacturer?: string
    features?: string[]
  }
  context: string
}

export class RAGOrchestrator {
  private llm: ChatOllama
  private vectorStore: VectorStoreService

  constructor() {
    this.llm = new ChatOllama({
      baseUrl: 'http://localhost:11434',
      model: 'gemma2:27b',
      temperature: 0.1,
    })

    this.vectorStore = new VectorStoreService()
  }

  async initialize() {
    await this.vectorStore.initialize()
  }

  /**
   * Entende a intenção da query do usuário
   */
  async understandQuery(query: string): Promise<QueryIntent> {
    const prompt = PromptTemplate.fromTemplate(`
Você é um especialista em sistemas fotovoltaicos e entende queries de clientes.

Analise a seguinte query e extraia:
1. Tipo de intenção (search, compare, recommend, calculate, question)
2. Categoria de produto (inversores, painéis, estruturas, kits, etc)
3. Filtros mencionados (preço, potência, fabricante, características)
4. Contexto adicional

Query do usuário: {query}

Retorne um JSON estruturado:
{{
  "type": "search" | "compare" | "recommend" | "calculate" | "question",
  "category": "categoria identificada ou null",
  "filters": {{
    "price_range": [min, max] ou null,
    "power_range": [min, max] ou null,
    "manufacturer": "fabricante" ou null,
    "features": ["lista de características"] ou []
  }},
  "context": "contexto extraído da query"
}}

RETORNE APENAS O JSON, SEM TEXTO ADICIONAL.
`)

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser())
    const result = await chain.invoke({ query })

    try {
      // Extrair JSON do resultado
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('JSON não encontrado na resposta')
    } catch (error) {
      console.warn('⚠️  Erro ao parsear intent, usando fallback')
      return {
        type: 'search',
        context: query,
        filters: {},
      }
    }
  }

  /**
   * Executa busca RAG completa
   */
  async search(query: string, limit: number = 10) {
    console.log(`🔍 Processando query: "${query}"`)

    // 1. Entender a query
    const intent = await this.understandQuery(query)
    console.log('🎯 Intenção identificada:', intent.type)

    // 2. Buscar produtos relevantes
    const { results, distances } = await this.vectorStore.hybridSearch(
      query,
      {
        category: intent.category || undefined,
        manufacturer: intent.filters.manufacturer || undefined,
        price_min: intent.filters.price_range?.[0],
        price_max: intent.filters.price_range?.[1],
        power_min: intent.filters.power_range?.[0],
        power_max: intent.filters.power_range?.[1],
      },
      limit
    )

    console.log(`📦 ${results.length} produtos encontrados`)

    // 3. Gerar resposta contextualizada
    const answer = await this.generateAnswer(query, intent, results)

    return {
      query,
      intent,
      products: results.map((r, i) => ({
        ...r,
        similarity_score: (1 - distances[i]) * 100, // Converter distância em score
      })),
      answer,
      metadata: {
        total_results: results.length,
        search_type: intent.type,
        filters_applied: intent.filters,
      },
    }
  }

  /**
   * Gera resposta usando RAG
   */
  private async generateAnswer(
    query: string,
    intent: QueryIntent,
    products: any[]
  ): Promise<string> {
    // Preparar contexto dos produtos
    const context = products
      .slice(0, 5) // Top 5 produtos
      .map(
        (p, i) => `
[Produto ${i + 1}]
${p.content}
Preço: R$ ${p.metadata.price.toFixed(2)}
`
      )
      .join('\n---\n')

    const prompt = PromptTemplate.fromTemplate(`
Você é um consultor especializado em energia solar fotovoltaica da Yello Solar Hub.

Um cliente perguntou: "{query}"

Intenção identificada: {intent_type}
Contexto: {intent_context}

Produtos relevantes no nosso catálogo:
{context}

Com base nessas informações:
1. Responda a pergunta do cliente de forma clara e profissional
2. Recomende os produtos mais adequados
3. Explique por que esses produtos são bons para o caso dele
4. Mencione características técnicas importantes
5. Indique faixas de preço

IMPORTANTE:
- Use linguagem técnica mas acessível
- Seja específico e cite os produtos pelo nome
- Se for comparação, faça análise comparativa
- Se for cálculo, mostre os números
- Sempre cite as fontes (nome dos produtos)

Resposta:
`)

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser())

    return await chain.invoke({
      query,
      intent_type: intent.type,
      intent_context: intent.context,
      context,
    })
  }

  /**
   * Compara produtos específicos
   */
  async compareProducts(productIds: string[]) {
    console.log(`⚖️  Comparando ${productIds.length} produtos`)

    // Buscar produtos por IDs
    const products = await Promise.all(
      productIds.map(id =>
        this.vectorStore.semanticSearch(`product_id:${id}`, undefined, 1)
      )
    )

    const productsList = products
      .map(p => p.results[0])
      .filter(Boolean)

    // Gerar comparação
    const prompt = PromptTemplate.fromTemplate(`
Você é um engenheiro especializado em sistemas fotovoltaicos.

Compare os seguintes produtos em detalhes:

{products}

Faça uma análise comparativa abrangente incluindo:
1. Características técnicas principais
2. Vantagens e desvantagens de cada um
3. Preço e custo-benefício
4. Aplicações recomendadas
5. Compatibilidade entre si (se aplicável)
6. Recomendação final

Use tabelas quando apropriado.
`)

    const context = productsList
      .map(
        (p, i) => `
### Produto ${i + 1}: ${p?.metadata.title}

${p?.content}

**Preço:** R$ ${p?.metadata.price.toFixed(2)}
**Fabricante:** ${p?.metadata.manufacturer}
**Categoria:** ${p?.metadata.category}
`
      )
      .join('\n\n')

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser())

    const comparison = await chain.invoke({ products: context })

    return {
      products: productsList,
      comparison,
    }
  }

  /**
   * Sistema de recomendação inteligente
   */
  async recommend(
    requirements: {
      application: 'residential' | 'commercial' | 'industrial'
      power_needed_kw: number
      budget_max?: number
      preferences?: string[]
    }
  ) {
    console.log('💡 Gerando recomendações personalizadas')

    // Construir query de busca
    const queryParts = [
      `Sistema ${requirements.application}`,
      `${requirements.power_needed_kw}kW`,
    ]

    if (requirements.preferences) {
      queryParts.push(...requirements.preferences)
    }

    const query = queryParts.join(' ')

    // Buscar produtos
    const { results } = await this.vectorStore.hybridSearch(
      query,
      {
        price_max: requirements.budget_max,
      },
      20
    )

    // Gerar recomendação
    const prompt = PromptTemplate.fromTemplate(`
Você é um consultor de energia solar especializado em dimensionamento de sistemas.

Um cliente precisa de:
- Aplicação: {application}
- Potência necessária: {power_kw}kW
- Orçamento máximo: {budget}
- Preferências: {preferences}

Produtos disponíveis no catálogo:
{products}

Faça uma recomendação completa incluindo:
1. Kit ou combinação de produtos ideal
2. Justificativa técnica do dimensionamento
3. Estimativa de geração de energia
4. Análise de custo-benefício
5. Prazo de retorno do investimento (payback)
6. Produtos alternativos (se houver)

Seja específico com números e cálculos.
`)

    const context = results
      .slice(0, 10)
      .map(
        p => `
- ${p.metadata.title}
  Preço: R$ ${p.metadata.price.toFixed(2)}
  ${p.metadata.power_w ? `Potência: ${p.metadata.power_w}W` : ''}
  Fabricante: ${p.metadata.manufacturer}
`
      )
      .join('\n')

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser())

    const recommendation = await chain.invoke({
      application: requirements.application,
      power_kw: requirements.power_needed_kw,
      budget: requirements.budget_max
        ? `R$ ${requirements.budget_max.toFixed(2)}`
        : 'Não especificado',
      preferences: requirements.preferences?.join(', ') || 'Nenhuma',
      products: context,
    })

    return {
      requirements,
      recommended_products: results.slice(0, 5),
      recommendation,
    }
  }
}
```

### 3. Agentes Especializados

```typescript
// src/modules/rag/agents/technical-agent.ts

import { ChatOllama } from '@langchain/ollama'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

export class TechnicalAgent {
  private llm: ChatOllama

  constructor() {
    this.llm = new ChatOllama({
      baseUrl: 'http://localhost:11434',
      model: 'codestral:latest', // Especializado em cálculos técnicos
      temperature: 0,
    })
  }

  /**
   * Calcula dimensionamento de sistema fotovoltaico
   */
  async calculateSystemSize(params: {
    monthly_consumption_kwh: number
    location: string
    roof_type?: string
  }) {
    const prompt = PromptTemplate.fromTemplate(`
Você é um engenheiro eletricista especializado em sistemas fotovoltaicos.

Calcule o dimensionamento de um sistema fotovoltaico:

Consumo mensal: {consumption} kWh
Localização: {location}
Tipo de telhado: {roof_type}

Calcule e retorne um JSON com:
{{
  "daily_consumption_kwh": número,
  "peak_sun_hours": número (média para a região),
  "system_power_kwp": número (potência do sistema),
  "panel_quantity": número (quantidade de painéis de 550W),
  "inverter_power_kw": número (potência do inversor),
  "estimated_generation_monthly_kwh": número,
  "roof_area_needed_m2": número,
  "estimated_cost_brl": número,
  "payback_years": número,
  "co2_savings_yearly_kg": número
}}

Use dados realistas para o Brasil.
RETORNE APENAS O JSON.
`)

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser())

    const result = await chain.invoke({
      consumption: params.monthly_consumption_kwh,
      location: params.location,
      roof_type: params.roof_type || 'cerâmico',
    })

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error('Erro ao parsear cálculo:', error)
    }

    return null
  }

  /**
   * Verifica compatibilidade entre inversor e painéis
   */
  async checkCompatibility(inverter: any, panels: any[]) {
    const prompt = PromptTemplate.fromTemplate(`
Você é um engenheiro especializado em compatibilidade de sistemas fotovoltaicos.

Analise a compatibilidade entre este inversor e painéis:

INVERSOR:
{inverter}

PAINÉIS:
{panels}

Verifique:
1. Faixa de tensão MPPT
2. Corrente máxima de entrada
3. Quantidade máxima de painéis por string
4. Quantidade de strings (MPPTs)
5. Potência total vs potência do inversor (fator de dimensionamento)

Retorne um JSON:
{{
  "compatible": boolean,
  "compatibility_score": 0-100,
  "issues": ["lista de problemas"],
  "warnings": ["lista de avisos"],
  "recommendations": ["recomendações"],
  "max_panels_per_string": número,
  "optimal_configuration": {{
    "strings": número,
    "panels_per_string": número,
    "total_panels": número,
    "total_power_kwp": número,
    "oversizing_factor": número
  }}
}}

RETORNE APENAS O JSON.
`)

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser())

    const result = await chain.invoke({
      inverter: JSON.stringify(inverter, null, 2),
      panels: JSON.stringify(panels, null, 2),
    })

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error('Erro ao parsear compatibilidade:', error)
    }

    return null
  }

  /**
   * Gera código de integração para sistemas
   */
  async generateIntegrationCode(system: {
    inverter: string
    monitoring_platform?: string
    language: 'python' | 'javascript' | 'typescript'
  }) {
    const prompt = PromptTemplate.fromTemplate(`
Gere código de integração para monitoramento de sistema fotovoltaico.

Inversor: {inverter}
Plataforma: {platform}
Linguagem: {language}

Gere código funcional que:
1. Conecta ao inversor via Modbus/API
2. Lê dados de geração em tempo real
3. Armazena em banco de dados
4. Envia alertas se houver problemas

Inclua:
- Imports necessários
- Configuração
- Funções principais
- Tratamento de erros
- Comentários explicativos

Código:
`)

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser())

    return await chain.invoke({
      inverter: system.inverter,
      platform: system.monitoring_platform || 'Generic',
      language: system.language,
    })
  }
}
```

### 4. API Routes

```typescript
// src/api/rag/search/route.ts

import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { RAGOrchestrator } from '../../../modules/rag/orchestrator'

const orchestrator = new RAGOrchestrator()
await orchestrator.initialize()

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { query, limit = 10 } = req.body as {
    query: string
    limit?: number
  }

  try {
    const result = await orchestrator.search(query, limit)

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

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.query.q as string
  const limit = parseInt(req.query.limit as string) || 10

  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'Query parameter "q" is required',
    })
  }

  try {
    const result = await orchestrator.search(query, limit)

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

```typescript
// src/api/rag/recommend/route.ts

import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { RAGOrchestrator } from '../../../modules/rag/orchestrator'

const orchestrator = new RAGOrchestrator()
await orchestrator.initialize()

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const requirements = req.body as {
    application: 'residential' | 'commercial' | 'industrial'
    power_needed_kw: number
    budget_max?: number
    preferences?: string[]
  }

  try {
    const result = await orchestrator.recommend(requirements)

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

```typescript
// src/api/rag/calculate/route.ts

import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { TechnicalAgent } from '../../../modules/rag/agents/technical-agent'

const technicalAgent = new TechnicalAgent()

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { monthly_consumption_kwh, location, roof_type } = req.body as {
    monthly_consumption_kwh: number
    location: string
    roof_type?: string
  }

  try {
    const result = await technicalAgent.calculateSystemSize({
      monthly_consumption_kwh,
      location,
      roof_type,
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

## 🚀 Scripts de Indexação

### Script de População do Vector Store

```typescript
// scripts/populate-vector-store.ts

import { VectorStoreService, ProductDocument } from '../src/modules/rag/vector-store'
import { Modules } from '@medusajs/framework/utils'
import fs from 'fs'
import path from 'path'

async function populateVectorStore() {
  console.log('🚀 Iniciando população do vector store...')

  const vectorStore = new VectorStoreService()
  await vectorStore.initialize()

  // Limpar dados antigos
  await vectorStore.clear()
  await vectorStore.initialize()

  // 1. Carregar dados dos distribuidores
  const dataDir = path.join(__dirname, '../data/distributor_datasets')

  const files = [
    { path: 'odex/odex-inverters.json', category: 'inverters' },
    { path: 'odex/odex-panels.json', category: 'panels' },
    { path: 'odex/odex-structures.json', category: 'structures' },
    { path: 'odex/odex-stringboxes.json', category: 'stringboxes' },
    { path: 'solfacil/solfacil-inverters.json', category: 'inverters' },
    { path: 'solfacil/solfacil-panels.json', category: 'panels' },
    { path: 'solfacil/solfacil-batteries.json', category: 'batteries' },
    { path: 'solfacil/solfacil-cables.json', category: 'cables' },
  ]

  const allProducts: ProductDocument[] = []

  for (const file of files) {
    const filePath = path.join(dataDir, file.path)
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Arquivo não encontrado: ${filePath}`)
      continue
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    console.log(`📦 Carregando ${data.length} produtos de ${file.path}`)

    const products: ProductDocument[] = data.map((item: any) => {
      // Criar texto rico para embedding
      const content = `
${item.name}
Fabricante: ${item.manufacturer}
Categoria: ${file.category}
${item.description || ''}

Especificações Técnicas:
${item.model ? `Modelo: ${item.model}` : ''}
${item.power_w ? `Potência: ${item.power_w}W` : ''}
${item.voltage_v ? `Tensão: ${item.voltage_v}V` : ''}
${item.efficiency ? `Eficiência: ${item.efficiency}%` : ''}
${item.technology ? `Tecnologia: ${item.technology}` : ''}

Preço: R$ ${item.pricing?.price || 0}
Disponibilidade: ${item.availability || 'disponível'}
      `.trim()

      return {
        id: item.id,
        content,
        metadata: {
          product_id: item.id,
          title: item.name,
          category: file.category,
          manufacturer: item.manufacturer,
          model: item.model || '',
          price: item.pricing?.price || 0,
          power_w: item.power_w,
          efficiency: item.efficiency,
          technology: item.technology,
          availability: item.availability,
          source: item.source,
          image: item.image,
        },
      }
    })

    allProducts.push(...products)
  }

  // 2. Adicionar ao vector store em batches
  const batchSize = 100
  for (let i = 0; i < allProducts.length; i += batchSize) {
    const batch = allProducts.slice(i, i + batchSize)
    await vectorStore.addProducts(batch)
    console.log(`✅ Batch ${i / batchSize + 1} adicionado (${batch.length} produtos)`)
  }

  console.log(`🎉 Vector store populado com ${allProducts.length} produtos!`)
}

// Executar
populateVectorStore()
  .then(() => {
    console.log('✨ Concluído!')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Erro:', error)
    process.exit(1)
  })
```

---

## 📊 Exemplos de Uso

### 1. Busca Semântica Simples

```bash
curl -X POST http://localhost:9000/rag/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "inversor 5kW para sistema residencial",
    "limit": 5
  }'
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "query": "inversor 5kW para sistema residencial",
    "intent": {
      "type": "search",
      "category": "inversores",
      "filters": {
        "power_range": [4000, 6000]
      },
      "context": "Cliente procura inversor de 5kW para aplicação residencial"
    },
    "products": [
      {
        "id": "odex_inverters_ODEX-INV-SAJ-5000W",
        "metadata": {
          "title": "Inversor SAJ 5kW",
          "manufacturer": "SAJ",
          "price": 1999.0,
          "power_w": 5000
        },
        "similarity_score": 95.8
      }
    ],
    "answer": "Para um sistema residencial de 5kW, recomendo o Inversor SAJ R5-5K-T2 BRL..."
  }
}
```

### 2. Sistema de Recomendação

```bash
curl -X POST http://localhost:9000/rag/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "application": "residential",
    "power_needed_kw": 5.5,
    "budget_max": 20000,
    "preferences": ["alta eficiência", "garantia estendida"]
  }'
```

### 3. Cálculo de Dimensionamento

```bash
curl -X POST http://localhost:9000/rag/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "monthly_consumption_kwh": 500,
    "location": "São Paulo, SP",
    "roof_type": "cerâmico"
  }'
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "daily_consumption_kwh": 16.67,
    "peak_sun_hours": 4.5,
    "system_power_kwp": 5.2,
    "panel_quantity": 10,
    "inverter_power_kw": 5,
    "estimated_generation_monthly_kwh": 585,
    "roof_area_needed_m2": 26,
    "estimated_cost_brl": 18500,
    "payback_years": 4.2,
    "co2_savings_yearly_kg": 3800
  }
}
```

### 4. Comparação de Produtos

```bash
curl -X POST http://localhost:9000/rag/compare \
  -H "Content-Type: application/json" \
  -d '{
    "product_ids": [
      "odex_inverters_ODEX-INV-SAJ-5000W",
      "odex_inverters_ODEX-INV-GROWATT-5000W"
    ]
  }'
```

---

## 🎨 Frontend - Chat Interface

```typescript
// admin/components/rag-chat.tsx

import { useState } from 'react'
import { Container, Heading, Button, Input, Text } from '@medusajs/ui'

export const RAGChat = () => {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant'
    content: string
  }>>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: query }])

    try {
      const response = await fetch('/admin/rag/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.data.answer },
      ])
    } catch (error) {
      console.error('Erro na busca:', error)
    } finally {
      setLoading(false)
      setQuery('')
    }
  }

  return (
    <Container className="max-w-4xl mx-auto p-6">
      <Heading level="h1" className="mb-6">
        🤖 Assistente Inteligente YSH
      </Heading>

      <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-4 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-50 ml-12'
                : 'bg-gray-50 mr-12'
            }`}
          >
            <Text className="text-sm font-medium mb-1">
              {msg.role === 'user' ? '👤 Você' : '🤖 Assistente'}
            </Text>
            <Text>{msg.content}</Text>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
          placeholder="Pergunte sobre produtos, faça cálculos, peça recomendações..."
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? 'Processando...' : 'Enviar'}
        </Button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <Text>Exemplos de perguntas:</Text>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Preciso de um inversor de 5kW para residência</li>
          <li>Qual o melhor painel bifacial disponível?</li>
          <li>Compare o SAJ 5kW com o Growatt 5kW</li>
          <li>Calcule um sistema para 500 kWh/mês em São Paulo</li>
          <li>Monte um kit completo de 10kW</li>
        </ul>
      </div>
    </Container>
  )
}
```

---

## 📈 Métricas e Monitoramento

### Dashboard de Performance

```typescript
// admin/widgets/rag-metrics.tsx

import { useEffect, useState } from 'react'
import { Container, Heading, Text } from '@medusajs/ui'

export const RAGMetrics = () => {
  const [metrics, setMetrics] = useState({
    total_queries: 0,
    avg_response_time_ms: 0,
    avg_similarity_score: 0,
    most_searched_categories: [],
    cache_hit_rate: 0,
  })

  useEffect(() => {
    fetch('/admin/rag/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data))
  }, [])

  return (
    <Container>
      <Heading level="h2">📊 Métricas RAG</Heading>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="p-4 bg-blue-50 rounded">
          <Text className="text-sm text-gray-600">Queries Totais</Text>
          <Text className="text-2xl font-bold">{metrics.total_queries}</Text>
        </div>
        <div className="p-4 bg-green-50 rounded">
          <Text className="text-sm text-gray-600">Tempo Médio</Text>
          <Text className="text-2xl font-bold">
            {metrics.avg_response_time_ms}ms
          </Text>
        </div>
        <div className="p-4 bg-purple-50 rounded">
          <Text className="text-sm text-gray-600">Score Similaridade</Text>
          <Text className="text-2xl font-bold">
            {metrics.avg_similarity_score.toFixed(1)}%
          </Text>
        </div>
      </div>
    </Container>
  )
}
```

---

## 🎯 Roadmap de Implementação

### Fase 1: Setup (Semana 1)

- [ ] Instalar ChromaDB
- [ ] Instalar Gemma 3 27B e Nomic Embed
- [ ] Configurar VectorStoreService
- [ ] Popular vector store inicial

### Fase 2: RAG Core (Semana 2)

- [ ] Implementar RAGOrchestrator
- [ ] Criar sistema de intents
- [ ] Implementar busca híbrida
- [ ] Testes de precisão

### Fase 3: Agentes (Semana 3)

- [ ] TechnicalAgent (cálculos)
- [ ] ComparisonAgent
- [ ] RecommendationAgent
- [ ] Integração entre agentes

### Fase 4: APIs (Semana 4)

- [ ] API routes RESTful
- [ ] WebSocket para chat em tempo real
- [ ] Autenticação e rate limiting
- [ ] Documentação Swagger

### Fase 5: Frontend (Semana 5)

- [ ] Chat interface no Admin
- [ ] Widget de busca no Storefront
- [ ] Dashboard de métricas
- [ ] Mobile responsive

### Fase 6: Otimizações (Semana 6)

- [ ] Cache de queries frequentes
- [ ] Reranking de resultados
- [ ] Fine-tuning de embeddings
- [ ] Performance monitoring

---

## 🚀 Go-Live Checklist

- [ ] ChromaDB rodando em produção
- [ ] Todos os produtos indexados
- [ ] Gemma 3 27B otimizado
- [ ] APIs testadas e documentadas
- [ ] Frontend integrado
- [ ] Métricas configuradas
- [ ] Backups configurados
- [ ] Monitoramento ativo

---

**Desenvolvido por:** YSH AI Team  
**Stack:** Gemma 3 + Ollama + ChromaDB + LangChain  
**Status:** 🚀 Ready to Deploy

## dev3000 — Extrato cirúrgico (dev3000)

Comandante A, aqui vai o extrato cirúrgico do **dev3000** — apenas o que importa para operar.

### JTBDs (Jobs To Be Done)

- **Dar “olhos” à IA no dev loop** para que o agente veja **logs do servidor, eventos do navegador, rede e screenshots** em uma única **linha do tempo** e proponha/finalize correções. ([dev3000][1])
- **Reproduzir e diagnosticar bugs** rapidamente com **contexto completo e ordenado por timestamp** (servidor ↔ cliente ↔ rede ↔ visual). ([dev3000][1])
- **Orquestrar debugging com MCP**, ativando automaticamente integrações (ex.: **chrome-devtools-mcp** e **nextjs-dev-mcp**) quando disponíveis. ([dev3000][1])
- **Manter estado de sessão** (login, cookies) por projeto para testes e validações repetíveis. ([dev3000][1])
- **Minimizar fricção de onboarding**, substituindo o comando `dev` e abrindo um Chrome monitorado/automatizado. ([dev3000][1])

### Users Inputs (entradas do usuário)

- **Execução básica**: `dev3000` (ou alias **`d3k`** na doc do site) em vez de `dev`; exemplos: `d3k -p 5000`, `d3k -s build-start`. ([dev3000][1])
- **Flags de CLI** (opções): `--port` (porta do app), `--mcp-port` (padrão 3684), `--script` (script do package.json), `--browser <path>` (binário do navegador), `--servers-only` (pula Playwright para usar a extensão), `--profile-dir <dir>` (perfil do Chrome). ([GitHub][2])
- **Modo de captura**: **Padrão** = Playwright (lança Chrome controlado) • **Alternativo** = **Extensão Chrome** + `--servers-only`. ([GitHub][2])
- **Integração MCP/Agente**: basta rodar o dev3000; em clientes MCP (ex.: Claude Code) usar prompts como **“fix my app”**; o dev3000 detecta e sugere capacidades extras se os MCPs especializados estiverem ativos. ([GitHub][2])

### System Outputs (saídas do sistema)

- **Linha do tempo unificada** com tudo correlacionado e **viewer** em `http://localhost:3684/logs`. ([GitHub][2])
- **Capturas automáticas**: server logs, console do navegador, **requisições/respostas HTTP** e **screenshots** em navegação/erros. ([dev3000][1])
- **MCP HTTP server** em `http://localhost:3684/mcp`, com ferramentas como `read_consolidated_logs`, `search_logs`, `get_browser_errors`, `execute_browser_action`, etc. ([GitHub][2])
- **Persistência/rotação**: logs timestampados, com retenção/rotação local (mantém os **10** mais recentes por projeto). ([GitHub][2])
- **Perf/Privacidade**: impacto mínimo (observa via CDP; screenshots assíncronas) e **dados apenas locais** (perfis em `~/.dev3000/profiles`). ([dev3000][1])

[1]: https://dev3000.ai/ "dev3000 - AI-Powered Debugging & Development Monitoring | Vercel Labs"
[2]: https://github.com/vercel-labs/dev3000 "GitHub - vercel-labs/dev3000: Captures your web app's complete development timeline - server logs, browser events, console messages, network requests, and automatic screenshots - in a unified, timestamped feed for AI debugging."
