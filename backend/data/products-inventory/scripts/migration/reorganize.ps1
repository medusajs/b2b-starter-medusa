# Reorganization Script for Products Inventory
# Data: 17/10/2025
# Purpose: Reorganizar estrutura de diretórios e arquivos

$ErrorActionPreference = "Stop"
$baseDir = "c:\Users\fjuni\OneDrive\Documentos\GitHub\ysh-b2b\backend\data\products-inventory"

Write-Host "🚀 Iniciando Reorganização do Inventário..." -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path $baseDir)) {
    Write-Host "❌ Erro: Diretório base não encontrado: $baseDir" -ForegroundColor Red
    exit 1
}

Set-Location $baseDir

# Criar backup antes de qualquer operação
$backupDir = "..\products-inventory-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "📦 Criando backup em: $backupDir" -ForegroundColor Yellow
Copy-Item -Path $baseDir -Destination $backupDir -Recurse -Force
Write-Host "✅ Backup criado com sucesso!" -ForegroundColor Green
Write-Host ""

# Função para criar diretórios
function New-DirectoryIfNotExists {
    param([string]$path)
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Force -Path $path | Out-Null
        Write-Host "  📁 Criado: $path" -ForegroundColor Green
    }
}

# Função para mover arquivo (com verificação)
function Move-FileIfExists {
    param(
        [string]$source,
        [string]$destination
    )
    
    if (Test-Path $source) {
        # Criar diretório de destino se não existir
        $destDir = Split-Path $destination -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Force -Path $destDir | Out-Null
        }
        
        Move-Item -Path $source -Destination $destination -Force
        Write-Host "  ✅ $source -> $destination" -ForegroundColor Gray
        return $true
    } else {
        Write-Host "  ⚠️  Arquivo não encontrado: $source" -ForegroundColor Yellow
        return $false
    }
}

# =============================================================================
# FASE 1: Criar Estrutura Base
# =============================================================================
Write-Host "📁 FASE 1: Criando estrutura de diretórios..." -ForegroundColor Cyan

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
    New-DirectoryIfNotExists $dir
}

Write-Host "✅ Estrutura base criada!" -ForegroundColor Green
Write-Host ""

# =============================================================================
# FASE 2: Mover Scripts Core
# =============================================================================
Write-Host "🔧 FASE 2: Movendo scripts core..." -ForegroundColor Cyan

# Extractors
Move-FileIfExists "extract_COMPLETE_inventory.py" "core/extractors/extract_complete.py"
Move-FileIfExists "extract_consolidated_inventory.py" "core/extractors/extract_consolidated.py"

# Validators
Move-FileIfExists "filter_valid_products.py" "core/validators/filter_valid.py"
Move-FileIfExists "sku-governor.py" "core/validators/sku_governor.py"
Move-FileIfExists "validate_merge.py" "core/validators/validate_merge.py"

# Enrichers
Move-FileIfExists "enrich_schemas_with_llm.py" "core/enrichers/enrich_schemas.py"
Move-FileIfExists "enrich_complete_inventory.py" "core/enrichers/enrich_complete.py"
Move-FileIfExists "llm_product_enricher.py" "core/enrichers/llm_enricher.py"
Move-FileIfExists "focused_enricher.py" "core/enrichers/focused_enricher.py"
Move-FileIfExists "simple_enricher.py" "core/enrichers/simple_enricher.py"

# Composers
Move-FileIfExists "bundle-composer.py" "core/composers/bundle_composer.py"
Move-FileIfExists "generate_medusa_catalog.py" "core/composers/catalog_generator.py"
Move-FileIfExists "merge_to_medusa.py" "core/composers/merge_to_medusa.py"

# Importers
Move-FileIfExists "import-catalog-to-medusa.ts" "core/importers/import_catalog.ts"
Move-FileIfExists "import-enriched-to-medusa.ts" "core/importers/import_enriched.ts"
Move-FileIfExists "test-import.ts" "core/importers/test_import.ts"

# Gateways
Move-FileIfExists "unified_gateway.py" "core/gateways/unified_gateway.py"
Move-FileIfExists "Dockerfile.gateway" "core/gateways/Dockerfile"
Move-FileIfExists "docker-compose.gateway.yml" "core/gateways/docker-compose.yml"
Move-FileIfExists "requirements-gateway.txt" "core/gateways/requirements.txt"

Write-Host "✅ Scripts core movidos!" -ForegroundColor Green
Write-Host ""

# =============================================================================
# FASE 3: Mover Pipelines
# =============================================================================
Write-Host "🔄 FASE 3: Movendo pipelines..." -ForegroundColor Cyan

Move-FileIfExists "run-governor-pipeline.py" "pipelines/run_governor.py"
Move-FileIfExists "run_complete_pipeline.py" "pipelines/run_complete.py"

Write-Host "✅ Pipelines movidos!" -ForegroundColor Green
Write-Host ""

# =============================================================================
# FASE 4: Mover Scripts de Análise
# =============================================================================
Write-Host "📊 FASE 4: Movendo scripts de análise..." -ForegroundColor Cyan

Move-FileIfExists "analyze_enrichment.py" "analysis/analyze_enrichment.py"
Move-FileIfExists "analyze_schema_coverage.py" "analysis/analyze_schema_coverage.py"
Move-FileIfExists "analyze_skip_reasons.py" "analysis/analyze_skip_reasons.py"
Move-FileIfExists "analyze_top_products.py" "analysis/analyze_top_products.py"
Move-FileIfExists "product_filling_analysis.py" "analysis/product_filling_analysis.py"

Write-Host "✅ Scripts de análise movidos!" -ForegroundColor Green
Write-Host ""

# =============================================================================
# FASE 5: Mover Testes
# =============================================================================
Write-Host "🧪 FASE 5: Movendo testes..." -ForegroundColor Cyan

Move-FileIfExists "test-sku-governor.ps1" "tests/test_sku_governor.ps1"
Move-FileIfExists "test-bundle-composer.ps1" "tests/test_bundle_composer.ps1"

Write-Host "✅ Testes movidos!" -ForegroundColor Green
Write-Host ""

# =============================================================================
# FASE 6: Reorganizar Documentação
# =============================================================================
Write-Host "📚 FASE 6: Reorganizando documentação..." -ForegroundColor Cyan

# Guides (merge files com mesmo propósito)
if (Test-Path "SKU-GOVERNOR-README.md") {
    Copy-Item "SKU-GOVERNOR-README.md" "docs/guides/SKU_GOVERNOR.md"
    if (Test-Path "SKU-GOVERNOR-USAGE.md") {
        Add-Content "docs/guides/SKU_GOVERNOR.md" "`n`n---`n`n# Usage Guide`n`n"
        Get-Content "SKU-GOVERNOR-USAGE.md" | Add-Content "docs/guides/SKU_GOVERNOR.md"
        Remove-Item "SKU-GOVERNOR-USAGE.md"
    }
    Remove-Item "SKU-GOVERNOR-README.md"
    Write-Host "  ✅ SKU_GOVERNOR.md consolidado" -ForegroundColor Gray
}

Move-FileIfExists "BUNDLE-COMPOSER-README.md" "docs/guides/BUNDLE_COMPOSER.md"
Move-FileIfExists "DEPLOYMENT-GUIDE.md" "docs/guides/DEPLOYMENT.md"
Move-FileIfExists "IMPORT_USAGE_GUIDE.md" "docs/guides/IMPORT_USAGE.md"

# Architecture
Move-FileIfExists "COMPLETE-SYSTEM-GUIDE.md" "docs/architecture/SYSTEM_OVERVIEW.md"
Move-FileIfExists "INVENTORY_BLUEPRINT_360.md" "docs/architecture/INVENTORY_BLUEPRINT.md"

# Reports
Move-FileIfExists "PROJECT_STATUS_EXECUTIVE.md" "docs/reports/PROJECT_STATUS.md"
Move-FileIfExists "IMPLEMENTATION_COMPLETE.md" "docs/reports/IMPLEMENTATION.md"
Move-FileIfExists "CATALOG_GENERATION_SUMMARY.md" "docs/reports/CATALOG_GENERATION.md"
Move-FileIfExists "ENRICHMENT_COMPLETE_SUMMARY.md" "docs/reports/ENRICHMENT.md"
Move-FileIfExists "PRICING_PERFORMANCE_ANALYSIS_360.md" "docs/reports/PRICING_ANALYSIS.md"
Move-FileIfExists "SCHEMA-COVERAGE-REPORT.md" "docs/reports/SCHEMA_COVERAGE.md"
Move-FileIfExists "SCHEMA-FILLING-REPORT.md" "docs/reports/SCHEMA_FILLING.md"
Move-FileIfExists "PIPELINE_EXECUTION_REPORT.md" "docs/reports/PIPELINE_EXECUTION.md"

# Legacy
Move-FileIfExists "PROXIMOS-PASSOS.md" "docs/legacy/PROXIMOS-PASSOS.md"
Move-FileIfExists "MEDUSA_IMPORT_READY.md" "docs/legacy/MEDUSA_IMPORT_READY.md"
Move-FileIfExists "EXECUTIVE-IMPLEMENTATION-REPORT.md" "docs/legacy/EXECUTIVE_IMPLEMENTATION.md"

Write-Host "✅ Documentação reorganizada!" -ForegroundColor Green
Write-Host ""

# =============================================================================
# FASE 7: Reorganizar Data (se existir)
# =============================================================================
Write-Host "📦 FASE 7: Reorganizando dados..." -ForegroundColor Cyan

# Mover dados preservando conteúdo
if (Test-Path "complete-inventory") {
    Get-ChildItem "complete-inventory" -File | ForEach-Object {
        Move-Item $_.FullName "data/raw/complete/" -Force
    }
    Write-Host "  ✅ complete-inventory/* -> data/raw/complete/" -ForegroundColor Gray
}

if (Test-Path "consolidated-inventory") {
    Get-ChildItem "consolidated-inventory" -File | ForEach-Object {
        Move-Item $_.FullName "data/raw/consolidated/" -Force
    }
    Write-Host "  ✅ consolidated-inventory/* -> data/raw/consolidated/" -ForegroundColor Gray
}

if (Test-Path "enriched-complete") {
    Get-ChildItem "enriched-complete" -File -ErrorAction SilentlyContinue | ForEach-Object {
        Move-Item $_.FullName "data/enriched/complete/" -Force
    }
    Write-Host "  ✅ enriched-complete/* -> data/enriched/complete/" -ForegroundColor Gray
}

if (Test-Path "enriched-schemas") {
    Get-ChildItem "enriched-schemas" -File -ErrorAction SilentlyContinue | ForEach-Object {
        Move-Item $_.FullName "data/enriched/schemas/" -Force
    }
    Write-Host "  ✅ enriched-schemas/* -> data/enriched/schemas/" -ForegroundColor Gray
}

# Remover diretórios antigos vazios
@("complete-inventory", "consolidated-inventory", "enriched-complete", "enriched-schemas") | ForEach-Object {
    if (Test-Path $_) {
        $items = Get-ChildItem $_ -Recurse
        if ($items.Count -eq 0) {
            Remove-Item $_ -Recurse -Force
            Write-Host "  🗑️  Removido diretório vazio: $_" -ForegroundColor Gray
        } else {
            Write-Host "  ⚠️  $_ ainda contém arquivos, não removido" -ForegroundColor Yellow
        }
    }
}

Write-Host "✅ Dados reorganizados!" -ForegroundColor Green
Write-Host ""

# =============================================================================
# FASE 8: Mover Configs
# =============================================================================
Write-Host "⚙️  FASE 8: Movendo configurações..." -ForegroundColor Cyan

Move-FileIfExists "payment-splits-types.ts" "config/payment-splits-types.ts"

Write-Host "✅ Configurações movidas!" -ForegroundColor Green
Write-Host ""

# =============================================================================
# FASE 9: Criar READMEs em cada diretório
# =============================================================================
Write-Host "📝 FASE 9: Criando READMEs..." -ForegroundColor Cyan

$readmes = @{
    "core/extractors/README.md" = @"
# Extractors

Scripts de extração de dados brutos dos distribuidores.

## Scripts

- **extract_complete.py**: Extração completa de todos os distribuidores
- **extract_consolidated.py**: Extração consolidada com normalização básica

## Usage

```powershell
python core/extractors/extract_complete.py
```
"@

    "core/validators/README.md" = @"
# Validators

Scripts de validação e normalização de produtos.

## Scripts

- **filter_valid.py**: Filtra produtos válidos
- **sku_governor.py**: SKU Governor - validação e normalização completa
- **validate_merge.py**: Valida merge de produtos

## Usage

```powershell
python core/validators/sku_governor.py distributors/neosolar/panels.json --category panel
```
"@

    "core/enrichers/README.md" = @"
# Enrichers

Scripts de enriquecimento de produtos com LLM.

## Scripts

- **enrich_schemas.py**: Enriquecimento com schemas validados
- **enrich_complete.py**: Enriquecimento completo do inventário
- **llm_enricher.py**: Enricher base com LLM
- **focused_enricher.py**: Enricher focado em campos específicos
- **simple_enricher.py**: Enricher simples e rápido

## Usage

```powershell
python core/enrichers/enrich_schemas.py
```
"@

    "core/composers/README.md" = @"
# Composers

Scripts de composição de bundles e catálogos.

## Scripts

- **bundle_composer.py**: Compõe bundles virtuais
- **catalog_generator.py**: Gera catálogo Medusa
- **merge_to_medusa.py**: Merge de produtos para Medusa

## Usage

```powershell
python core/composers/bundle_composer.py examples/bundle-config.json
```
"@

    "core/importers/README.md" = @"
# Importers

Scripts TypeScript de importação para Medusa.js

## Scripts

- **import_catalog.ts**: Importa catálogo completo
- **import_enriched.ts**: Importa produtos enriquecidos
- **test_import.ts**: Testa importação

## Usage

```powershell
npm run ts-node core/importers/import_enriched.ts
```
"@

    "pipelines/README.md" = @"
# Pipelines

Orquestradores de pipeline completo.

## Scripts

- **run_governor.py**: Pipeline SKU Governor
- **run_complete.py**: Pipeline completo (extract → validate → enrich → import)

## Usage

```powershell
python pipelines/run_complete.py
```
"@

    "analysis/README.md" = @"
# Analysis

Scripts de análise e debugging.

## Scripts

- **analyze_enrichment.py**: Analisa qualidade do enrichment
- **analyze_schema_coverage.py**: Analisa cobertura de schemas
- **analyze_skip_reasons.py**: Analisa motivos de skip
- **analyze_top_products.py**: Analisa top produtos
- **product_filling_analysis.py**: Analisa preenchimento de campos

## Usage

```powershell
python analysis/analyze_enrichment.py data/enriched/complete/enriched_*.json
```
"@
}

foreach ($path in $readmes.Keys) {
    if (-not (Test-Path $path)) {
        $readmes[$path] | Out-File -FilePath $path -Encoding UTF8
        Write-Host "  📝 Criado: $path" -ForegroundColor Gray
    }
}

Write-Host "✅ READMEs criados!" -ForegroundColor Green
Write-Host ""

# =============================================================================
# FASE 10: Criar .gitignore para data/
# =============================================================================
Write-Host "🔒 FASE 10: Criando .gitignore..." -ForegroundColor Cyan

$gitignoreContent = @"
# Ignorar todos os arquivos de dados processados
data/raw/**/*.json
data/validated/**/*.json
data/enriched/**/*.json
data/bundles/**/*.json
data/catalogs/**/*.json

# Manter estrutura de diretórios
!data/raw/.gitkeep
!data/validated/.gitkeep
!data/enriched/.gitkeep
!data/bundles/.gitkeep
!data/catalogs/.gitkeep

# Manter READMEs
!data/**/README.md
"@

$gitignoreContent | Out-File -FilePath "data/.gitignore" -Encoding UTF8
Write-Host "  ✅ Criado: data/.gitignore" -ForegroundColor Gray

# Criar .gitkeep files
@("data/raw", "data/validated", "data/enriched", "data/bundles", "data/catalogs") | ForEach-Object {
    New-Item -ItemType File -Path "$_/.gitkeep" -Force | Out-Null
}

Write-Host "✅ .gitignore configurado!" -ForegroundColor Green
Write-Host ""

# =============================================================================
# SUMÁRIO FINAL
# =============================================================================
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ REORGANIZAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Sumário:" -ForegroundColor Yellow
Write-Host "  • Backup criado em: $backupDir" -ForegroundColor White
Write-Host "  • Estrutura base: 25 diretórios criados" -ForegroundColor White
Write-Host "  • Scripts movidos e organizados" -ForegroundColor White
Write-Host "  • Documentação consolidada" -ForegroundColor White
Write-Host "  • READMEs criados em cada módulo" -ForegroundColor White
Write-Host "  • .gitignore configurado" -ForegroundColor White
Write-Host ""

Write-Host "📋 Próximos Passos:" -ForegroundColor Yellow
Write-Host "  1. Revisar arquivos movidos" -ForegroundColor White
Write-Host "  2. Atualizar imports nos scripts (se necessário)" -ForegroundColor White
Write-Host "  3. Executar testes para validar" -ForegroundColor White
Write-Host "  4. Commit changes com git" -ForegroundColor White
Write-Host ""

Write-Host "💡 Para reverter:" -ForegroundColor Yellow
Write-Host "  Remove-Item '$baseDir' -Recurse -Force" -ForegroundColor White
Write-Host "  Copy-Item '$backupDir' '$baseDir' -Recurse" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Reorganização completa!" -ForegroundColor Green
