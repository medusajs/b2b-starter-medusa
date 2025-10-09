# 🚀 Tasks para Cobertura 360° e Deployment AWS

**Data**: 09/10/2025  
**Objetivo**: Checklist detalhado para alcançar 100% production-ready

---

## FASE 1: Finalizar Desenvolvimento Local (4-6h) ⚡

### Task 1.1: Endpoints Backend Restantes

**Tempo**: 2 horas | **Prioridade**: MÉDIA

- [ ] **1.1.1** Implementar `GET /store/catalog/[category]/[id]`
  - [ ] Criar route.ts em `backend/src/api/store/catalog/[category]/[id]/`
  - [ ] Usar `getCatalogService().findSKUById()` ou `findKitById()`
  - [ ] Normalizar resposta com `normalizeProduct()`
  - [ ] Testar com 3 produtos diferentes

- [ ] **1.1.2** Implementar `GET /store/catalog/search`
  - [ ] Criar route.ts em `backend/src/api/store/catalog/search/`
  - [ ] Adicionar método `searchProducts(query)` ao UnifiedCatalogService
  - [ ] Suportar busca em: name, model_number, manufacturer
  - [ ] Paginação: page, limit, offset
  - [ ] Testar: "Jinko", "inversor", "600W"

- [ ] **1.1.3** Filtros Avançados em [category]
  - [ ] Adicionar filtro `minPrice` e `maxPrice`
  - [ ] Adicionar sort: `price-asc`, `price-desc`, `name-asc`
  - [ ] Validar com Zod
  - [ ] Testar: `?minPrice=500&maxPrice=1000&sort=price-asc`

- [ ] **1.1.4** Documentação OpenAPI
  - [ ] Criar `backend/src/api/store/catalog/openapi.yaml`
  - [ ] Documentar todos os 8 endpoints
  - [ ] Exemplos de request/response

**Deliverable**: Backend 100% completo com todos os endpoints catalog

---

### Task 1.2: Storefront Páginas Faltantes

**Tempo**: 2 horas | **Prioridade**: MÉDIA

- [ ] **1.2.1** Página de Produto Individual
  - [ ] Criar `storefront/src/app/[countryCode]/(main)/products/[id]/page.tsx`
  - [ ] Data loader: `getProduct(id)` em `lib/data/catalog.ts`
  - [ ] Template: `modules/catalog/templates/product-detail-template`
  - [ ] Componentes: ImageGallery, PriceDisplay, AddToCart, Specs
  - [ ] Metadata SEO dinâmico
  - [ ] Testar navegação de categoria → produto

- [ ] **1.2.2** Página de Busca
  - [ ] Criar `storefront/src/app/[countryCode]/(main)/search/page.tsx`
  - [ ] Data loader: `searchProducts(query)` em `lib/data/catalog.ts`
  - [ ] Template: `modules/catalog/templates/search-template`
  - [ ] Suportar query params: `?q=jinko&page=1`
  - [ ] Filtros laterais: manufacturer, price range, category
  - [ ] Testar: busca vazia, busca com resultados, sem resultados

- [ ] **1.2.3** Error Boundaries & Loading States
  - [ ] Criar `ErrorBoundary` component genérico
  - [ ] Criar `LoadingSpinner` component
  - [ ] Criar `SkeletonLoader` para product cards
  - [ ] Adicionar em: category pages, product page, search
  - [ ] Testar: simular erro de API, network delay

- [ ] **1.2.4** Integração Carrinho com Catalog
  - [ ] Atualizar `AddToCartButton` para usar catalog IDs
  - [ ] Validar SKU existe antes de adicionar
  - [ ] Mostrar stock status (se disponível)
  - [ ] Toast notification em sucesso/erro

**Deliverable**: Storefront com jornada completa de navegação

---

### Task 1.3: Otimizações Performance

**Tempo**: 1 hora | **Prioridade**: ALTA

- [ ] **1.3.1** Cache Redis - Manufacturers
  - [ ] Adicionar Redis client no UnifiedCatalogService
  - [ ] Cache key: `catalog:manufacturers`
  - [ ] TTL: 1 hora
  - [ ] Invalidação: ao criar/atualizar manufacturer
  - [ ] Testar: primeira chamada vs segunda chamada

- [ ] **1.3.2** Database Indexes
  - [ ] Criar índice: `idx_sku_category` em `unified_catalog_sku(category)`
  - [ ] Criar índice: `idx_sku_manufacturer` em `unified_catalog_sku(manufacturer_id)`
  - [ ] Criar índice: `idx_sku_price` em `unified_catalog_sku(lowest_price)`
  - [ ] Migration: `yarn medusa db:generate UnifiedCatalog`
  - [ ] Testar: EXPLAIN ANALYZE das queries principais

- [ ] **1.3.3** Validar ISR Storefront
  - [ ] Confirmar `revalidate: 600` em todas as páginas catalog
  - [ ] Testar revalidação on-demand: `revalidatePath('/br/categories/panels')`
  - [ ] Criar route: `GET /api/revalidate?secret=...&path=...`
  - [ ] Documentar strategy de cache

- [ ] **1.3.4** Benchmark Final
  - [ ] Backend: cada endpoint < 100ms (p95)
  - [ ] Storefront: cada página < 1s (p95)
  - [ ] Documentar em `PERFORMANCE_BENCHMARKS.md`

**Deliverable**: Sistema otimizado com cache e indexes

---

### Task 1.4: Build Docker Production

**Tempo**: 1 hora | **Prioridade**: CRÍTICA ⚡

- [ ] **1.4.1** Build Backend Image

  ```powershell
  cd backend
  docker build -t ysh-b2b-backend:1.0.0 -f Dockerfile .
  docker tag ysh-b2b-backend:1.0.0 ysh-b2b-backend:latest
  ```

  - [ ] Validar: health check funcional
  - [ ] Validar: migrations rodam automaticamente
  - [ ] Validar: environment variables lidas corretamente
  - [ ] Inspecionar: `docker inspect ysh-b2b-backend:latest`

- [ ] **1.4.2** Build Storefront Image

  ```powershell
  cd storefront
  docker build -t ysh-b2b-storefront:1.0.0 -f Dockerfile .
  docker tag ysh-b2b-storefront:1.0.0 ysh-b2b-storefront:latest
  ```

  - [ ] Validar: standalone mode funcionando
  - [ ] Validar: env vars injetadas em runtime
  - [ ] Validar: health check respondendo
  - [ ] Test: `curl http://localhost:3000/api/health`

- [ ] **1.4.3** Docker Compose Production Test
  - [ ] Criar `docker-compose.prod.yml` (sem dev mounts)
  - [ ] Testar startup completo
  - [ ] Validar todas as 4 páginas carregam
  - [ ] Validar logs limpos (sem errors)

- [ ] **1.4.4** Image Size Optimization (Opcional)
  - [ ] Analisar: `docker images | grep ysh-b2b`
  - [ ] Meta: backend < 500MB, storefront < 300MB
  - [ ] Se necessário: remover devDependencies, multi-stage optimize

**Deliverable**: Imagens production buildadas e validadas localmente

---

## FASE 2: AWS Infrastructure (6-8h) 🔴 BLOQUEADOR

### Task 2.1: Networking & Security

**Tempo**: 2 horas | **Prioridade**: CRÍTICA

- [ ] **2.1.1** CloudFormation Stack: VPC
  - [ ] Criar `aws/cloudformation/01-networking.yml`
  - [ ] VPC: 10.0.0.0/16
  - [ ] 3 AZs: us-east-1a, us-east-1b, us-east-1c
  - [ ] Public subnets: 10.0.1.0/24, 10.0.2.0/24, 10.0.3.0/24
  - [ ] Private subnets: 10.0.10.0/24, 10.0.11.0/24, 10.0.12.0/24
  - [ ] Internet Gateway
  - [ ] NAT Gateways (3x, um por AZ)
  - [ ] Route tables
  - [ ] Deploy: `aws cloudformation create-stack --stack-name ysh-networking ...`

- [ ] **2.1.2** Security Groups
  - [ ] SG-ALB: Inbound 80, 443 de 0.0.0.0/0
  - [ ] SG-ECS: Inbound 9000-9002 de SG-ALB, 8000 de SG-ALB
  - [ ] SG-RDS: Inbound 5432 de SG-ECS
  - [ ] SG-Redis: Inbound 6379 de SG-ECS
  - [ ] Validar: nenhuma regra 0.0.0.0/0 em private SGs

- [ ] **2.1.3** IAM Roles
  - [ ] Role: ECSTaskExecutionRole (pull ECR, logs CloudWatch)
  - [ ] Role: ECSTaskRole (acesso S3, Secrets Manager)
  - [ ] Policy: least privilege principle
  - [ ] Testar: `aws iam get-role --role-name ECSTaskExecutionRole`

**Deliverable**: Networking isolado e seguro

---

### Task 2.2: Data Layer (RDS + ElastiCache)

**Tempo**: 2 horas | **Prioridade**: CRÍTICA

- [ ] **2.2.1** CloudFormation Stack: Database
  - [ ] Criar `aws/cloudformation/02-data-layer.yml`
  - [ ] RDS PostgreSQL 15
    - [ ] Engine version: 15.4
    - [ ] Instance: db.t3.medium (2 vCPU, 4GB RAM)
    - [ ] Storage: 50GB gp3, autoscaling até 100GB
    - [ ] Multi-AZ: true (production), false (MVP)
    - [ ] Backup retention: 7 dias
    - [ ] Subnet group: private subnets
    - [ ] Security group: SG-RDS
  - [ ] Deploy: `aws cloudformation create-stack --stack-name ysh-data-layer ...`

- [ ] **2.2.2** ElastiCache Redis
  - [ ] Engine: Redis 7.0
  - [ ] Node type: cache.t3.micro (MVP), cache.t3.small (prod)
  - [ ] Replicas: 0 (MVP), 2 (prod)
  - [ ] Subnet group: private subnets
  - [ ] Security group: SG-Redis
  - [ ] Snapshot retention: 5 dias

- [ ] **2.2.3** AWS Secrets Manager
  - [ ] Secret: `ysh-b2b/database`

    ```json
    {
      "username": "medusa_user",
      "password": "<generated>",
      "host": "<rds-endpoint>",
      "port": 5432,
      "dbname": "medusa_db"
    }
    ```

  - [ ] Secret: `ysh-b2b/redis`

    ```json
    {
      "host": "<redis-endpoint>",
      "port": 6379
    }
    ```

  - [ ] Secret: `ysh-b2b/api-keys`

    ```json
    {
      "publishable_key": "pk_...",
      "admin_key": "sk_..."
    }
    ```

- [ ] **2.2.4** Database Initialization
  - [ ] Conectar via bastion host ou VPN
  - [ ] Criar database: `CREATE DATABASE medusa_db;`
  - [ ] Run migrations: `yarn medusa db:migrate` (via ECS task one-off)
  - [ ] Seed data: `yarn run seed` (via ECS task)
  - [ ] Validar: `psql -h <endpoint> -U medusa_user -d medusa_db -c "\dt"`

**Deliverable**: RDS e Redis provisionados e inicializados

---

### Task 2.3: Container Registry (ECR)

**Tempo**: 1 hora | **Prioridade**: CRÍTICA

- [ ] **2.3.1** Criar ECR Repositories

  ```bash
  aws ecr create-repository \
    --repository-name ysh-b2b/backend \
    --image-scanning-configuration scanOnPush=true \
    --region us-east-1
  
  aws ecr create-repository \
    --repository-name ysh-b2b/storefront \
    --image-scanning-configuration scanOnPush=true \
    --region us-east-1
  ```

- [ ] **2.3.2** ECR Login & Tag Images

  ```powershell
  # Login
  aws ecr get-login-password --region us-east-1 | `
    docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
  
  # Tag
  docker tag ysh-b2b-backend:1.0.0 <account-id>.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b/backend:1.0.0
  docker tag ysh-b2b-backend:1.0.0 <account-id>.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b/backend:latest
  
  docker tag ysh-b2b-storefront:1.0.0 <account-id>.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b/storefront:1.0.0
  docker tag ysh-b2b-storefront:1.0.0 <account-id>.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b/storefront:latest
  ```

- [ ] **2.3.3** Push Images

  ```powershell
  docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b/backend:1.0.0
  docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b/backend:latest
  
  docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b/storefront:1.0.0
  docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b/storefront:latest
  ```

- [ ] **2.3.4** Vulnerability Scan
  - [ ] Aguardar scan completar (5-10 min)
  - [ ] Revisar findings: `aws ecr describe-image-scan-findings ...`
  - [ ] Se CRITICAL: fix e rebuild
  - [ ] Documentar findings aceitáveis

**Deliverable**: Imagens no ECR, scaneadas e versionadas

---

### Task 2.4: ECS Fargate Deployment

**Tempo**: 2 horas | **Prioridade**: CRÍTICA

- [ ] **2.4.1** CloudFormation Stack: ECS Cluster
  - [ ] Criar `aws/cloudformation/03-ecs-cluster.yml`
  - [ ] ECS Cluster: `ysh-b2b-production`
  - [ ] CloudWatch Log Groups:
    - `/ecs/ysh-b2b-backend`
    - `/ecs/ysh-b2b-storefront`
  - [ ] Retention: 7 dias (MVP), 30 dias (prod)

- [ ] **2.4.2** Task Definition - Backend
  - [ ] Atualizar `aws/backend-task-definition.json`
  - [ ] Image: `<ecr-uri>/ysh-b2b/backend:1.0.0`
  - [ ] CPU: 512 (0.5 vCPU)
  - [ ] Memory: 1024 (1 GB)
  - [ ] Secrets:

    ```json
    "secrets": [
      {"name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:...:secret:ysh-b2b/database"},
      {"name": "REDIS_URL", "valueFrom": "arn:aws:secretsmanager:...:secret:ysh-b2b/redis"}
    ]
    ```

  - [ ] Health check: `curl -f http://localhost:9000/health || exit 1`
  - [ ] Register: `aws ecs register-task-definition --cli-input-json file://backend-task-definition.json`

- [ ] **2.4.3** Task Definition - Storefront
  - [ ] Atualizar `aws/storefront-task-definition.json`
  - [ ] Image: `<ecr-uri>/ysh-b2b/storefront:1.0.0`
  - [ ] CPU: 256 (0.25 vCPU)
  - [ ] Memory: 512 (0.5 GB)
  - [ ] Environment:

    ```json
    "environment": [
      {"name": "NEXT_PUBLIC_MEDUSA_BACKEND_URL", "value": "https://api.yellosolar.com"},
      {"name": "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY", "valueFrom": "arn:aws:secretsmanager:..."}
    ]
    ```

  - [ ] Health check: `curl -f http://localhost:8000/api/health || exit 1`
  - [ ] Register task definition

- [ ] **2.4.4** ALB - Application Load Balancer
  - [ ] Criar ALB: `ysh-b2b-alb`
  - [ ] Scheme: internet-facing
  - [ ] Subnets: public subnets (3 AZs)
  - [ ] Security group: SG-ALB
  - [ ] Target groups:
    - `ysh-backend-tg`: port 9000, health `/health`
    - `ysh-storefront-tg`: port 8000, health `/api/health`
  - [ ] Listeners:
    - HTTP:80 → redirect HTTPS:443
    - HTTPS:443 → forward to target groups (path-based routing)
  - [ ] Rules:
    - `/store/*` → ysh-backend-tg
    - `/admin/*` → ysh-backend-tg
    - `/*` → ysh-storefront-tg

- [ ] **2.4.5** ECS Services

  ```bash
  # Backend service
  aws ecs create-service \
    --cluster ysh-b2b-production \
    --service-name backend \
    --task-definition ysh-b2b-backend:1 \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-yyy],assignPublicIp=DISABLED}" \
    --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=9000" \
    --health-check-grace-period-seconds 60
  
  # Storefront service
  aws ecs create-service \
    --cluster ysh-b2b-production \
    --service-name storefront \
    --task-definition ysh-b2b-storefront:1 \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "..." \
    --load-balancers "targetGroupArn=...,containerName=storefront,containerPort=8000"
  ```

- [ ] **2.4.6** Auto Scaling
  - [ ] Backend: target CPU 70%, min 2, max 10
  - [ ] Storefront: target CPU 70%, min 2, max 6
  - [ ] Scale-out: +2 tasks em 1 minuto
  - [ ] Scale-in: -1 task em 5 minutos

**Deliverable**: ECS rodando com 2 services, ALB roteando tráfego

---

### Task 2.5: CloudFront & DNS

**Tempo**: 1 hora | **Prioridade**: ALTA

- [ ] **2.5.1** ACM Certificate
  - [ ] Request certificate: `*.yellosolar.com`, `yellosolar.com`
  - [ ] Validation: DNS (Route53 auto)
  - [ ] Aguardar: status "Issued"

- [ ] **2.5.2** CloudFront Distribution
  - [ ] Origin: ALB DNS name
  - [ ] Origin protocol: HTTPS only
  - [ ] Cache behaviors:
    - `/store/*`: cache disabled (API)
    - `/admin/*`: cache disabled (API)
    - `/*`: cache enabled, TTL 600s
  - [ ] Viewer protocol: redirect HTTP → HTTPS
  - [ ] SSL certificate: ACM certificate
  - [ ] CNAMEs: `yellosolar.com`, `www.yellosolar.com`
  - [ ] Compress objects: true
  - [ ] Deploy: aguardar ~15 minutos

- [ ] **2.5.3** Route53
  - [ ] Hosted zone: `yellosolar.com`
  - [ ] Record A: `yellosolar.com` → Alias CloudFront
  - [ ] Record A: `www.yellosolar.com` → Alias CloudFront
  - [ ] TTL: 300s

- [ ] **2.5.4** Validação DNS
  - [ ] `nslookup yellosolar.com` → IP CloudFront
  - [ ] `curl https://yellosolar.com` → 200 OK
  - [ ] `curl https://yellosolar.com/store/catalog/manufacturers` → JSON

**Deliverable**: Sistema acessível via domínio com SSL

---

## FASE 3: Deployment & Validação (3-4h)

### Task 3.1: First Deployment

**Tempo**: 1 hora | **Prioridade**: CRÍTICA

- [ ] **3.1.1** Smoke Tests Básicos

  ```bash
  # Health checks
  curl https://yellosolar.com/api/health
  curl https://yellosolar.com/store/health
  
  # Endpoints
  curl -H "x-publishable-api-key: pk_..." https://yellosolar.com/store/catalog/manufacturers
  curl -H "x-publishable-api-key: pk_..." https://yellosolar.com/store/catalog/panels?limit=5
  
  # Pages
  curl -I https://yellosolar.com/br/categories/panels
  curl -I https://yellosolar.com/br/categories/inverters
  ```

- [ ] **3.1.2** Verificar Logs

  ```bash
  # Backend logs
  aws logs tail /ecs/ysh-b2b-backend --follow --since 5m
  
  # Storefront logs
  aws logs tail /ecs/ysh-b2b-storefront --follow --since 5m
  
  # Verificar: sem errors, requests chegando
  ```

- [ ] **3.1.3** Database Validation

  ```sql
  -- Conectar RDS via bastion
  psql -h <rds-endpoint> -U medusa_user -d medusa_db
  
  -- Verificar dados
  SELECT COUNT(*) FROM unified_catalog_sku;
  SELECT COUNT(*) FROM unified_catalog_kit;
  SELECT COUNT(*) FROM unified_catalog_manufacturer;
  
  -- Deve ter: 511 SKUs, 101 kits, 37 manufacturers
  ```

**Deliverable**: Sistema funcional em produção

---

### Task 3.2: Testes E2E em Produção

**Tempo**: 1 hora | **Prioridade**: ALTA

- [ ] **3.2.1** Jornada Crítica 1: Navegação
  - [ ] Acessar homepage
  - [ ] Clicar "Produtos" no menu
  - [ ] Selecionar categoria "Painéis Solares"
  - [ ] Scroll: ver produtos carregarem
  - [ ] Filtrar: selecionar manufacturer
  - [ ] Validar: produtos filtrados

- [ ] **3.2.2** Jornada Crítica 2: Busca
  - [ ] Buscar: "Jinko"
  - [ ] Ver resultados
  - [ ] Buscar: "inversor 5kw"
  - [ ] Ver resultados
  - [ ] Buscar: "xyzabc123" (sem resultados)
  - [ ] Ver mensagem apropriada

- [ ] **3.2.3** Jornada Crítica 3: Produto
  - [ ] Acessar produto individual
  - [ ] Ver: nome, preço, especificações
  - [ ] Ver: imagens (ou placeholder)
  - [ ] Clicar "Adicionar ao Carrinho"
  - [ ] Validar: toast notification

- [ ] **3.2.4** Performance Validation

  ```bash
  # Lighthouse CI
  npm install -g @lhci/cli
  lhci autorun --collect.url=https://yellosolar.com/br/categories/panels
  
  # Metas:
  # - Performance: >80
  # - Accessibility: >90
  # - Best Practices: >90
  # - SEO: >90
  ```

**Deliverable**: Todas as jornadas funcionando

---

### Task 3.3: Load Testing

**Tempo**: 1 hora | **Prioridade**: MÉDIA

- [ ] **3.3.1** Setup k6

  ```bash
  # Install k6
  choco install k6  # Windows
  
  # Create load test script
  # File: tests/load/catalog-load-test.js
  ```

- [ ] **3.3.2** Test Scenarios

  ```javascript
  // Scenario 1: Steady 50 RPS
  export let options = {
    stages: [
      { duration: '2m', target: 50 },
      { duration: '5m', target: 50 },
      { duration: '2m', target: 0 },
    ],
  };
  
  // Requests
  export default function () {
    http.get('https://yellosolar.com/store/catalog/manufacturers');
    http.get('https://yellosolar.com/store/catalog/panels?limit=20');
    http.get('https://yellosolar.com/br/categories/panels');
    sleep(1);
  }
  ```

- [ ] **3.3.3** Run Tests & Analyze

  ```bash
  k6 run tests/load/catalog-load-test.js
  
  # Validar métricas:
  # - http_req_duration p95 < 500ms
  # - http_req_failed < 1%
  # - iteration_duration < 2s
  ```

- [ ] **3.3.4** Stress Test
  - [ ] Scenario 2: Spike to 200 RPS
  - [ ] Validar: auto-scaling ativa em 2-3 min
  - [ ] Validar: sem 5xx errors
  - [ ] Documentar: bottlenecks encontrados

**Deliverable**: Baseline de performance documentado

---

### Task 3.4: Monitoring Setup

**Tempo**: 1 hora | **Prioridade**: ALTA

- [ ] **3.4.1** CloudWatch Dashboard

  ```json
  {
    "widgets": [
      {"type": "metric", "title": "ECS CPU Utilization"},
      {"type": "metric", "title": "ECS Memory Utilization"},
      {"type": "metric", "title": "ALB Request Count"},
      {"type": "metric", "title": "ALB Target Response Time"},
      {"type": "metric", "title": "ALB 5xx Errors"},
      {"type": "metric", "title": "RDS CPU"},
      {"type": "metric", "title": "RDS Connections"},
      {"type": "log", "title": "Recent Errors"}
    ]
  }
  ```

- [ ] **3.4.2** CloudWatch Alarms

  ```bash
  # ECS CPU > 80%
  aws cloudwatch put-metric-alarm \
    --alarm-name ysh-ecs-backend-cpu-high \
    --alarm-description "Backend CPU > 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --alarm-actions arn:aws:sns:...
  
  # ALB 5xx > 10/min
  # RDS Connections > 80
  # Redis Memory > 75%
  ```

- [ ] **3.4.3** SNS Notifications
  - [ ] Topic: `ysh-b2b-alerts`
  - [ ] Subscription: email <team@yellosolar.com>
  - [ ] Test: trigger alarm manualmente

- [ ] **3.4.4** Log Insights Queries

  ```sql
  -- Top 10 slowest requests
  fields @timestamp, @message
  | filter @message like /duration/
  | sort @timestamp desc
  | limit 10
  
  -- Error count by hour
  fields @timestamp, @message
  | filter @message like /ERROR/
  | stats count() by bin(5m)
  ```

**Deliverable**: Observability completa configurada

---

## FASE 4: Post-Launch (2-3h)

### Task 4.1: CI/CD Pipeline

**Tempo**: 1 hora | **Prioridade**: MÉDIA

- [ ] **4.1.1** GitHub Actions Workflow

  ```yaml
  # .github/workflows/deploy-backend.yml
  name: Deploy Backend
  on:
    push:
      branches: [main]
      paths: ['backend/**']
  
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Build image
        - name: Push to ECR
        - name: Update ECS service
  ```

- [ ] **4.1.2** Automated Tests em CI
  - [ ] Unit tests: `yarn test:unit`
  - [ ] Integration tests: `yarn test:integration`
  - [ ] E2E smoke tests após deploy
  - [ ] Rollback automático se testes falham

**Deliverable**: Deploy automatizado

---

### Task 4.2: Security Hardening

**Tempo**: 1 hora | **Prioridade**: ALTA

- [ ] **4.2.1** WAF Rules
  - [ ] Rate limiting: 2000 req/5min per IP
  - [ ] SQL injection protection
  - [ ] XSS protection
  - [ ] Bad bot protection
  - [ ] Geo-blocking (opcional)

- [ ] **4.2.2** Security Scan
  - [ ] OWASP ZAP: `zap-baseline.py -t https://yellosolar.com`
  - [ ] Snyk: scan dependencies
  - [ ] Trivy: scan Docker images
  - [ ] Remediate findings críticos

**Deliverable**: Sistema hardened

---

### Task 4.3: Documentação Final

**Tempo**: 30 minutos | **Prioridade**: MÉDIA

- [ ] **4.3.1** Runbook de Operações
  - [ ] Como fazer deploy manual
  - [ ] Como fazer rollback
  - [ ] Como escalar manualmente
  - [ ] Como acessar logs

- [ ] **4.3.2** Disaster Recovery
  - [ ] RDS: restore from snapshot
  - [ ] ECS: rollback task definition
  - [ ] Secrets: rotation procedure

**Deliverable**: Docs operacionais completos

---

## 📊 Tracking Progress

### Overall Status

```
FASE 1: Desenvolvimento Local    [ ] 0% (0/4 tasks)
FASE 2: AWS Infrastructure       [ ] 0% (0/5 tasks)
FASE 3: Deployment & Validação   [ ] 0% (0/4 tasks)
FASE 4: Post-Launch              [ ] 0% (0/3 tasks)
────────────────────────────────────────────────
TOTAL:                           [ ] 0% (0/16 tasks)
```

### Time Breakdown

| Fase | Estimativa | Acumulado |
|------|-----------|-----------|
| FASE 1 | 4-6h | 6h |
| FASE 2 | 6-8h | 14h |
| FASE 3 | 3-4h | 18h |
| FASE 4 | 2-3h | 21h |

**Total**: 15-21 horas (~2-3 dias)

---

## 🎯 Quick Start Commands

### Para começar agora

```powershell
# 1. Build images (Task 1.4)
cd backend
docker build -t ysh-b2b-backend:1.0.0 .

cd ../storefront
docker build -t ysh-b2b-storefront:1.0.0 .

# 2. Setup AWS (Task 2.1)
cd ../aws/cloudformation
aws cloudformation create-stack \
  --stack-name ysh-networking \
  --template-body file://01-networking.yml \
  --parameters ParameterKey=Environment,ParameterValue=production

# 3. Deploy data layer (Task 2.2)
aws cloudformation create-stack \
  --stack-name ysh-data-layer \
  --template-body file://02-data-layer.yml

# Continuar seguindo checklist...
```

---

**Última Atualização**: 09/10/2025  
**Status**: Checklist completo e pronto para execução  
**Next Action**: Executar Task 1.4 (Build Docker Production)
