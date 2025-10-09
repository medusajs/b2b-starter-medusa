# 🚀 Guia de Deployment para Produção - YSH B2B

**Data**: 08/10/2025  
**Status**: 🔄 **EM PROGRESSO** - Build de imagens  
**Objetivo**: Deploy completo em AWS ECS/Fargate

---

## 📋 Checklist de Deployment

### ✅ Fase 1: Preparação (COMPLETA)

- [x] Remover dependência ysh-erp
- [x] Migrar catálogo para backend/data
- [x] Atualizar configurações (medusa-config.ts, scripts)
- [x] Otimizar Dockerfiles (health checks nativos)
- [x] Validar localmente (556 produtos, módulos carregados)
- [x] Criar documentação completa (800+ linhas)

### 🔄 Fase 2: Build de Imagens (EM PROGRESSO)

- [🔄] Build imagem backend (em andamento)
- [ ] Build imagem storefront
- [ ] Verificar tamanhos e integridade

### ⏳ Fase 3: Push para ECR (PENDENTE)

- [ ] Login no AWS ECR (perfil ysh-production)
- [ ] Tag imagem backend
- [ ] Push backend para ECR
- [ ] Tag imagem storefront
- [ ] Push storefront para ECR
- [ ] Verificar imagens no ECR

### ⏳ Fase 4: ECS Task Definitions (PENDENTE)

- [ ] Criar task definition para backend
- [ ] Criar task definition para storefront
- [ ] Configurar variáveis de ambiente
- [ ] Configurar secrets (DATABASE_URL, JWT_SECRET, etc.)
- [ ] Registrar task definitions no ECS

### ⏳ Fase 5: ECS Services (PENDENTE)

- [ ] Criar service backend (1-2 tasks)
- [ ] Criar service storefront (1-2 tasks)
- [ ] Conectar ao ALB
- [ ] Configurar auto-scaling (opcional)
- [ ] Configurar CloudWatch logs

### ⏳ Fase 6: Validação em Produção (PENDENTE)

- [ ] Testar endpoint backend via ALB
- [ ] Testar storefront via ALB/CloudFront
- [ ] Verificar logs no CloudWatch
- [ ] Confirmar health checks (>99%)
- [ ] Testar importação de catálogo
- [ ] Validar performance (startup <40s)

---

## 🐳 Comandos de Build

### Backend

```powershell
cd C:\Users\fjuni\ysh_medusa\ysh-store\backend
docker build -t ysh-b2b-backend:latest .
```

**Estimativa**: ~3-5 minutos  
**Tamanho esperado**: ~420MB

### Storefront

```powershell
cd C:\Users\fjuni\ysh_medusa\ysh-store\storefront
docker build -t ysh-b2b-storefront:latest .
```

**Estimativa**: ~2-3 minutos  
**Tamanho esperado**: ~180MB

---

## 📤 Comandos de Push para ECR

### Autenticação

```powershell
aws ecr get-login-password --region us-east-1 --profile ysh-production | `
  docker login --username AWS --password-stdin 773235999227.dkr.ecr.us-east-1.amazonaws.com
```

### Backend

```powershell
docker tag ysh-b2b-backend:latest 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-backend:latest
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-backend:latest
```

### Storefront

```powershell
docker tag ysh-b2b-storefront:latest 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-storefront:latest
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-storefront:latest
```

**Script automatizado**: `.\push-to-ecr.ps1`

---

## 📝 ECS Task Definition - Backend

```json
{
  "family": "ysh-b2b-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-backend:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 9000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "9000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:773235999227:secret:ysh-b2b/database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:773235999227:secret:ysh-b2b/jwt-secret"
        },
        {
          "name": "COOKIE_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:773235999227:secret:ysh-b2b/cookie-secret"
        },
        {
          "name": "REDIS_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:773235999227:secret:ysh-b2b/redis-url"
        }
      ],
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "node -e \"require('http').get('http://localhost:9000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))\""
        ],
        "interval": 30,
        "timeout": 10,
        "retries": 3,
        "startPeriod": 90
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ysh-b2b-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

---

## 📝 ECS Task Definition - Storefront

```json
{
  "family": "ysh-b2b-storefront",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "storefront",
      "image": "773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-storefront:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "NEXT_PUBLIC_MEDUSA_BACKEND_URL",
          "value": "https://api.ysh-b2b.com"
        },
        {
          "name": "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
          "value": "pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d"
        }
      ],
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "node -e \"require('http').get('http://localhost:8000/', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))\""
        ],
        "interval": 30,
        "timeout": 10,
        "retries": 3,
        "startPeriod": 60
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ysh-b2b-storefront",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

---

## 🌐 Comandos AWS CLI

### Registrar Task Definitions

```bash
# Backend
aws ecs register-task-definition \
  --cli-input-json file://backend-task-definition.json \
  --region us-east-1 \
  --profile ysh-production

# Storefront
aws ecs register-task-definition \
  --cli-input-json file://storefront-task-definition.json \
  --region us-east-1 \
  --profile ysh-production
```

### Criar Services

```bash
# Backend Service
aws ecs create-service \
  --cluster ysh-b2b-cluster \
  --service-name ysh-b2b-backend \
  --task-definition ysh-b2b-backend:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:773235999227:targetgroup/ysh-b2b-backend-tg/xxx,containerName=backend,containerPort=9000" \
  --region us-east-1 \
  --profile ysh-production

# Storefront Service
aws ecs create-service \
  --cluster ysh-b2b-cluster \
  --service-name ysh-b2b-storefront \
  --task-definition ysh-b2b-storefront:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:773235999227:targetgroup/ysh-b2b-storefront-tg/xxx,containerName=storefront,containerPort=8000" \
  --region us-east-1 \
  --profile ysh-production
```

---

## 📊 Métricas de Validação

### Performance Targets

| Métrica | Target | Como Medir |
|---------|--------|------------|
| **Cold Start** | <40s | CloudWatch Container Insights |
| **Health Check Success** | >99% | ECS Service Metrics |
| **API Response Time** | <200ms | ALB Metrics |
| **Memory Usage** | <80% | Container Insights |
| **CPU Usage** | <70% | Container Insights |

### Cost Estimates (Monthly)

```
Compute (ECS Fargate):
  Backend (512 CPU, 1024 MB) × 1 task  = ~$15/mês
  Storefront (256 CPU, 512 MB) × 1 task = ~$7/mês
  Total Compute: $22/mês

Database (RDS):
  db.t3.micro (PostgreSQL): $0/mês (Free Tier)
  Após 12 meses: $14.71/mês

Storage:
  S3 (uploads): $0/mês (<5GB)
  ECR: $0/mês (<500MB)

Network:
  ALB: $16/mês + $0.008/LCU ≈ $20/mês
  Data Transfer: ~$5/mês

TOTAL ESTIMADO: ~$47/mês (com Free Tier)
                ~$67/mês (pós Free Tier)
```

---

## 🔍 Troubleshooting

### Imagem não builda

- Verificar Dockerfile existe no diretório
- Verificar dependências (python3, make, g++)
- Tentar build com `--no-cache`

### Push para ECR falha

- Verificar credenciais AWS (`aws sts get-caller-identity`)
- Verificar repositório existe no ECR
- Verificar permissões IAM

### Task não inicia

- Verificar logs no CloudWatch
- Verificar variáveis de ambiente
- Verificar secrets no Secrets Manager
- Verificar network configuration (subnets, security groups)

### Health check falha

- Verificar porta está exposta corretamente
- Verificar aplicação responde em /health
- Aumentar startPeriod se necessário

---

## 📚 Documentação Relacionada

- **MIGRATION_ERP_REMOVAL.md**: Detalhes da migração
- **VALIDATION_REPORT.md**: Resultados da validação local
- **DEPLOYMENT_OPTIMIZATION_SUMMARY.md**: Resumo executivo
- **backend/data/catalog/README.md**: Documentação do catálogo

---

## ✅ Próximos Passos

1. **Aguardar build das imagens** (em progresso)
2. **Executar `.\push-to-ecr.ps1`**
3. **Criar task definitions** (usar JSONs acima)
4. **Criar services no ECS**
5. **Validar deployment**
6. **Monitorar performance**
7. **Ajustar auto-scaling se necessário**

---

**Criado em**: 08/10/2025 21:45  
**Status Atual**: 🔄 Aguardando build backend completar  
**Próxima Ação**: Push para ECR após builds
