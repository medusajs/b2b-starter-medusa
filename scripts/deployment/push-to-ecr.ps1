# ==========================================
# Script para Push das Imagens para AWS ECR
# ==========================================

param(
    [string]$Profile = "ysh-production",
    [string]$Region = "us-east-1",
    [string]$AccountId = "773235999227"
)

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║     🚀 PUSHING TO AWS ECR - YSH B2B                            ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

$ecrUrl = "$AccountId.dkr.ecr.$Region.amazonaws.com"

# ==========================================
# 1. LOGIN TO ECR
# ==========================================

Write-Host "🔐 Step 1/3: Authenticating with AWS ECR...`n" -ForegroundColor Cyan

try {
    Write-Host "  Profile: $Profile" -ForegroundColor Gray
    Write-Host "  Region: $Region" -ForegroundColor Gray
    Write-Host "  ECR URL: $ecrUrl`n" -ForegroundColor Gray
    
    $password = aws ecr get-login-password --region $Region --profile $Profile
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to get ECR login password"
    }
    
    $password | docker login --username AWS --password-stdin $ecrUrl
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to login to ECR"
    }
    
    Write-Host "✅ ECR Login SUCCESS!`n" -ForegroundColor Green
}
catch {
    Write-Host "❌ ECR Login FAILED: $_`n" -ForegroundColor Red
    exit 1
}

# ==========================================
# 2. TAG AND PUSH BACKEND
# ==========================================

Write-Host "📦 Step 2/3: Pushing BACKEND image...`n" -ForegroundColor Cyan

try {
    $backendImage = "ysh-b2b-backend:latest"
    $backendEcrImage = "$ecrUrl/ysh-b2b-backend:latest"
    
    Write-Host "  Tagging: $backendImage -> $backendEcrImage" -ForegroundColor Gray
    docker tag $backendImage $backendEcrImage
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to tag backend image"
    }
    
    Write-Host "  Pushing to ECR..." -ForegroundColor Gray
    docker push $backendEcrImage
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to push backend image"
    }
    
    Write-Host "✅ Backend image pushed SUCCESS!`n" -ForegroundColor Green
}
catch {
    Write-Host "❌ Backend push FAILED: $_`n" -ForegroundColor Red
    exit 1
}

# ==========================================
# 3. TAG AND PUSH STOREFRONT
# ==========================================

Write-Host "📦 Step 3/3: Pushing STOREFRONT image...`n" -ForegroundColor Cyan

try {
    $storefrontImage = "ysh-b2b-storefront:latest"
    $storefrontEcrImage = "$ecrUrl/ysh-b2b-storefront:latest"
    
    Write-Host "  Tagging: $storefrontImage -> $storefrontEcrImage" -ForegroundColor Gray
    docker tag $storefrontImage $storefrontEcrImage
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to tag storefront image"
    }
    
    Write-Host "  Pushing to ECR..." -ForegroundColor Gray
    docker push $storefrontEcrImage
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to push storefront image"
    }
    
    Write-Host "✅ Storefront image pushed SUCCESS!`n" -ForegroundColor Green
}
catch {
    Write-Host "❌ Storefront push FAILED: $_`n" -ForegroundColor Red
    exit 1
}

# ==========================================
# 4. VERIFY IMAGES IN ECR
# ==========================================

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║     ✅ PUSH COMPLETO - Imagens no AWS ECR                     ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "🔍 Verificando imagens no ECR:`n" -ForegroundColor Cyan

Write-Host "Backend:" -ForegroundColor White
aws ecr describe-images --repository-name ysh-b2b-backend --region $Region --profile $Profile --query 'sort_by(imageDetails,& imagePushedAt)[-1].[imageTags[0],imageSizeInBytes,imagePushedAt]' --output table 2>$null

Write-Host "`nStorefront:" -ForegroundColor White
aws ecr describe-images --repository-name ysh-b2b-storefront --region $Region --profile $Profile --query 'sort_by(imageDetails,& imagePushedAt)[-1].[imageTags[0],imageSizeInBytes,imagePushedAt]' --output table 2>$null

Write-Host "`n📋 URIs das imagens:" -ForegroundColor Cyan
Write-Host "  Backend:    $backendEcrImage" -ForegroundColor Gray
Write-Host "  Storefront: $storefrontEcrImage`n" -ForegroundColor Gray

Write-Host "✅ Próximo passo: Criar ECS Task Definitions e Services`n" -ForegroundColor Green
