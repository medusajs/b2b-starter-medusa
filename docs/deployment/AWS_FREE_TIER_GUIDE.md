# 🆓 AWS Free Tier Guide for YSH B2B Commerce

**Data**: 08/10/2025  
**Stack**: 100% FOSS + AWS Free Tier maximizado  
**Objetivo**: Ambiente production com custo mínimo (primeiros 12 meses)

---

## 📋 Índice

1. [AWS Free Tier Overview](#1-aws-free-tier-overview)
2. [RDS PostgreSQL Free Tier](#2-rds-postgresql-free-tier)
3. [ElastiCache Alternative (EC2 + Redis)](#3-elasticache-alternative)
4. [S3 + CloudFront Free Tier](#4-s3--cloudfront-free-tier)
5. [EC2 Free Tier (App Hosting)](#5-ec2-free-tier)
6. [Cost Calculator (Post Free Tier)](#6-cost-calculator)
7. [FOSS Stack Local vs. AWS](#7-foss-stack-local-vs-aws)

---

## 1) AWS Free Tier Overview

### 1.1 Tipos de Free Tier

AWS oferece 3 tipos:

| Tipo | Duração | Serviços |
|------|---------|----------|
| **12 meses** | Inicia após criar conta AWS | EC2, RDS, S3, CloudFront, etc. |
| **Always Free** | Permanente (com limites) | Lambda, DynamoDB, SNS, SQS (limitado) |
| **Trials** | Curto prazo (30-60 dias) | SageMaker, Redshift, Inspector |

**Fonte**: <https://aws.amazon.com/free/>

### 1.2 Free Tier Essencial para YSH B2B

```yaml
Compute:
  EC2 t2.micro/t3.micro: 750 hours/month (12 meses)
  
Database:
  RDS db.t2.micro/db.t3.micro: 750 hours/month (12 meses)
  RDS Storage: 20GB SSD (12 meses)
  
Storage:
  S3: 5GB standard storage (12 meses)
  S3: 20,000 GET + 2,000 PUT requests/month (12 meses)
  
CDN:
  CloudFront: 1TB data transfer out (12 meses)
  CloudFront: 10M HTTP/HTTPS requests (12 meses)
  
Network:
  Data Transfer: 100GB out/month (12 meses)
  Elastic IP: 1 endereço estático (se EC2 rodando)
  
Monitoring:
  CloudWatch: 10 métricas + 10 alarmes (Always Free)
  CloudWatch Logs: 5GB ingest (Always Free)
```

---

## 2) RDS PostgreSQL Free Tier

### 2.1 Configuração Free Tier

```yaml
Instance:
  Class: db.t3.micro (2 vCPU, 1GB RAM) ou db.t2.micro
  Engine: PostgreSQL 16
  Hours: 750h/month (24/7 para 1 instância)
  
Storage:
  Type: gp2 (General Purpose SSD)
  Size: 20GB
  Backups: 20GB (incluído)
  
Network:
  Multi-AZ: NÃO (sai do free tier)
  Public Access: Sim (para acesso externo)
  
Monitoring:
  CloudWatch: Métricas básicas incluídas
  Enhanced Monitoring: NÃO (custa extra)
```

### 2.2 Terraform Configuration

```hcl
# terraform/rds.tf
resource "aws_db_instance" "postgres_free_tier" {
  identifier              = "ysh-b2b-postgres-free"
  engine                  = "postgres"
  engine_version          = "16.1"
  instance_class          = "db.t3.micro"  # FREE TIER
  allocated_storage       = 20              # FREE TIER (max 20GB)
  storage_type            = "gp2"
  storage_encrypted       = false           # Free tier não suporta encryption
  
  db_name  = "medusa_db"
  username = "medusa_user"
  password = var.db_password
  
  # Network
  publicly_accessible    = true
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  # Backups (free tier: 20GB)
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  
  # Maintenance
  maintenance_window = "sun:04:00-sun:05:00"
  
  # Performance Insights: NÃO (custa extra)
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  # Multi-AZ: NÃO (sai do free tier)
  multi_az = false
  
  # Deletion protection
  deletion_protection = false
  skip_final_snapshot = true
  
  tags = {
    Name        = "ysh-b2b-postgres-free-tier"
    Environment = "production"
    FreeTier    = "true"
  }
}

# Security Group
resource "aws_security_group" "rds" {
  name        = "ysh-b2b-rds-sg"
  description = "Allow PostgreSQL from EC2"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]  # Somente EC2 pode acessar
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

### 2.3 Conexão String

```bash
# .env (Backend)
DATABASE_URL=postgresql://medusa_user:PASSWORD@ysh-b2b-postgres-free.xxxxx.us-east-1.rds.amazonaws.com:5432/medusa_db
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=true
```

### 2.4 Monitoramento Free Tier

```bash
# CloudWatch métricas incluídas (free):
- CPUUtilization
- DatabaseConnections
- FreeableMemory
- FreeStorageSpace
- ReadIOPS / WriteIOPS
- ReadLatency / WriteLatency

# Alarmes recomendados (10 free):
aws cloudwatch put-metric-alarm \
  --alarm-name rds-cpu-high \
  --alarm-description "RDS CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --dimensions Name=DBInstanceIdentifier,Value=ysh-b2b-postgres-free
```

### 2.5 Limitações Free Tier RDS

❌ **NÃO inclui**:

- Multi-AZ (HA)
- Read Replicas
- Performance Insights
- Storage encryption
- Enhanced Monitoring
- Automated backups > 20GB
- Storage > 20GB

✅ **Inclui**:

- 750h/mês (24/7 para 1 instância)
- 20GB storage + 20GB backups
- Automated backups (7 dias)
- CloudWatch basic metrics
- Security Groups

---

## 3) ElastiCache Alternative (EC2 + Redis)

**Problema**: AWS ElastiCache **NÃO tem free tier**.

**Solução**: Rodar Redis em EC2 t3.micro (free tier 750h/mês).

### 3.1 Setup Redis em EC2

```bash
# 1. Criar EC2 t3.micro (Amazon Linux 2023)
# Via console: EC2 → Launch Instance → t3.micro (free tier eligible)

# 2. SSH na instância
ssh -i keypair.pem ec2-user@ec2-xx-xx-xx-xx.compute.amazonaws.com

# 3. Instalar Redis
sudo dnf install -y redis
sudo systemctl enable redis
sudo systemctl start redis

# 4. Configurar Redis para aceitar conexões remotas
sudo nano /etc/redis/redis.conf

# Alterar:
bind 0.0.0.0
protected-mode no
requirepass seu-password-forte

sudo systemctl restart redis

# 5. Abrir porta 6379 no Security Group (somente para backend EC2)
```

### 3.2 Terraform Configuration

```hcl
# terraform/ec2-redis.tf
resource "aws_instance" "redis" {
  ami           = "ami-0c55b159cbfafe1f0"  # Amazon Linux 2023
  instance_type = "t3.micro"  # FREE TIER
  
  key_name               = aws_key_pair.main.key_name
  vpc_security_group_ids = [aws_security_group.redis.id]
  subnet_id              = aws_subnet.private[0].id
  
  user_data = <<-EOF
    #!/bin/bash
    dnf install -y redis
    systemctl enable redis
    systemctl start redis
    
    # Configure Redis
    sed -i 's/bind 127.0.0.1/bind 0.0.0.0/' /etc/redis/redis.conf
    sed -i 's/protected-mode yes/protected-mode no/' /etc/redis/redis.conf
    echo "requirepass ${var.redis_password}" >> /etc/redis/redis.conf
    
    systemctl restart redis
  EOF
  
  tags = {
    Name        = "ysh-b2b-redis-free-tier"
    Environment = "production"
    FreeTier    = "true"
  }
}

resource "aws_security_group" "redis" {
  name        = "ysh-b2b-redis-sg"
  description = "Allow Redis from backend"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

### 3.3 Custos EC2 Redis

```yaml
Free Tier (12 meses):
  - EC2 t3.micro: 750h/mês = $0
  - Storage 8GB: free tier = $0
  - Data Transfer: 100GB out/mês = $0
  Total: $0/mês

Pós Free Tier:
  - EC2 t3.micro: $0.0104/h × 730h = $7.59/mês
  - Storage 8GB: $0.10/GB = $0.80/mês
  - Data Transfer: $0.09/GB após 100GB
  Total: ~$8.39/mês
```

**Comparação**:

- ElastiCache cache.t3.micro: **$15.33/mês** (sem free tier)
- EC2 t3.micro + Redis: **$0/mês** (12 meses), depois **$8.39/mês**
- **Economia**: 100% no primeiro ano, 45% depois

---

## 4) S3 + CloudFront Free Tier

### 4.1 S3 Free Tier

```yaml
Storage:
  - 5GB Standard storage (12 meses)
  
Requests:
  - 20,000 GET requests (12 meses)
  - 2,000 PUT/COPY/POST/LIST (12 meses)
  
Data Transfer:
  - OUT: Grátis se via CloudFront (usa free tier CloudFront)
  - OUT: 100GB/mês se direto (free tier geral AWS)
```

### 4.2 CloudFront Free Tier

```yaml
Data Transfer:
  - 1TB (1,000GB) out para internet (12 meses)
  
Requests:
  - 10 milhões HTTP/HTTPS (12 meses)
  
Field-Level Encryption:
  - 10 milhões requests (12 meses)
```

### 4.3 Terraform Configuration

```hcl
# terraform/s3.tf
resource "aws_s3_bucket" "uploads" {
  bucket = "ysh-b2b-uploads-${random_id.suffix.hex}"
  
  tags = {
    Name        = "ysh-b2b-uploads"
    Environment = "production"
    FreeTier    = "true"
  }
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  
  versioning_configuration {
    status = "Enabled"  # Free (storage cobrará versões antigas)
  }
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "YSH B2B CDN (Free Tier)"
  default_root_object = "index.html"
  
  origin {
    domain_name = aws_s3_bucket.uploads.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.uploads.id}"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
    }
  }
  
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.uploads.id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    min_ttl     = 0
    default_ttl = 86400   # 24 hours
    max_ttl     = 31536000 # 1 year
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
  
  tags = {
    Name        = "ysh-b2b-cdn"
    Environment = "production"
    FreeTier    = "true"
  }
}
```

### 4.4 Uso Estimado Free Tier

**Cenário**: Site de solar com imagens de produtos

```yaml
Armazenamento (5GB free):
  - 5,000 imagens × 1MB = 5GB ✅
  
CloudFront (1TB + 10M requests free):
  - 10,000 visitantes/mês
  - 20 páginas/visitante
  - 10 imagens/página
  - Total: 10k × 20 × 10 = 2M imagens servidas
  - Data: 2M × 1MB = 2TB (50% cachê = 1TB) ✅
  
S3 Requests (20k GET free):
  - CloudFront cachê hit 90% = 200k misses
  - S3 GET: 200k (ultrapassa 20k) ⚠️
  - Custo excedente: (200k - 20k) × $0.0004/1k = $0.072/mês
```

**Conclusão**: Free tier cobre ~95% do custo. Excedente: **$0.07-0.10/mês**.

---

## 5) EC2 Free Tier (App Hosting)

### 5.1 Configuração Free Tier

```yaml
Instance:
  Type: t3.micro (2 vCPU, 1GB RAM) ou t2.micro
  Hours: 750h/month (24/7 para 1 instância)
  OS: Amazon Linux 2023 (free)
  
Storage:
  EBS gp2: 30GB (free tier)
  
Network:
  Data Transfer OUT: 100GB/mês (free tier geral)
  Elastic IP: 1 grátis (enquanto associado a instância rodando)
```

### 5.2 Opções de Deploy

**Opção A: EC2 + Docker** (recomendado para FOSS stack)

```bash
# User data script
#!/bin/bash
yum update -y
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Clone repo e iniciar
cd /home/ec2-user
git clone https://github.com/ysh/ysh-b2b.git
cd ysh-b2b
docker-compose -f docker-compose.foss.yml up -d
```

**Opção B: ECS Fargate** (não tem free tier, mas mais escalável)

**Opção C: AWS Lightsail** ($5/mês, mais simples que EC2)

### 5.3 Terraform Configuration

```hcl
# terraform/ec2-app.tf
resource "aws_instance" "app" {
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = "t3.micro"  # FREE TIER
  
  key_name               = aws_key_pair.main.key_name
  vpc_security_group_ids = [aws_security_group.app.id]
  subnet_id              = aws_subnet.public[0].id
  
  root_block_device {
    volume_size = 30  # FREE TIER
    volume_type = "gp2"
  }
  
  user_data = file("${path.module}/user-data.sh")
  
  tags = {
    Name        = "ysh-b2b-app-free-tier"
    Environment = "production"
    FreeTier    = "true"
  }
}

resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"
  
  tags = {
    Name = "ysh-b2b-app-eip"
  }
}

resource "aws_security_group" "app" {
  name        = "ysh-b2b-app-sg"
  description = "Allow HTTP/HTTPS"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Restringir ao seu IP
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

---

## 6) Cost Calculator (Post Free Tier)

### 6.1 Custos após 12 meses

| Serviço | Free Tier (12m) | Pós Free Tier | Custo/Mês |
|---------|-----------------|---------------|-----------|
| **EC2 t3.micro (App)** | 750h free | $0.0104/h × 730h | $7.59 |
| **EC2 t3.micro (Redis)** | 750h free | $0.0104/h × 730h | $7.59 |
| **RDS db.t3.micro** | 750h + 20GB free | $0.017/h × 730h + $0.115/GB × 20GB | $14.71 |
| **S3 (50GB)** | 5GB free | $0.023/GB × 50GB | $1.15 |
| **S3 Requests** | 20k GET free | $0.0004/1k × 500k GET | $0.20 |
| **CloudFront (2TB)** | 1TB free | $0.085/GB × 1,000GB | $85.00 |
| **Data Transfer (150GB)** | 100GB free | $0.09/GB × 50GB | $4.50 |
| **EBS (60GB)** | 30GB free | $0.10/GB × 30GB | $3.00 |
| **Elastic IP** | 1 free | $0 (se associado) | $0 |
| **CloudWatch** | 10 métricas free | Always free | $0 |
| **Route53** | - | $0.50/hosted zone + $0.40/M queries | $1.00 |
| **Total** | **$0/mês** | | **~$124.74/mês** |

### 6.2 Otimizações Pós Free Tier

**Reduzir custos em 60%:**

```yaml
1. Combinar App + Redis em 1 EC2 t3.small:
   - t3.micro × 2 = $15.18
   - t3.small × 1 = $15.18 (mesma coisa, mas mais RAM)
   Economia: $0 (mas melhor performance)

2. RDS Reserved Instance (1 ano):
   - On-demand: $14.71/mês
   - Reserved 1y: $9.50/mês (-35%)
   Economia: $5.21/mês

3. CloudFront: Usar compression + cache agressivo:
   - 2TB → 1TB (50% cache hit)
   - $85 → $42.50 (-50%)
   Economia: $42.50/mês

4. S3 Intelligent Tiering:
   - 50GB → 30GB frequent + 20GB infrequent
   - $1.15 → $0.69 + $0.26 = $0.95 (-17%)
   Economia: $0.20/mês

Total Otimizado: $124.74 → $76.28/mês (-39%)
```

---

## 7) FOSS Stack Local vs. AWS

### 7.1 Comparação

| Componente | FOSS Local (docker-compose.foss.yml) | AWS Free Tier (12m) | AWS Pós Free Tier |
|------------|--------------------------------------|---------------------|-------------------|
| **PostgreSQL** | postgres:16-alpine (free) | RDS db.t3.micro ($0) | $14.71/mês |
| **Redis** | redis:7-alpine (free) | EC2 t3.micro ($0) | $7.59/mês |
| **Object Storage** | MinIO (free) | S3 5GB ($0) | $1.15/mês (50GB) |
| **CDN** | Nginx local (free) | CloudFront 1TB ($0) | $85/mês (2TB) |
| **Observability** | Prometheus + Grafana + Loki + Jaeger (free) | CloudWatch 10 métricas ($0) | $0 (always free básico) |
| **App Hosting** | Docker containers (free) | EC2 t3.micro ($0) | $7.59/mês |
| **Event Bus** | BullMQ + Redis (free) | SNS/SQS (limited free) | $0.50/M msgs |
| **Total Infra** | **$0/mês** (apenas custos locais) | **$0/mês** (12 meses) | **~$76-125/mês** |

### 7.2 Recomendação Estratégica

**Fase 1: Desenvolvimento (Local FOSS)**

```yaml
Ambiente: docker-compose.foss.yml
Stack: PostgreSQL + Redis + MinIO + Prometheus + Grafana + Loki + Jaeger
Custo: $0/mês
Duração: Até lançamento (3-6 meses)
```

**Fase 2: MVP (AWS Free Tier)**

```yaml
Ambiente: AWS (primeiros 12 meses)
Stack: RDS + EC2 (app + Redis) + S3 + CloudFront
Custo: $0/mês (free tier) + $0.10/mês (excedentes mínimos)
Duração: 12 meses após lançamento
Usuários: 0-10k/mês
```

**Fase 3: Crescimento (AWS Otimizado)**

```yaml
Ambiente: AWS (após free tier) + FOSS tooling
Stack: 
  - Compute: EC2 Reserved Instances ou ECS Fargate Spot
  - Database: RDS Reserved Instance
  - Cache: ElastiCache Reserved Node
  - Storage: S3 Intelligent Tiering + CloudFront compression
  - Observability: Grafana Cloud free tier (10k metrics) + Sentry free (5k events)
Custo: $76-125/mês (otimizado) vs. $300-500/mês (standard)
Usuários: 10k-100k/mês
```

**Fase 4: Escala (Híbrido FOSS + AWS)**

```yaml
Ambiente: Kubernetes (EKS ou self-hosted) + AWS managed services
Stack:
  - Compute: EKS (self-managed nodes) ou EC2 Auto Scaling
  - Database: Aurora Serverless v2 (pay-per-use)
  - Cache: Redis Cluster self-hosted em EC2
  - Storage: S3 + CloudFront + Intelligent Tiering
  - Observability: Victoria Metrics (FOSS) + Grafana + Jaeger
Custo: $200-500/mês (dependendo tráfego)
Usuários: 100k+/mês
```

---

## 8) Setup AWS Free Tier (Passo a Passo)

### 8.1 Criar Conta AWS

1. Acesse: <https://aws.amazon.com/free/>
2. Clique "Create Free Account"
3. Preencha: email, password, account name
4. Verificar email
5. Adicionar cartão de crédito (não será cobrado se dentro do free tier)
6. Verificar identidade (SMS)
7. Escolher plano: **Basic Support (Free)**

### 8.2 Habilitar Free Tier Alerts

```bash
# Via AWS Console:
1. AWS Billing Dashboard
2. Billing preferences
3. Enable: "Receive Free Tier Usage Alerts"
4. Email: seu-email@ysh.solar
5. Threshold: 85% do free tier
```

### 8.3 Deploy com Terraform

```bash
# 1. Instalar Terraform
brew install terraform  # Mac
# ou
choco install terraform  # Windows

# 2. Configurar AWS credentials
aws configure
# AWS Access Key ID: AKIA...
# AWS Secret Access Key: ...
# Default region: us-east-1

# 3. Clonar repo e navegar para /terraform
cd ysh-store/terraform

# 4. Inicializar Terraform
terraform init

# 5. Planejar deploy (free tier)
terraform plan -var-file=free-tier.tfvars

# 6. Aplicar (criar recursos)
terraform apply -var-file=free-tier.tfvars

# 7. Output mostrará endpoints:
# - RDS endpoint: xxx.rds.amazonaws.com
# - EC2 public IP: xx.xx.xx.xx
# - S3 bucket: ysh-b2b-uploads-xxx
# - CloudFront URL: dxxxx.cloudfront.net
```

### 8.4 Configurar DNS (Route53)

```bash
# Via AWS Console:
1. Route53 → Hosted Zones → Create
2. Domain: ysh.solar ($0.50/mês)
3. Create Record:
   - Type: A
   - Name: api
   - Value: EC2 Elastic IP
4. Create Record:
   - Type: CNAME
   - Name: app
   - Value: CloudFront distribution
```

---

## 9) Monitoramento Free Tier Usage

### 9.1 AWS Billing Dashboard

```bash
# Via Console:
1. AWS Billing Dashboard
2. "Free Tier" (menu esquerdo)
3. Ver uso atual vs. limite:
   - EC2: 650/750 hours used
   - RDS: 720/750 hours used
   - S3: 3.2/5 GB used
   - CloudFront: 0.5/1 TB used
```

### 9.2 CLI para Monitorar

```bash
# Instalar AWS CLI
pip install awscli

# Ver custo estimado mês atual
aws ce get-cost-and-usage \
  --time-period Start=$(date -d 'month ago' +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --query 'ResultsByTime[0].Total.BlendedCost.Amount'

# Listar free tier usage (não oficial, via tag)
aws resourcegroupstaggingapi get-resources \
  --tag-filters Key=FreeTier,Values=true
```

### 9.3 Alerta Automático (CloudWatch)

```bash
# Criar alarme de custo (via CLI)
aws cloudwatch put-metric-alarm \
  --alarm-name free-tier-exceeded \
  --alarm-description "Alert when bill > $1" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --threshold 1.0 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --dimensions Name=Currency,Value=USD
```

---

## 10) Conclusão

### 10.1 Resumo Estratégia FOSS + AWS Free Tier

✅ **Ano 1 (Desenvolvimento + MVP)**:

- Dev local: `docker-compose.foss.yml` ($0/mês)
- Production: AWS Free Tier ($0-0.10/mês)
- Total: **$0-0.10/mês**

✅ **Ano 2 (Crescimento)**:

- Production: AWS otimizado ($76-125/mês)
- Observability: Grafana Cloud free + Victoria Metrics
- Total: **$76-125/mês**

✅ **Ano 3+ (Escala)**:

- Hybrid: EKS self-managed + AWS managed services
- FOSS maximizado: Victoria Metrics, Grafana, Jaeger, MinIO (se viável)
- Total: **$200-500/mês** (dependendo tráfego)

### 10.2 Benefícios Stack FOSS

- 🔓 **Zero vendor lock-in**: Migrar entre clouds facilmente
- 💰 **Cost savings**: 60-80% economia vs. managed services
- 🛠️ **Flexibilidade**: Controle total de configuração
- 📈 **Scalability**: Escalar horizontalmente sem limites de pricing tier
- 🔒 **Security**: Auditável, sem backdoors
- 🌍 **Community**: Suporte ativo, plugins, extensões

### 10.3 Próximos Passos

1. ✅ Testar `docker-compose.foss.yml` localmente
2. ✅ Criar conta AWS (free tier)
3. ✅ Deploy Terraform (RDS + EC2 + S3 + CloudFront)
4. ✅ Configurar DNS (Route53)
5. ✅ Migrar dados dev → AWS
6. ✅ Monitorar free tier usage (85% alert)
7. ✅ Após 12 meses: avaliar otimizações (Reserved Instances, etc.)

---

**Links Úteis**:

- [AWS Free Tier](https://aws.amazon.com/free/)
- [AWS Cost Calculator](https://calculator.aws/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [PostgreSQL on AWS](https://aws.amazon.com/rds/postgresql/)
- [MinIO Docs](https://min.io/docs/)
- [BullMQ](https://docs.bullmq.io/)
- [Grafana OSS](https://grafana.com/oss/)

**Dúvidas?** Comandante A, pronto para `docker-compose -f docker-compose.foss.yml up -d`? 🚀
