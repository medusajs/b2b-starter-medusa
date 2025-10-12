#!/usr/bin/env pwsh
# ==========================================
# AWS Secrets Manager Update Script
# Atualiza credenciais para o deployment
# ==========================================

$ErrorActionPreference = "Stop"

Write-Host "🔐 Atualizando AWS Secrets Manager..." -ForegroundColor Cyan
Write-Host ""

# Configurações
$PROFILE = "ysh-production"
$REGION = "us-east-1"
$DB_ENDPOINT = "production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com"
$REDIS_ENDPOINT = "production-ysh-b2b-redis.97x7fb.0001.use1.cache.amazonaws.com"
$ALB_DNS = "production-ysh-b2b-alb-1849611639.us-east-1.elb.amazonaws.com"

# 1. Atualizar DATABASE_URL com credenciais corretas
Write-Host "📊 Atualizando DATABASE_URL..." -ForegroundColor Yellow
$DATABASE_URL = "postgresql://postgres:postgres@$DB_ENDPOINT`:5432/medusa_db"

try {
    aws secretsmanager update-secret `
        --secret-id /ysh-b2b/database-url `
        --secret-string $DATABASE_URL `
        --profile $PROFILE `
        --region $REGION `
        --no-cli-pager | ConvertFrom-Json | Select-Object -ExpandProperty VersionId
    
    Write-Host "✅ DATABASE_URL atualizada" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erro ao atualizar DATABASE_URL: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Verificar/Criar JWT_SECRET
Write-Host "🔑 Configurando JWT_SECRET..." -ForegroundColor Yellow
$JWT_SECRET = "ysh_jwt_secret_production_2025_$(Get-Random -Maximum 99999)"

try {
    aws secretsmanager describe-secret `
        --secret-id /ysh-b2b/jwt-secret `
        --profile $PROFILE `
        --region $REGION `
        --no-cli-pager 2>$null | Out-Null
    
    Write-Host "ℹ️  JWT_SECRET já existe, mantendo valor atual" -ForegroundColor Gray
}
catch {
    aws secretsmanager create-secret `
        --name /ysh-b2b/jwt-secret `
        --secret-string $JWT_SECRET `
        --profile $PROFILE `
        --region $REGION `
        --no-cli-pager | ConvertFrom-Json | Select-Object -ExpandProperty ARN
    
    Write-Host "✅ JWT_SECRET criada" -ForegroundColor Green
}

Write-Host ""

# 3. Verificar/Criar COOKIE_SECRET
Write-Host "🍪 Configurando COOKIE_SECRET..." -ForegroundColor Yellow
$COOKIE_SECRET = "ysh_cookie_secret_production_2025_$(Get-Random -Maximum 99999)"

try {
    aws secretsmanager describe-secret `
        --secret-id /ysh-b2b/cookie-secret `
        --profile $PROFILE `
        --region $REGION `
        --no-cli-pager 2>$null | Out-Null
    
    Write-Host "ℹ️  COOKIE_SECRET já existe, mantendo valor atual" -ForegroundColor Gray
}
catch {
    aws secretsmanager create-secret `
        --name /ysh-b2b/cookie-secret `
        --secret-string $COOKIE_SECRET `
        --profile $PROFILE `
        --region $REGION `
        --no-cli-pager | ConvertFrom-Json | Select-Object -ExpandProperty ARN
    
    Write-Host "✅ COOKIE_SECRET criada" -ForegroundColor Green
}

Write-Host ""

# 4. Listar todos os secrets para verificação
Write-Host "📋 Secrets configurados:" -ForegroundColor Cyan
Write-Host ""

aws secretsmanager list-secrets `
    --filters Key=name, Values=/ysh-b2b/ `
    --profile $PROFILE `
    --region $REGION `
    --query "SecretList[*].[Name,LastChangedDate]" `
    --output table `
    --no-cli-pager

Write-Host ""
Write-Host "✅ Secrets Manager atualizado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximo passo: Atualizar task definitions e fazer deploy" -ForegroundColor Yellow
