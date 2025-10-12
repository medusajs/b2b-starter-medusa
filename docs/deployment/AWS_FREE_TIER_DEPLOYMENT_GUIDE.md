# 🚀 YSH B2B - Guia de Deploy AWS Free Tier
# Medusa.js 2.10.3 - Maximizando recursos gratuitos

> **Economia estimada**: R$ 350-500/mês (US$ 70-100) utilizando Free Tier durante 12 meses

---

## 📋 Índice

1. [Visão Geral do Free Tier](#visão-geral-do-free-tier)
2. [Arquitetura Free Tier](#arquitetura-free-tier)
3. [Pré-requisitos](#pré-requisitos)
4. [Deploy CloudFormation](#deploy-cloudformation)
5. [Configuração Medusa 2.10.3](#configuração-medusa-2103)
6. [Deploy Backend + Storefront](#deploy-backend--storefront)
7. [Monitoramento de Uso](#monitoramento-de-uso)
8. [Otimizações de Performance](#otimizações-de-performance)
9. [Troubleshooting](#troubleshooting)
10. [Migração para Produção](#migração-para-produção)

---

## 🎯 Visão Geral do Free Tier

### Recursos AWS Free Tier (12 meses)

| Serviço | Limite Free Tier | Uso Estimado YSH | Status |
|---------|------------------|------------------|--------|
| **RDS** | 750h/mês db.t3.micro<br>20GB SSD gp3 | 730h/mês (24/7)<br>15GB | ✅ Dentro |
| **ElastiCache** | 750h/mês cache.t4g.micro | 730h/mês (24/7) | ✅ Dentro |
| **ECS Fargate** | 20GB storage<br>10GB transfer | 12GB storage<br>8GB transfer | ✅ Dentro |
| **S3** | 5GB Standard<br>20k GET<br>2k PUT | 3GB<br>15k GET<br>1.5k PUT | ✅ Dentro |
| **ALB** | 750h/mês<br>15GB processado | 730h/mês<br>12GB | ✅ Dentro |
| **CloudWatch** | 10 métricas<br>5GB logs | 8 métricas<br>3GB logs | ✅ Dentro |
| **Data Transfer** | 15GB out/mês | 10GB out | ✅ Dentro |

### 💰 Economia Mensal

```
Sem Free Tier (us-east-1):
- RDS db.t3.medium (2 vCPU, 4GB): US$ 62/mês
- ElastiCache cache.t3.micro: US$ 13/mês
- ECS Fargate (2 tasks): US$ 30/mês
- S3 + Data Transfer: US$ 15/mês
- ALB: US$ 22/mês
TOTAL: ~US$ 142/mês (R$ 710)

Com Free Tier otimizado:
- RDS db.t3.micro: US$ 0
- ElastiCache cache.t4g.micro: US$ 0
- ECS Fargate Spot (2 tasks): US$ 9/mês
- S3: US$ 0
- ALB: US$ 0
TOTAL: ~US$ 9/mês (R$ 45) + custos variáveis mínimos
```

**Economia**: **93% nos primeiros 12 meses!**

---

## 🏗️ Arquitetura Free Tier

```
┌─────────────────────────────────────────────────────────────┐
│                         INTERNET                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                ┌────────▼────────┐
                │  Route 53 (DNS) │
                │  FREE (50 queries)
                └────────┬────────┘
                         │
         ┌───────────────▼──────────────┐
         │ Application Load Balancer    │
         │ FREE TIER: 750h/mês          │
         │ Path routing: /admin, /store │
         └───────────┬──────────────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
┌───────▼────────┐      ┌─────────▼──────────┐
│ ECS Fargate    │      │ ECS Fargate        │
│ Backend        │      │ Storefront         │
│ Medusa 2.10.3  │      │ Next.js 15         │
│ 0.5 vCPU/1GB   │      │ 0.25 vCPU/0.5GB    │
│ FARGATE SPOT   │      │ FARGATE SPOT       │
└───────┬────────┘      └─────────┬──────────┘
        │                         │
        └────────────┬────────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
┌───────▼────────┐      ┌─────────▼──────────┐
│ RDS PostgreSQL │      │ ElastiCache Redis  │
│ db.t3.micro    │      │ cache.t4g.micro    │
│ FREE: 750h/mês │      │ FREE: 750h/mês     │
│ 1 vCPU, 1GB    │      │ 555MB RAM          │
│ 20GB SSD gp3   │      │ Cache + Workflow   │
└────────────────┘      └────────────────────┘
        │
┌───────▼────────┐
│ S3 Media       │
│ FREE: 5GB      │
│ Standard→IA    │
└────────────────┘
```

### Decisões de Arquitetura

1. **RDS db.t3.micro vs db.t4g.micro**:
   - t3.micro: x86, 1 vCPU, 1GB RAM, Free Tier
   - t4g.micro: ARM Graviton2, 2 vCPU, 1GB RAM, 20% mais eficiente
   - **Escolha**: t3.micro (compatibilidade máxima)

2. **ElastiCache cache.t4g.micro**:
   - ARM Graviton2, 2 vCPU, 555MB RAM
   - 20% mais eficiente que t3.micro
   - Suporta Redis 7.1 (BullMQ para workflows)

3. **ECS Fargate Spot**:
   - 70% mais barato que Fargate padrão
   - Weight 3:1 (75% Spot, 25% OnDemand)
   - Tolerância a interrupções (restart automático)

4. **S3 Lifecycle Policies**:
   - 0-30 dias: S3 Standard (FREE: 5GB)
   - 30+ dias: S3 Standard-IA (50% mais barato)
   - 90+ dias: Glacier (80% mais barato)

---

## 🔧 Pré-requisitos

### 1. AWS CLI v2

```powershell
# Download AWS CLI v2
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Verificar instalação
aws --version
# Output: aws-cli/2.x.x Python/3.x.x Windows/10 exe/AMD64
```

### 2. Configurar Credenciais AWS

```powershell
# Configurar AWS CLI
aws configure

# Inputs:
# AWS Access Key ID: AKIAIOSFODNN7EXAMPLE
# AWS Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
# Default region name: us-east-1 (ou sa-east-1 para São Paulo)
# Default output format: json
```

### 3. Gerar Secrets

```powershell
# JWT Secret (64 caracteres hexadecimais)
$JWT_SECRET = -join ((48..57) + (65..70) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "JWT_SECRET=$JWT_SECRET"

# Cookie Secret (64 caracteres hexadecimais)
$COOKIE_SECRET = -join ((48..57) + (65..70) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "COOKIE_SECRET=$COOKIE_SECRET"

# Database Master Password (16 caracteres alfanuméricos)
$DB_PASSWORD = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 16 | ForEach-Object {[char]$_})
Write-Host "DB_MASTER_PASSWORD=$DB_PASSWORD"
```

### 4. Docker + AWS ECR

```powershell
# Instalar Docker Desktop for Windows
# https://www.docker.com/products/docker-desktop

# Login no ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
```

---

## 🚀 Deploy CloudFormation

### Passo 1: Validar Template

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store

# Validar sintaxe CloudFormation
aws cloudformation validate-template `
  --template-body file://aws/cloudformation-free-tier.yml
```

### Passo 2: Deploy Stack

```powershell
# Definir variáveis
$STACK_NAME = "ysh-free-tier-production"
$ENVIRONMENT = "production"
$DB_USER = "medusa_admin"
$DB_PASS = "<YOUR_DB_PASSWORD>" # Gerado anteriormente
$JWT_SEC = "<YOUR_JWT_SECRET>"
$COOKIE_SEC = "<YOUR_COOKIE_SECRET>"

# Deploy CloudFormation
aws cloudformation create-stack `
  --stack-name $STACK_NAME `
  --template-body file://aws/cloudformation-free-tier.yml `
  --parameters `
    ParameterKey=Environment,ParameterValue=$ENVIRONMENT `
    ParameterKey=VpcCIDR,ParameterValue=10.0.0.0/16 `
    ParameterKey=DBMasterUsername,ParameterValue=$DB_USER `
    ParameterKey=DBMasterPassword,ParameterValue=$DB_PASS `
    ParameterKey=MedusaJWTSecret,ParameterValue=$JWT_SEC `
    ParameterKey=MedusaCookieSecret,ParameterValue=$COOKIE_SEC `
  --capabilities CAPABILITY_NAMED_IAM `
  --region us-east-1

# Monitorar criação (10-15 minutos)
aws cloudformation wait stack-create-complete --stack-name $STACK_NAME
```

### Passo 3: Obter Outputs

```powershell
# Extrair endpoints e ARNs
aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs" --output table

# Salvar em variáveis
$DB_ENDPOINT = (aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='DatabaseEndpoint'].OutputValue" --output text)
$REDIS_ENDPOINT = (aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='RedisEndpoint'].OutputValue" --output text)
$ALB_DNS = (aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerDNS'].OutputValue" --output text)
$SECRETS_ARN = (aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='SecretsManagerARN'].OutputValue" --output text)

Write-Host "Database: $DB_ENDPOINT"
Write-Host "Redis: $REDIS_ENDPOINT"
Write-Host "ALB: $ALB_DNS"
Write-Host "Secrets: $SECRETS_ARN"
```

---

## ⚙️ Configuração Medusa 2.10.3

### 1. Atualizar `.env` (Backend)

```powershell
# Criar .env production
@"
NODE_ENV=production
DATABASE_URL=postgres://${DB_USER}:${DB_PASS}@${DB_ENDPOINT}:5432/medusa_db
REDIS_URL=redis://${REDIS_ENDPOINT}:6379

# Medusa Secrets (já em Secrets Manager, mas útil para local)
JWT_SECRET=${JWT_SEC}
COOKIE_SECRET=${COOKIE_SEC}

# CORS (ajustar após obter domínio)
STORE_CORS=http://${ALB_DNS},https://<YOUR_DOMAIN>
ADMIN_CORS=http://${ALB_DNS},https://<YOUR_DOMAIN>
AUTH_CORS=http://${ALB_DNS},https://<YOUR_DOMAIN>

# S3 Media Storage
AWS_REGION=us-east-1
S3_BUCKET=production-ysh-media-<AWS_ACCOUNT_ID>
S3_ACCESS_KEY_ID=<FROM_IAM>
S3_SECRET_ACCESS_KEY=<FROM_IAM>

# YSH Pricing Module
YSH_CATALOG_PATH=./data/catalog

# Medusa Admin
MEDUSA_ADMIN_ONBOARDING_TYPE=default
MEDUSA_ADMIN_ONBOARDING_NEXTJS_DIRECTORY=../storefront
"@ | Out-File -FilePath backend\.env.production -Encoding utf8
```

### 2. Verificar `medusa-config.ts`

O arquivo já foi atualizado com:
- **Cache**: Redis em produção, In-Memory em dev
- **Workflow Engine**: Redis (BullMQ) em produção
- **TTL**: 30 segundos padrão
- **Max items (dev)**: 500 itens in-memory

```typescript
// backend/medusa-config.ts
[Modules.CACHE]: process.env.NODE_ENV === "production"
  ? {
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
        ttl: 30,
        namespace: "medusa",
      },
    }
  : { resolve: "@medusajs/medusa/cache-inmemory" },
```

### 3. Build & Push Docker Images

```powershell
# Criar ECR repositories
aws ecr create-repository --repository-name ysh-backend --region us-east-1
aws ecr create-repository --repository-name ysh-storefront --region us-east-1

# Obter URLs
$AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
$ECR_BACKEND = "${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/ysh-backend"
$ECR_STOREFRONT = "${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/ysh-storefront"

# Build Backend
cd backend
docker build -f Dockerfile -t ysh-backend:latest .
docker tag ysh-backend:latest ${ECR_BACKEND}:latest
docker push ${ECR_BACKEND}:latest

# Build Storefront
cd ../storefront
docker build -f Dockerfile -t ysh-storefront:latest .
docker tag ysh-storefront:latest ${ECR_STOREFRONT}:latest
docker push ${ECR_STOREFRONT}:latest
```

---

## 🎯 Deploy Backend + Storefront

### 1. Criar Task Definitions

**Backend Task Definition** (`aws/backend-task-definition-free-tier.json`):

```json
{
  "family": "ysh-backend-free-tier",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<AWS_ACCOUNT_ID>:role/production-ysh-ecs-execution-role",
  "taskRoleArn": "arn:aws:iam::<AWS_ACCOUNT_ID>:role/production-ysh-ecs-task-role",
  "containerDefinitions": [
    {
      "name": "medusa-backend",
      "image": "<AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 9000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "PORT", "value": "9000" },
        { "name": "AWS_REGION", "value": "us-east-1" }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<AWS_ACCOUNT_ID>:secret:production/ysh/medusa:DATABASE_URL::"
        },
        {
          "name": "REDIS_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<AWS_ACCOUNT_ID>:secret:production/ysh/medusa:REDIS_URL::"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<AWS_ACCOUNT_ID>:secret:production/ysh/medusa:JWT_SECRET::"
        },
        {
          "name": "COOKIE_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<AWS_ACCOUNT_ID>:secret:production/ysh/medusa:COOKIE_SECRET::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/aws/ecs/production-ysh-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "medusa"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:9000/health || exit 1"],
        "interval": 30,
        "timeout": 10,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

### 2. Registrar Task Definitions

```powershell
# Registrar backend
aws ecs register-task-definition --cli-input-json file://aws/backend-task-definition-free-tier.json

# Registrar storefront (similar ao backend, porta 8000)
aws ecs register-task-definition --cli-input-json file://aws/storefront-task-definition-free-tier.json
```

### 3. Criar ECS Services

```powershell
# Service Backend
aws ecs create-service `
  --cluster production-ysh-cluster `
  --service-name ysh-backend-service `
  --task-definition ysh-backend-free-tier `
  --desired-count 1 `
  --launch-type FARGATE `
  --platform-version LATEST `
  --capacity-provider-strategy `
    capacityProvider=FARGATE_SPOT,weight=3,base=0 `
    capacityProvider=FARGATE,weight=1,base=1 `
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-zzz],assignPublicIp=ENABLED}" `
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:<AWS_ACCOUNT_ID>:targetgroup/production-ysh-backend-tg/xxx,containerName=medusa-backend,containerPort=9000" `
  --health-check-grace-period-seconds 60

# Service Storefront (similar)
aws ecs create-service `
  --cluster production-ysh-cluster `
  --service-name ysh-storefront-service `
  --task-definition ysh-storefront-free-tier `
  --desired-count 1 `
  --launch-type FARGATE `
  --capacity-provider-strategy capacityProvider=FARGATE_SPOT,weight=3
```

### 4. Executar Migrations + Seed

```powershell
# Run task para migrations
aws ecs run-task `
  --cluster production-ysh-cluster `
  --task-definition ysh-backend-migrations `
  --launch-type FARGATE `
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-zzz],assignPublicIp=ENABLED}"

# Aguardar conclusão (5-10 minutos)
# Verificar logs no CloudWatch: /aws/ecs/production-ysh-backend
```

---

## 📊 Monitoramento de Uso Free Tier

### 1. Dashboard AWS Billing

```powershell
# Abrir Billing Dashboard
Start-Process "https://console.aws.amazon.com/billing/home#/freetier"
```

**Principais Métricas**:
- RDS: Horas db.t3.micro (750h/mês)
- ElastiCache: Horas cache.t4g.micro (750h/mês)
- Fargate: GB-hora storage (20GB/mês)
- S3: GB armazenado (5GB)
- Data Transfer: GB out (15GB/mês)

### 2. CloudWatch Alarms (Free Tier)

```powershell
# Alarme: RDS CPU > 80%
aws cloudwatch put-metric-alarm `
  --alarm-name ysh-rds-cpu-high `
  --alarm-description "RDS CPU > 80%" `
  --metric-name CPUUtilization `
  --namespace AWS/RDS `
  --statistic Average `
  --period 300 `
  --threshold 80 `
  --comparison-operator GreaterThanThreshold `
  --evaluation-periods 2 `
  --dimensions Name=DBInstanceIdentifier,Value=production-ysh-postgres

# Alarme: Redis Memory > 90%
aws cloudwatch put-metric-alarm `
  --alarm-name ysh-redis-memory-high `
  --metric-name DatabaseMemoryUsagePercentage `
  --namespace AWS/ElastiCache `
  --statistic Average `
  --period 300 `
  --threshold 90 `
  --comparison-operator GreaterThanThreshold `
  --dimensions Name=CacheClusterId,Value=production-ysh-redis
```

### 3. Cost Explorer API

```powershell
# Custo diário (últimos 7 dias)
aws ce get-cost-and-usage `
  --time-period Start=2025-01-01,End=2025-01-08 `
  --granularity DAILY `
  --metrics BlendedCost `
  --filter file://cost-filter.json

# cost-filter.json
{
  "Tags": {
    "Key": "FreeTier",
    "Values": ["true"]
  }
}
```

---

## ⚡ Otimizações de Performance

### 1. RDS Query Optimization

**Conexões Persistentes** (backend/src/utils/database-pool.ts):

```typescript
// Otimizar pool de conexões para db.t3.micro (1 vCPU)
export const databaseConfig = {
  pool: {
    min: 2,  // Mínimo 2 conexões
    max: 10, // Máximo 10 (db.t3.micro limita a 100 total)
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 10000,
  },
};
```

**Índices Essenciais**:

```sql
-- Após deploy, executar via psql
CREATE INDEX CONCURRENTLY idx_product_handle ON product(handle);
CREATE INDEX CONCURRENTLY idx_order_customer_id ON "order"(customer_id);
CREATE INDEX CONCURRENTLY idx_cart_customer_id ON cart(customer_id);
CREATE INDEX CONCURRENTLY idx_company_employees ON employee(company_id);

-- Analisar query plans
EXPLAIN ANALYZE SELECT * FROM product WHERE handle = 'solar-panel-550w';
```

### 2. Redis Cache Strategy

**Multi-Layer Cache** (L1 In-Memory + L2 Redis):

```typescript
// backend/src/utils/multi-layer-cache.ts
import { MedusaContainer } from "@medusajs/framework/types";
import { ICacheService } from "@medusajs/framework/types";

export class MultiLayerCache {
  private l1Cache = new Map<string, any>(); // In-memory L1
  private l1Ttl = 60 * 1000; // 60 segundos
  private l1MaxSize = 500; // 500 itens

  constructor(private container: MedusaContainer) {}

  async get<T>(key: string): Promise<T | null> {
    // L1: In-memory (mais rápido)
    const l1Hit = this.l1Cache.get(key);
    if (l1Hit && Date.now() < l1Hit.expires) {
      return l1Hit.value;
    }

    // L2: Redis (distribuído)
    const cacheService = this.container.resolve<ICacheService>("cacheService");
    const l2Hit = await cacheService.get<T>(key);
    
    if (l2Hit) {
      // Populate L1
      this.setL1(key, l2Hit);
      return l2Hit;
    }

    return null;
  }

  async set<T>(key: string, value: T, ttl: number = 300): Promise<void> {
    // Set L2 (Redis)
    const cacheService = this.container.resolve<ICacheService>("cacheService");
    await cacheService.set(key, value, ttl);

    // Set L1 (in-memory)
    this.setL1(key, value);
  }

  private setL1(key: string, value: any): void {
    // LRU eviction se atingir limite
    if (this.l1Cache.size >= this.l1MaxSize) {
      const firstKey = this.l1Cache.keys().next().value;
      this.l1Cache.delete(firstKey);
    }

    this.l1Cache.set(key, {
      value,
      expires: Date.now() + this.l1Ttl,
    });
  }
}
```

### 3. Fargate Spot Graceful Shutdown

**Tratar SIGTERM** (backend/src/server.ts):

```typescript
// Graceful shutdown para Fargate Spot (2 minutos de aviso)
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, starting graceful shutdown...");
  
  // 1. Parar de aceitar novas requisições
  server.close(() => {
    console.log("HTTP server closed");
  });

  // 2. Finalizar workflows em execução
  const workflowEngine = container.resolve("workflowEngine");
  await workflowEngine.shutdown();

  // 3. Fechar conexões de banco
  const dbConnection = container.resolve("dbConnection");
  await dbConnection.end();

  // 4. Exit
  process.exit(0);
});
```

### 4. S3 Lifecycle + CloudFront

**CloudFront Distribution** (Free Tier: 1TB transfer):

```powershell
# Criar CloudFront distribution
aws cloudfront create-distribution `
  --origin-domain-name production-ysh-media-<AWS_ACCOUNT_ID>.s3.amazonaws.com `
  --default-root-object index.html `
  --comment "YSH Media CDN" `
  --enabled

# Output: CloudFront URL (d111111abcdef8.cloudfront.net)
```

**Atualizar Medusa** para usar CloudFront:

```typescript
// backend/medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@medusajs/medusa-file-s3",
      options: {
        s3_url: "https://d111111abcdef8.cloudfront.net", // CloudFront
        bucket: process.env.S3_BUCKET,
        region: process.env.AWS_REGION,
      },
    },
  ],
});
```

---

## 🐛 Troubleshooting

### Problema 1: RDS Connection Timeout

**Sintoma**: `ETIMEDOUT` ou `ECONNREFUSED` no backend

**Causa**: Security Group não permite ECS → RDS

**Solução**:
```powershell
# Verificar Security Group RDS
aws ec2 describe-security-groups --group-ids sg-xxxxx

# Adicionar regra se necessário
aws ec2 authorize-security-group-ingress `
  --group-id sg-rds-xxxxx `
  --protocol tcp `
  --port 5432 `
  --source-group sg-ecs-xxxxx
```

### Problema 2: Redis OOM (Out of Memory)

**Sintoma**: `Error: OOM command not allowed when used memory > 'maxmemory'`

**Causa**: Cache.t4g.micro tem apenas 555MB RAM

**Solução 1** - Ajustar TTL:
```typescript
// medusa-config.ts
[Modules.CACHE]: {
  options: {
    ttl: 15, // Reduzir de 30 → 15 segundos
  },
}
```

**Solução 2** - Ajustar maxmemory-policy:
```powershell
# Criar parameter group mais agressivo
aws elasticache modify-cache-parameter-group `
  --cache-parameter-group-name production-ysh-redis-params `
  --parameter-name-values `
    ParameterName=maxmemory-policy,ParameterValue=volatile-lru `
    ParameterName=maxmemory-samples,ParameterValue=3
```

### Problema 3: Fargate Spot Interrupções Frequentes

**Sintoma**: Tasks reiniciando a cada 1-2 horas

**Causa**: Alta demanda de Fargate Spot na região

**Solução** - Ajustar weight Spot:Fargate:
```powershell
# Atualizar service (reduzir Spot de 3:1 → 1:1)
aws ecs update-service `
  --cluster production-ysh-cluster `
  --service ysh-backend-service `
  --capacity-provider-strategy `
    capacityProvider=FARGATE_SPOT,weight=1,base=0 `
    capacityProvider=FARGATE,weight=1,base=1
```

### Problema 4: S3 5GB Limit Exceeded

**Sintoma**: `Error: Storage limit exceeded`

**Causa**: Uploads de imagens/vídeos ultrapassaram 5GB

**Solução 1** - Lifecycle Policy (já configurado):
```yaml
# CloudFormation já inclui
LifecycleConfiguration:
  Rules:
    - TransitionInDays: 30
      StorageClass: STANDARD_IA
```

**Solução 2** - Compressão de imagens:
```typescript
// backend/src/utils/image-optimizer.ts
import sharp from "sharp";

export async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true })
    .toBuffer();
}
```

---

## 🚀 Migração para Produção (Pós Free Tier)

### Quando Migrar?

- Tráfego > 10k req/dia
- Database > 15GB
- Cache evictions > 30%
- CPU RDS > 80% sustentado

### Upgrade Path

```yaml
Fase 1 (Meses 1-6): Free Tier
  RDS: db.t3.micro (1 vCPU, 1GB, 20GB)
  ElastiCache: cache.t4g.micro (555MB)
  Fargate: 0.5 vCPU + 1GB (backend)
  
Fase 2 (Meses 7-12): Free Tier + Reserved Instances
  RDS: db.t3.small (2 vCPU, 2GB, 50GB) - RI 1yr: US$ 100/yr
  ElastiCache: cache.t4g.small (1.37GB) - RI 1yr: US$ 80/yr
  Fargate: 1 vCPU + 2GB
  Savings: ~40% vs On-Demand
  
Fase 3 (Ano 2+): Production Scale
  RDS: db.t4g.medium (2 vCPU, 4GB, 100GB) + Multi-AZ
  ElastiCache: cache.r6g.large (13GB) + Cluster
  Fargate: Auto-scaling 2-10 tasks
  CDN: CloudFront Standard
  Cost: ~US$ 250-400/mês
```

### Terraform Migration

```hcl
# Após 12 meses, migrar CloudFormation → Terraform
# aws/terraform/main.tf
terraform import aws_db_instance.main production-ysh-postgres
terraform import aws_elasticache_cluster.main production-ysh-redis
terraform import aws_ecs_cluster.main production-ysh-cluster
```

---

## 📚 Referências

- [AWS Free Tier Details](https://aws.amazon.com/free/)
- [Medusa 2.10.3 Release Notes](https://github.com/medusajs/medusa/releases/tag/v2.10.3)
- [ECS Fargate Spot Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-capacity-providers.html)
- [RDS PostgreSQL Performance Tuning](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [ElastiCache Redis Best Practices](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/BestPractices.html)

---

## 🎯 Próximos Passos

1. ✅ Deploy CloudFormation (15 minutos)
2. ✅ Build + Push Docker Images (10 minutos)
3. ✅ Create ECS Services (5 minutos)
4. ✅ Run Migrations + Seed (10 minutos)
5. ⏳ Configure Domain + SSL (30 minutos)
6. ⏳ Setup CloudWatch Alarms (15 minutos)
7. ⏳ Load Testing (k6 100 VU × 5min)
8. ⏳ Documentation + Runbook

**Tempo Total**: ~1.5 horas de deploy + 30 minutos configuração DNS/SSL

---

**Autor**: YSH DevOps Team  
**Última Atualização**: Janeiro 2025  
**Versão**: 1.0 - Free Tier Optimized
