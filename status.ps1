# ============================================================================
# Status Rápido - Ambiente de Desenvolvimento
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " STATUS DO AMBIENTE DE DESENVOLVIMENTO" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Backend
Write-Host "BACKEND (Medusa):" -ForegroundColor Yellow
try {
    $backend = Invoke-WebRequest -Uri "http://localhost:9000/health" -TimeoutSec 2 -UseBasicParsing 2>$null
    if ($backend.StatusCode -eq 200) {
        Write-Host "  Status: " -NoNewline; Write-Host "ONLINE" -ForegroundColor Green
        Write-Host "  URL:    http://localhost:9000" -ForegroundColor Cyan
        Write-Host "  Admin:  http://localhost:9000/app" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "  Status: " -NoNewline; Write-Host "OFFLINE" -ForegroundColor Red
}

Write-Host ""

# Frontend
Write-Host "FRONTEND (Storefront):" -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing 2>$null
    if ($frontend.StatusCode -eq 200) {
        Write-Host "  Status: " -NoNewline; Write-Host "ONLINE" -ForegroundColor Green
        Write-Host "  URL:    http://localhost:3000" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "  Status: " -NoNewline; Write-Host "OFFLINE" -ForegroundColor Red
}

Write-Host ""

# Infraestrutura
Write-Host "INFRAESTRUTURA:" -ForegroundColor Yellow
$postgres = docker ps --filter "name=postgres-dev" --format "{{.Names}}" 2>$null
$redis = docker ps --filter "name=redis-dev" --format "{{.Names}}" 2>$null

if ($postgres) {
    Write-Host "  PostgreSQL: " -NoNewline; Write-Host "RODANDO" -ForegroundColor Green -NoNewline
    Write-Host " (localhost:15432)" -ForegroundColor Gray
}
else {
    Write-Host "  PostgreSQL: " -NoNewline; Write-Host "PARADO" -ForegroundColor Red
}

if ($redis) {
    Write-Host "  Redis:      " -NoNewline; Write-Host "RODANDO" -ForegroundColor Green -NoNewline
    Write-Host " (localhost:16379)" -ForegroundColor Gray
}
else {
    Write-Host "  Redis:      " -NoNewline; Write-Host "PARADO" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar processos Node
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $count = ($nodeProcesses | Measure-Object).Count
    Write-Host "Processos Node.js ativos: $count" -ForegroundColor Gray
}

Write-Host ""
