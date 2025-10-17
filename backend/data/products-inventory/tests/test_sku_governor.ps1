# Test SKU Governor with Sample Data
# This script tests the SKU Governor implementation with example distributor data

Write-Host "=== SKU GOVERNOR TEST SUITE ===" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$testDir = Join-Path $PSScriptRoot "test-results"
$examplesDir = Join-Path $PSScriptRoot "examples"

# Create test results directory
if (!(Test-Path $testDir)) {
    New-Item -ItemType Directory -Path $testDir | Out-Null
}

# Colors for output
function Write-TestResult {
    param(
        [string]$Test,
        [string]$Status,
        [string]$Details = ""
    )
    
    $color = if ($Status -eq "PASS") { "Green" } elseif ($Status -eq "WARN") { "Yellow" } else { "Red" }
    Write-Host "[$Status] " -NoNewline -ForegroundColor $color
    Write-Host "$Test" -NoNewline
    if ($Details) {
        Write-Host " - $Details" -ForegroundColor Gray
    } else {
        Write-Host ""
    }
}

# Test 1: NeoSolar Panels
Write-Host "Test 1: NeoSolar Panels (5 produtos, 1 inválido)" -ForegroundColor Yellow
Write-Host "----------------------------------------------"

$inputFile = Join-Path $examplesDir "neosolar-panels-sample.json"
$outputDir = Join-Path $testDir "neosolar"

try {
    python sku-governor.py $inputFile `
        --category panel `
        --distributor neosolar `
        --output-dir $outputDir
    
    $exitCode = $LASTEXITCODE
    
    # Read report
    $reportFile = Join-Path $outputDir "neosolar-panel-normalized-report.json"
    $report = Get-Content $reportFile | ConvertFrom-Json
    
    Write-Host ""
    Write-TestResult "Processamento" "PASS" "$($report.summary.total_processed) produtos processados"
    Write-TestResult "Válidos" $(if ($report.summary.total_valid -ge 4) { "PASS" } else { "FAIL" }) "$($report.summary.total_valid)/$($report.summary.total_processed)"
    Write-TestResult "SKUs Gerados" "PASS" "$($report.skus_generated_count) SKUs"
    Write-TestResult "Warnings" $(if ($report.summary.total_warnings -gt 0) { "WARN" } else { "PASS" }) "$($report.summary.total_warnings) warnings"
    Write-TestResult "Erros" $(if ($report.summary.total_invalid -gt 0) { "WARN" } else { "PASS" }) "$($report.summary.total_invalid) inválidos"
    
    Write-Host ""
    Write-Host "SKUs Gerados:" -ForegroundColor Cyan
    $normalized = Get-Content (Join-Path $outputDir "neosolar-panel-normalized.json") | ConvertFrom-Json
    $normalized | Where-Object { $_.validation_issues.Count -eq 0 } | ForEach-Object {
        Write-Host "  ✓ " -NoNewline -ForegroundColor Green
        Write-Host "$($_.global_sku)" -NoNewline -ForegroundColor White
        Write-Host " - $($_.title)" -ForegroundColor Gray
    }
    
    Write-Host ""
    if ($report.summary.total_invalid -gt 0) {
        Write-Host "Produtos Inválidos:" -ForegroundColor Yellow
        $normalized | Where-Object { $_.validation_issues.Count -gt 0 } | ForEach-Object {
            Write-Host "  ✗ " -NoNewline -ForegroundColor Red
            Write-Host "$($_.distributor_sku)" -ForegroundColor White
            $_.validation_issues | Where-Object { $_.severity -eq "ERROR" } | ForEach-Object {
                Write-Host "    - $($_.message)" -ForegroundColor Gray
            }
        }
    }
    
} catch {
    Write-TestResult "Test 1" "FAIL" $_.Exception.Message
}

Write-Host ""
Write-Host "=============================================="
Write-Host ""

# Test 2: Fortlev Inverters
Write-Host "Test 2: Fortlev Inverters (5 produtos, 1 inválido)" -ForegroundColor Yellow
Write-Host "----------------------------------------------"

$inputFile = Join-Path $examplesDir "fortlev-inverters-sample.json"
$outputDir = Join-Path $testDir "fortlev"

try {
    python sku-governor.py $inputFile `
        --category inverter `
        --distributor fortlev `
        --output-dir $outputDir
    
    $exitCode = $LASTEXITCODE
    
    # Read report
    $reportFile = Join-Path $outputDir "fortlev-inverter-normalized-report.json"
    $report = Get-Content $reportFile | ConvertFrom-Json
    
    Write-Host ""
    Write-TestResult "Processamento" "PASS" "$($report.summary.total_processed) produtos processados"
    Write-TestResult "Válidos" $(if ($report.summary.total_valid -ge 4) { "PASS" } else { "FAIL" }) "$($report.summary.total_valid)/$($report.summary.total_processed)"
    Write-TestResult "SKUs Gerados" "PASS" "$($report.skus_generated_count) SKUs"
    Write-TestResult "Warnings" $(if ($report.summary.total_warnings -gt 0) { "WARN" } else { "PASS" }) "$($report.summary.total_warnings) warnings"
    Write-TestResult "Erros" $(if ($report.summary.total_invalid -gt 0) { "WARN" } else { "PASS" }) "$($report.summary.total_invalid) inválidos"
    
    Write-Host ""
    Write-Host "SKUs Gerados:" -ForegroundColor Cyan
    $normalized = Get-Content (Join-Path $outputDir "fortlev-inverter-normalized.json") | ConvertFrom-Json
    $normalized | Where-Object { $_.validation_issues.Count -eq 0 } | ForEach-Object {
        Write-Host "  ✓ " -NoNewline -ForegroundColor Green
        Write-Host "$($_.global_sku)" -NoNewline -ForegroundColor White
        Write-Host " - $($_.title)" -ForegroundColor Gray
    }
    
    Write-Host ""
    if ($report.summary.total_invalid -gt 0) {
        Write-Host "Produtos Inválidos:" -ForegroundColor Yellow
        $normalized | Where-Object { $_.validation_issues.Count -gt 0 } | ForEach-Object {
            Write-Host "  ✗ " -NoNewline -ForegroundColor Red
            Write-Host "$($_.distributor_sku)" -ForegroundColor White
            $_.validation_issues | Where-Object { $_.severity -eq "ERROR" } | ForEach-Object {
                Write-Host "    - $($_.message)" -ForegroundColor Gray
            }
        }
    }
    
} catch {
    Write-TestResult "Test 2" "FAIL" $_.Exception.Message
}

Write-Host ""
Write-Host "=============================================="
Write-Host ""

# Test 3: Fotus Batteries
Write-Host "Test 3: Fotus Batteries (5 produtos, 1 inválido)" -ForegroundColor Yellow
Write-Host "----------------------------------------------"

$inputFile = Join-Path $examplesDir "fotus-batteries-sample.json"
$outputDir = Join-Path $testDir "fotus"

try {
    python sku-governor.py $inputFile `
        --category battery `
        --distributor fotus `
        --output-dir $outputDir
    
    $exitCode = $LASTEXITCODE
    
    # Read report
    $reportFile = Join-Path $outputDir "fotus-battery-normalized-report.json"
    $report = Get-Content $reportFile | ConvertFrom-Json
    
    Write-Host ""
    Write-TestResult "Processamento" "PASS" "$($report.summary.total_processed) produtos processados"
    Write-TestResult "Válidos" $(if ($report.summary.total_valid -ge 4) { "PASS" } else { "FAIL" }) "$($report.summary.total_valid)/$($report.summary.total_processed)"
    Write-TestResult "SKUs Gerados" "PASS" "$($report.skus_generated_count) SKUs"
    Write-TestResult "Warnings" $(if ($report.summary.total_warnings -gt 0) { "WARN" } else { "PASS" }) "$($report.summary.total_warnings) warnings"
    Write-TestResult "Erros" $(if ($report.summary.total_invalid -gt 0) { "WARN" } else { "PASS" }) "$($report.summary.total_invalid) inválidos"
    
    Write-Host ""
    Write-Host "SKUs Gerados:" -ForegroundColor Cyan
    $normalized = Get-Content (Join-Path $outputDir "fotus-battery-normalized.json") | ConvertFrom-Json
    $normalized | Where-Object { $_.validation_issues.Count -eq 0 } | ForEach-Object {
        Write-Host "  ✓ " -NoNewline -ForegroundColor Green
        Write-Host "$($_.global_sku)" -NoNewline -ForegroundColor White
        Write-Host " - $($_.title)" -ForegroundColor Gray
    }
    
    Write-Host ""
    if ($report.summary.total_invalid -gt 0) {
        Write-Host "Produtos Inválidos:" -ForegroundColor Yellow
        $normalized | Where-Object { $_.validation_issues.Count -gt 0 } | ForEach-Object {
            Write-Host "  ✗ " -NoNewline -ForegroundColor Red
            Write-Host "$($_.distributor_sku)" -ForegroundColor White
            $_.validation_issues | Where-Object { $_.severity -eq "ERROR" } | ForEach-Object {
                Write-Host "    - $($_.message)" -ForegroundColor Gray
            }
        }
    }
    
} catch {
    Write-TestResult "Test 3" "FAIL" $_.Exception.Message
}

Write-Host ""
Write-Host "=============================================="
Write-Host ""
Write-Host "=== RESUMO DOS TESTES ===" -ForegroundColor Cyan
Write-Host ""

# Calculate overall results
$allReports = Get-ChildItem -Path $testDir -Recurse -Filter "*-report.json"
$totalProcessed = 0
$totalValid = 0
$totalInvalid = 0
$totalWarnings = 0

foreach ($reportFile in $allReports) {
    $report = Get-Content $reportFile.FullName | ConvertFrom-Json
    $totalProcessed += $report.summary.total_processed
    $totalValid += $report.summary.total_valid
    $totalInvalid += $report.summary.total_invalid
    $totalWarnings += $report.summary.total_warnings
}

Write-Host "Total Processado: $totalProcessed produtos"
Write-Host "Válidos: " -NoNewline
Write-Host "$totalValid " -NoNewline -ForegroundColor Green
Write-Host "($([math]::Round($totalValid/$totalProcessed*100, 1))%)"

Write-Host "Inválidos: " -NoNewline
Write-Host "$totalInvalid " -NoNewline -ForegroundColor Red
Write-Host "($([math]::Round($totalInvalid/$totalProcessed*100, 1))%)"

Write-Host "Warnings: " -NoNewline
Write-Host "$totalWarnings" -ForegroundColor Yellow

Write-Host ""
Write-Host "✓ Testes concluídos! Resultados em: $testDir" -ForegroundColor Green
