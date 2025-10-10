# ==========================================
# Create ALB Target Groups
# Uso: .\scripts\aws-create-target-groups.ps1
# ==========================================

param(
    [string]$AwsProfile = "ysh-production",
    [string]$Region = "us-east-1",
    [string]$VpcId = ""
)

$Host.UI.RawUI.WindowTitle = "AWS Target Groups Creation"

Write-Host "`n" + "="*80 -ForegroundColor Blue
Write-Host "  CREATE ALB TARGET GROUPS" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Blue

# Obter VPC ID do CloudFormation se não fornecido
if (-not $VpcId) {
    Write-Host "`n📤 Obtendo VPC ID do CloudFormation..." -ForegroundColor Cyan
    
    try {
        $stack = (aws cloudformation describe-stacks `
                --stack-name ysh-b2b-infrastructure `
                --profile $AwsProfile `
                --region $Region `
                --output json | ConvertFrom-Json).Stacks[0]
        
        $outputs = @{}
        $stack.Outputs | ForEach-Object {
            $outputs[$_.OutputKey] = $_.OutputValue
        }
        
        $VpcId = $outputs['VPCId']
        Write-Host "  ✅ VPC ID: $VpcId" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erro ao obter VPC ID do CloudFormation" -ForegroundColor Red
        Write-Host "Forneça --VpcId manualmente" -ForegroundColor Yellow
        exit 1
    }
}

# ====================
# Backend Target Group
# ====================
Write-Host "`n" + "="*80 -ForegroundColor Magenta
Write-Host "  BACKEND TARGET GROUP" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Magenta

Write-Host "`n🎯 Criando Backend Target Group..." -ForegroundColor Cyan

$backendTgResult = aws elbv2 create-target-group `
    --name ysh-backend-tg `
    --protocol HTTP `
    --port 9000 `
    --vpc-id $VpcId `
    --target-type ip `
    --health-check-protocol HTTP `
    --health-check-path /health `
    --health-check-interval-seconds 30 `
    --health-check-timeout-seconds 10 `
    --healthy-threshold-count 2 `
    --unhealthy-threshold-count 3 `
    --matcher HttpCode=200 `
    --tags "Key=Environment,Value=production" "Key=Application,Value=ysh-b2b" "Key=Component,Value=backend" `
    --profile $AwsProfile `
    --region $Region `
    --output json 2>&1

if ($LASTEXITCODE -ne 0) {
    if ($backendTgResult -match "already exists") {
        Write-Host "⚠️  Target Group já existe" -ForegroundColor Yellow
        $backendTgArn = (aws elbv2 describe-target-groups `
                --names ysh-backend-tg `
                --profile $AwsProfile `
                --region $Region `
                --query 'TargetGroups[0].TargetGroupArn' `
                --output text)
    }
    else {
        Write-Host "❌ Erro ao criar Backend Target Group" -ForegroundColor Red
        Write-Host $backendTgResult
        exit 1
    }
}
else {
    $backendTgArn = ($backendTgResult | ConvertFrom-Json).TargetGroups[0].TargetGroupArn
    Write-Host "✅ Backend Target Group criado" -ForegroundColor Green
}

Write-Host "ARN: $backendTgArn" -ForegroundColor Gray

# Configurar atributos
Write-Host "`n⚙️  Configurando atributos..." -ForegroundColor Cyan

aws elbv2 modify-target-group-attributes `
    --target-group-arn $backendTgArn `
    --attributes `
    "Key=deregistration_delay.timeout_seconds,Value=30" `
    "Key=stickiness.enabled,Value=false" `
    "Key=load_balancing.algorithm.type,Value=least_outstanding_requests" `
    --profile $AwsProfile `
    --region $Region | Out-Null

Write-Host "✅ Atributos configurados" -ForegroundColor Green

# ====================
# Storefront Target Group
# ====================
Write-Host "`n" + "="*80 -ForegroundColor Magenta
Write-Host "  STOREFRONT TARGET GROUP" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Magenta

Write-Host "`n🎯 Criando Storefront Target Group..." -ForegroundColor Cyan

$storefrontTgResult = aws elbv2 create-target-group `
    --name ysh-storefront-tg `
    --protocol HTTP `
    --port 8000 `
    --vpc-id $VpcId `
    --target-type ip `
    --health-check-protocol HTTP `
    --health-check-path / `
    --health-check-interval-seconds 30 `
    --health-check-timeout-seconds 10 `
    --healthy-threshold-count 2 `
    --unhealthy-threshold-count 3 `
    --matcher HttpCode=200-399 `
    --tags "Key=Environment,Value=production" "Key=Application,Value=ysh-b2b" "Key=Component,Value=storefront" `
    --profile $AwsProfile `
    --region $Region `
    --output json 2>&1

if ($LASTEXITCODE -ne 0) {
    if ($storefrontTgResult -match "already exists") {
        Write-Host "⚠️  Target Group já existe" -ForegroundColor Yellow
        $storefrontTgArn = (aws elbv2 describe-target-groups `
                --names ysh-storefront-tg `
                --profile $AwsProfile `
                --region $Region `
                --query 'TargetGroups[0].TargetGroupArn' `
                --output text)
    }
    else {
        Write-Host "❌ Erro ao criar Storefront Target Group" -ForegroundColor Red
        Write-Host $storefrontTgResult
        exit 1
    }
}
else {
    $storefrontTgArn = ($storefrontTgResult | ConvertFrom-Json).TargetGroups[0].TargetGroupArn
    Write-Host "✅ Storefront Target Group criado" -ForegroundColor Green
}

Write-Host "ARN: $storefrontTgArn" -ForegroundColor Gray

# Configurar atributos
Write-Host "`n⚙️  Configurando atributos..." -ForegroundColor Cyan

aws elbv2 modify-target-group-attributes `
    --target-group-arn $storefrontTgArn `
    --attributes `
    "Key=deregistration_delay.timeout_seconds,Value=30" `
    "Key=stickiness.enabled,Value=true" `
    "Key=stickiness.type,Value=lb_cookie" `
    "Key=stickiness.lb_cookie.duration_seconds,Value=86400" `
    "Key=load_balancing.algorithm.type,Value=round_robin" `
    --profile $AwsProfile `
    --region $Region | Out-Null

Write-Host "✅ Atributos configurados" -ForegroundColor Green

# ====================
# Summary
# ====================
Write-Host "`n" + "="*80 -ForegroundColor Green
Write-Host "  TARGET GROUPS CRIADOS COM SUCESSO" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Green

Write-Host "`n📋 ARNs Criados:" -ForegroundColor Yellow
Write-Host "Backend:" -ForegroundColor Cyan
Write-Host "  $backendTgArn" -ForegroundColor White
Write-Host "`nStorefront:" -ForegroundColor Cyan
Write-Host "  $storefrontTgArn" -ForegroundColor White

Write-Host "`n🔗 Próximo: Configurar ALB Listeners" -ForegroundColor Yellow
Write-Host "  1. Obter ALB ARN do CloudFormation" -ForegroundColor Gray
Write-Host "  2. Criar listener HTTP:80 (redirect HTTPS)" -ForegroundColor Gray
Write-Host "  3. Criar listener HTTPS:443 (path routing)" -ForegroundColor Gray

Write-Host "`n" + "="*80 -ForegroundColor Gray
