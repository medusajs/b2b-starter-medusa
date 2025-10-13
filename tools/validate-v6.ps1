#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Valida implementação V6 completa (Backend + Storefront)
.DESCRIPTION
    Executa validação automatizada de ambos os projetos
#>

$ErrorActionPreference = "Stop"

Write-Host "`n🔍 MEGA PROMPT V6 - Validação Completa`n" -ForegroundColor Blue

$results = @{
    backend = $false
    storefront = $false
}

# Backend
Write-Host "📦 Validando Backend..." -ForegroundColor Yellow
Push-Location backend
try {
    node scripts/validate-v6.js
    if ($LASTEXITCODE -eq 0) {
        $results.backend = $true
        Write-Host "✅ Backend: PASSOU`n" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend: FALHOU`n" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Backend: ERRO - $_`n" -ForegroundColor Red
} finally {
    Pop-Location
}

# Storefront
Write-Host "🎨 Validando Storefront..." -ForegroundColor Yellow
Push-Location storefront
try {
    node scripts/validate-v6.js
    if ($LASTEXITCODE -eq 0) {
        $results.storefront = $true
        Write-Host "✅ Storefront: PASSOU`n" -ForegroundColor Green
    } else {
        Write-Host "❌ Storefront: FALHOU`n" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Storefront: ERRO - $_`n" -ForegroundColor Red
} finally {
    Pop-Location
}

# Resumo
Write-Host "=" * 60 -ForegroundColor Blue
Write-Host "📊 RESUMO DA VALIDAÇÃO" -ForegroundColor Blue
Write-Host "=" * 60 -ForegroundColor Blue

if ($results.backend) {
    Write-Host "✅ Backend: PASSOU" -ForegroundColor Green
} else {
    Write-Host "❌ Backend: FALHOU" -ForegroundColor Red
}

if ($results.storefront) {
    Write-Host "✅ Storefront: PASSOU" -ForegroundColor Green
} else {
    Write-Host "❌ Storefront: FALHOU" -ForegroundColor Red
}

$allPassed = $results.backend -and $results.storefront

if ($allPassed) {
    Write-Host "`n🎉 Todas as validações passaram! V6 completo.`n" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️  Algumas validações falharam. Revise os erros acima.`n" -ForegroundColor Red
    exit 1
}
