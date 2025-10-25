# 🚀 Guia Completo de Deployment AWS - YSH Backend

**Data:** 13 de Outubro, 2025  
**Versão:** 1.0  
**Status:** ✅ Produção Ready

---

## 📋 Índice

1. [Arquitetura AWS](#arquitetura-aws)
2. [Secrets Management](#secrets-management)
3. [EC2 Setup](#ec2-setup)
4. [S3 Configuration](#s3-configuration)
5. [RDS Database](#rds-database)
6. [Security Groups](#security-groups)
7. [Deployment Scripts](#deployment-scripts)
8. [Monitoring & Logs](#monitoring--logs)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitetura AWS

### Componentes Principais

```
┌─────────────────────────────────────────────────────────┐
│                    AWS Cloud (us-east-1)                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐         ┌────────────────┐           │
│  │   Route 53   │────────▶│  Load Balancer │           │
│  │  (DNS)       │         │  (ALB)         │           │
│  └──────────────┘         └────────┬───────┘           │
│                                    │                    │
│                          ┌─────────▼─────────┐          │
│                          │  Auto Scaling     │          │
│                          │  Group            │          │
│                          │  ┌─────────────┐  │          │
│                          │  │  EC2 (t3)   │  │          │
│                          │  │  Backend    │  │          │
│                          │  │  + Docker   │  │          │
│                          │  └──────┬──────┘  │          │
│                          └─────────┼─────────┘          │
│                                    │                    │
│  ┌───────────────────────────────┬─▼────────┐          │
│  │                               │           │          │
│  │  ┌──────────────┐     ┌──────▼──────┐    │          │
│  │  │  S3 Bucket   │     │   RDS       │    │          │
│  │  │  (Media)     │     │  PostgreSQL │    │          │
│  │  │  - Images    │     │   (db.t3)   │    │          │
│  │  │  - Uploads   │     │             │    │          │
│  │  └──────────────┘     └─────────────┘    │          │
│  │                                           │          │
│  │  ┌──────────────┐     ┌─────────────┐    │          │
│  │  │ CloudWatch   │     │  Secrets    │    │          │
│  │  │ (Logs)       │     │  Manager    │    │          │
│  │  └──────────────┘     └─────────────┘    │          │
│  └───────────────────────────────────────────┘          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Recursos Necessários

| Recurso | Tipo | Quantidade | Custo Estimado/mês |
|---------|------|------------|-------------------|
| EC2 Instance | t3.medium | 1-3 | $30-90 |
| RDS PostgreSQL | db.t3.micro | 1 | $15 |
| S3 Bucket | Standard | 1 | $5-20 |
| Load Balancer | Application | 1 | $16 |
| CloudWatch | Standard | - | $5-10 |
| **Total** | | | **$71-141/mês** |

---

## 🔐 Secrets Management

### Opção 1: AWS Secrets Manager (Recomendado)

#### Criar Secret para Database

```bash
aws secretsmanager create-secret \
  --name ysh-backend/production/database \
  --description "YSH Backend Database Credentials" \
  --secret-string '{
    "host": "ysh-db.xxxxx.us-east-1.rds.amazonaws.com",
    "port": "5432",
    "database": "yshdb",
    "username": "ysh_admin",
    "password": "STRONG_PASSWORD_HERE"
  }'
```

#### Criar Secret para API Keys

```bash
aws secretsmanager create-secret \
  --name ysh-backend/production/api-keys \
  --description "YSH Backend API Keys" \
  --secret-string '{
    "jwt_secret": "GENERATE_STRONG_JWT_SECRET_64_CHARS",
    "cookie_secret": "GENERATE_STRONG_COOKIE_SECRET_64_CHARS",
    "openai_api_key": "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "qdrant_api_key": "YOUR_QDRANT_API_KEY"
  }'
```

#### Criar Secret para S3

```bash
aws secretsmanager create-secret \
  --name ysh-backend/production/s3 \
  --description "YSH Backend S3 Credentials" \
  --secret-string '{
    "access_key_id": "AKIAXXXXXXXXXXXXXXXX",
    "secret_access_key": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "bucket": "ysh-media-production",
    "region": "us-east-1"
  }'
```

#### Configurar IAM Policy para EC2

Criar policy `ysh-backend-secrets-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": [
        "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:ysh-backend/production/*"
      ]
    }
  ]
}
```

Aplicar:

```bash
# Criar policy
aws iam create-policy \
  --policy-name YSHBackendSecretsAccess \
  --policy-document file://ysh-backend-secrets-policy.json

# Criar role para EC2
aws iam create-role \
  --role-name YSHBackendEC2Role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ec2.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Anexar policy ao role
aws iam attach-role-policy \
  --role-name YSHBackendEC2Role \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/YSHBackendSecretsAccess

# Criar instance profile
aws iam create-instance-profile \
  --instance-profile-name YSHBackendEC2Profile

aws iam add-role-to-instance-profile \
  --instance-profile-name YSHBackendEC2Profile \
  --role-name YSHBackendEC2Role
```

#### Script para Carregar Secrets no EC2

Criar `/opt/ysh/load-secrets.sh`:

```bash
#!/bin/bash
set -e

echo "🔐 Loading secrets from AWS Secrets Manager..."

# Função para buscar secret
get_secret() {
    aws secretsmanager get-secret-value \
        --secret-id "$1" \
        --region us-east-1 \
        --query SecretString \
        --output text
}

# Buscar secrets
DB_SECRET=$(get_secret "ysh-backend/production/database")
API_SECRET=$(get_secret "ysh-backend/production/api-keys")
S3_SECRET=$(get_secret "ysh-backend/production/s3")

# Extrair valores
DB_HOST=$(echo $DB_SECRET | jq -r .host)
DB_PORT=$(echo $DB_SECRET | jq -r .port)
DB_NAME=$(echo $DB_SECRET | jq -r .database)
DB_USER=$(echo $DB_SECRET | jq -r .username)
DB_PASS=$(echo $DB_SECRET | jq -r .password)

JWT_SECRET=$(echo $API_SECRET | jq -r .jwt_secret)
COOKIE_SECRET=$(echo $API_SECRET | jq -r .cookie_secret)
OPENAI_KEY=$(echo $API_SECRET | jq -r .openai_api_key)
QDRANT_KEY=$(echo $API_SECRET | jq -r .qdrant_api_key)

S3_KEY=$(echo $S3_SECRET | jq -r .access_key_id)
S3_SECRET_KEY=$(echo $S3_SECRET | jq -r .secret_access_key)
S3_BUCKET=$(echo $S3_SECRET | jq -r .bucket)
S3_REGION=$(echo $S3_SECRET | jq -r .region)

# Exportar variáveis
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
export DATABASE_SSL="true"
export JWT_SECRET="${JWT_SECRET}"
export COOKIE_SECRET="${COOKIE_SECRET}"
export OPENAI_API_KEY="${OPENAI_KEY}"
export QDRANT_API_KEY="${QDRANT_KEY}"
export FILE_S3_ACCESS_KEY_ID="${S3_KEY}"
export FILE_S3_SECRET_ACCESS_KEY="${S3_SECRET_KEY}"
export FILE_S3_BUCKET="${S3_BUCKET}"
export FILE_S3_REGION="${S3_REGION}"
export FILE_S3_URL="https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com"

echo "✅ Secrets loaded successfully"
```

### Opção 2: AWS Systems Manager Parameter Store

Alternativa mais econômica (grátis até 10,000 parâmetros):

```bash
# Criar parâmetros
aws ssm put-parameter \
  --name "/ysh/backend/production/database-url" \
  --type "SecureString" \
  --value "postgresql://user:pass@host:5432/db"

aws ssm put-parameter \
  --name "/ysh/backend/production/jwt-secret" \
  --type "SecureString" \
  --value "your-jwt-secret"

# ... outros parâmetros
```

### Opção 3: .env File Seguro (Para Staging)

Para ambientes não-produção, usar arquivo `.env` com permissões restritas:

```bash
# Criar .env no servidor
cat > /opt/ysh/.env.production <<EOF
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_SSL=true
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret
OPENAI_API_KEY=sk-xxxxx
FILE_S3_BUCKET=ysh-media-staging
FILE_S3_REGION=us-east-1
FILE_S3_ACCESS_KEY_ID=AKIAxxxx
FILE_S3_SECRET_ACCESS_KEY=xxxxx
FILE_S3_URL=https://ysh-media-staging.s3.us-east-1.amazonaws.com
EOF

# Proteger arquivo
chmod 600 /opt/ysh/.env.production
chown ec2-user:ec2-user /opt/ysh/.env.production
```

---

## 🖥️ EC2 Setup

### 1. Criar EC2 Instance

#### Via Console AWS

1. **Launch Instance**
   - AMI: Amazon Linux 2023 ou Ubuntu 22.04 LTS
   - Instance type: `t3.medium` (2 vCPU, 4GB RAM)
   - Key pair: Criar ou selecionar existente
   - Network: VPC com subnets públicas
   - Security group: Ver seção [Security Groups](#security-groups)
   - Storage: 30GB gp3
   - IAM role: `YSHBackendEC2Profile` (criado acima)

#### Via CLI

```bash
aws ec2 run-instances \
  --image-id ami-xxxxxxxxx \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxxxxx \
  --subnet-id subnet-xxxxxxxxx \
  --iam-instance-profile Name=YSHBackendEC2Profile \
  --block-device-mappings '[{
    "DeviceName": "/dev/xvda",
    "Ebs": {
      "VolumeSize": 30,
      "VolumeType": "gp3",
      "DeleteOnTermination": true
    }
  }]' \
  --tag-specifications 'ResourceType=instance,Tags=[
    {Key=Name,Value=ysh-backend-production},
    {Key=Environment,Value=production},
    {Key=Application,Value=ysh-backend}
  ]'
```

### 2. Configurar EC2 Instance

SSH no servidor:

```bash
ssh -i your-key.pem ec2-user@your-ec2-public-ip
```

#### Instalar Dependências

```bash
#!/bin/bash
set -e

echo "🔧 Installing system dependencies..."

# Atualizar sistema
sudo yum update -y

# Instalar Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Instalar jq (para parsing JSON)
sudo yum install -y jq

# Instalar CloudWatch agent (opcional)
sudo yum install -y amazon-cloudwatch-agent

echo "✅ System dependencies installed"
```

#### Criar Estrutura de Diretórios

```bash
sudo mkdir -p /opt/ysh/{app,logs,backups,scripts}
sudo chown -R ec2-user:ec2-user /opt/ysh
```

### 3. Deploy Application

#### Opção A: Docker Registry (Recomendado)

```bash
# Login no ECR (Elastic Container Registry)
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Pull latest image
docker pull ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest

# Run container
docker run -d \
  --name ysh-backend \
  --restart unless-stopped \
  -p 9000:9000 \
  --env-file /opt/ysh/.env.production \
  -v /opt/ysh/logs:/app/logs \
  -v /opt/ysh/uploads:/app/uploads \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest
```

#### Opção B: Build Local

```bash
# Clone repository
cd /opt/ysh/app
git clone https://github.com/your-org/ysh-backend.git .

# Build Docker image
docker build -t ysh-backend:latest -f Dockerfile .

# Run container (com secrets do AWS)
source /opt/ysh/load-secrets.sh
docker run -d \
  --name ysh-backend \
  --restart unless-stopped \
  -p 9000:9000 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e DATABASE_SSL="true" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e COOKIE_SECRET="$COOKIE_SECRET" \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  -e FILE_S3_BUCKET="$FILE_S3_BUCKET" \
  -e FILE_S3_REGION="$FILE_S3_REGION" \
  -e FILE_S3_ACCESS_KEY_ID="$FILE_S3_ACCESS_KEY_ID" \
  -e FILE_S3_SECRET_ACCESS_KEY="$FILE_S3_SECRET_ACCESS_KEY" \
  -e FILE_S3_URL="$FILE_S3_URL" \
  -v /opt/ysh/logs:/app/logs \
  ysh-backend:latest
```

### 4. Systemd Service (Alternativa ao Docker)

Criar `/etc/systemd/system/ysh-backend.service`:

```ini
[Unit]
Description=YSH Backend Service
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/ysh/app
EnvironmentFile=/opt/ysh/.env.production
ExecStartPre=/opt/ysh/scripts/load-secrets.sh
ExecStart=/opt/ysh/app/entrypoint.sh npm start
Restart=always
RestartSec=10
StandardOutput=append:/opt/ysh/logs/backend.log
StandardError=append:/opt/ysh/logs/backend-error.log

[Install]
WantedBy=multi-user.target
```

Ativar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable ysh-backend
sudo systemctl start ysh-backend
sudo systemctl status ysh-backend
```

---

## 📦 S3 Configuration

### 1. Criar Bucket S3

```bash
# Criar bucket
aws s3api create-bucket \
  --bucket ysh-media-production \
  --region us-east-1

# Habilitar versionamento
aws s3api put-bucket-versioning \
  --bucket ysh-media-production \
  --versioning-configuration Status=Enabled

# Configurar lifecycle (deletar versões antigas após 90 dias)
aws s3api put-bucket-lifecycle-configuration \
  --bucket ysh-media-production \
  --lifecycle-configuration file://s3-lifecycle.json
```

`s3-lifecycle.json`:

```json
{
  "Rules": [
    {
      "Id": "DeleteOldVersions",
      "Status": "Enabled",
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 90
      }
    },
    {
      "Id": "TransitionToIA",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

### 2. Configurar CORS

```bash
aws s3api put-bucket-cors \
  --bucket ysh-media-production \
  --cors-configuration file://s3-cors.json
```

`s3-cors.json`:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": [
        "https://admin.yshsolar.com",
        "https://store.yshsolar.com"
      ],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 3. Configurar Bucket Policy

```bash
aws s3api put-bucket-policy \
  --bucket ysh-media-production \
  --policy file://s3-bucket-policy.json
```

`s3-bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ysh-media-production/public/*"
    },
    {
      "Sid": "BackendFullAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:role/YSHBackendEC2Role"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::ysh-media-production",
        "arn:aws:s3:::ysh-media-production/*"
      ]
    }
  ]
}
```

### 4. Configurar CloudFront (CDN - Opcional)

```bash
# Criar CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name ysh-media-production.s3.us-east-1.amazonaws.com \
  --default-root-object index.html
```

Atualizar `FILE_S3_URL` para usar CloudFront:

```bash
FILE_S3_URL=https://d1234567890.cloudfront.net
```

---

## 🗄️ RDS Database

### 1. Criar RDS Instance

```bash
aws rds create-db-instance \
  --db-instance-identifier ysh-db-production \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username ysh_admin \
  --master-user-password "STRONG_PASSWORD_HERE" \
  --allocated-storage 20 \
  --storage-type gp3 \
  --storage-encrypted \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name ysh-db-subnet-group \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "sun:04:00-sun:05:00" \
  --enable-cloudwatch-logs-exports '["postgresql"]' \
  --tags Key=Environment,Value=production Key=Application,Value=ysh-backend
```

### 2. Configurar Parameter Group

```bash
# Criar parameter group customizado
aws rds create-db-parameter-group \
  --db-parameter-group-name ysh-postgres-params \
  --db-parameter-group-family postgres15 \
  --description "YSH Backend PostgreSQL Parameters"

# Configurar parâmetros
aws rds modify-db-parameter-group \
  --db-parameter-group-name ysh-postgres-params \
  --parameters \
    "ParameterName=max_connections,ParameterValue=200,ApplyMethod=immediate" \
    "ParameterName=shared_buffers,ParameterValue=256MB,ApplyMethod=pending-reboot" \
    "ParameterName=effective_cache_size,ParameterValue=1GB,ApplyMethod=immediate"
```

### 3. Criar Database e User

```sql
-- Conectar ao RDS como admin
psql -h ysh-db-production.xxxxx.us-east-1.rds.amazonaws.com \
     -U ysh_admin -d postgres

-- Criar database
CREATE DATABASE yshdb;

-- Criar usuário específico para a aplicação
CREATE USER ysh_app WITH PASSWORD 'APP_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE yshdb TO ysh_app;

-- Conectar ao database
\c yshdb

-- Criar schema e permissões
CREATE SCHEMA IF NOT EXISTS public;
GRANT ALL ON SCHEMA public TO ysh_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ysh_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ysh_app;

-- Configurações adicionais
ALTER DATABASE yshdb SET timezone TO 'America/Sao_Paulo';
```

### 4. Backup e Restore

```bash
# Backup manual
pg_dump -h ysh-db-production.xxxxx.us-east-1.rds.amazonaws.com \
        -U ysh_admin -d yshdb -F c -f /opt/ysh/backups/yshdb-$(date +%Y%m%d).dump

# Restore
pg_restore -h ysh-db-production.xxxxx.us-east-1.rds.amazonaws.com \
           -U ysh_admin -d yshdb -c /opt/ysh/backups/yshdb-20251013.dump
```

---

## 🔒 Security Groups

### Backend EC2 Security Group

```bash
aws ec2 create-security-group \
  --group-name ysh-backend-sg \
  --description "Security group for YSH Backend EC2" \
  --vpc-id vpc-xxxxxxxxx

# SSH (só do seu IP)
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp --port 22 \
  --cidr YOUR_IP/32

# HTTP/HTTPS (do Load Balancer)
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp --port 9000 \
  --source-group sg-alb-xxxxxxxxx

# Health check
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp --port 9000 \
  --cidr 10.0.0.0/16
```

### RDS Security Group

```bash
aws ec2 create-security-group \
  --group-name ysh-db-sg \
  --description "Security group for YSH RDS" \
  --vpc-id vpc-xxxxxxxxx

# PostgreSQL (só do Backend)
aws ec2 authorize-security-group-ingress \
  --group-id sg-db-xxxxxxxxx \
  --protocol tcp --port 5432 \
  --source-group sg-backend-xxxxxxxxx
```

---

## 📊 Monitoring & Logs

### CloudWatch Logs

```bash
# Instalar CloudWatch agent
sudo yum install -y amazon-cloudwatch-agent

# Configurar agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/ysh/cloudwatch-config.json
```

`cloudwatch-config.json`:

```json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/opt/ysh/logs/backend.log",
            "log_group_name": "/ysh/backend/production",
            "log_stream_name": "{instance_id}/application"
          },
          {
            "file_path": "/var/log/docker.log",
            "log_group_name": "/ysh/backend/production",
            "log_stream_name": "{instance_id}/docker"
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "YSH/Backend",
    "metrics_collected": {
      "cpu": {
        "measurement": ["cpu_usage_idle"],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": ["used_percent"],
        "metrics_collection_interval": 60,
        "resources": ["*"]
      },
      "mem": {
        "measurement": ["mem_used_percent"],
        "metrics_collection_interval": 60
      }
    }
  }
}
```

### CloudWatch Alarms

```bash
# Alarme de CPU alta
aws cloudwatch put-metric-alarm \
  --alarm-name ysh-backend-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=InstanceId,Value=i-xxxxxxxxx

# Alarme de erros na aplicação
aws logs put-metric-filter \
  --log-group-name /ysh/backend/production \
  --filter-name ErrorCount \
  --filter-pattern "[ERROR]" \
  --metric-transformations \
    metricName=ErrorCount,metricNamespace=YSH/Backend,metricValue=1
```

---

## 🔧 Troubleshooting

### Verificar Logs

```bash
# Docker logs
docker logs -f ysh-backend --tail 100

# System logs
tail -f /opt/ysh/logs/backend.log

# CloudWatch logs
aws logs tail /ysh/backend/production --follow
```

### Health Checks

```bash
# Application health
curl http://localhost:9000/health

# Database connection
docker exec ysh-backend npm run migrate -- --help

# S3 access
aws s3 ls s3://ysh-media-production/
```

### Restart Services

```bash
# Docker
docker restart ysh-backend

# Systemd
sudo systemctl restart ysh-backend

# Full reboot
sudo reboot
```

---

## ✅ Deployment Checklist

### Pré-Deploy

- [ ] Secrets criados no AWS Secrets Manager
- [ ] IAM roles e policies configurados
- [ ] EC2 instance criada e configurada
- [ ] RDS database criada e inicializada
- [ ] S3 bucket criado e configurado
- [ ] Security groups configurados
- [ ] Docker image buildada e testada
- [ ] Variáveis de ambiente validadas

### Deploy

- [ ] Container iniciado com sucesso
- [ ] Migrations executadas sem erros
- [ ] Health check respondendo (200 OK)
- [ ] Logs sem erros críticos
- [ ] Conexão com RDS funcionando
- [ ] Upload para S3 funcionando

### Pós-Deploy

- [ ] CloudWatch alarms configurados
- [ ] Backup agendado configurado
- [ ] Monitoring dashboard criado
- [ ] Load Balancer health checks passando
- [ ] SSL/TLS certificado válido
- [ ] DNS configurado corretamente

---

**Última atualização:** 13/10/2025  
**Versão do Backend:** 0.1.0  
**Versão do Medusa:** 2.10.3
