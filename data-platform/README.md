# YSH Data Platform — Pathway + Dagster

> **Stack de dados real-time** para o ecossistema Yello Solar Hub (B2B e-commerce).

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         Fontes de Dados                         │
│  Medusa • ANEEL APIs • NASA/PVGIS • Inmetro • S3/MinIO         │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────┐
│                    Pathway Streaming Engine                    │
│  • Kafka/Postgres CDC • S3 • HTTP                             │
│  • Transformations (Python) • RAG Pipeline                    │
│  • Sinks: Postgres, Pinecone, S3                              │
└───────────────┬───────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────┐
│                  Dagster (Orchestration)                       │
│  • Assets: catalog, tarifas, propostas, embeddings            │
│  • Jobs: ETL batch + streaming monitors                       │
│  • Schedules: cron daily/hourly                               │
│  • UI: http://localhost:3001                                  │
└───────────────┬───────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────┐
│                   Apps & Consumers                             │
│  Medusa Backend • Storefront • Hélio Agent (LLM+RAG)          │
└───────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Pré-requisitos

- **Docker** e **Docker Compose** instalados
- **Python 3.11+** (para dev local)
- **Variáveis de ambiente** configuradas (ver `.env.example`)

### 2. Configurar variáveis de ambiente

Crie `.env` na raiz de `data-platform/`:

```bash
# AWS/S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
S3_BUCKET=ysh-data-lake

# Pinecone
PINECONE_API_KEY=pk_***
PINECONE_INDEX=ysh-rag

# OpenAI
OPENAI_API_KEY=sk-***
```

### 3. Subir serviços

```powershell
# Terminal 1: Backend Medusa + Postgres + Redis (se não estiver rodando)
cd c:\Users\fjuni\ysh_medusa\ysh-store
docker-compose up -d postgres redis

# Terminal 2: Dagster + Pathway
cd c:\Users\fjuni\ysh_medusa\ysh-store\data-platform
docker-compose -f docker-compose.dagster.yml up -d
docker-compose -f docker-compose.pathway.yml up -d
```

### 4. Acessar UIs

- **Dagster UI:** <http://localhost:3001>
- **MinIO Console:** <http://localhost:9002> (user: `minioadmin`, password: `minioadmin`)

---

## 📦 Estrutura de Código

```
data-platform/
├── dagster/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── definitions.py          # Entry point Dagster
│   ├── assets/
│   │   ├── __init__.py
│   │   ├── catalog.py          # @asset catalog_normalized, catalog_embeddings
│   │   └── tarifas.py          # @asset tarifas_aneel
│   └── resources/
│       ├── postgres.py         # PostgresResource
│       └── pinecone.py         # PineconeResource
├── pathway/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── pipelines/
│       ├── __init__.py
│       ├── catalog_etl.py      # ETL catálogo (batch/streaming)
│       └── rag_streaming.py    # RAG real-time
├── docker-compose.dagster.yml
├── docker-compose.pathway.yml
└── README.md                   # Este arquivo
```

---

## 🔧 Desenvolvimento Local

### Instalar dependências Python

```powershell
# Dagster
cd dagster
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Pathway
cd ..\pathway
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Rodar Dagster localmente (sem Docker)

```powershell
cd dagster
$env:DAGSTER_HOME = (Get-Location).Path
dagster dev -m definitions
# Abrir http://localhost:3000
```

### Materializar um asset

```powershell
dagster asset materialize -m definitions -a catalog_normalized
```

### Rodar pipeline Pathway localmente

```powershell
cd pathway
python -m pipelines.catalog_etl
```

---

## 📊 Assets Implementados

| Asset | Descrição | Fontes | Sinks | Schedule |
|-------|-----------|--------|-------|----------|
| `catalog_normalized` | Catálogo FV normalizado | S3, Inmetro | Postgres | Daily 2h |
| `catalog_embeddings` | Embeddings do catálogo | Postgres | Pinecone | Daily 2h |
| `tarifas_aneel` | Tarifas ANEEL | APIs ANEEL | Postgres | Daily 6h |

---

## 🧪 Testes

```powershell
# Unit tests (quando implementados)
pytest tests/

# Validar Dagster definitions
dagster definitions validate -m definitions
```

---

## 📚 Documentação

- **Blueprint completo:** [../docs/PATHWAY_DAGSTER_PREFECT_BLUEPRINT.md](../docs/PATHWAY_DAGSTER_PREFECT_BLUEPRINT.md)
- **Dagster Docs:** <https://docs.dagster.io>
- **Pathway Docs:** <https://pathway.com/developers>

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to Postgres"

- Verificar se `postgres` service está rodando: `docker ps`
- Verificar env vars: `POSTGRES_HOST`, `POSTGRES_PORT`, etc.

### Erro: "Pinecone index not found"

- Criar índice no [Pinecone Console](https://app.pinecone.io)
- Dimensão: 3072 (para `text-embedding-3-large`)
- Metric: cosine

### Dagster UI não carrega

- Verificar logs: `docker logs ysh-dagster-webserver`
- Verificar porta: `netstat -ano | findstr :3001`

---

## 🚢 Deploy (Produção)

Ver seção "Deploy (Roadmap)" no blueprint principal.

**Opções:**

1. **AWS ECS Fargate** (recomendado para início)
2. **Kubernetes (EKS/GKE)** (para escala)
3. **Dagster+** (managed service)

---

## 🤝 Contribuindo

1. Criar branch: `git checkout -b feature/novo-asset`
2. Implementar asset/pipeline
3. Testar localmente
4. Abrir PR

---

## 📞 Contato

- **Comandante A**
- **Hélio Copiloto Solar**

---

**Status:** 🚧 **Em desenvolvimento** (v0.1.0 — estrutura inicial)

**Próximos passos:**

- [ ] Implementar pipeline Pathway real (catalog_etl)
- [ ] Integrar OpenAI embeddings
- [ ] Configurar Pinecone upserts
- [ ] Adicionar sensors (S3 file arrivals)
- [ ] Criar asset de propostas (join quotes + tarifas)
- [ ] Deploy em AWS ECS (Fargate)
