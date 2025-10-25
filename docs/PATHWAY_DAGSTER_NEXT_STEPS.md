# 🎯 Próximos Passos — Implementação Pathway + Dagster

> **Para:** Comandante A  
> **De:** Hélio Copiloto Solar  
> **Data:** 2025-01-07  
> **Objetivo:** Roadmap de execução prática para ativar pipelines real-time no YSH

---

## ✅ Entregáveis Criados (v0.1.0)

### 1. Documentação

- ✅ **Blueprint completo** ([docs/PATHWAY_DAGSTER_PREFECT_BLUEPRINT.md](../docs/PATHWAY_DAGSTER_PREFECT_BLUEPRINT.md))
- ✅ **README data-platform** ([data-platform/README.md](./README.md))

### 2. Infraestrutura (Docker Compose)

- ✅ **docker-compose.dagster.yml** — Dagster daemon + webserver + Postgres
- ✅ **docker-compose.pathway.yml** — Pathway engines + Kafka + MinIO

### 3. Código Base

- ✅ **Dagster:**
  - `definitions.py` — Assets, jobs, schedules
  - `assets/catalog.py` — `catalog_normalized`, `catalog_embeddings`
  - `assets/tarifas.py` — `tarifas_aneel`
  - `resources/postgres.py` — PostgresResource
  - `resources/pinecone.py` — PineconeResource
- ✅ **Pathway:**
  - `pipelines/catalog_etl.py` — ETL catálogo (mock)
  - `pipelines/rag_streaming.py` — RAG real-time (mock)

### 4. Configuração

- ✅ `.env.example` — Template de variáveis de ambiente

---

## 🚀 Fase 1: Validação Local (1-2 dias)

### Objetivo

Rodar stack completo no seu Windows e validar que Dagster UI está acessível e assets podem ser materializados.

### Passos

#### 1.1. Configurar variáveis de ambiente

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\data-platform
cp .env.example .env
# Editar .env com suas credenciais reais (AWS, Pinecone, OpenAI)
```

**Mínimo necessário:**

```bash
OPENAI_API_KEY=sk-***  # Para embeddings
PINECONE_API_KEY=pk_*** # Para vector store
AWS_ACCESS_KEY_ID=***   # Se usar S3 real
AWS_SECRET_ACCESS_KEY=***
```

#### 1.2. Criar índice Pinecone

1. Acesse <https://app.pinecone.io>
2. Crie novo índice:
   - **Name:** `ysh-rag`
   - **Dimension:** `3072` (para `text-embedding-3-large`)
   - **Metric:** `cosine`
   - **Cloud:** AWS `us-east-1`

#### 1.3. Subir Postgres Medusa (se não estiver rodando)

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store
docker-compose up -d postgres redis
```

**Validar:**

```powershell
docker ps | Select-String "ysh-b2b-postgres"
# Deve exibir container rodando
```

#### 1.4. Subir Dagster

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\data-platform
docker-compose -f docker-compose.dagster.yml up -d
```

**Validar:**

```powershell
docker logs ysh-dagster-webserver
# Aguardar linha: "Serving dagster-webserver on http://0.0.0.0:3000"
```

Acessar **<http://localhost:3001>** → Deve exibir Dagster UI com 3 assets:

- `catalog_normalized`
- `catalog_embeddings`
- `tarifas_aneel`

#### 1.5. Materializar primeiro asset (mock)

Na UI Dagster:

1. Ir em **Assets**
2. Clicar em `catalog_normalized`
3. Clicar **Materialize**
4. Aguardar execução (deve levar ~5s, pois é mock)
5. Verificar **Metadata** → deve exibir preview da tabela

Ou via CLI:

```powershell
docker exec ysh-dagster-webserver dagster asset materialize -m definitions --select catalog_normalized
```

**✅ Sucesso:** Asset materializado com metadata visível.

---

## 🔧 Fase 2: Implementar Pipeline Pathway Real (3-5 dias)

### Objetivo

Substituir mocks por pipelines Pathway funcionais que leiam S3/MinIO e escrevam no Postgres.

### 2.1. Criar bucket S3/MinIO local

**Opção A: MinIO local**

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\data-platform
docker-compose -f docker-compose.pathway.yml up -d minio
```

Acessar **<http://localhost:9002>**:

- User: `minioadmin`
- Password: `minioadmin`

Criar buckets:

- `ysh-catalog` (para CSVs de catálogo)
- `ysh-docs` (para PDFs RAG)

**Opção B: S3 AWS real**

Usar `aws-cli` ou Console AWS para criar bucket `ysh-data-lake`.

### 2.2. Popular dados de teste

Criar CSV de exemplo `catalog_raw.csv`:

```csv
sku,brand,model,category,power_wp,specs
BYD-600-MONO,BYD,600 Mono PERC,module,600,{"voc": 49.5, "isc": 14.2}
JINKO-550-BIF,JinkoSolar,550 Bifacial,module,550,{"voc": 48.8, "isc": 14.0}
GROWATT-5KW,Growatt,MIN 5000TL-XH,inverter,5000,{"mppt": 2, "phase": "mono"}
```

Upload para MinIO:

1. Acessar <http://localhost:9002>
2. Navegar até bucket `ysh-catalog`
3. Upload `catalog_raw.csv`

### 2.3. Implementar pipeline Pathway

Editar `data-platform/pathway/pipelines/catalog_etl.py`:

```python
import pathway as pw
import os

def run_catalog_pipeline() -> dict:
    # Configurações
    s3_endpoint = os.getenv("S3_ENDPOINT", "http://minio:9000")
    s3_bucket = os.getenv("S3_BUCKET", "ysh-catalog")
    
    # Schema
    class CatalogSchema(pw.Schema):
        sku: str
        brand: str
        model: str
        category: str
        power_wp: float
        specs: str
    
    # Input: S3/MinIO
    input_table = pw.io.csv.read(
        path=f"s3://{s3_bucket}/catalog_raw.csv",
        schema=CatalogSchema,
        aws_s3_settings=pw.io.s3.AwsS3Settings(
            bucket_name=s3_bucket,
            access_key=os.getenv("S3_ACCESS_KEY", "minioadmin"),
            secret_access_key=os.getenv("S3_SECRET_KEY", "minioadmin"),
            endpoint=s3_endpoint,
        ),
        mode="static",  # batch mode
    )
    
    # Transformação: normalizar SKU
    normalized = input_table.select(
        sku=pw.this.sku.str.upper(),
        brand=pw.this.brand,
        model=pw.this.model,
        category=pw.this.category,
        power_wp=pw.cast(float, pw.this.power_wp),
        specs=pw.this.specs,
    )
    
    # Output: Postgres
    pw.io.postgres.write(
        normalized,
        postgres_settings=pw.io.postgres.PostgresSettings(
            host=os.getenv("POSTGRES_HOST", "postgres"),
            port=int(os.getenv("POSTGRES_PORT", "5432")),
            database=os.getenv("POSTGRES_DB", "medusa_db"),
            user=os.getenv("POSTGRES_USER", "medusa_user"),
            password=os.getenv("POSTGRES_PASSWORD", "medusa_password"),
        ),
        table_name="items_normalized",
    )
    
    # Rodar
    pw.run()
    
    return {"total_items": len(normalized), "errors": 0}
```

### 2.4. Criar tabela Postgres

```powershell
docker exec -it ysh-b2b-postgres psql -U medusa_user -d medusa_db
```

```sql
CREATE TABLE IF NOT EXISTS items_normalized (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    model VARCHAR(255),
    category VARCHAR(50),
    power_wp FLOAT,
    specs JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.5. Rodar pipeline Pathway standalone

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\data-platform\pathway
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m pipelines.catalog_etl
```

**Validar:**

```sql
SELECT * FROM items_normalized;
-- Deve retornar 3 linhas (BYD, JinkoSolar, Growatt)
```

### 2.6. Integrar Pathway com Dagster

Editar `dagster/assets/catalog.py`:

```python
@asset(...)
def catalog_normalized(...):
    # Chamar pipeline Pathway
    from pathway.pipelines.catalog_etl import run_catalog_pipeline
    
    stats = run_catalog_pipeline()
    
    # Buscar resultado do Postgres
    df = postgres_medusa.execute_query("SELECT * FROM items_normalized")
    
    return Output(df, metadata={"num_items": len(df)})
```

**Testar via Dagster:**

```powershell
docker exec ysh-dagster-webserver dagster asset materialize -m definitions --select catalog_normalized
```

**✅ Sucesso:** Asset materializado com dados reais do Pathway.

---

## 🤖 Fase 3: Embeddings e RAG (2-3 dias)

### Objetivo

Gerar embeddings do catálogo e armazenar no Pinecone para busca semântica.

### 3.1. Implementar geração de embeddings

Editar `dagster/assets/catalog.py`:

```python
import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

@asset(deps=[catalog_normalized], ...)
def catalog_embeddings(context, postgres_medusa, pinecone):
    # Buscar itens sem embeddings
    items = postgres_medusa.execute_query("""
        SELECT id, sku, brand, model, category, power_wp, specs
        FROM items_normalized
        LIMIT 100
    """)
    
    # Gerar embeddings
    embeddings = []
    for _, item in items.iterrows():
        text = f"{item['brand']} {item['model']} - {item['category']} {item['power_wp']}W"
        
        response = openai.embeddings.create(
            model="text-embedding-3-large",
            input=text,
        )
        
        embeddings.append({
            "id": f"catalog_{item['id']}",
            "values": response.data[0].embedding,
            "metadata": {
                "sku": item["sku"],
                "brand": item["brand"],
                "category": item["category"],
            },
        })
    
    # Upsert no Pinecone
    pinecone.upsert(namespace="catalog", vectors=embeddings)
    
    return Output({"num_embeddings": len(embeddings)})
```

### 3.2. Testar busca semântica

```python
# Script de teste: test_rag.py
from pinecone import Pinecone
import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("ysh-rag")

# Query
query = "módulo solar 600W BYD"
query_emb = openai.embeddings.create(
    model="text-embedding-3-large",
    input=query,
).data[0].embedding

results = index.query(
    namespace="catalog",
    vector=query_emb,
    top_k=3,
    include_metadata=True,
)

for match in results.matches:
    print(f"Score: {match.score:.3f} | SKU: {match.metadata['sku']}")
```

**Saída esperada:**

```
Score: 0.987 | SKU: BYD-600-MONO
Score: 0.823 | SKU: JINKO-550-BIF
Score: 0.654 | SKU: GROWATT-5KW
```

**✅ Sucesso:** Busca semântica funcional com embeddings reais.

---

## 📊 Fase 4: Observabilidade e Schedules (1 dia)

### 4.1. Configurar schedules

Já estão definidos em `definitions.py`:

- `catalog_schedule` — diário às 2h
- `tarifas_schedule` — diário às 6h

**Ativar na UI Dagster:**

1. Ir em **Automation** → **Schedules**
2. Toggle ON para cada schedule

### 4.2. Configurar alertas (Dagster+)

Opções:

- **Dagster+ Cloud** (managed) — alertas nativos via Slack/email
- **Self-hosted:** integrar com Prometheus/Grafana

### 4.3. Adicionar health checks

Criar asset de validação:

```python
@asset(group_name="monitoring", compute_kind="Check")
def catalog_health_check(context, postgres_medusa):
    """Valida integridade do catálogo."""
    count = postgres_medusa.execute_query(
        "SELECT COUNT(*) as total FROM items_normalized"
    ).iloc[0]["total"]
    
    if count < 10:
        raise ValueError(f"Catálogo tem apenas {count} itens! Esperado > 10.")
    
    return Output({"count": count})
```

---

## 🚢 Fase 5: Deploy AWS (1 semana)

### 5.1. Infraestrutura AWS

**Serviços necessários:**

- **ECS Fargate** — Dagster daemon + webserver + Pathway containers
- **RDS Aurora Postgres** — DB principal (Medusa + Analytics)
- **S3** — Data Lake
- **Secrets Manager** — Credenciais
- **CloudWatch** — Logs
- **ALB** — Load balancer para Dagster UI

### 5.2. Terraform/CloudFormation

Criar `infra/terraform/data-platform/`:

- `ecs.tf` — Tasks ECS para Dagster e Pathway
- `rds.tf` — Aurora cluster
- `s3.tf` — Buckets
- `secrets.tf` — Secrets Manager

### 5.3. CI/CD

**GitHub Actions** para deploy automático:

```yaml
# .github/workflows/deploy-data-platform.yml
name: Deploy Data Platform

on:
  push:
    branches: [main]
    paths:
      - 'data-platform/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Dagster image
        run: |
          docker build -t ysh/dagster:${{ github.sha }} data-platform/dagster
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login ...
          docker push ysh/dagster:${{ github.sha }}
      - name: Update ECS task
        run: |
          aws ecs update-service --cluster ysh-data --service dagster ...
```

---

## 🎓 Recursos de Aprendizado

### Pathway

- **Docs oficiais:** <https://pathway.com/developers/user-guide/introduction/welcome>
- **Tutoriais RAG:** <https://pathway.com/bootcamps/rag-and-llms>
- **GitHub examples:** <https://github.com/pathwaycom/llm-app>

### Dagster

- **Concepts:** <https://docs.dagster.io/concepts>
- **Assets tutorial:** <https://docs.dagster.io/tutorial/assets>
- **Deployment:** <https://docs.dagster.io/deployment>

### Integrações

- **Dagster + S3:** <https://docs.dagster.io/_apidocs/libraries/dagster-aws>
- **Pathway + Kafka:** <https://pathway.com/developers/user-guide/connect/connectors/kafka>
- **Pinecone + OpenAI:** <https://docs.pinecone.io/integrations/openai>

---

## ⏱️ Timeline Estimado

| Fase | Duração | Dependências | Bloqueadores Potenciais |
|------|---------|--------------|-------------------------|
| 1. Validação Local | 1-2 dias | Nenhuma | Portas ocupadas (3001, 9002) |
| 2. Pipeline Pathway | 3-5 dias | Fase 1 | Docs Pathway (API ainda estabilizando) |
| 3. Embeddings & RAG | 2-3 dias | Fase 2 | Rate limits OpenAI |
| 4. Observabilidade | 1 dia | Fase 3 | - |
| 5. Deploy AWS | 1 semana | Fase 4 | Permissões AWS, custos |
| **Total** | **2-3 semanas** | - | - |

---

## 🆘 Suporte e Troubleshooting

### Problema: Dagster UI não carrega

```powershell
docker logs ysh-dagster-webserver
# Procurar por erros de conexão com Postgres
```

**Solução:** Verificar env var `DAGSTER_POSTGRES_HOST`.

### Problema: Pathway não encontra módulos

```powershell
pip list | Select-String pathway
# Verificar versão instalada
```

**Solução:** `pip install --upgrade pathway`.

### Problema: Pinecone "Index not found"

**Solução:** Criar índice no Console Pinecone com dimension=3072.

---

## 📞 Contato

**Comandante A** — Dúvidas ou bloqueios, me avise! 🚀

**Hélio Copiloto Solar** — Sempre aqui para acelerar. ⚡

---

**Status:** ✅ **Estrutura completa** | 🚧 **Implementação em andamento** (Fase 1)

**Próximo milestone:** Materializar primeiro asset Dagster com dados reais do Pathway.
