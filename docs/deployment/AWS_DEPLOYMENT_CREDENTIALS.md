# 🔐 Credenciais Necessárias para Deployment AWS

**Status**: ⚠️ **INCOMPLETO** - Faltam credenciais IAM principais

---

## 📋 Inventário de Credenciais

### ✅ **Você JÁ TEM:**

```
📂 backend/secrets/
  ├── pk-APKA3ICDVAH5Q6MVMJFV.pem      ✅ CloudFront Private Key
  └── rsa-APKA3ICDVAH5Q6MVMJFV.pem     ✅ CloudFront Public Key
```

**Uso:** Assinatura de URLs privadas do CloudFront (signed URLs)

**Limitação:** Essas chaves NÃO permitem fazer deploy na AWS!

---

## ❌ **Você PRECISA (para deploy completo):**

### 1️⃣ **IAM User Credentials (CRÍTICO)**

```bash
# Necessário para:
# - Fazer login no ECR (Docker Registry)
# - Criar recursos (RDS, EC2, ECS, S3, etc.)
# - Deploy de aplicações
# - CI/CD (GitHub Actions)

AWS_ACCESS_KEY_ID=AKIA...          # 20 caracteres, começa com AKIA
AWS_SECRET_ACCESS_KEY=...          # 40 caracteres
AWS_REGION=us-east-1               # Região AWS
AWS_ACCOUNT_ID=123456789012        # 12 dígitos
```

**Como obter:**

#### Opção A: Se você já tem conta AWS

```powershell
# 1. Login no AWS Console
# https://console.aws.amazon.com/

# 2. IAM → Users → Seu usuário → Security credentials
# 3. Clicar "Create access key"
# 4. Escolher: "Command Line Interface (CLI)"
# 5. Copiar Access Key ID e Secret Access Key
# ⚠️ ATENÇÃO: Secret só aparece 1 vez! Salve em local seguro.
```

#### Opção B: Se não tem conta AWS

```powershell
# 1. Criar conta: https://aws.amazon.com/free/
# 2. Após criar, seguir Opção A acima
```

### 2️⃣ **GitHub Secrets (para CI/CD)**

```yaml
# Configurar em: https://github.com/own-boldsbrain/ysh-b2b/settings/secrets/actions

Secrets necessários:
  AWS_ACCESS_KEY_ID:        # Mesmo do item 1
  AWS_SECRET_ACCESS_KEY:    # Mesmo do item 1
  AWS_REGION:               # us-east-1
  AWS_ACCOUNT_ID:           # 123456789012
  
  # Para GitHub Actions OIDC (recomendado, mais seguro):
  AWS_ROLE_ARN:             # arn:aws:iam::123456789012:role/GitHubActionsRole
```

### 3️⃣ **AWS Secrets Manager (após criar conta)**

```bash
# Criar secrets para aplicação:
aws secretsmanager create-secret \
  --name /ysh-b2b/jwt-secret \
  --secret-string "$(openssl rand -hex 32)"

aws secretsmanager create-secret \
  --name /ysh-b2b/cookie-secret \
  --secret-string "$(openssl rand -hex 32)"

aws secretsmanager create-secret \
  --name /ysh-b2b/database-url \
  --secret-string "postgres://user:pass@rds-endpoint:5432/medusa_db"

# Etc. (ver AWS_FREE_TIER_GUIDE.md para lista completa)
```

---

## 🚀 Fluxo de Deployment AWS

### **Passo 1: Configurar AWS CLI (local)**

```powershell
# Instalar AWS CLI (se não tiver)
winget install Amazon.AWSCLI

# Configurar credenciais IAM
aws configure --profile ysh-production

# Será solicitado:
AWS Access Key ID [None]: AKIA...
AWS Secret Access Key [None]: ...
Default region name [None]: us-east-1
Default output format [None]: json

# Testar
aws sts get-caller-identity --profile ysh-production
# Output esperado:
# {
#   "UserId": "AIDA...",
#   "Account": "123456789012",
#   "Arn": "arn:aws:iam::123456789012:user/ysh-deploy"
# }
```

### **Passo 2: Verificar Permissões IAM**

```powershell
# Seu usuário IAM precisa das seguintes políticas:
# - AmazonEC2ContainerRegistryFullAccess (ECR)
# - AmazonECS_FullAccess (ECS/Fargate)
# - AmazonRDSFullAccess (RDS)
# - AmazonS3FullAccess (S3)
# - CloudFrontFullAccess (CloudFront)
# - SecretsManagerReadWrite (Secrets Manager)
# - CloudWatchLogsFullAccess (Logs)
# - IAMFullAccess (criar roles)

# Verificar políticas anexadas:
aws iam list-attached-user-policies \
  --user-name SEU_USUARIO \
  --profile ysh-production
```

### **Passo 3: Criar Infraestrutura (Terraform ou CloudFormation)**

```powershell
# Opção A: Terraform (recomendado)
cd ysh-store/terraform
terraform init
terraform plan -var-file=free-tier.tfvars
terraform apply -var-file=free-tier.tfvars

# Opção B: CloudFormation
aws cloudformation create-stack \
  --stack-name ysh-b2b-infrastructure \
  --template-body file://cloudformation/infrastructure.yaml \
  --capabilities CAPABILITY_IAM \
  --profile ysh-production
```

### **Passo 4: Build e Push de Imagens Docker**

```powershell
# 1. Login no ECR
$AWS_ACCOUNT_ID = aws sts get-caller-identity --query Account --output text --profile ysh-production
aws ecr get-login-password --region us-east-1 --profile ysh-production | `
  docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com"

# 2. Build Backend
cd backend
docker build -t ysh-b2b-backend:latest .
docker tag ysh-b2b-backend:latest "$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-backend:latest"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-backend:latest"

# 3. Build Storefront
cd ../storefront
docker build -t ysh-b2b-storefront:latest .
docker tag ysh-b2b-storefront:latest "$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-storefront:latest"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-storefront:latest"
```

### **Passo 5: Deploy no ECS/Fargate**

```powershell
# Atualizar serviços ECS
aws ecs update-service `
  --cluster production-ysh-b2b-cluster `
  --service ysh-b2b-backend-service `
  --force-new-deployment `
  --profile ysh-production

aws ecs update-service `
  --cluster production-ysh-b2b-cluster `
  --service ysh-b2b-storefront-service `
  --force-new-deployment `
  --profile ysh-production

# Aguardar estabilização
aws ecs wait services-stable `
  --cluster production-ysh-b2b-cluster `
  --services ysh-b2b-backend-service ysh-b2b-storefront-service `
  --profile ysh-production
```

---

## 🔒 Onde Guardar Credenciais (SEGURANÇA)

### ❌ **NUNCA fazer:**

```bash
# NÃO commitar para Git!
# NÃO colocar em .env sem gitignore!
# NÃO compartilhar em Slack/Email!
# NÃO deixar em scripts públicos!
```

### ✅ **Locais seguros:**

1. **AWS CLI config (local)**

   ```
   ~/.aws/credentials (Linux/Mac)
   C:\Users\seu-user\.aws\credentials (Windows)
   ```

2. **GitHub Secrets (CI/CD)**

   ```
   https://github.com/own-boldsbrain/ysh-b2b/settings/secrets/actions
   ```

3. **AWS Secrets Manager (produção)**

   ```bash
   aws secretsmanager get-secret-value --secret-id /ysh-b2b/api-key
   ```

4. **1Password / BitWarden (backup)**

   ```
   Criar vault "YSH AWS Credentials"
   ```

---

## 📊 Comparação: Credenciais que Você TEM vs. PRECISA

| Credencial | Status | Tipo | Uso |
|------------|--------|------|-----|
| `pk-APKA3ICDVAH5Q6MVMJFV.pem` | ✅ Você tem | CloudFront Key | Signed URLs |
| `rsa-APKA3ICDVAH5Q6MVMJFV.pem` | ✅ Você tem | CloudFront Key | Signed URLs |
| `AWS_ACCESS_KEY_ID` | ❌ **FALTA** | IAM User | Deploy, CLI, API |
| `AWS_SECRET_ACCESS_KEY` | ❌ **FALTA** | IAM User | Deploy, CLI, API |
| `AWS_ACCOUNT_ID` | ❌ **FALTA** | AWS Account | Identificar conta |
| JWT Secret | ❌ Criar depois | Application | Medusa auth |
| Cookie Secret | ❌ Criar depois | Application | Medusa sessions |
| Database Password | ❌ Criar depois | RDS | PostgreSQL |
| Redis Password | ❌ Criar depois | ElastiCache | Redis auth |

---

## 🎯 Próximos Passos (Ordem de Prioridade)

### 1. **Obter Credenciais IAM (URGENTE)**

```powershell
# Se JÁ tem conta AWS:
# 1. Login: https://console.aws.amazon.com/
# 2. IAM → Users → Create access key
# 3. Copiar Access Key ID + Secret Access Key

# Se NÃO tem conta AWS:
# 1. Criar conta: https://aws.amazon.com/free/
# 2. Seguir passos acima
```

### 2. **Configurar AWS CLI (local)**

```powershell
aws configure --profile ysh-production
# Inserir Access Key ID e Secret Access Key
```

### 3. **Testar Conexão**

```powershell
aws sts get-caller-identity --profile ysh-production
aws s3 ls --profile ysh-production
```

### 4. **Criar Infraestrutura AWS**

```powershell
# Ver guia completo em: AWS_FREE_TIER_GUIDE.md
# Criar: RDS, EC2, S3, CloudFront, ECS, etc.
```

### 5. **Deploy Aplicação**

```powershell
# Usar script: scripts/deploy-aws.sh
# Ou GitHub Actions (CI/CD automático)
```

---

## 🆘 Precisa de Ajuda?

### **Opção 1: Desenvolvimento Local (sem AWS)**

```powershell
# Usar stack FOSS local (docker-compose.foss.yml)
# Não precisa de credenciais AWS
# Custo: $0/mês
cd ysh-store
docker-compose -f docker-compose.foss.yml up -d
```

### **Opção 2: Emulação AWS Local (LocalStack)**

```powershell
# Testar deploy sem conta AWS real
# Custo: $0/mês (Community) ou $35/mês (Pro)
cd ysh-store
docker-compose -f docker-compose.localstack.yml up -d
```

### **Opção 3: Deploy AWS Real (Free Tier)**

```powershell
# Requer: AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY
# Custo: $0/mês (primeiros 12 meses)
# Ver: AWS_FREE_TIER_GUIDE.md
```

---

## 📚 Documentação Relacionada

- `AWS_FREE_TIER_GUIDE.md` - Guia completo AWS Free Tier
- `PRODUCTION_ARCHITECTURE.md` - Arquitetura completa de produção
- `docker-compose.foss.yml` - Stack FOSS local (alternativa)
- `docker-compose.localstack.yml` - Emulação AWS local
- `scripts/deploy-aws.sh` - Script de deploy AWS
- `docs/AWS_SETUP_COMPLETE.md` - Setup passo a passo AWS

---

## ✅ Checklist de Deployment

```tsx
Fase 1: Preparação
[ ] Criar conta AWS (ou usar existente)
[ ] Obter AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY
[ ] Instalar AWS CLI
[ ] Configurar aws configure --profile ysh-production
[ ] Testar: aws sts get-caller-identity

Fase 2: Infraestrutura
[ ] Criar VPC + Subnets (Terraform/CloudFormation)
[ ] Criar RDS PostgreSQL (db.t3.micro - free tier)
[ ] Criar ElastiCache Redis (ou EC2 t3.micro + Redis)
[ ] Criar S3 buckets (uploads, backups)
[ ] Criar CloudFront distribution
[ ] Criar ECS Cluster + Task Definitions
[ ] Criar Secrets Manager (JWT, Cookie, DB, Redis)
[ ] Criar IAM Roles (ECS Task Execution + Task Role)

Fase 3: Deploy
[ ] Build backend Docker image
[ ] Build storefront Docker image
[ ] Push images para ECR
[ ] Criar ECS Services (backend + storefront)
[ ] Configurar ALB (Application Load Balancer)
[ ] Configurar Route53 (DNS)
[ ] Configurar SSL/TLS (ACM Certificate)
[ ] Testar endpoints (health checks)

Fase 4: CI/CD
[ ] Configurar GitHub Secrets
[ ] Criar GitHub Actions workflow
[ ] Testar deploy automático (push to main)
[ ] Configurar rollback automático
[ ] Configurar alertas (CloudWatch Alarms)
```

---

**Conclusão**: Você tem apenas chaves CloudFront (signed URLs), mas precisa de **IAM User Credentials** (Access Key + Secret Key) para fazer deploy completo na AWS. Sem isso, não é possível criar recursos ou fazer deploy de aplicações.

**Recomendação**: Se não tem urgência para produção, comece com `docker-compose.foss.yml` (100% local, $0/mês) para desenvolvimento.
