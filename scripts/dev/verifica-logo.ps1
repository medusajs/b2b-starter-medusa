# Script de Verificação do Logo Yello Solar Hub
# Abre o storefront no navegador para visualização do logo com degradê

Write-Host "🌞 Verificando Logo Yello Solar Hub..." -ForegroundColor Yellow
Write-Host ""

# Verificar status dos containers
Write-Host "📦 Status dos Containers:" -ForegroundColor Cyan
docker ps --filter "name=ysh-b2b" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Out-String | Write-Host

Write-Host ""
Write-Host "🔍 Testando conectividade..." -ForegroundColor Cyan

# Testar backend
try {
    $backend = Invoke-WebRequest -Uri "http://localhost:9000/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Backend: " -NoNewline -ForegroundColor Green
    Write-Host "OK (Status: $($backend.StatusCode))"
}
catch {
    Write-Host "❌ Backend: " -NoNewline -ForegroundColor Red
    Write-Host "ERRO - $($_.Exception.Message)"
}

# Testar storefront
try {
    $storefront = Invoke-WebRequest -Uri "http://localhost:8000" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Storefront: " -NoNewline -ForegroundColor Green
    Write-Host "OK (Status: $($storefront.StatusCode))"
}
catch {
    Write-Host "❌ Storefront: " -NoNewline -ForegroundColor Red
    Write-Host "ERRO - $($_.Exception.Message)"
}

Write-Host ""
Write-Host "🎨 Localizações do Logo com Degradê:" -ForegroundColor Yellow
Write-Host "   1. Navegação (topo esquerdo)" -ForegroundColor White
Write-Host "   2. Footer (rodapé com ícone + texto)" -ForegroundColor White
Write-Host "   3. Checkout (página de pagamento)" -ForegroundColor White

Write-Host ""
Write-Host "🌈 Degradê 'Sunshine' Implementado:" -ForegroundColor Yellow
Write-Host "   🟡 Centro:  Amarelo (#FDD835)" -ForegroundColor White
Write-Host "   🟠 Meio:    Laranja (#FF9800)" -ForegroundColor White
Write-Host "   🔴 Borda:   Rosa/Vermelho (#FF5252)" -ForegroundColor White

Write-Host ""
Write-Host "📝 Credenciais de Admin:" -ForegroundColor Cyan
Write-Host "   Email: admin@ysh.solar" -ForegroundColor White
Write-Host "   Senha: Ysh2025Admin!" -ForegroundColor White
Write-Host "   Admin Panel: http://localhost:9000/app" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Abrindo storefront no navegador..." -ForegroundColor Green
Start-Sleep -Seconds 2
Start-Process "http://localhost:8000"

Write-Host ""
Write-Host "Como inspecionar o degrade:" -ForegroundColor Yellow
Write-Host "   1. Abra DevTools (F12)" -ForegroundColor White
Write-Host "   2. Clique com botao direito no logo" -ForegroundColor White
Write-Host "   3. Selecione Inspecionar" -ForegroundColor White
Write-Host "   4. Procure por radialGradient no codigo SVG" -ForegroundColor White

Write-Host ""
Write-Host "Documentacao completa: LOGO_YELLO_IMPLEMENTACAO.md" -ForegroundColor Cyan
Write-Host ""
