# Quick Test - PostHog Fix

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host " TESTE: PostHog Script Fix" -ForegroundColor White
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Arquivos modificados:" -ForegroundColor Yellow
Write-Host "  [OK] PostHogScript.tsx - Melhorado" -ForegroundColor Green
Write-Host "  [NEW] AnalyticsProvider.tsx - Criado" -ForegroundColor Green  
Write-Host "  [OK] layout.tsx - Atualizado" -ForegroundColor Green
Write-Host ""

Write-Host "Testando storefront..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing 2>$null
    if ($response.StatusCode -eq 200) {
        Write-Host "  Status: " -NoNewline
        Write-Host "ONLINE" -ForegroundColor Green
        Write-Host "  URL:    http://localhost:3000" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "O Next.js deve ter recompilado automaticamente." -ForegroundColor Gray
        Write-Host "Verifique o terminal do storefront para mensagens:" -ForegroundColor Gray
        Write-Host "  - Compiled successfully" -ForegroundColor Green
        Write-Host "  - ou erros de compilacao" -ForegroundColor Red
    }
}
catch {
    Write-Host "  Status: " -NoNewline
    Write-Host "OFFLINE ou ERRO" -ForegroundColor Red
    Write-Host ""
    Write-Host "Reinicie o storefront:" -ForegroundColor Yellow
    Write-Host "  1. Feche a janela do storefront (Ctrl+C)" -ForegroundColor Gray
    Write-Host "  2. cd storefront" -ForegroundColor Cyan
    Write-Host "  3. npm run dev" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
