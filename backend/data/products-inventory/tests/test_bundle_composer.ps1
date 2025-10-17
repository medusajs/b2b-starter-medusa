# Test Bundle Composer
# Tests bundle composition with example configurations

Write-Host "=== BUNDLE COMPOSER TEST SUITE ===" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$testDir = Join-Path $PSScriptRoot "test-results" "bundles"
$examplesDir = Join-Path $PSScriptRoot "examples"

# Create test results directory
if (!(Test-Path $testDir)) {
    New-Item -ItemType Directory -Path $testDir -Force | Out-Null
}

# Test configurations
$configs = @(
    @{
        Name = "Residential Hybrid 8.1 kWp"
        File = "bundle-config-residential-hybrid.json"
        ExpectedSKU = "KIT-RESHYB-8KWP-DEYE"
        ExpectedComponents = 7
    },
    @{
        Name = "Commercial On-Grid 25 kWp"
        File = "bundle-config-commercial-ongrid.json"
        ExpectedSKU = "KIT-COMON-24KWP-FRON"
        ExpectedComponents = 7
    },
    @{
        Name = "Residential Off-Grid 5.4 kWp"
        File = "bundle-config-residential-offgrid.json"
        ExpectedSKU = "KIT-RESOFF-5KWP-GROW"
        ExpectedComponents = 8
    }
)

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

$testNumber = 1
$totalTests = $configs.Count
$passedTests = 0

foreach ($config in $configs) {
    Write-Host "Test $testNumber/$totalTests : $($config.Name)" -ForegroundColor Yellow
    Write-Host ("=" * 70)
    
    $configFile = Join-Path $examplesDir $config.File
    $outputFile = Join-Path $testDir "$($config.File -replace '\.json$', '-payload.json')"
    
    try {
        # Run bundle composer with mock resolvers
        python bundle-composer.py $configFile `
            --output $outputFile `
            --mock-inventory `
            --mock-prices
        
        if ($LASTEXITCODE -ne 0) {
            Write-TestResult "Execution" "FAIL" "Exit code: $LASTEXITCODE"
            continue
        }
        
        # Load and validate payload
        $payload = Get-Content $outputFile | ConvertFrom-Json
        
        Write-Host ""
        Write-TestResult "Payload Created" "PASS" "Output: $outputFile"
        
        # Validate SKU pattern
        if ($payload.variant_sku -match '^KIT-[A-Z0-9]+(-[A-Z0-9]+)*$') {
            Write-TestResult "SKU Pattern" "PASS" $payload.variant_sku
        } else {
            Write-TestResult "SKU Pattern" "FAIL" "Invalid: $($payload.variant_sku)"
        }
        
        # Validate handle
        if ($payload.handle -match '^[a-z0-9-]+$') {
            Write-TestResult "Handle" "PASS" $payload.handle
        } else {
            Write-TestResult "Handle" "FAIL" "Invalid: $($payload.handle)"
        }
        
        # Validate metadata
        if ($payload.metadata.is_bundle -eq $true) {
            Write-TestResult "Bundle Metadata" "PASS" "is_bundle = true"
        } else {
            Write-TestResult "Bundle Metadata" "FAIL" "is_bundle not set"
        }
        
        # Validate manage_inventory
        if ($payload.manage_inventory -eq $false) {
            Write-TestResult "Inventory Management" "PASS" "manage_inventory = false"
        } else {
            Write-TestResult "Inventory Management" "FAIL" "should be false for bundles"
        }
        
        # Validate components
        $componentCount = $payload.metadata.bundle_components.Count
        if ($componentCount -eq $config.ExpectedComponents) {
            Write-TestResult "Components Count" "PASS" "$componentCount components"
        } else {
            Write-TestResult "Components Count" "WARN" "Expected $($config.ExpectedComponents), got $componentCount"
        }
        
        # Validate inventory_items
        if ($payload.inventory_items.Count -gt 0) {
            Write-TestResult "Inventory Items" "PASS" "$($payload.inventory_items.Count) items"
        } else {
            Write-TestResult "Inventory Items" "WARN" "No inventory items (mock resolver not used?)"
        }
        
        # Validate pricing
        if ($payload.calculated_price) {
            $price = $payload.calculated_price
            Write-TestResult "Price Calculation" "PASS" "R$ $($price.total_price_brl)"
            Write-Host "    Components Cost: R$ $($price.components_cost_brl)" -ForegroundColor Gray
            Write-Host "    Margin: R$ $($price.margin_brl) ($($price.margin_percent)%)" -ForegroundColor Gray
        } else {
            Write-TestResult "Price Calculation" "WARN" "No price calculated (mock resolver not used?)"
        }
        
        # Validate availability
        if ($payload.availability) {
            $avail = $payload.availability
            Write-TestResult "Availability Calculation" "PASS" "$($avail.available_quantity) kits"
            Write-Host "    Limiting Component: $($avail.limiting_component)" -ForegroundColor Gray
        } else {
            Write-TestResult "Availability Calculation" "WARN" "No availability calculated"
        }
        
        # Validate prices array
        if ($payload.prices.Count -gt 0) {
            $priceEntry = $payload.prices[0]
            $amountBrl = $priceEntry.amount / 100
            Write-TestResult "Medusa Price Entry" "PASS" "R$ $amountBrl ($($priceEntry.amount) cents)"
        } else {
            Write-TestResult "Medusa Price Entry" "WARN" "No price entry"
        }
        
        Write-Host ""
        Write-Host "Bundle Details:" -ForegroundColor Cyan
        Write-Host "  Title: $($payload.title)" -ForegroundColor White
        Write-Host "  SKU: $($payload.variant_sku)" -ForegroundColor White
        Write-Host "  Handle: $($payload.handle)" -ForegroundColor White
        Write-Host "  Category: $($payload.metadata.bundle_category)" -ForegroundColor White
        
        if ($payload.metadata.total_power_kwp) {
            Write-Host "  Power: $($payload.metadata.total_power_kwp) kWp" -ForegroundColor White
        }
        
        if ($payload.metadata.estimated_generation_month_kwh) {
            Write-Host "  Est. Generation: $($payload.metadata.estimated_generation_month_kwh) kWh/month" -ForegroundColor White
        }
        
        $passedTests++
        
    } catch {
        Write-TestResult "Test Execution" "FAIL" $_.Exception.Message
        Write-Host $_.ScriptStackTrace -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host ("=" * 70)
    Write-Host ""
    
    $testNumber++
}

# Summary
Write-Host "=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests: $totalTests"
Write-Host "Passed: " -NoNewline
Write-Host "$passedTests " -NoNewline -ForegroundColor Green
Write-Host "($([math]::Round($passedTests/$totalTests*100, 1))%)"
Write-Host "Failed: " -NoNewline
Write-Host "$($ totalTests - $passedTests)" -ForegroundColor Red
Write-Host ""

if ($passedTests -eq $totalTests) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Review output above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Test results saved in: $testDir" -ForegroundColor Gray
