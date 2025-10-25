# 🌞 Yello Solar Hub - Solar as a Service End-to-End Integration

**Data:** Outubro 2025  
**Status:** 🔄 Em Desenvolvimento  
**Versão:** 1.0

---

## 📋 Índice

1. [Visão Geral do Ecossistema](#visão-geral-do-ecossistema)
2. [Arquitetura de Referência](#arquitetura-de-referência)
3. [Repositórios e Componentes](#repositórios-e-componentes)
4. [Fluxos de Integração End-to-End](#fluxos-de-integração-end-to-end)
5. [Stack Tecnológico](#stack-tecnológico)
6. [Data Pipeline e Analytics](#data-pipeline-e-analytics)
7. [APIs e Integrações](#apis-e-integrações)
8. [Infraestrutura e Deploy](#infraestrutura-e-deploy)
9. [Roadmap de Integração](#roadmap-de-integração)
10. [Próximos Passos](#próximos-passos)

---

## 🎯 Visão Geral do Ecossistema

### Componentes Principais

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Storefront Next.js]
        B[Medusa Admin]
    end
    
    subgraph "Backend Services"
        C[Medusa Backend]
        D[HaaS Platform API]
        E[Data Platform]
    end
    
    subgraph "Data & Analytics"
        F[Dagster Pipeline]
        G[Pathway Real-time]
        H[PostHog Analytics]
        I[Qdrant Vector DB]
    end
    
    subgraph "Infrastructure"
        J[PostgreSQL]
        K[Redis]
        L[MinIO/S3]
        M[AWS ECS]
    end
    
    A --> C
    B --> C
    C --> D
    C --> J
    D --> J
    D --> K
    E --> F
    E --> G
    E --> H
    F --> I
    G --> I
    
    M -.Deploy.-> A
    M -.Deploy.-> C
    M -.Deploy.-> D
```

### Aplicações Solar as a Service

| Aplicação | Propósito | Status | Repositório |
|-----------|-----------|--------|-------------|
| **E-commerce B2B** | Marketplace de produtos solares | ✅ Produção | `ysh-store` |
| **HaaS Platform** | Homologação como Serviço | 🔄 Desenvolvimento | `project-helios/haas` |
| **Data Platform** | Pipeline de dados e RAG | ✅ Operacional | `data-platform` |
| **Product Inventory** | Enriquecimento de catálogo | ✅ Completo | `products-inventory` |

---

## 🏗️ Arquitetura de Referência

### Camadas de Aplicação

#### 1. **Frontend Layer** (Next.js 14+)

```tsx
ysh-store/
├── storefront/          # B2B storefront com Next.js 14
│   ├── app/            # App Router
│   ├── components/     # React components
│   ├── lib/            # Utilities e helpers
│   └── public/         # Assets estáticos
└── admin/              # Medusa Admin customizado
```

**Features:**

- Server Components (React 18)
- Edge Runtime capabilities
- ISR (Incremental Static Regeneration)
- Multi-region pricing
- Payment splits (Asaas integration)

#### 2. **Backend Layer** (Node.js + Python)

```tsx
ysh-store/backend/
├── medusa/             # Medusa.js e-commerce backend
│   ├── src/
│   ├── migrations/
│   └── package.json
└── data/
    ├── project-helios/haas/    # HaaS Platform (FastAPI)
    └── products-inventory/      # Product enrichment pipeline
```

**Medusa Backend Features:**

- Multi-warehouse inventory
- Multi-currency pricing
- Custom payment providers (Asaas)
- Webhook integrations
- Admin API extensions

**HaaS Platform Features:**

- INMETRO validation API
- Document generation (Memorial Descritivo)
- Monitoring & alerting
- JWT authentication + refresh tokens
- Redis-based token blacklist

#### 3. **Data Platform** (Dagster + Pathway)

```tsx
data-platform/
├── dagster/            # Orchestration pipelines
│   ├── pipelines/
│   ├── assets/
│   └── resources/
├── pathway/            # Real-time stream processing
│   ├── indexing/
│   └── xpack/
└── docker-compose.*.yml
```

**Features:**

- ETL pipelines para distribuidores (Fortlev, Neosolar, etc.)
- ANEEL data fetcher
- Crawlee scraper para portais
- Real-time vector indexing (Qdrant)
- PostHog event tracking

#### 4. **Infrastructure Layer** (AWS + Docker)

```tsx
aws/
├── cloudformation-infrastructure.yml
├── cloudformation-with-domain.yml
├── *-task-definition.json
├── deploy-*.ps1
└── README.md

docker/
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── nginx.conf
```

---

## 📦 Repositórios e Componentes

### 1. **ysh-store** (Monorepo Principal)

**Estrutura:**

```tsx
ysh-store/
├── backend/
│   ├── data/
│   │   ├── project-helios/      # HaaS Platform
│   │   └── products-inventory/  # Product enrichment
│   └── medusa/                  # E-commerce backend
├── storefront/                  # Next.js frontend
├── aws/                         # AWS deployment scripts
├── docker/                      # Docker configurations
└── data-platform/               # Dagster + Pathway
```

**Tecnologias:**

- **Backend:** Node.js 18+, TypeScript, Medusa.js 2.x
- **Frontend:** Next.js 14, React 18, TailwindCSS
- **Python Services:** FastAPI, Dagster, Pathway
- **Databases:** PostgreSQL 15, Redis 7, Qdrant
- **Storage:** MinIO (S3-compatible)

---

### 2. **Project Helios - HaaS Platform**

**Localização:** `backend/data/project-helios/haas/`

**Estrutura:**

```tsx
haas/
├── app/
│   ├── routers/
│   │   ├── auth.py              # JWT auth + refresh tokens
│   │   ├── inmetro.py           # INMETRO validation
│   │   ├── monitoring.py        # System monitoring
│   │   └── documents.py         # Document generation
│   ├── models/
│   ├── services/
│   ├── core/
│   └── main.py
├── alembic/                     # Database migrations
├── tests/                       # Unit & integration tests
├── docker-compose.yml
└── requirements.txt
```

**APIs Implementadas:** ✅ 18 endpoints

| Categoria | Endpoints | Status |
|-----------|-----------|--------|
| **Auth** | 5 (login, refresh, logout, register, profile) | ✅ Complete |
| **INMETRO** | 5 (validate, status, certificate, search, batch) | ✅ Complete |
| **Monitoring** | 4 (dashboard, metrics, alerts, acknowledge) | ✅ Complete |
| **Documents** | 4 (memorial, get, diagrams, list) | ✅ Complete |

**Próximos Passos:**

- [ ] Unit tests (target: 80% coverage)
- [ ] Integration com InmetroCrawler
- [ ] ReportLab PDF generation
- [ ] S3 document storage
- [ ] Celery background tasks

---

### 3. **Product Inventory & Enrichment**

**Localização:** `backend/data/products-inventory/`

**Pipeline Completo:**

```tsx
products-inventory/
├── data-pipeline/              # ETL pipelines
│   ├── integrated_data_pipeline.py
│   ├── aneel_data_fetcher.py
│   ├── crawlee_scraper.py
│   └── realtime_processor.py
├── distributors/               # Distributor-specific scrapers
│   ├── fortlev/
│   ├── neosolar/
│   ├── odex/
│   └── solfacil/
├── enriched-schemas/           # Enriched product data
├── medusa-catalog/             # Medusa-ready catalog
├── schemas/                    # JSON schemas
└── scripts/
    ├── generate_medusa_catalog.py
    └── import-catalog-to-medusa.ts
```

**Pipeline Stages:**

1. **Extract:** Distributor scraping (Fortlev, Neosolar, Odex, Solfacil)
2. **Transform:** Schema normalization, enrichment com LLM (GPT-4)
3. **Load:** Import para Medusa via Admin API
4. **Validate:** Schema coverage analysis

**Enrichment Completeness:**

```json
{
  "enriched_products": 1574,
  "schema_coverage": {
    "price_analysis": "100%",
    "warranty": "100%",
    "certifications": "100%",
    "kpis": "100%",
    "technical_specs": "85%",
    "images": "65%"
  }
}
```

---

### 4. **Data Platform**

**Localização:** `data-platform/`

**Componentes:**

#### Dagster (Orchestration)

```tsx
dagster/
├── pipelines/
│   ├── distributor_sync.py     # Sync distributor catalogs
│   ├── aneel_enrichment.py     # ANEEL data integration
│   └── vector_indexing.py      # Qdrant indexing
├── assets/
│   ├── product_assets.py
│   └── concessionaria_assets.py
└── resources/
    ├── postgres_resource.py
    └── qdrant_resource.py
```

**Dagster Jobs:**

- `distributor_daily_sync`: Sincronização diária de distribuidores
- `aneel_weekly_update`: Atualização semanal de dados ANEEL
- `vector_reindex`: Re-indexação de embeddings no Qdrant

#### Pathway (Real-time)

```tsx
pathway/
├── indexing/
│   ├── realtime_rag.py         # RAG pipeline
│   └── vector_store.py         # Qdrant integration
└── xpack/
    └── llm/
        ├── llms.py             # LLM providers
        └── prompts.py          # Prompt templates
```

**Real-time Capabilities:**

- Streaming product updates
- Instant vector indexing
- Real-time RAG responses
- Low-latency search (<100ms)

#### PostHog (Analytics)

```yaml
# docker-compose.posthog.yml
services:
  posthog:
    image: posthog/posthog:latest
    ports:
      - "8000:8000"
    environment:
      - POSTHOG_PROJECT_API_KEY=${POSTHOG_API_KEY}
```

**Event Tracking:**

- User behavior tracking
- Product view analytics
- Conversion funnels
- A/B testing support

---

## 🔄 Fluxos de Integração End-to-End

### Fluxo 1: Product Discovery → Purchase

```mermaid
sequenceDiagram
    actor User
    participant Storefront
    participant Medusa
    participant Qdrant
    participant Asaas
    
    User->>Storefront: Search "Inversor Fronius"
    Storefront->>Qdrant: Semantic search
    Qdrant-->>Storefront: Top 10 products + embeddings
    Storefront-->>User: Display results with filters
    
    User->>Storefront: Add to cart + checkout
    Storefront->>Medusa: Create order
    Medusa->>Asaas: Create payment split
    Asaas-->>Medusa: Payment confirmation
    Medusa-->>Storefront: Order confirmed
    Storefront-->>User: Success + tracking info
```

**Componentes Envolvidos:**

- **Storefront:** Next.js app router + React Server Components
- **Medusa Backend:** Order processing, inventory management
- **Qdrant:** Vector search para semantic product discovery
- **Asaas:** Payment gateway com split de pagamentos

---

### Fluxo 2: Product Enrichment Pipeline

```mermaid
graph LR
    A[Distributor Scraper] -->|Raw Data| B[ETL Pipeline]
    B -->|Normalized| C[LLM Enrichment]
    C -->|Enriched JSON| D[Schema Validator]
    D -->|Valid Products| E[Medusa Import]
    E -->|Catalog| F[Qdrant Indexing]
    F -->|Embeddings| G[Storefront Search]
    
    H[ANEEL API] -->|Certification| C
    I[Vision AI] -->|Image Analysis| C
```

**Pipeline Steps:**

1. **Extraction** (distributors/*.py)
   - Fortlev, Neosolar, Odex, Solfacil scrapers
   - Output: Raw JSON files

2. **Transformation** (llm_product_enricher.py)
   - GPT-4 enrichment
   - Price analysis
   - Warranty extraction
   - Certification validation
   - KPI calculation

3. **Validation** (validate_merge.py)
   - Schema compliance check
   - Duplicate detection
   - Quality scoring

4. **Load** (import-catalog-to-medusa.ts)
   - Medusa Admin API import
   - Category mapping
   - Variant creation
   - Price region setup

5. **Indexing** (Pathway real-time)
   - Generate embeddings (OpenAI text-embedding-3)
   - Index to Qdrant
   - Enable semantic search

---

### Fluxo 3: HaaS Platform - Homologação

```mermaid
sequenceDiagram
    actor Integrador
    participant HaaS API
    participant InmetroCrawler
    participant Engineer Network
    participant Concessionaria
    participant DocumentStore
    
    Integrador->>HaaS API: POST /api/inmetro/validate
    HaaS API->>InmetroCrawler: Validate certificate
    InmetroCrawler-->>HaaS API: Certificate valid
    
    Integrador->>HaaS API: POST /api/documents/memorial
    HaaS API->>Engineer Network: Assign engineer
    Engineer Network->>HaaS API: Review complete
    HaaS API->>DocumentStore: Upload signed PDF
    HaaS API-->>Integrador: Document ready
    
    Integrador->>HaaS API: Submit to concessionária
    HaaS API->>Concessionaria: Portal submission
    HaaS API-->>Integrador: Tracking ID
    
    loop Monitoring
        Integrador->>HaaS API: GET /api/monitoring/dashboard
        HaaS API-->>Integrador: Real-time status
    end
```

**Componentes:**

- **HaaS API:** FastAPI backend com 18 endpoints
- **InmetroCrawler:** INMETRO certificate validation
- **Engineer Network:** Gig economy de engenheiros
- **DocumentStore:** S3-compatible storage (MinIO)

---

## 🛠️ Stack Tecnológico

### Backend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Node.js** | 18+ | Medusa backend |
| **TypeScript** | 5.x | Type safety |
| **Medusa.js** | 2.x | E-commerce engine |
| **FastAPI** | 0.115+ | HaaS Platform APIs |
| **Python** | 3.11+ | Data pipelines |
| **Dagster** | Latest | Orchestration |
| **Pathway** | Latest | Real-time processing |

### Databases & Storage

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **PostgreSQL** | 15-alpine | Primary database |
| **Redis** | 7-alpine | Caching + sessions |
| **Qdrant** | 1.12+ | Vector database |
| **MinIO** | Latest | Object storage (S3) |

### Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Next.js** | 14+ | React framework |
| **React** | 18+ | UI library |
| **TailwindCSS** | 3.x | Styling |
| **shadcn/ui** | Latest | Component library |

### Infrastructure

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Docker** | 24+ | Containerization |
| **Docker Compose** | 2.x | Local orchestration |
| **AWS ECS** | Fargate | Production deployment |
| **AWS RDS** | PostgreSQL 15 | Managed database |
| **AWS CloudWatch** | - | Monitoring & logs |

---

## 📊 Data Pipeline e Analytics

### Dagster Pipelines

#### **Pipeline 1: Distributor Sync**

```python
@asset(group_name="distributors")
def sync_fortlev_catalog(context):
    """Sincroniza catálogo Fortlev"""
    scraper = FortlevScraper()
    products = scraper.extract_all()
    
    # Transform
    enriched = enrich_products(products)
    
    # Load
    import_to_medusa(enriched)
    
    context.log.info(f"Synced {len(enriched)} products")
    return enriched
```

**Schedule:** Diário às 02:00 BRT

#### **Pipeline 2: Vector Indexing**

```python
@asset(group_name="search", deps=["medusa_products"])
def index_to_qdrant(context, medusa_products):
    """Indexa produtos no Qdrant"""
    client = QdrantClient(url=QDRANT_URL)
    
    embeddings = generate_embeddings(medusa_products)
    
    client.upsert(
        collection_name="products",
        points=embeddings
    )
    
    return {"indexed": len(embeddings)}
```

**Schedule:** Após cada sync de distribuidor

---

### Pathway Real-time RAG

**Architecture:**

```python
# pathway/indexing/realtime_rag.py
import pathway as pw
from pathway.xpack.llm import embedders, llms

# Data source (real-time product updates)
products = pw.io.postgres.read(
    host="postgres",
    database="medusa",
    table="product"
)

# Generate embeddings
embedded = products.select(
    embedding=embedders.OpenAIEmbedder(
        model="text-embedding-3-small"
    )(pw.this.description)
)

# Index to Qdrant
pw.io.qdrant.write(
    embedded,
    url="http://qdrant:6333",
    collection="products_realtime"
)
```

**Latency:** <100ms from DB update to searchable

---

### PostHog Analytics

**Events Tracked:**

```typescript
// Storefront tracking
posthog.capture('product_viewed', {
  product_id: product.id,
  category: product.category,
  price: product.price,
  distributor: product.metadata.distributor
})

posthog.capture('checkout_completed', {
  order_id: order.id,
  total: order.total,
  items: order.items.length,
  payment_method: order.payment.provider
})
```

**Dashboards:**

- Conversion funnel
- Product popularity
- Regional sales distribution
- Payment split analytics

---

## 🔗 APIs e Integrações

### 1. Medusa Admin API

**Base URL:** `https://api.yellosolar.com/admin`

**Key Endpoints:**

```typescript
// Products
POST   /admin/products
GET    /admin/products/:id
PUT    /admin/products/:id
DELETE /admin/products/:id

// Orders
GET    /admin/orders
GET    /admin/orders/:id
POST   /admin/orders/:id/fulfill

// Customers
GET    /admin/customers
POST   /admin/customers
```

**Authentication:** Bearer JWT token

---

### 2. HaaS Platform API

**Base URL:** `https://haas.yellosolar.com/api`

**Endpoints Completos:**

#### Auth (5 endpoints)

```bash
POST   /auth/login           # Login + access/refresh tokens
POST   /auth/refresh         # Rotate refresh token
POST   /auth/logout          # Blacklist token
POST   /auth/register        # New user registration
GET    /auth/profile         # User profile
```

#### INMETRO (5 endpoints)

```bash
POST   /inmetro/validate     # Validate certificate
GET    /inmetro/status/:id   # Check validation status
GET    /inmetro/certificate/:id  # Get certificate details
GET    /inmetro/search       # Search certificates
POST   /inmetro/batch        # Batch validation
```

#### Monitoring (4 endpoints)

```bash
GET    /monitoring/dashboard        # Real-time metrics
GET    /monitoring/metrics          # Historical metrics
GET    /monitoring/alerts           # Active alerts
POST   /monitoring/alerts/:id/ack   # Acknowledge alert
```

#### Documents (4 endpoints)

```bash
POST   /documents/memorial      # Generate memorial descritivo
GET    /documents/:id           # Get document
POST   /documents/diagrams      # Generate technical diagrams
GET    /documents/              # List user documents
```

**Authentication:** JWT Bearer token (1h expiry, 7d refresh)

---

### 3. External Integrations

#### Asaas Payment Gateway

```typescript
// Payment split configuration
interface PaymentSplit {
  recipientId: string;      // Medusa admin ID
  percentual: number;       // 0-100
  fixedValue?: number;      // Optional fixed amount
  boleto: boolean;          // Enable boleto
  creditCard: boolean;      // Enable credit card
  pix: boolean;            // Enable PIX
}

// Example: 85% to integrator, 15% to YSH
const split: PaymentSplit = {
  recipientId: "INTEGRATOR_123",
  percentual: 85,
  boleto: true,
  creditCard: true,
  pix: true
}
```

#### ANEEL API

```python
# aneel_data_fetcher.py
class AneelDataFetcher:
    BASE_URL = "https://www.aneel.gov.br/dados-abertos"
    
    def fetch_concessionarias(self):
        """Fetch all concessionárias data"""
        return self.get("/concessionarias")
    
    def fetch_tarifas(self, concessionaria_id):
        """Fetch tariff data for concessionária"""
        return self.get(f"/tarifas/{concessionaria_id}")
```

---

## 🚀 Infraestrutura e Deploy

### Ambientes

| Ambiente | URL | Stack | Deploy |
|----------|-----|-------|--------|
| **Development** | localhost | Docker Compose | Manual |
| **Staging** | staging.yellosolar.com | AWS ECS | GitHub Actions |
| **Production** | yellosolar.com | AWS ECS + RDS | GitHub Actions |

---

### Docker Compose (Development)

**Main Stack:**

```yaml
# docker/docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: medusa
      POSTGRES_USER: medusa
      POSTGRES_PASSWORD: medusa
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  medusa-backend:
    build:
      context: ../backend/medusa
      dockerfile: Dockerfile.dev
    ports:
      - "9000:9000"
    environment:
      DATABASE_URL: postgres://medusa:medusa@postgres:5432/medusa
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  haas-api:
    build:
      context: ../backend/data/project-helios/haas
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://medusa:medusa@postgres:5432/haas
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  storefront:
    build:
      context: ../storefront
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_MEDUSA_URL: http://medusa-backend:9000
    depends_on:
      - medusa-backend
  
  qdrant:
    image: qdrant/qdrant:v1.12.0
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage
  
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  qdrant_data:
  minio_data:
```

**Start Development:**

```powershell
cd docker
docker-compose up -d
```

---

### AWS ECS Deployment

**Architecture:**

```tsx
Internet
   ↓
ALB (Load Balancer)
   ├─→ ECS Service: Storefront (Port 3000)
   ├─→ ECS Service: Medusa Backend (Port 9000)
   └─→ ECS Service: HaaS API (Port 8000)
       ↓
   RDS PostgreSQL (Private Subnet)
   ElastiCache Redis (Private Subnet)
```

**Task Definitions:**

```json
// aws/backend-task-definition.json
{
  "family": "medusa-backend",
  "containerDefinitions": [
    {
      "name": "medusa",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/ysh-medusa:latest",
      "memory": 2048,
      "cpu": 1024,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 9000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgres://admin:password@rds-endpoint:5432/medusa"
        },
        {
          "name": "REDIS_URL",
          "value": "redis://elasticache-endpoint:6379"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/medusa-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "networkMode": "awsvpc",
  "cpu": "1024",
  "memory": "2048"
}
```

**Deployment Script:**

```powershell
# aws/1-deploy-ecs-tasks.ps1
param(
    [string]$Environment = "production"
)

# Build and push images
docker build -t ysh-medusa:latest ../backend/medusa
docker tag ysh-medusa:latest $ECR_REPO/ysh-medusa:latest
docker push $ECR_REPO/ysh-medusa:latest

# Update ECS service
aws ecs update-service `
    --cluster ysh-cluster `
    --service medusa-backend `
    --force-new-deployment `
    --region us-east-1

Write-Host "Deployment initiated. Check AWS Console for status."
```

---

### CloudFormation Stack

**Infrastructure as Code:**

```yaml
# aws/cloudformation-infrastructure.yml
AWSTemplateFormatVersion: '2010-09-09'
Description: YSH Solar as a Service Infrastructure

Parameters:
  Environment:
    Type: String
    Default: production
    AllowedValues:
      - development
      - staging
      - production

Resources:
  # VPC
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub ${Environment}-vpc

  # ECS Cluster
  ECSCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: !Sub ${Environment}-cluster
      CapacityProviders:
        - FARGATE
        - FARGATE_SPOT

  # RDS PostgreSQL
  RDSInstance:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: !Sub ${Environment}-postgres
      Engine: postgres
      EngineVersion: 15.4
      DBInstanceClass: db.t3.medium
      AllocatedStorage: 100
      StorageType: gp3
      MasterUsername: admin
      MasterUserPassword: !Ref DBPassword
      VPCSecurityGroups:
        - !Ref RDSSecurityGroup
      DBSubnetGroupName: !Ref DBSubnetGroup
      PubliclyAccessible: false
      BackupRetentionPeriod: 7

  # ElastiCache Redis
  RedisCluster:
    Type: AWS::ElastiCache::CacheCluster
    Properties:
      CacheClusterName: !Sub ${Environment}-redis
      Engine: redis
      CacheNodeType: cache.t3.medium
      NumCacheNodes: 1
      VpcSecurityGroupIds:
        - !Ref RedisSecurityGroup

  # Application Load Balancer
  ALB:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: !Sub ${Environment}-alb
      Type: application
      Scheme: internet-facing
      SecurityGroups:
        - !Ref ALBSecurityGroup
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

Outputs:
  VPCId:
    Value: !Ref VPC
    Export:
      Name: !Sub ${Environment}-VPCId
  
  ClusterName:
    Value: !Ref ECSCluster
    Export:
      Name: !Sub ${Environment}-ClusterName
  
  RDSEndpoint:
    Value: !GetAtt RDSInstance.Endpoint.Address
    Export:
      Name: !Sub ${Environment}-RDSEndpoint
```

**Deploy Stack:**

```powershell
aws cloudformation create-stack `
    --stack-name ysh-infrastructure `
    --template-body file://cloudformation-infrastructure.yml `
    --parameters ParameterKey=Environment,ParameterValue=production `
    --capabilities CAPABILITY_IAM `
    --region us-east-1
```

---

## 🗺️ Roadmap de Integração

### Q4 2024 - Foundation ✅

- [x] Medusa backend setup
- [x] PostgreSQL + Redis infrastructure
- [x] Product inventory enrichment pipeline
- [x] ANEEL data fetcher
- [x] Basic storefront (Next.js)

### Q1 2025 - Data Platform ✅

- [x] Dagster pipelines
- [x] Pathway real-time processing
- [x] Qdrant vector database
- [x] PostHog analytics integration
- [x] Distributor scrapers (Fortlev, Neosolar, Odex, Solfacil)

### Q2 2025 - HaaS Platform 🔄

- [x] HaaS API backend (18 endpoints)
- [x] Auth system (JWT + refresh tokens)
- [x] INMETRO validation API
- [x] Monitoring API
- [x] Documents API
- [ ] Unit tests (80% coverage)
- [ ] InmetroCrawler integration
- [ ] Production deployment

### Q3 2025 - E-commerce Enhancement

- [ ] Multi-warehouse inventory
- [ ] Advanced pricing rules
- [ ] Payment splits automation
- [ ] Regional pricing optimization
- [ ] Storefront v2 (improved UX)

### Q4 2025 - Platform Expansion

- [ ] HaaS Platform MVP launch (Enel SP)
- [ ] Real-time order tracking
- [ ] Recommendation engine
- [ ] Mobile app (React Native)
- [ ] API marketplace

### 2026 - Scale & Innovation

- [ ] HaaS national coverage (all concessionárias)
- [ ] AI-powered project sizing
- [ ] Automated technical diagrams
- [ ] Financial products integration
- [ ] O&M platform

---

## 📋 Próximos Passos

### Imediato (Semana 1-2)

#### 1. **Finalizar HaaS Platform**

```bash
# Test coverage
cd backend/data/project-helios/haas
pytest tests/ --cov=app --cov-report=html

# Deploy to staging
docker-compose -f docker-compose.prod.yml up -d
```

**Tasks:**

- [ ] Write unit tests para 18 endpoints
- [ ] Integrar InmetroCrawler real
- [ ] Setup ReportLab PDF generation
- [ ] Configure S3 storage (MinIO → AWS S3)
- [ ] Deploy to AWS ECS staging

#### 2. **Data Platform Monitoring**

```python
# Setup Dagster sensors
@sensor(job=sync_distributors_job)
def distributor_update_sensor(context):
    """Trigger pipeline on new distributor data"""
    last_sync = get_last_sync_time()
    if should_sync(last_sync):
        yield RunRequest(run_key=str(time.time()))
```

**Tasks:**

- [ ] Configure Dagster sensors
- [ ] Setup alerting (Slack/Discord)
- [ ] Monitor Pathway latency
- [ ] Validate Qdrant indexing

#### 3. **Integration Testing**

```typescript
// End-to-end test
describe('Product Discovery Flow', () => {
  it('should search, add to cart, and checkout', async () => {
    // Search product
    const response = await fetch('/api/search?q=inversor')
    const products = await response.json()
    expect(products.length).toBeGreaterThan(0)
    
    // Add to cart
    await medusa.carts.lineItems.create(cartId, {
      variant_id: products[0].variants[0].id,
      quantity: 1
    })
    
    // Checkout
    const order = await medusa.carts.complete(cartId)
    expect(order.status).toBe('pending')
  })
})
```

**Tasks:**

- [ ] E2E tests (Playwright)
- [ ] Load testing (k6)
- [ ] API integration tests
- [ ] Payment flow validation

---

### Curto Prazo (Mês 1-3)

#### 1. **HaaS Platform Production Launch**

**Milestone:** Launch MVP for Enel SP

**Checklist:**

- [ ] 20 engenheiros recrutados e treinados
- [ ] 5 clientes piloto confirmados
- [ ] 50 projetos processados com sucesso
- [ ] SLA de 15 dias validado
- [ ] Taxa de aprovação >90%

**Metrics:**

- MRR target: R$ 50k
- NPS target: >50
- Churn target: <5%

#### 2. **E-commerce Optimization**

**Focus:** Increase conversion rate

**Initiatives:**

- [ ] A/B testing framework (PostHog)
- [ ] Personalized recommendations (Qdrant)
- [ ] Abandoned cart recovery (email automation)
- [ ] Regional pricing optimization
- [ ] Payment split automation

**Metrics:**

- Conversion rate target: 3% → 5%
- AOV target: R$ 5k → R$ 7k
- Repeat purchase rate: 15% → 25%

#### 3. **Data Platform Expansion**

**New Pipelines:**

- [ ] Tariff data scraper (ANEEL)
- [ ] Weather data integration (INMET)
- [ ] Competitor pricing monitoring
- [ ] Market intelligence dashboard

**Metrics:**

- Pipeline reliability: >99.5%
- Data freshness: <1h
- Indexing latency: <5min

---

### Médio Prazo (Mês 3-6)

#### 1. **Platform Integration Hub**

**Vision:** Single API for all YSH services

```typescript
// Unified API
interface YSHPlatform {
  ecommerce: MedusaAPI;
  haas: HaaSAPI;
  analytics: PostHogAPI;
  search: QdrantAPI;
}

const ysh = new YSHPlatform({
  apiKey: process.env.YSH_API_KEY
})

// Unified search
const results = await ysh.search.products({
  query: "inversor fronius",
  filters: { price_max: 10000 },
  region: "SP"
})

// HaaS integration
const homologacao = await ysh.haas.submitProject({
  project_data: projectData,
  concessionaria: "ENEL_SP"
})
```

**Tasks:**

- [ ] Design unified API schema
- [ ] Implement API gateway (Kong/Tyk)
- [ ] Create SDK packages (TypeScript, Python)
- [ ] Write comprehensive docs

#### 2. **Mobile Application**

**Stack:** React Native + Expo

**Features:**

- Product browsing and search
- Order tracking
- HaaS project monitoring
- Push notifications
- Offline support

**Metrics:**

- MAU target: 1,000
- Engagement: >50% DAU/MAU
- App Store rating: >4.5

---

### Longo Prazo (6-12 meses)

#### 1. **AI-Powered Features**

**Initiatives:**

- [ ] Project sizing assistant (LLM-based)
- [ ] Automated technical diagram generation
- [ ] Predictive homologation timeline
- [ ] Smart product recommendations
- [ ] Chatbot support (RAG-based)

**Tech Stack:**

- GPT-4 for reasoning
- Stable Diffusion for diagram generation
- Pathway for real-time RAG
- LangChain for orchestration

#### 2. **Financial Products Integration**

**Vision:** Complete financial platform for solar integrators

**Products:**

- Equipment financing
- Project insurance
- Working capital loans
- Revenue-based financing

**Partners:**

- Banks (Banco do Brasil, Caixa)
- Fintechs (Stone, Creditas)
- Insurance companies (Sompo, Porto Seguro)

#### 3. **O&M Platform**

**Vision:** Post-installation monitoring and maintenance

**Features:**

- Remote monitoring integration
- Predictive maintenance alerts
- Performance analytics
- Warranty management
- Spare parts marketplace

**Revenue Model:**

- R$ 50/month per system
- Target: 10,000 systems by end of 2026
- Annual revenue: R$ 6M

---

## 📞 Contatos e Recursos

### Documentação

| Recurso | Link |
|---------|------|
| **Project Helios Index** | [`INDEX.md`](./project-helios/INDEX.md) |
| **Executive Summary** | [`EXECUTIVE-SUMMARY.md`](./project-helios/EXECUTIVE-SUMMARY.md) |
| **HaaS Architecture** | [`haas-architecture.md`](./project-helios/business-model/haas-architecture.md) |
| **API Documentation** | [`HAAS-API-ENDPOINTS-360.md`](./project-helios/haas/HAAS-API-ENDPOINTS-360.md) |
| **Deployment Guide** | [`aws/README.md`](../../aws/README.md) |

### Stack Reference

| Stack | Documentation |
|-------|---------------|
| **Medusa.js** | <https://docs.medusajs.com> |
| **Next.js** | <https://nextjs.org/docs> |
| **FastAPI** | <https://fastapi.tiangolo.com> |
| **Dagster** | <https://docs.dagster.io> |
| **Pathway** | <https://pathway.com/developers> |
| **Qdrant** | <https://qdrant.tech/documentation> |

---

## 🎯 Conclusão

Esta integração end-to-end cria um ecossistema completo de **Solar as a Service** que abrange:

✅ **E-commerce B2B** - Marketplace de produtos com preços competitivos  
✅ **Data Platform** - Pipeline de enriquecimento e analytics  
✅ **HaaS Platform** - Homologação automatizada e rastreável  
✅ **Infrastructure** - Deploy cloud-native escalável  
✅ **Analytics** - Insights profundos sobre comportamento e mercado  

**O resultado:** Uma plataforma unificada que resolve os principais pain points do mercado solar brasileiro, desde a descoberta de produtos até a homologação na concessionária.

---

**Documento:** YSH Solar as a Service - End-to-End Integration  
**Versão:** 1.0  
**Data:** Outubro 2025  
**Última Atualização:** 2025-10-14

---

## 📊 Anexos

### Anexo A: Environment Variables

```bash
# .env.example

# Medusa Backend
DATABASE_URL=postgresql://medusa:medusa@postgres:5432/medusa
REDIS_URL=redis://redis:6379
JWT_SECRET=your-jwt-secret-here
COOKIE_SECRET=your-cookie-secret-here

# HaaS Platform
HAAS_DATABASE_URL=postgresql://medusa:medusa@postgres:5432/haas
HAAS_REDIS_URL=redis://redis:6379
HAAS_JWT_SECRET=your-haas-jwt-secret
HAAS_JWT_ALGORITHM=HS256
HAAS_ACCESS_TOKEN_EXPIRE_MINUTES=60
HAAS_REFRESH_TOKEN_EXPIRE_DAYS=7

# Storefront
NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000
NEXT_PUBLIC_HAAS_API_URL=http://localhost:8000
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Data Platform
QDRANT_URL=http://qdrant:6333
QDRANT_API_KEY=your-qdrant-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# AWS (Production)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=ysh-documents
CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id

# Payment
ASAAS_API_KEY=your-asaas-api-key
ASAAS_WEBHOOK_SECRET=your-webhook-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-new-relic-key
```

### Anexo B: Port Allocation

| Service | Port | Protocol | Description |
|---------|------|----------|-------------|
| Storefront | 3000 | HTTP | Next.js dev server |
| Medusa Backend | 9000 | HTTP | Medusa API |
| Medusa Admin | 7001 | HTTP | Admin dashboard |
| HaaS API | 8000 | HTTP | FastAPI server |
| PostgreSQL | 5432 | TCP | Database |
| Redis | 6379 | TCP | Cache & sessions |
| Qdrant | 6333 | HTTP | Vector database |
| Qdrant gRPC | 6334 | gRPC | Vector database |
| MinIO | 9000 | HTTP | S3 API |
| MinIO Console | 9001 | HTTP | Web console |
| Dagster | 3001 | HTTP | Dagit UI |
| PostHog | 8000 | HTTP | Analytics |

### Anexo C: Database Schemas

**Medusa Database:**

- `store` schema: Products, orders, customers
- `public` schema: Migrations, sessions

**HaaS Database:**

- `public` schema: Users, projects, documents
- `monitoring` schema: Metrics, alerts

**Qdrant Collections:**

- `products`: Product embeddings (dim=1536)
- `documents`: Document embeddings (dim=1536)
- `concessionarias`: Concessionária data (dim=384)

---

**End of Document**
