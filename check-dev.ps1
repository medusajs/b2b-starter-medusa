# Quick check script
Write-Host ""
Write-Host "Verificando servicos..." -ForegroundColor Yellow
Write-Host ""

# Backend
Write-Host "Backend (http://localhost:9000)..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9000/health" -TimeoutSec 3 -UseBasicParsing 2>$null
    if ($response.StatusCode -eq 200) {
        Write-Host " [OK]" -ForegroundColor Green
    }
    else {
        Write-Host " [AGUARDANDO]" -ForegroundColor Yellow
    }
}
catch {
    Write-Host " [INICIANDO...]" -ForegroundColor Yellow
    Write-Host "  (O backend pode levar 30-60 segundos para iniciar)" -ForegroundColor Gray
}

# Frontend
Write-Host "Frontend (http://localhost:8000)..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000" -TimeoutSec 3 -UseBasicParsing 2>$null
    if ($response.StatusCode -eq 200) {
        Write-Host " [OK]" -ForegroundColor Green
    }
    else {
        Write-Host " [AGUARDANDO]" -ForegroundColor Yellow
    }
}
catch {
    Write-Host " [INICIANDO...]" -ForegroundColor Yellow
    Write-Host "  (O frontend pode levar 20-30 segundos para iniciar)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Dica: Use 'netstat -ano | findstr :9000' para verificar a porta 9000" -ForegroundColor Gray
Write-Host "Dica: Use 'netstat -ano | findstr :8000' para verificar a porta 8000" -ForegroundColor Gray
Write-Host ""
