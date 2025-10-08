#!/usr/bin/env pwsh
# Quick Fix Backend - Instala dependencia faltante

$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

Write-Host "`n================================================================================" -ForegroundColor $Cyan
Write-Host " QUICK FIX BACKEND" -ForegroundColor White
Write-Host "================================================================================" -ForegroundColor $Cyan

Write-Host "`n[1/3] Verificando container backend..." -ForegroundColor $Yellow

$containerId = docker ps -q --filter "name=ysh-b2b-backend-dev"

if (-not $containerId) {
    Write-Host "  Backend nao esta rodando" -ForegroundColor $Red
    Write-Host "  Iniciando backend..." -ForegroundColor $Yellow
    
    Set-Location "C:\Users\fjuni\ysh_medusa\ysh-store"
    docker-compose -f docker-compose.dev.yml up -d backend
    Start-Sleep -Seconds 5
    
    $containerId = docker ps -q --filter "name=ysh-b2b-backend-dev"
    
    if (-not $containerId) {
        Write-Host "  Falha ao iniciar backend" -ForegroundColor $Red
        exit 1
    }
}

Write-Host "  Backend encontrado: $containerId" -ForegroundColor $Green

Write-Host "`n[2/3] Instalando dependencia faltante..." -ForegroundColor $Yellow
Write-Host "  Executando: npm install --force @rollup/rollup-linux-x64-musl" -ForegroundColor $Cyan

docker exec $containerId npm install --force @rollup/rollup-linux-x64-musl

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Dependencia instalada com sucesso" -ForegroundColor $Green
}
else {
    Write-Host "  Erro na instalacao, tentando metodo alternativo..." -ForegroundColor $Yellow
    docker exec $containerId npm cache clean --force
    docker exec $containerId npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Reinstalacao concluida" -ForegroundColor $Green
    }
    else {
        Write-Host "  Falha na correcao" -ForegroundColor $Red
        exit 1
    }
}

Write-Host "`n[3/3] Reiniciando backend..." -ForegroundColor $Yellow

Set-Location "C:\Users\fjuni\ysh_medusa\ysh-store"
docker-compose -f docker-compose.dev.yml restart backend

Write-Host "  Aguardando inicializacao (15s)..." -ForegroundColor $Cyan
Start-Sleep -Seconds 15

Write-Host "`n================================================================================" -ForegroundColor $Cyan
Write-Host " VERIFICACAO FINAL" -ForegroundColor White
Write-Host "================================================================================" -ForegroundColor $Cyan

docker logs ysh-b2b-backend-dev --tail 20

Write-Host "`n================================================================================" -ForegroundColor $Cyan
Write-Host " SERVICOS DISPONIVEIS" -ForegroundColor White
Write-Host "================================================================================" -ForegroundColor $Cyan

Write-Host "`nBackend API:  http://localhost:9000" -ForegroundColor $Cyan
Write-Host "Admin Panel:  http://localhost:9000/app" -ForegroundColor $Cyan
Write-Host "Health Check: http://localhost:9000/health" -ForegroundColor $Cyan

Write-Host "`nPara ver logs completos:" -ForegroundColor $Yellow
Write-Host "  docker-compose -f docker-compose.dev.yml logs -f backend" -ForegroundColor $Gray
Write-Host ""

