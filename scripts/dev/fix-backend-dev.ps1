#!/usr/bin/env pwsh
# =============================================================================
# Fix Backend Development Container
# Workaround para problema do Rollup no Alpine Linux
# =============================================================================

param(
    [switch]$UseWSL,
    [switch]$ForceRebuild
)

$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

Write-Host "`n" -NoNewline
Write-Host ("=" * 80) -ForegroundColor $Cyan
Write-Host " FIX BACKEND DEV CONTAINER" -ForegroundColor White
Write-Host ("=" * 80) -ForegroundColor $Cyan

# Verificar se estamos no diretório correto
$currentDir = Get-Location
if ($currentDir.Path -notmatch "ysh-store$") {
    Write-Host "`n[1/5] Navegando para ysh-store..." -ForegroundColor $Yellow
    Set-Location "C:\Users\fjuni\ysh_medusa\ysh-store"
}
else {
    Write-Host "`n[1/5] Diretório correto ✓" -ForegroundColor $Green
}

# Parar backend atual
Write-Host "`n[2/5] Parando backend..." -ForegroundColor $Yellow
docker-compose -f docker-compose.dev.yml stop backend
docker-compose -f docker-compose.dev.yml rm -f backend
Write-Host "  ✓ Backend parado e removido" -ForegroundColor $Green

if ($UseWSL) {
    # Usar WSL para build (melhor compatibilidade)
    Write-Host "`n[3/5] Construindo com WSL (melhor compatibilidade)..." -ForegroundColor $Yellow
    
    # Converter caminho Windows para WSL
    $wslPath = "/mnt/c/Users/fjuni/ysh_medusa/ysh-store"
    
    Write-Host "  → Executando docker build via WSL..." -ForegroundColor $Cyan
    
    if ($ForceRebuild) {
        wsl bash -c "cd $wslPath && docker build --no-cache -f backend/Dockerfile.dev -t ysh-store-backend:latest backend"
    }
    else {
        wsl bash -c "cd $wslPath && docker build -f backend/Dockerfile.dev -t ysh-store-backend:latest backend"
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Build via WSL concluído" -ForegroundColor $Green
    }
    else {
        Write-Host "  ✗ Erro no build via WSL" -ForegroundColor $Red
        Write-Host "  → Tentando método alternativo..." -ForegroundColor $Yellow
        $UseWSL = $false
    }
}

if (-not $UseWSL) {
    # Build padrão com Docker Desktop
    Write-Host "`n[3/5] Construindo backend..." -ForegroundColor $Yellow
    
    if ($ForceRebuild) {
        docker-compose -f docker-compose.dev.yml build --no-cache backend
    }
    else {
        docker-compose -f docker-compose.dev.yml build backend
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Build concluído" -ForegroundColor $Green
    }
    else {
        Write-Host "  ✗ Erro no build" -ForegroundColor $Red
        exit 1
    }
}

# Iniciar backend
Write-Host "`n[4/5] Iniciando backend..." -ForegroundColor $Yellow
docker-compose -f docker-compose.dev.yml up -d backend

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Backend iniciado" -ForegroundColor $Green
}
else {
    Write-Host "  ✗ Erro ao iniciar backend" -ForegroundColor $Red
    exit 1
}

# Aguardar alguns segundos
Write-Host "`n[5/5] Aguardando inicialização..." -ForegroundColor $Yellow
Start-Sleep -Seconds 10

# Verificar logs
Write-Host "`n" -NoNewline
Write-Host ("=" * 80) -ForegroundColor $Cyan
Write-Host " STATUS DO BACKEND" -ForegroundColor White
Write-Host ("=" * 80) -ForegroundColor $Cyan

$status = docker ps --filter "name=ysh-b2b-backend-dev" --format "{{.Status}}"
if ($status) {
    Write-Host "`n✓ Backend rodando: $status" -ForegroundColor $Green
    
    Write-Host "`nÚltimos logs:" -ForegroundColor $Yellow
    docker logs ysh-b2b-backend-dev --tail 20
    
    Write-Host "`n" -NoNewline
    Write-Host ("=" * 80) -ForegroundColor $Cyan
    Write-Host " SERVIÇOS DISPONÍVEIS" -ForegroundColor White
    Write-Host ("=" * 80) -ForegroundColor $Cyan
    
    Write-Host "`nBackend API:  http://localhost:9000" -ForegroundColor $Cyan
    Write-Host "Admin Panel:  http://localhost:9000/app" -ForegroundColor $Cyan
    Write-Host "Health Check: http://localhost:9000/health" -ForegroundColor $Cyan
    
    Write-Host "`nPara ver logs completos:" -ForegroundColor $Yellow
    Write-Host "  docker-compose -f docker-compose.dev.yml logs -f backend" -ForegroundColor $Gray
}
else {
    Write-Host "`n✗ Backend não está rodando" -ForegroundColor $Red
    Write-Host "`nLogs de erro:" -ForegroundColor $Yellow
    docker logs ysh-b2b-backend-dev --tail 50
    exit 1
}

Write-Host "`n" -NoNewline
Write-Host ("=" * 80) -ForegroundColor $Cyan
Write-Host ""

