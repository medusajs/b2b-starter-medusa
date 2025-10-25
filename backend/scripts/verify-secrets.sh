#!/bin/bash
set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   YSH Backend - Secrets Verification             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

ISSUES=0

# Função para verificar variável
check_var() {
    local name=$1
    local value=$(eval echo \$$name)
    local min_length=${2:-1}
    local required=${3:-true}
    
    if [ -z "$value" ]; then
        if [ "$required" = "true" ]; then
            echo -e "${RED}   ❌ $name is not set${NC}"
            ISSUES=$((ISSUES + 1))
        else
            echo -e "${YELLOW}   ⚠️  $name is not set (optional)${NC}"
        fi
    elif [ ${#value} -lt $min_length ]; then
        echo -e "${YELLOW}   ⚠️  $name is too short (${#value} chars, min: $min_length)${NC}"
        ISSUES=$((ISSUES + 1))
    else
        local masked="${value:0:8}***"
        echo -e "${GREEN}   ✅ $name (${#value} chars): $masked${NC}"
    fi
}

echo -e "${BLUE}🔑 Core Secrets:${NC}"
check_var "JWT_SECRET" 32 true
check_var "COOKIE_SECRET" 32 true
check_var "NODE_ENV" 1 true

echo ""
echo -e "${BLUE}🗄️  Database:${NC}"
check_var "DATABASE_URL" 20 true
check_var "DATABASE_SSL" 1 false

echo ""
echo -e "${BLUE}🤖 AI Services:${NC}"
check_var "OPENAI_API_KEY" 20 true
check_var "QDRANT_URL" 10 true
check_var "QDRANT_API_KEY" 10 false

echo ""
echo -e "${BLUE}📦 Redis (optional):${NC}"
check_var "REDIS_URL" 10 false

echo ""
echo -e "${BLUE}☁️  AWS S3 (optional):${NC}"
if [ -n "$FILE_S3_BUCKET" ]; then
    check_var "FILE_S3_BUCKET" 3 true
    check_var "FILE_S3_REGION" 3 true
    check_var "FILE_S3_ACCESS_KEY_ID" 16 true
    check_var "FILE_S3_SECRET_ACCESS_KEY" 20 true
    check_var "FILE_S3_URL" 10 true
else
    echo -e "${YELLOW}   ⚠️  S3 not configured (using local storage)${NC}"
fi

echo ""
echo -e "${BLUE}🌐 CORS:${NC}"
check_var "STORE_CORS" 5 true
check_var "ADMIN_CORS" 5 true
check_var "AUTH_CORS" 5 true

echo ""
echo -e "${BLUE}🔧 Server Config:${NC}"
check_var "HOST" 1 false
check_var "PORT" 1 false

echo ""
echo "═══════════════════════════════════════════════════"

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✅ All secrets verified successfully!           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║   ❌ Found $ISSUES issues with secrets              ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
