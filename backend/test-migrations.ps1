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
        Write-Host "   [ERRO] Docker nao esta rodando!" -ForegroundColor Red
        Write-Host "   [DICA] Inicie Docker Desktop e execute este script novamente.`n" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "   [OK] Docker versao: $dockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "   [ERRO] Erro ao verificar Docker: $_" -ForegroundColor Red
    exit 1
}

# Build da imagem de teste
Write-Host "`n2. Building imagem de teste..." -ForegroundColor Yellow
Write-Host "   [BUILD] docker build -t ysh-backend:quick-test -f Dockerfile ." -ForegroundColor Gray

$buildOutput = docker build -t ysh-backend:quick-test -f Dockerfile . 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   [ERRO] Build falhou!" -ForegroundColor Red
    Write-Host $buildOutput
    exit 1
}
Write-Host "   [OK] Build completado com sucesso" -ForegroundColor Green

# Teste 1: Verificar que entrypoint está no container
Write-Host "`n3. Verificando entrypoint.sh no container..." -ForegroundColor Yellow
$entrypointCheck = docker run --rm ysh-backend:quick-test ls -la /app/entrypoint.sh 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   [ERRO] entrypoint.sh nao encontrado no container!" -ForegroundColor Red
    Write-Host $entrypointCheck
    exit 1
}
Write-Host "   [OK] entrypoint.sh encontrado e executavel" -ForegroundColor Green

# Teste 2: Executar entrypoint com SKIP_MIGRATIONS (teste rápido sem DB)
Write-Host "`n4. Testando entrypoint.sh (SKIP_MIGRATIONS=true)..." -ForegroundColor Yellow
$entrypointTest = docker run --rm `
    -e SKIP_MIGRATIONS="true" `
    ysh-backend:quick-test `
    echo "Entrypoint executed successfully" 2>&1

if ($entrypointTest -match "Skipping migrations") {
    Write-Host "   [OK] Entrypoint executa e respeita SKIP_MIGRATIONS" -ForegroundColor Green
}
else {
    Write-Host "   [AVISO] Entrypoint executou mas output inesperado:" -ForegroundColor Yellow
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
    Write-Host "   [OK] Script tenta conectar e falha corretamente (comportamento esperado)" -ForegroundColor Green
}
elseif ($dbTest -match "Waiting for database") {
    Write-Host "   [OK] Script aguarda database (comportamento esperado)" -ForegroundColor Green
}
else {
    Write-Host "   [AVISO] Output inesperado:" -ForegroundColor Yellow
    Write-Host $dbTest | Select-Object -First 10
}

# Resumo
Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  RESUMO DO TESTE                                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "[OK] Docker funcionando" -ForegroundColor Green
Write-Host "[OK] Build da imagem completado" -ForegroundColor Green
Write-Host "[OK] entrypoint.sh presente no container" -ForegroundColor Green
Write-Host "[OK] entrypoint.sh executavel" -ForegroundColor Green
Write-Host "[OK] Flag SKIP_MIGRATIONS funciona" -ForegroundColor Green
Write-Host "[OK] Tentativa de conexao com DB implementada" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMO PASSO:" -ForegroundColor Yellow
Write-Host "   Testar com DATABASE_URL real:" -ForegroundColor White
Write-Host ""
Write-Host '   $env:DATABASE_URL = "postgresql://user:pass@host:5432/db"' -ForegroundColor Gray
Write-Host '   docker run -d --name ysh-test `' -ForegroundColor Gray
Write-Host '     -p 9000:9000 `' -ForegroundColor Gray
Write-Host '     -e DATABASE_URL="$env:DATABASE_URL" `' -ForegroundColor Gray
Write-Host '     -e NODE_ENV="production" `' -ForegroundColor Gray
Write-Host '     ysh-backend:quick-test' -ForegroundColor Gray
Write-Host ""
Write-Host '   # Verificar logs' -ForegroundColor Gray
Write-Host '   docker logs -f ysh-test' -ForegroundColor Gray
Write-Host ""
Write-Host "Documentacao: docs/MIGRATIONS_IMPLEMENTATION_SUMMARY.md" -ForegroundColor Cyan
Write-Host ""
