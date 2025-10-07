# 🚀 Setup AWS Completo - YSH B2B + Data Platform

> **Guia completo para deploy em produção na AWS**  
> Inclui: Medusa Backend, Storefront Next.js, Data Platform (Pathway + Dagster + Qdrant + Ollama)

---

## 📋 Visão Geral

### Arquitetura AWS

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                      VPC (10.0.0.0/16)                │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │  Public Subnets (2 AZs)                         │ │  │
│  │  │  - ALB (Application Load Balancer)              │ │  │
│  │  │  - NAT Gateway                                   │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │  Private Subnets (2 AZs)                        │ │  │
│  │  │  ┌──────────────────────────────────────────┐   │ │  │
│  │  │  │  ECS Fargate Cluster                     │   │ │  │
│  │  │  │  - Backend (Medusa) 1-10 tasks           │   │ │  │
│  │  │  │  - Storefront (Next.js) 1-20 tasks       │   │ │  │
│  │  │  │  - Dagster Webserver                     │   │ │  │
│  │  │  │  - Dagster Daemon                        │   │ │  │
│  │  │  │  - Pathway ETL                           │   │ │  │
│  │  │  │  - Qdrant Vector DB                      │   │ │  │
│  │  │  │  - Ollama LLM (GPU EC2 optional)         │   │ │  │
│  │  │  └──────────────────────────────────────────┘   │ │  │
│  │  │                                                   │ │  │
│  │  │  ┌──────────────────────────────────────────┐   │ │  │
│  │  │  │  RDS PostgreSQL Multi-AZ                 │   │ │  │
│  │  │  │  - Medusa DB (db.t3.medium)              │   │ │  │
│  │  │  │  - Dagster DB (db.t3.micro)              │   │ │  │
│  │  │  └──────────────────────────────────────────┘   │ │  │
│  │  │                                                   │ │  │
│  │  │  ┌──────────────────────────────────────────┐   │ │  │
│  │  │  │  ElastiCache Redis                       │   │ │  │
│  │  │  │  - cache.t3.micro                        │   │ │  │
│  │  │  └──────────────────────────────────────────┘   │ │  │
│  │  │                                                   │ │  │
│  │  │  ┌──────────────────────────────────────────┐   │ │  │
│  │  │  │  MSK Kafka (Managed Streaming Kafka)     │   │ │  │
│  │  │  │  - 3 brokers kafka.t3.small              │   │ │  │
│  │  │  └──────────────────────────────────────────┘   │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Storage                                              │  │
│  │  - S3: ysh-data-lake (Data Platform)                 │  │
│  │  - S3: ysh-medusa-uploads (Backend uploads)          │  │
│  │  - EFS: qdrant-storage (Qdrant persistence)          │  │
│  │  - EFS: ollama-models (Ollama models)                │  │
│  │  - ECR: Container Registry                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Monitoring & Security                                │  │
│  │  - CloudWatch Logs & Metrics                          │  │
│  │  - Secrets Manager (API Keys, Passwords)             │  │
│  │  - IAM Roles & Policies                              │  │
│  │  - VPC Flow Logs                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Pré-requisitos

### 1. Ferramentas Locais

```powershell
# Verificar instalações
aws --version          # AWS CLI v2.x
docker --version       # Docker 24.x+
git --version          # Git 2.x+

# Instalar AWS CLI (se necessário)
# Windows: https://awscli.amazonaws.com/AWSCLIV2.msi

# Verificar credenciais AWS
aws sts get-caller-identity
```

### 2. Credenciais e Chaves

Você enviou dois arquivos de chave:

- `rsa-APKA3ICDVAH5Q6MVMJFV.pem` (Public Key)
- `pk-APKA3ICDVAH5Q6MVMJFV.pem` (Private Key)

**Estas são CloudFront Key Pairs para assinatura de URLs.**

#### Configurar AWS CLI

```powershell
# Configurar perfil AWS
aws configure --profile ysh-production

# Será solicitado:
AWS Access Key ID: [Your Access Key]
AWS Secret Access Key: [Your Secret Key]
Default region name: us-east-1
Default output format: json

# Testar
aws s3 ls --profile ysh-production
```

### 3. Variáveis de Ambiente

```powershell
# Configurar variáveis no PowerShell
$env:AWS_PROFILE = "ysh-production"
$env:AWS_REGION = "us-east-1"
$env:AWS_ACCOUNT_ID = $(aws sts get-caller-identity --query Account --output text)

# Verificar
echo $env:AWS_ACCOUNT_ID
```

---

## 📦 Passo 1: Criar Infraestrutura Base (CloudFormation)

### 1.1. Validar Template CloudFormation

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store

# Validar template
aws cloudformation validate-template `
  --template-body file://aws/cloudformation-infrastructure.yml `
  --profile ysh-production
```

### 1.2. Criar Stack de Infraestrutura

```powershell
# Criar stack (leva ~15-20 minutos)
aws cloudformation create-stack `
  --stack-name ysh-b2b-infrastructure `
  --template-body file://aws/cloudformation-infrastructure.yml `
  --parameters ParameterKey=Environment,ParameterValue=production `
  --capabilities CAPABILITY_IAM `
  --profile ysh-production

# Monitorar progresso
aws cloudformation describe-stack-events `
  --stack-name ysh-b2b-infrastructure `
  --query 'StackEvents[0:10].[Timestamp,ResourceStatus,LogicalResourceId]' `
  --output table `
  --profile ysh-production

# Aguardar conclusão
aws cloudformation wait stack-create-complete `
  --stack-name ysh-b2b-infrastructure `
  --profile ysh-production

# Obter outputs
aws cloudformation describe-stacks `
  --stack-name ysh-b2b-infrastructure `
  --query 'Stacks[0].Outputs' `
  --output table `
  --profile ysh-production
```

### 1.3. Salvar Outputs Importantes

```powershell
# Criar arquivo com outputs
$outputs = aws cloudformation describe-stacks `
  --stack-name ysh-b2b-infrastructure `
  --query 'Stacks[0].Outputs' `
  --output json `
  --profile ysh-production | ConvertFrom-Json

# Salvar em arquivo
$outputs | ConvertTo-Json | Out-File aws-outputs.json

# Exibir valores críticos
Write-Host "VPC ID: $($outputs | Where-Object {$_.OutputKey -eq 'VPCId'} | Select-Object -ExpandProperty OutputValue)"
Write-Host "ECS Cluster: $($outputs | Where-Object {$_.OutputKey -eq 'ECSClusterName'} | Select-Object -ExpandProperty OutputValue)"
Write-Host "Database Endpoint: $($outputs | Where-Object {$_.OutputKey -eq 'DatabaseEndpoint'} | Select-Object -ExpandProperty OutputValue)"
Write-Host "Redis Endpoint: $($outputs | Where-Object {$_.OutputKey -eq 'RedisEndpoint'} | Select-Object -ExpandProperty OutputValue)"
Write-Host "ALB DNS: $($outputs | Where-Object {$_.OutputKey -eq 'LoadBalancerDNS'} | Select-Object -ExpandProperty OutputValue)"
```

---

## 🗄️ Passo 2: Configurar Secrets Manager

### 2.1. Obter Senha do RDS

```powershell
# RDS gera senha automaticamente com ManageMasterUserPassword
$dbSecretArn = aws rds describe-db-instances `
  --db-instance-identifier production-ysh-b2b-postgres `
  --query 'DBInstances[0].MasterUserSecret.SecretArn' `
  --output text `
  --profile ysh-production

# Obter senha
$dbPassword = aws secretsmanager get-secret-value `
  --secret-id $dbSecretArn `
  --query 'SecretString' `
  --output text `
  --profile ysh-production | ConvertFrom-Json | Select-Object -ExpandProperty password

Write-Host "Database Password: $dbPassword"
```

### 2.2. Criar Secrets para Aplicação

```powershell
# JWT Secret
aws secretsmanager create-secret `
  --name /ysh-b2b/jwt-secret `
  --secret-string $(openssl rand -base64 32) `
  --profile ysh-production

# Cookie Secret
aws secretsmanager create-secret `
  --name /ysh-b2b/cookie-secret `
  --secret-string $(openssl rand -base64 32) `
  --profile ysh-production

# OpenAI API Key
aws secretsmanager create-secret `
  --name /ysh-b2b/openai-api-key `
  --secret-string "sk-YOUR_OPENAI_API_KEY" `
  --profile ysh-production

# Database URL
$dbEndpoint = aws cloudformation describe-stacks `
  --stack-name ysh-b2b-infrastructure `
  --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' `
  --output text `
  --profile ysh-production

$databaseUrl = "postgresql://medusa_user:${dbPassword}@${dbEndpoint}:5432/medusa_db"

aws secretsmanager create-secret `
  --name /ysh-b2b/database-url `
  --secret-string $databaseUrl `
  --profile ysh-production

# Redis URL
$redisEndpoint = aws cloudformation describe-stacks `
  --stack-name ysh-b2b-infrastructure `
  --query 'Stacks[0].Outputs[?OutputKey==`RedisEndpoint`].OutputValue' `
  --output text `
  --profile ysh-production

aws secretsmanager create-secret `
  --name /ysh-b2b/redis-url `
  --secret-string "redis://${redisEndpoint}:6379" `
  --profile ysh-production

# Backend URL (será atualizado após deploy)
aws secretsmanager create-secret `
  --name /ysh-b2b/backend-url `
  --secret-string "https://api.ysh-b2b.com" `
  --profile ysh-production

# Publishable Key Medusa (gerar após migrations)
aws secretsmanager create-secret `
  --name /ysh-b2b/publishable-key `
  --secret-string "pk_TEMPORARY" `
  --profile ysh-production

# Storefront URL
aws secretsmanager create-secret `
  --name /ysh-b2b/storefront-url `
  --secret-string "https://ysh-b2b.com" `
  --profile ysh-production

# Revalidate Secret
aws secretsmanager create-secret `
  --name /ysh-b2b/revalidate-secret `
  --secret-string $(openssl rand -base64 32) `
  --profile ysh-production
```

---

## 📦 Passo 3: Criar Buckets S3 e EFS

### 3.1. S3 Buckets

```powershell
# Bucket para uploads do Medusa
aws s3api create-bucket `
  --bucket ysh-medusa-uploads `
  --region us-east-1 `
  --profile ysh-production

# Habilitar versionamento
aws s3api put-bucket-versioning `
  --bucket ysh-medusa-uploads `
  --versioning-configuration Status=Enabled `
  --profile ysh-production

# Bucket para Data Lake (Data Platform)
aws s3api create-bucket `
  --bucket ysh-data-lake `
  --region us-east-1 `
  --profile ysh-production

# Configurar lifecycle policy (tiering automático)
$lifecyclePolicy = @"
{
  "Rules": [
    {
      "Id": "IntelligentTiering",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "INTELLIGENT_TIERING"
        }
      ]
    }
  ]
}
"@

$lifecyclePolicy | Out-File -Encoding utf8 s3-lifecycle.json

aws s3api put-bucket-lifecycle-configuration `
  --bucket ysh-data-lake `
  --lifecycle-configuration file://s3-lifecycle.json `
  --profile ysh-production

# Configurar CORS para uploads
$corsConfig = @"
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://ysh-b2b.com", "https://api.ysh-b2b.com"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
"@

$corsConfig | Out-File -Encoding utf8 s3-cors.json

aws s3api put-bucket-cors `
  --bucket ysh-medusa-uploads `
  --cors-configuration file://s3-cors.json `
  --profile ysh-production
```

### 3.2. EFS para Qdrant e Ollama

```powershell
# Obter VPC e Subnets do CloudFormation
$vpcId = aws cloudformation describe-stacks `
  --stack-name ysh-b2b-infrastructure `
  --query 'Stacks[0].Outputs[?OutputKey==`VPCId`].OutputValue' `
  --output text `
  --profile ysh-production

# Criar Security Group para EFS
$efsSecurityGroupId = aws ec2 create-security-group `
  --group-name ysh-b2b-efs-sg `
  --description "Security group for EFS" `
  --vpc-id $vpcId `
  --query 'GroupId' `
  --output text `
  --profile ysh-production

# Permitir NFS (porta 2049) do ECS
$ecsSecurityGroupId = aws ec2 describe-security-groups `
  --filters "Name=group-name,Values=production-ysh-b2b-ecs-sg" `
  --query 'SecurityGroups[0].GroupId' `
  --output text `
  --profile ysh-production

aws ec2 authorize-security-group-ingress `
  --group-id $efsSecurityGroupId `
  --protocol tcp `
  --port 2049 `
  --source-group $ecsSecurityGroupId `
  --profile ysh-production

# Criar EFS para Qdrant
$qdrantEfsId = aws efs create-file-system `
  --creation-token ysh-qdrant-storage `
  --performance-mode generalPurpose `
  --throughput-mode bursting `
  --encrypted `
  --tags Key=Name,Value=ysh-qdrant-storage `
  --query 'FileSystemId' `
  --output text `
  --profile ysh-production

# Criar EFS para Ollama
$ollamaEfsId = aws efs create-file-system `
  --creation-token ysh-ollama-models `
  --performance-mode generalPurpose `
  --throughput-mode bursting `
  --encrypted `
  --tags Key=Name,Value=ysh-ollama-models `
  --query 'FileSystemId' `
  --output text `
  --profile ysh-production

Write-Host "Qdrant EFS ID: $qdrantEfsId"
Write-Host "Ollama EFS ID: $ollamaEfsId"

# Aguardar EFS ficar disponível
Start-Sleep -Seconds 30

# Criar mount targets nas subnets privadas
$privateSubnets = aws ec2 describe-subnets `
  --filters "Name=vpc-id,Values=$vpcId" "Name=tag:Name,Values=*private*" `
  --query 'Subnets[*].SubnetId' `
  --output text `
  --profile ysh-production

foreach ($subnet in $privateSubnets.Split()) {
  aws efs create-mount-target `
    --file-system-id $qdrantEfsId `
    --subnet-id $subnet `
    --security-groups $efsSecurityGroupId `
    --profile ysh-production
  
  aws efs create-mount-target `
    --file-system-id $ollamaEfsId `
    --subnet-id $subnet `
    --security-groups $efsSecurityGroupId `
    --profile ysh-production
}
```

---

## 🐳 Passo 4: Build e Push de Imagens Docker (ECR)

### 4.1. Login no ECR

```powershell
# Login no ECR
aws ecr get-login-password --region us-east-1 --profile ysh-production | `
  docker login --username AWS --password-stdin $env:AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

### 4.2. Build e Push Backend

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\backend

# Build
docker build `
  --platform linux/amd64 `
  -t ysh-b2b-backend:latest `
  -t $env:AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-backend:latest `
  -t $env:AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-backend:$(git rev-parse --short HEAD) `
  .

# Push
docker push $env:AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-backend:latest
docker push $env:AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-backend:$(git rev-parse --short HEAD)
```

### 4.3. Build e Push Storefront

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\storefront

# Build
docker build `
  --platform linux/amd64 `
  -t ysh-b2b-storefront:latest `
  -t $env:AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-storefront:latest `
  -t $env:AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-storefront:$(git rev-parse --short HEAD) `
  .

# Push
docker push $env:AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-storefront:latest
docker push $env:AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-storefront:$(git rev-parse --short HEAD)
```

### 4.4. Build e Push Data Platform

```powershell
# Dagster
cd c:\Users\fjuni\ysh_medusa\ysh-store\data-platform\dagster

docker build -t ysh-dagster:latest .
docker tag ysh-dagster:latest $env:AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-dagster:latest
docker push $env:AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-dagster:latest

# Pathway
cd c:\Users\fjuni\ysh_medusa\ysh-store\data-platform\pathway

docker build -t ysh-pathway:latest .
docker tag ysh-pathway:latest $env:AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-pathway:latest
docker push $env:AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-pathway:latest
```

---

## 🚀 Passo 5: Deploy ECS Services

### 5.1. Atualizar Task Definitions

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store

# Substituir placeholders nas task definitions
$accountId = $env:AWS_ACCOUNT_ID
$region = $env:AWS_REGION

# Backend
$backendTask = Get-Content aws/backend-task-definition.json -Raw
$backendTask = $backendTask.Replace("ACCOUNT-ID", $accountId).Replace("REGION", $region)
$backendTask | Out-File aws/backend-task-definition-updated.json

# Storefront
$storefrontTask = Get-Content aws/storefront-task-definition.json -Raw
$storefrontTask = $storefrontTask.Replace("ACCOUNT-ID", $accountId).Replace("REGION", $region)
$storefrontTask | Out-File aws/storefront-task-definition-updated.json

# Registrar task definitions
aws ecs register-task-definition `
  --cli-input-json file://aws/backend-task-definition-updated.json `
  --profile ysh-production

aws ecs register-task-definition `
  --cli-input-json file://aws/storefront-task-definition-updated.json `
  --profile ysh-production
```

### 5.2. Criar Target Groups para ALB

```powershell
# Obter VPC ID
$vpcId = aws cloudformation describe-stacks `
  --stack-name ysh-b2b-infrastructure `
  --query 'Stacks[0].Outputs[?OutputKey==`VPCId`].OutputValue' `
  --output text `
  --profile ysh-production

# Target Group Backend
$backendTgArn = aws elbv2 create-target-group `
  --name ysh-b2b-backend-tg `
  --protocol HTTP `
  --port 9000 `
  --vpc-id $vpcId `
  --target-type ip `
  --health-check-path /health `
  --health-check-interval-seconds 30 `
  --health-check-timeout-seconds 10 `
  --healthy-threshold-count 2 `
  --unhealthy-threshold-count 3 `
  --query 'TargetGroups[0].TargetGroupArn' `
  --output text `
  --profile ysh-production

# Target Group Storefront
$storefrontTgArn = aws elbv2 create-target-group `
  --name ysh-b2b-storefront-tg `
  --protocol HTTP `
  --port 8000 `
  --vpc-id $vpcId `
  --target-type ip `
  --health-check-path / `
  --health-check-interval-seconds 30 `
  --health-check-timeout-seconds 10 `
  --healthy-threshold-count 2 `
  --unhealthy-threshold-count 3 `
  --query 'TargetGroups[0].TargetGroupArn' `
  --output text `
  --profile ysh-production

Write-Host "Backend TG ARN: $backendTgArn"
Write-Host "Storefront TG ARN: $storefrontTgArn"
```

### 5.3. Criar ALB Listeners

```powershell
# Obter ALB ARN
$albArn = aws elbv2 describe-load-balancers `
  --names production-ysh-b2b-alb `
  --query 'LoadBalancers[0].LoadBalancerArn' `
  --output text `
  --profile ysh-production

# Listener HTTP (redirect para HTTPS)
aws elbv2 create-listener `
  --load-balancer-arn $albArn `
  --protocol HTTP `
  --port 80 `
  --default-actions Type=redirect,RedirectConfig="{Protocol=HTTPS,Port=443,StatusCode=HTTP_301}" `
  --profile ysh-production

# Listener HTTPS (requer certificado ACM)
# NOTA: Você precisa criar um certificado SSL/TLS no ACM primeiro
# aws acm request-certificate --domain-name ysh-b2b.com --subject-alternative-names *.ysh-b2b.com

# Exemplo com certificado
# $certArn = "arn:aws:acm:us-east-1:ACCOUNT-ID:certificate/CERTIFICATE-ID"
# 
# aws elbv2 create-listener `
#   --load-balancer-arn $albArn `
#   --protocol HTTPS `
#   --port 443 `
#   --certificates CertificateArn=$certArn `
#   --default-actions Type=forward,TargetGroupArn=$storefrontTgArn `
#   --profile ysh-production

# Criar rules para roteamento
# API requests -> Backend
# aws elbv2 create-rule `
#   --listener-arn $listenerArn `
#   --priority 1 `
#   --conditions Field=path-pattern,Values='/api/*','/admin/*' `
#   --actions Type=forward,TargetGroupArn=$backendTgArn `
#   --profile ysh-production
```

### 5.4. Criar ECS Services

```powershell
# Obter IDs de subnets e security groups
$privateSubnets = (aws ec2 describe-subnets `
  --filters "Name=vpc-id,Values=$vpcId" "Name=tag:Name,Values=*private*" `
  --query 'Subnets[*].SubnetId' `
  --output text `
  --profile ysh-production).Replace("`t", ",")

$ecsSecurityGroupId = aws ec2 describe-security-groups `
  --filters "Name=group-name,Values=production-ysh-b2b-ecs-sg" `
  --query 'SecurityGroups[0].GroupId' `
  --output text `
  --profile ysh-production

# Criar Backend Service
aws ecs create-service `
  --cluster production-ysh-b2b-cluster `
  --service-name ysh-b2b-backend-service `
  --task-definition ysh-b2b-backend `
  --desired-count 2 `
  --launch-type FARGATE `
  --platform-version LATEST `
  --network-configuration "awsvpcConfiguration={subnets=[$privateSubnets],securityGroups=[$ecsSecurityGroupId],assignPublicIp=DISABLED}" `
  --load-balancers "targetGroupArn=$backendTgArn,containerName=ysh-b2b-backend,containerPort=9000" `
  --health-check-grace-period-seconds 60 `
  --profile ysh-production

# Criar Storefront Service
aws ecs create-service `
  --cluster production-ysh-b2b-cluster `
  --service-name ysh-b2b-storefront-service `
  --task-definition ysh-b2b-storefront `
  --desired-count 2 `
  --launch-type FARGATE `
  --platform-version LATEST `
  --network-configuration "awsvpcConfiguration={subnets=[$privateSubnets],securityGroups=[$ecsSecurityGroupId],assignPublicIp=DISABLED}" `
  --load-balancers "targetGroupArn=$storefrontTgArn,containerName=ysh-b2b-storefront,containerPort=8000" `
  --health-check-grace-period-seconds 60 `
  --profile ysh-production

# Aguardar services ficarem estáveis
aws ecs wait services-stable `
  --cluster production-ysh-b2b-cluster `
  --services ysh-b2b-backend-service ysh-b2b-storefront-service `
  --profile ysh-production
```

---

## 📊 Passo 6: Setup Data Platform (MSK Kafka + Qdrant)

### 6.1. Criar MSK Kafka Cluster

```powershell
# Criar configuração MSK
$mskConfigArn = aws kafka create-configuration `
  --name ysh-msk-config `
  --server-properties "auto.create.topics.enable=true
delete.topic.enable=true
log.retention.hours=168" `
  --query 'Arn' `
  --output text `
  --profile ysh-production

# Criar cluster MSK (leva ~20 minutos)
$mskClusterArn = aws kafka create-cluster `
  --cluster-name ysh-kafka-cluster `
  --broker-node-group-info "InstanceType=kafka.t3.small,ClientSubnets=[$privateSubnets],SecurityGroups=[$ecsSecurityGroupId],StorageInfo={EbsStorageInfo={VolumeSize=100}}" `
  --kafka-version 3.5.1 `
  --number-of-broker-nodes 3 `
  --enhanced-monitoring DEFAULT `
  --configuration-info "Arn=$mskConfigArn,Revision=1" `
  --query 'ClusterArn' `
  --output text `
  --profile ysh-production

Write-Host "MSK Cluster ARN: $mskClusterArn"
Write-Host "Aguardando cluster ficar ativo (15-20 minutos)..."

# Aguardar cluster ativo
aws kafka wait cluster-running `
  --cluster-arn $mskClusterArn `
  --profile ysh-production

# Obter bootstrap servers
$kafkaBootstrapServers = aws kafka get-bootstrap-brokers `
  --cluster-arn $mskClusterArn `
  --query 'BootstrapBrokerString' `
  --output text `
  --profile ysh-production

Write-Host "Kafka Bootstrap Servers: $kafkaBootstrapServers"

# Salvar em Secrets Manager
aws secretsmanager create-secret `
  --name /ysh-b2b/kafka-bootstrap-servers `
  --secret-string $kafkaBootstrapServers `
  --profile ysh-production
```

### 6.2. Configurar Qdrant no ECS

Vamos criar um service ECS separado para Qdrant com EFS mount:

```powershell
# Criar ECR repository para Qdrant
aws ecr create-repository `
  --repository-name ysh-qdrant `
  --image-scanning-configuration scanOnPush=true `
  --profile ysh-production

# Task definition para Qdrant (criar arquivo)
$qdrantTaskDef = @"
{
  "family": "ysh-qdrant",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::${accountId}:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::${accountId}:role/ecsTaskRole",
  "volumes": [
    {
      "name": "qdrant-storage",
      "efsVolumeConfiguration": {
        "fileSystemId": "${qdrantEfsId}",
        "transitEncryption": "ENABLED"
      }
    }
  ],
  "containerDefinitions": [
    {
      "name": "qdrant",
      "image": "qdrant/qdrant:v1.7.0",
      "portMappings": [
        {
          "containerPort": 6333,
          "protocol": "tcp"
        },
        {
          "containerPort": 6334,
          "protocol": "tcp"
        }
      ],
      "mountPoints": [
        {
          "sourceVolume": "qdrant-storage",
          "containerPath": "/qdrant/storage"
        }
      ],
      "environment": [
        {
          "name": "QDRANT__SERVICE__ENABLE_TLS",
          "value": "false"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ysh-qdrant",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs",
          "awslogs-create-group": "true"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:6333/health || exit 1"],
        "interval": 30,
        "timeout": 10,
        "retries": 3,
        "startPeriod": 60
      },
      "essential": true
    }
  ]
}
"@

$qdrantTaskDef | Out-File aws/qdrant-task-definition.json

# Registrar task definition
aws ecs register-task-definition `
  --cli-input-json file://aws/qdrant-task-definition.json `
  --profile ysh-production

# Criar service Qdrant
aws ecs create-service `
  --cluster production-ysh-b2b-cluster `
  --service-name ysh-qdrant-service `
  --task-definition ysh-qdrant `
  --desired-count 1 `
  --launch-type FARGATE `
  --platform-version LATEST `
  --network-configuration "awsvpcConfiguration={subnets=[$privateSubnets],securityGroups=[$ecsSecurityGroupId],assignPublicIp=DISABLED}" `
  --enable-ecs-managed-tags `
  --profile ysh-production
```

### 6.3. Configurar Dagster e Pathway Services

```powershell
# Registrar task definitions para Data Platform
# (Similar aos passos anteriores, criar task definitions para dagster-daemon, dagster-webserver, pathway-catalog, pathway-rag)

# Criar Postgres separado para Dagster (opcional, ou usar o RDS existente)
# Criar services ECS para cada componente
```

---

## 🔐 Passo 7: Configurar IAM Roles e Policies

### 7.1. Task Execution Role (já criado pelo CloudFormation, mas verificar permissões)

```powershell
# Adicionar políticas para Secrets Manager, ECR, CloudWatch Logs
$taskExecutionPolicyDoc = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:${accountId}:secret:/ysh-b2b/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:CreateLogGroup"
      ],
      "Resource": "*"
    }
  ]
}
"@

$taskExecutionPolicyDoc | Out-File iam-task-execution-policy.json

aws iam put-role-policy `
  --role-name ecsTaskExecutionRole `
  --policy-name YSHTaskExecutionPolicy `
  --policy-document file://iam-task-execution-policy.json `
  --profile ysh-production
```

### 7.2. Task Role (para acessar S3, MSK, etc.)

```powershell
$taskRolePolicyDoc = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::ysh-medusa-uploads/*",
        "arn:aws:s3:::ysh-data-lake/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "kafka:DescribeCluster",
        "kafka:GetBootstrapBrokers",
        "kafka-cluster:Connect",
        "kafka-cluster:DescribeTopic",
        "kafka-cluster:ReadData",
        "kafka-cluster:WriteData"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricData"
      ],
      "Resource": "*"
    }
  ]
}
"@

$taskRolePolicyDoc | Out-File iam-task-role-policy.json

aws iam put-role-policy `
  --role-name ecsTaskRole `
  --policy-name YSHTaskRolePolicy `
  --policy-document file://iam-task-role-policy.json `
  --profile ysh-production
```

---

## 🗄️ Passo 8: Migrations e Seed do Medusa

### 8.1. Executar Migrations via ECS Task

```powershell
# Run one-off task para migrations
aws ecs run-task `
  --cluster production-ysh-b2b-cluster `
  --task-definition ysh-b2b-backend `
  --launch-type FARGATE `
  --network-configuration "awsvpcConfiguration={subnets=[$privateSubnets],securityGroups=[$ecsSecurityGroupId],assignPublicIp=DISABLED}" `
  --overrides "{\"containerOverrides\":[{\"name\":\"ysh-b2b-backend\",\"command\":[\"npx\",\"medusa\",\"db:migrate\"]}]}" `
  --profile ysh-production

# Verificar logs
$taskArn = # ARN da task acima

aws ecs describe-tasks `
  --cluster production-ysh-b2b-cluster `
  --tasks $taskArn `
  --profile ysh-production

# Aguardar conclusão
aws ecs wait tasks-stopped `
  --cluster production-ysh-b2b-cluster `
  --tasks $taskArn `
  --profile ysh-production

# Verificar logs no CloudWatch
aws logs tail /ecs/ysh-b2b-backend --follow --profile ysh-production
```

### 8.2. Criar Usuário Admin

```powershell
# Run task para criar admin
aws ecs run-task `
  --cluster production-ysh-b2b-cluster `
  --task-definition ysh-b2b-backend `
  --launch-type FARGATE `
  --network-configuration "awsvpcConfiguration={subnets=[$privateSubnets],securityGroups=[$ecsSecurityGroupId],assignPublicIp=DISABLED}" `
  --overrides "{\"containerOverrides\":[{\"name\":\"ysh-b2b-backend\",\"command\":[\"npx\",\"medusa\",\"user\",\"-e\",\"admin@ysh.com.br\",\"-p\",\"YourSecurePassword123!\",\"-i\",\"admin\"]}]}" `
  --profile ysh-production
```

### 8.3. Obter Publishable Key

```powershell
# Conectar ao backend via AWS Systems Manager Session Manager (se configurado)
# ou via logs, ou criar endpoint temporário

# Atualizar secret com publishable key real
aws secretsmanager update-secret `
  --secret-id /ysh-b2b/publishable-key `
  --secret-string "pk_REAL_PUBLISHABLE_KEY_FROM_DB" `
  --profile ysh-production

# Forçar novo deployment do storefront para usar nova key
aws ecs update-service `
  --cluster production-ysh-b2b-cluster `
  --service ysh-b2b-storefront-service `
  --force-new-deployment `
  --profile ysh-production
```

---

## 📊 Passo 9: Monitoramento e Logs

### 9.1. CloudWatch Dashboards

```powershell
# Criar dashboard customizado
$dashboardBody = @"
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ECS", "CPUUtilization", {"stat": "Average"}],
          [".", "MemoryUtilization", {"stat": "Average"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "ECS Resource Utilization"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ApplicationELB", "TargetResponseTime", {"stat": "Average"}],
          [".", "RequestCount", {"stat": "Sum"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "ALB Performance"
      }
    },
    {
      "type": "log",
      "properties": {
        "query": "SOURCE '/ecs/ysh-b2b-backend' | fields @timestamp, @message | sort @timestamp desc | limit 20",
        "region": "us-east-1",
        "title": "Backend Logs"
      }
    }
  ]
}
"@

aws cloudwatch put-dashboard `
  --dashboard-name YSH-B2B-Production `
  --dashboard-body $dashboardBody `
  --profile ysh-production
```

### 9.2. Alarmes CloudWatch

```powershell
# Alarme de CPU alta
aws cloudwatch put-metric-alarm `
  --alarm-name ysh-b2b-high-cpu `
  --alarm-description "CPU usage exceeds 80%" `
  --metric-name CPUUtilization `
  --namespace AWS/ECS `
  --statistic Average `
  --period 300 `
  --evaluation-periods 2 `
  --threshold 80 `
  --comparison-operator GreaterThanThreshold `
  --profile ysh-production

# Alarme de memória alta
aws cloudwatch put-metric-alarm `
  --alarm-name ysh-b2b-high-memory `
  --alarm-description "Memory usage exceeds 80%" `
  --metric-name MemoryUtilization `
  --namespace AWS/ECS `
  --statistic Average `
  --period 300 `
  --evaluation-periods 2 `
  --threshold 80 `
  --comparison-operator GreaterThanThreshold `
  --profile ysh-production

# Alarme de erros ALB
aws cloudwatch put-metric-alarm `
  --alarm-name ysh-b2b-alb-errors `
  --alarm-description "ALB 5xx errors exceed 10 per minute" `
  --metric-name HTTPCode_Target_5XX_Count `
  --namespace AWS/ApplicationELB `
  --statistic Sum `
  --period 60 `
  --evaluation-periods 1 `
  --threshold 10 `
  --comparison-operator GreaterThanThreshold `
  --profile ysh-production
```

---

## 🔄 Passo 10: Auto Scaling

### 10.1. Application Auto Scaling para ECS

```powershell
# Registrar backend como scalable target
aws application-autoscaling register-scalable-target `
  --service-namespace ecs `
  --resource-id service/production-ysh-b2b-cluster/ysh-b2b-backend-service `
  --scalable-dimension ecs:service:DesiredCount `
  --min-capacity 2 `
  --max-capacity 10 `
  --profile ysh-production

# Criar política de auto scaling por CPU
aws application-autoscaling put-scaling-policy `
  --service-namespace ecs `
  --resource-id service/production-ysh-b2b-cluster/ysh-b2b-backend-service `
  --scalable-dimension ecs:service:DesiredCount `
  --policy-name ysh-backend-cpu-scaling `
  --policy-type TargetTrackingScaling `
  --target-tracking-scaling-policy-configuration "{
    \"TargetValue\": 70.0,
    \"PredefinedMetricSpecification\": {
      \"PredefinedMetricType\": \"ECSServiceAverageCPUUtilization\"
    },
    \"ScaleInCooldown\": 300,
    \"ScaleOutCooldown\": 60
  }" `
  --profile ysh-production

# Registrar storefront como scalable target
aws application-autoscaling register-scalable-target `
  --service-namespace ecs `
  --resource-id service/production-ysh-b2b-cluster/ysh-b2b-storefront-service `
  --scalable-dimension ecs:service:DesiredCount `
  --min-capacity 2 `
  --max-capacity 20 `
  --profile ysh-production

# Criar política de auto scaling por requests
aws application-autoscaling put-scaling-policy `
  --service-namespace ecs `
  --resource-id service/production-ysh-b2b-cluster/ysh-b2b-storefront-service `
  --scalable-dimension ecs:service:DesiredCount `
  --policy-name ysh-storefront-requests-scaling `
  --policy-type TargetTrackingScaling `
  --target-tracking-scaling-policy-configuration "{
    \"TargetValue\": 1000.0,
    \"PredefinedMetricSpecification\": {
      \"PredefinedMetricType\": \"ALBRequestCountPerTarget\",
      \"ResourceLabel\": \"${albArn}/${storefrontTgArn}\"
    },
    \"ScaleInCooldown\": 300,
    \"ScaleOutCooldown\": 60
  }" `
  --profile ysh-production
```

---

## 🌐 Passo 11: DNS e SSL/TLS

### 11.1. Criar Certificado SSL (ACM)

```powershell
# Solicitar certificado
$certArn = aws acm request-certificate `
  --domain-name ysh-b2b.com `
  --subject-alternative-names *.ysh-b2b.com `
  --validation-method DNS `
  --query 'CertificateArn' `
  --output text `
  --profile ysh-production

Write-Host "Certificate ARN: $certArn"

# Obter registros DNS para validação
aws acm describe-certificate `
  --certificate-arn $certArn `
  --query 'Certificate.DomainValidationOptions[*].ResourceRecord' `
  --output table `
  --profile ysh-production

# IMPORTANTE: Adicionar esses registros CNAME ao seu DNS (Route 53, Cloudflare, etc.)
# Aguardar validação (pode levar 5-30 minutos)
```

### 11.2. Configurar Route 53 (se usar AWS DNS)

```powershell
# Criar hosted zone
$hostedZoneId = aws route53 create-hosted-zone `
  --name ysh-b2b.com `
  --caller-reference $(Get-Date -Format "yyyyMMddHHmmss") `
  --query 'HostedZone.Id' `
  --output text `
  --profile ysh-production

# Obter DNS do ALB
$albDns = aws elbv2 describe-load-balancers `
  --names production-ysh-b2b-alb `
  --query 'LoadBalancers[0].DNSName' `
  --output text `
  --profile ysh-production

# Criar registros DNS
$changesBatch = @"
{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "ysh-b2b.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "${hostedZoneId}",
          "DNSName": "${albDns}",
          "EvaluateTargetHealth": true
        }
      }
    },
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.ysh-b2b.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "${hostedZoneId}",
          "DNSName": "${albDns}",
          "EvaluateTargetHealth": true
        }
      }
    }
  ]
}
"@

$changesBatch | Out-File route53-changes.json

aws route53 change-resource-record-sets `
  --hosted-zone-id $hostedZoneId `
  --change-batch file://route53-changes.json `
  --profile ysh-production
```

---

## ✅ Passo 12: Validação e Testes

### 12.1. Health Checks

```powershell
# Obter DNS do ALB
$albDns = aws elbv2 describe-load-balancers `
  --names production-ysh-b2b-alb `
  --query 'LoadBalancers[0].DNSName' `
  --output text `
  --profile ysh-production

# Testar backend health
curl "http://${albDns}:9000/health"

# Testar storefront
curl "http://${albDns}:8000"

# Testar admin
curl "http://${albDns}:9000/admin"
```

### 12.2. Verificar Services ECS

```powershell
# Status dos services
aws ecs describe-services `
  --cluster production-ysh-b2b-cluster `
  --services ysh-b2b-backend-service ysh-b2b-storefront-service `
  --query 'services[*].[serviceName,status,runningCount,desiredCount]' `
  --output table `
  --profile ysh-production

# Tasks rodando
aws ecs list-tasks `
  --cluster production-ysh-b2b-cluster `
  --service-name ysh-b2b-backend-service `
  --desired-status RUNNING `
  --profile ysh-production
```

### 12.3. Verificar Logs

```powershell
# Logs recentes do backend
aws logs tail /ecs/ysh-b2b-backend --follow --profile ysh-production

# Logs recentes do storefront
aws logs tail /ecs/ysh-b2b-storefront --follow --profile ysh-production
```

---

## 💰 Estimativa de Custos Mensais

| Serviço | Configuração | Custo Estimado (USD) |
|---------|--------------|---------------------|
| **ECS Fargate** | Backend (2x 1vCPU, 2GB) | $60 |
| **ECS Fargate** | Storefront (2x 0.5vCPU, 1GB) | $30 |
| **ECS Fargate** | Data Platform (Dagster, Pathway, Qdrant) | $80 |
| **RDS PostgreSQL** | db.t3.medium Multi-AZ | $120 |
| **ElastiCache Redis** | cache.t3.micro | $15 |
| **MSK Kafka** | 3x kafka.t3.small | $180 |
| **ALB** | 1 ALB | $25 |
| **S3** | 50 GB storage + requests | $5 |
| **EFS** | 20 GB (Qdrant + Ollama) | $6 |
| **CloudWatch** | Logs + Metrics | $20 |
| **Data Transfer** | 100 GB out | $10 |
| **NAT Gateway** | 1 NAT | $35 |
| **ECR** | 10 GB images | $1 |
| **Secrets Manager** | 10 secrets | $4 |
| **Route 53** | 1 hosted zone | $1 |
| **Total Estimado** | | **~$592/mês** |

**Otimizações de Custo:**

- Usar **Fargate Spot** (save 70%): $35 backend, $20 storefront
- RDS Reserved Instance (1 year): save 35% = $78/month
- MSK serverless: $90-150/month (vs $180)
- **Total Otimizado: ~$350-400/mês**

---

## 🔧 Troubleshooting

### Task não inicia

```powershell
# Verificar eventos do service
aws ecs describe-services `
  --cluster production-ysh-b2b-cluster `
  --services ysh-b2b-backend-service `
  --query 'services[0].events[0:5]' `
  --output table `
  --profile ysh-production

# Verificar stopped tasks
aws ecs describe-tasks `
  --cluster production-ysh-b2b-cluster `
  --tasks TASK_ARN `
  --query 'tasks[0].stopCode,tasks[0].stoppedReason' `
  --profile ysh-production
```

### Erro ao conectar ao RDS

```powershell
# Verificar security groups
aws ec2 describe-security-groups `
  --group-ids $ecsSecurityGroupId `
  --query 'SecurityGroups[0].IpPermissionsEgress' `
  --profile ysh-production

# Testar conectividade via ECS Exec (precisa habilitar)
aws ecs execute-command `
  --cluster production-ysh-b2b-cluster `
  --task TASK_ARN `
  --container ysh-b2b-backend `
  --interactive `
  --command "psql -h $dbEndpoint -U medusa_user -d medusa_db" `
  --profile ysh-production
```

### Logs não aparecem

```powershell
# Verificar log groups
aws logs describe-log-groups `
  --log-group-name-prefix /ecs/ysh `
  --profile ysh-production

# Criar log group manualmente se necessário
aws logs create-log-group `
  --log-group-name /ecs/ysh-b2b-backend `
  --profile ysh-production
```

---

## 📚 Próximos Passos

1. **CI/CD**: Configurar GitHub Actions para deploy automatizado
2. **Backup**: Configurar snapshots automáticos do RDS
3. **DR**: Implementar multi-region para disaster recovery
4. **WAF**: Adicionar AWS WAF ao ALB para proteção contra DDoS
5. **CDN**: CloudFront para assets estáticos do storefront
6. **Monitoring**: Integrar Datadog/New Relic para APM
7. **Cost Optimization**: Ativar AWS Cost Explorer e Budget Alerts

---

## 🆘 Suporte

- **Documentação AWS ECS**: <https://docs.aws.amazon.com/ecs/>
- **Medusa Docs**: <https://docs.medusajs.com/>
- **Comunidade Medusa**: <https://discord.gg/medusajs>

---

**Setup completo! 🎉**

Seu ambiente AWS está pronto para produção com:
✅ Infraestrutura escalável e multi-AZ  
✅ Monitoramento e alarmes configurados  
✅ Auto scaling habilitado  
✅ Data Platform integrado  
✅ Segurança com Secrets Manager e VPC privada
