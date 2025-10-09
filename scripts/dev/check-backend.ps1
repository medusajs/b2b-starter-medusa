# ============================================================================
# Check Backend Status
# ============================================================================

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " VERIFICANDO BACKEND" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Aguardando 10 segundos para inicializacao..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Testando endpoints..." -ForegroundColor Yellow
Write-Host ""

# Test 1: Health endpoint
Write-Host "[1] Health Check (9000/health)..." -NoNewline
try {
    $health = Invoke-WebRequest -Uri "http://localhost:9000/health" -TimeoutSec 3 -UseBasicParsing 2>$null
    if ($health.StatusCode -eq 200) {
        Write-Host " OK" -ForegroundColor Green
    }
}
catch {
    Write-Host " FALHOU" -ForegroundColor Red
    Write-Host "    Endpoint /health nao esta respondendo" -ForegroundColor Gray
}

# Test 2: Store API
Write-Host "[2] Store API (9000/store)..." -NoNewline
try {
    $store = Invoke-WebRequest -Uri "http://localhost:9000/store/regions" -TimeoutSec 3 -UseBasicParsing 2>$null
    if ($store.StatusCode -eq 200) {
        Write-Host " OK" -ForegroundColor Green
    }
}
catch {
    Write-Host " AGUARDANDO" -ForegroundColor Yellow
    Write-Host "    Backend pode ainda estar iniciando..." -ForegroundColor Gray
}

# Test 3: Admin API
Write-Host "[3] Admin API (9000/admin)..." -NoNewline
try {
    $admin = Invoke-WebRequest -Uri "http://localhost:9000/admin/auth" -TimeoutSec 3 -UseBasicParsing 2>$null
    Write-Host " OK (Status: $($admin.StatusCode))" -ForegroundColor Green
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host " OK (Requer autenticacao)" -ForegroundColor Green
    }
    else {
        Write-Host " AGUARDANDO" -ForegroundColor Yellow
    }
}

# Check port
Write-Host ""
Write-Host "Verificando porta 9000..." -ForegroundColor Yellow
$port9000 = netstat -ano | findstr ":9000 " | findstr "LISTENING"
if ($port9000) {
    Write-Host "  [OK] Porta 9000 em uso" -ForegroundColor Green
    Write-Host "  Backend esta rodando!" -ForegroundColor Green
}
else {
    Write-Host "  [!] Porta 9000 nao esta em uso" -ForegroundColor Red
    Write-Host "  Verifique a janela do terminal do backend para erros" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
