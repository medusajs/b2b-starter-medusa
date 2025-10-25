# Script de Teste do Sistema de Fallback
# Executa validação completa dos 3 níveis de fallback

param(
    [string]$StorefrontUrl = "http://localhost:3000",
    [string]$BackendUrl = "http://localhost:9000"
)

Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TESTE DO SISTEMA DE FALLBACK ROBUSTO" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "📍 Storefront: $StorefrontUrl" -ForegroundColor White
Write-Host "📍 Backend: $BackendUrl`n" -ForegroundColor White

$categories = @(
    "panels",
    "inverters", 
    "batteries",
    "structures",
    "cables",
    "accessories",
    "stringboxes",
    "kits"
)

$results = @()

# Verificar saúde do backend
Write-Host "🔍 Verificando saúde do backend..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri "$BackendUrl/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
    $backendHealthy = $healthCheck.StatusCode -eq 200
}
catch {
    $backendHealthy = $false
}

if ($backendHealthy) {
    Write-Host "   ✅ Backend: Online`n" -ForegroundColor Green
}
else {
    Write-Host "   ⚠️  Backend: Offline/Degradado" -ForegroundColor Yellow
    Write-Host "   ℹ️  Sistema usará fallback API ou arquivos locais`n" -ForegroundColor Cyan
}

# Testar cada categoria
Write-Host "📦 Testando categorias...`n" -ForegroundColor Yellow

foreach ($category in $categories) {
    Write-Host "   Testing $($category.PadRight(15))... " -NoNewline
    
    $startTime = Get-Date
    
    try {
        $response = Invoke-RestMethod `
            -Uri "$StorefrontUrl/api/catalog/products?category=$category&limit=10" `
            -Method GET `
            -TimeoutSec 15 `
            -ErrorAction Stop
        
        $endTime = Get-Date
        $responseTime = [math]::Round(($endTime - $startTime).TotalMilliseconds)
        
        $source = $response.meta.source
        $productsCount = $response.data.products.Count
        
        $results += [PSCustomObject]@{
            Category      = $category
            Success       = $true
            Source        = $source
            ProductsCount = $productsCount
            ResponseTime  = $responseTime
            Error         = $null
        }
        
        $sourceEmoji = switch ($source) {
            "backend" { "🟢" }
            "fallback-api" { "🟡" }
            "local-file" { "🔵" }
            default { "⚪" }
        }
        
        Write-Host "✅ $productsCount produtos ($sourceEmoji $source) [$($responseTime)ms]" -ForegroundColor Green
        
    }
    catch {
        $endTime = Get-Date
        $responseTime = [math]::Round(($endTime - $startTime).TotalMilliseconds)
        
        $results += [PSCustomObject]@{
            Category      = $category
            Success       = $false
            Source        = "error"
            ProductsCount = 0
            ResponseTime  = $responseTime
            Error         = $_.Exception.Message
        }
        
        Write-Host "❌ Falhou: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Estatísticas
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ESTATÍSTICAS" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$successful = ($results | Where-Object { $_.Success }).Count
$failed = ($results | Where-Object { -not $_.Success }).Count
$avgResponseTime = [math]::Round(($results | Measure-Object -Property ResponseTime -Average).Average)

Write-Host "✅ Sucesso: $successful/$($categories.Count)" -ForegroundColor Green
Write-Host "❌ Falhas: $failed/$($categories.Count)" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "⏱️  Tempo médio: $($avgResponseTime)ms`n" -ForegroundColor White

# Fontes de dados
Write-Host "📊 Fontes de dados:" -ForegroundColor Yellow
$sourceGroups = $results | Group-Object -Property Source
foreach ($group in $sourceGroups) {
    $emoji = switch ($group.Name) {
        "backend" { "🟢" }
        "fallback-api" { "🟡" }
        "local-file" { "🔵" }
        default { "🔴" }
    }
    Write-Host "   $emoji $($group.Name.PadRight(15)): $($group.Count)" -ForegroundColor White
}

# Total de produtos
$totalProducts = ($results | Measure-Object -Property ProductsCount -Sum).Sum
Write-Host "`n📦 Total de produtos retornados: $totalProducts" -ForegroundColor White

# Resultado final
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
if ($failed -eq 0) {
    Write-Host "   ✅ TODOS OS TESTES PASSARAM!" -ForegroundColor Green
}
else {
    Write-Host "   ⚠️  ALGUNS TESTES FALHARAM" -ForegroundColor Yellow
}
Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Detalhes dos erros (se houver)
if ($failed -gt 0) {
    Write-Host "📋 Detalhes dos erros:" -ForegroundColor Red
    $results | Where-Object { -not $_.Success } | ForEach-Object {
        Write-Host "   ❌ $($_.Category): $($_.Error)" -ForegroundColor Red
    }
    Write-Host ""
}

# Exit code
exit $(if ($failed -eq 0) { 0 } else { 1 })
