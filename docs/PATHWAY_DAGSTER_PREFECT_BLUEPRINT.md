# 🚀 Blueprint Pathway + Dagster/Prefect — Arquitetura YSH Real-Time Data & AI

> **Autor:** Comandante A + Hélio Copiloto Solar  
> **Data:** 2025-01-07  
> **Versão:** 1.0  
> **Stack:** Medusa.js B2B + Pathway (streaming) + Dagster (assets) + Postgres + Redis + S3

---

## 🎯 Executive Summary

Este blueprint define a arquitetura de **pipelines real-time** e **orquestração de dados/IA** para o ecossistema YSH (Yello Solar Hub), integrando:

1. **Pathway** — ETL streaming e RAG real-time (atualização contínua de embeddings)
2. **Dagster** — orquestração declarativa centrada em *data assets* (catálogo, lineage, SLOs)
3. **Prefect** — workflows imperativos e automations (fallback para tarefas ad-hoc)

**Decisão arquitetural:** **Dagster como orquestrador primário** + **Pathway como engine de streaming** + **Prefect para tarefas operacionais pontuais** (ex.: backfills, scripts de migração).

---

## 📐 Decisão: Dagster vs Prefect (contexto YSH)

### Por que **Dagster** é o orquestrador principal?

| Critério | Dagster | Prefect | Vencedor |
|----------|---------|---------|----------|
| **Modelo mental** | Assets como primeira classe (catálogo FV, propostas, embeddings) | Flows como funções | ✅ Dagster |
| **Lineage & Governança** | Lineage nativo; metadata por asset; owners/SLAs | Metadata via tasks/annotations | ✅ Dagster |
| **Observabilidade de Dados** | Catálogo visual de assets; health checks; validações Dagster+ | UI de execução de flows | ✅ Dagster |
| **Integração Pathway** | Declarar `@asset` wrapping Pathway pipelines | Task calls; mais imperativo | ✅ Dagster |
| **Time-to-value para eng. dados** | Steeper curve; requer pensar em "assets" | Mais simples; "eleva funções a flows" | ⚖️ Empate (depende da maturidade do time) |
| **Escala e Deploy** | Dagster+ (serverless/hybrid); k8s nativo | Prefect Cloud + workers; mais flexível | ⚖️ Empate |

**Conclusão:** Para um **ecossistema de dados solar B2B** com múltiplos ativos (catálogos, propostas, tarifas, embeddings RAG, métricas de geração), **Dagster** oferece:

- **Catálogo operacional** de todos os data assets (visualizar dependências entre "Catálogo Normalizado" → "Embeddings PVGIS" → "Propostas B1").
- **Lineage automático** (rastrear de onde veio cada tarifa ANEEL).
- **SLOs por asset** (garantir que "Tarifas Atualizadas" rode antes das 8h todo dia útil).

**Prefect** fica como **orquestrador tático** para:

- Scripts one-off (ex.: migração de dados legados).
- Tarefas operacionais que não fazem parte do grafo de assets (ex.: notificações Slack, backups ad-hoc).

---

## 🏗️ Arquitetura de Referência

```mermaid
graph TB
    subgraph Fontes[Fontes de Dados]
        A1[Medusa Backend<br/>Orders, Quotes, Companies]
        A2[ANEEL APIs<br/>Tarifas, MMGD]
        A3[NASA POWER / PVGIS<br/>Irradiância]
        A4[Inmetro / Catálogo<br/>PDFs, Feeds]
        A5[S3 / MinIO<br/>CSVs, JSONs]
    end

    subgraph Pathway[Pathway Streaming Engine]
        B1[Input Connectors<br/>Kafka, Postgres CDC, S3, HTTP]
        B2[Transformations<br/>Window funcs, Joins, ML]
        B3[RAG Pipeline<br/>Embeddings + Vector Store]
        B4[Output Sinks<br/>Postgres, S3, Pinecone, Kafka]
    end

    subgraph Dagster[Dagster Assets & Jobs]
        C1[@asset catalog_normalized<br/>ETL catálogo Inmetro]
        C2[@asset tarifas_aneel<br/>Ingest diário ANEEL]
        C3[@asset embeddings_pvgis<br/>Gerar vetores docs]
        C4[@asset propostas_b1_b3<br/>Agregar orders + quotes]
        C5[Asset Jobs<br/>Schedules, Sensors]
        C6[Dagster UI<br/>Lineage + Metadata]
    end

    subgraph Prefect[Prefect Flows (Tático)]
        D1[Flow: Migração Legado]
        D2[Flow: Backup S3]
        D3[Flow: Alertas Slack]
    end

    subgraph Stores[Armazenamento]
        E1[(Postgres<br/>Analytics DB)]
        E2[(Pinecone<br/>Vector Store)]
        E3[(S3 / MinIO<br/>Data Lake)]
        E4[(Redis<br/>Cache)]
    end

    subgraph Apps[Aplicações]
        F1[Medusa Backend<br/>API GraphQL]
        F2[Storefront Next.js<br/>UI RAG]
        F3[Hélio Agent<br/>LLM + RAG]
    end

    A1 --> B1
    A2 --> B1
    A3 --> B1
    A4 --> B1
    A5 --> B1

    B1 --> B2
    B2 --> B3
    B2 --> B4

    B4 --> E1
    B4 --> E2
    B4 --> E3

    E1 --> C1
    E1 --> C2
    E3 --> C3
    E1 --> C4

    C1 --> C5
    C2 --> C5
    C3 --> C5
    C4 --> C5

    C5 --> C6

    D1 --> E3
    D2 --> E3
    D3 -.-> F1

    E1 --> F1
    E2 --> F3
    E3 --> F1
    E4 --> F1

    F1 --> F2
    F3 --> F2

    style B3 fill:#ff9800
    style C3 fill:#4caf50
    style F3 fill:#2196f3
```

---

## 🔄 Jobs To Be Done (JTBDs) Mapeados

### 1. **Catálogo FV Normalizado (batch + streaming)**

**Job:** Ingerir feeds de distribuidores (CSVs/PDFs), normalizar SKUs (Inmetro), indexar no Elasticsearch e gerar embeddings para RAG.

**Pathway:**

- Conectar a S3 (arquivos CSV/JSON) via `pw.io.s3.read()`.
- Normalizar via transformações Python (regex, validações Pydantic).
- Publicar em Postgres (`items_normalized`) e Pinecone (embeddings).

**Dagster:**

- `@asset catalog_inmetro_raw` — baixar PDFs Inmetro.
- `@asset catalog_normalized` — rodar Pathway pipeline e materializar tabela Postgres.
- `@asset catalog_embeddings` — gerar vetores via OpenAI/Cohere e salvar Pinecone.
- **Lineage:** `catalog_inmetro_raw` → `catalog_normalized` → `catalog_embeddings` → `helio_rag_index`.

**Trigger:** Schedule diário às 2h (hora de menor carga) + sensor de novos arquivos em S3.

---

### 2. **Tarifas ANEEL (batch + CDC)**

**Job:** Atualizar tarifas e bandeiras via scraping ANEEL, validar limites MMGD, publicar em Postgres.

**Pathway:**

- CDC do Postgres (`tarifas_raw`) via `pw.io.postgres.read()` (modo change-data-capture).
- Aplicar transformações (parse XML/JSON, classificação classe/subgrupo).
- Sink em `tarifas_normalized`.

**Dagster:**

- `@asset tarifas_aneel_scrape` — scraper Python (BeautifulSoup/Playwright).
- `@asset tarifas_normalized` — wrapper do Pathway pipeline.
- `@asset tarifas_bandeiras` — agregar bandeiras por distribuidora.
- **SLO:** Rodar antes das 8h em dias úteis; alertar se > 1% de erro.

**Trigger:** Schedule diário 6h + webhook ANEEL (quando disponível).

---

### 3. **RAG Real-Time (Realtime RAG)**

**Job:** Atualizar embeddings de documentação técnica (PRODIST, manuais, datasheets) conforme novos documentos chegam, sem reprocessar tudo.

**Pathway:**

- Conectar a Google Drive/SharePoint via `pw.io.fs.read()` (PyFilesystem).
- Detectar mudanças (novos arquivos, updates).
- Gerar embeddings incrementais (OpenAI `text-embedding-3-large`).
- Atualizar Pinecone via upserts atômicos.

**Dagster:**

- `@asset rag_docs_raw` — ingest de docs (GDrive, S3).
- `@asset rag_embeddings` — Pathway pipeline streaming.
- `@asset helio_rag_index` — índice consolidado Pinecone.
- **Metadata:** timestamp de última atualização, número de chunks, modelo de embedding.

**Trigger:** Continuous (Pathway sempre rodando) + job Dagster de "health check" a cada hora.

---

### 4. **Propostas B1/B3 Analytics (batch)**

**Job:** Agregar quotes, orders, companies (Medusa) com dados de geração (NASA POWER) e calcular métricas (TIR, payback, ROI).

**Pathway:**

- CDC Postgres (`quotes`, `orders`) via `pw.io.postgres.read()`.
- Join com `tarifas_normalized` e `pvgis_irradiance`.
- Calcular KPIs financeiros (TIR, VPL, payback) em Python puro.
- Sink em `propostas_analytics`.

**Dagster:**

- `@asset propostas_raw` — extract Medusa DB.
- `@asset propostas_enriched` — Pathway join + cálculos.
- `@asset kpis_b1_b3` — dashboards Metabase.
- **Lineage:** `quotes` → `tarifas_normalized` → `propostas_enriched` → `kpis_b1_b3`.

**Trigger:** Schedule 3x/dia (8h, 14h, 20h).

---

### 5. **O&M Monitoring (streaming)**

**Job:** Ingerir dados de inversores (MQTT/Modbus) via Kafka, detectar anomalias em tempo real, alertar Slack.

**Pathway:**

- Conectar Kafka topic `inverters_telemetry` via `pw.io.kafka.read()`.
- Windowing (5 min tumbling) para calcular médias, desvios.
- Detectar anomalias (ML ou regras heurísticas).
- Sink alertas em Slack (via HTTP) e logs no InfluxDB.

**Dagster:**

- `@asset om_inverters_stream` — Pathway sempre rodando (background job).
- `@asset om_alerts_daily` — sumarizar alertas do dia.
- **Observability:** count de alertas, MTTR médio.

**Trigger:** Continuous (Pathway) + job Dagster diário para resumo.

---

## 🛠️ Stack Técnico Detalhado

### Pathway

```python
# requirements.txt
pathway==0.15.0
pathway-airbyte==0.1.0
openai==1.50.0
pinecone-client==3.0.0
```

### Dagster

```python
# requirements.txt
dagster==1.8.0
dagster-webserver==1.8.0
dagster-postgres==0.24.0
dagster-aws==0.24.0  # S3 I/O manager
dagster-docker==0.24.0
```

### Prefect (opcional)

```python
# requirements.txt
prefect==3.1.0
prefect-aws==0.5.0
```

---

## 📦 Estrutura de Diretórios

```
ysh-store/
├── backend/                     # Medusa Backend
├── storefront/                  # Next.js
├── data-platform/               # 🆕 Nova pasta
│   ├── dagster/
│   │   ├── definitions.py       # Código Dagster (assets, jobs)
│   │   ├── assets/
│   │   │   ├── catalog.py       # @asset catalog_normalized
│   │   │   ├── tarifas.py       # @asset tarifas_aneel
│   │   │   ├── rag.py           # @asset rag_embeddings
│   │   │   └── propostas.py     # @asset propostas_analytics
│   │   ├── resources/
│   │   │   ├── postgres.py      # ConfigurableResource Postgres
│   │   │   ├── s3.py            # S3Resource
│   │   │   └── pinecone.py      # PineconeResource
│   │   ├── sensors/             # File sensors, API sensors
│   │   └── schedules/           # Cron schedules
│   ├── pathway/
│   │   ├── pipelines/
│   │   │   ├── catalog_etl.py   # Pathway pipeline catálogo
│   │   │   ├── tarifas_cdc.py   # Pathway pipeline tarifas
│   │   │   ├── rag_streaming.py # RAG real-time
│   │   │   └── om_monitoring.py # O&M streaming
│   │   ├── connectors/
│   │   │   ├── medusa_cdc.py    # Postgres CDC wrapper
│   │   │   └── kafka_config.py  # Kafka settings
│   │   └── utils/
│   │       ├── embeddings.py    # Wrapper OpenAI/Cohere
│   │       └── validators.py    # Pydantic schemas
│   ├── prefect/                 # 🔧 Flows táticos
│   │   ├── flows/
│   │   │   ├── migrate_legacy.py
│   │   │   └── backup_s3.py
│   │   └── deployments.yaml
│   ├── dbt/                     # 🔧 Transformações SQL (opcional)
│   │   ├── models/
│   │   │   ├── staging/
│   │   │   └── marts/
│   │   └── dbt_project.yml
│   ├── docker-compose.pathway.yml
│   ├── docker-compose.dagster.yml
│   └── README.md
├── docs/
│   └── PATHWAY_DAGSTER_PREFECT_BLUEPRINT.md  # 📄 Este arquivo
└── docker-compose.yml           # Compose principal (Medusa)
```

---

## 🐳 Docker Compose Estendido

Ver arquivos:

- `ysh-store/data-platform/docker-compose.dagster.yml`
- `ysh-store/data-platform/docker-compose.pathway.yml`

---

## 📝 Código Starter — Dagster Assets

### `data-platform/dagster/assets/catalog.py`

```python
from dagster import asset, AssetExecutionContext, Output, MetadataValue
from dagster_aws.s3 import S3Resource
from ..resources.postgres import PostgresResource
from ..resources.pinecone import PineconeResource
from pathway.pipelines.catalog_etl import run_catalog_pipeline
import pandas as pd

@asset(
    group_name="catalog",
    description="Catálogo FV normalizado (Inmetro + Distribuidores)",
    compute_kind="Pathway + Python",
)
def catalog_normalized(
    context: AssetExecutionContext,
    s3: S3Resource,
    postgres: PostgresResource,
) -> Output[pd.DataFrame]:
    """
    Executa pipeline Pathway para normalizar catálogo de módulos/inversores.
    
    Fontes:
    - S3: ysh-catalog/raw/*.csv
    - Inmetro: scrape + PDFs
    
    Sinks:
    - Postgres: public.items_normalized
    """
    context.log.info("🚀 Iniciando pipeline Pathway — catalog_etl")
    
    # Rodar Pathway pipeline (modo batch aqui; streaming em background)
    stats = run_catalog_pipeline(
        s3_bucket="ysh-catalog",
        s3_prefix="raw/",
        pg_table="items_normalized",
    )
    
    # Buscar resultado para metadata
    df = postgres.execute_query("SELECT * FROM items_normalized LIMIT 10")
    
    return Output(
        df,
        metadata={
            "num_items": stats["total_items"],
            "num_errors": stats["errors"],
            "preview": MetadataValue.md(df.head().to_markdown()),
        },
    )

@asset(
    group_name="catalog",
    deps=[catalog_normalized],
    description="Embeddings do catálogo para RAG",
    compute_kind="OpenAI + Pinecone",
)
def catalog_embeddings(
    context: AssetExecutionContext,
    postgres: PostgresResource,
    pinecone: PineconeResource,
) -> Output[dict]:
    """
    Gera embeddings dos itens do catálogo e insere no Pinecone.
    """
    from pathway.utils.embeddings import generate_embeddings
    
    context.log.info("🔍 Gerando embeddings para catálogo...")
    
    # Buscar itens
    items = postgres.execute_query("""
        SELECT id, sku, description, specs FROM items_normalized
        WHERE embedding_updated_at IS NULL OR embedding_updated_at < NOW() - INTERVAL '7 days'
    """)
    
    # Gerar embeddings
    embeddings = generate_embeddings(
        texts=items["description"].tolist(),
        model="text-embedding-3-large",
    )
    
    # Upsert no Pinecone
    pinecone.upsert(
        namespace="catalog",
        vectors=[
            {"id": row["id"], "values": emb, "metadata": {"sku": row["sku"]}}
            for row, emb in zip(items.to_dict("records"), embeddings)
        ],
    )
    
    return Output(
        {"num_embeddings": len(embeddings)},
        metadata={"model": "text-embedding-3-large", "dim": 3072},
    )
```

---

### `data-platform/dagster/assets/tarifas.py`

```python
from dagster import asset, AssetExecutionContext, Output
from ..resources.postgres import PostgresResource
from pathway.pipelines.tarifas_cdc import run_tarifas_pipeline

@asset(
    group_name="tarifas",
    description="Tarifas ANEEL normalizadas",
    compute_kind="Pathway CDC",
)
def tarifas_aneel(
    context: AssetExecutionContext,
    postgres: PostgresResource,
) -> Output[dict]:
    """
    Pipeline Pathway CDC que escuta mudanças em tarifas_raw (scraper escreve lá)
    e normaliza para tarifas_normalized.
    """
    context.log.info("⚡ Iniciando Pathway CDC para tarifas ANEEL")
    
    stats = run_tarifas_pipeline(
        source_table="tarifas_raw",
        target_table="tarifas_normalized",
    )
    
    return Output(
        stats,
        metadata={
            "num_distribuidoras": stats["distribuidoras"],
            "num_classes": stats["classes"],
        },
    )
```

---

### `data-platform/dagster/definitions.py`

```python
from dagster import Definitions, ScheduleDefinition, define_asset_job
from .assets.catalog import catalog_normalized, catalog_embeddings
from .assets.tarifas import tarifas_aneel
from .resources.postgres import PostgresResource
from .resources.s3 import S3Resource
from .resources.pinecone import PineconeResource

# Jobs
catalog_job = define_asset_job("catalog_job", selection=[catalog_normalized, catalog_embeddings])
tarifas_job = define_asset_job("tarifas_job", selection=[tarifas_aneel])

# Schedules
catalog_schedule = ScheduleDefinition(
    job=catalog_job,
    cron_schedule="0 2 * * *",  # 2h diariamente
)

tarifas_schedule = ScheduleDefinition(
    job=tarifas_job,
    cron_schedule="0 6 * * *",  # 6h diariamente
)

defs = Definitions(
    assets=[catalog_normalized, catalog_embeddings, tarifas_aneel],
    jobs=[catalog_job, tarifas_job],
    schedules=[catalog_schedule, tarifas_schedule],
    resources={
        "postgres": PostgresResource(
            host="postgres",
            database="medusa_db",
            user="medusa_user",
            password="medusa_password",
        ),
        "s3": S3Resource(
            bucket="ysh-data-lake",
            region="us-east-1",
        ),
        "pinecone": PineconeResource(
            api_key="pk_***",
            index_name="ysh-rag",
        ),
    },
)
```

---

## 📝 Código Starter — Pathway Pipelines

### `data-platform/pathway/pipelines/catalog_etl.py`

```python
import pathway as pw
from pathway.stdlib.ml.index import KNNIndex
import openai

def run_catalog_pipeline(s3_bucket: str, s3_prefix: str, pg_table: str) -> dict:
    """
    Pipeline Pathway para ETL do catálogo FV.
    
    Fluxo:
    1. Ler CSVs de S3
    2. Normalizar SKUs, validar specs
    3. Escrever em Postgres
    """
    # Input: S3
    input_table = pw.io.s3.read(
        bucket_name=s3_bucket,
        object_pattern=f"{s3_prefix}*.csv",
        format="csv",
        schema=pw.schema_from_csv("c:/Users/fjuni/ysh_medusa/ysh-erp/data/catalog/items_schema.csv"),
        mode="streaming",  # Detecta novos arquivos
    )
    
    # Transformações
    normalized = input_table.select(
        id=pw.this.id,
        sku=pw.this.sku.str.upper(),
        brand=pw.this.brand,
        model=pw.this.model,
        power_wp=pw.cast(float, pw.this.power_wp),
        technology=pw.this.technology,
        specs=pw.this.specs,
    )
    
    # Validações Pydantic (exemplo)
    def validate_item(row):
        from pathway.utils.validators import ItemSchema
        try:
            ItemSchema(**row)
            return {"valid": True, **row}
        except Exception as e:
            return {"valid": False, "error": str(e), **row}
    
    validated = normalized.select(pw.apply(validate_item, pw.this))
    
    # Filtrar válidos
    valid_items = validated.filter(pw.this.valid == True)
    
    # Output: Postgres
    pw.io.postgres.write(
        valid_items,
        host="postgres",
        port=5432,
        database="medusa_db",
        user="medusa_user",
        password="medusa_password",
        table_name=pg_table,
    )
    
    # Rodar pipeline (blocking para Dagster; ou retornar handle para streaming)
    pw.run()
    
    return {
        "total_items": len(valid_items),
        "errors": len(validated.filter(pw.this.valid == False)),
    }
```

---

### `data-platform/pathway/pipelines/rag_streaming.py`

```python
import pathway as pw
from pathway.xpacks.llm import embedders, splitters, vector_store

def run_rag_streaming_pipeline():
    """
    Pipeline Pathway para RAG real-time.
    
    Fluxo:
    1. Monitorar Google Drive/S3 (novos PDFs)
    2. Chunking + embeddings
    3. Upsert no Pinecone
    """
    # Input: Google Drive (via PyFilesystem)
    docs = pw.io.fs.read(
        path="gdrive://ysh-docs/",
        format="binary",
        mode="streaming",
    )
    
    # Chunking
    chunks = docs | splitters.RecursiveCharacterTextSplitter(
        chunk_size=512,
        chunk_overlap=50,
    )
    
    # Embeddings
    embeddings = chunks | embedders.OpenAIEmbedder(
        model="text-embedding-3-large",
        api_key="sk-***",
    )
    
    # Output: Pinecone
    vector_store.PineconeVectorStore(
        index_name="ysh-rag",
        namespace="docs",
    ).upsert_stream(embeddings)
    
    # Rodar em background (não bloqueia)
    pw.run(monitoring_level=pw.MonitoringLevel.ALL)
```

---

## 🧪 Testes e Validação

### 1. Testar Pathway localmente

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\data-platform\pathway
python -m pipelines.catalog_etl
```

### 2. Testar Dagster asset

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\data-platform\dagster
dagster asset materialize -m definitions -a catalog_normalized
```

### 3. UI Dagster

```powershell
dagster dev -m definitions
# Abrir http://localhost:3000
```

---

## 📊 Observabilidade

### Dagster

- **Asset Catalog:** visualizar lineage `catalog_normalized` → `catalog_embeddings`.
- **Metadata:** preview de dados, contadores, tempos de execução.
- **Alertas:** configurar no Dagster+ (ex.: falha de asset critical).

### Pathway

- **Monitoring level:** `pw.run(monitoring_level=pw.MonitoringLevel.ALL)`.
- **Logs:** stdout/stderr → CloudWatch/DataDog.
- **Métricas custom:** expor via Prometheus endpoint.

### Prefect

- **Flow runs:** UI Prefect Cloud.
- **Automations:** alertar se flow `backup_s3` falhar 2x seguidas.

---

## 🚢 Deploy (Roadmap)

### Fase 1: Local (Docker Compose)

✅ Rodar Dagster + Pathway + Postgres + Redis localmente.

### Fase 2: AWS (ECS Fargate)

- **Dagster:** Dagster+ Hybrid (agent no ECS).
- **Pathway:** Container ECS com auto-scaling (CPU-based).
- **Postgres:** RDS Aurora.
- **S3:** Data Lake.
- **Pinecone:** Cloud (já gerenciado).

### Fase 3: Kubernetes (GKE/EKS)

- **Dagster:** Helm chart Dagster OSS ou Dagster+.
- **Pathway:** Deployment k8s com HPA.
- **Kafka:** MSK ou Confluent Cloud.

---

## 🔐 Segurança

- **Secrets:** AWS Secrets Manager ou HashiCorp Vault.
- **IAM Roles:** ECS Task Roles para S3/RDS.
- **Network:** VPC com subnets privadas; NAT Gateway para saída.
- **Encryption:** S3 SSE-S3, RDS encryption at rest, TLS para Kafka.

---

## 💰 Estimativa de Custos (AWS us-east-1)

| Serviço | Config | Custo/mês |
|---------|--------|-----------|
| ECS Fargate (Dagster) | 0.5 vCPU, 1 GB | ~$15 |
| ECS Fargate (Pathway) | 1 vCPU, 2 GB | ~$30 |
| RDS Aurora Postgres | db.t4g.medium | ~$50 |
| S3 (Data Lake) | 100 GB + requests | ~$5 |
| Pinecone (Free tier) | 1 index, 1 pod | $0 |
| **Total** | | **~$100/mês** |

*Obs.: Dagster+ Serverless tem free tier generoso; considerar para reduzir custos.*

---

## 📚 Referências

1. [Pathway Docs](https://pathway.com/developers/user-guide/introduction/welcome)
2. [Dagster Concepts](https://docs.dagster.io/concepts)
3. [Prefect Concepts](https://docs.prefect.io/v3/concepts/)
4. [Medusa.js Workflows](https://docs.medusajs.com/resources/commerce-modules/workflow/introduction)
5. [ANEEL MMGD](https://www.gov.br/aneel/pt-br)

---

## 🤝 Contribuindo

- **Issues:** reportar via GitHub Issues.
- **PRs:** seguir guia de estilo Python (Black, isort, mypy).
- **Docs:** manter este blueprint atualizado a cada mudança arquitetural.

---

## 📞 Contato

- **Comandante A:** <fjuni@ysh.com.br>
- **Hélio Copiloto Solar:** <helio@ysh.ai>

---

**Próximo passo:** Implementar primeiro asset Dagster (`catalog_normalized`) e validar localmente. 🚀
