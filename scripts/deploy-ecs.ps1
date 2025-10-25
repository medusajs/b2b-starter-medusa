#!/usr/bin/env pwsh
# ==========================================
# ECS Service Deployment Script
# Deploy atualizado para backend e storefront
# ==========================================

$ErrorActionPreference = "Stop"

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("backend", "storefront", "all")]
    [string]$Service = "all",
    
    [Parameter(Mandatory = $false)]
    [string]$ImageTag = "1.0.1"
)

# Configurações
$PROFILE = "ysh-production"
$REGION = "us-east-1"
$CLUSTER = "production-ysh-b2b-cluster"
$ECR_REGISTRY = "773235999227.dkr.ecr.us-east-1.amazonaws.com"

Write-Host "🚀 YSH B2B ECS Deployment" -ForegroundColor Cyan
Write-Host "Service: $Service" -ForegroundColor Gray
Write-Host "Image Tag: $ImageTag" -ForegroundColor Gray
Write-Host ""

function Deploy-Service {
    param(
        [string]$ServiceName,
        [string]$TaskDefPath,
        [string]$ImagePath
    )
    
    Write-Host "📦 Deploying $ServiceName..." -ForegroundColor Yellow
    Write-Host ""
    
    # 1. Registrar nova task definition
    Write-Host "  → Registrando task definition..." -ForegroundColor Gray
    $TaskDefArn = aws ecs register-task-definition `
        --cli-input-json file://$TaskDefPath `
        --profile $PROFILE `
        --region $REGION `
        --no-cli-pager | ConvertFrom-Json | Select-Object -ExpandProperty taskDefinition | Select-Object -ExpandProperty taskDefinitionArn
    
    Write-Host "  ✅ Task Definition: $TaskDefArn" -ForegroundColor Green
    Write-Host ""
    
    # 2. Atualizar serviço
    Write-Host "  → Atualizando serviço ECS..." -ForegroundColor Gray
    aws ecs update-service `
        --cluster $CLUSTER `
        --service $ServiceName `
        --task-definition $TaskDefArn `
        --desired-count 2 `
        --force-new-deployment `
        --profile $PROFILE `
        --region $REGION `
        --no-cli-pager | Out-Null
    
    Write-Host "  ✅ Serviço atualizado, aguardando deployment..." -ForegroundColor Green
    Write-Host ""
    
    # 3. Monitorar deployment
    Write-Host "  → Monitorando deployment (60s)..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
    
    for ($i = 1; $i -le 6; $i++) {
        $Status = aws ecs describe-services `
            --cluster $CLUSTER `
            --services $ServiceName `
            --profile $PROFILE `
            --region $REGION `
            --query "services[0].[runningCount,desiredCount]" `
            --output text `
            --no-cli-pager
        
        $Running, $Desired = $Status -split '\s+'
        Write-Host "    Status: $Running/$Desired tasks rodando..." -ForegroundColor Gray
        
        if ($Running -eq $Desired) {
            Write-Host "  ✅ Deployment completo!" -ForegroundColor Green
            break
        }
        
        Start-Sleep -Seconds 10
    }
    
    Write-Host ""
}

function Show-ServiceStatus {
    Write-Host "📊 Status atual dos serviços:" -ForegroundColor Cyan
    Write-Host ""
    
    aws ecs describe-services `
        --cluster $CLUSTER `
        --services ysh-b2b-backend ysh-b2b-storefront `
        --profile $PROFILE `
        --region $REGION `
        --query "services[*].[serviceName,status,runningCount,desiredCount,taskDefinition]" `
        --output table `
        --no-cli-pager
    
    Write-Host ""
}

function Show-TargetHealth {
    param([string]$TargetGroupArn)
    
    Write-Host "🏥 Target Health:" -ForegroundColor Cyan
    aws elbv2 describe-target-health `
        --target-group-arn $TargetGroupArn `
        --profile $PROFILE `
        --region $REGION `
        --query "TargetHealthDescriptions[*].[Target.Id,TargetHealth.State,TargetHealth.Reason]" `
        --output table `
        --no-cli-pager
    
    Write-Host ""
}

# Status inicial
Show-ServiceStatus

# Deploy
if ($Service -eq "backend" -or $Service -eq "all") {
    Deploy-Service `
        -ServiceName "ysh-b2b-backend" `
        -TaskDefPath "../aws/backend-task-definition.json" `
        -ImagePath "$ECR_REGISTRY/ysh-b2b/backend:$ImageTag"
    
    Show-TargetHealth -TargetGroupArn "arn:aws:elasticloadbalancing:us-east-1:773235999227:targetgroup/ysh-backend-tg/5d057ad67b1e08c0"
}

if ($Service -eq "storefront" -or $Service -eq "all") {
    Deploy-Service `
        -ServiceName "ysh-b2b-storefront" `
        -TaskDefPath "../aws/storefront-task-definition.json" `
        -ImagePath "$ECR_REGISTRY/ysh-b2b/storefront:$ImageTag"
    
    Show-TargetHealth -TargetGroupArn "arn:aws:elasticloadbalancing:us-east-1:773235999227:targetgroup/ysh-storefront-tg/de48968877cc252d"
}

# Status final
Show-ServiceStatus

Write-Host "✅ Deployment concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Cyan
Write-Host "  Backend:    http://production-ysh-b2b-alb-1849611639.us-east-1.elb.amazonaws.com/health" -ForegroundColor Gray
Write-Host "  Storefront: http://production-ysh-b2b-alb-1849611639.us-east-1.elb.amazonaws.com/" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 CloudWatch Logs:" -ForegroundColor Cyan
Write-Host "  aws logs tail /ecs/ysh-b2b-backend --follow --profile ysh-production --region us-east-1" -ForegroundColor Gray
