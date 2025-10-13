#!/bin/bash
set -e

# ============================================================
# AWS Secrets Creator for YSH Backend
# ============================================================
# Usage: ./create-secrets.sh [environment]
# Example: ./create-secrets.sh production
# ============================================================

ENVIRONMENT="${1:-production}"
AWS_REGION="${AWS_REGION:-us-east-1}"

echo "🔐 Creating AWS Secrets Manager secrets for YSH Backend"
echo "Environment: $ENVIRONMENT"
echo "Region: $AWS_REGION"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function
create_secret() {
    local name=$1
    local description=$2
    local value=$3
    
    echo -n "Creating secret: $name... "
    
    if aws secretsmanager describe-secret --secret-id "$name" --region "$AWS_REGION" &>/dev/null; then
        echo -e "${YELLOW}EXISTS${NC} (updating)"
        aws secretsmanager update-secret \
            --secret-id "$name" \
            --secret-string "$value" \
            --region "$AWS_REGION" &>/dev/null
    else
        aws secretsmanager create-secret \
            --name "$name" \
            --description "$description" \
            --secret-string "$value" \
            --tags Key=Environment,Value="$ENVIRONMENT" Key=Application,Value=ysh-backend \
            --region "$AWS_REGION" &>/dev/null
        echo -e "${GREEN}CREATED${NC}"
    fi
}

# ============================================================
# Generate Secure Random Strings
# ============================================================

generate_secret() {
    openssl rand -hex 32
}

echo "📝 Generating secure random secrets..."
JWT_SECRET=$(generate_secret)
COOKIE_SECRET=$(generate_secret)
echo -e "${GREEN}✓${NC} Random secrets generated"
echo ""

# ============================================================
# Prompt for Required Values
# ============================================================

echo "Please provide the following information:"
echo ""

# Database
echo "=== Database Configuration ==="
read -p "RDS Host (e.g., ysh-db.xxxxx.us-east-1.rds.amazonaws.com): " DB_HOST
read -p "Database Name [yshdb]: " DB_NAME
DB_NAME=${DB_NAME:-yshdb}
read -p "Database Username [ysh_app]: " DB_USER
DB_USER=${DB_USER:-ysh_app}
read -sp "Database Password (leave empty to generate): " DB_PASS
echo ""
if [ -z "$DB_PASS" ]; then
    DB_PASS=$(openssl rand -base64 32)
    echo -e "${YELLOW}Generated password:${NC} $DB_PASS"
    echo -e "${YELLOW}SAVE THIS PASSWORD!${NC}"
fi
echo ""

# API Keys
echo "=== API Keys Configuration ==="
read -p "OpenAI API Key (sk-proj-...): " OPENAI_KEY
read -p "Qdrant URL (https://xxxxx.qdrant.io or http://localhost:6333): " QDRANT_URL
read -p "Qdrant API Key (leave empty for local/no-auth): " QDRANT_KEY
echo ""

# S3
echo "=== S3 Configuration ==="
read -p "S3 Bucket Name [ysh-media-$ENVIRONMENT]: " S3_BUCKET
S3_BUCKET=${S3_BUCKET:-ysh-media-$ENVIRONMENT}
read -p "S3 Region [us-east-1]: " S3_REGION
S3_REGION=${S3_REGION:-us-east-1}
read -p "S3 Access Key ID: " S3_KEY_ID
read -sp "S3 Secret Access Key: " S3_SECRET_KEY
echo ""
S3_URL="https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com"
echo ""

# ============================================================
# Create Secrets
# ============================================================

echo "Creating secrets in AWS Secrets Manager..."
echo ""

# 1. Database Secret
DB_SECRET=$(cat <<EOF
{
  "host": "$DB_HOST",
  "port": "5432",
  "database": "$DB_NAME",
  "username": "$DB_USER",
  "password": "$DB_PASS"
}
EOF
)

create_secret \
    "ysh-backend/$ENVIRONMENT/database" \
    "YSH Backend $ENVIRONMENT Database Credentials" \
    "$DB_SECRET"

# 2. API Keys Secret
API_SECRET=$(cat <<EOF
{
  "jwt_secret": "$JWT_SECRET",
  "cookie_secret": "$COOKIE_SECRET",
  "openai_api_key": "$OPENAI_KEY",
  "qdrant_api_key": "$QDRANT_KEY",
  "qdrant_url": "$QDRANT_URL"
}
EOF
)

create_secret \
    "ysh-backend/$ENVIRONMENT/api-keys" \
    "YSH Backend $ENVIRONMENT API Keys" \
    "$API_SECRET"

# 3. S3 Secret
S3_SECRET=$(cat <<EOF
{
  "access_key_id": "$S3_KEY_ID",
  "secret_access_key": "$S3_SECRET_KEY",
  "bucket": "$S3_BUCKET",
  "region": "$S3_REGION",
  "public_url": "$S3_URL"
}
EOF
)

create_secret \
    "ysh-backend/$ENVIRONMENT/s3" \
    "YSH Backend $ENVIRONMENT S3 Credentials" \
    "$S3_SECRET"

echo ""
echo -e "${GREEN}✅ All secrets created successfully!${NC}"
echo ""

# ============================================================
# Summary
# ============================================================

echo "📋 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Environment:  $ENVIRONMENT"
echo "Region:       $AWS_REGION"
echo ""
echo "Created secrets:"
echo "  • ysh-backend/$ENVIRONMENT/database"
echo "  • ysh-backend/$ENVIRONMENT/api-keys"
echo "  • ysh-backend/$ENVIRONMENT/s3"
echo ""
echo "Database URL:"
echo "  postgresql://$DB_USER:***@$DB_HOST:5432/$DB_NAME"
echo ""
echo "S3 Bucket:"
echo "  $S3_BUCKET ($S3_REGION)"
echo ""
echo "Next steps:"
echo "  1. Verify secrets in AWS Console"
echo "  2. Configure IAM role for EC2 to access secrets"
echo "  3. Deploy application with secrets integration"
echo ""
echo "View secrets:"
echo "  aws secretsmanager get-secret-value --secret-id ysh-backend/$ENVIRONMENT/database"
echo ""
echo -e "${GREEN}Done!${NC}"
