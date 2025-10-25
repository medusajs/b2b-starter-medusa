# Local Dev Orchestrator for YSH Catalog (Windows PowerShell)
# Usage:
#   pwsh -File .\scripts\local.ps1 -ErpCatalogRoot "C:\\Users\\fjuni\\ysh_medusa\\ysh-erp\\data\\catalog"
#
# What it does:
#  1) Exports env vars for Backend and Storefront
#  2) Generates sku_registry.json from unified_schemas
#  3) Validates unified data
#  4) (Optional) Seeds Medusa with deterministic SKUs
#  5) Prints commands to start backend and storefront dev servers

param(
  [string]$ErpCatalogRoot = "C:\\Users\\fjuni\\ysh_medusa\\ysh-erp\\data\\catalog",
  [switch]$Seed,
  [switch]$RunTests
)

$ErrorActionPreference = 'Stop'

function Resolve-Paths {
  param([string]$CatalogRoot)
  $root = (Resolve-Path -LiteralPath $CatalogRoot).Path
  $unified = Join-Path $root 'unified_schemas'
  if (-not (Test-Path $unified)) {
    throw "Unified path not found: $unified"
  }
  $imageMap = Join-Path $root 'images\IMAGE_MAP.json'
  return [pscustomobject]@{ Root=$root; Unified=$unified; ImageMap=$imageMap }
}

Write-Host "[1/5] Resolving ERP catalog paths..." -ForegroundColor Cyan
$paths = Resolve-Paths -CatalogRoot $ErpCatalogRoot
Write-Host "    Root:    $($paths.Root)"
Write-Host "    Unified: $($paths.Unified)"
Write-Host "    ImageMap:$($paths.ImageMap)"

# Backend env
Write-Host "[2/5] Exporting Backend env vars..." -ForegroundColor Cyan
$backendDir = Join-Path $PSScriptRoot '..\backend' | Resolve-Path | Select-Object -ExpandProperty Path
$Env:CATALOG_PATH = $paths.Root
Write-Host "    CATALOG_PATH=$Env:CATALOG_PATH"

Push-Location $backendDir
try {
  Write-Host "[3/5] Generating SKU registry (backend)..." -ForegroundColor Cyan
  $Env:REGISTRY_OUT = Join-Path $paths.Unified 'sku_registry.json'
  Write-Host "    REGISTRY_OUT=$Env:REGISTRY_OUT"
  npm run catalog:sku:gen | Write-Host

  Write-Host "[3/5] Validating unified catalog (backend)..." -ForegroundColor Cyan
  npm run catalog:validate | Write-Host

  if ($RunTests) {
    Write-Host "[3/5] Running unit tests (backend)..." -ForegroundColor Cyan
    npm run test:unit | Write-Host
  }

  if ($Seed) {
    Write-Host "[3/5] Seeding Medusa with deterministic SKUs..." -ForegroundColor Cyan
    npm run seed:catalog | Write-Host
  }
}
finally { Pop-Location }

# Storefront env
Write-Host "[4/5] Exporting Storefront env vars..." -ForegroundColor Cyan
$storefrontDir = Join-Path $PSScriptRoot '..\storefront' | Resolve-Path | Select-Object -ExpandProperty Path
$Env:CATALOG_PATH = $paths.Unified
$Env:IMAGE_MAP_PATH = $paths.ImageMap
Write-Host "    CATALOG_PATH=$Env:CATALOG_PATH"
Write-Host "    IMAGE_MAP_PATH=$Env:IMAGE_MAP_PATH"

Write-Host "[5/5] Ready to start services" -ForegroundColor Green
Write-Host "    Backend:    cd `"$backendDir`" ; npm run dev" -ForegroundColor Yellow
Write-Host "    Storefront: cd `"$storefrontDir`" ; npm run dev" -ForegroundColor Yellow

