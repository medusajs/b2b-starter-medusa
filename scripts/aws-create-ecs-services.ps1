# ==========================================
# Create ECS Services with Auto-Scaling
# Uso: .\scripts\aws-create-ecs-services.ps1
# ==========================================

param(
    [string]$AwsProfile = "ysh-production",
    [string]$Region = "us-east-1",
    [string]$ClusterName = "production-ysh-b2b-cluster"
)

$Host.UI.RawUI.WindowTitle = "AWS ECS Services Creation"

Write-Host "`n" + "="*80 -ForegroundColor Blue
Write-Host "  CREATE ECS SERVICES + AUTO-SCALING" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Blue

# Obter recursos necessários
Write-Host "`n📤 Obtendo recursos do CloudFormation..." -ForegroundColor Cyan

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
    
    $subnet1 = $outputs['PrivateSubnet1']
    $subnet2 = $outputs['PrivateSubnet2']
    $securityGroup = $outputs['ECSSecurityGroup']
    
    Write-Host "  ✅ Subnets: $subnet1, $subnet2" -ForegroundColor Green
    Write-Host "  ✅ Security Group: $securityGroup" -ForegroundColor Green
    
    # Target Groups
    $backendTgArn = (aws elbv2 describe-target-groups `
            --names ysh-backend-tg `
            --profile $AwsProfile `
            --region $Region `
            --query 'TargetGroups[0].TargetGroupArn' `
            --output text)
    
    $storefrontTgArn = (aws elbv2 describe-target-groups `
            --names ysh-storefront-tg `
            --profile $AwsProfile `
            --region $Region `
            --query 'TargetGroups[0].TargetGroupArn' `
            --output text)
    
    Write-Host "  ✅ Backend TG: $backendTgArn" -ForegroundColor Green
    Write-Host "  ✅ Storefront TG: $storefrontTgArn" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erro ao obter recursos" -ForegroundColor Red
    exit 1
}

# ====================
# Backend Service
# ====================
Write-Host "`n" + "="*80 -ForegroundColor Magenta
Write-Host "  BACKEND SERVICE" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Magenta

Write-Host "`n🚀 Criando Backend Service..." -ForegroundColor Cyan

$backendServiceResult = aws ecs create-service `
    --cluster $ClusterName `
    --service-name ysh-b2b-backend `
    --task-definition ysh-b2b-backend:1 `
    --desired-count 2 `
    --launch-type FARGATE `
    --platform-version LATEST `
    --network-configuration "awsvpcConfiguration={subnets=[$subnet1,$subnet2],securityGroups=[$securityGroup],assignPublicIp=DISABLED}" `
    --load-balancers "targetGroupArn=$backendTgArn,containerName=ysh-b2b-backend,containerPort=9000" `
    --health-check-grace-period-seconds 60 `
    --deployment-configuration "deploymentCircuitBreaker={enable=true,rollback=true},maximumPercent=200,minimumHealthyPercent=100" `
    --enable-ecs-managed-tags `
    --propagate-tags SERVICE `
    --tags "key=Environment,value=production" "key=Application,value=ysh-b2b" "key=Component,value=backend" `
    --profile $AwsProfile `
    --region $Region `
    --output json 2>&1

if ($LASTEXITCODE -ne 0) {
    if ($backendServiceResult -match "already exists") {
        Write-Host "⚠️  Backend Service já existe" -ForegroundColor Yellow
    }
    else {
        Write-Host "❌ Erro ao criar Backend Service" -ForegroundColor Red
        Write-Host $backendServiceResult
        exit 1
    }
}
else {
    Write-Host "✅ Backend Service criado" -ForegroundColor Green
}

# Auto-Scaling Backend
Write-Host "`n📊 Configurando Auto-Scaling Backend..." -ForegroundColor Cyan

# Register scalable target
aws application-autoscaling register-scalable-target `
    --service-namespace ecs `
    --scalable-dimension ecs:service:DesiredCount `
    --resource-id "service/$ClusterName/ysh-b2b-backend" `
    --min-capacity 2 `
    --max-capacity 10 `
    --profile $AwsProfile `
    --region $Region 2>&1 | Out-Null

# CPU Scaling Policy
aws application-autoscaling put-scaling-policy `
    --service-namespace ecs `
    --scalable-dimension ecs:service:DesiredCount `
    --resource-id "service/$ClusterName/ysh-b2b-backend" `
    --policy-name backend-cpu-scaling `
    --policy-type TargetTrackingScaling `
    --target-tracking-scaling-policy-configuration "TargetValue=70.0,PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageCPUUtilization},ScaleOutCooldown=60,ScaleInCooldown=300" `
    --profile $AwsProfile `
    --region $Region 2>&1 | Out-Null

# Memory Scaling Policy
aws application-autoscaling put-scaling-policy `
    --service-namespace ecs `
    --scalable-dimension ecs:service:DesiredCount `
    --resource-id "service/$ClusterName/ysh-b2b-backend" `
    --policy-name backend-memory-scaling `
    --policy-type TargetTrackingScaling `
    --target-tracking-scaling-policy-configuration "TargetValue=80.0,PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageMemoryUtilization},ScaleOutCooldown=60,ScaleInCooldown=300" `
    --profile $AwsProfile `
    --region $Region 2>&1 | Out-Null

Write-Host "✅ Auto-Scaling configurado (CPU 70%, Memory 80%, Min:2, Max:10)" -ForegroundColor Green

# ====================
# Storefront Service
# ====================
Write-Host "`n" + "="*80 -ForegroundColor Magenta
Write-Host "  STOREFRONT SERVICE" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Magenta

Write-Host "`n🚀 Criando Storefront Service..." -ForegroundColor Cyan

$storefrontServiceResult = aws ecs create-service `
    --cluster $ClusterName `
    --service-name ysh-b2b-storefront `
    --task-definition ysh-b2b-storefront:1 `
    --desired-count 2 `
    --launch-type FARGATE `
    --platform-version LATEST `
    --network-configuration "awsvpcConfiguration={subnets=[$subnet1,$subnet2],securityGroups=[$securityGroup],assignPublicIp=DISABLED}" `
    --load-balancers "targetGroupArn=$storefrontTgArn,containerName=ysh-b2b-storefront,containerPort=8000" `
    --health-check-grace-period-seconds 30 `
    --deployment-configuration "deploymentCircuitBreaker={enable=true,rollback=true},maximumPercent=200,minimumHealthyPercent=100" `
    --enable-ecs-managed-tags `
    --propagate-tags SERVICE `
    --tags "key=Environment,value=production" "key=Application,value=ysh-b2b" "key=Component,value=storefront" `
    --profile $AwsProfile `
    --region $Region `
    --output json 2>&1

if ($LASTEXITCODE -ne 0) {
    if ($storefrontServiceResult -match "already exists") {
        Write-Host "⚠️  Storefront Service já existe" -ForegroundColor Yellow
    }
    else {
        Write-Host "❌ Erro ao criar Storefront Service" -ForegroundColor Red
        Write-Host $storefrontServiceResult
        exit 1
    }
}
else {
    Write-Host "✅ Storefront Service criado" -ForegroundColor Green
}

# Auto-Scaling Storefront
Write-Host "`n📊 Configurando Auto-Scaling Storefront..." -ForegroundColor Cyan

# Register scalable target
aws application-autoscaling register-scalable-target `
    --service-namespace ecs `
    --scalable-dimension ecs:service:DesiredCount `
    --resource-id "service/$ClusterName/ysh-b2b-storefront" `
    --min-capacity 2 `
    --max-capacity 6 `
    --profile $AwsProfile `
    --region $Region 2>&1 | Out-Null

# CPU Scaling Policy
aws application-autoscaling put-scaling-policy `
    --service-namespace ecs `
    --scalable-dimension ecs:service:DesiredCount `
    --resource-id "service/$ClusterName/ysh-b2b-storefront" `
    --policy-name storefront-cpu-scaling `
    --policy-type TargetTrackingScaling `
    --target-tracking-scaling-policy-configuration "TargetValue=70.0,PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageCPUUtilization},ScaleOutCooldown=60,ScaleInCooldown=300" `
    --profile $AwsProfile `
    --region $Region 2>&1 | Out-Null

# Memory Scaling Policy
aws application-autoscaling put-scaling-policy `
    --service-namespace ecs `
    --scalable-dimension ecs:service:DesiredCount `
    --resource-id "service/$ClusterName/ysh-b2b-storefront" `
    --policy-name storefront-memory-scaling `
    --policy-type TargetTrackingScaling `
    --target-tracking-scaling-policy-configuration "TargetValue=80.0,PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageMemoryUtilization},ScaleOutCooldown=60,ScaleInCooldown=300" `
    --profile $AwsProfile `
    --region $Region 2>&1 | Out-Null

Write-Host "✅ Auto-Scaling configurado (CPU 70%, Memory 80%, Min:2, Max:6)" -ForegroundColor Green

# ====================
# Monitoring
# ====================
Write-Host "`n" + "="*80 -ForegroundColor Cyan
Write-Host "  MONITORANDO STARTUP DOS SERVICES" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Cyan

Write-Host "`n⏳ Aguardando services iniciarem (isso pode levar 2-3 minutos)..." -ForegroundColor Yellow

$timeout = 180
$elapsed = 0

while ($elapsed -lt $timeout) {
    Start-Sleep -Seconds 15
    $elapsed += 15
    
    $services = (aws ecs describe-services `
            --cluster $ClusterName `
            --services ysh-b2b-backend ysh-b2b-storefront `
            --profile $AwsProfile `
            --region $Region `
            --output json | ConvertFrom-Json).services
    
    Write-Host "`n📊 Status (${elapsed}s):" -ForegroundColor Cyan
    
    foreach ($service in $services) {
        $name = $service.serviceName
        $running = $service.runningCount
        $desired = $service.desiredCount
        $status = if ($running -eq $desired) { "✅" } else { "⏳" }
        
        Write-Host "  $status $name : $running/$desired tasks running" -ForegroundColor White
        
        if ($service.events.Count -gt 0) {
            $lastEvent = $service.events[0].message
            Write-Host "     Latest: $lastEvent" -ForegroundColor Gray
        }
    }
    
    # Check if all services stable
    $allStable = $true
    foreach ($service in $services) {
        if ($service.runningCount -ne $service.desiredCount) {
            $allStable = $false
            break
        }
    }
    
    if ($allStable) {
        Write-Host "`n✅ Todos os services estão RUNNING!" -ForegroundColor Green
        break
    }
}

# ====================
# Summary
# ====================
Write-Host "`n" + "="*80 -ForegroundColor Green
Write-Host "  ECS SERVICES CRIADOS" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Green

Write-Host "`n📋 Services:" -ForegroundColor Yellow
Write-Host "  Backend:" -ForegroundColor Cyan
Write-Host "    • Desired: 2 tasks" -ForegroundColor White
Write-Host "    • Auto-Scaling: 2-10 tasks" -ForegroundColor White
Write-Host "    • Target Group: ysh-backend-tg" -ForegroundColor White
Write-Host "`n  Storefront:" -ForegroundColor Cyan
Write-Host "    • Desired: 2 tasks" -ForegroundColor White
Write-Host "    • Auto-Scaling: 2-6 tasks" -ForegroundColor White
Write-Host "    • Target Group: ysh-storefront-tg" -ForegroundColor White

Write-Host "`n🔗 Próximo: Verificar Target Group Health" -ForegroundColor Yellow
Write-Host "  aws elbv2 describe-target-health --target-group-arn <arn>`n" -ForegroundColor Gray

Write-Host "="*80 -ForegroundColor Gray
