# ==========================================
# Full Automated Deployment Pipeline
# Executa toda a sequencia apos stack complete
# Uso: .\scripts\aws-full-deployment.ps1
# ==========================================

param(
    [string]$AwsProfile = "ysh-production",
    [string]$Region = "us-east-1"
)

$ErrorActionPreference = "Stop"
$Host.UI.RawUI.WindowTitle = "Full AWS Deployment"

Write-Host "`n" + "="*80 -ForegroundColor Blue
Write-Host "  FULL AUTOMATED DEPLOYMENT PIPELINE" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Blue
Write-Host "`nProfile: $AwsProfile" -ForegroundColor Cyan
Write-Host "Region: $Region`n" -ForegroundColor Cyan

$startTime = Get-Date

# Funcao helper
function Write-Step {
    param([string]$Message)
    Write-Host "`n" + "="*80 -ForegroundColor Magenta
    Write-Host "  $Message" -ForegroundColor White
    Write-Host "="*80 -ForegroundColor Magenta
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[!!] $Message" -ForegroundColor Red
}

try {
    # STEP 1: Validar Stack
    Write-Step "STEP 1/7: Validando CloudFormation Stack"
    
    $stackStatus = (aws cloudformation describe-stacks `
            --stack-name ysh-b2b-infrastructure `
            --profile $AwsProfile `
            --region $Region `
            --query 'Stacks[0].StackStatus' `
            --output text)
    
    if ($stackStatus -ne "CREATE_COMPLETE") {
        Write-Error "Stack status: $stackStatus (esperado CREATE_COMPLETE)"
        exit 1
    }
    
    Write-Success "Stack status: CREATE_COMPLETE"
    
    # STEP 2: Post-Stack Configuration
    Write-Step "STEP 2/7: Post-Stack Configuration (Secrets + Task Definitions)"
    
    & .\scripts\aws-deploy-post-stack.ps1 -AwsProfile $AwsProfile -Region $Region
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Post-stack configuration falhou"
        exit 1
    }
    
    Write-Success "Secrets criados e task definitions registradas"
    
    # STEP 3: Target Groups
    Write-Step "STEP 3/7: Criando Target Groups"
    
    & .\scripts\aws-create-target-groups.ps1 -AwsProfile $AwsProfile -Region $Region
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Target groups creation falhou"
        exit 1
    }
    
    Write-Success "Target groups criados"
    
    # STEP 4: ALB Listeners
    Write-Step "STEP 4/7: Configurando ALB Listeners"
    
    & .\scripts\aws-create-alb-listeners.ps1 -AwsProfile $AwsProfile -Region $Region
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "ALB listeners configuration falhou"
        exit 1
    }
    
    Write-Success "ALB listeners configurados"
    
    # STEP 5: ECS Services
    Write-Step "STEP 5/7: Criando ECS Services"
    
    & .\scripts\aws-create-ecs-services.ps1 -AwsProfile $AwsProfile -Region $Region
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "ECS services creation falhou"
        exit 1
    }
    
    Write-Success "ECS services criados"
    
    # STEP 6: Database Initialization
    Write-Step "STEP 6/7: Inicializando Database (Migrations + Seed)"
    
    Write-Host "Aguardando services estabilizarem (60s)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60
    
    & .\scripts\aws-db-init.ps1 -AwsProfile $AwsProfile -Region $Region
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Database initialization falhou"
        exit 1
    }
    
    Write-Success "Database inicializado"
    
    # STEP 7: Validation
    Write-Step "STEP 7/7: Validacao Final"
    
    # Get ALB DNS
    $albDns = (aws cloudformation describe-stacks `
            --stack-name ysh-b2b-infrastructure `
            --profile $AwsProfile `
            --region $Region `
            --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' `
            --output text)
    
    Write-Host "`nTestando endpoints..." -ForegroundColor Cyan
    
    # Test backend health
    try {
        $response = Invoke-WebRequest -Uri "http://$albDns/health" -TimeoutSec 30 -UseBasicParsing
        Write-Success "Backend health check: $($response.StatusCode)"
    }
    catch {
        Write-Error "Backend health check falhou: $_"
    }
    
    # Test storefront
    try {
        $response = Invoke-WebRequest -Uri "http://$albDns/" -TimeoutSec 30 -UseBasicParsing
        Write-Success "Storefront home: $($response.StatusCode)"
    }
    catch {
        Write-Error "Storefront home falhou: $_"
    }
    
    # SUMMARY
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-Host "`n" + "="*80 -ForegroundColor Green
    Write-Host "  DEPLOYMENT COMPLETO!" -ForegroundColor White
    Write-Host "="*80 -ForegroundColor Green
    
    Write-Host "`nTempo total: $($duration.ToString('mm\:ss'))" -ForegroundColor Cyan
    Write-Host "ALB DNS: http://$albDns" -ForegroundColor Cyan
    Write-Host "`nAcessar:" -ForegroundColor Yellow
    Write-Host "  Backend:    http://$albDns/health" -ForegroundColor White
    Write-Host "  Storefront: http://$albDns/" -ForegroundColor White
    Write-Host "  Admin:      http://$albDns/app" -ForegroundColor White
    
    Write-Host "`nProximo: Seguir PRE_FLIGHT_CHECKLIST.md para validacao completa`n" -ForegroundColor Cyan
}
catch {
    Write-Host "`n" + "="*80 -ForegroundColor Red
    Write-Host "  DEPLOYMENT FALHOU!" -ForegroundColor White
    Write-Host "="*80 -ForegroundColor Red
    Write-Host "`nErro: $_" -ForegroundColor Red
    Write-Host "`nStack trace:" -ForegroundColor Gray
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    exit 1
}
