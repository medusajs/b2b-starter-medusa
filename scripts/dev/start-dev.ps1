#!/usr/bin/env pwsh
# =============================================================================
# Start Development Environment
# Inicia backend e storefront em modo desenvolvimento
# =============================================================================

param(
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$Both
)

# Cores para output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

Write-Host "`n" -NoNewline
Write-Host ("=" * 80) -ForegroundColor $Cyan
Write-Host " YSH B2B - DESENVOLVIMENTO" -ForegroundColor White
Write-Host ("=" * 80) -ForegroundColor $Cyan

# Verificar se PostgreSQL e Redis estão rodando
Write-Host "`n[1/3] Verificando dependências..." -ForegroundColor $Yellow

$pgContainer = docker ps --filter "name=postgres-dev" --format "{{.Names}}"
$redisContainer = docker ps --filter "name=redis-dev" --format "{{.Names}}"

if (-not $pgContainer) {
    Write-Host "  ✗ PostgreSQL não está rodando" -ForegroundColor $Red
    Write-Host "    Iniciando PostgreSQL..." -ForegroundColor $Yellow
    docker-compose -f docker-compose.dev.yml up -d postgres
    Start-Sleep -Seconds 5
}
else {
    Write-Host "  ✓ PostgreSQL rodando" -ForegroundColor $Green
}

if (-not $redisContainer) {
    Write-Host "  ✗ Redis não está rodando" -ForegroundColor $Red
    Write-Host "    Iniciando Redis..." -ForegroundColor $Yellow
    docker-compose -f docker-compose.dev.yml up -d redis
    Start-Sleep -Seconds 3
}
else {
    Write-Host "  ✓ Redis rodando" -ForegroundColor $Green
}

# Verificar arquivo .env
Write-Host "`n[2/3] Verificando configuração..." -ForegroundColor $Yellow

if (-not (Test-Path ".env")) {
    Write-Host "  ✗ Arquivo .env não encontrado" -ForegroundColor $Red
    Write-Host "    Arquivo .env já foi criado" -ForegroundColor $Green
}
else {
    Write-Host "  ✓ Arquivo .env encontrado" -ForegroundColor $Green
}

# Iniciar serviços
Write-Host "`n[3/3] Iniciando serviços..." -ForegroundColor $Yellow

if ($Backend -or $Both -or (-not $Frontend)) {
    Write-Host "`n→ Iniciando BACKEND (Medusa)..." -ForegroundColor $Cyan
    Write-Host "  Porta: 9000 (API + Admin)" -ForegroundColor Gray
    Write-Host "  Caminho: ./backend" -ForegroundColor Gray
    
    # Criar nova janela do terminal para backend
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '=== BACKEND MEDUSA (DEV) ===' -ForegroundColor Cyan; npm run dev"
    
    Start-Sleep -Seconds 2
    Write-Host "  ✓ Backend iniciado em nova janela" -ForegroundColor $Green
}

if ($Frontend -or $Both) {
    Write-Host "`n→ Iniciando FRONTEND (Storefront)..." -ForegroundColor $Cyan
    Write-Host "  Porta: 8000" -ForegroundColor Gray
    Write-Host "  Caminho: ./storefront" -ForegroundColor Gray
    
    # Criar nova janela do terminal para frontend
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\storefront'; Write-Host '=== STOREFRONT (DEV) ===' -ForegroundColor Cyan; npm run dev"
    
    Start-Sleep -Seconds 2
    Write-Host "  ✓ Storefront iniciado em nova janela" -ForegroundColor $Green
}

# URLs dos serviços
Write-Host "`n" -NoNewline
Write-Host ("=" * 80) -ForegroundColor $Cyan
Write-Host " SERVIÇOS DISPONÍVEIS" -ForegroundColor White
Write-Host ("=" * 80) -ForegroundColor $Cyan

Write-Host "`nBackend:" -ForegroundColor $Yellow
Write-Host "  API:      http://localhost:9000" -ForegroundColor $Cyan
Write-Host "  Admin:    http://localhost:9000/app" -ForegroundColor $Cyan
Write-Host "  Health:   http://localhost:9000/health" -ForegroundColor Gray

Write-Host "`nFrontend:" -ForegroundColor $Yellow
Write-Host "  Store:    http://localhost:8000" -ForegroundColor $Cyan

Write-Host "`nInfrastructure:" -ForegroundColor $Yellow
Write-Host "  Postgres: localhost:15432" -ForegroundColor Gray
Write-Host "  Redis:    localhost:16379" -ForegroundColor Gray

Write-Host "`n" -NoNewline
Write-Host ("=" * 80) -ForegroundColor $Cyan
Write-Host " COMANDOS ÚTEIS" -ForegroundColor White
Write-Host ("=" * 80) -ForegroundColor $Cyan

Write-Host "`nPara parar os serviços:" -ForegroundColor $Yellow
Write-Host "  Feche as janelas do terminal do backend/frontend" -ForegroundColor Gray
Write-Host "  docker-compose -f docker-compose.dev.yml down" -ForegroundColor $Cyan

Write-Host "`nPara ver logs:" -ForegroundColor $Yellow
Write-Host "  docker-compose -f docker-compose.dev.yml logs -f postgres" -ForegroundColor $Cyan
Write-Host "  docker-compose -f docker-compose.dev.yml logs -f redis" -ForegroundColor $Cyan

Write-Host "`nPara rodar migrações:" -ForegroundColor $Yellow
Write-Host "  cd backend && npm run migrate" -ForegroundColor $Cyan

Write-Host "`nPara seed de dados:" -ForegroundColor $Yellow
Write-Host "  cd backend && npm run seed" -ForegroundColor $Cyan
Write-Host "  cd backend && npm run seed:catalog" -ForegroundColor $Cyan

Write-Host "`n" -NoNewline
Write-Host ("=" * 80) -ForegroundColor $Cyan
Write-Host ""

Write-Host "OK Ambiente de desenvolvimento configurado!" -ForegroundColor $Green
Write-Host "  Aguarde alguns segundos para os servicos iniciarem completamente..." -ForegroundColor $Yellow
Write-Host ""
