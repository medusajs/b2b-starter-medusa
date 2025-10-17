# Reorganization Script for Products Inventory
# Data: 17/10/2025
# Purpose: Reorganizar estrutura de diretorios e arquivos

$ErrorActionPreference = "Stop"
$baseDir = $PWD.Path

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "  Reorganizacao do Inventario" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se esta no diretorio correto
if (-not (Test-Path "README.md")) {
    Write-Host "ERRO: Execute este script do diretorio products-inventory/" -ForegroundColor Red
    exit 1
}

# Criar backup antes de qualquer operacao
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupDir = "..\products-inventory-backup-$timestamp"
Write-Host "Criando backup em: $backupDir" -ForegroundColor Yellow
Copy-Item -Path $baseDir -Destination $backupDir -Recurse -Force -ErrorAction Stop
Write-Host "Backup criado com sucesso!" -ForegroundColor Green
Write-Host ""

# Funcao para criar diretorios
function New-Dir {
    param([string]$path)
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Force -Path $path | Out-Null
        Write-Host "  Criado: $path" -ForegroundColor Gray
    }
}

# Funcao para mover arquivo
function Move-File {
    param([string]$source, [string]$destination)
    
    if (Test-Path $source) {
        $destDir = Split-Path $destination -Parent
        if ($destDir -and (-not (Test-Path $destDir))) {
            New-Item -ItemType Directory -Force -Path $destDir | Out-Null
        }
        
        Move-Item -Path $source -Destination $destination -Force -ErrorAction SilentlyContinue
        Write-Host "  $source -> $destination" -ForegroundColor Gray
        return $true
    }
    return $false
}

# FASE 1: Criar estrutura base
Write-Host "FASE 1: Criando estrutura de diretorios..." -ForegroundColor Cyan

$directories = @(
    "core/extractors",
    "core/validators",
    "core/enrichers",
    "core/composers",
    "core/importers",
    "core/gateways",
    "pipelines/configs",
    "tests/fixtures",
    "analysis",
    "docs/guides",
    "docs/architecture",
    "docs/reports",
    "docs/legacy",
    "data/raw/complete",
    "data/raw/consolidated",
    "data/validated",
    "data/enriched/complete",
    "data/enriched/schemas",
    "data/bundles",
    "data/catalogs",
    "scripts/migration",
    "scripts/setup",
    "scripts/utils",
    "config/bundles"
)

foreach ($dir in $directories) {
    New-Dir $dir
}

Write-Host "Estrutura base criada!" -ForegroundColor Green
Write-Host ""

# FASE 2: Mover scripts core
Write-Host "FASE 2: Movendo scripts core..." -ForegroundColor Cyan

Move-File "extract_COMPLETE_inventory.py" "core/extractors/extract_complete.py"
Move-File "extract_consolidated_inventory.py" "core/extractors/extract_consolidated.py"
Move-File "filter_valid_products.py" "core/validators/filter_valid.py"
Move-File "sku-governor.py" "core/validators/sku_governor.py"
Move-File "validate_merge.py" "core/validators/validate_merge.py"
Move-File "enrich_schemas_with_llm.py" "core/enrichers/enrich_schemas.py"
Move-File "enrich_complete_inventory.py" "core/enrichers/enrich_complete.py"
Move-File "llm_product_enricher.py" "core/enrichers/llm_enricher.py"
Move-File "focused_enricher.py" "core/enrichers/focused_enricher.py"
Move-File "simple_enricher.py" "core/enrichers/simple_enricher.py"
Move-File "bundle-composer.py" "core/composers/bundle_composer.py"
Move-File "generate_medusa_catalog.py" "core/composers/catalog_generator.py"
Move-File "merge_to_medusa.py" "core/composers/merge_to_medusa.py"
Move-File "import-catalog-to-medusa.ts" "core/importers/import_catalog.ts"
Move-File "import-enriched-to-medusa.ts" "core/importers/import_enriched.ts"
Move-File "test-import.ts" "core/importers/test_import.ts"
Move-File "unified_gateway.py" "core/gateways/unified_gateway.py"
Move-File "Dockerfile.gateway" "core/gateways/Dockerfile"
Move-File "docker-compose.gateway.yml" "core/gateways/docker-compose.yml"
Move-File "requirements-gateway.txt" "core/gateways/requirements.txt"

Write-Host "Scripts core movidos!" -ForegroundColor Green
Write-Host ""

# FASE 3: Mover pipelines
Write-Host "FASE 3: Movendo pipelines..." -ForegroundColor Cyan

Move-File "run-governor-pipeline.py" "pipelines/run_governor.py"
Move-File "run_complete_pipeline.py" "pipelines/run_complete.py"

Write-Host "Pipelines movidos!" -ForegroundColor Green
Write-Host ""

# FASE 4: Mover scripts de analise
Write-Host "FASE 4: Movendo scripts de analise..." -ForegroundColor Cyan

Move-File "analyze_enrichment.py" "analysis/analyze_enrichment.py"
Move-File "analyze_schema_coverage.py" "analysis/analyze_schema_coverage.py"
Move-File "analyze_skip_reasons.py" "analysis/analyze_skip_reasons.py"
Move-File "analyze_top_products.py" "analysis/analyze_top_products.py"
Move-File "product_filling_analysis.py" "analysis/product_filling_analysis.py"

Write-Host "Scripts de analise movidos!" -ForegroundColor Green
Write-Host ""

# FASE 5: Mover testes
Write-Host "FASE 5: Movendo testes..." -ForegroundColor Cyan

Move-File "test-sku-governor.ps1" "tests/test_sku_governor.ps1"
Move-File "test-bundle-composer.ps1" "tests/test_bundle_composer.ps1"

Write-Host "Testes movidos!" -ForegroundColor Green
Write-Host ""

# FASE 6: Reorganizar documentacao
Write-Host "FASE 6: Reorganizando documentacao..." -ForegroundColor Cyan

# Consolidar SKU Governor docs
if (Test-Path "SKU-GOVERNOR-README.md") {
    Copy-Item "SKU-GOVERNOR-README.md" "docs/guides/SKU_GOVERNOR.md" -Force
    if (Test-Path "SKU-GOVERNOR-USAGE.md") {
        Add-Content "docs/guides/SKU_GOVERNOR.md" "`n`n---`n`n# Usage Guide`n`n"
        Get-Content "SKU-GOVERNOR-USAGE.md" | Add-Content "docs/guides/SKU_GOVERNOR.md"
        Remove-Item "SKU-GOVERNOR-USAGE.md" -Force
    }
    Remove-Item "SKU-GOVERNOR-README.md" -Force
}

Move-File "BUNDLE-COMPOSER-README.md" "docs/guides/BUNDLE_COMPOSER.md"
Move-File "DEPLOYMENT-GUIDE.md" "docs/guides/DEPLOYMENT.md"
Move-File "IMPORT_USAGE_GUIDE.md" "docs/guides/IMPORT_USAGE.md"
Move-File "COMPLETE-SYSTEM-GUIDE.md" "docs/architecture/SYSTEM_OVERVIEW.md"
Move-File "INVENTORY_BLUEPRINT_360.md" "docs/architecture/INVENTORY_BLUEPRINT.md"
Move-File "PROJECT_STATUS_EXECUTIVE.md" "docs/reports/PROJECT_STATUS.md"
Move-File "IMPLEMENTATION_COMPLETE.md" "docs/reports/IMPLEMENTATION.md"
Move-File "CATALOG_GENERATION_SUMMARY.md" "docs/reports/CATALOG_GENERATION.md"
Move-File "ENRICHMENT_COMPLETE_SUMMARY.md" "docs/reports/ENRICHMENT.md"
Move-File "PRICING_PERFORMANCE_ANALYSIS_360.md" "docs/reports/PRICING_ANALYSIS.md"
Move-File "SCHEMA-COVERAGE-REPORT.md" "docs/reports/SCHEMA_COVERAGE.md"
Move-File "SCHEMA-FILLING-REPORT.md" "docs/reports/SCHEMA_FILLING.md"
Move-File "PIPELINE_EXECUTION_REPORT.md" "docs/reports/PIPELINE_EXECUTION.md"
Move-File "PROXIMOS-PASSOS.md" "docs/legacy/PROXIMOS-PASSOS.md"
Move-File "MEDUSA_IMPORT_READY.md" "docs/legacy/MEDUSA_IMPORT_READY.md"
Move-File "EXECUTIVE-IMPLEMENTATION-REPORT.md" "docs/legacy/EXECUTIVE_IMPLEMENTATION.md"

Write-Host "Documentacao reorganizada!" -ForegroundColor Green
Write-Host ""

# FASE 7: Reorganizar dados
Write-Host "FASE 7: Reorganizando dados..." -ForegroundColor Cyan

if (Test-Path "complete-inventory") {
    Get-ChildItem "complete-inventory" -File -ErrorAction SilentlyContinue | ForEach-Object {
        Move-Item $_.FullName "data/raw/complete/" -Force -ErrorAction SilentlyContinue
    }
}

if (Test-Path "consolidated-inventory") {
    Get-ChildItem "consolidated-inventory" -File -ErrorAction SilentlyContinue | ForEach-Object {
        Move-Item $_.FullName "data/raw/consolidated/" -Force -ErrorAction SilentlyContinue
    }
}

if (Test-Path "enriched-complete") {
    Get-ChildItem "enriched-complete" -File -ErrorAction SilentlyContinue | ForEach-Object {
        Move-Item $_.FullName "data/enriched/complete/" -Force -ErrorAction SilentlyContinue
    }
}

if (Test-Path "enriched-schemas") {
    Get-ChildItem "enriched-schemas" -File -ErrorAction SilentlyContinue | ForEach-Object {
        Move-Item $_.FullName "data/enriched/schemas/" -Force -ErrorAction SilentlyContinue
    }
}

# Remover diretorios vazios
@("complete-inventory", "consolidated-inventory", "enriched-complete", "enriched-schemas") | ForEach-Object {
    if (Test-Path $_) {
        $items = Get-ChildItem $_ -Recurse -ErrorAction SilentlyContinue
        if ($items.Count -eq 0) {
            Remove-Item $_ -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "Dados reorganizados!" -ForegroundColor Green
Write-Host ""

# FASE 8: Mover configs
Write-Host "FASE 8: Movendo configuracoes..." -ForegroundColor Cyan

Move-File "payment-splits-types.ts" "config/payment-splits-types.ts"

Write-Host "Configuracoes movidas!" -ForegroundColor Green
Write-Host ""

# FASE 9: Criar .gitignore
Write-Host "FASE 9: Configurando .gitignore..." -ForegroundColor Cyan

$gitignoreContent = @"
# Ignorar arquivos de dados processados
data/raw/**/*.json
data/validated/**/*.json
data/enriched/**/*.json
data/bundles/**/*.json
data/catalogs/**/*.json

# Manter estrutura
!data/raw/.gitkeep
!data/validated/.gitkeep
!data/enriched/.gitkeep
!data/bundles/.gitkeep
!data/catalogs/.gitkeep
!data/**/README.md
"@

$gitignoreContent | Out-File -FilePath "data\.gitignore" -Encoding UTF8 -Force

# Criar .gitkeep files
@("data/raw", "data/validated", "data/enriched", "data/bundles", "data/catalogs") | ForEach-Object {
    New-Item -ItemType File -Path "$_\.gitkeep" -Force -ErrorAction SilentlyContinue | Out-Null
}

Write-Host ".gitignore configurado!" -ForegroundColor Green
Write-Host ""

# FASE 10: Substituir README
Write-Host "FASE 10: Substituindo README..." -ForegroundColor Cyan

if (Test-Path "NEW_README.md") {
    if (Test-Path "README.md") {
        Move-Item "README.md" "docs/legacy/OLD_README.md" -Force
    }
    Move-Item "NEW_README.md" "README.md" -Force
    Write-Host "README.md substituido!" -ForegroundColor Green
} else {
    Write-Host "NEW_README.md nao encontrado, pulando..." -ForegroundColor Yellow
}

Write-Host ""

# SUMARIO FINAL
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  REORGANIZACAO CONCLUIDA!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Sumario:" -ForegroundColor Yellow
Write-Host "  Backup criado em: $backupDir" -ForegroundColor White
Write-Host "  25 diretorios criados" -ForegroundColor White
Write-Host "  Scripts organizados" -ForegroundColor White
Write-Host "  Documentacao consolidada" -ForegroundColor White
Write-Host "  README.md atualizado" -ForegroundColor White
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "  1. Revisar estrutura criada" -ForegroundColor White
Write-Host "  2. Executar testes: .\tests\test_sku_governor.ps1" -ForegroundColor White
Write-Host "  3. Commit: git add . && git commit -m 'refactor: reorganize structure'" -ForegroundColor White
Write-Host ""
Write-Host "Para reverter:" -ForegroundColor Yellow
Write-Host "  Remove-Item '$baseDir' -Recurse -Force" -ForegroundColor White
Write-Host "  Copy-Item '$backupDir' '$baseDir' -Recurse" -ForegroundColor White
Write-Host ""
Write-Host "Reorganizacao completa!" -ForegroundColor Green
