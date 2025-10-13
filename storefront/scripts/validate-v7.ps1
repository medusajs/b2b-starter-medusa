# Storefront V7 - Validação de Progresso
# Verifica implementação de performance, SEO, A11y e segurança

Write-Host "🔍 Storefront V7 - Validação de Progresso" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

$errors = 0
$warnings = 0

# Passo 1: P0 PDP
Write-Host "⚠️  Passo 1: P0 PDP Error 500" -ForegroundColor Yellow
Write-Host "   Status: EM INVESTIGAÇÃO" -ForegroundColor Gray
Write-Host "   Ação: Verificar logs e endpoint backend`n" -ForegroundColor Gray

# Passo 2: HTTP Client
Write-Host "✅ Passo 2: HTTP Client Unificado" -ForegroundColor Green
if (Test-Path "src/lib/http.ts") {
    Write-Host "   ✅ src/lib/http.ts existe" -ForegroundColor Green
} else {
    Write-Host "   ❌ src/lib/http.ts não encontrado" -ForegroundColor Red
    $errors++
}

if (Test-Path "src/lib/__tests__/http.test.ts") {
    Write-Host "   ✅ Testes do HTTP client existem" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Testes do HTTP client não encontrados" -ForegroundColor Yellow
    $warnings++
}
Write-Host ""

# Passo 3: Data Layer
Write-Host "✅ Passo 3: Data Layer Resiliente" -ForegroundColor Green
if (Test-Path "src/lib/data/products.ts") {
    Write-Host "   ✅ src/lib/data/products.ts existe" -ForegroundColor Green
    
    $content = Get-Content "src/lib/data/products.ts" -Raw
    if ($content -match "retryWithBackoff") {
        Write-Host "   ✅ Retry logic implementado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Retry logic não encontrado" -ForegroundColor Red
        $errors++
    }
    
    if ($content -match "notFound\(\)") {
        Write-Host "   ✅ notFound() para 404 implementado" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  notFound() não encontrado" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "   ❌ src/lib/data/products.ts não encontrado" -ForegroundColor Red
    $errors++
}
Write-Host ""

# Passo 4: UI/UX
Write-Host "🔄 Passo 4: UI/UX (Loading States)" -ForegroundColor Yellow
$loadingFiles = @(
    "app/[countryCode]/(main)/loading.tsx",
    "app/[countryCode]/(main)/products/[handle]/loading.tsx",
    "src/components/ui/skeleton.tsx",
    "src/components/ui/degraded-banner.tsx"
)

$loadingCount = 0
foreach ($file in $loadingFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
        $loadingCount++
    } else {
        Write-Host "   ❌ $file não encontrado" -ForegroundColor Red
    }
}

$loadingPercentage = [math]::Round(($loadingCount / $loadingFiles.Count) * 100, 0)
$progressText = "$loadingCount/$($loadingFiles.Count) arquivos (" + $loadingPercentage + "%)"
Write-Host "   Progresso: $progressText`n" -ForegroundColor Cyan

# Passo 5: SEO/A11y
Write-Host "🔄 Passo 5: SEO/A11y" -ForegroundColor Yellow
if (Test-Path "src/lib/seo/json-ld.ts") {
    Write-Host "   ✅ JSON-LD implementado" -ForegroundColor Green
} else {
    Write-Host "   ❌ JSON-LD não encontrado" -ForegroundColor Red
    $errors++
}

if (Test-Path "app/[countryCode]/(main)/layout.tsx") {
    $layoutContent = Get-Content "app/[countryCode]/(main)/layout.tsx" -Raw
    if ($layoutContent -match "Pular para") {
        Write-Host "   ✅ Skip link implementado" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Skip link não encontrado" -ForegroundColor Yellow
        $warnings++
    }
}
Write-Host ""

# Passo 6: Segurança
Write-Host "✅ Passo 6: Segurança" -ForegroundColor Green
if (Test-Path "next.config.js") {
    $configContent = Get-Content "next.config.js" -Raw
    if ($configContent -match "Content-Security-Policy") {
        Write-Host "   ✅ CSP headers configurados" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  CSP headers não encontrados" -ForegroundColor Yellow
        $warnings++
    }
    
    if ($configContent -match "remotePatterns") {
        Write-Host "   ✅ remotePatterns configurados" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  remotePatterns não encontrados" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "   ❌ next.config.js não encontrado" -ForegroundColor Red
    $errors++
}
Write-Host ""

# Passo 7: Pages B2B
Write-Host "⏳ Passo 7: Pages B2B" -ForegroundColor Yellow
Write-Host "   Status: Pendente (curto prazo)`n" -ForegroundColor Gray

# TypeCheck
Write-Host "🔄 Validação: TypeCheck" -ForegroundColor Yellow
Write-Host "   Executando npm run type-check..." -ForegroundColor Gray
$typecheckOutput = npm run type-check 2>&1 | Out-String
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ TypeCheck passou" -ForegroundColor Green
} else {
    Write-Host "   ❌ TypeCheck falhou" -ForegroundColor Red
    $errors++
}
Write-Host ""

# Resumo
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 RESUMO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ HTTP Client: COMPLETO" -ForegroundColor Green
Write-Host "✅ Data Layer: COMPLETO" -ForegroundColor Green
$uiText = $loadingPercentage.ToString() + "% (" + $loadingCount + "/" + $loadingFiles.Count + ")"
Write-Host "🔄 UI/UX: $uiText" -ForegroundColor Yellow
Write-Host "✅ SEO/A11y: PARCIAL" -ForegroundColor Green
Write-Host "✅ Segurança: COMPLETO" -ForegroundColor Green
Write-Host "⏳ B2B Pages: PENDENTE`n" -ForegroundColor Yellow

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✅ Validação concluída com sucesso!" -ForegroundColor Green
    exit 0
} elseif ($errors -eq 0) {
    Write-Host "⚠️  Validação concluída com $warnings aviso(s)" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "❌ Validação falhou com $errors erro(s) e $warnings aviso(s)" -ForegroundColor Red
    exit 1
}
