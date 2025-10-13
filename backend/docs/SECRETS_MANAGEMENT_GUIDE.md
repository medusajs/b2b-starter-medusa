# 🔐 Secrets Management Guide - YSH Backend

**Data:** 13 de Outubro, 2025  
**Status:** ✅ Produção Ready

---

## 📋 Visão Geral

Este guia documenta todos os secrets necessários para o backend YSH, incluindo:

- ✅ Credenciais de banco de dados
- ✅ API Keys (OpenAI, Qdrant)
- ✅ AWS S3 credentials
- ✅ JWT e Cookie secrets
- ✅ Como gerenciar secrets em diferentes ambientes

---

## 🔑 Lista Completa de Secrets

### 1. Core Application Secrets

| Secret | Descrição | Formato | Exemplo | Obrigatório |
|--------|-----------|---------|---------|-------------|
| `JWT_SECRET` | Chave para assinar JWT tokens | String 64+ chars | `your-super-secret-jwt-key-min-64-chars-long` | ✅ Sim |
| `COOKIE_SECRET` | Chave para assinar cookies | String 64+ chars | `your-super-secret-cookie-key-min-64-chars` | ✅ Sim |
| `NODE_ENV` | Ambiente da aplicação | `development`\|`production` | `production` | ✅ Sim |

### 2. Database Secrets

| Secret | Descrição | Formato | Exemplo | Obrigatório |
|--------|-----------|---------|---------|-------------|
| `DATABASE_URL` | URL completa do PostgreSQL | `postgresql://user:pass@host:port/db` | `postgresql://ysh_app:password@localhost:5432/yshdb` | ✅ Sim |
| `DATABASE_SSL` | Habilitar SSL (AWS RDS) | `true`\|`false` | `true` | Produção |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | Validar certificado SSL | `true`\|`false` | `false` | Não |
| `DATABASE_SSL_CA_FILE` | Path para certificado CA | File path | `/tmp/rds-ca-bundle.pem` | Não |

### 3. Redis Secrets (Opcional)

| Secret | Descrição | Formato | Exemplo | Obrigatório |
|--------|-----------|---------|---------|-------------|
| `REDIS_URL` | URL do Redis | `redis://host:port` | `redis://localhost:6379` | Não |

### 4. AI & RAG Secrets

| Secret | Descrição | Formato | Exemplo | Obrigatório |
|--------|-----------|---------|---------|-------------|
| `OPENAI_API_KEY` | OpenAI API Key para embeddings/GPT | `sk-...` | `sk-proj-xxxxxxxxxxxxx` | ✅ Sim |
| `QDRANT_API_KEY` | Qdrant Cloud API Key | String | `qdrant_xxxxxxxxxxxxx` | Cloud |
| `QDRANT_URL` | URL do Qdrant | URL | `https://cluster.qdrant.io` | ✅ Sim |

### 5. AWS S3 Secrets

| Secret | Descrição | Formato | Exemplo | Obrigatório |
|--------|-----------|---------|---------|-------------|
| `FILE_S3_BUCKET` | Nome do bucket S3 | String | `ysh-media-production` | S3 |
| `FILE_S3_REGION` | Região AWS | String | `us-east-1` | S3 |
| `FILE_S3_ACCESS_KEY_ID` | AWS Access Key ID | `AKIA...` | `AKIAIOSFODNN7EXAMPLE` | S3 |
| `FILE_S3_SECRET_ACCESS_KEY` | AWS Secret Access Key | String 40 chars | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` | S3 |
| `FILE_S3_URL` | URL base do S3 | URL | `https://bucket.s3.region.amazonaws.com` | S3 |

### 6. CORS Configuration

| Secret | Descrição | Formato | Exemplo | Obrigatório |
|--------|-----------|---------|---------|-------------|
| `STORE_CORS` | Origins permitidas (store) | CSV URLs | `https://store.yshsolar.com` | ✅ Sim |
| `ADMIN_CORS` | Origins permitidas (admin) | CSV URLs | `https://admin.yshsolar.com` | ✅ Sim |
| `AUTH_CORS` | Origins permitidas (auth) | CSV URLs | `https://admin.yshsolar.com` | ✅ Sim |

---

## 🎯 Configuração por Ambiente

### Development (Local)

**Arquivo:** `.env`

```bash
# Core
NODE_ENV=development
JWT_SECRET=dev-jwt-secret-change-in-production
COOKIE_SECRET=dev-cookie-secret-change-in-production

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/yshdb
DATABASE_SSL=false

# Redis (opcional)
REDIS_URL=redis://localhost:6379

# AI & RAG
OPENAI_API_KEY=sk-proj-your-openai-key-here
QDRANT_URL=http://localhost:6333
# QDRANT_API_KEY não necessário para local

# Storage Local (sem S3)
# FILE_S3_* não definido = usa storage local

# CORS
STORE_CORS=http://localhost:8000,http://localhost:3000
ADMIN_CORS=http://localhost:7000,http://localhost:7001
AUTH_CORS=http://localhost:7000,http://localhost:7001

# Development URLs
MEDUSA_DEV_URL=http://localhost:9000
HOST=0.0.0.0
PORT=9000
```

### Staging

**Arquivo:** `.env.staging`

```bash
# Core
NODE_ENV=production
JWT_SECRET=staging-jwt-secret-generate-strong-64-chars
COOKIE_SECRET=staging-cookie-secret-generate-strong-64-chars

# Database (RDS)
DATABASE_URL=postgresql://ysh_app:STAGING_PASS@ysh-db-staging.xxxxx.us-east-1.rds.amazonaws.com:5432/yshdb
DATABASE_SSL=true

# Redis (ElastiCache)
REDIS_URL=redis://ysh-redis-staging.xxxxx.cache.amazonaws.com:6379

# AI & RAG
OPENAI_API_KEY=sk-proj-your-openai-key-here
QDRANT_URL=https://staging-cluster.qdrant.io
QDRANT_API_KEY=your-qdrant-staging-api-key

# AWS S3
FILE_S3_BUCKET=ysh-media-staging
FILE_S3_REGION=us-east-1
FILE_S3_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
FILE_S3_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
FILE_S3_URL=https://ysh-media-staging.s3.us-east-1.amazonaws.com

# CORS
STORE_CORS=https://staging-store.yshsolar.com
ADMIN_CORS=https://staging-admin.yshsolar.com
AUTH_CORS=https://staging-admin.yshsolar.com

# Server
HOST=0.0.0.0
PORT=9000
```

### Production

**NUNCA usar arquivo .env em produção!**  
Usar **AWS Secrets Manager** ou **Systems Manager Parameter Store**.

```bash
# Exemplo de estrutura no AWS Secrets Manager:

# Secret: ysh-backend/production/core
{
  "jwt_secret": "GENERATE_STRONG_JWT_SECRET_64_CHARS_MINIMUM",
  "cookie_secret": "GENERATE_STRONG_COOKIE_SECRET_64_CHARS_MINIMUM",
  "node_env": "production"
}

# Secret: ysh-backend/production/database
{
  "host": "ysh-db-prod.xxxxx.us-east-1.rds.amazonaws.com",
  "port": "5432",
  "database": "yshdb",
  "username": "ysh_app",
  "password": "STRONG_PRODUCTION_PASSWORD",
  "ssl": "true"
}

# Secret: ysh-backend/production/redis
{
  "url": "redis://ysh-redis-prod.xxxxx.cache.amazonaws.com:6379"
}

# Secret: ysh-backend/production/ai-keys
{
  "openai_api_key": "sk-proj-PRODUCTION_OPENAI_KEY",
  "qdrant_api_key": "PRODUCTION_QDRANT_KEY",
  "qdrant_url": "https://prod-cluster.qdrant.io"
}

# Secret: ysh-backend/production/s3
{
  "bucket": "ysh-media-production",
  "region": "us-east-1",
  "access_key_id": "AKIAIOSFODNN7EXAMPLE",
  "secret_access_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "url": "https://ysh-media-production.s3.us-east-1.amazonaws.com"
}

# Secret: ysh-backend/production/cors
{
  "store_cors": "https://store.yshsolar.com",
  "admin_cors": "https://admin.yshsolar.com",
  "auth_cors": "https://admin.yshsolar.com"
}
```

---

## 🔒 Gerando Secrets Seguros

### JWT e Cookie Secrets

```bash
# Método 1: OpenSSL
openssl rand -base64 64

# Método 2: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Método 3: Python
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

### Passwords para Database

```bash
# Gerar senha forte (32 caracteres)
openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
```

---

## 🚀 Scripts de Deployment

### Script 1: Load Secrets from AWS Secrets Manager

**Arquivo:** `scripts/load-aws-secrets.sh`

```bash
#!/bin/bash
set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 Loading secrets from AWS Secrets Manager...${NC}"

# Verificar AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Install it first.${NC}"
    exit 1
fi

# Verificar jq
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq not found. Install it first.${NC}"
    exit 1
fi

# Região AWS
AWS_REGION=${AWS_REGION:-us-east-1}
ENV=${DEPLOY_ENV:-production}

echo -e "${YELLOW}Environment: $ENV${NC}"
echo -e "${YELLOW}AWS Region: $AWS_REGION${NC}"

# Função para buscar secret
get_secret() {
    local secret_name=$1
    aws secretsmanager get-secret-value \
        --secret-id "$secret_name" \
        --region "$AWS_REGION" \
        --query SecretString \
        --output text 2>/dev/null || echo "{}"
}

# Buscar secrets
echo "📥 Fetching secrets..."
CORE_SECRET=$(get_secret "ysh-backend/$ENV/core")
DB_SECRET=$(get_secret "ysh-backend/$ENV/database")
REDIS_SECRET=$(get_secret "ysh-backend/$ENV/redis")
AI_SECRET=$(get_secret "ysh-backend/$ENV/ai-keys")
S3_SECRET=$(get_secret "ysh-backend/$ENV/s3")
CORS_SECRET=$(get_secret "ysh-backend/$ENV/cors")

# Extrair valores
echo "🔧 Parsing secrets..."

# Core
export NODE_ENV=$(echo "$CORE_SECRET" | jq -r '.node_env // "production"')
export JWT_SECRET=$(echo "$CORE_SECRET" | jq -r '.jwt_secret')
export COOKIE_SECRET=$(echo "$CORE_SECRET" | jq -r '.cookie_secret')

# Database
DB_HOST=$(echo "$DB_SECRET" | jq -r '.host')
DB_PORT=$(echo "$DB_SECRET" | jq -r '.port // "5432"')
DB_NAME=$(echo "$DB_SECRET" | jq -r '.database')
DB_USER=$(echo "$DB_SECRET" | jq -r '.username')
DB_PASS=$(echo "$DB_SECRET" | jq -r '.password')
DB_SSL=$(echo "$DB_SECRET" | jq -r '.ssl // "true"')

export DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
export DATABASE_SSL="$DB_SSL"

# Redis
export REDIS_URL=$(echo "$REDIS_SECRET" | jq -r '.url // ""')

# AI Keys
export OPENAI_API_KEY=$(echo "$AI_SECRET" | jq -r '.openai_api_key')
export QDRANT_API_KEY=$(echo "$AI_SECRET" | jq -r '.qdrant_api_key // ""')
export QDRANT_URL=$(echo "$AI_SECRET" | jq -r '.qdrant_url')

# S3
export FILE_S3_BUCKET=$(echo "$S3_SECRET" | jq -r '.bucket')
export FILE_S3_REGION=$(echo "$S3_SECRET" | jq -r '.region')
export FILE_S3_ACCESS_KEY_ID=$(echo "$S3_SECRET" | jq -r '.access_key_id')
export FILE_S3_SECRET_ACCESS_KEY=$(echo "$S3_SECRET" | jq -r '.secret_access_key')
export FILE_S3_URL=$(echo "$S3_SECRET" | jq -r '.url')

# CORS
export STORE_CORS=$(echo "$CORS_SECRET" | jq -r '.store_cors')
export ADMIN_CORS=$(echo "$CORS_SECRET" | jq -r '.admin_cors')
export AUTH_CORS=$(echo "$CORS_SECRET" | jq -r '.auth_cors')

# Validar secrets críticos
echo "✅ Validating secrets..."
MISSING_SECRETS=0

check_secret() {
    local name=$1
    local value=$2
    if [ -z "$value" ] || [ "$value" = "null" ]; then
        echo -e "${RED}❌ Missing: $name${NC}"
        MISSING_SECRETS=$((MISSING_SECRETS + 1))
    else
        echo -e "${GREEN}✅ $name${NC}"
    fi
}

check_secret "JWT_SECRET" "$JWT_SECRET"
check_secret "COOKIE_SECRET" "$COOKIE_SECRET"
check_secret "DATABASE_URL" "$DATABASE_URL"
check_secret "OPENAI_API_KEY" "$OPENAI_API_KEY"
check_secret "QDRANT_URL" "$QDRANT_URL"

if [ $MISSING_SECRETS -gt 0 ]; then
    echo -e "${RED}❌ $MISSING_SECRETS critical secrets missing!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All critical secrets loaded successfully!${NC}"

# Opcional: Salvar em arquivo .env temporário (para debug)
if [ "$SAVE_TO_FILE" = "true" ]; then
    ENV_FILE="/tmp/.env.${ENV}"
    cat > "$ENV_FILE" <<EOF
NODE_ENV=$NODE_ENV
JWT_SECRET=$JWT_SECRET
COOKIE_SECRET=$COOKIE_SECRET
DATABASE_URL=$DATABASE_URL
DATABASE_SSL=$DATABASE_SSL
REDIS_URL=$REDIS_URL
OPENAI_API_KEY=$OPENAI_API_KEY
QDRANT_API_KEY=$QDRANT_API_KEY
QDRANT_URL=$QDRANT_URL
FILE_S3_BUCKET=$FILE_S3_BUCKET
FILE_S3_REGION=$FILE_S3_REGION
FILE_S3_ACCESS_KEY_ID=$FILE_S3_ACCESS_KEY_ID
FILE_S3_SECRET_ACCESS_KEY=$FILE_S3_SECRET_ACCESS_KEY
FILE_S3_URL=$FILE_S3_URL
STORE_CORS=$STORE_CORS
ADMIN_CORS=$ADMIN_CORS
AUTH_CORS=$AUTH_CORS
EOF
    chmod 600 "$ENV_FILE"
    echo -e "${YELLOW}📝 Secrets saved to: $ENV_FILE${NC}"
fi
```

### Script 2: Verificar Secrets

**Arquivo:** `scripts/verify-secrets.sh`

```bash
#!/bin/bash
set -e

echo "🔍 Verifying secrets configuration..."

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ISSUES=0

# Função para verificar variável
check_var() {
    local name=$1
    local value=$(eval echo \$$name)
    local min_length=${2:-1}
    
    if [ -z "$value" ]; then
        echo -e "${RED}❌ $name is not set${NC}"
        ISSUES=$((ISSUES + 1))
    elif [ ${#value} -lt $min_length ]; then
        echo -e "${YELLOW}⚠️  $name is too short (${#value} chars, min: $min_length)${NC}"
        ISSUES=$((ISSUES + 1))
    else
        echo -e "${GREEN}✅ $name is set (${#value} chars)${NC}"
    fi
}

echo ""
echo "🔑 Core Secrets:"
check_var "JWT_SECRET" 32
check_var "COOKIE_SECRET" 32
check_var "NODE_ENV" 1

echo ""
echo "🗄️  Database:"
check_var "DATABASE_URL" 20

echo ""
echo "🤖 AI Services:"
check_var "OPENAI_API_KEY" 20
check_var "QDRANT_URL" 10

echo ""
echo "☁️  AWS S3 (optional):"
if [ -n "$FILE_S3_BUCKET" ]; then
    check_var "FILE_S3_BUCKET" 3
    check_var "FILE_S3_REGION" 3
    check_var "FILE_S3_ACCESS_KEY_ID" 16
    check_var "FILE_S3_SECRET_ACCESS_KEY" 20
    check_var "FILE_S3_URL" 10
else
    echo -e "${YELLOW}⚠️  S3 not configured (using local storage)${NC}"
fi

echo ""
echo "🌐 CORS:"
check_var "STORE_CORS" 5
check_var "ADMIN_CORS" 5
check_var "AUTH_CORS" 5

echo ""
echo "═══════════════════════════════════════"
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All secrets verified successfully!${NC}"
    exit 0
else
    echo -e "${RED}❌ Found $ISSUES issues with secrets${NC}"
    exit 1
fi
```

### Script 3: Criar Secrets no AWS

**Arquivo:** `scripts/create-aws-secrets.sh`

```bash
#!/bin/bash
set -e

echo "🔐 Creating AWS Secrets Manager secrets for YSH Backend"

AWS_REGION=${AWS_REGION:-us-east-1}
ENV=${DEPLOY_ENV:-production}

# Gerar secrets fortes
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
COOKIE_SECRET=$(openssl rand -base64 64 | tr -d '\n')
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

echo "📝 Environment: $ENV"
echo "📍 Region: $AWS_REGION"
echo ""
echo "⚠️  IMPORTANT: Save these generated secrets securely!"
echo ""
echo "Generated secrets:"
echo "=================="
echo "JWT_SECRET: $JWT_SECRET"
echo "COOKIE_SECRET: $COOKIE_SECRET"
echo "DB_PASSWORD: $DB_PASSWORD"
echo ""
read -p "Press Enter to create secrets in AWS Secrets Manager..."

# Core secrets
echo "Creating core secrets..."
aws secretsmanager create-secret \
    --name "ysh-backend/$ENV/core" \
    --description "YSH Backend Core Secrets ($ENV)" \
    --secret-string "{
        \"jwt_secret\": \"$JWT_SECRET\",
        \"cookie_secret\": \"$COOKIE_SECRET\",
        \"node_env\": \"production\"
    }" \
    --region "$AWS_REGION" || echo "Secret already exists"

# Database secrets (você precisa preencher os valores)
echo "Creating database secrets..."
read -p "Enter RDS host: " RDS_HOST
read -p "Enter database name [yshdb]: " DB_NAME
DB_NAME=${DB_NAME:-yshdb}
read -p "Enter database username [ysh_app]: " DB_USER
DB_USER=${DB_USER:-ysh_app}

aws secretsmanager create-secret \
    --name "ysh-backend/$ENV/database" \
    --description "YSH Backend Database Credentials ($ENV)" \
    --secret-string "{
        \"host\": \"$RDS_HOST\",
        \"port\": \"5432\",
        \"database\": \"$DB_NAME\",
        \"username\": \"$DB_USER\",
        \"password\": \"$DB_PASSWORD\",
        \"ssl\": \"true\"
    }" \
    --region "$AWS_REGION" || echo "Secret already exists"

# AI Keys
echo "Creating AI keys secrets..."
read -p "Enter OpenAI API Key: " OPENAI_KEY
read -p "Enter Qdrant URL: " QDRANT_URL
read -p "Enter Qdrant API Key (optional): " QDRANT_KEY

aws secretsmanager create-secret \
    --name "ysh-backend/$ENV/ai-keys" \
    --description "YSH Backend AI API Keys ($ENV)" \
    --secret-string "{
        \"openai_api_key\": \"$OPENAI_KEY\",
        \"qdrant_url\": \"$QDRANT_URL\",
        \"qdrant_api_key\": \"$QDRANT_KEY\"
    }" \
    --region "$AWS_REGION" || echo "Secret already exists"

# S3
echo "Creating S3 secrets..."
read -p "Enter S3 Bucket name: " S3_BUCKET
read -p "Enter AWS Access Key ID: " S3_KEY_ID
read -p "Enter AWS Secret Access Key: " S3_SECRET_KEY
S3_URL="https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com"

aws secretsmanager create-secret \
    --name "ysh-backend/$ENV/s3" \
    --description "YSH Backend S3 Credentials ($ENV)" \
    --secret-string "{
        \"bucket\": \"$S3_BUCKET\",
        \"region\": \"$AWS_REGION\",
        \"access_key_id\": \"$S3_KEY_ID\",
        \"secret_access_key\": \"$S3_SECRET_KEY\",
        \"url\": \"$S3_URL\"
    }" \
    --region "$AWS_REGION" || echo "Secret already exists"

# CORS
echo "Creating CORS secrets..."
read -p "Enter Store URL: " STORE_URL
read -p "Enter Admin URL: " ADMIN_URL

aws secretsmanager create-secret \
    --name "ysh-backend/$ENV/cors" \
    --description "YSH Backend CORS Configuration ($ENV)" \
    --secret-string "{
        \"store_cors\": \"$STORE_URL\",
        \"admin_cors\": \"$ADMIN_URL\",
        \"auth_cors\": \"$ADMIN_URL\"
    }" \
    --region "$AWS_REGION" || echo "Secret already exists"

echo ""
echo "✅ All secrets created successfully!"
echo ""
echo "Next steps:"
echo "1. Attach IAM policy to EC2 role to read these secrets"
echo "2. Use scripts/load-aws-secrets.sh to load secrets on EC2"
echo "3. Test with scripts/verify-secrets.sh"
```

---

## 📊 Auditoria e Rotação

### Listar Secrets

```bash
# Listar todos os secrets do backend
aws secretsmanager list-secrets \
    --filters Key=name,Values=ysh-backend/ \
    --region us-east-1

# Ver último acesso
aws secretsmanager describe-secret \
    --secret-id ysh-backend/production/database \
    --region us-east-1
```

### Rotacionar Secrets

```bash
# JWT Secret
NEW_JWT=$(openssl rand -base64 64)
aws secretsmanager update-secret \
    --secret-id ysh-backend/production/core \
    --secret-string "{\"jwt_secret\":\"$NEW_JWT\",...}"

# Database Password
aws secretsmanager rotate-secret \
    --secret-id ysh-backend/production/database \
    --rotation-lambda-arn arn:aws:lambda:region:account:function:SecretsManagerRotation
```

---

## ✅ Checklist de Segurança

### Desenvolvimento

- [ ] Usar `.env` local (nunca commitar)
- [ ] Secrets diferentes de produção
- [ ] `.env` em `.gitignore`

### Staging

- [ ] Usar AWS Secrets Manager ou arquivo `.env` protegido
- [ ] Secrets diferentes de produção
- [ ] Access logs habilitados

### Produção

- [ ] ✅ **OBRIGATÓRIO:** AWS Secrets Manager
- [ ] Nunca usar arquivo `.env`
- [ ] IAM roles com least privilege
- [ ] Rotação automática de secrets
- [ ] CloudTrail para auditoria
- [ ] Alertas de acesso não autorizado

---

**Última atualização:** 13/10/2025  
**Próximo documento:** `AWS_DEPLOYMENT_COMPLETE_GUIDE.md`
