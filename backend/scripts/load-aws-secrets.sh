#!/bin/bash
set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   YSH Backend - AWS Secrets Loader               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

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

echo -e "${YELLOW}📍 Environment: $ENV${NC}"
echo -e "${YELLOW}🌎 AWS Region: $AWS_REGION${NC}"
echo ""

# Função para buscar secret
get_secret() {
    local secret_name=$1
    local result=$(aws secretsmanager get-secret-value \
        --secret-id "$secret_name" \
        --region "$AWS_REGION" \
        --query SecretString \
        --output text 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to fetch: $secret_name${NC}" >&2
        echo "{}"
    else
        echo "$result"
    fi
}

# Buscar secrets
echo -e "${BLUE}📥 Fetching secrets from AWS Secrets Manager...${NC}"
CORE_SECRET=$(get_secret "ysh-backend/$ENV/core")
DB_SECRET=$(get_secret "ysh-backend/$ENV/database")
REDIS_SECRET=$(get_secret "ysh-backend/$ENV/redis")
AI_SECRET=$(get_secret "ysh-backend/$ENV/ai-keys")
S3_SECRET=$(get_secret "ysh-backend/$ENV/s3")
CORS_SECRET=$(get_secret "ysh-backend/$ENV/cors")

# Extrair valores
echo -e "${BLUE}🔧 Parsing secrets...${NC}"

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
echo ""
echo -e "${BLUE}✅ Validating secrets...${NC}"
MISSING_SECRETS=0

check_secret() {
    local name=$1
    local value=$2
    if [ -z "$value" ] || [ "$value" = "null" ]; then
        echo -e "${RED}   ❌ Missing: $name${NC}"
        MISSING_SECRETS=$((MISSING_SECRETS + 1))
    else
        # Mostrar apenas primeiros 8 caracteres
        local masked="${value:0:8}..."
        echo -e "${GREEN}   ✅ $name: $masked${NC}"
    fi
}

check_secret "JWT_SECRET" "$JWT_SECRET"
check_secret "COOKIE_SECRET" "$COOKIE_SECRET"
check_secret "DATABASE_URL" "$DATABASE_URL"
check_secret "OPENAI_API_KEY" "$OPENAI_API_KEY"
check_secret "QDRANT_URL" "$QDRANT_URL"

if [ -n "$FILE_S3_BUCKET" ]; then
    check_secret "FILE_S3_BUCKET" "$FILE_S3_BUCKET"
fi

echo ""

if [ $MISSING_SECRETS -gt 0 ]; then
    echo -e "${RED}❌ $MISSING_SECRETS critical secrets missing!${NC}"
    exit 1
fi

echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ All secrets loaded successfully!             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}💡 Secrets are now available as environment variables${NC}"
echo ""

# Executar comando se fornecido
if [ $# -gt 0 ]; then
    echo -e "${BLUE}🚀 Executing: $@${NC}"
    exec "$@"
fi
