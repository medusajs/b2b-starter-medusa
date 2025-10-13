#!/bin/bash
set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Create AWS Secrets for YSH Backend             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

# Verificar credenciais AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured.${NC}"
    echo "Run: aws configure"
    exit 1
fi

AWS_REGION=${AWS_REGION:-us-east-1}
ENV=${DEPLOY_ENV:-production}

echo -e "${YELLOW}📍 Environment: $ENV${NC}"
echo -e "${YELLOW}🌎 Region: $AWS_REGION${NC}"
echo ""

# Gerar secrets fortes automaticamente
echo -e "${BLUE}🔐 Generating strong secrets...${NC}"
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
COOKIE_SECRET=$(openssl rand -base64 64 | tr -d '\n')
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

echo ""
echo -e "${GREEN}✅ Generated secrets (SAVE THESE SECURELY!):${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════${NC}"
echo "JWT_SECRET=$JWT_SECRET"
echo "COOKIE_SECRET=$COOKIE_SECRET"
echo "DB_PASSWORD=$DB_PASSWORD"
echo -e "${YELLOW}════════════════════════════════════════════════════${NC}"
echo ""

# Salvar em arquivo temporário seguro
TEMP_SECRETS="/tmp/ysh-secrets-$(date +%s).txt"
cat > "$TEMP_SECRETS" <<EOF
YSH Backend Generated Secrets - $(date)
Environment: $ENV
Region: $AWS_REGION

JWT_SECRET=$JWT_SECRET
COOKIE_SECRET=$COOKIE_SECRET
DB_PASSWORD=$DB_PASSWORD
EOF
chmod 600 "$TEMP_SECRETS"
echo -e "${YELLOW}💾 Secrets saved to: $TEMP_SECRETS${NC}"
echo ""

read -p "Press Enter to continue with AWS Secrets Manager creation..."
echo ""

# Função para criar ou atualizar secret
create_or_update_secret() {
    local name=$1
    local description=$2
    local secret_string=$3
    
    echo -e "${BLUE}📝 Creating/Updating: $name${NC}"
    
    if aws secretsmanager describe-secret --secret-id "$name" --region "$AWS_REGION" &> /dev/null; then
        echo -e "${YELLOW}   Secret already exists, updating...${NC}"
        aws secretsmanager update-secret \
            --secret-id "$name" \
            --secret-string "$secret_string" \
            --region "$AWS_REGION" > /dev/null
        echo -e "${GREEN}   ✅ Updated${NC}"
    else
        echo -e "${YELLOW}   Creating new secret...${NC}"
        aws secretsmanager create-secret \
            --name "$name" \
            --description "$description" \
            --secret-string "$secret_string" \
            --region "$AWS_REGION" > /dev/null
        echo -e "${GREEN}   ✅ Created${NC}"
    fi
}

# 1. Core Secrets
echo -e "${BLUE}🔑 [1/6] Creating Core Secrets...${NC}"
create_or_update_secret \
    "ysh-backend/$ENV/core" \
    "YSH Backend Core Secrets ($ENV)" \
    "{
        \"jwt_secret\": \"$JWT_SECRET\",
        \"cookie_secret\": \"$COOKIE_SECRET\",
        \"node_env\": \"production\"
    }"

# 2. Database Secrets
echo ""
echo -e "${BLUE}🗄️  [2/6] Database Configuration${NC}"
read -p "Enter RDS host (e.g., ysh-db.xxxxx.us-east-1.rds.amazonaws.com): " RDS_HOST
read -p "Enter database name [yshdb]: " DB_NAME
DB_NAME=${DB_NAME:-yshdb}
read -p "Enter database username [ysh_app]: " DB_USER
DB_USER=${DB_USER:-ysh_app}
echo -e "${YELLOW}   Using generated password: ${DB_PASSWORD:0:8}...${NC}"

create_or_update_secret \
    "ysh-backend/$ENV/database" \
    "YSH Backend Database Credentials ($ENV)" \
    "{
        \"host\": \"$RDS_HOST\",
        \"port\": \"5432\",
        \"database\": \"$DB_NAME\",
        \"username\": \"$DB_USER\",
        \"password\": \"$DB_PASSWORD\",
        \"ssl\": \"true\"
    }"

# 3. Redis (opcional)
echo ""
echo -e "${BLUE}📦 [3/6] Redis Configuration (optional)${NC}"
read -p "Enter Redis URL (leave empty to skip): " REDIS_URL
if [ -n "$REDIS_URL" ]; then
    create_or_update_secret \
        "ysh-backend/$ENV/redis" \
        "YSH Backend Redis Configuration ($ENV)" \
        "{
            \"url\": \"$REDIS_URL\"
        }"
else
    echo -e "${YELLOW}   Skipped (no Redis)${NC}"
fi

# 4. AI Keys
echo ""
echo -e "${BLUE}🤖 [4/6] AI Services API Keys${NC}"
read -p "Enter OpenAI API Key (sk-...): " OPENAI_KEY
read -p "Enter Qdrant URL: " QDRANT_URL
read -p "Enter Qdrant API Key (leave empty if not needed): " QDRANT_KEY

create_or_update_secret \
    "ysh-backend/$ENV/ai-keys" \
    "YSH Backend AI API Keys ($ENV)" \
    "{
        \"openai_api_key\": \"$OPENAI_KEY\",
        \"qdrant_url\": \"$QDRANT_URL\",
        \"qdrant_api_key\": \"$QDRANT_KEY\"
    }"

# 5. S3 Configuration
echo ""
echo -e "${BLUE}☁️  [5/6] AWS S3 Configuration${NC}"
read -p "Enter S3 Bucket name: " S3_BUCKET
read -p "Enter AWS Access Key ID for S3: " S3_KEY_ID
read -s -p "Enter AWS Secret Access Key for S3: " S3_SECRET_KEY
echo ""
S3_URL="https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com"

create_or_update_secret \
    "ysh-backend/$ENV/s3" \
    "YSH Backend S3 Credentials ($ENV)" \
    "{
        \"bucket\": \"$S3_BUCKET\",
        \"region\": \"$AWS_REGION\",
        \"access_key_id\": \"$S3_KEY_ID\",
        \"secret_access_key\": \"$S3_SECRET_KEY\",
        \"url\": \"$S3_URL\"
    }"

# 6. CORS Configuration
echo ""
echo -e "${BLUE}🌐 [6/6] CORS Configuration${NC}"
read -p "Enter Store frontend URL (e.g., https://store.yshsolar.com): " STORE_URL
read -p "Enter Admin frontend URL (e.g., https://admin.yshsolar.com): " ADMIN_URL

create_or_update_secret \
    "ysh-backend/$ENV/cors" \
    "YSH Backend CORS Configuration ($ENV)" \
    "{
        \"store_cors\": \"$STORE_URL\",
        \"admin_cors\": \"$ADMIN_URL\",
        \"auth_cors\": \"$ADMIN_URL\"
    }"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ All secrets created successfully!            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📋 Summary of created secrets:${NC}"
echo "   • ysh-backend/$ENV/core"
echo "   • ysh-backend/$ENV/database"
if [ -n "$REDIS_URL" ]; then
    echo "   • ysh-backend/$ENV/redis"
fi
echo "   • ysh-backend/$ENV/ai-keys"
echo "   • ysh-backend/$ENV/s3"
echo "   • ysh-backend/$ENV/cors"

echo ""
echo -e "${YELLOW}🔒 Generated secrets saved at: $TEMP_SECRETS${NC}"
echo -e "${YELLOW}   Remember to store this file in a secure location!${NC}"
echo ""

echo -e "${BLUE}📝 Next steps:${NC}"
echo "   1. Create IAM policy for EC2 to read these secrets"
echo "   2. Attach policy to EC2 instance role"
echo "   3. Use scripts/load-aws-secrets.sh on EC2 to load secrets"
echo "   4. Verify with scripts/verify-secrets.sh"
echo ""

echo -e "${GREEN}💡 IAM Policy Example:${NC}"
cat <<'POLICY'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:ysh-backend/*"
    }
  ]
}
POLICY

echo ""
echo -e "${BLUE}Done! 🎉${NC}"
