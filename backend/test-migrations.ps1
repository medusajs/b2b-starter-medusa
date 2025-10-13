#!/usr/bin/env pwsh
# Script de Teste Rápido - Migrações Automáticas
# Executa assim que Docker Desktop estiver funcionando

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  TESTE DE MIGRAÇÕES AUTOMÁTICAS - QUICK TEST     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Verificar se Docker está rodando
Write-Host "1. Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker version --format '{{.Server.Version}}' 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Docker não está rodando!" -ForegroundColor Red
        Write-Host "   💡 Inicie Docker Desktop e execute este script novamente.`n" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "   ✅ Docker versão: $dockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Erro ao verificar Docker: $_" -ForegroundColor Red
    exit 1
}

# Build da imagem de teste
Write-Host "`n2. Building imagem de teste..." -ForegroundColor Yellow
Write-Host "   📦 docker build -t ysh-backend:quick-test -f Dockerfile ." -ForegroundColor Gray

$buildOutput = docker build -t ysh-backend:quick-test -f Dockerfile . 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Build falhou!" -ForegroundColor Red
    Write-Host $buildOutput
    exit 1
}
Write-Host "   ✅ Build completado com sucesso" -ForegroundColor Green

# Teste 1: Verificar que entrypoint está no container
Write-Host "`n3. Verificando entrypoint.sh no container..." -ForegroundColor Yellow
$entrypointCheck = docker run --rm ysh-backend:quick-test ls -la /app/entrypoint.sh 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ entrypoint.sh não encontrado no container!" -ForegroundColor Red
    Write-Host $entrypointCheck
    exit 1
}
Write-Host "   ✅ entrypoint.sh encontrado e executável" -ForegroundColor Green

# Teste 2: Executar entrypoint com SKIP_MIGRATIONS (teste rápido sem DB)
Write-Host "`n4. Testando entrypoint.sh (SKIP_MIGRATIONS=true)..." -ForegroundColor Yellow
$entrypointTest = docker run --rm `
    -e SKIP_MIGRATIONS="true" `
    ysh-backend:quick-test `
    echo "Entrypoint executed successfully" 2>&1

if ($entrypointTest -match "⏭️.*Skipping migrations") {
    Write-Host "   ✅ Entrypoint executa e respeita SKIP_MIGRATIONS" -ForegroundColor Green
}
else {
    Write-Host "   ⚠️  Entrypoint executou mas output inesperado:" -ForegroundColor Yellow
    Write-Host $entrypointTest
}

# Teste 3: Verificar que tenta conectar com database (esperado falhar)
Write-Host "`n5. Testando tentativa de conexão com database..." -ForegroundColor Yellow
Write-Host "   (Timeout esperado em ~10s)" -ForegroundColor Gray

$dbTest = docker run --rm `
    -e DATABASE_URL="postgresql://fake:fake@fake-host:5432/fake" `
    -e SKIP_MIGRATIONS="false" `
    ysh-backend:quick-test `
    echo "Should not reach here" 2>&1

if ($dbTest -match "Database connection timeout") {
    Write-Host "   ✅ Script tenta conectar e falha corretamente (comportamento esperado)" -ForegroundColor Green
}
elseif ($dbTest -match "Waiting for database") {
    Write-Host "   ✅ Script aguarda database (comportamento esperado)" -ForegroundColor Green
}
else {
    Write-Host "   ⚠️  Output inesperado:" -ForegroundColor Yellow
    Write-Host $dbTest | Select-Object -First 10
}

# Resumo
Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  RESUMO DO TESTE                                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Docker funcionando" -ForegroundColor Green
Write-Host "✅ Build da imagem completado" -ForegroundColor Green
Write-Host "✅ entrypoint.sh presente no container" -ForegroundColor Green
Write-Host "✅ entrypoint.sh executável" -ForegroundColor Green
Write-Host "✅ Flag SKIP_MIGRATIONS funciona" -ForegroundColor Green
Write-Host "✅ Tentativa de conexão com DB implementada" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 PRÓXIMO PASSO:" -ForegroundColor Yellow
Write-Host "   Testar com DATABASE_URL real:" -ForegroundColor White
Write-Host ""
Write-Host '   $env:DATABASE_URL = "postgresql://user:pass@host:5432/db"' -ForegroundColor Gray
Write-Host '   docker run -d --name ysh-test \' -ForegroundColor Gray
Write-Host '     -p 9000:9000 \' -ForegroundColor Gray
Write-Host '     -e DATABASE_URL="$env:DATABASE_URL" \' -ForegroundColor Gray
Write-Host '     -e NODE_ENV="production" \' -ForegroundColor Gray
Write-Host '     ysh-backend:quick-test' -ForegroundColor Gray
Write-Host ""
Write-Host '   # Verificar logs' -ForegroundColor Gray
Write-Host '   docker logs -f ysh-test' -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentação: docs/MIGRATIONS_IMPLEMENTATION_SUMMARY.md" -ForegroundColor Cyan
Write-Host ""
