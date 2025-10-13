#!/bin/bash
set -e

# ============================================================
# AWS Secrets Loader for YSH Backend
# ============================================================
# This script loads secrets from AWS Secrets Manager and
# exports them as environment variables.
#
# Usage: source /opt/ysh/load-secrets.sh
# ============================================================

ENVIRONMENT="${ENVIRONMENT:-production}"
AWS_REGION="${AWS_REGION:-us-east-1}"

echo "🔐 Loading secrets from AWS Secrets Manager..."
echo "Environment: $ENVIRONMENT"
echo "Region: $AWS_REGION"

# Helper function to get secret
get_secret() {
    local secret_id=$1
    aws secretsmanager get-secret-value \
        --secret-id "$secret_id" \
        --region "$AWS_REGION" \
        --query SecretString \
        --output text 2>/dev/null
}

# ============================================================
# Load Database Secret
# ============================================================

DB_SECRET=$(get_secret "ysh-backend/$ENVIRONMENT/database")

if [ -n "$DB_SECRET" ]; then
    echo "✓ Database credentials loaded"
    
    export DATABASE_HOST=$(echo "$DB_SECRET" | jq -r .host)
    export DATABASE_PORT=$(echo "$DB_SECRET" | jq -r .port)
    export DATABASE_NAME=$(echo "$DB_SECRET" | jq -r .database)
    export DATABASE_USER=$(echo "$DB_SECRET" | jq -r .username)
    export DATABASE_PASS=$(echo "$DB_SECRET" | jq -r .password)
    
    # Build DATABASE_URL
    export DATABASE_URL="postgresql://${DATABASE_USER}:${DATABASE_PASS}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}"
    export DATABASE_SSL="true"
    
    # Optional: Enable SSL reject unauthorized for production
    export DATABASE_SSL_REJECT_UNAUTHORIZED="false"
else
    echo "⚠️  Warning: Database credentials not found"
fi

# ============================================================
# Load API Keys Secret
# ============================================================

API_SECRET=$(get_secret "ysh-backend/$ENVIRONMENT/api-keys")

if [ -n "$API_SECRET" ]; then
    echo "✓ API keys loaded"
    
    export JWT_SECRET=$(echo "$API_SECRET" | jq -r .jwt_secret)
    export COOKIE_SECRET=$(echo "$API_SECRET" | jq -r .cookie_secret)
    export OPENAI_API_KEY=$(echo "$API_SECRET" | jq -r .openai_api_key)
    export QDRANT_API_KEY=$(echo "$API_SECRET" | jq -r .qdrant_api_key)
    export QDRANT_URL=$(echo "$API_SECRET" | jq -r .qdrant_url)
else
    echo "⚠️  Warning: API keys not found"
fi

# ============================================================
# Load S3 Secret
# ============================================================

S3_SECRET=$(get_secret "ysh-backend/$ENVIRONMENT/s3")

if [ -n "$S3_SECRET" ]; then
    echo "✓ S3 credentials loaded"
    
    export FILE_S3_ACCESS_KEY_ID=$(echo "$S3_SECRET" | jq -r .access_key_id)
    export FILE_S3_SECRET_ACCESS_KEY=$(echo "$S3_SECRET" | jq -r .secret_access_key)
    export FILE_S3_BUCKET=$(echo "$S3_SECRET" | jq -r .bucket)
    export FILE_S3_REGION=$(echo "$S3_SECRET" | jq -r .region)
    export FILE_S3_URL=$(echo "$S3_SECRET" | jq -r .public_url)
else
    echo "⚠️  Warning: S3 credentials not found"
fi

# ============================================================
# Set Standard Environment Variables
# ============================================================

export NODE_ENV="${ENVIRONMENT}"
export PORT="${PORT:-9000}"
export HOST="${HOST:-0.0.0.0}"

# CORS - adjust for your domains
if [ "$ENVIRONMENT" = "production" ]; then
    export STORE_CORS="https://store.yshsolar.com"
    export ADMIN_CORS="https://admin.yshsolar.com"
    export AUTH_CORS="https://admin.yshsolar.com"
else
    export STORE_CORS="http://localhost:8000"
    export ADMIN_CORS="http://localhost:7000"
    export AUTH_CORS="http://localhost:7000"
fi

# ============================================================
# Validation
# ============================================================

REQUIRED_VARS=(
    "DATABASE_URL"
    "JWT_SECRET"
    "COOKIE_SECRET"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo "❌ Error: Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

echo "✅ All secrets loaded successfully"
echo ""

# Optional: Print non-sensitive config for debugging
if [ "$DEBUG" = "true" ]; then
    echo "Configuration:"
    echo "  NODE_ENV: $NODE_ENV"
    echo "  PORT: $PORT"
    echo "  DATABASE_HOST: $DATABASE_HOST"
    echo "  DATABASE_NAME: $DATABASE_NAME"
    echo "  S3_BUCKET: $FILE_S3_BUCKET"
    echo "  S3_REGION: $FILE_S3_REGION"
    echo ""
fi
