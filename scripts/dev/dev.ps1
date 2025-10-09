# =============================================================================
# Start Development Environment - Backend e Frontend
# =============================================================================

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host " YSH B2B - AMBIENTE DE DESENVOLVIMENTO" -ForegroundColor White
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar PostgreSQL e Redis
Write-Host "[1/3] Verificando infraestrutura..." -ForegroundColor Yellow
$pgRunning = docker ps --filter "name=postgres-dev" --format "{{.Names}}" 2>$null
$redisRunning = docker ps --filter "name=redis-dev" --format "{{.Names}}" 2>$null

if ($pgRunning) {
    Write-Host "  [OK] PostgreSQL rodando" -ForegroundColor Green
}
else {
    Write-Host "  [!] PostgreSQL nao encontrado" -ForegroundColor Red
    Write-Host "      Iniciando PostgreSQL..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml up -d postgres 2>$null
    Start-Sleep -Seconds 5
}

if ($redisRunning) {
    Write-Host "  [OK] Redis rodando" -ForegroundColor Green
}
else {
    Write-Host "  [!] Redis nao encontrado" -ForegroundColor Red
    Write-Host "      Iniciando Redis..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml up -d redis 2>$null
    Start-Sleep -Seconds 3
}

# Verificar .env
Write-Host ""
Write-Host "[2/3] Verificando configuracao..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "  [OK] Arquivo .env encontrado" -ForegroundColor Green
}
else {
    Write-Host "  [!] Arquivo .env nao encontrado" -ForegroundColor Red
}

# Iniciar serviços
Write-Host ""
Write-Host "[3/3] Iniciando servicos..." -ForegroundColor Yellow
Write-Host ""

# Backend
Write-Host "-> Iniciando BACKEND (Medusa API + Admin)..." -ForegroundColor Cyan
Write-Host "   Porta: 9000" -ForegroundColor Gray
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'BACKEND MEDUSA - DEV MODE' -ForegroundColor Cyan; Write-Host 'Porta: 9000' -ForegroundColor Gray; Write-Host ''; npm run dev"
Start-Sleep -Seconds 2
Write-Host "   [OK] Backend iniciado em nova janela" -ForegroundColor Green

# Frontend
Write-Host ""
Write-Host "-> Iniciando FRONTEND (Next.js Storefront)..." -ForegroundColor Cyan
Write-Host "   Porta: 8000" -ForegroundColor Gray
$frontendPath = Join-Path $PSScriptRoot "storefront"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'STOREFRONT - DEV MODE' -ForegroundColor Cyan; Write-Host 'Porta: 8000' -ForegroundColor Gray; Write-Host ''; npm run dev"
Start-Sleep -Seconds 2
Write-Host "   [OK] Frontend iniciado em nova janela" -ForegroundColor Green

# Informações
Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host " SERVICOS DISPONIVEIS" -ForegroundColor White
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API:    " -NoNewline; Write-Host "http://localhost:9000" -ForegroundColor Cyan
Write-Host "Backend Admin:  " -NoNewline; Write-Host "http://localhost:9000/app" -ForegroundColor Cyan
Write-Host "Health Check:   " -NoNewline; Write-Host "http://localhost:9000/health" -ForegroundColor Gray
Write-Host ""
Write-Host "Frontend Store: " -NoNewline; Write-Host "http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "PostgreSQL:     " -NoNewline; Write-Host "localhost:15432" -ForegroundColor Gray
Write-Host "Redis:          " -NoNewline; Write-Host "localhost:16379" -ForegroundColor Gray
Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[OK] Ambiente iniciado com sucesso!" -ForegroundColor Green
Write-Host "     Aguarde 30-60 segundos para os servicos ficarem prontos..." -ForegroundColor Yellow
Write-Host ""
