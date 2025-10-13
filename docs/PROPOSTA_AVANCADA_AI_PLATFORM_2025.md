# 🚀 Proposta Avançada: AI-Powered E-commerce Platform 2025

**Data**: 13 de outubro de 2025  
**Projeto**: YSH (Yellow Solar Hub) B2B Solar Platform  
**Versão**: 2.0 - Arquitetura Unificada AI/ML  
**Status**: 🎯 Roadmap Estratégico

---

## 📋 Sumário Executivo

Esta proposta apresenta uma **evolução radical** da plataforma YSH, transformando-a em um **e-commerce inteligente** com capacidades de:

1. **Análise Multimodal de Produtos** (visão + texto + especificações técnicas)
2. **RAG Conversacional com Hélio Copiloto Solar** (assistente técnico B2B)
3. **Recomendação Inteligente** (cotações automáticas, dimensionamento de sistemas)
4. **Enriquecimento Automático de Catálogo** (pipeline AgentFlow multi-agente)
5. **Streaming ETL Real-time** (Pathway + Dagster + Qdrant)

---

## 🎯 Visão Geral da Arquitetura

### Stack Tecnológico Atual vs. Proposto

| Componente | Status Atual ✅ | Evolução Proposta 🚀 |
|------------|-----------------|---------------------|
| **LLM Vision** | Llama 3.2 Vision:11b | + GPT-4o Vision fallback |
| **LLM Text** | Gemma 3:4b + GPT-OSS:20b | + Qwen 2.5:20b fine-tuned |
| **Embeddings** | OpenAI text-embedding-3-large (3072d) | + Nomic-embed-text (768d) local |
| **Vector DB** | Qdrant OSS (4 collections) | + 8 collections especializadas |
| **Orchestration** | Dagster (exemplos básicos) | + Pathway streaming + Airflow |
| **AgentFlow** | 5 agentes (planner, vision, enrichment, validator, search) | + 12 agentes especializados |
| **Cache** | Filesystem JSON cache | + Redis embeddings cache |
| **Monitoring** | Logs básicos | + OpenTelemetry + Grafana |

---

## 🏗️ Arquitetura Unificada AI/ML Platform

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         CAMADA 1: USER INTERFACES                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐              │
│  │ Storefront       │  │ Admin Dashboard  │  │ API Endpoints    │              │
│  │ (Next.js 15)     │  │ (Medusa Admin)   │  │ /store/rag/*     │              │
│  │ - Chat Hélio     │  │ - Catalog Mgmt   │  │ /admin/rag/*     │              │
│  │ - Smart Search   │  │ - Agent Monitor  │  │ /webhooks/ai/*   │              │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    CAMADA 2: ORCHESTRATION & WORKFLOWS                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  AgentFlow Multi-Agent Orchestrator v2.0                                │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │   │
│  │  │ Vision Squad │  │ Text Squad   │  │ Validator    │                  │   │
│  │  │ - Primary    │  │ - Enrichment │  │ - Quality    │                  │   │
│  │  │ - Fallback   │  │ - Translation│  │ - Compliance │                  │   │
│  │  │ - Specialist │  │ - SEO        │  │ - Security   │                  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                  │   │
│  │                                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │   │
│  │  │ Search Agent │  │ Pricing      │  │ Compatibility│                  │   │
│  │  │ - Web scraper│  │ - Market AI  │  │ - System     │                  │   │
│  │  │ - PDF parser │  │ - Dynamic    │  │ - Technical  │                  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Dagster Assets (Batch Processing)                                      │   │
│  │  - catalog_enrichment_pipeline                                          │   │
│  │  - embeddings_generation_batch                                          │   │
│  │  - pvlib_normalization_workflow                                         │   │
│  │  - quality_assurance_checks                                             │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Pathway Streaming Pipelines (Real-time)                                │   │
│  │  - rag_streaming_pipeline (docs → embeddings → Qdrant)                  │   │
│  │  - catalog_delta_stream (incremental updates)                           │   │
│  │  - user_behavior_analytics (clickstream → recommendations)              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         CAMADA 3: AI/ML MODELS                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐     │
│  │  Vision Models (Multimodal)                                           │     │
│  │  ┌─────────────────────┐  ┌─────────────────────┐                     │     │
│  │  │ Llama 3.2 Vision:11b│  │ GPT-4o Vision (API) │                     │     │
│  │  │ - Primary (local)   │  │ - Fallback (cloud)  │                     │     │
│  │  │ - 7.8GB, 128K ctx   │  │ - High accuracy     │                     │     │
│  │  └─────────────────────┘  └─────────────────────┘                     │     │
│  └───────────────────────────────────────────────────────────────────────┘     │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐     │
│  │  Text Models (LLM)                                                    │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │     │
│  │  │ Gemma 3:4b   │  │ Qwen 2.5:20b │  │ GPT-OSS:20b  │                │     │
│  │  │ - Fast       │  │ - Balanced   │  │ - Quality    │                │     │
│  │  │ - Enrichment │  │ - RAG chat   │  │ - Validation │                │     │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │     │
│  └───────────────────────────────────────────────────────────────────────┘     │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐     │
│  │  Embedding Models                                                     │     │
│  │  ┌────────────────────────────┐  ┌───────────────────────────┐       │     │
│  │  │ OpenAI text-embedding-3-large│  │ nomic-embed-text         │       │     │
│  │  │ - 3072 dimensions           │  │ - 768 dimensions          │       │     │
│  │  │ - High semantic quality     │  │ - Local, zero-cost        │       │     │
│  │  │ - Collections: catalog, kb  │  │ - Collection: local-docs  │       │     │
│  │  └────────────────────────────┘  └───────────────────────────┘       │     │
│  └───────────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      CAMADA 4: VECTOR DATABASES                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Qdrant OSS (Docker Container)                                          │   │
│  │                                                                           │   │
│  │  📦 Collections OpenAI (3072d):                                          │   │
│  │    1. ysh-catalog (produtos)                   - 10 vectors              │   │
│  │    2. ysh-regulations (ANEEL, INMETRO)        - 3 vectors               │   │
│  │    3. ysh-tariffs (tarifas elétricas)         - 3 vectors               │   │
│  │    4. ysh-technical (docs técnicos)           - 3 vectors               │   │
│  │                                                                           │   │
│  │  📦 Collections Nomic (768d) - PROPOSTAS:                                │   │
│  │    5. ysh-local-catalog (backup offline)      - NEW                     │   │
│  │    6. ysh-conversations (histórico chat)      - NEW                     │   │
│  │    7. ysh-user-behavior (clickstream)         - NEW                     │   │
│  │    8. ysh-pvlib-database (19K módulos/inversores) - NEW                 │   │
│  │                                                                           │   │
│  │  Features:                                                                │   │
│  │    - Hybrid search (dense + sparse BM25)                                 │   │
│  │    - Multi-tenancy (namespace por distribuidor)                          │   │
│  │    - Filtered search (metadata: categoria, fabricante, potência)         │   │
│  │    - Sharding para scale horizontal                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    CAMADA 5: DATA PERSISTENCE                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐              │
│  │ PostgreSQL 15    │  │ Redis            │  │ S3/MinIO         │              │
│  │ - Medusa catalog │  │ - Embeddings     │  │ - Images         │              │
│  │ - Companies      │  │ - Session cache  │  │ - Documents      │              │
│  │ - Orders         │  │ - Rate limiting  │  │ - Backups        │              │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 AgentFlow v2.0 - Arquitetura Multi-Agent Expandida

### Visão Geral

**Atual**: 5 agentes básicos  
**Proposta**: 12 agentes especializados com hierarquia

### Agentes Propostos

#### 1. **Vision Squad** (3 agentes)

##### 1.1 Primary Vision Agent

- **Modelo**: Llama 3.2 Vision:11b (local)
- **Responsabilidades**:
  - Extração de metadados visuais
  - OCR de especificações técnicas
  - Detecção de logos e certificações
  - Quality scoring
- **Performance**: 60-120s por imagem (com cache)
- **Fallback**: GPT-4o Vision se confiança < 70%

##### 1.2 Specialist Vision Agent

- **Modelo**: GPT-4o Vision (API)
- **Trigger**: Primary agent confidence < 70% OR critical products
- **Responsabilidades**:
  - Análise de produtos complexos (híbridos, baterias)
  - Extração de textos pequenos/ilegíveis
  - Validação de certificações críticas

##### 1.3 Image Quality Agent

- **Modelo**: Computer Vision tradicional (OpenCV)
- **Responsabilidades**:
  - Pre-processing (resize, contrast, denoising)
  - Quality checks antes de enviar para LLM
  - Sugestões de recrop para melhor extração

---

#### 2. **Text Squad** (4 agentes)

##### 2.1 Enrichment Agent (atual Gemma 3)

- **Mantém responsabilidades atuais**:
  - Normalização de SKUs
  - Mapeamento de categorias
  - Complemento de specs com PVLib

##### 2.2 Translation Agent

- **Modelo**: Gemma 3:4b fine-tuned
- **Responsabilidades**:
  - PT-BR ↔ EN para matching com PVLib
  - Normalização de unidades (W/kW, V/kV)
  - Expansão de abreviações (inv → inverter, mod → module)

##### 2.3 SEO Optimization Agent

- **Modelo**: Qwen 2.5:20b
- **Responsabilidades**:
  - Geração de títulos otimizados
  - Meta descriptions (155 chars)
  - Bullet points de features
  - Tags semânticas
- **Output**: `seo_metadata` field no produto

##### 2.4 Compatibility Agent

- **Modelo**: Qwen 2.5:20b + PVLib computational
- **Responsabilidades**:
  - Cross-reference painel ↔ inversor
  - Cálculo de string sizing
  - Sugestão de kits completos
  - Validação técnica (Voc, Isc, MPPT range)
- **Output**: `compatibility` field com recomendações

---

#### 3. **Validator Squad** (2 agentes)

##### 3.1 Quality Validator (atual GPT-OSS)

- **Mantém responsabilidades atuais**
- **Adiciona**:
  - Validação cruzada entre Vision + Enrichment
  - Score de confiança probabilístico
  - Sugestão de re-processamento seletivo

##### 3.2 Compliance Validator

- **Modelo**: GPT-OSS:20b + rule engine
- **Responsabilidades**:
  - Verificação INMETRO (inversores grid-tie)
  - Validação ANEEL Resolução 1.000/2021
  - Conformidade IEC 61215 (módulos)
  - Segurança elétrica NR-10
- **Output**: `compliance` field com status/alertas

---

#### 4. **Search & Discovery Squad** (2 agentes)

##### 4.1 Web Search Agent (atual incrementado)

- **Adiciona**:
  - Scraping de datasheets (fabricantes)
  - Busca em PDFs técnicos (PyMuPDF)
  - Comparação de preços (mercado)
  - Extração de reviews (confiabilidade)

##### 4.2 Knowledge Base Agent

- **NEW**
- **Modelo**: Qwen 2.5:20b
- **Fontes**:
  - Documentação técnica interna
  - Base PVLib (19K produtos)
  - FAQ de suporte
  - Histórico de vendas (produtos mais vendidos juntos)
- **Responsabilidades**:
  - Responder dúvidas técnicas complexas
  - Sugerir substituições (produtos descontinuados)
  - Cross-sell inteligente

---

#### 5. **Business Intelligence Squad** (2 agentes)

##### 5.1 Pricing Agent

- **NEW**
- **Modelo**: ML tradicional (XGBoost) + Qwen 2.5
- **Responsabilidades**:
  - Sugestão de preços competitivos
  - Análise de margem por categoria
  - Detecção de outliers (erros de precificação)
  - Dynamic pricing (eventos, sazonalidade)

##### 5.2 Recommendation Agent

- **NEW**
- **Modelo**: Collaborative filtering + Qwen 2.5:20b
- **Responsabilidades**:
  - "Clientes que compraram X também compraram Y"
  - Upsell técnico (inversor maior, mais painéis)
  - Kits completos personalizados
  - Dimensionamento automático (consumo kWh → sistema recomendado)

---

## 📊 RAG System v2.0 - Enhanced Conversational AI

### Hélio Copiloto Solar - Capacidades Expandidas

#### Contexto Atual ✅

- 4 collections Qdrant (19 vectors total)
- OpenAI embeddings (3072d)
- Endpoints básicos (`/ask-helio`, `/recommend-products`, `/search`)

#### Evolução Proposta 🚀

##### 1. **Collections Novas (Nomic 768d para reduzir custo)**

| Collection | Descrição | Tamanho Estimado |
|------------|-----------|------------------|
| `ysh-local-catalog` | Backup offline do catálogo | ~500 vectors |
| `ysh-conversations` | Histórico de conversas (contexto long-term) | ~10K vectors |
| `ysh-user-behavior` | Clickstream analytics (recomendação) | ~50K vectors |
| `ysh-pvlib-database` | 19K módulos/inversores científicos | 19K vectors |

##### 2. **Hybrid Search (Dense + Sparse)**

```python
# Busca híbrida: semântica (embeddings) + keyword (BM25)
results = qdrant.search(
    collection_name="ysh-catalog",
    query_vector=embedding,
    query_filter={
        "must": [
            {"key": "category", "match": {"value": "INVERTERS"}},
            {"key": "power_kw", "range": {"gte": 5, "lte": 10}}
        ]
    },
    search_params={
        "hnsw_ef": 128,
        "exact": False
    },
    limit=10,
    # Sparse vector para keywords
    sparse_vector={
        "indices": [...],  # Token IDs
        "values": [...]    # TF-IDF scores
    }
)
```

**Benefício**: Melhora recall em 30-40% (estudo Pinecone 2024)

##### 3. **Multi-Turn Conversations com Memory**

```python
# Armazenar histórico de conversação
conversation_memory = {
    "user_id": "emp_12345",
    "session_id": "sess_abc123",
    "turns": [
        {"role": "user", "content": "Preciso de um inversor 10kW"},
        {"role": "assistant", "content": "Recomendo o Growatt...", "products_shown": ["prod_123"]},
        {"role": "user", "content": "E painéis compatíveis?"},
        # Context window mantém produtos já discutidos
    ],
    "extracted_requirements": {
        "power_kw": 10,
        "type": "inverter",
        "budget_range": None,
        "location": None
    }
}

# Upsert no Qdrant collection 'ysh-conversations'
```

**Benefício**: Hélio "lembra" do contexto da conversa anterior

##### 4. **Smart Quoting System**

**Workflow**:

1. User: "Preciso de um sistema 10kWp para indústria em SP"
2. Hélio extrai requirements:
   - Potência: 10kWp
   - Tipo: Grid-tie (indústria)
   - Localização: São Paulo (tarifa Grupo A)
3. Compatibility Agent calcula:
   - Painel 550W (qty: 18-20 unidades)
   - Inversor 10kW trifásico (qty: 1)
   - String box 2 entradas
   - Estrutura metálica
   - Cabos, conectores
4. Pricing Agent:
   - Busca preços no catálogo
   - Aplica desconto B2B (company tier)
   - Calcula frete (CEP destino)
5. RAG response:

   ```json
   {
     "quote_id": "quote_abc123",
     "system_power_kwp": 10.08,
     "estimated_generation_kwh_month": 1260,
     "roi_years": 4.2,
     "items": [
       {"product_id": "prod_panel_550w", "qty": 18, "unit_price": 650, "subtotal": 11700},
       {"product_id": "prod_inv_10kw", "qty": 1, "unit_price": 8500, "subtotal": 8500},
       // ...
     ],
     "total_brl": 32450,
     "savings_20_years_brl": 245000
   }
   ```

---

## 🔄 Streaming ETL com Pathway

### Pipeline Proposto: Real-time Document Ingestion

```python
# pathway/pipelines/rag_streaming_advanced.py

import pathway as pw
from pathway.stdlib.ml.embeddings import OpenAIEmbedder
from pathway.xpacks.connectors.s3 import S3Input

def advanced_rag_pipeline():
    """
    Pipeline Pathway para ingestão real-time de documentos técnicos
    
    Fluxo:
    1. Monitorar S3 bucket (uploads de datasheets, manuais)
    2. Parse PDF/DOCX (PyMuPDF, python-docx)
    3. Chunking inteligente (RecursiveCharacterTextSplitter)
    4. Embedding OpenAI/Nomic (fallback)
    5. Upsert Qdrant + PostgreSQL (metadados)
    6. Notificação webhook (admin dashboard)
    """
    
    # 1. Input stream (S3)
    docs = pw.io.s3.read(
        aws_s3_settings=S3Input(
            bucket_name="ysh-technical-docs",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
            aws_secret_access_key=os.getenv("AWS_SECRET_KEY"),
            region="us-east-1"
        ),
        format="binary",
        mode="streaming"  # Real-time watch
    )
    
    # 2. Parse (PDF → text chunks)
    chunks = docs.select(
        content=pw.apply(parse_pdf, pw.this.data),
        metadata=pw.apply(extract_metadata, pw.this.data)
    )
    
    # 3. Chunking (500 tokens, 50 overlap)
    text_chunks = chunks.flatten(
        pw.apply_with_type(
            lambda x: chunk_text(x.content, chunk_size=500, overlap=50),
            pw.Type.list[pw.Type.str]
        )
    )
    
    # 4. Embeddings (OpenAI com fallback)
    embedder = OpenAIEmbedder(
        model="text-embedding-3-large",
        api_key=os.getenv("OPENAI_API_KEY")
    )
    
    embedded = text_chunks.select(
        *pw.this,
        embedding=embedder(pw.this.content)
    )
    
    # 5. Upsert Qdrant
    pw.io.qdrant.write(
        embedded,
        qdrant_settings=QdrantOutput(
            host="localhost",
            port=6333,
            collection_name="ysh-technical",
            vector_dimension=3072,
            api_key=os.getenv("QDRANT_API_KEY")
        )
    )
    
    # 6. Log + webhook notification
    embedded.select(
        pw.this.metadata,
        pw.apply(lambda x: send_webhook(x), pw.this.metadata)
    )
    
    pw.run()
```

**Benefício**: Admins fazem upload de PDF → disponível no RAG em 2-5 minutos

---

## ⚡ Otimizações de Performance

### 1. **Redis Cache para Embeddings**

**Problema Atual**: Re-gerar embeddings do mesmo texto (caro)

**Solução**:

```python
# backend/src/modules/rag/utils/embedding-cache.ts

import Redis from 'ioredis'
import crypto from 'crypto'

class EmbeddingCache {
  redis: Redis
  
  async get(text: string, model: string): Promise<number[] | null> {
    const key = this.getCacheKey(text, model)
    const cached = await this.redis.get(key)
    return cached ? JSON.parse(cached) : null
  }
  
  async set(text: string, model: string, embedding: number[], ttl = 2592000) {
    // TTL 30 dias
    const key = this.getCacheKey(text, model)
    await this.redis.setex(key, ttl, JSON.stringify(embedding))
  }
  
  private getCacheKey(text: string, model: string): string {
    const hash = crypto.createHash('sha256').update(text).digest('hex')
    return `embedding:${model}:${hash}`
  }
}
```

**Impacto**: Reduz custo OpenAI em 70-80% (cache hit rate ~75%)

---

### 2. **Batch Processing Inteligente**

**Problema Atual**: Processar imagens sequencialmente (lento)

**Solução**:

```python
# scripts/agentflow_batch_processor.py

import asyncio
from concurrent.futures import ThreadPoolExecutor

class BatchProcessor:
    def __init__(self, max_workers=4):
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
    
    async def process_batch_parallel(self, products: List[Dict], batch_size=10):
        """
        Processa produtos em batches paralelos com rate limiting
        """
        for i in range(0, len(products), batch_size):
            batch = products[i:i+batch_size]
            
            # Processar batch em paralelo (4 threads)
            tasks = [
                asyncio.get_event_loop().run_in_executor(
                    self.executor,
                    self.orchestrator.process_product,
                    product['sku'],
                    product['image_path'],
                    product['category']
                )
                for product in batch
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Rate limiting (respeitar API limits)
            await asyncio.sleep(2)  # 2s entre batches
        
        return results
```

**Impacto**: 4x faster (4 GPUs/threads paralelas)

---

### 3. **Modelo Fine-Tuning para Produtos Solares**

**Dataset de Treinamento**:

- 500 imagens anotadas (inversores, painéis, baterias)
- Ground truth extraído manualmente
- Formato LoRA (Low-Rank Adaptation)

**Processo**:

```bash
# Fine-tune Llama 3.2 Vision com LoRA
ollama create ysh-vision:v1 -f Modelfile.ysh

# Modelfile.ysh
FROM llama3.2-vision:11b
ADAPTER ./lora-weights/ysh-solar-adapter.bin
PARAMETER temperature 0.1
PARAMETER num_predict 1200
SYSTEM """Você é um especialista em produtos fotovoltaicos.
Extraia especificações técnicas de imagens com precisão de 95%+."""
```

**Impacto Esperado**:

- +15-20% accuracy
- -30% tempo de inferência (menos retries)
- Reduz necessidade de fallback para GPT-4o Vision

---

## 📈 Métricas de Sucesso (KPIs)

### Performance

| Métrica | Baseline Atual | Meta 6 Meses |
|---------|----------------|--------------|
| **Tempo médio análise de imagem** | 106s | 45s |
| **Taxa de sucesso (sem erros)** | 80% | 95% |
| **Cobertura de catálogo enriquecido** | 5% (3/489 inversores) | 90% |
| **Cache hit rate (embeddings)** | 0% | 75% |
| **RAG response latency** | ~3s | <1.5s |
| **Throughput (produtos/hora)** | 60 | 240 |

### Qualidade

| Métrica | Baseline | Meta |
|---------|----------|------|
| **Completude de dados (avg %)** | 60% | 90% |
| **Confidence score (avg)** | 7.5/10 | 9/10 |
| **Produtos prontos para catálogo** | 20% | 85% |
| **Precisão de compatibilidade (painel↔inv)** | N/A | 92% |

### Negócio

| Métrica | Baseline | Meta 12 Meses |
|---------|----------|---------------|
| **Conversão de cotações (quote → order)** | 15% | 28% |
| **Tempo médio de cotação** | 45 min | 8 min |
| **Satisfação de clientes com Hélio** | N/A | 4.5/5 |
| **Redução de custo operacional (enriquecimento)** | N/A | 70% |

---

## 🛠️ Plano de Implementação (6 Meses)

### Fase 1: Fundação (Mês 1-2)

#### Sprint 1-2: Core Infrastructure

- [ ] Implementar Redis cache para embeddings
- [ ] Adicionar 4 novas collections Qdrant (Nomic 768d)
- [ ] Configurar Pathway streaming pipeline (básico)
- [ ] Setup OpenTelemetry + Grafana dashboards

#### Sprint 3-4: AgentFlow v2.0

- [ ] Implementar Vision Squad (3 agentes)
- [ ] Adicionar Translation + SEO agents
- [ ] Batch processor paralelo (4 threads)
- [ ] Fine-tune Llama 3.2 Vision (LoRA)

**Entregável**: AgentFlow v2.0 processando 240 produtos/hora com 90%+ qualidade

---

### Fase 2: RAG Enhancement (Mês 3-4)

#### Sprint 5-6: Hélio v2.0

- [ ] Multi-turn conversations (context memory)
- [ ] Hybrid search (dense + sparse BM25)
- [ ] Smart quoting system (dimensionamento automático)
- [ ] Compatibility Agent (cross-reference técnico)

#### Sprint 7-8: Knowledge Expansion

- [ ] Ingest PVLib database (19K produtos) → Qdrant
- [ ] Web scraper agent (datasheets fabricantes)
- [ ] PDF parser para manuais técnicos
- [ ] User behavior analytics (clickstream → recommendations)

**Entregável**: Hélio respondendo 95% de dúvidas técnicas sem escalação humana

---

### Fase 3: Business Intelligence (Mês 5-6)

#### Sprint 9-10: Pricing & Recommendations

- [ ] Pricing Agent (XGBoost + dynamic pricing)
- [ ] Recommendation Agent (collaborative filtering)
- [ ] A/B testing framework para recomendações
- [ ] Dashboard de analytics para admins

#### Sprint 11-12: Compliance & Scale

- [ ] Compliance Validator (ANEEL, INMETRO)
- [ ] Qdrant sharding (scale horizontal)
- [ ] Load testing (1000 req/min)
- [ ] Documentation completa + onboarding

**Entregável**: Plataforma pronta para produção com 500K+ produtos

---

## 💰 Estimativa de Custos

### Infraestrutura (Mensal)

| Recurso | Especificação | Custo USD |
|---------|---------------|-----------|
| **Ollama Server** | 4x GPU A100 (Lambda Labs) | $800 |
| **Qdrant** | 32GB RAM, 500GB SSD | $120 |
| **Redis** | 8GB (AWS ElastiCache) | $60 |
| **PostgreSQL** | 32GB RAM, 500GB (AWS RDS) | $180 |
| **S3 Storage** | 500GB (docs + images) | $12 |
| **OpenAI API** | ~2M tokens/mês (embeddings) | $260 |
| **Monitoring** | Grafana Cloud (Pro) | $50 |
| **Total** | | **$1,482/mês** |

### Desenvolvimento (One-time)

| Item | Horas | Custo USD |
|------|-------|-----------|
| **AgentFlow v2.0 (12 agentes)** | 160h | $12,000 |
| **RAG Enhancement** | 120h | $9,000 |
| **Pathway Pipelines** | 80h | $6,000 |
| **Fine-tuning Llama 3.2** | 40h + $500 GPU | $3,500 |
| **Testing + QA** | 80h | $6,000 |
| **Documentation** | 40h | $3,000 |
| **Total** | 520h | **$39,500** |

### ROI Projetado

**Redução de Custos Operacionais**:

- Enriquecimento manual: ~30 min/produto × R$ 50/hora = R$ 25/produto
- 500 produtos/mês × R$ 25 = **R$ 12.500/mês economia**
- **12 meses**: R$ 150.000 economia vs. R$ 59.400 investimento
- **Payback**: 4.8 meses

**Aumento de Receita** (conversão melhor):

- +13% conversão cotação → pedido
- Ticket médio: R$ 50.000
- 50 cotações/mês → +6.5 pedidos/mês = **+R$ 325.000/mês**

---

## 🚀 Quick Start: Implementar Hoje

### Passo 1: Redis Cache (2 horas)

```bash
# 1. Adicionar Redis ao docker-compose
docker-compose -f docker/docker-compose.foss.yml up -d redis

# 2. Instalar dependência
cd backend
yarn add ioredis @types/ioredis

# 3. Criar módulo cache
# (código fornecido na seção Otimizações)
```

### Passo 2: Collection Nomic Local (4 horas)

```python
# scripts/create_local_collection.py
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

client = QdrantClient(url="http://localhost:6333", api_key="qdrant_dev_key_foss_2025")

# Criar collection Nomic (768d)
client.create_collection(
    collection_name="ysh-local-catalog",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE)
)

print("✅ Collection ysh-local-catalog criada!")
```

```bash
# Popular com Ollama embeddings (zero custo)
python scripts/populate_local_catalog.py
```

### Passo 3: Batch Processor (6 horas)

```python
# scripts/agentflow_batch_processor.py
# (código fornecido na seção Otimizações)

# Executar
python scripts/agentflow_batch_processor.py \
  --category INVERTERS \
  --batch-size 10 \
  --max-workers 4
```

**Resultado em 12 horas**:

- Cache Redis operacional
- Collection local (backup offline)
- Processamento 4x mais rápido

---

## 📚 Referências Técnicas

### Papers & Research

- **AgentFlow**: Multi-Agent Orchestration - [arxiv.org/abs/2510.05592](https://arxiv.org/abs/2510.05592)
- **Hybrid Search**: Dense + Sparse retrieval - Pinecone Research 2024
- **LoRA Fine-tuning**: [arxiv.org/abs/2106.09685](https://arxiv.org/abs/2106.09685)

### Frameworks

- **Pathway**: [pathway.com](https://pathway.com) - Streaming ETL
- **Dagster**: [dagster.io](https://dagster.io) - Orchestration
- **Qdrant**: [qdrant.tech](https://qdrant.tech) - Vector DB
- **PVLib**: [pvlib-python.readthedocs.io](https://pvlib-python.readthedocs.io)

### Modelos

- **Llama 3.2 Vision**: [ollama.com/library/llama3.2-vision](https://ollama.com/library/llama3.2-vision)
- **Qwen 2.5**: [ollama.com/library/qwen2.5](https://ollama.com/library/qwen2.5)
- **Nomic Embed**: [ollama.com/library/nomic-embed-text](https://ollama.com/library/nomic-embed-text)

---

## ✅ Conclusão

Esta proposta apresenta uma **evolução completa** da plataforma YSH de um e-commerce B2B tradicional para uma **plataforma inteligente** com capacidades de:

1. ✅ **Automação de Catálogo**: 90% dos produtos enriquecidos automaticamente
2. ✅ **Assistente Técnico IA**: Hélio respondendo 95% das dúvidas sem humano
3. ✅ **Cotação Instantânea**: Sistema dimensionado em 8 minutos vs. 45 minutos
4. ✅ **Recomendação Inteligente**: Cross-sell técnico baseado em compatibilidade real
5. ✅ **ROI Positivo**: Payback em 4.8 meses

**Próximos Passos**:

1. Aprovar roadmap de 6 meses
2. Provisionar infraestrutura (GPU server + Qdrant cluster)
3. Iniciar Fase 1 (fundação) - 2 meses
4. Review semanal de métricas (KPIs)

**Contato**:

- Arquiteto: Hélio (AI Copilot)
- Repositório: `ysh-b2b/main`
- Documentação: `/docs/PROPOSTA_AVANCADA_AI_PLATFORM_2025.md`

---

**Versão**: 2.0  
**Data**: 13 de outubro de 2025  
**Status**: 📋 Aguardando Aprovação
