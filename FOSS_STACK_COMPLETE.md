# FOSS Stack Completo - YSH B2B Máxima Performance & Eficácia

**Última atualização**: October 17, 2025  
**Objetivo**: Stack 100% FOSS com performance enterprise-grade, zero vendor lock-in, multi-cloud ready

---

## 📋 Índice Rápido

1. [Stack Resumido](#stack-resumido)
2. [Infraestrutura](#infraestrutura)
3. [Banco de Dados & Armazenamento](#banco-de-dados--armazenamento)
4. [Observabilidade](#observabilidade)
5. [Segurança](#segurança)
6. [Development & Testing](#development--testing)
7. [Data & AI](#data--ai)
8. [Deployment & Orchestração](#deployment--orchestração)
9. [Mapeamento Cloud Provider](#mapeamento-cloud-provider)
10. [Benchmarks & Performance](#benchmarks--performance)
11. [Roadmap de Implementação](#roadmap-de-implementação)

---

## Stack Resumido

```
┌─────────────────────────────────────────────────────────────────┐
│                    YSH B2B FOSS STACK                           │
├─────────────────────────────────────────────────────────────────┤
│ INFRAESTRUTURA                                                   │
│ ├─ Docker + Docker Compose (Containerização)                    │
│ ├─ Kubernetes + Helm (Orquestração - opcional escala)           │
│ ├─ OpenTofu + Ansible (IaC + Config Management)                 │
│ └─ HashiCorp Nomad (Scheduler alternativo para Kubernetes)      │
│                                                                   │
│ BANCO DE DADOS                                                   │
│ ├─ PostgreSQL 16 + pgBouncer (RDBMS)                            │
│ ├─ Redis 7 + Sentinel (Cache + Pub/Sub)                         │
│ ├─ Qdrant (Vector DB para RAG/AI)                               │
│ ├─ MinIO (S3-compatível Object Storage)                         │
│ ├─ Cassandra (NoSQL - escalabilidade horizontal)                │
│ └─ DuckDB (Analytics local, SQL em Parquet)                     │
│                                                                   │
│ OBSERVABILIDADE                                                  │
│ ├─ Prometheus (Métricas)                                         │
│ ├─ Grafana (Visualização)                                        │
│ ├─ Jaeger (Tracing Distribuído)                                 │
│ ├─ OpenTelemetry (Instrumentação)                               │
│ ├─ Loki (Log Aggregation)                                        │
│ └─ AlertManager (Alerting)                                       │
│                                                                   │
│ SEGURANÇA                                                        │
│ ├─ HashiCorp Vault (Secrets Management)                         │
│ ├─ Keycloak (Identity & Access Management)                      │
│ ├─ NGINX (Reverse Proxy + WAF)                                  │
│ ├─ Fail2Ban (Rate Limiting & Bot Protection)                    │
│ └─ OpenSSL/Let's Encrypt (TLS/Certificados)                     │
│                                                                   │
│ DATA & AI                                                        │
│ ├─ Pathway (Streaming ETL Real-time)                            │
│ ├─ Dagster (Data Orchestration)                                 │
│ ├─ Apache Airflow (Workflow Scheduler)                          │
│ ├─ dbt (Data Transformation)                                     │
│ ├─ Ollama (LLM Local - offline-first)                           │
│ ├─ LangChain (LLM Orchestration)                                │
│ └─ FastAPI (ML Model Serving)                                    │
│                                                                   │
│ MESSAGE QUEUE & STREAMING                                        │
│ ├─ RabbitMQ (Message Broker)                                     │
│ ├─ Apache Kafka (Event Streaming)                               │
│ ├─ Apache Pulsar (Alternative ao Kafka)                         │
│ └─ Redis Streams (Lightweight Streaming)                         │
│                                                                   │
│ DEPLOYMENT                                                       │
│ ├─ Serverless Framework (Multi-cloud serverless)                │
│ ├─ AWS SAM / Azure Functions (local emulation)                  │
│ ├─ LocalStack (AWS emulation completa)                          │
│ ├─ Azurite (Azure Storage emulation)                            │
│ └─ Fake GCS Server (GCP Storage emulation)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Infraestrutura

### 🐋 Containerização & Orchestração

| Ferramenta | Função | Performance | Alternativas |
|-----------|--------|------------|--------------|
| **Docker Engine** | Containerização | ⭐⭐⭐⭐⭐ | Podman, containerd |
| **Docker Compose** | Multi-container local | ⭐⭐⭐⭐⭐ | Podman Compose |
| **Kubernetes** | Orquestração producción (opcional) | ⭐⭐⭐⭐⭐ | Docker Swarm, Nomad |
| **Helm** | Kubernetes package manager | ⭐⭐⭐⭐ | Kustomize, ArgoCD |
| **kind/minikube** | Local Kubernetes testing | ⭐⭐⭐⭐ | Colima, MicroK8s |

**Configuração Recomendada**:
```dockerfile
# Dockerfile otimizado (multi-stage)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]

# Build: docker build -t app:latest --compress .
# Run: docker run --rm -v app_data:/data app:latest
```

**Limites de Recursos** (docker-compose):
```yaml
services:
  backend:
    image: app:latest
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

---

### 🔧 Infrastructure as Code (IaC)

#### OpenTofu (Terraform Alternative - 100% FOSS)

**Vantagens**:
- ✅ Terraform-compatible syntax
- ✅ No license restrictions (Linux Foundation)
- ✅ Multi-cloud: AWS, Azure, GCP, Alibaba, Huawei
- ✅ State management (Terraform Cloud alternative: Spacelift)
- ✅ Module ecosystem (Registry OpenTofu)

**Exemplo - AWS Multi-region**:
```hcl
# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# RDS PostgreSQL
resource "aws_rds_cluster" "postgres" {
  cluster_identifier      = "ysh-db-${var.environment}"
  engine                  = "aurora-postgresql"
  engine_version          = "16.2"
  database_name           = "ysh_b2b"
  master_username         = var.db_user
  master_password         = random_password.db_password.result
  backup_retention_period = 30
  skip_final_snapshot     = false
  final_snapshot_identifier = "ysh-db-final-${var.environment}-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  
  tags = {
    Environment = var.environment
    ManagedBy   = "opentofu"
  }
}

# S3 para MinIO compatível
resource "aws_s3_bucket" "minio_compat" {
  bucket = "ysh-minio-${var.environment}-${data.aws_caller_identity.current.account_id}"
  
  tags = {
    Purpose = "S3-compatible-storage"
  }
}

# Outputs
output "rds_endpoint" {
  value = aws_rds_cluster.postgres.endpoint
}

output "s3_bucket" {
  value = aws_s3_bucket.minio_compat.id
}
```

**Configuração com múltiplos clouds**:
```hcl
# providers.tf
variable "cloud_provider" {
  type    = string
  default = "aws"
  # Valores: "aws", "azure", "gcp", "alibaba"
}

# Definir providers baseado em variável
provider "aws" {
  count  = var.cloud_provider == "aws" ? 1 : 0
  region = var.aws_region
}

provider "azurerm" {
  count           = var.cloud_provider == "azure" ? 1 : 0
  features {}
}

provider "google" {
  count   = var.cloud_provider == "gcp" ? 1 : 0
  project = var.gcp_project
}
```

#### Ansible (Configuration Management)

**Playbook para setup inicial**:
```yaml
# playbook-setup.yml
---
- name: Setup YSH B2B Environment
  hosts: all
  become: yes
  vars:
    docker_version: "25.0"
    postgres_version: "16"
  
  tasks:
    - name: Update system packages
      apt:
        update_cache: yes
        upgrade: dist
    
    - name: Install Docker
      shell: |
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
    
    - name: Add user to docker group
      user:
        name: "{{ ansible_user }}"
        groups: docker
        append: yes
    
    - name: Create application directories
      file:
        path: "{{ item }}"
        state: directory
        mode: '0755'
      loop:
        - /opt/ysh-b2b
        - /opt/ysh-b2b/data
        - /opt/ysh-b2b/config
    
    - name: Deploy docker-compose.yml
      template:
        src: docker-compose.multi-cloud.yml.j2
        dest: /opt/ysh-b2b/docker-compose.yml
        mode: '0644'
    
    - name: Start services
      shell: cd /opt/ysh-b2b && docker-compose up -d
```

---

## Banco de Dados & Armazenamento

### PostgreSQL 16 (Relacional)

**Configuração Otimizada**:
```sql
-- postgresql.conf
max_connections = 200
shared_buffers = 4GB              # 25% RAM
effective_cache_size = 12GB       # 75% RAM
maintenance_work_mem = 1GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1            # Para SSD
work_mem = 10MB
min_wal_size = 1GB
max_wal_size = 4GB
```

**pgBouncer para Connection Pooling**:
```ini
# pgbouncer.ini
[databases]
ysh_b2b = host=localhost port=5432 dbname=ysh_b2b

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 10
reserve_pool_size = 5
reserve_pool_timeout = 3

# Logging
log_connections = 1
log_disconnections = 1
log_pooler_errors = 1
```

**Replicação HA**:
```yaml
# Docker Compose - PostgreSQL HA com replication
version: '3.9'
services:
  postgres-primary:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ysh_b2b
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    command:
      - "postgres"
      - "-c"
      - "wal_level=replica"
      - "-c"
      - "max_wal_senders=10"
      - "-c"
      - "hot_standby=on"
    volumes:
      - postgres_primary_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  postgres-replica:
    image: postgres:16-alpine
    environment:
      PGUSER: postgres
      PGPASSWORD: ${DB_PASSWORD}
    command:
      - "bash"
      - "-c"
      - |
        pg_basebackup -h postgres-primary -D /var/lib/postgresql/data -U postgres -v -P -W
        echo "standby_mode = 'on'" >> /var/lib/postgresql/recovery.conf
        postgres
    depends_on:
      - postgres-primary
    volumes:
      - postgres_replica_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"

volumes:
  postgres_primary_data:
  postgres_replica_data:
```

### Redis 7 (Cache + Pub/Sub)

**Configuração Cluster (HA)**:
```yaml
redis-cluster:
  image: redis:7-alpine
  command: redis-server
    --cluster-enabled yes
    --cluster-config-file /data/nodes.conf
    --cluster-node-timeout 5000
    --appendonly yes
    --appendfsync everysec
  volumes:
    - redis_cluster_data:/data
  networks:
    - ysh-network
```

**Sentinel para Failover**:
```conf
# sentinel.conf
port 26379
dir /data
sentinel monitor mymaster 127.0.0.1 6379 2
sentinel down-after-milliseconds mymaster 30000
sentinel parallel-syncs mymaster 1
sentinel failover-timeout mymaster 180000
```

### MinIO (S3-compatible)

**Deploy com High Availability**:
```yaml
minio:
  image: minio/minio:latest
  command: minio server http://minio-{1...4}:9000/data --console-address ":9001"
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    MINIO_DOMAIN: minio.local
  volumes:
    - minio_data_1:/data
  ports:
    - "9000:9000"
    - "9001:9001"
```

**Replicação Cross-Bucket**:
```bash
# Setup replicação entre MinIO e AWS S3
mc alias set minio http://localhost:9000 minioadmin password
mc alias set aws https://s3.amazonaws.com ${AWS_KEY} ${AWS_SECRET}

# Ativar replicação
mc replicate add minio/ysh-products aws/ysh-products-backup --priority 1
mc replicate status minio/ysh-products
```

### Qdrant (Vector Database)

**Para RAG & Semantic Search**:
```docker
qdrant:
  image: qdrant/qdrant:latest
  environment:
    QDRANT_API_KEY: ${QDRANT_API_KEY}
  volumes:
    - qdrant_data:/qdrant/storage
  ports:
    - "6333:6333"  # HTTP
    - "6334:6334"  # gRPC
```

**Exemplo - Indexar produtos**:
```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

client = QdrantClient("localhost", port=6333)

# Criar collection
client.recreate_collection(
    collection_name="products",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
)

# Inserir embeddings (via OpenAI API ou Ollama)
points = [
    PointStruct(
        id=1,
        vector=[...embeddings...],  # 1536-dim para text-embedding-3-large
        payload={"product_id": "solar-panel-600w", "category": "panels"}
    ),
    # ... mais produtos
]

client.upsert(
    collection_name="products",
    points=points,
)

# Buscar similares
results = client.search(
    collection_name="products",
    query_vector=[...query_embedding...],
    limit=5
)
```

### DuckDB (Analytics Local)

**Para processamento rápido**:
```python
import duckdb

# Query em Parquet sem carregar em memória
result = duckdb.sql("""
    SELECT 
        category,
        COUNT(*) as product_count,
        AVG(price) as avg_price,
        SUM(monthly_revenue) as total_revenue
    FROM read_parquet('s3://ysh-data/products/data_*.parquet')
    WHERE category IN ('solar', 'financing', 'financing')
    GROUP BY category
    ORDER BY total_revenue DESC
""")

result.show()

# Exportar resultado
result.to_parquet('report.parquet')
result.to_csv('report.csv')
```

---

## Observabilidade

### Prometheus (Métricas)

**prometheus.yml otimizado**:
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'ysh-b2b'
    environment: 'production'

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'docker'
    static_configs:
      - targets: ['localhost:9323']
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
  
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
  
  - job_name: 'minio'
    metrics_path: /minio/v2/metrics/cluster
    static_configs:
      - targets: ['minio:9000']
  
  - job_name: 'app-backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/metrics'

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - 'alerts/*.yml'
```

**Alertas Críticos**:
```yaml
# alerts/app-alerts.yml
groups:
  - name: Application
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"
      
      - alert: DatabaseConnectionPoolExhausted
        expr: pgbouncer_client_connections / pgbouncer_pool_size > 0.9
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Database pool near capacity"
```

### Grafana (Dashboards)

**Dashboards Essenciais**:
1. **Sistema**: CPU, Memória, Disco, Network
2. **Docker**: Uso de containers, I/O
3. **PostgreSQL**: Queries, Connection pools, Replication lag
4. **Redis**: Memory, Keys, Commands/sec
5. **Aplicação**: Request latency, Error rates, Custom business metrics
6. **Negócio**: Revenue, Order volume, Cart abandonment

**Alertas em Grafana**:
```yaml
- alert: DatabaseReplicationLag
  condition: pg_replication_lag_seconds > 10
  frequency: 1m
  handler: email

- alert: HighCPUUsage
  condition: node_cpu_usage_percent > 80
  frequency: 5m
  handler: slack
```

### Jaeger (Distributed Tracing)

**Docker Compose**:
```yaml
jaeger:
  image: jaegertracing/all-in-one:latest
  environment:
    COLLECTOR_OTLP_ENABLED: 'true'
  ports:
    - "6831:6831/udp"
    - "16686:16686"  # UI
  volumes:
    - jaeger_data:/badger/data
```

**Instrumentação Node.js**:
```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-trace-jaeger';

const jaegerExporter = new JaegerExporter({
  endpoint: 'http://jaeger:14268/api/traces',
});

const sdk = new NodeSDK({
  traceExporter: jaegerExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

### Loki (Log Aggregation)

**Promtail config**:
```yaml
# promtail-config.yaml
clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: docker
    docker: {}
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        target_label: 'container'
      - source_labels: ['__meta_docker_container_label_app']
        target_label: 'app'
```

---

## Segurança

### HashiCorp Vault (Secrets Management)

**Docker Compose**:
```yaml
vault:
  image: vault:latest
  environment:
    VAULT_DEV_ROOT_TOKEN_ID: ${VAULT_TOKEN}
    VAULT_DEV_LISTEN_ADDRESS: "0.0.0.0:8200"
  ports:
    - "8200:8200"
  volumes:
    - vault_data:/vault/data
```

**Armazenar secrets**:
```bash
# Login
vault login ${VAULT_TOKEN}

# Armazenar database credentials
vault kv put secret/ysh-b2b/postgres \
  username=postgres \
  password=${DB_PASSWORD} \
  host=postgres-primary \
  port=5432

# Armazenar API keys
vault kv put secret/ysh-b2b/integrations \
  asaas_key=${ASAAS_KEY} \
  aneel_api_key=${ANEEL_KEY}
```

**Aplicação lê secrets**:
```python
# backend/src/config/vault.py
import hvac

class VaultConfig:
    def __init__(self):
        self.client = hvac.Client(url='http://vault:8200', token=os.getenv('VAULT_TOKEN'))
    
    def get_db_credentials(self):
        response = self.client.secrets.kv.read_secret_version(
            path='ysh-b2b/postgres'
        )
        return response['data']['data']
    
    def get_integration_keys(self):
        response = self.client.secrets.kv.read_secret_version(
            path='ysh-b2b/integrations'
        )
        return response['data']['data']

vault_config = VaultConfig()
db_creds = vault_config.get_db_credentials()
```

### Keycloak (Identity & Access Management)

**Docker Compose**:
```yaml
keycloak:
  image: quay.io/keycloak/keycloak:23.0.0
  environment:
    KEYCLOAK_ADMIN: admin
    KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_PASSWORD}
    KC_DB: postgres
    KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
    KC_DB_USERNAME: postgres
    KC_DB_PASSWORD: ${DB_PASSWORD}
  ports:
    - "8080:8080"
  depends_on:
    - postgres
```

**Configurar realm & roles**:
```bash
# Criar realm YSH
curl -X POST \
  http://keycloak:8080/admin/realms \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "realm": "ysh-b2b",
    "enabled": true,
    "loginTheme": "keycloak"
  }'

# Criar roles
curl -X POST \
  http://keycloak:8080/admin/realms/ysh-b2b/roles \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "company-admin",
    "description": "Company Administrator"
  }'
```

### NGINX (Reverse Proxy + WAF)

**nginx.conf**:
```nginx
upstream backend {
    least_conn;
    server backend:3000 max_fails=3 fail_timeout=30s;
    server backend:3001 max_fails=3 fail_timeout=30s;
}

upstream storefront {
    least_conn;
    server storefront:3000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name _;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ysh-b2b.local;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.3 TLSv1.2;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=50r/s;
    
    # API backend
    location /api/ {
        limit_req zone=api_limit burst=200 nodelay;
        
        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        
        # Security headers
        add_header X-Content-Type-Options nosniff always;
        add_header X-Frame-Options DENY always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Storefront
    location / {
        limit_req zone=general_limit burst=50 nodelay;
        proxy_pass http://storefront;
        proxy_set_header Host $host;
    }
    
    # Health checks (não logar)
    location /health {
        access_log off;
        proxy_pass http://backend;
    }
}
```

---

## Development & Testing

### Jest (Testing Framework)

**jest.config.js otimizado**:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
  maxWorkers: '50%',  // Para CI não sobrecarregar
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
};
```

**Teste de integração DB**:
```typescript
describe('Database Integration', () => {
  let pool: Pool;
  
  beforeAll(async () => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL_TEST,
    });
  });
  
  afterAll(async () => {
    await pool.end();
  });
  
  it('should insert and retrieve company', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const result = await client.query(
        'INSERT INTO companies (name, spending_limit) VALUES ($1, $2) RETURNING *',
        ['Test Company', 10000]
      );
      
      expect(result.rows[0].name).toBe('Test Company');
      
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  });
});
```

### Load Testing (k6)

**Teste de carga para cart**:
```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },   // ramp up
    { duration: '2m', target: 100 },    // stay
    { duration: '30s', target: 0 },     // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`,
  };
  
  // Add to cart
  const addRes = http.post(
    'http://localhost:3000/api/carts/add-item',
    JSON.stringify({
      product_id: `solar-${Math.floor(Math.random() * 100)}`,
      quantity: 5,
    }),
    { headers }
  );
  
  check(addRes, {
    'add item status 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

**Executar**:
```bash
k6 run load-test.js --vus 10 --duration 60s
```

---

## Data & AI

### Pathway (Streaming ETL)

**Real-time product catalog sync**:
```python
# data-platform/pathway/pipelines/product_sync.py
import pathway as pw

# Fonte: webhooks de novos produtos
@pw.udf
def process_product(product: dict) -> dict:
    return {
        'id': product['id'],
        'name': product['name'],
        'price': float(product['price']),
        'categories': product.get('tags', []),
        'embedding_needed': True,
    }

# Conectar a source
products = pw.demo.range(1000).select(
    id=pw.this.id,
    name=pw.apply(lambda x: f"Product {x}"),
    price=pw.apply(lambda x: x * 10),
)

# Transformar
processed = products.select(
    **process_product(products.select(
        id=pw.this.id,
        name=pw.this.name,
        price=pw.this.price,
        tags=pw.this.tags
    ))
)

# Output para Qdrant
processed.to_append_only_sql(
    host="localhost",
    dbname="ysh_b2b",
    table="product_embeddings_queue",
)

pw.run()
```

### Dagster (Data Orchestration)

**Orquestração de pipelines diários**:
```python
# data-platform/dagster/jobs/daily_sync.py
from dagster import job, op, schedule, In, Out, DynamicOut, DynamicOutput
from datetime import datetime, timedelta
import requests
import pandas as pd

@op
def fetch_aneel_data() -> dict:
    """Busca dados de tarifas de energia ANEEL"""
    resp = requests.get(
        'https://www2.aneel.gov.br/api/tariffs',
        params={'format': 'json'}
    )
    return resp.json()

@op
def fetch_asaas_transactions(context) -> pd.DataFrame:
    """Busca transações do gateway Asaas"""
    headers = {'access_token': os.getenv('ASAAS_TOKEN')}
    resp = requests.get(
        'https://api.asaas.com/v3/transactions',
        params={'limit': 1000},
        headers=headers
    )
    return pd.DataFrame(resp.json()['data'])

@op
def transform_tariffs(tariffs: dict) -> pd.DataFrame:
    df = pd.DataFrame(tariffs['tariffs'])
    df['effective_date'] = pd.to_datetime(df['effective_date'])
    return df

@op
def load_to_warehouse(tariffs_df: pd.DataFrame, transactions_df: pd.DataFrame):
    """Carrega dados no data warehouse"""
    engine = create_engine(os.getenv('DATA_WAREHOUSE_URL'))
    
    tariffs_df.to_sql('tariffs_hourly', engine, if_exists='append', index=False)
    transactions_df.to_sql('asaas_transactions', engine, if_exists='append', index=False)
    
    return {"tariffs_loaded": len(tariffs_df), "transactions_loaded": len(transactions_df)}

@job
def daily_data_sync():
    tariffs = fetch_aneel_data()
    transactions = fetch_asaas_transactions()
    
    tariffs_transformed = transform_tariffs(tariffs)
    load_to_warehouse(tariffs_transformed, transactions)

@schedule(job=daily_data_sync, cron_schedule="0 2 * * *")
def daily_sync_schedule():
    return {}
```

### Apache Airflow (Workflow Scheduler)

**DAG para processamento solar**:
```python
# data-platform/airflow/dags/solar_revenue.py
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.postgres_operator import PostgresOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'ysh-data',
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
    'depends_on_past': False,
}

dag = DAG(
    'solar_revenue_calculation',
    default_args=default_args,
    schedule_interval='0 1 * * *',  # 1 AM daily
    start_date=datetime(2025, 1, 1),
)

def calculate_daily_revenue():
    """Calcula receita diária solar por cliente"""
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    cur = conn.cursor()
    
    query = """
    WITH daily_generation AS (
      SELECT 
        customer_id,
        DATE(timestamp) as generation_date,
        SUM(kwh_produced) as total_kwh,
        AVG(temperature) as avg_temp
      FROM solar_generation
      WHERE timestamp >= CURRENT_DATE - INTERVAL '1 day'
      GROUP BY customer_id, DATE(timestamp)
    ),
    revenue_calc AS (
      SELECT 
        dg.customer_id,
        dg.generation_date,
        dg.total_kwh,
        dg.total_kwh * t.rate_per_kwh as daily_revenue,
        c.financing_balance,
        (c.financing_balance * t.rate_per_kwh) as estimated_payback_days
      FROM daily_generation dg
      JOIN customers c ON dg.customer_id = c.id
      JOIN tariffs t ON t.region = c.region
    )
    INSERT INTO revenue_summary (customer_id, date, kwh, revenue, financing_balance)
    SELECT customer_id, generation_date, total_kwh, daily_revenue, financing_balance
    FROM revenue_calc
    ON CONFLICT (customer_id, date) DO UPDATE SET
      kwh = EXCLUDED.kwh,
      revenue = EXCLUDED.revenue;
    """
    
    cur.execute(query)
    conn.commit()
    cur.close()
    conn.close()

task_calculate = PythonOperator(
    task_id='calculate_revenue',
    python_callable=calculate_daily_revenue,
    dag=dag,
)

task_alert = PostgresOperator(
    task_id='send_alerts',
    sql="""
    SELECT customer_id, daily_revenue FROM revenue_summary
    WHERE generation_date = CURRENT_DATE
    AND daily_revenue < 5  -- Alerta se < R$5 em receita
    """,
    postgres_conn_id='ysh_b2b_db',
    dag=dag,
)

task_calculate >> task_alert
```

### Ollama (Local LLM)

**Setup local AI**:
```bash
# Baixar modelo Llama2
ollama pull llama2

# Executar servidor
ollama serve

# Em outra terminal, testar
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "Escrever descrição para painel solar 600W"
}'
```

**Integração Python**:
```python
from langchain.llms import Ollama
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

llm = Ollama(model="llama2", base_url="http://ollama:11434")

template = """Escrever uma descrição técnica para este produto solar:
Nome: {product_name}
Potência: {power_w}W
Eficiência: {efficiency}%

Descrição:"""

prompt = PromptTemplate(template=template, input_variables=["product_name", "power_w", "efficiency"])

chain = LLMChain(llm=llm, prompt=prompt)

result = chain.run(
    product_name="Painel Solar Monocristalino",
    power_w=600,
    efficiency=22
)

print(result)
```

---

## Deployment & Orchestração

### LocalStack (AWS Emulation)

**Setup completo AWS local**:
```yaml
# docker-compose.localstack.yml
version: '3.9'

services:
  localstack:
    image: localstack/localstack:3.0
    environment:
      SERVICES: s3,lambda,rds,dynamodb,sqs,sns,cloudwatch,logs,apigateway
      DEBUG: 1
      DATA_DIR: /tmp/localstack/data
      LAMBDA_EXECUTOR: docker
      LOCALSTACK_HOSTNAME: localstack
    ports:
      - "4566:4566"     # LocalStack Gateway
      - "4571:4571"     # ElastiCache
    volumes:
      - ./localstack/init-aws.sh:/docker-entrypoint-initaws.d/init-aws.sh
      - localstack_data:/tmp/localstack
    networks:
      - ysh-network

volumes:
  localstack_data:
```

**Script de inicialização**:
```bash
#!/bin/bash
# localstack/init-aws.sh

# Criar bucket S3
awslocal s3 mb s3://ysh-products-local
awslocal s3api put-bucket-versioning \
  --bucket ysh-products-local \
  --versioning-configuration Status=Enabled

# Criar tabela DynamoDB
awslocal dynamodb create-table \
  --table-name companies \
  --attribute-definitions \
    AttributeName=company_id,AttributeType=S \
  --key-schema \
    AttributeName=company_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# Criar função Lambda
awslocal lambda create-function \
  --function-name ysh-process-order \
  --runtime nodejs20.x \
  --role arn:aws:iam::000000000000:role/lambda-role \
  --handler index.handler \
  --zip-file fileb:///tmp/lambda.zip

# Criar fila SQS
awslocal sqs create-queue --queue-name ysh-orders
awslocal sqs create-queue --queue-name ysh-notifications
```

**Client Node.js para LocalStack**:
```typescript
import AWS from 'aws-sdk';

const s3Client = new AWS.S3({
  endpoint: process.env.NODE_ENV === 'development' 
    ? 'http://localstack:4566' 
    : undefined,
  region: 'us-east-1',
  s3ForcePathStyle: true,
  accessKeyId: 'test',
  secretAccessKey: 'test',
});

// Usar normalmente
await s3Client.putObject({
  Bucket: 'ysh-products-local',
  Key: 'products/solar-panel.json',
  Body: JSON.stringify(productData),
}).promise();
```

### Serverless Framework (Multi-cloud Deployment)

**serverless.yml para AWS + Azure**:
```yaml
service: ysh-b2b-api

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs20.x
  region: ${opt:region, 'us-east-1'}
  environment:
    DATABASE_URL: ${ssm:/ysh-b2b/database-url}
    VAULT_TOKEN: ${ssm:/ysh-b2b/vault-token}
    STAGE: ${self:provider.stage}

functions:
  createOrder:
    handler: src/handlers/order.create
    events:
      - http:
          path: orders
          method: post
          cors: true
          authorizer: validateJWT
    timeout: 30
    memorySize: 512
  
  processQuote:
    handler: src/handlers/quote.process
    events:
      - sqs:
          arn: arn:aws:sqs:${aws:region}:${aws:accountId}:ysh-quotes
          batchSize: 10
    timeout: 60
    memorySize: 1024
  
  generateReport:
    handler: src/handlers/report.generate
    events:
      - schedule:
          rate: cron(0 2 * * ? *)  # 2 AM UTC
          input:
            report_type: daily_revenue
    timeout: 300
    memorySize: 2048

resources:
  Resources:
    YshOrdersQueue:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: ysh-orders
        MessageRetentionPeriod: 1209600  # 14 days
        VisibilityTimeout: 60
    
    YshProductsBucket:
      Type: AWS::S3::Bucket
      Properties:
        BucketName: ysh-products-${self:provider.region}-${self:provider.stage}
        VersioningConfiguration:
          Status: Enabled

plugins:
  - serverless-plugin-typescript
  - serverless-offline
  - serverless-dynamodb-local
```

---

## Mapeamento Cloud Provider

### Multi-cloud Equivalences

| Serviço | AWS | Azure | GCP | MinIO/FOSS | LocalStack |
|---------|-----|-------|-----|------------|-----------|
| **Object Storage** | S3 | Blob | GCS | MinIO | S3 (localstack) |
| **Database** | RDS PostgreSQL | Database for PostgreSQL | Cloud SQL | PostgreSQL | RDS (localstack) |
| **Cache** | ElastiCache | Azure Cache for Redis | Memorystore | Redis | ElastiCache (localstack) |
| **Secrets** | Secrets Manager | Key Vault | Secret Manager | Vault | Secrets Manager (localstack) |
| **Serverless Compute** | Lambda | Functions | Cloud Functions | Ollama/FastAPI | Lambda (localstack) |
| **Message Queue** | SQS | Service Bus | Pub/Sub | RabbitMQ/Kafka | SQS (localstack) |
| **Vector DB** | OpenSearch | Cognitive Search | Vertex AI Search | Qdrant | DynamoDB (vectors) |

### Estratégia de Portabilidade

**Abstração de cloud-specific APIs**:
```typescript
// shared/cloud-providers/interfaces.ts
interface IStorageProvider {
  uploadFile(bucket: string, key: string, body: Buffer): Promise<void>;
  downloadFile(bucket: string, key: string): Promise<Buffer>;
  deleteFile(bucket: string, key: string): Promise<void>;
}

// shared/cloud-providers/aws.ts
export class AWSStorageProvider implements IStorageProvider {
  private s3: S3Client;
  
  async uploadFile(bucket: string, key: string, body: Buffer): Promise<void> {
    await this.s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
    }));
  }
}

// shared/cloud-providers/minio.ts
export class MinIOStorageProvider implements IStorageProvider {
  private minioClient: Client;
  
  async uploadFile(bucket: string, key: string, body: Buffer): Promise<void> {
    await this.minioClient.putObject(bucket, key, body);
  }
}

// shared/cloud-providers/factory.ts
export function getStorageProvider(provider: 'aws' | 'azure' | 'minio'): IStorageProvider {
  switch (provider) {
    case 'aws':
      return new AWSStorageProvider();
    case 'minio':
      return new MinIOStorageProvider();
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
```

---

## Benchmarks & Performance

### Performance Esperada

| Componente | Throughput | Latency | Notes |
|-----------|-----------|---------|-------|
| **PostgreSQL** | 10k-50k qps | <5ms (p95) | Com pgBouncer; SSD required |
| **Redis** | 50k-100k ops/s | <1ms (p95) | Memory-only; use persistence carefully |
| **MinIO** | 5k-10k obj/s | <100ms (p95) | Network-bound; local is best |
| **Qdrant** | 10k-50k vectors/s | <10ms (p95) | HNSW index; depends on dimension |
| **Node.js API** | 1k-5k req/s | <100ms (p95) | Per-instance; add load balancer |
| **DuckDB Analytics** | 1M rows/s | <500ms | Per query; parallel execution |

### Otimizações Críticas

**1. Database**:
```sql
-- Índices essenciais
CREATE INDEX idx_companies_id ON companies(id);
CREATE INDEX idx_orders_company_id ON orders(company_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Análise de queries
EXPLAIN ANALYZE SELECT * FROM orders WHERE company_id = $1 AND created_at > NOW() - INTERVAL '30 days';

-- Vacuum & Analyze
VACUUM ANALYZE;
```

**2. Redis**:
```bash
# Monitorar memória
redis-cli INFO memory

# Evitar keys grandes
# ❌ LPUSH mylist 1000000 items
# ✅ LPUSH mylist:batch1 1000 items
# ✅ LPUSH mylist:batch2 1000 items
```

**3. Node.js**:
```javascript
// cluster mode
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  app.listen(3000);
}
```

---

## Roadmap de Implementação

### Fase 1: Local Development (Semana 1-2)
- ✅ Docker Compose com PostgreSQL, Redis, MinIO
- ✅ Vault para secrets management
- ✅ Prometheus + Grafana para monitoring
- ✅ Jaeger para tracing
- ⏳ Jest + integration tests

### Fase 2: Data & AI Pipeline (Semana 3-4)
- ⏳ Pathway para real-time ETL
- ⏳ Dagster para orchestração
- ⏳ Qdrant para embeddings
- ⏳ Ollama para local LLM
- ⏳ dbt para transformations

### Fase 3: Multi-cloud Ready (Semana 5-6)
- ⏳ OpenTofu configuration
- ⏳ LocalStack + Azurite + Fake GCS
- ⏳ Serverless Framework setup
- ⏳ Cloud provider abstraction layer
- ⏳ Cross-cloud testing

### Fase 4: Production Hardening (Semana 7-8)
- ⏳ Keycloak + OIDC integration
- ⏳ NGINX reverse proxy + WAF
- ⏳ Load testing (k6)
- ⏳ Security audit
- ⏳ Disaster recovery testing

---

## Quick Start Commands

```bash
# Clone repo
git clone https://github.com/own-boldsbrain/ysh-b2b.git
cd ysh-b2b

# Setup environment
cp .env.example .env.multicloud
source .env.multicloud  # or `$env:variable` in PowerShell

# Start full stack
docker-compose -f docker-compose.multi-cloud.yml up -d

# Verify services
docker-compose ps

# Access services
# - Backend API: http://localhost:9000
# - Storefront: http://localhost:8000
# - Grafana: http://localhost:3000 (admin/admin)
# - Jaeger UI: http://localhost:16686
# - Vault UI: http://localhost:8200

# Run tests
cd backend && npm test
cd ../storefront && npm test

# Generate data
docker-compose exec backend npm run seed

# Monitor logs
docker-compose logs -f backend

# Shutdown
docker-compose down -v
```

---

## Conclusão

Este stack FOSS oferece:
- **Performance**: 10k+ RPS, <100ms latency
- **Scalability**: Horizontal scaling com Kubernetes ready
- **Zero Vendor Lock-in**: Substituir qualquer componente
- **Cost**: ~80% economizado vs cloud proprietary
- **Enterprise Ready**: Security, monitoring, HA built-in

**Próximos passos**:
1. Validar em staging com dados reais
2. Implementar blue-green deployments
3. Setup disaster recovery procedures
4. Treinar time em FOSS tools
5. Documentar runbooks operacionais

---

**Mantido por**: Own Bold's Brain  
**Versão**: 1.0.0  
**Licença**: MIT
