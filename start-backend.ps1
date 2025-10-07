# ============================================================================
# Iniciar apenas o Backend (Medusa)
# ============================================================================

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host " INICIANDO BACKEND MEDUSA" -ForegroundColor White
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Verificar infraestrutura
$postgres = docker ps --filter "name=postgres-dev" --format "{{.Names}}" 2>$null
$redis = docker ps --filter "name=redis-dev" --format "{{.Names}}" 2>$null

if (-not $postgres) {
    Write-Host "Iniciando PostgreSQL..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml up -d postgres
    Start-Sleep -Seconds 5
}

if (-not $redis) {
    Write-Host "Iniciando Redis..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml up -d redis
    Start-Sleep -Seconds 3
}

Write-Host "Infraestrutura OK" -ForegroundColor Green
Write-Host ""

# Iniciar backend
Write-Host "Iniciando Backend em nova janela..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$backendPath'; Write-Host 'BACKEND MEDUSA - DEV MODE' -ForegroundColor Cyan; Write-Host 'Porta: 9000' -ForegroundColor Gray; Write-Host ''; npm run dev"
)

Write-Host ""
Write-Host "Backend iniciando..." -ForegroundColor Green
Write-Host "  Porta: 9000" -ForegroundColor Gray
Write-Host "  API:   http://localhost:9000" -ForegroundColor Cyan
Write-Host "  Admin: http://localhost:9000/app" -ForegroundColor Cyan
Write-Host ""
Write-Host "Aguarde 30-60 segundos para o backend ficar pronto..." -ForegroundColor Yellow
Write-Host ""
