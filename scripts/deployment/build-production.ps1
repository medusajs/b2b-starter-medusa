# ==========================================
# Script para Build das Imagens de Produção
# ==========================================

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║     🚀 BUILDING PRODUCTION IMAGES - YSH B2B                    ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

# ==========================================
# 1. BUILD BACKEND
# ==========================================

Write-Host "📦 Step 1/2: Building BACKEND...`n" -ForegroundColor Cyan

Push-Location "$PSScriptRoot\backend"

try {
    Write-Host "📍 Diretório: $(Get-Location)" -ForegroundColor Gray
    Write-Host "📄 Dockerfile: $(Test-Path Dockerfile)`n" -ForegroundColor Gray
    
    $startBackend = Get-Date
    
    Write-Host "🔨 Executando docker build..." -ForegroundColor Yellow
    docker build -t ysh-b2b-backend:latest .
    
    if ($LASTEXITCODE -ne 0) {
        throw "Backend build failed with exit code $LASTEXITCODE"
    }
    
    $durationBackend = ((Get-Date) - $startBackend).TotalSeconds
    $durationStr = [math]::Round($durationBackend, 1)
    Write-Host "`n✅ Backend build SUCCESS! ($durationStr s)`n" -ForegroundColor Green
}
catch {
    Write-Host "`n❌ Backend build FAILED: $_`n" -ForegroundColor Red
    Pop-Location
    exit 1
}
finally {
    Pop-Location
}

# ==========================================
# 2. BUILD STOREFRONT
# ==========================================

Write-Host "📦 Step 2/2: Building STOREFRONT...`n" -ForegroundColor Cyan

Push-Location "$PSScriptRoot\storefront"

try {
    Write-Host "📍 Diretório: $(Get-Location)" -ForegroundColor Gray
    Write-Host "📄 Dockerfile: $(Test-Path Dockerfile)`n" -ForegroundColor Gray
    
    $startStorefront = Get-Date
    
    Write-Host "🔨 Executando docker build..." -ForegroundColor Yellow
    docker build -t ysh-b2b-storefront:latest .
    
    if ($LASTEXITCODE -ne 0) {
        throw "Storefront build failed with exit code $LASTEXITCODE"
    }
    
    $durationStorefront = ((Get-Date) - $startStorefront).TotalSeconds
    $durationStr = [math]::Round($durationStorefront, 1)
    Write-Host "`n✅ Storefront build SUCCESS! ($durationStr s)`n" -ForegroundColor Green
}
catch {
    Write-Host "`n❌ Storefront build FAILED: $_`n" -ForegroundColor Red
    Pop-Location
    exit 1
}
finally {
    Pop-Location
}

# ==========================================
# 3. SUMMARY
# ==========================================

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║     ✅ BUILD COMPLETO - Imagens Prontas para Push             ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📊 IMAGENS CRIADAS:" -ForegroundColor Cyan
Write-Host "  • ysh-b2b-backend:latest" -ForegroundColor White
Write-Host "  • ysh-b2b-storefront:latest`n" -ForegroundColor White

Write-Host "🔍 Verificando imagens:`n" -ForegroundColor Cyan
docker images | Select-String "ysh-b2b"

Write-Host "`n✅ Próximo passo: Execute .\push-to-ecr.ps1 para enviar para AWS`n" -ForegroundColor Green
