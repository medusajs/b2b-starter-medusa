# ==========================================
# Create ALB Listeners with Path Routing
# Uso: .\scripts\aws-create-alb-listeners.ps1
# ==========================================

param(
    [string]$AwsProfile = "ysh-production",
    [string]$Region = "us-east-1",
    [string]$LoadBalancerArn = "",
    [string]$BackendTargetGroupArn = "",
    [string]$StorefrontTargetGroupArn = ""
)

$Host.UI.RawUI.WindowTitle = "AWS ALB Listeners Creation"

Write-Host "`n" + "="*80 -ForegroundColor Blue
Write-Host "  CREATE ALB LISTENERS & ROUTING RULES" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Blue

# Obter recursos do CloudFormation se não fornecidos
if (-not $LoadBalancerArn -or -not $BackendTargetGroupArn -or -not $StorefrontTargetGroupArn) {
    Write-Host "`n📤 Obtendo recursos do CloudFormation e Target Groups..." -ForegroundColor Cyan
    
    try {
        # CloudFormation Outputs
        $stack = (aws cloudformation describe-stacks `
                --stack-name ysh-b2b-infrastructure `
                --profile $AwsProfile `
                --region $Region `
                --output json | ConvertFrom-Json).Stacks[0]
        
        $outputs = @{}
        $stack.Outputs | ForEach-Object {
            $outputs[$_.OutputKey] = $_.OutputValue
        }
        
        if (-not $LoadBalancerArn) {
            $LoadBalancerArn = $outputs['LoadBalancerArn']
            Write-Host "  ✅ ALB ARN: $LoadBalancerArn" -ForegroundColor Green
        }
        
        # Target Groups
        if (-not $BackendTargetGroupArn) {
            $BackendTargetGroupArn = (aws elbv2 describe-target-groups `
                    --names ysh-backend-tg `
                    --profile $AwsProfile `
                    --region $Region `
                    --query 'TargetGroups[0].TargetGroupArn' `
                    --output text)
            Write-Host "  ✅ Backend TG ARN: $BackendTargetGroupArn" -ForegroundColor Green
        }
        
        if (-not $StorefrontTargetGroupArn) {
            $StorefrontTargetGroupArn = (aws elbv2 describe-target-groups `
                    --names ysh-storefront-tg `
                    --profile $AwsProfile `
                    --region $Region `
                    --query 'TargetGroups[0].TargetGroupArn' `
                    --output text)
            Write-Host "  ✅ Storefront TG ARN: $StorefrontTargetGroupArn" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "❌ Erro ao obter recursos" -ForegroundColor Red
        Write-Host "Forneça ARNs manualmente via parâmetros" -ForegroundColor Yellow
        exit 1
    }
}

# ====================
# HTTP Listener (Port 80)
# ====================
Write-Host "`n" + "="*80 -ForegroundColor Magenta
Write-Host "  HTTP LISTENER (Port 80 → Redirect HTTPS)" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Magenta

Write-Host "`n🔗 Criando HTTP Listener com redirect..." -ForegroundColor Cyan

$httpListenerResult = aws elbv2 create-listener `
    --load-balancer-arn $LoadBalancerArn `
    --protocol HTTP `
    --port 80 `
    --default-actions "Type=redirect,RedirectConfig={Protocol=HTTPS,Port=443,StatusCode=HTTP_301}" `
    --profile $AwsProfile `
    --region $Region `
    --output json 2>&1

if ($LASTEXITCODE -ne 0) {
    if ($httpListenerResult -match "already exists") {
        Write-Host "⚠️  HTTP Listener já existe" -ForegroundColor Yellow
    }
    else {
        Write-Host "❌ Erro ao criar HTTP Listener" -ForegroundColor Red
        Write-Host $httpListenerResult
        exit 1
    }
}
else {
    $httpListenerArn = ($httpListenerResult | ConvertFrom-Json).Listeners[0].ListenerArn
    Write-Host "✅ HTTP Listener criado" -ForegroundColor Green
    Write-Host "ARN: $httpListenerArn" -ForegroundColor Gray
}

# ====================
# HTTPS Listener (Port 443)
# ====================
Write-Host "`n" + "="*80 -ForegroundColor Magenta
Write-Host "  HTTPS LISTENER (Port 443 → Path Routing)" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Magenta

# Verificar se existe certificado ACM
Write-Host "`n🔍 Verificando certificados ACM..." -ForegroundColor Cyan
$certificates = aws acm list-certificates `
    --profile $AwsProfile `
    --region $Region `
    --query 'CertificateSummaryList[?DomainName==`yellosolar.com` || DomainName==`*.yellosolar.com`]' `
    --output json 2>&1

if ($LASTEXITCODE -eq 0 -and $certificates -ne "[]") {
    $certArn = ($certificates | ConvertFrom-Json)[0].CertificateArn
    Write-Host "✅ Certificado encontrado: $certArn" -ForegroundColor Green
    $useHttps = $true
}
else {
    Write-Host "⚠️  Nenhum certificado ACM encontrado para yellosolar.com" -ForegroundColor Yellow
    Write-Host "   Criando listener HTTP temporário na porta 443..." -ForegroundColor Yellow
    $useHttps = $false
}

if ($useHttps) {
    # HTTPS Listener com certificado
    Write-Host "`n🔗 Criando HTTPS Listener..." -ForegroundColor Cyan
    
    $httpsListenerResult = aws elbv2 create-listener `
        --load-balancer-arn $LoadBalancerArn `
        --protocol HTTPS `
        --port 443 `
        --certificates CertificateArn=$certArn `
        --ssl-policy ELBSecurityPolicy-TLS13-1-2-2021-06 `
        --default-actions "Type=forward,TargetGroupArn=$StorefrontTargetGroupArn" `
        --profile $AwsProfile `
        --region $Region `
        --output json 2>&1
}
else {
    # HTTP Listener temporário na porta 443 (até ter certificado)
    Write-Host "`n🔗 Criando HTTP Listener temporário na porta 443..." -ForegroundColor Cyan
    
    $httpsListenerResult = aws elbv2 create-listener `
        --load-balancer-arn $LoadBalancerArn `
        --protocol HTTP `
        --port 443 `
        --default-actions "Type=forward,TargetGroupArn=$StorefrontTargetGroupArn" `
        --profile $AwsProfile `
        --region $Region `
        --output json 2>&1
}

if ($LASTEXITCODE -ne 0) {
    if ($httpsListenerResult -match "already exists") {
        Write-Host "⚠️  Listener porta 443 já existe" -ForegroundColor Yellow
        # Obter ARN do listener existente
        $httpsListenerArn = (aws elbv2 describe-listeners `
                --load-balancer-arn $LoadBalancerArn `
                --profile $AwsProfile `
                --region $Region `
                --query "Listeners[?Port==``443``].ListenerArn" `
                --output text)
    }
    else {
        Write-Host "❌ Erro ao criar Listener 443" -ForegroundColor Red
        Write-Host $httpsListenerResult
        exit 1
    }
}
else {
    $httpsListenerArn = ($httpsListenerResult | ConvertFrom-Json).Listeners[0].ListenerArn
    Write-Host "✅ Listener 443 criado" -ForegroundColor Green
    Write-Host "ARN: $httpsListenerArn" -ForegroundColor Gray
}

# ====================
# Routing Rules
# ====================
Write-Host "`n" + "="*80 -ForegroundColor Magenta
Write-Host "  PATH-BASED ROUTING RULES" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Magenta

# Rule 1: /store/* → Backend
Write-Host "`n📍 Criando regra: /store/* → Backend..." -ForegroundColor Cyan

$storeRuleResult = aws elbv2 create-rule `
    --listener-arn $httpsListenerArn `
    --priority 10 `
    --conditions "Field=path-pattern,Values=/store/*" `
    --actions "Type=forward,TargetGroupArn=$BackendTargetGroupArn" `
    --profile $AwsProfile `
    --region $Region `
    --output json 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Regra /store/* criada" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Regra pode já existir ou erro: $storeRuleResult" -ForegroundColor Yellow
}

# Rule 2: /admin/* → Backend
Write-Host "`n📍 Criando regra: /admin/* → Backend..." -ForegroundColor Cyan

$adminRuleResult = aws elbv2 create-rule `
    --listener-arn $httpsListenerArn `
    --priority 20 `
    --conditions "Field=path-pattern,Values=/admin/*" `
    --actions "Type=forward,TargetGroupArn=$BackendTargetGroupArn" `
    --profile $AwsProfile `
    --region $Region `
    --output json 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Regra /admin/* criada" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Regra pode já existir ou erro: $adminRuleResult" -ForegroundColor Yellow
}

# Rule 3: /health → Backend
Write-Host "`n📍 Criando regra: /health → Backend..." -ForegroundColor Cyan

$healthRuleResult = aws elbv2 create-rule `
    --listener-arn $httpsListenerArn `
    --priority 30 `
    --conditions "Field=path-pattern,Values=/health" `
    --actions "Type=forward,TargetGroupArn=$BackendTargetGroupArn" `
    --profile $AwsProfile `
    --region $Region `
    --output json 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Regra /health criada" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Regra pode já existir ou erro: $healthRuleResult" -ForegroundColor Yellow
}

# ====================
# Summary
# ====================
Write-Host "`n" + "="*80 -ForegroundColor Green
Write-Host "  ALB LISTENERS CONFIGURADOS" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Green

Write-Host "`n📋 Configuração:" -ForegroundColor Yellow
Write-Host "  • HTTP:80 → Redirect HTTPS:443" -ForegroundColor White
if ($useHttps) {
    Write-Host "  • HTTPS:443 → Path routing" -ForegroundColor White
}
else {
    Write-Host "  • HTTP:443 → Path routing (temporário)" -ForegroundColor Yellow
}
Write-Host "`n  Routing Rules:" -ForegroundColor Cyan
Write-Host "    Priority 10: /store/*  → Backend TG" -ForegroundColor Gray
Write-Host "    Priority 20: /admin/*  → Backend TG" -ForegroundColor Gray
Write-Host "    Priority 30: /health   → Backend TG" -ForegroundColor Gray
Write-Host "    Default:     /*        → Storefront TG" -ForegroundColor Gray

if (-not $useHttps) {
    Write-Host "`n⚠️  ATENÇÃO: Usando HTTP na porta 443 (temporário)" -ForegroundColor Yellow
    Write-Host "   Para HTTPS:" -ForegroundColor Yellow
    Write-Host "   1. Criar certificado ACM para yellosolar.com" -ForegroundColor Gray
    Write-Host "   2. Validar via DNS" -ForegroundColor Gray
    Write-Host "   3. Re-executar este script" -ForegroundColor Gray
}

Write-Host "`n🔗 Próximo: Criar ECS Services" -ForegroundColor Cyan
Write-Host "  .\scripts\aws-create-ecs-services.ps1`n" -ForegroundColor White

Write-Host "="*80 -ForegroundColor Gray
