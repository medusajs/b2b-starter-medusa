# ==========================================
# Database Initialization via ECS Run-Task
# Executa migrations e seed após RDS disponível
# Uso: .\scripts\aws-db-init.ps1
# ==========================================

param(
    [string]$AwsProfile = "ysh-production",
    [string]$Region = "us-east-1",
    [string]$ClusterName = "production-ysh-b2b-cluster",
    [string]$TaskDefinition = "ysh-b2b-backend",
    [string]$SubnetIds = "",  # Comma-separated
    [string]$SecurityGroupId = ""
)

$Host.UI.RawUI.WindowTitle = "AWS Database Initialization"

Write-Host "`n" + "="*80 -ForegroundColor Yellow
Write-Host "  DATABASE INITIALIZATION - YSH B2B" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Yellow

# Obter outputs do CloudFormation se não fornecidos
if (-not $SubnetIds -or -not $SecurityGroupId) {
    Write-Host "`n📤 Obtendo informações do CloudFormation..." -ForegroundColor Cyan
    
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
        
        if (-not $SubnetIds) {
            $SubnetIds = $outputs['PrivateSubnet1'] + "," + $outputs['PrivateSubnet2']
        }
        
        if (-not $SecurityGroupId) {
            $SecurityGroupId = $outputs['ECSSecurityGroup']
        }
        
        Write-Host "  ✅ Subnets: $SubnetIds" -ForegroundColor Green
        Write-Host "  ✅ Security Group: $SecurityGroupId" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erro ao obter outputs do CloudFormation" -ForegroundColor Red
        Write-Host "Forneça --SubnetIds e --SecurityGroupId manualmente" -ForegroundColor Yellow
        exit 1
    }
}

# Validar se task definition existe
Write-Host "`n🔍 Verificando task definition..." -ForegroundColor Cyan
$taskDefArn = (aws ecs describe-task-definition `
        --task-definition $TaskDefinition `
        --profile $AwsProfile `
        --region $Region `
        --query 'taskDefinition.taskDefinitionArn' `
        --output text 2>&1)

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Task definition '$TaskDefinition' não encontrada" -ForegroundColor Red
    Write-Host "Execute primeiro: aws ecs register-task-definition ..." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Task definition: $taskDefArn" -ForegroundColor Green

# ====================
# STEP 1: Run Migrations
# ====================
Write-Host "`n" + "="*80 -ForegroundColor Magenta
Write-Host "  STEP 1: DATABASE MIGRATIONS" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Magenta

Write-Host "`n🚀 Executando migrations..." -ForegroundColor Cyan

$migrationTask = aws ecs run-task `
    --cluster $ClusterName `
    --task-definition $TaskDefinition `
    --launch-type FARGATE `
    --network-configuration "awsvpcConfiguration={subnets=[$SubnetIds],securityGroups=[$SecurityGroupId],assignPublicIp=DISABLED}" `
    --overrides "{`"containerOverrides`":[{`"name`":`"ysh-b2b-backend`",`"command`":[`"yarn`",`"medusa`",`"db:migrate`"]}]}" `
    --profile $AwsProfile `
    --region $Region `
    --output json 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao iniciar task de migration" -ForegroundColor Red
    Write-Host $migrationTask
    exit 1
}

$taskId = ($migrationTask | ConvertFrom-Json).tasks[0].taskArn.Split('/')[-1]
Write-Host "✅ Migration task iniciada: $taskId" -ForegroundColor Green

# Aguardar conclusão
Write-Host "`n⏳ Aguardando conclusão da migration..." -ForegroundColor Yellow
$timeout = 300  # 5 minutos
$elapsed = 0

while ($elapsed -lt $timeout) {
    Start-Sleep -Seconds 10
    $elapsed += 10
    
    $taskStatus = (aws ecs describe-tasks `
            --cluster $ClusterName `
            --tasks $taskId `
            --profile $AwsProfile `
            --region $Region `
            --output json | ConvertFrom-Json).tasks[0]
    
    $status = $taskStatus.lastStatus
    
    Write-Host "  Status: $status (${elapsed}s)" -ForegroundColor Gray
    
    if ($status -eq "STOPPED") {
        $exitCode = $taskStatus.containers[0].exitCode
        
        if ($exitCode -eq 0) {
            Write-Host "`n✅ Migrations concluídas com sucesso!" -ForegroundColor Green
            break
        }
        else {
            Write-Host "`n❌ Migrations FALHARAM (exit code: $exitCode)" -ForegroundColor Red
            Write-Host "`nVerificar logs:" -ForegroundColor Yellow
            Write-Host "aws logs tail /ecs/ysh-b2b-backend --since 5m --follow" -ForegroundColor White
            exit 1
        }
    }
}

if ($elapsed -ge $timeout) {
    Write-Host "`n❌ Timeout após 5 minutos" -ForegroundColor Red
    exit 1
}

# ====================
# STEP 2: Seed Data
# ====================
Write-Host "`n" + "="*80 -ForegroundColor Magenta
Write-Host "  STEP 2: SEED DATABASE" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Magenta

Write-Host "`n🌱 Executando seed..." -ForegroundColor Cyan

$seedTask = aws ecs run-task `
    --cluster $ClusterName `
    --task-definition $TaskDefinition `
    --launch-type FARGATE `
    --network-configuration "awsvpcConfiguration={subnets=[$SubnetIds],securityGroups=[$SecurityGroupId],assignPublicIp=DISABLED}" `
    --overrides "{`"containerOverrides`":[{`"name`":`"ysh-b2b-backend`",`"command`":[`"yarn`",`"run`",`"seed`"]}]}" `
    --profile $AwsProfile `
    --region $Region `
    --output json 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao iniciar task de seed" -ForegroundColor Red
    Write-Host $seedTask
    exit 1
}

$seedTaskId = ($seedTask | ConvertFrom-Json).tasks[0].taskArn.Split('/')[-1]
Write-Host "✅ Seed task iniciada: $seedTaskId" -ForegroundColor Green

# Aguardar conclusão
Write-Host "`n⏳ Aguardando conclusão do seed..." -ForegroundColor Yellow
$elapsed = 0

while ($elapsed -lt $timeout) {
    Start-Sleep -Seconds 10
    $elapsed += 10
    
    $taskStatus = (aws ecs describe-tasks `
            --cluster $ClusterName `
            --tasks $seedTaskId `
            --profile $AwsProfile `
            --region $Region `
            --output json | ConvertFrom-Json).tasks[0]
    
    $status = $taskStatus.lastStatus
    
    Write-Host "  Status: $status (${elapsed}s)" -ForegroundColor Gray
    
    if ($status -eq "STOPPED") {
        $exitCode = $taskStatus.containers[0].exitCode
        
        if ($exitCode -eq 0) {
            Write-Host "`n✅ Seed concluído com sucesso!" -ForegroundColor Green
            break
        }
        else {
            Write-Host "`n❌ Seed FALHOU (exit code: $exitCode)" -ForegroundColor Red
            Write-Host "`nVerificar logs:" -ForegroundColor Yellow
            Write-Host "aws logs tail /ecs/ysh-b2b-backend --since 5m --follow" -ForegroundColor White
            exit 1
        }
    }
}

if ($elapsed -ge $timeout) {
    Write-Host "`n❌ Timeout após 5 minutos" -ForegroundColor Red
    exit 1
}

# ====================
# STEP 3: Validation
# ====================
Write-Host "`n" + "="*80 -ForegroundColor Green
Write-Host "  STEP 3: VALIDATION" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Green

Write-Host "`n📊 Esperado no banco:" -ForegroundColor Yellow
Write-Host "  • 511 SKUs (unified_catalog_sku)" -ForegroundColor Gray
Write-Host "  • 101 Kits (unified_catalog_kit)" -ForegroundColor Gray
Write-Host "  • 37 Manufacturers (unified_catalog_manufacturer)" -ForegroundColor Gray

Write-Host "`n✅ DATABASE INITIALIZATION COMPLETA!" -ForegroundColor Green
Write-Host "`n📖 Para validar manualmente:" -ForegroundColor Cyan
Write-Host "1. Conectar ao RDS (via bastion ou VPN)" -ForegroundColor White
Write-Host "2. psql -h <rds-endpoint> -U medusa_user -d medusa_db" -ForegroundColor White
Write-Host "3. SELECT COUNT(*) FROM unified_catalog_sku;" -ForegroundColor White

Write-Host "`n" + "="*80 -ForegroundColor Gray
