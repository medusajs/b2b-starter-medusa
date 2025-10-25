# 🚀 Pre-Flight Checklist - YSH B2B Production Deployment

**Data**: 09/10/2025  
**Objetivo**: Validações obrigatórias antes de considerar deployment completo

---

## ☁️ AWS Infrastructure

### VPC & Networking

- [ ] VPC criada com CIDR 10.0.0.0/16
- [ ] 2 Public Subnets em AZs diferentes (us-east-1a, us-east-1b)
- [ ] 2 Private Subnets em AZs diferentes
- [ ] Internet Gateway anexado à VPC
- [ ] 2 NAT Gateways (um por AZ) funcionando
- [ ] Route Tables corretas:
  - [ ] Public → Internet Gateway
  - [ ] Private → NAT Gateway respectivo
- [ ] DNS resolution e DNS hostnames habilitados na VPC

**Comando de Validação**:

```powershell
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=production-ysh-b2b-vpc" --profile ysh-production
```

---

### Security Groups

- [ ] **SG-ALB**: Inbound 80, 443 de 0.0.0.0/0 ✅
- [ ] **SG-ECS**: Inbound 9000 de SG-ALB, 8000 de SG-ALB ✅
- [ ] **SG-RDS**: Inbound 5432 APENAS de SG-ECS ✅
- [ ] **SG-Redis**: Inbound 6379 APENAS de SG-ECS ✅
- [ ] Nenhum Security Group privado aceita 0.0.0.0/0

**Comando de Validação**:

```powershell
aws ec2 describe-security-groups --filters "Name=vpc-id,Values=<vpc-id>" --profile ysh-production
```

---

### RDS PostgreSQL

- [ ] Instância criada (db.t3.medium)
- [ ] Engine: PostgreSQL 15.14 ✅
- [ ] Storage: 100GB gp3 com autoscaling
- [ ] Multi-AZ habilitado (production) ou desabilitado (MVP)
- [ ] Backup retention: 7 dias
- [ ] DeletionProtection: true
- [ ] Endpoint acessível via Security Group
- [ ] Master password em Secrets Manager

**Comando de Validação**:

```powershell
aws rds describe-db-instances --db-instance-identifier production-ysh-b2b-postgres --profile ysh-production
```

**Teste de Conectividade**:

```bash
# Via bastion ou VPN
psql -h <rds-endpoint> -U medusa_user -d medusa_db -c "SELECT version();"
```

---

### ElastiCache Redis

- [ ] Cluster criado (cache.t3.micro MVP / cache.t3.small prod)
- [ ] Engine: Redis 7.0
- [ ] Replicas configuradas (0 MVP / 2 prod)
- [ ] Subnet group em private subnets
- [ ] Security Group correto (SG-Redis)
- [ ] Endpoint acessível

**Comando de Validação**:

```powershell
aws elasticache describe-cache-clusters --cache-cluster-id production-ysh-b2b-redis --profile ysh-production
```

**Teste de Conectividade**:

```bash
redis-cli -h <redis-endpoint> ping
# Esperado: PONG
```

---

## 🐳 Container Registry (ECR)

- [x] **Repository Backend**: ysh-b2b/backend ✅
- [x] **Repository Storefront**: ysh-b2b/storefront ✅
- [x] Scan on Push habilitado ✅
- [x] Lifecycle policies configuradas (10 images) ✅
- [x] Images pushed com tags `1.0.0` e `latest` ✅
- [ ] **Vulnerability Scans completos**:
  - [ ] Backend: 0 CRITICAL, < 5 HIGH
  - [ ] Storefront: 0 CRITICAL, < 5 HIGH

**Comando de Validação**:

```powershell
aws ecr describe-images --repository-name ysh-b2b/backend --profile ysh-production
aws ecr describe-image-scan-findings --repository-name ysh-b2b/backend --image-id imageTag=1.0.0 --profile ysh-production
```

---

## 🔐 AWS Secrets Manager

- [x] `/ysh-b2b/jwt-secret` (64 chars) ✅
- [x] `/ysh-b2b/cookie-secret` (64 chars) ✅
- [x] `/ysh-b2b/revalidate-secret` (32 chars) ✅
- [ ] `/ysh-b2b/database-url` (após RDS criado)
- [ ] `/ysh-b2b/redis-url` (após Redis criado)
- [ ] `/ysh-b2b/backend-url` (ALB DNS ou domínio)
- [ ] `/ysh-b2b/storefront-url` (CloudFront ou ALB)
- [ ] `/ysh-b2b/publishable-key` (gerada pelo Medusa Admin)

**Comando de Validação**:

```powershell
aws secretsmanager list-secrets --profile ysh-production | ConvertFrom-Json | Select-Object -ExpandProperty SecretList | Where-Object { $_.Name -like "/ysh-b2b/*" }
```

**Teste de Acesso**:

```powershell
aws secretsmanager get-secret-value --secret-id /ysh-b2b/jwt-secret --profile ysh-production
```

---

## 📦 ECS Cluster & Task Definitions

### Cluster

- [ ] Cluster criado: `production-ysh-b2b-cluster`
- [ ] Fargate capacity provider habilitado
- [ ] Fargate Spot habilitado (opcional)
- [ ] CloudWatch Container Insights habilitado

**Comando de Validação**:

```powershell
aws ecs describe-clusters --clusters production-ysh-b2b-cluster --profile ysh-production
```

### Task Definitions

- [x] **Backend**: ysh-b2b-backend:1 registrada
  - [x] Image: 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b/backend:1.0.0 ✅
  - [x] CPU: 1024, Memory: 2048 ✅
  - [x] Secrets: DATABASE_URL, REDIS_URL, JWT_SECRET, COOKIE_SECRET ✅
  - [x] Health check: `/health` ✅
  - [x] Log group: `/ecs/ysh-b2b-backend` ✅

- [x] **Storefront**: ysh-b2b-storefront:1 registrada
  - [x] Image: 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b/storefront:1.0.0 ✅
  - [x] CPU: 512, Memory: 1024 ✅
  - [x] Secrets: BACKEND_URL, PUBLISHABLE_KEY, STOREFRONT_URL, REVALIDATE_SECRET ✅
  - [x] Health check: `/` ✅
  - [x] Log group: `/ecs/ysh-b2b-storefront` ✅

**Comando de Validação**:

```powershell
aws ecs describe-task-definition --task-definition ysh-b2b-backend:1 --profile ysh-production
aws ecs describe-task-definition --task-definition ysh-b2b-storefront:1 --profile ysh-production
```

---

## 🗄️ Database Initialization

- [ ] **Migrations executadas**:
  - [ ] Task ECS run-task completada com exit code 0
  - [ ] Tabelas Medusa criadas: `product`, `region`, `customer`, etc.
  - [ ] Tabelas customizadas: `company`, `employee`, `approval`, `quote`
  - [ ] Tabelas catalog: `unified_catalog_sku`, `unified_catalog_kit`, `unified_catalog_manufacturer`

- [ ] **Seed data carregado**:
  - [ ] 511 SKUs em `unified_catalog_sku`
  - [ ] 101 Kits em `unified_catalog_kit`
  - [ ] 37 Manufacturers em `unified_catalog_manufacturer`
  - [ ] Dados de exemplo: company, employees, etc.

**Comando de Validação (via bastion)**:

```sql
-- Conectar ao RDS
psql -h <rds-endpoint> -U medusa_user -d medusa_db

-- Validar tabelas
\dt

-- Validar counts
SELECT COUNT(*) as sku_count FROM unified_catalog_sku;
SELECT COUNT(*) as kit_count FROM unified_catalog_kit;
SELECT COUNT(*) as manufacturer_count FROM unified_catalog_manufacturer;

-- Esperado:
-- sku_count: 511
-- kit_count: 101
-- manufacturer_count: 37
```

---

## ⚖️ Application Load Balancer

### ALB

- [ ] ALB criado: `ysh-b2b-alb`
- [ ] Scheme: internet-facing
- [ ] Subnets: 2 public subnets em AZs diferentes
- [ ] Security Group: SG-ALB
- [ ] DNS name acessível

### Target Groups

- [ ] **Backend TG**: `ysh-backend-tg`
  - [ ] Protocol: HTTP, Port: 9000
  - [ ] Health check: `/health`, interval 30s
  - [ ] Healthy threshold: 2, Unhealthy: 3
  - [ ] Deregistration delay: 30s

- [ ] **Storefront TG**: `ysh-storefront-tg`
  - [ ] Protocol: HTTP, Port: 8000
  - [ ] Health check: `/`, interval 30s
  - [ ] Healthy threshold: 2, Unhealthy: 3
  - [ ] Stickiness habilitada (86400s)

### Listeners

- [ ] **HTTP:80 Listener**: Redirect para HTTPS:443
- [ ] **HTTPS:443 Listener** (se ACM certificate disponível):
  - [ ] Rule 1: `/store/*` → Backend TG
  - [ ] Rule 2: `/admin/*` → Backend TG
  - [ ] Default Rule: `/*` → Storefront TG

**Comando de Validação**:

```powershell
aws elbv2 describe-load-balancers --names ysh-b2b-alb --profile ysh-production
aws elbv2 describe-target-groups --profile ysh-production
aws elbv2 describe-listeners --load-balancer-arn <alb-arn> --profile ysh-production
```

---

## 🚀 ECS Services

### Backend Service

- [ ] Service criado: `ysh-b2b-backend`
- [ ] Desired count: 2
- [ ] Launch type: FARGATE
- [ ] Network: Private subnets + SG-ECS
- [ ] Load balancer attached: Backend TG
- [ ] Health check grace period: 60s
- [ ] Circuit breaker habilitado
- [ ] Tasks RUNNING: 2/2

### Storefront Service

- [ ] Service criado: `ysh-b2b-storefront`
- [ ] Desired count: 2
- [ ] Launch type: FARGATE
- [ ] Network: Private subnets + SG-ECS
- [ ] Load balancer attached: Storefront TG
- [ ] Health check grace period: 30s
- [ ] Circuit breaker habilitado
- [ ] Tasks RUNNING: 2/2

**Comando de Validação**:

```powershell
aws ecs describe-services --cluster production-ysh-b2b-cluster --services ysh-b2b-backend ysh-b2b-storefront --profile ysh-production
```

**Status Esperado**:

- `runningCount`: 2
- `status`: ACTIVE
- `deployments`: 1 (PRIMARY)

---

## 🏥 Health Checks

### Backend Health

```bash
# Via ALB
curl -i http://<alb-dns>/health

# Esperado:
# HTTP/1.1 200 OK
# {"status":"ok"}
```

### Storefront Health

```bash
# Via ALB
curl -i http://<alb-dns>/

# Esperado:
# HTTP/1.1 200 OK
# <!DOCTYPE html>...
```

### Target Groups Health

```powershell
aws elbv2 describe-target-health --target-group-arn <backend-tg-arn> --profile ysh-production
aws elbv2 describe-target-health --target-group-arn <storefront-tg-arn> --profile ysh-production
```

**Esperado**: Todos os targets com `State: healthy`

---

## 🔌 API Endpoints (Catalog)

Todos os endpoints devem retornar 200 OK:

```bash
# Manufacturers
curl -H "x-publishable-api-key: pk_..." http://<alb-dns>/store/catalog/manufacturers

# Panels
curl -H "x-publishable-api-key: pk_..." http://<alb-dns>/store/catalog/panels?limit=5

# Inverters
curl -H "x-publishable-api-key: pk_..." http://<alb-dns>/store/catalog/inverters?limit=5

# Batteries
curl -H "x-publishable-api-key: pk_..." http://<alb-dns>/store/catalog/batteries?limit=5

# Kits
curl -H "x-publishable-api-key: pk_..." http://<alb-dns>/store/catalog/kits?limit=5
```

**Validações**:

- [ ] Status code: 200
- [ ] JSON válido
- [ ] Dados corretos (manufacturer names, SKUs, prices)
- [ ] Paginação funcionando (`limit`, `offset`)

---

## 🖼️ Storefront Pages

Todas as páginas devem carregar sem erro:

```bash
# Homepage
curl -I http://<alb-dns>/br

# Categories
curl -I http://<alb-dns>/br/categories/panels
curl -I http://<alb-dns>/br/categories/inverters
curl -I http://<alb-dns>/br/categories/batteries
curl -I http://<alb-dns>/br/categories/kits
```

**Validações**:

- [ ] Status code: 200
- [ ] Content-Type: text/html
- [ ] Response time < 2s
- [ ] No JavaScript errors (verificar no browser DevTools)

---

## 📊 Logs & Monitoring

### CloudWatch Logs

- [ ] Log group `/ecs/ysh-b2b-backend` criado
- [ ] Log group `/ecs/ysh-b2b-storefront` criado
- [ ] Logs chegando em tempo real
- [ ] Nenhum ERROR nos últimos 5 minutos

**Comando de Validação**:

```powershell
aws logs tail /ecs/ysh-b2b-backend --since 5m --profile ysh-production
aws logs tail /ecs/ysh-b2b-storefront --since 5m --profile ysh-production
```

### Métricas ECS

- [ ] CPU utilization < 80%
- [ ] Memory utilization < 80%
- [ ] Nenhum task stopped (crashloop)

```powershell
aws cloudwatch get-metric-statistics `
  --namespace AWS/ECS `
  --metric-name CPUUtilization `
  --dimensions Name=ClusterName,Value=production-ysh-b2b-cluster Name=ServiceName,Value=ysh-b2b-backend `
  --start-time (Get-Date).AddMinutes(-10) `
  --end-time (Get-Date) `
  --period 300 `
  --statistics Average `
  --profile ysh-production
```

### ALB Metrics

- [ ] Request count > 0
- [ ] Target response time < 500ms (p95)
- [ ] HTTP 5xx count = 0
- [ ] Healthy host count = 4 (2 backend + 2 storefront)

---

## 🔒 Security

### IAM Roles

- [ ] `ecsTaskExecutionRole` existe
  - [ ] Policy: ECR pull, CloudWatch Logs write, Secrets Manager read
- [ ] `ecsTaskRole` existe
  - [ ] Policy: S3 access (se necessário), Secrets Manager read

### Secrets Rotation

- [ ] Rotation desabilitada (MVP) ou configurada (prod)

### Network Security

- [ ] Nenhum recurso privado com IP público
- [ ] RDS e Redis APENAS em private subnets
- [ ] ECS tasks APENAS em private subnets
- [ ] NAT Gateways funcionando (tasks podem acessar internet)

---

## ⚡ Performance

### Response Times (p95)

- [ ] Backend `/health`: < 100ms
- [ ] Backend `/store/catalog/manufacturers`: < 200ms
- [ ] Backend `/store/catalog/panels`: < 300ms
- [ ] Storefront homepage: < 1s
- [ ] Storefront category page: < 1.5s

### Resource Utilization

- [ ] Backend CPU: 20-40% idle
- [ ] Backend Memory: < 70%
- [ ] Storefront CPU: 10-30% idle
- [ ] Storefront Memory: < 60%

---

## ✅ Final Go/No-Go Decision

### CRITICAL (Must Pass)

- [ ] All ECS tasks RUNNING
- [ ] All target groups HEALTHY
- [ ] Database migrations complete
- [ ] Seed data loaded correctly
- [ ] Health endpoints returning 200
- [ ] No CRITICAL security vulnerabilities

### HIGH (Should Pass)

- [ ] All catalog endpoints working
- [ ] All storefront pages loading
- [ ] Logs clean (no errors)
- [ ] Performance within targets
- [ ] Auto-scaling configured

### MEDIUM (Nice to Have)

- [ ] CloudWatch dashboard created
- [ ] Alarms configured
- [ ] SSL certificate (can use HTTP temporarily)
- [ ] Domain configured (can use ALB DNS)

---

## 📝 Sign-Off

**Deployment Date**: _____________  
**Validated By**: _____________  
**Status**: ⬜ GO TO PRODUCTION | ⬜ NO-GO (issues below)

**Issues Blocking Go-Live**:
1.
2.
3.

---

**Última Atualização**: 09/10/2025 21:40  
**Próxima Revisão**: Após stack CloudFormation CREATE_COMPLETE
