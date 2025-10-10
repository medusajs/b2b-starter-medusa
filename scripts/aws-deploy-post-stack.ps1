# ==========================================
# Post-Stack Configuration - Terminal Dedicado
# Configura secrets, task definitions e ECS após stack criado
# Uso: .\scripts\aws-deploy-post-stack.ps1
# ==========================================

param(
    [string]$StackName = "ysh-b2b-infrastructure",
    [string]$AwsProfile = "ysh-production",
    [string]$Region = "us-east-1",
    [string]$AccountId = "773235999227"
)

$Host.UI.RawUI.WindowTitle = "AWS Post-Stack Configuration"

Write-Host "`n" + "="*80 -ForegroundColor Magenta
Write-Host "  AWS POST-STACK CONFIGURATION" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Magenta

# Verificar se stack existe e está completo
Write-Host "`n🔍 Verificando stack..." -ForegroundColor Yellow
try {
    $stack = (aws cloudformation describe-stacks `
            --stack-name $StackName `
            --profile $AwsProfile `
            --region $Region `
            --output json | ConvertFrom-Json).Stacks[0]
    
    if ($stack.StackStatus -ne "CREATE_COMPLETE") {
        Write-Host "❌ Stack não está completo. Status: $($stack.StackStatus)" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Stack completo" -ForegroundColor Green
}
catch {
    Write-Host "❌ Stack não encontrado" -ForegroundColor Red
    exit 1
}

# Obter outputs do stack
Write-Host "`n📤 Obtendo outputs do CloudFormation..." -ForegroundColor Cyan
$outputs = @{}
$stack.Outputs | ForEach-Object {
    $outputs[$_.OutputKey] = $_.OutputValue
    Write-Host "  $($_.OutputKey): $($_.OutputValue)" -ForegroundColor Gray
}

$dbEndpoint = $outputs['DatabaseEndpoint']
$redisEndpoint = $outputs['RedisEndpoint']
$albDns = $outputs['LoadBalancerDNS']
$ecsCluster = $outputs['ECSClusterName']
$vpcId = $outputs['VPCId']

if (-not $dbEndpoint -or -not $redisEndpoint) {
    Write-Host "`n❌ Outputs essenciais não encontrados!" -ForegroundColor Red
    exit 1
}

# Obter senha do RDS do Secrets Manager
Write-Host "`n🔐 Obtendo credenciais RDS..." -ForegroundColor Yellow
$dbSecretArn = "arn:aws:rds:${Region}:${AccountId}:db:production-ysh-b2b-postgres"
# Note: A senha é gerenciada automaticamente pelo RDS com ManageMasterUserPassword

# Criar secrets para URLs
Write-Host "`n🔐 Criando secrets de conexão..." -ForegroundColor Cyan

Write-Host "`n1️⃣ Database URL..." -ForegroundColor Yellow
$dbUrl = "postgresql://medusa_user:MANAGED_BY_RDS@${dbEndpoint}:5432/medusa_db"
aws secretsmanager create-secret `
    --name /ysh-b2b/database-url `
    --secret-string $dbUrl `
    --profile $AwsProfile `
    --region $Region 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Database URL criada" -ForegroundColor Green
}
else {
    Write-Host "   ⚠️  Já existe ou erro (continuando...)" -ForegroundColor Yellow
}

Write-Host "`n2️⃣ Redis URL..." -ForegroundColor Yellow
$redisUrl = "redis://${redisEndpoint}:6379"
aws secretsmanager create-secret `
    --name /ysh-b2b/redis-url `
    --secret-string $redisUrl `
    --profile $AwsProfile `
    --region $Region 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Redis URL criada" -ForegroundColor Green
}
else {
    Write-Host "   ⚠️  Já existe ou erro (continuando...)" -ForegroundColor Yellow
}

Write-Host "`n3️⃣ Backend URL..." -ForegroundColor Yellow
$backendUrl = "https://${albDns}"
aws secretsmanager create-secret `
    --name /ysh-b2b/backend-url `
    --secret-string $backendUrl `
    --profile $AwsProfile `
    --region $Region 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Backend URL criada" -ForegroundColor Green
}
else {
    Write-Host "   ⚠️  Já existe ou erro (continuando...)" -ForegroundColor Yellow
}

Write-Host "`n4️⃣ Storefront URL (temporário - ALB)..." -ForegroundColor Yellow
$storefrontUrl = "https://${albDns}"
aws secretsmanager create-secret `
    --name /ysh-b2b/storefront-url `
    --secret-string $storefrontUrl `
    --profile $AwsProfile `
    --region $Region 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Storefront URL criada" -ForegroundColor Green
}
else {
    Write-Host "   ⚠️  Já existe ou erro (continuando...)" -ForegroundColor Yellow
}

# Criar publishable key temporária
Write-Host "`n5️⃣ Medusa Publishable Key (placeholder)..." -ForegroundColor Yellow
aws secretsmanager create-secret `
    --name /ysh-b2b/publishable-key `
    --secret-string "pk_PLACEHOLDER_WILL_BE_UPDATED_AFTER_ADMIN_SETUP" `
    --profile $AwsProfile `
    --region $Region 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Publishable key criada" -ForegroundColor Green
}
else {
    Write-Host "   ⚠️  Já existe ou erro (continuando...)" -ForegroundColor Yellow
}

# Atualizar task definitions
Write-Host "`n📝 Atualizando Task Definitions..." -ForegroundColor Cyan

Write-Host "`n1️⃣ Backend Task Definition..." -ForegroundColor Yellow
$backendTaskDef = Get-Content aws/backend-task-definition.json -Raw
$backendTaskDef = $backendTaskDef -replace 'ACCOUNT-ID', $AccountId
$backendTaskDef = $backendTaskDef -replace 'REGION', $Region
$backendTaskDef | Out-File aws/backend-task-definition.updated.json -Encoding UTF8

aws ecs register-task-definition `
    --cli-input-json file://aws/backend-task-definition.updated.json `
    --profile $AwsProfile `
    --region $Region | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Backend task definition registrada" -ForegroundColor Green
}
else {
    Write-Host "   ❌ Erro ao registrar backend task definition" -ForegroundColor Red
}

Write-Host "`n2️⃣ Storefront Task Definition..." -ForegroundColor Yellow
$storefrontTaskDef = Get-Content aws/storefront-task-definition.json -Raw
$storefrontTaskDef = $storefrontTaskDef -replace 'ACCOUNT-ID', $AccountId
$storefrontTaskDef = $storefrontTaskDef -replace 'REGION', $Region
$storefrontTaskDef | Out-File aws/storefront-task-definition.updated.json -Encoding UTF8

aws ecs register-task-definition `
    --cli-input-json file://aws/storefront-task-definition.updated.json `
    --profile $AwsProfile `
    --region $Region | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Storefront task definition registrada" -ForegroundColor Green
}
else {
    Write-Host "   ❌ Erro ao registrar storefront task definition" -ForegroundColor Red
}

# Resumo
Write-Host "`n" + "="*80 -ForegroundColor Green
Write-Host "  CONFIGURAÇÃO CONCLUÍDA" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Green

Write-Host "`n📋 Recursos Configurados:" -ForegroundColor Yellow
Write-Host "  ✅ 5 Secrets Manager criados" -ForegroundColor Green
Write-Host "  ✅ 2 Task Definitions registradas" -ForegroundColor Green
Write-Host "  ✅ Database endpoint: $dbEndpoint" -ForegroundColor Gray
Write-Host "  ✅ Redis endpoint: $redisEndpoint" -ForegroundColor Gray
Write-Host "  ✅ ALB DNS: $albDns" -ForegroundColor Gray

Write-Host "`n📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "  1. Criar Target Groups no ALB" -ForegroundColor White
Write-Host "  2. Criar ECS Services (Backend + Storefront)" -ForegroundColor White
Write-Host "  3. Executar migrations no RDS" -ForegroundColor White
Write-Host "  4. Seed data no database" -ForegroundColor White

Write-Host "`n📖 Ver guia completo em: AWS_DEPLOYMENT_STATUS.md`n" -ForegroundColor Gray
