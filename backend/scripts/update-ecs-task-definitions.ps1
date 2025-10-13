# Script para atualizar Task Definitions ECS com novos repositórios ECR
# Data: 13 de Outubro de 2025

param(
    [Parameter(Mandatory = $false)]
    [string]$Profile = "ysh-production",
    
    [Parameter(Mandatory = $false)]
    [string]$Region = "us-east-1",
    
    [Parameter(Mandatory = $false)]
    [switch]$DryRun = $false
)

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   ATUALIZAÇÃO DE TASK DEFINITIONS ECS           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Configurações
$Account = "773235999227"
$OldBackendImage = "$Account.dkr.ecr.$Region.amazonaws.com/ysh-b2b-backend:v1.0.2"
$NewBackendImage = "$Account.dkr.ecr.$Region.amazonaws.com/ysh-backend:latest"

$OldStorefrontImage = "$Account.dkr.ecr.$Region.amazonaws.com/ysh-b2b/storefront:1.0.0"
$NewStorefrontImage = "$Account.dkr.ecr.$Region.amazonaws.com/ysh-storefront:latest"

Write-Host "🔍 Verificando imagens no ECR..." -ForegroundColor Yellow

# Verificar se imagens novas existem
Write-Host "`nVerificando ysh-backend:latest..." -ForegroundColor Cyan
$backendCheck = aws ecr describe-images --repository-name ysh-backend --image-ids imageTag=latest --profile $Profile --region $Region 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERRO: Imagem ysh-backend:latest não encontrada!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ ysh-backend:latest encontrada" -ForegroundColor Green

Write-Host "`nVerificando ysh-storefront:latest..." -ForegroundColor Cyan
$storefrontCheck = aws ecr describe-images --repository-name ysh-storefront --image-ids imageTag=latest --profile $Profile --region $Region 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERRO: Imagem ysh-storefront:latest não encontrada!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ ysh-storefront:latest encontrada" -ForegroundColor Green

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# ==================================================
# BACKEND TASK DEFINITION
# ==================================================

Write-Host "`n📦 PROCESSANDO BACKEND TASK DEFINITION" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "1. Baixando task definition atual (ysh-b2b-backend:12)..." -ForegroundColor Yellow
$backendTaskDef = aws ecs describe-task-definition --task-definition ysh-b2b-backend:12 --profile $Profile --region $Region | ConvertFrom-Json

# Extrair apenas a parte necessária
$backendRegisterInput = @{
    family                  = $backendTaskDef.taskDefinition.family
    taskRoleArn             = $backendTaskDef.taskDefinition.taskRoleArn
    executionRoleArn        = $backendTaskDef.taskDefinition.executionRoleArn
    networkMode             = $backendTaskDef.taskDefinition.networkMode
    containerDefinitions    = $backendTaskDef.taskDefinition.containerDefinitions
    volumes                 = $backendTaskDef.taskDefinition.volumes
    requiresCompatibilities = $backendTaskDef.taskDefinition.requiresCompatibilities
    cpu                     = $backendTaskDef.taskDefinition.cpu
    memory                  = $backendTaskDef.taskDefinition.memory
}

Write-Host "✅ Task definition baixada" -ForegroundColor Green

Write-Host "`n2. Atualizando imagem Docker..." -ForegroundColor Yellow
Write-Host "   De: $OldBackendImage" -ForegroundColor Red
Write-Host "   Para: $NewBackendImage" -ForegroundColor Green

$backendRegisterInput.containerDefinitions[0].image = $NewBackendImage

# Salvar JSON para registro
$backendRegisterInput | ConvertTo-Json -Depth 10 | Out-File -FilePath ".\backend-task-def-new.json" -Encoding utf8
Write-Host "✅ Novo JSON salvo em backend-task-def-new.json" -ForegroundColor Green

if (-not $DryRun) {
    Write-Host "`n3. Registrando nova task definition..." -ForegroundColor Yellow
    $newBackendTask = aws ecs register-task-definition --cli-input-json file://backend-task-def-new.json --profile $Profile --region $Region | ConvertFrom-Json
    
    $newBackendRevision = $newBackendTask.taskDefinition.revision
    Write-Host "✅ Nova task definition registrada: ysh-b2b-backend:$newBackendRevision" -ForegroundColor Green
    
    Write-Host "`n4. Atualizando serviço ECS..." -ForegroundColor Yellow
    aws ecs update-service `
        --cluster production-ysh-b2b-cluster `
        --service ysh-b2b-backend `
        --task-definition "ysh-b2b-backend:$newBackendRevision" `
        --force-new-deployment `
        --profile $Profile `
        --region $Region | Out-Null
    
    Write-Host "✅ Serviço backend atualizado com sucesso!" -ForegroundColor Green
    Write-Host "   Aguarde 5-10 minutos para deployment completar" -ForegroundColor Yellow
}
else {
    Write-Host "`n⚠️  DRY RUN: Não registrando task definition (use sem -DryRun para aplicar)" -ForegroundColor Yellow
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# ==================================================
# STOREFRONT TASK DEFINITION
# ==================================================

Write-Host "`n📦 PROCESSANDO STOREFRONT TASK DEFINITION" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "1. Baixando task definition atual (ysh-b2b-storefront:8)..." -ForegroundColor Yellow
$storefrontTaskDef = aws ecs describe-task-definition --task-definition ysh-b2b-storefront:8 --profile $Profile --region $Region | ConvertFrom-Json

# Extrair apenas a parte necessária
$storefrontRegisterInput = @{
    family                  = $storefrontTaskDef.taskDefinition.family
    taskRoleArn             = $storefrontTaskDef.taskDefinition.taskRoleArn
    executionRoleArn        = $storefrontTaskDef.taskDefinition.executionRoleArn
    networkMode             = $storefrontTaskDef.taskDefinition.networkMode
    containerDefinitions    = $storefrontTaskDef.taskDefinition.containerDefinitions
    volumes                 = $storefrontTaskDef.taskDefinition.volumes
    requiresCompatibilities = $storefrontTaskDef.taskDefinition.requiresCompatibilities
    cpu                     = $storefrontTaskDef.taskDefinition.cpu
    memory                  = $storefrontTaskDef.taskDefinition.memory
}

Write-Host "✅ Task definition baixada" -ForegroundColor Green

Write-Host "`n2. Atualizando imagem Docker..." -ForegroundColor Yellow
Write-Host "   De: $OldStorefrontImage" -ForegroundColor Red
Write-Host "   Para: $NewStorefrontImage" -ForegroundColor Green

$storefrontRegisterInput.containerDefinitions[0].image = $NewStorefrontImage

# Salvar JSON para registro
$storefrontRegisterInput | ConvertTo-Json -Depth 10 | Out-File -FilePath ".\storefront-task-def-new.json" -Encoding utf8
Write-Host "✅ Novo JSON salvo em storefront-task-def-new.json" -ForegroundColor Green

if (-not $DryRun) {
    Write-Host "`n3. Registrando nova task definition..." -ForegroundColor Yellow
    $newStorefrontTask = aws ecs register-task-definition --cli-input-json file://storefront-task-def-new.json --profile $Profile --region $Region | ConvertFrom-Json
    
    $newStorefrontRevision = $newStorefrontTask.taskDefinition.revision
    Write-Host "✅ Nova task definition registrada: ysh-b2b-storefront:$newStorefrontRevision" -ForegroundColor Green
    
    Write-Host "`n4. Atualizando serviço ECS..." -ForegroundColor Yellow
    aws ecs update-service `
        --cluster production-ysh-b2b-cluster `
        --service ysh-b2b-storefront `
        --task-definition "ysh-b2b-storefront:$newStorefrontRevision" `
        --force-new-deployment `
        --profile $Profile `
        --region $Region | Out-Null
    
    Write-Host "✅ Serviço storefront atualizado com sucesso!" -ForegroundColor Green
    Write-Host "   Aguarde 5-10 minutos para deployment completar" -ForegroundColor Yellow
}
else {
    Write-Host "`n⚠️  DRY RUN: Não registrando task definition (use sem -DryRun para aplicar)" -ForegroundColor Yellow
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# ==================================================
# RESUMO FINAL
# ==================================================

Write-Host "`n✅ ATUALIZAÇÃO CONCLUÍDA" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

if (-not $DryRun) {
    Write-Host "📊 RESUMO:" -ForegroundColor Cyan
    Write-Host "   • Backend task definition atualizada" -ForegroundColor White
    Write-Host "   • Storefront task definition atualizada" -ForegroundColor White
    Write-Host "   • Ambos os serviços iniciando deployment" -ForegroundColor White
    
    Write-Host "`n🔍 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
    Write-Host "   1. Monitorar deployment (5-10 min)" -ForegroundColor White
    Write-Host "   2. Verificar health checks" -ForegroundColor White
    Write-Host "   3. Testar endpoints via ALB" -ForegroundColor White
    
    Write-Host "`n📝 COMANDOS ÚTEIS:" -ForegroundColor Cyan
    Write-Host "   # Ver status dos serviços" -ForegroundColor Gray
    Write-Host "   aws ecs describe-services --cluster production-ysh-b2b-cluster --services ysh-b2b-backend ysh-b2b-storefront --profile $Profile --region $Region --query 'services[*].{Nome:serviceName,Running:runningCount,Desired:desiredCount}' --output table" -ForegroundColor DarkGray
    
    Write-Host "`n   # Ver health dos targets" -ForegroundColor Gray
    Write-Host "   aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:$Region:$Account:targetgroup/ysh-backend-tg/5d057ad67b1e08c0 --profile $Profile --region $Region" -ForegroundColor DarkGray
}
else {
    Write-Host "⚠️  DRY RUN COMPLETO - Nenhuma mudança aplicada" -ForegroundColor Yellow
    Write-Host "   Execute novamente sem -DryRun para aplicar as mudanças" -ForegroundColor White
}

Write-Host ""
