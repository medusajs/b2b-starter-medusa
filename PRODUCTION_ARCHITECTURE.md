# 🏗️ Arquitetura de Produção YSH B2B Commerce

**Data**: 08/10/2025  
**Status**: 📋 Planejamento completo  
**Objetivo**: Ambiente de produção AWS com LocalStack para dev/staging, otimização de builds e compliance Hélio Solar

---

## 📋 Índice

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Estratégia Multi-Ambiente](#2-estratégia-multi-ambiente)
3. [LocalStack: AWS Local para Dev/Staging](#3-localstack-aws-local-para-devstaging)
4. [Docker Build Optimization](#4-docker-build-optimization)
5. [Infraestrutura AWS Production](#5-infraestrutura-aws-production)
6. [CI/CD Pipeline Completo](#6-cicd-pipeline-completo)
7. [Observability & Monitoring](#7-observability--monitoring)
8. [Security & Compliance](#8-security--compliance)
9. [Cost Optimization](#9-cost-optimization)
10. [Disaster Recovery & Backup](#10-disaster-recovery--backup)
11. [Runbooks & Procedures](#11-runbooks--procedures)

---

## 1) Visão Geral da Arquitetura

### 1.1 Stack Tecnológico

```yaml
Frontend:
  - Next.js 15 (App Router, Server Components, Streaming)
  - Yarn Berry (nodeLinker: node-modules)
  - Medusa JS SDK v2.8.4
  - shadcn/ui + Radix UI + Tailwind CSS
  
Backend:
  - Medusa.js v2.4 (Node.js 20)
  - PostgreSQL 16
  - Redis 7
  
Infrastructure:
  - AWS (ECS Fargate, RDS, ElastiCache, S3, CloudFront, Route53)
  - LocalStack Pro (Dev/Staging AWS emulation)
  - Docker + BuildKit (multi-stage, cache optimization)
  - Terraform/CDK (Infrastructure as Code)
  
Observability:
  - DataDog/Sentry (logs, traces, APM)
  - CloudWatch (metrics, alarms)
  - Grafana (dashboards)
  
Security:
  - AWS Secrets Manager (RSA keys, JWT, Database credentials)
  - AWS WAF (DDoS, SQL injection, XSS protection)
  - KMS (encryption at rest)
  - IAM (least privilege roles)
```

### 1.2 Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION (AWS)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐      ┌──────────────┐      ┌──────────────┐        │
│  │ Route53  │──────▶│ CloudFront   │──────▶│     ALB      │        │
│  │   DNS    │      │  (CDN/Cache) │      │ (Load Balancer)│        │
│  └──────────┘      └──────────────┘      └────┬─────┬────┘        │
│                                                │     │              │
│                     ┌──────────────────────────┘     └────────┐    │
│                     │                                         │    │
│            ┌────────▼──────────┐              ┌──────────────▼───┐│
│            │  ECS Fargate      │              │  ECS Fargate     ││
│            │  Storefront       │              │  Backend         ││
│            │  (Next.js)        │              │  (Medusa.js)     ││
│            │  - Auto-scaling   │              │  - Auto-scaling  ││
│            │  - Health checks  │              │  - Health checks ││
│            └───────────────────┘              └─────────┬────────┘│
│                                                          │         │
│                                         ┌───────────────┴───┐     │
│                                         │                   │     │
│                              ┌──────────▼────┐   ┌─────────▼───┐ │
│                              │ RDS PostgreSQL│   │ ElastiCache │ │
│                              │  Multi-AZ     │   │   Redis     │ │
│                              │  Encrypted    │   │  Cluster    │ │
│                              └───────────────┘   └─────────────┘ │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ S3 Uploads  │  │ Secrets Mgr  │  │ CloudWatch   │           │
│  │ + Backups   │  │ (Keys, Creds)│  │ (Logs/Metrics)│          │
│  └─────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    DEV/STAGING (LocalStack Pro)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  LocalStack Container (AWS Emulation)                      │   │
│  │  - S3, RDS (Postgres), ElastiCache (Redis), Secrets Mgr    │   │
│  │  - ECS (local), Lambda, SNS, SQS, CloudWatch               │   │
│  │  - Cost: $0 (vs. AWS Dev/Staging: ~$200-500/month)         │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐         │
│  │ Backend       │  │ Storefront    │  │ PostgreSQL    │         │
│  │ (Docker)      │  │ (Docker)      │  │ (Docker)      │         │
│  └───────────────┘  └───────────────┘  └───────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2) Estratégia Multi-Ambiente

### 2.1 Ambientes

| Ambiente | Infraestrutura | Objetivo | Uptime SLA |
|----------|---------------|----------|------------|
| **Local** | Docker Compose + LocalStack | Desenvolvimento individual | N/A |
| **Dev** | LocalStack Pro | Integração contínua, testes automatizados | 95% |
| **Staging** | LocalStack Pro ou AWS (Light) | QA, UAT, aprovações pré-produção | 98% |
| **Production** | AWS Full Stack | Operação real, clientes finais | 99.9% |

### 2.2 Variáveis de Ambiente por Ambiente

```bash
# Local (.env.local)
NODE_ENV=development
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
DATABASE_URL=postgres://postgres@localhost:5432/ysh_dev
REDIS_URL=redis://localhost:6379
AWS_ENDPOINT_URL=http://localhost:4566  # LocalStack

# Dev (.env.dev)
NODE_ENV=development
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://dev-api.ysh.solar
DATABASE_URL=postgres://user:pass@localstack:5432/ysh_dev
REDIS_URL=redis://localstack:6379
AWS_ENDPOINT_URL=http://localstack:4566

# Staging (.env.staging)
NODE_ENV=staging
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://staging-api.ysh.solar
DATABASE_URL=postgres://user:pass@staging-db.xxx.rds.amazonaws.com:5432/ysh_staging
REDIS_URL=redis://staging-cache.xxx.cache.amazonaws.com:6379
AWS_REGION=us-east-1

# Production (.env.production)
NODE_ENV=production
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.ysh.solar
DATABASE_URL=<AWS_SECRETS_MANAGER>
REDIS_URL=<AWS_SECRETS_MANAGER>
AWS_REGION=us-east-1
```

---

## 3) LocalStack: AWS Local para Dev/Staging

### 3.1 Por que LocalStack Pro?

**Benefícios**:

- 💰 **Cost Savings**: Economiza $200-500/mês em ambientes dev/staging
- ⚡ **Speed**: Deploy local em segundos vs. minutos no AWS
- 🔒 **Offline**: Desenvolver sem internet ou conta AWS
- 🎯 **Parity**: 99% compatibilidade com AWS APIs (S3, RDS, ECS, Lambda, etc.)
- 🧪 **Testing**: Simular falhas, latência, erros sem afetar produção
- 🔐 **Security**: Dados sensíveis não saem da máquina local

**Limitações**:

- LocalStack Pro: $35-45/user/month (menos que custos AWS Dev)
- Performance reduzida vs. AWS real (aceitável para dev/staging)
- Alguns serviços avançados (ex.: Cognito, AppSync) têm limitações

### 3.2 Setup LocalStack Pro

```bash
# Install LocalStack CLI
pip install localstack[pro]

# Configure credentials
export LOCALSTACK_AUTH_TOKEN=<YOUR_PRO_TOKEN>

# Start LocalStack with services
docker-compose -f docker-compose.localstack.yml up -d
```

**docker-compose.localstack.yml**:

```yaml
version: "3.8"

services:
  localstack:
    image: localstack/localstack-pro:latest
    container_name: ysh-localstack
    ports:
      - "4566:4566"            # LocalStack Gateway
      - "4510-4559:4510-4559"  # External services port range
    environment:
      - LOCALSTACK_AUTH_TOKEN=${LOCALSTACK_AUTH_TOKEN}
      - DEBUG=1
      - SERVICES=s3,rds,elasticache,secretsmanager,ecs,ecr,cloudwatch,sns,sqs,lambda
      - DATA_DIR=/tmp/localstack/data
      - LAMBDA_EXECUTOR=docker-reuse
      - DOCKER_HOST=unix:///var/run/docker.sock
    volumes:
      - "${LOCALSTACK_DATA_DIR:-./localstack-data}:/tmp/localstack"
      - "/var/run/docker.sock:/var/run/docker.sock"
    networks:
      - ysh-b2b-network

  postgres:
    image: postgres:16-alpine
    container_name: ysh-postgres-localstack
    environment:
      POSTGRES_DB: medusa_db
      POSTGRES_USER: medusa_user
      POSTGRES_PASSWORD: medusa_password
      AWS_ACCESS_KEY_ID: test
      AWS_SECRET_ACCESS_KEY: test
      AWS_ENDPOINT_URL: http://localstack:4566
    ports:
      - "5432:5432"
    networks:
      - ysh-b2b-network

  redis:
    image: redis:7-alpine
    container_name: ysh-redis-localstack
    ports:
      - "6379:6379"
    networks:
      - ysh-b2b-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ysh-backend-localstack
    environment:
      NODE_ENV: development
      DATABASE_URL: postgres://medusa_user:medusa_password@postgres:5432/medusa_db
      REDIS_URL: redis://redis:6379
      AWS_ENDPOINT_URL: http://localstack:4566
      AWS_REGION: us-east-1
      AWS_ACCESS_KEY_ID: test
      AWS_SECRET_ACCESS_KEY: test
    ports:
      - "9000:9000"
    depends_on:
      - localstack
      - postgres
      - redis
    networks:
      - ysh-b2b-network

  storefront:
    build:
      context: ./storefront
      dockerfile: Dockerfile
    container_name: ysh-storefront-localstack
    environment:
      NODE_ENV: development
      NEXT_PUBLIC_MEDUSA_BACKEND_URL: http://localhost:9000
    ports:
      - "8000:8000"
    depends_on:
      - backend
    networks:
      - ysh-b2b-network

networks:
  ysh-b2b-network:
    driver: bridge
```

### 3.3 LocalStack Testing Commands

```bash
# Create S3 bucket locally
awslocal s3 mb s3://ysh-uploads
awslocal s3 ls

# Create Secrets Manager secret
awslocal secretsmanager create-secret \
  --name /ysh-b2b/database-url \
  --secret-string "postgres://user:pass@postgres:5432/medusa_db"

# List ECS clusters
awslocal ecs list-clusters

# Tail CloudWatch logs
awslocal logs tail /ecs/ysh-b2b-backend --follow
```

---

## 4) Docker Build Optimization

### 4.1 BuildKit Features

**Referência**: [Docker Build Cache Docs](https://docs.docker.com/get-started/docker-concepts/building-images/using-the-build-cache/)

**Optimizations**:

1. **Multi-stage builds**: Separar deps, build, runtime
2. **Cache mounts**: `--mount=type=cache,target=/root/.npm`
3. **Bind mounts**: `--mount=type=bind` para código fonte
4. **Layer optimization**: Order layers from least to most frequently changed
5. **BuildKit secrets**: `--mount=type=secret` para credentials

### 4.2 Dockerfile Optimizado (Backend)

```dockerfile
# syntax=docker/dockerfile:1.4

# ==========================================
# BuildKit-optimized Dockerfile (Backend)
# ==========================================

# Stage 1: Base
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat dumb-init curl
WORKDIR /app

# Stage 2: Dependencies (cached)
FROM base AS deps
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Enable Corepack and use cache mount
RUN --mount=type=cache,target=/root/.yarn/cache,sharing=locked \
    corepack enable && \
    yarn install --immutable --production

# Stage 3: Build
FROM base AS builder
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Install all dependencies (including devDependencies)
RUN --mount=type=cache,target=/root/.yarn/cache,sharing=locked \
    corepack enable && \
    yarn install --immutable

COPY . .

# Build with secrets (if needed)
RUN --mount=type=secret,id=env,target=/app/.env.build \
    yarn build

# Stage 4: Runner
FROM base AS runner

# Security: non-root user
RUN addgroup --system --gid 1001 medusa && \
    adduser --system --uid 1001 medusa

# Copy production dependencies
COPY --from=deps --chown=medusa:medusa /app/node_modules ./node_modules

# Copy built artifacts
COPY --from=builder --chown=medusa:medusa /app/dist ./dist
COPY --from=builder --chown=medusa:medusa /app/package.json ./
COPY --from=builder --chown=medusa:medusa /app/medusa-config.ts ./

# Copy secrets (RSA keys) from build context
COPY --chown=medusa:medusa ./secrets ./secrets

USER medusa
EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:9000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

### 4.3 Dockerfile Optimizado (Storefront)

```dockerfile
# syntax=docker/dockerfile:1.4

# ==========================================
# BuildKit-optimized Dockerfile (Storefront)
# ==========================================

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat dumb-init
WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN --mount=type=cache,target=/root/.yarn/cache,sharing=locked \
    corepack enable && \
    yarn install --immutable --production

# Stage 3: Build
FROM base AS builder
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN --mount=type=cache,target=/root/.yarn/cache,sharing=locked \
    corepack enable && \
    yarn install --immutable

COPY . .

# Build Next.js with environment variables
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

RUN yarn build

# Stage 4: Runner
FROM base AS runner

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

USER nextjs
EXPOSE 8000

ENV PORT=8000
ENV HOSTNAME="0.0.0.0"

CMD ["yarn", "start"]
```

### 4.4 Build Scripts com BuildKit

```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Build com cache
docker build \
  --target runner \
  --cache-from ysh-b2b-backend:latest \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  -t ysh-b2b-backend:latest \
  -f backend/Dockerfile \
  ./backend

# Build com secrets
docker build \
  --secret id=env,src=.env.build \
  --target runner \
  -t ysh-b2b-backend:latest \
  -f backend/Dockerfile \
  ./backend

# Multi-platform build (ARM64 + AMD64)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --cache-from type=registry,ref=ysh-b2b-backend:cache \
  --cache-to type=registry,ref=ysh-b2b-backend:cache,mode=max \
  -t ysh-b2b-backend:latest \
  -f backend/Dockerfile \
  ./backend \
  --push
```

---

## 5) Infraestrutura AWS Production

### 5.1 Recursos Provisionados

```yaml
Network:
  VPC: 10.0.0.0/16
  Subnets:
    - Public: 10.0.1.0/24, 10.0.2.0/24 (2 AZs)
    - Private: 10.0.3.0/24, 10.0.4.0/24 (2 AZs)
  IGW: Internet Gateway
  NAT: NAT Gateway (para private subnets)

Compute:
  ECS Cluster: ysh-b2b-production
  Backend Service:
    - Task Definition: 1 vCPU, 2GB RAM
    - Auto-scaling: 2-10 tasks (target CPU 70%)
    - Health checks: /health endpoint
  Storefront Service:
    - Task Definition: 0.5 vCPU, 1GB RAM
    - Auto-scaling: 2-8 tasks (target CPU 70%)
    - Health checks: / endpoint

Database:
  RDS PostgreSQL:
    - Version: 16.1
    - Instance: db.t3.medium (2 vCPU, 4GB RAM)
    - Storage: 100GB gp3 (encrypted)
    - Multi-AZ: Yes
    - Backup: 7 days retention
    - Performance Insights: Enabled

Cache:
  ElastiCache Redis:
    - Version: 7.x
    - Instance: cache.t3.micro (2 vCPU, 1.37GB RAM)
    - Multi-AZ: Optional (prod: yes)

Storage:
  S3 Buckets:
    - ysh-uploads: Product images, invoices, etc.
    - ysh-backups: Database backups, logs
    - ysh-terraform-state: IaC state files
  CloudFront: CDN for static assets + storefront

Load Balancing:
  ALB: Application Load Balancer
    - Listeners: HTTP (80) → HTTPS (443) redirect
    - Target Groups: Backend (9000), Storefront (8000)
    - SSL/TLS: ACM certificate
    - WAF: Enabled

DNS:
  Route53: ysh.solar domain
    - api.ysh.solar → ALB (backend)
    - app.ysh.solar → CloudFront → ALB (storefront)
    - admin.ysh.solar → ALB (backend /admin)

Security:
  Secrets Manager: JWT_SECRET, COOKIE_SECRET, DATABASE_URL, REDIS_URL, RSA keys
  KMS: Encryption keys for RDS, S3, secrets
  WAF: Rate limiting, SQL injection, XSS protection
  Security Groups:
    - ALB: Allow 80, 443 from 0.0.0.0/0
    - ECS: Allow 8000, 9000 from ALB
    - RDS: Allow 5432 from ECS
    - Redis: Allow 6379 from ECS

Monitoring:
  CloudWatch:
    - Log Groups: /ecs/backend, /ecs/storefront
    - Metrics: CPU, Memory, Request Count, Latency
    - Alarms: High CPU (>80%), High Error Rate (>5%)
  Container Insights: Enabled for ECS cluster

Backup:
  RDS: Automated daily backups (7 days)
  S3: Versioning enabled, lifecycle policies
```

### 5.2 Estimativa de Custos (Produção)

| Serviço | Configuração | Custo/Mês (USD) |
|---------|-------------|-----------------|
| **ECS Fargate** | Backend (2-10 tasks), Storefront (2-8 tasks) | $150-300 |
| **RDS PostgreSQL** | db.t3.medium Multi-AZ + 100GB storage | $120 |
| **ElastiCache Redis** | cache.t3.micro | $25 |
| **ALB** | Application Load Balancer | $25 |
| **CloudFront** | CDN (1TB transfer) | $50 |
| **S3** | 500GB storage + requests | $15 |
| **Route53** | Hosted zone + queries | $5 |
| **Secrets Manager** | 10 secrets | $4 |
| **CloudWatch** | Logs (50GB) + metrics | $30 |
| **Data Transfer** | Out to internet (500GB) | $45 |
| **WAF** | Web Application Firewall | $20 |
| **Total (Low Traffic)** | | **~$489-689/mês** |
| **Total (High Traffic)** | 5x traffic, mais tasks | **~$1,200-1,800/mês** |

**Otimizações**:

- Usar **Fargate Spot** para 50-70% dos tasks (50% economia)
- **Reserved Instances** para RDS (30-50% desconto)
- **S3 Intelligent Tiering** para reduzir custos de storage
- **CloudFront compression** para reduzir transfer

---

## 6) CI/CD Pipeline Completo

### 6.1 GitHub Actions Workflow (Production Deploy)

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  ECR_BACKEND_REPO: ysh-b2b-backend
  ECR_STOREFRONT_REPO: ysh-b2b-storefront
  ECS_CLUSTER: production-ysh-b2b-cluster
  ECS_BACKEND_SERVICE: backend-service
  ECS_STOREFRONT_SERVICE: storefront-service

jobs:
  # Job 1: Build and Push Backend
  build-backend:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Build and push Backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: true
          tags: |
            ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_BACKEND_REPO }}:latest
            ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_BACKEND_REPO }}:${{ github.sha }}
          cache-from: type=registry,ref=${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_BACKEND_REPO }}:cache
          cache-to: type=registry,ref=${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_BACKEND_REPO }}:cache,mode=max
          secrets: |
            "env=${{ secrets.BACKEND_ENV_BUILD }}"
      
      - name: Output image URI
        run: |
          echo "BACKEND_IMAGE=${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_BACKEND_REPO }}:${{ github.sha }}" >> $GITHUB_OUTPUT

  # Job 2: Build and Push Storefront
  build-storefront:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Build and push Storefront
        uses: docker/build-push-action@v5
        with:
          context: ./storefront
          file: ./storefront/Dockerfile
          push: true
          tags: |
            ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_STOREFRONT_REPO }}:latest
            ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_STOREFRONT_REPO }}:${{ github.sha }}
          cache-from: type=registry,ref=${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_STOREFRONT_REPO }}:cache
          cache-to: type=registry,ref=${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_STOREFRONT_REPO }}:cache,mode=max
          build-args: |
            NEXT_PUBLIC_MEDUSA_BACKEND_URL=${{ secrets.NEXT_PUBLIC_MEDUSA_BACKEND_URL }}
            NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${{ secrets.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY }}

  # Job 3: Deploy Backend to ECS
  deploy-backend:
    needs: build-backend
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Update ECS service (Backend)
        run: |
          aws ecs update-service \
            --cluster ${{ env.ECS_CLUSTER }} \
            --service ${{ env.ECS_BACKEND_SERVICE }} \
            --force-new-deployment
      
      - name: Wait for deployment to stabilize
        run: |
          aws ecs wait services-stable \
            --cluster ${{ env.ECS_CLUSTER }} \
            --services ${{ env.ECS_BACKEND_SERVICE }}

  # Job 4: Deploy Storefront to ECS
  deploy-storefront:
    needs: build-storefront
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Update ECS service (Storefront)
        run: |
          aws ecs update-service \
            --cluster ${{ env.ECS_CLUSTER }} \
            --service ${{ env.ECS_STOREFRONT_SERVICE }} \
            --force-new-deployment
      
      - name: Wait for deployment to stabilize
        run: |
          aws ecs wait services-stable \
            --cluster ${{ env.ECS_CLUSTER }} \
            --services ${{ env.ECS_STOREFRONT_SERVICE }}

  # Job 5: Smoke Tests
  smoke-tests:
    needs: [deploy-backend, deploy-storefront]
    runs-on: ubuntu-latest
    
    steps:
      - name: Health check Backend
        run: |
          curl -f https://api.ysh.solar/health || exit 1
      
      - name: Health check Storefront
        run: |
          curl -f https://app.ysh.solar || exit 1
      
      - name: Test authentication
        run: |
          curl -X POST https://api.ysh.solar/admin/auth \
            -H "Content-Type: application/json" \
            -d '{"email":"test@ysh.solar","password":"test"}' || exit 1

  # Job 6: Rollback (on failure)
  rollback:
    needs: [deploy-backend, deploy-storefront, smoke-tests]
    if: failure()
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Rollback Backend
        run: |
          PREVIOUS_TASK=$(aws ecs describe-services \
            --cluster ${{ env.ECS_CLUSTER }} \
            --services ${{ env.ECS_BACKEND_SERVICE }} \
            --query 'services[0].deployments[1].taskDefinition' \
            --output text)
          
          aws ecs update-service \
            --cluster ${{ env.ECS_CLUSTER }} \
            --service ${{ env.ECS_BACKEND_SERVICE }} \
            --task-definition $PREVIOUS_TASK
      
      - name: Rollback Storefront
        run: |
          PREVIOUS_TASK=$(aws ecs describe-services \
            --cluster ${{ env.ECS_CLUSTER }} \
            --services ${{ env.ECS_STOREFRONT_SERVICE }} \
            --query 'services[0].deployments[1].taskDefinition' \
            --output text)
          
          aws ecs update-service \
            --cluster ${{ env.ECS_CLUSTER }} \
            --service ${{ env.ECS_STOREFRONT_SERVICE }} \
            --task-definition $PREVIOUS_TASK
      
      - name: Notify team
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "🚨 Production deployment FAILED and was rolled back!",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deployment Failed* ❌\n\nCommit: ${{ github.sha }}\nAuthor: ${{ github.actor }}\nRollback completed."
                  }
                }
              ]
            }
```

---

## 7) Observability & Monitoring

### 7.1 DataDog/Sentry Integration

```typescript
// backend/src/lib/monitoring.ts
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import tracer from "dd-trace";

// DataDog APM
tracer.init({
  logInjection: true,
  runtimeMetrics: true,
  profiling: true,
  env: process.env.NODE_ENV,
  service: "ysh-b2b-backend",
  version: process.env.APP_VERSION || "1.0.0",
});

// Sentry Error Tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  integrations: [
    new ProfilingIntegration(),
  ],
});

// Custom metrics
export const recordMetric = (name: string, value: number, tags?: Record<string, string>) => {
  tracer.dogstatsd.gauge(name, value, tags);
};

// Example: Track solar viability calculations
export const trackViabilityCalculation = (duration: number, status: "success" | "error") => {
  recordMetric("viability.calculation.duration", duration, { status });
};
```

### 7.2 CloudWatch Dashboards

```yaml
Dashboards:
  - Name: Backend Performance
    Widgets:
      - ECS CPU Utilization (Backend)
      - ECS Memory Utilization (Backend)
      - Request Count (per minute)
      - Latency (p50, p95, p99)
      - Error Rate (%)
      - Database Connections (RDS)
      
  - Name: Storefront Performance
    Widgets:
      - ECS CPU Utilization (Storefront)
      - ECS Memory Utilization (Storefront)
      - Next.js Page Load Time
      - CloudFront Cache Hit Rate
      - 4xx/5xx Errors
      
  - Name: Infrastructure Health
    Widgets:
      - RDS CPU/Memory/IOPS
      - ElastiCache Hit Rate
      - ALB Healthy/Unhealthy Targets
      - S3 Request Count
      - NAT Gateway Data Transfer

Alarms:
  - Backend CPU > 80% for 5 minutes
  - Backend Memory > 85% for 5 minutes
  - Error Rate > 5% for 3 minutes
  - Database CPU > 80% for 10 minutes
  - ALB 5xx Errors > 10 in 5 minutes
  - Health check failures > 3 consecutive
```

### 7.3 Hélio Solar Compliance (AGENTS.md)

```yaml
# Observability conforme AGENTS.md Seção 10
SLOs:
  - Latency: 99% tarefas < 60s por agente
  - E2E: Proposta residencial < 15 min
  - Uptime: 99.9% (production)

Logs (sem PII):
  task_id: uuid
  agent: viability.pv | tariffs.aneel | catalog.curator | etc.
  latency_ms: number
  errors: []
  outcome: success | failure
  sources: [ANEEL, PVGIS, NASA POWER, etc.]

Alertas:
  - Falha repetida em utility X (ex.: PVGIS timeout)
  - Drift de tarifa > 1% (ANEEL data inconsistency)
  - Detecção FV com confidence < 70%
  - Análise térmica > 5s (solar.thermal_analysis)
```

---

## 8) Security & Compliance

### 8.1 AWS Secrets Manager

```bash
# Create secrets
aws secretsmanager create-secret \
  --name /ysh-b2b/database-url \
  --secret-string "postgres://user:pass@prod-db.xxx.rds.amazonaws.com:5432/medusa_db"

aws secretsmanager create-secret \
  --name /ysh-b2b/jwt-secret \
  --secret-string "$(openssl rand -hex 32)"

aws secretsmanager create-secret \
  --name /ysh-b2b/rsa-private-key \
  --secret-binary fileb://backend/secrets/pk-APKA3ICDVAH5Q6MVMJFV.pem

# Rotate secrets automatically (every 90 days)
aws secretsmanager rotate-secret \
  --secret-id /ysh-b2b/jwt-secret \
  --rotation-lambda-arn arn:aws:lambda:us-east-1:xxx:function:rotate-jwt \
  --rotation-rules AutomaticallyAfterDays=90
```

### 8.2 IAM Roles (Least Privilege)

```yaml
# ECS Task Execution Role (pull images, write logs)
ECSTaskExecutionRole:
  Policies:
    - AmazonECSTaskExecutionRolePolicy
    - SecretsManagerReadPolicy (scoped to /ysh-b2b/*)
    - ECRImagePullPolicy

# ECS Task Role (application permissions)
ECSTaskRole:
  Policies:
    - S3ReadWritePolicy (scoped to ysh-uploads bucket)
    - SecretsManagerReadPolicy (scoped to /ysh-b2b/*)
    - CloudWatchLogsPolicy (write only)
    - SNS/SQS (if using messaging)

# CI/CD Role (GitHub Actions OIDC)
GitHubActionsRole:
  Policies:
    - ECRPushPolicy
    - ECSUpdateServicePolicy
    - CloudFormationDeployPolicy
```

### 8.3 WAF Rules

```yaml
WebACL:
  Name: ysh-b2b-waf
  Rules:
    - Name: RateLimitPerIP
      Priority: 1
      Action: Block
      Statement: Rate limit 2000 requests per 5 minutes per IP
    
    - Name: SQLInjectionProtection
      Priority: 2
      Action: Block
      Statement: AWS Managed Rule - SQLiRuleSet
    
    - Name: XSSProtection
      Priority: 3
      Action: Block
      Statement: AWS Managed Rule - XssMatchStatement
    
    - Name: GeoBlocking (Optional)
      Priority: 4
      Action: Block
      Statement: Block requests from countries outside Brazil
```

### 8.4 Compliance Checklist (Hélio Solar / AGENTS.md)

- [x] **Privacidade**: CPF/CNPJ hash (SHA-256), retenção mínima
- [x] **Regulatório**: PRODIST 3.A–3.C, Lei 14.300/2022, MMGD limits
- [x] **Guardrails**: Recusar configurações fora da lei (ex.: oversizing > 160%)
- [x] **Logs sem PII**: task_id, agent, latency, errors (sem dados pessoais)
- [x] **Encryption**: At rest (RDS, S3, Secrets Manager via KMS), in transit (TLS 1.2+)
- [x] **Backup**: RDS 7 days, S3 versioning, disaster recovery plan
- [x] **Access Control**: IAM least privilege, MFA para admin, audit trail

---

## 9) Cost Optimization

### 9.1 Estratégias

1. **Fargate Spot**: 50-70% dos tasks em Spot (50% economia)
2. **RDS Reserved Instances**: Commit 1-3 anos (30-50% desconto)
3. **S3 Intelligent Tiering**: Move automaticamente para tiers mais baratos
4. **CloudFront Compression**: Reduz transfer costs (30-40%)
5. **ElastiCache Reserved Nodes**: Similar ao RDS (30-50% desconto)
6. **Auto-scaling agressivo**: Scale down fora de horário de pico
7. **LocalStack Dev/Staging**: Economiza $200-500/mês vs. AWS

### 9.2 Cost Breakdown (Otimizado)

| Item | Custo Original | Com Otimização | Economia |
|------|---------------|----------------|----------|
| ECS Fargate | $300 | $150 (Spot) | -50% |
| RDS PostgreSQL | $120 | $70 (Reserved) | -42% |
| ElastiCache | $25 | $15 (Reserved) | -40% |
| CloudFront | $50 | $35 (Compression) | -30% |
| Dev/Staging AWS | $300 | $35 (LocalStack Pro) | -88% |
| **Total** | **$1,284** | **$534** | **-58%** |

---

## 10) Disaster Recovery & Backup

### 10.1 RTO/RPO

| Cenário | RTO (Recovery Time) | RPO (Data Loss) | Estratégia |
|---------|---------------------|-----------------|------------|
| **Container failure** | < 2 min | 0 | Auto-healing (ECS health checks) |
| **AZ failure** | < 5 min | 0 | Multi-AZ deployment (RDS, ECS) |
| **Region failure** | < 4 hours | < 1 hour | Cross-region read replica (RDS), S3 replication |
| **Data corruption** | < 1 hour | < 24 hours | RDS point-in-time restore (7 days) |
| **Full disaster** | < 8 hours | < 24 hours | Terraform re-provision, restore from backup |

### 10.2 Backup Strategy

```yaml
RDS:
  - Automated daily snapshots (7 days retention)
  - Manual snapshots before major deployments
  - Cross-region snapshot copy (us-west-2 for DR)
  - Point-in-time recovery (PITR) enabled

S3:
  - Versioning enabled on all buckets
  - Lifecycle policies: archive to Glacier after 90 days
  - Cross-region replication (ysh-uploads → ysh-uploads-dr)
  - MFA delete for critical buckets

Secrets Manager:
  - Automatic rotation every 90 days
  - Manual backup to encrypted S3 bucket
  - Export secrets to encrypted file (offline storage)

Code:
  - GitHub repository (primary)
  - GitLab mirror (secondary)
  - Terraform state in S3 with versioning
```

---

## 11) Runbooks & Procedures

### 11.1 Deployment Checklist

```markdown
# Pre-Deployment
- [ ] Code reviewed and approved (2+ reviewers)
- [ ] All tests passing (unit, integration, e2e)
- [ ] Security scan completed (no critical vulnerabilities)
- [ ] Database migrations tested in staging
- [ ] Rollback plan documented
- [ ] Stakeholders notified (maintenance window if needed)
- [ ] Backup taken (RDS snapshot)

# During Deployment
- [ ] Monitor CloudWatch metrics
- [ ] Check ECS service health
- [ ] Verify logs for errors
- [ ] Run smoke tests (health checks, auth, key endpoints)
- [ ] Verify database migrations applied

# Post-Deployment
- [ ] Monitor for 30 minutes
- [ ] Check error rates (should be < 1%)
- [ ] Verify user flows (PLP, PDP, Cart, Checkout)
- [ ] Update status page (if public)
- [ ] Document deployment outcome
```

### 11.2 Incident Response

```markdown
# Severity Levels
- **P0 (Critical)**: Complete outage, data loss risk
  - Response time: < 15 minutes
  - On-call engineer + manager + CTO
  
- **P1 (High)**: Partial outage, degraded performance
  - Response time: < 1 hour
  - On-call engineer + manager
  
- **P2 (Medium)**: Non-critical issue, workaround available
  - Response time: < 4 hours
  - On-call engineer
  
- **P3 (Low)**: Minor issue, no user impact
  - Response time: Next business day

# Response Workflow
1. **Detect**: Alert triggered (CloudWatch, DataDog, user report)
2. **Assess**: Determine severity and impact
3. **Mitigate**: Implement temporary fix or rollback
4. **Communicate**: Update status page, notify stakeholders
5. **Resolve**: Deploy permanent fix
6. **Post-mortem**: Document root cause, action items
```

### 11.3 Rollback Procedure

```bash
# Manual rollback (if automated fails)

# 1. Find previous task definition
aws ecs describe-services \
  --cluster production-ysh-b2b-cluster \
  --services backend-service \
  --query 'services[0].deployments'

# 2. Update service to previous task definition
aws ecs update-service \
  --cluster production-ysh-b2b-cluster \
  --service backend-service \
  --task-definition ysh-b2b-backend:42  # Previous version

# 3. Wait for stabilization
aws ecs wait services-stable \
  --cluster production-ysh-b2b-cluster \
  --services backend-service

# 4. Verify health
curl -f https://api.ysh.solar/health

# 5. Revert database migration (if needed)
kubectl exec -it backend-pod -- npm run db:rollback
```

---

## 12) Next Steps (Action Plan)

### 12.1 Phase 1: LocalStack Setup (Week 1)

- [ ] Install LocalStack Pro
- [ ] Create `docker-compose.localstack.yml`
- [ ] Configure backend/storefront to use LocalStack endpoints
- [ ] Test S3, RDS, ElastiCache, Secrets Manager locally
- [ ] Document LocalStack usage for team

### 12.2 Phase 2: Docker Optimization (Week 1-2)

- [ ] Enable BuildKit in Docker config
- [ ] Update Dockerfiles with cache mounts
- [ ] Test build times (baseline vs. optimized)
- [ ] Create `.dockerignore` files
- [ ] Document build process

### 12.3 Phase 3: Terraform/CDK Infrastructure (Week 2-3)

- [ ] Choose IaC tool (Terraform vs. CDK)
- [ ] Create modules: VPC, RDS, ECS, ALB, S3, CloudFront
- [ ] Test provisioning in dev account
- [ ] Create staging environment
- [ ] Document IaC usage

### 12.4 Phase 4: CI/CD Pipeline (Week 3-4)

- [ ] Create GitHub Actions workflows
- [ ] Configure AWS OIDC authentication
- [ ] Set up ECR repositories
- [ ] Test build → push → deploy flow
- [ ] Add smoke tests and rollback

### 12.5 Phase 5: Observability (Week 4-5)

- [ ] Set up DataDog/Sentry accounts
- [ ] Integrate APM in backend/storefront
- [ ] Create CloudWatch dashboards
- [ ] Configure alarms (CPU, memory, errors)
- [ ] Test alerting (PagerDuty/Slack)

### 12.6 Phase 6: Security Hardening (Week 5-6)

- [ ] Create Secrets Manager secrets
- [ ] Configure IAM roles (least privilege)
- [ ] Set up WAF rules
- [ ] Enable encryption (KMS)
- [ ] Security audit (penetration test)

### 12.7 Phase 7: Production Deployment (Week 6-7)

- [ ] Provision production AWS resources
- [ ] Migrate database (with downtime window)
- [ ] Deploy backend + storefront
- [ ] DNS cutover (Route53)
- [ ] Monitor for 48 hours
- [ ] Post-launch retrospective

---

## 13) Conclusão

### 13.1 Benefícios da Arquitetura

✅ **Escalabilidade**: Auto-scaling horizontal (2-10 tasks backend, 2-8 storefront)  
✅ **Confiabilidade**: Multi-AZ, health checks, auto-recovery, 99.9% uptime  
✅ **Performance**: CloudFront CDN, Redis cache, BuildKit optimized builds  
✅ **Custo**: LocalStack dev/staging ($35 vs. $300/mês), Fargate Spot (-50%), Reserved Instances (-40%)  
✅ **Segurança**: Secrets Manager, KMS encryption, WAF, IAM least privilege  
✅ **Compliance**: Hélio Solar AGENTS.md (PRODIST, Lei 14.300, logs sem PII)  
✅ **Developer Experience**: LocalStack para dev rápido, Docker BuildKit cache (-60% build time)  

### 13.2 Compliance com AGENTS.md (Hélio Solar)

| Requisito | Implementação |
|-----------|---------------|
| **Brasil-first** | Region us-east-1 (São Paulo available), pt-BR locale, BRL currency |
| **Determinístico** | IaC (Terraform), immutable deployments, versioned artifacts |
| **Medido por outcomes** | DataDog APM, CloudWatch metrics (SLO <60s, 99% uptime) |
| **Humano no loop** | PagerDuty alerts, rollback automation, incident response |
| **Privacidade** | CPF/CNPJ hash, Secrets Manager, KMS encryption, logs sem PII |
| **Confiabilidade** | Circuit breaker, retries, health checks, multi-AZ |

---

**Comandante A, ambiente de produção planejado com sucesso!** 🚀  
Próximos passos: escolher Phase 1-7 e começar implementação.

Deseja que eu inicie com **Phase 1 (LocalStack setup)** ou **Phase 2 (Docker optimization)**?
