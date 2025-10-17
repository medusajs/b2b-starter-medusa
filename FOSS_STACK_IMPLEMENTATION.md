# FOSS Stack Implementation Guide

Guia passo-a-passo para implementar o full FOSS stack localmente.

## ⚡ 5 Minute Quick Start

### 1. Pré-requisitos
```powershell
# Instalar Docker Desktop (inclui Docker Engine + Compose)
# https://www.docker.com/products/docker-desktop

# Verificar instalação
docker --version
docker-compose --version

# Output esperado:
# Docker version 25.0+
# Docker Compose version 2.20+
```

### 2. Clone & Setup
```powershell
cd c:\Users\fjuni\OneDrive\Documentos\GitHub\ysh-b2b

# Criar arquivo de ambiente
@'
# Stack Configuration
ENVIRONMENT=development
COMPOSE_FILE=docker-compose.multi-cloud.yml

# Database
DB_USER=postgres
DB_PASSWORD=postgres_secure_password_123
DB_NAME=ysh_b2b

# Redis
REDIS_PASSWORD=redis_secure_password_456

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minio_secure_password_789

# Vault
VAULT_TOKEN=hvs.CAESILmkTQ8DGtgJvwJl7i-example

# Keycloak
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=keycloak_secure_password

# Application
APP_PORT=3000
NODE_ENV=development
LOG_LEVEL=info
'@ | Set-Content .env.multicloud -Encoding UTF8

# Source environment
$env:COMPOSE_FILE="docker-compose.multi-cloud.yml"
```

### 3. Start Services
```powershell
# Iniciar todos os serviços
docker-compose up -d

# Aguardar 30 segundos para tudo iniciar
Start-Sleep -Seconds 30

# Verificar status
docker-compose ps

# Deve mostrar: postgres, redis, minio, vault, etc (all Up)
```

### 4. Verify Services
```powershell
# Testar conectividade
curl http://localhost:9000/health          # Backend API
curl http://localhost:8000                 # Storefront
curl http://localhost:9001                 # MinIO Console
curl http://localhost:3000                 # Grafana

# Acessar em browser
# Grafana: http://localhost:3000 (admin/admin)
# MinIO: http://localhost:9001 (minioadmin/minio_password)
# Jaeger: http://localhost:16686
```

---

## 🏗️ Arquitetura em Detalhes

### Database Tier

#### PostgreSQL Primary
- **Porta**: 5432
- **User**: postgres
- **Config**: Max 200 connections, shared_buffers=4GB
- **Replication**: Streaming replication para Standby

#### PostgreSQL Standby (Hot Standby)
- **Porta**: 5433
- **Modo**: Read-only replication
- **Failover**: Manual (pgBouncer pode ser configurado para automático)

#### pgBouncer (Connection Pool)
- **Porta**: 6432
- **Pool Size**: 25 connections
- **Mode**: Transaction pooling
- **Benefício**: Evita exaustão de conexões

#### Redis Master + Replica
- **Porta Master**: 6379
- **Porta Replica**: 6380
- **Sentinel**: Porta 26379 (para failover automático)
- **Capacidade**: 100GB+ em-memória

---

### Storage & Object Layer

#### MinIO (S3-compatible)
```powershell
# Criar buckets
docker-compose exec minio mc alias set local http://localhost:9000 minioadmin minio_password
docker-compose exec minio mc mb local/ysh-products
docker-compose exec minio mc mb local/ysh-backups
docker-compose exec minio mc mb local/ysh-logs

# Ativar versionamento
docker-compose exec minio mc version enable local/ysh-products

# Ativar replicação (opcional)
docker-compose exec minio mc replicate add local/ysh-products aws/ysh-products --priority 1
```

#### DuckDB (Analytics)
```powershell
# Criar conexão para analytical queries
# DuckDB automaticamente processa Parquet files do S3
```

#### Qdrant (Vector Database)
- **Porta**: 6333 (HTTP), 6334 (gRPC)
- **Use Case**: Embeddings, semantic search
- **Collections**: Criadas dinamicamente via API

---

### Application Tier

#### Backend API (Node.js)
```powershell
# Build imagem local
cd backend
docker build -t ysh-backend:latest .

# Ou usar pre-built a partir de docker-compose
docker-compose up -d backend

# Logs
docker-compose logs -f backend

# Health check
curl http://localhost:9000/health
```

#### Storefront (Next.js)
```powershell
# Acessar em http://localhost:8000

# Rebuild estática
docker-compose exec storefront npm run build

# Forçar rebuild de container
docker-compose up -d --build storefront
```

#### FastAPI (ML Services)
```powershell
# Python-based API para embeddings, predictions
# Porta: 8001
# Docs: http://localhost:8001/docs
```

---

### Observability Stack

#### Prometheus
```powershell
# Porta: 9090
# Acessar: http://localhost:9090

# Queries úteis:
# - up{job="backend"} : Status de serviços
# - rate(http_requests_total[5m]) : Taxa de requisições
# - histogram_quantile(0.95, http_request_duration) : p95 latency
```

#### Grafana
```powershell
# Porta: 3000
# Login: admin / admin (MUDAR senha em produção!)

# Dashboards inclusos:
# - System Overview (CPU, memory, disk)
# - Docker Containers (utilização)
# - PostgreSQL Metrics (queries, connections)
# - Application Performance (latency, errors)
# - Business Metrics (revenue, orders)
```

#### Jaeger
```powershell
# Porta: 16686
# Acessar: http://localhost:16686

# Visualizar traces por serviço:
# - backend (node.js)
# - storefront (next.js)
# - fastapi (python)
```

#### Loki
```powershell
# Porta: 3100
# Log aggregation + search

# Queries:
# {job="backend"} | json | status="error"
# {container_name="postgres"} | regexp "slow query"
```

---

## 🔐 Security & Secrets Management

### Vault Setup

```powershell
# Inicializar Vault (primeira vez apenas)
docker-compose exec vault vault operator init -key-shares=3 -key-threshold=2

# Guardar as unseal keys em local seguro!
# Backup: c:\Users\fjuni\Secure\vault-keys.txt (com permissões restritas)

# Unsealing (necessário após restart)
docker-compose exec vault vault operator unseal <key-1>
docker-compose exec vault vault operator unseal <key-2>

# Autenticar com root token
docker-compose exec vault vault login <root-token>

# Armazenar database credentials
docker-compose exec vault vault kv put secret/ysh-b2b/postgres \
  username=postgres \
  password=postgres_secure_password_123 \
  host=postgres-primary \
  port=5432 \
  database=ysh_b2b

# Armazenar API keys
docker-compose exec vault vault kv put secret/ysh-b2b/integrations \
  asaas_token=xxxxxxx \
  aneel_api_key=xxxxxxx \
  openai_api_key=xxxxxxx

# Verificar secrets
docker-compose exec vault vault kv get secret/ysh-b2b/postgres
```

### Keycloak Setup

```powershell
# Acessar: http://localhost:8080
# Login: admin / keycloak_password

# Criar realm "ysh-b2b"
# 1. Sidebar > Realms > Create realm
# 2. Name: ysh-b2b
# 3. Enabled: ON
# 4. Create

# Criar roles
# 1. Realm roles > Create role
#    - company-admin
#    - company-employee
#    - merchant-operator

# Criar usuário de teste
# 1. Users > Create user
#    - Username: fernando@yellosolarhub.com
#    - Email: fernando@yellosolarhub.com
#    - First name: Fernando
#    - Last name: Juniorr
#    - Enabled: ON
# 2. Credentials > Set password
# 3. Role mapping: company-admin

# Configurar OpenID Connect
# 1. Clients > Create client
#    - Client ID: ysh-web
#    - Protocol: openid-connect
# 2. Settings:
#    - Valid redirect URIs: http://localhost:8000/*
#    - Valid post logout URIs: http://localhost:8000/login
```

---

## 📊 Data Pipeline Setup

### Pathway (Real-time ETL)

```powershell
# Iniciar workers
docker-compose exec backend npm run start:pathway

# Monitorar eventos
# Logs: docker-compose logs -f backend | Select-String pathway
```

### Dagster (Orchestration)

```powershell
# Acessar UI: http://localhost:3001
# Usuário: devuser
# Senha: devuser

# Criar job de sincronização diária
# 1. Assets > solar_revenue
# 2. Materialize
# 3. Verificar logs em "Runs"
```

### Airflow (Scheduler)

```powershell
# Acessar UI: http://localhost:8080 (Airflow, não Keycloak)
# Usuário: airflow
# Senha: airflow

# DAGs inclusos:
# - daily_data_sync (2 AM UTC)
# - solar_revenue_calculation (1 AM UTC)
# - asaas_transaction_sync (every 6 hours)
```

---

## 🧪 Testing & Load Testing

### Unit Tests
```powershell
cd backend
npm test                        # Run all tests
npm test -- --coverage         # Com coverage report
npm test -- --watch           # Watch mode

# Esperado: >80% coverage
```

### Integration Tests
```powershell
npm run test:integration       # Testes com DB real
npm run test:http             # Testes de rotas API
```

### Load Testing (k6)
```powershell
# Instalar k6
# https://k6.io/docs/getting-started/installation/

# Criar teste
@'
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '2m', target: 100 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  const res = http.post('http://localhost:9000/api/carts/add-item', {
    product_id: 'solar-panel-600w',
    quantity: 5,
  });
  
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
'@ | Set-Content load-test.js -Encoding UTF8

# Executar
k6 run load-test.js
```

---

## 🔄 Database Operations

### Backup & Restore

```powershell
# Backup completo
docker-compose exec postgres pg_dump -U postgres ysh_b2b > backup_$(Get-Date -Format 'yyyy-MM-dd_HHmmss').sql

# Restaurar
docker-compose exec -T postgres psql -U postgres < backup.sql

# Backup com compressão (mais rápido)
docker-compose exec postgres pg_dump -U postgres -F c ysh_b2b > backup.dump

# Restaurar dump comprimido
docker-compose exec -T postgres pg_restore -U postgres -d ysh_b2b < backup.dump
```

### Migration Management

```powershell
# Listar migrações aplicadas
docker-compose exec postgres psql -U postgres -d ysh_b2b -c "SELECT * FROM schema_migrations;"

# Rollback última migração (Medusa)
docker-compose exec backend npm run medusa migration:revert
```

### Replication Monitoring

```powershell
# Status da replicação
docker-compose exec postgres psql -U postgres -c "SELECT slot_name, restart_lsn, confirmed_flush_lsn FROM pg_replication_slots;"

# Verificar lag do standby
docker-compose exec postgres psql -U postgres -c "SELECT pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) / 1024 / 1024 AS replication_lag_mb;"
```

---

## 🚀 Deployment to Multi-Cloud

### LocalStack (AWS Emulation)
```powershell
# Verificar LocalStack status
docker-compose exec localstack awslocal s3 ls

# Criar bucket
docker-compose exec localstack awslocal s3 mb s3://ysh-test-bucket

# Upload de arquivo
docker-compose exec localstack awslocal s3 cp /tmp/data.json s3://ysh-test-bucket/

# Criar tabela DynamoDB
docker-compose exec localstack awslocal dynamodb create-table `
  --table-name companies `
  --attribute-definitions AttributeName=company_id,AttributeType=S `
  --key-schema AttributeName=company_id,KeyType=HASH `
  --billing-mode PAY_PER_REQUEST
```

### OpenTofu (IaC)

```powershell
# Inicializar Terraform state
cd terraform
tofu init

# Validar configuration
tofu validate

# Plan (ver o que será criado)
tofu plan -out=tfplan

# Apply
tofu apply tfplan

# Verificar resources criados
tofu show
```

---

## 🛠️ Troubleshooting

### Services não iniciam

```powershell
# Verificar logs
docker-compose logs postgres    # Ver erro específico

# Limpar volumes e tentar novamente
docker-compose down -v
docker-compose up -d
```

### Database connection errors

```powershell
# Verificar conectividade
docker-compose exec backend npm run test:db-connection

# Testar diretamente com psql
docker-compose exec postgres psql -U postgres -c "SELECT version();"
```

### Memory/Disk issues

```powershell
# Ver espaço em disco
docker system df

# Limpar Docker dangling
docker system prune -a

# Aumentar Docker Desktop memory
# Settings > Resources > Memory = 8GB+
```

### Slow queries

```powershell
# Ativar query logging
docker-compose exec postgres psql -U postgres -c "ALTER SYSTEM SET log_min_duration_statement = 1000;"

# Reiniciar PostgreSQL
docker-compose restart postgres

# Ver slow queries
docker-compose logs postgres | Select-String "duration:"
```

---

## 📈 Monitoring Checklist

Verificações mensais recomendadas:

- [ ] Backup status e teste de restore
- [ ] Database replication lag < 1 segundo
- [ ] Disk usage < 80%
- [ ] API latency p95 < 100ms
- [ ] Error rate < 1%
- [ ] Secrets rotação (senhas, API keys)
- [ ] Security patches (Docker, PostgreSQL, Node.js)
- [ ] Logs centralization (Loki)
- [ ] Alertas configurados e testados

---

## 🎯 Next Steps

1. **Completar setup local** (45 minutos)
   - Iniciar stack
   - Verificar todos os serviços
   - Rodar testes

2. **Familiar com ferramentas** (1-2 horas)
   - Explorar Grafana dashboards
   - Fazer queries Prometheus
   - Verificar Jaeger traces

3. **Configurar CI/CD** (2-3 horas)
   - GitHub Actions
   - Build docker images
   - Deploy staging

4. **Load testing** (1 hora)
   - K6 tests
   - Identificar gargalos
   - Otimizar

5. **Deploy Production** (4-8 horas)
   - OpenTofu apply
   - Database migration
   - Smoke tests
   - Monitoring setup

---

**Próxima etapa**: Abrir `FOSS_STACK_COMPLETE.md` para detalhes técnicos avançados.
