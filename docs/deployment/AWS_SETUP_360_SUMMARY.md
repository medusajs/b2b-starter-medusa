# 🎉 Setup 360º AWS - Completo

**Data**: 08/10/2025  
**Account ID**: 773235999227  
**Region**: us-east-1  
**Profile**: ysh-production

---

## ✅ Recursos Criados

### 📦 S3 Buckets (3)

```tsx
✅ ysh-b2b-uploads           - Arquivos do aplicativo (uploads de usuários)
✅ ysh-b2b-backups           - Backups de banco de dados
✅ ysh-b2b-terraform-state   - Terraform remote state
```

**Configurações aplicadas:**

- ✅ Public access bloqueado (todos os buckets)
- ✅ Versionamento habilitado
- ✅ Lifecycle policies (30 dias para Glacier)

### 🐳 ECR Repositories (2)

```tsx
✅ ysh-b2b-backend
   URI: 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-backend
   
✅ ysh-b2b-storefront
   URI: 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-storefront
```

**Configurações aplicadas:**

- ✅ Image scanning habilitado (scanOnPush=true)
- ✅ Tag immutability habilitado
- ✅ Lifecycle policy (manter últimas 10 imagens)

### 🔐 Secrets Manager (5)

```tsx
✅ /ysh-b2b/jwt-secret          - JWT para autenticação Medusa
✅ /ysh-b2b/cookie-secret       - Cookie secret para sessões
✅ /ysh-b2b/database-url        - Connection string PostgreSQL
✅ /ysh-b2b/database-password   - Password do RDS (gerado automaticamente)
✅ /ysh-b2b/redis-url           - Connection string Redis
```

### 🗄️ RDS PostgreSQL

```tsx
✅ ysh-b2b-postgres-free
   Instance Class: db.t3.micro (Free Tier)
   Storage: 20GB gp2 (Free Tier)
   Engine: PostgreSQL 16.1
   Multi-AZ: No (mantém Free Tier)
   Public Access: Yes (para desenvolvimento)
   Backup Retention: 7 dias
   Status: creating ⏳ (aguardar 5-10 minutos)
```

**Comandos úteis:**

```powershell
# Verificar status
aws rds describe-db-instances `
  --db-instance-identifier ysh-b2b-postgres-free `
  --query "DBInstances[0].DBInstanceStatus" `
  --profile ysh-production `
  --output text

# Obter endpoint (quando disponível)
aws rds describe-db-instances `
  --db-instance-identifier ysh-b2b-postgres-free `
  --query "DBInstances[0].Endpoint.Address" `
  --profile ysh-production `
  --output text

# Aguardar ficar disponível
aws rds wait db-instance-available `
  --db-instance-identifier ysh-b2b-postgres-free `
  --profile ysh-production
```

### ☁️ ECS Cluster

```tsx
✅ ysh-b2b-cluster
   Status: ACTIVE
   Capacity Providers: FARGATE, FARGATE_SPOT
```

---

## 🚀 Próximos Passos

### 1️⃣ Aguardar RDS Ficar Disponível

```powershell
# Monitorar status (aguardar mudar de "creating" para "available")
aws rds describe-db-instances `
  --db-instance-identifier ysh-b2b-postgres-free `
  --query "DBInstances[0].{Status:DBInstanceStatus,Endpoint:Endpoint.Address}" `
  --profile ysh-production `
  --output table

# Quando disponível, atualizar secret com endpoint real
$rdsEndpoint = aws rds describe-db-instances `
  --db-instance-identifier ysh-b2b-postgres-free `
  --query "DBInstances[0].Endpoint.Address" `
  --profile ysh-production `
  --output text

$dbPassword = aws secretsmanager get-secret-value `
  --secret-id /ysh-b2b/database-password `
  --query SecretString `
  --profile ysh-production `
  --output text

aws secretsmanager update-secret `
  --secret-id /ysh-b2b/database-url `
  --secret-string "postgresql://medusa_user:$dbPassword@${rdsEndpoint}:5432/postgres" `
  --profile ysh-production
```

### 2️⃣ Build e Push Docker Images

```powershell
# Login no ECR
aws ecr get-login-password --region us-east-1 --profile ysh-production | `
  docker login --username AWS --password-stdin 773235999227.dkr.ecr.us-east-1.amazonaws.com

# Build Backend
cd backend
docker build -t ysh-b2b-backend:latest .
docker tag ysh-b2b-backend:latest 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-backend:latest
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-backend:latest

# Build Storefront
cd ../storefront
docker build -t ysh-b2b-storefront:latest .
docker tag ysh-b2b-storefront:latest 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-storefront:latest
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-storefront:latest
```

### 3️⃣ Criar VPC e Security Groups

```powershell
# Criar VPC (ou usar default)
$vpcId = aws ec2 create-vpc `
  --cidr-block 10.0.0.0/16 `
  --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=ysh-b2b-vpc}]" `
  --profile ysh-production `
  --query 'Vpc.VpcId' `
  --output text

# Criar Subnets (2 AZs para ALB)
$subnet1 = aws ec2 create-subnet `
  --vpc-id $vpcId `
  --cidr-block 10.0.1.0/24 `
  --availability-zone us-east-1a `
  --profile ysh-production `
  --query 'Subnet.SubnetId' `
  --output text

$subnet2 = aws ec2 create-subnet `
  --vpc-id $vpcId `
  --cidr-block 10.0.2.0/24 `
  --availability-zone us-east-1b `
  --profile ysh-production `
  --query 'Subnet.SubnetId' `
  --output text

# Criar Security Group para ECS
$sgEcs = aws ec2 create-security-group `
  --group-name ysh-b2b-ecs-sg `
  --description "Security group for YSH B2B ECS tasks" `
  --vpc-id $vpcId `
  --profile ysh-production `
  --query 'GroupId' `
  --output text

# Permitir tráfego HTTP/HTTPS
aws ec2 authorize-security-group-ingress `
  --group-id $sgEcs `
  --protocol tcp `
  --port 80 `
  --cidr 0.0.0.0/0 `
  --profile ysh-production

aws ec2 authorize-security-group-ingress `
  --group-id $sgEcs `
  --protocol tcp `
  --port 443 `
  --cidr 0.0.0.0/0 `
  --profile ysh-production
```

### 4️⃣ Criar Application Load Balancer

```powershell
# Criar ALB
$albArn = aws elbv2 create-load-balancer `
  --name ysh-b2b-alb `
  --subnets $subnet1 $subnet2 `
  --security-groups $sgEcs `
  --scheme internet-facing `
  --type application `
  --ip-address-type ipv4 `
  --profile ysh-production `
  --query 'LoadBalancers[0].LoadBalancerArn' `
  --output text

# Criar Target Group para Backend
$tgBackend = aws elbv2 create-target-group `
  --name ysh-b2b-backend-tg `
  --protocol HTTP `
  --port 9000 `
  --vpc-id $vpcId `
  --target-type ip `
  --health-check-path /health `
  --profile ysh-production `
  --query 'TargetGroups[0].TargetGroupArn' `
  --output text

# Criar Target Group para Storefront
$tgStorefront = aws elbv2 create-target-group `
  --name ysh-b2b-storefront-tg `
  --protocol HTTP `
  --port 8000 `
  --vpc-id $vpcId `
  --target-type ip `
  --health-check-path / `
  --profile ysh-production `
  --query 'TargetGroups[0].TargetGroupArn' `
  --output text

# Criar Listener HTTP (porta 80)
aws elbv2 create-listener `
  --load-balancer-arn $albArn `
  --protocol HTTP `
  --port 80 `
  --default-actions Type=forward,TargetGroupArn=$tgStorefront `
  --profile ysh-production
```

### 5️⃣ Criar ECS Task Definitions

**Backend Task Definition** (`backend-task-def.json`):

```json
{
  "family": "ysh-b2b-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::773235999227:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::773235999227:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-backend:latest",
      "portMappings": [
        {
          "containerPort": 9000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:773235999227:secret:/ysh-b2b/database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:773235999227:secret:/ysh-b2b/jwt-secret"
        },
        {
          "name": "COOKIE_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:773235999227:secret:/ysh-b2b/cookie-secret"
        }
      ],
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

Registrar:

```powershell
aws ecs register-task-definition `
  --cli-input-json file://backend-task-def.json `
  --profile ysh-production
```

### 6️⃣ Criar ECS Services

```powershell
# Service Backend
aws ecs create-service `
  --cluster ysh-b2b-cluster `
  --service-name backend-service `
  --task-definition ysh-b2b-backend `
  --desired-count 1 `
  --launch-type FARGATE `
  --network-configuration "awsvpcConfiguration={subnets=[$subnet1,$subnet2],securityGroups=[$sgEcs],assignPublicIp=ENABLED}" `
  --load-balancers "targetGroupArn=$tgBackend,containerName=backend,containerPort=9000" `
  --profile ysh-production

# Service Storefront
aws ecs create-service `
  --cluster ysh-b2b-cluster `
  --service-name storefront-service `
  --task-definition ysh-b2b-storefront `
  --desired-count 1 `
  --launch-type FARGATE `
  --network-configuration "awsvpcConfiguration={subnets=[$subnet1,$subnet2],securityGroups=[$sgEcs],assignPublicIp=ENABLED}" `
  --load-balancers "targetGroupArn=$tgStorefront,containerName=storefront,containerPort=8000" `
  --profile ysh-production
```

---

## 💰 Custos Estimados

### Free Tier (primeiros 12 meses)

```yaml
S3:
  - 5GB storage: FREE
  - 20,000 GET + 2,000 PUT: FREE
  - Uso atual: < 1GB = $0/mês

ECR:
  - 500MB storage/mês: FREE
  - Uso estimado: ~200MB = $0/mês

Secrets Manager:
  - 30 dias trial: FREE
  - Após trial: $0.40/secret/mês × 5 = $2/mês

RDS:
  - db.t3.micro: 750h/mês = FREE (24/7)
  - 20GB storage: FREE
  - Total: $0/mês

ECS Fargate:
  - 1 vCPU + 2GB RAM: ~$15/mês
  - 2 tasks × 24/7 = ~$30/mês

ALB:
  - $16/mês + $0.008/LCU
  - Estimado: ~$20/mês

Total Free Tier: ~$52/mês
(RDS e S3 grátis, Fargate + ALB pagos)
```

### Pós Free Tier (após 12 meses)

```yaml
RDS db.t3.micro: $14.71/mês
S3 (50GB): $1.15/mês
ECR: $0.10/mês
Secrets Manager: $2/mês
ECS Fargate: $30/mês
ALB: $20/mês
Data Transfer: $5/mês
CloudWatch Logs: $3/mês

Total: ~$76/mês
```

---

## 📚 Documentação

- **AWS_FREE_TIER_GUIDE.md** - Guia completo do Free Tier
- **PRODUCTION_ARCHITECTURE.md** - Arquitetura de produção
- **AWS_CREDENTIALS_SETUP_GUIDE.md** - Setup de credenciais
- **docker-compose.foss.yml** - Stack FOSS local (alternativa)

---

## 🔗 Links Úteis

- **AWS Console**: <https://console.aws.amazon.com/>
- **ECS Console**: <https://console.aws.amazon.com/ecs/>
- **RDS Console**: <https://console.aws.amazon.com/rds/>
- **S3 Console**: <https://console.aws.amazon.com/s3/>
- **ECR Console**: <https://console.aws.amazon.com/ecr/>
- **Secrets Manager**: <https://console.aws.amazon.com/secretsmanager/>

---

## ✅ Checklist de Validação

```tsx
✅ S3 Buckets criados e configurados
✅ ECR Repositories criados
✅ Secrets Manager configurado
✅ RDS PostgreSQL criado (aguardando disponibilidade)
✅ ECS Cluster criado
⏳ VPC e Networking (próximo passo)
⏳ Application Load Balancer (próximo passo)
⏳ Task Definitions (próximo passo)
⏳ ECS Services (próximo passo)
⏳ Route53 DNS (próximo passo)
⏳ ACM SSL Certificate (próximo passo)
```

---

**🎉 Setup 360º Fase 1 completo! Infraestrutura base criada com sucesso!**

**Próximo**: Aguardar RDS ficar disponível e então configurar networking (VPC, ALB, Security Groups).
