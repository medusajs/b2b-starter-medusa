# 📁 Plano de Reorganização do Inventário

**Data**: 17 de Outubro de 2025  
**Status**: 🚧 Em Progresso  
**Objetivo**: Estrutura clara, modular e manutenível

---

## 🎯 Problemas Atuais

### 1. Arquivos Dispersos na Raiz (40+ arquivos)
- 21 scripts Python misturados
- 15+ documentos Markdown
- 5 arquivos TypeScript
- Difícil navegação e manutenção

### 2. Duplicação de Documentação
- 3 READMEs diferentes (README.md, COMPLETE-SYSTEM-GUIDE.md, PROJECT_STATUS_EXECUTIVE.md)
- Múltiplos "summaries" e "reports" com overlap
- Difícil encontrar informação autoritativa

### 3. Estrutura de Diretórios Confusa
- `complete-inventory/` vs `consolidated-inventory/` vs `enriched-complete/`
- `schemas/` vs `enriched-schemas/`
- Propósito não claro

### 4. Scripts Órfãos
- `analyze_*.py` (4 scripts de análise)
- `simple_enricher.py` vs `focused_enricher.py` vs `llm_product_enricher.py`
- Qual usar quando?

---

## ✨ Nova Estrutura Proposta

```
backend/data/products-inventory/
│
├── 📘 README.md                          # Documento principal (único)
├── 📋 CHANGELOG.md                       # Histórico de mudanças
│
├── 🔧 core/                              # Scripts principais de produção
│   ├── extractors/
│   │   ├── extract_complete.py          # (era extract_COMPLETE_inventory.py)
│   │   ├── extract_consolidated.py      # (era extract_consolidated_inventory.py)
│   │   └── README.md
│   │
│   ├── validators/
│   │   ├── filter_valid.py              # (era filter_valid_products.py)
│   │   ├── sku_governor.py              # (era sku-governor.py)
│   │   └── README.md
│   │
│   ├── enrichers/
│   │   ├── enrich_schemas.py            # (era enrich_schemas_with_llm.py)
│   │   ├── enrich_complete.py           # (era enrich_complete_inventory.py)
│   │   └── README.md
│   │
│   ├── composers/
│   │   ├── bundle_composer.py           # (era bundle-composer.py)
│   │   ├── catalog_generator.py         # (era generate_medusa_catalog.py)
│   │   └── README.md
│   │
│   ├── importers/
│   │   ├── import_catalog.ts            # (era import-catalog-to-medusa.ts)
│   │   ├── import_enriched.ts           # (era import-enriched-to-medusa.ts)
│   │   └── README.md
│   │
│   └── gateways/
│       ├── unified_gateway.py
│       ├── Dockerfile.gateway
│       ├── docker-compose.gateway.yml
│       └── README.md
│
├── 🔄 pipelines/                         # Orquestradores de pipeline
│   ├── run_governor.py                  # (era run-governor-pipeline.py)
│   ├── run_complete.py                  # (era run_complete_pipeline.py)
│   ├── configs/
│   │   ├── default.yaml
│   │   ├── production.yaml
│   │   └── staging.yaml
│   └── README.md
│
├── 🧪 tests/                             # Scripts de teste
│   ├── test_sku_governor.ps1
│   ├── test_bundle_composer.ps1
│   ├── test_import.ts
│   ├── fixtures/
│   └── README.md
│
├── 📊 analysis/                          # Scripts de análise/debug
│   ├── analyze_enrichment.py
│   ├── analyze_schema_coverage.py
│   ├── analyze_skip_reasons.py
│   ├── analyze_top_products.py
│   ├── product_filling_analysis.py
│   └── README.md
│
├── 📚 docs/                              # Documentação consolidada
│   ├── guides/
│   │   ├── QUICK_START.md
│   │   ├── SKU_GOVERNOR.md             # Merge de SKU-GOVERNOR-*.md
│   │   ├── BUNDLE_COMPOSER.md          # BUNDLE-COMPOSER-README.md
│   │   ├── DEPLOYMENT.md               # DEPLOYMENT-GUIDE.md
│   │   └── IMPORT_USAGE.md             # IMPORT_USAGE_GUIDE.md
│   │
│   ├── architecture/
│   │   ├── SYSTEM_OVERVIEW.md          # COMPLETE-SYSTEM-GUIDE.md
│   │   ├── INVENTORY_BLUEPRINT.md      # INVENTORY_BLUEPRINT_360.md
│   │   └── DATA_FLOWS.md
│   │
│   ├── reports/
│   │   ├── PROJECT_STATUS.md           # PROJECT_STATUS_EXECUTIVE.md
│   │   ├── IMPLEMENTATION.md           # IMPLEMENTATION_COMPLETE.md
│   │   ├── CATALOG_GENERATION.md       # CATALOG_GENERATION_SUMMARY.md
│   │   ├── ENRICHMENT.md               # ENRICHMENT_COMPLETE_SUMMARY.md
│   │   ├── PRICING_ANALYSIS.md         # PRICING_PERFORMANCE_ANALYSIS_360.md
│   │   └── SCHEMA_COVERAGE.md          # SCHEMA-COVERAGE-REPORT.md
│   │
│   └── legacy/                          # Docs antigas (arquivadas)
│       ├── PROXIMOS-PASSOS.md
│       ├── MEDUSA_IMPORT_READY.md
│       └── EXECUTIVE-IMPLEMENTATION-REPORT.md
│
├── 📦 data/                              # Dados processados (gitignored)
│   ├── raw/                             # Extrações brutas
│   │   ├── complete/                    # (era complete-inventory/)
│   │   └── consolidated/                # (era consolidated-inventory/)
│   │
│   ├── validated/                       # Produtos validados
│   │   └── valid_products_*.json
│   │
│   ├── enriched/                        # Produtos enriquecidos
│   │   ├── complete/                    # (era enriched-complete/)
│   │   └── schemas/                     # (era enriched-schemas/)
│   │
│   ├── bundles/                         # Bundles gerados
│   │   └── *.json
│   │
│   └── catalogs/                        # Catálogos Medusa
│       └── complete_catalog_*.json
│
├── 🏭 distributors/                      # Dados dos distribuidores
│   ├── neosolar/
│   ├── fortlev/
│   ├── fotus/
│   ├── odex/
│   └── README.md
│
├── 📐 schemas/                           # Schemas de validação
│   ├── panels/
│   ├── inverters/
│   ├── batteries/
│   ├── structures/
│   └── README.md
│
├── 🔍 semantic/                          # Vector search & embeddings
│   └── README.md
│
├── 📝 examples/                          # Dados de exemplo
│   ├── neosolar-panels-sample.json
│   ├── bundle-config-*.json
│   └── README.md
│
├── 🛠️ scripts/                           # Utilitários auxiliares
│   ├── migration/
│   │   └── reorganize.ps1              # Script de migração
│   ├── setup/
│   │   └── install_deps.ps1
│   └── utils/
│       └── *.py
│
├── ⚙️ config/                            # Configurações
│   ├── payment-splits-types.ts
│   ├── requirements-gateway.txt
│   └── bundles/
│       └── *.json
│
└── 🌊 data-pipeline/                     # Pipeline de dados (sub-projeto)
    ├── README.md
    ├── docker-compose.yml
    └── ... (mantido como está)
```

---

## 🚀 Plano de Migração

### Fase 1: Criar Estrutura Base ✅

```powershell
# Criar diretórios principais
New-Item -ItemType Directory -Force -Path "core/extractors"
New-Item -ItemType Directory -Force -Path "core/validators"
New-Item -ItemType Directory -Force -Path "core/enrichers"
New-Item -ItemType Directory -Force -Path "core/composers"
New-Item -ItemType Directory -Force -Path "core/importers"
New-Item -ItemType Directory -Force -Path "core/gateways"
New-Item -ItemType Directory -Force -Path "pipelines/configs"
New-Item -ItemType Directory -Force -Path "tests/fixtures"
New-Item -ItemType Directory -Force -Path "analysis"
New-Item -ItemType Directory -Force -Path "docs/guides"
New-Item -ItemType Directory -Force -Path "docs/architecture"
New-Item -ItemType Directory -Force -Path "docs/reports"
New-Item -ItemType Directory -Force -Path "docs/legacy"
New-Item -ItemType Directory -Force -Path "data/raw/complete"
New-Item -ItemType Directory -Force -Path "data/raw/consolidated"
New-Item -ItemType Directory -Force -Path "data/validated"
New-Item -ItemType Directory -Force -Path "data/enriched/complete"
New-Item -ItemType Directory -Force -Path "data/enriched/schemas"
New-Item -ItemType Directory -Force -Path "data/bundles"
New-Item -ItemType Directory -Force -Path "data/catalogs"
New-Item -ItemType Directory -Force -Path "scripts/migration"
New-Item -ItemType Directory -Force -Path "scripts/setup"
New-Item -ItemType Directory -Force -Path "scripts/utils"
New-Item -ItemType Directory -Force -Path "config/bundles"
```

### Fase 2: Mover Scripts Core

```powershell
# Extractors
Move-Item "extract_COMPLETE_inventory.py" "core/extractors/extract_complete.py"
Move-Item "extract_consolidated_inventory.py" "core/extractors/extract_consolidated.py"

# Validators
Move-Item "filter_valid_products.py" "core/validators/filter_valid.py"
Move-Item "sku-governor.py" "core/validators/sku_governor.py"

# Enrichers
Move-Item "enrich_schemas_with_llm.py" "core/enrichers/enrich_schemas.py"
Move-Item "enrich_complete_inventory.py" "core/enrichers/enrich_complete.py"

# Composers
Move-Item "bundle-composer.py" "core/composers/bundle_composer.py"
Move-Item "generate_medusa_catalog.py" "core/composers/catalog_generator.py"

# Importers
Move-Item "import-catalog-to-medusa.ts" "core/importers/import_catalog.ts"
Move-Item "import-enriched-to-medusa.ts" "core/importers/import_enriched.ts"

# Gateways
Move-Item "unified_gateway.py" "core/gateways/"
Move-Item "Dockerfile.gateway" "core/gateways/"
Move-Item "docker-compose.gateway.yml" "core/gateways/"
```

### Fase 3: Mover Pipelines

```powershell
Move-Item "run-governor-pipeline.py" "pipelines/run_governor.py"
Move-Item "run_complete_pipeline.py" "pipelines/run_complete.py"
```

### Fase 4: Mover Scripts de Análise

```powershell
Move-Item "analyze_*.py" "analysis/"
Move-Item "product_filling_analysis.py" "analysis/"
```

### Fase 5: Mover Testes

```powershell
Move-Item "test-*.ps1" "tests/"
Move-Item "test-*.ts" "tests/"
```

### Fase 6: Reorganizar Docs

```powershell
# Guides
Move-Item "SKU-GOVERNOR-README.md" "docs/guides/SKU_GOVERNOR.md"
Move-Item "SKU-GOVERNOR-USAGE.md" -Destination "docs/guides/SKU_GOVERNOR.md" -Force
Move-Item "BUNDLE-COMPOSER-README.md" "docs/guides/BUNDLE_COMPOSER.md"
Move-Item "DEPLOYMENT-GUIDE.md" "docs/guides/DEPLOYMENT.md"
Move-Item "IMPORT_USAGE_GUIDE.md" "docs/guides/IMPORT_USAGE.md"

# Architecture
Move-Item "COMPLETE-SYSTEM-GUIDE.md" "docs/architecture/SYSTEM_OVERVIEW.md"
Move-Item "INVENTORY_BLUEPRINT_360.md" "docs/architecture/INVENTORY_BLUEPRINT.md"

# Reports
Move-Item "PROJECT_STATUS_EXECUTIVE.md" "docs/reports/PROJECT_STATUS.md"
Move-Item "IMPLEMENTATION_COMPLETE.md" "docs/reports/IMPLEMENTATION.md"
Move-Item "CATALOG_GENERATION_SUMMARY.md" "docs/reports/CATALOG_GENERATION.md"
Move-Item "ENRICHMENT_COMPLETE_SUMMARY.md" "docs/reports/ENRICHMENT.md"
Move-Item "PRICING_PERFORMANCE_ANALYSIS_360.md" "docs/reports/PRICING_ANALYSIS.md"
Move-Item "SCHEMA-COVERAGE-REPORT.md" "docs/reports/SCHEMA_COVERAGE.md"

# Legacy
Move-Item "PROXIMOS-PASSOS.md" "docs/legacy/"
Move-Item "MEDUSA_IMPORT_READY.md" "docs/legacy/"
Move-Item "EXECUTIVE-IMPLEMENTATION-REPORT.md" "docs/legacy/"
```

### Fase 7: Reorganizar Data

```powershell
# Raw data
Move-Item "complete-inventory/*" "data/raw/complete/"
Move-Item "consolidated-inventory/*" "data/raw/consolidated/"

# Enriched data
Move-Item "enriched-complete/*" "data/enriched/complete/"
Move-Item "enriched-schemas/*" "data/enriched/schemas/"

# Remove diretórios vazios
Remove-Item "complete-inventory" -Force
Remove-Item "consolidated-inventory" -Force
Remove-Item "enriched-complete" -Force
Remove-Item "enriched-schemas" -Force
```

### Fase 8: Mover Configs

```powershell
Move-Item "payment-splits-types.ts" "config/"
Move-Item "requirements-gateway.txt" "config/"
```

### Fase 9: Atualizar Imports

Criar script de migração que atualiza todos os imports nos arquivos Python/TypeScript:

```python
# scripts/migration/update_imports.py
import re
from pathlib import Path

IMPORT_MAPPINGS = {
    'extract_COMPLETE_inventory': 'core.extractors.extract_complete',
    'extract_consolidated_inventory': 'core.extractors.extract_consolidated',
    'filter_valid_products': 'core.validators.filter_valid',
    'sku-governor': 'core.validators.sku_governor',
    'enrich_schemas_with_llm': 'core.enrichers.enrich_schemas',
    'enrich_complete_inventory': 'core.enrichers.enrich_complete',
    'bundle-composer': 'core.composers.bundle_composer',
    'generate_medusa_catalog': 'core.composers.catalog_generator',
}

def update_imports(file_path):
    # Lê arquivo, atualiza imports, salva
    pass
```

### Fase 10: Criar README.md Principal

Consolidar informações de:
- README.md atual
- COMPLETE-SYSTEM-GUIDE.md
- PROJECT_STATUS_EXECUTIVE.md

Em um único README.md autoritativo.

---

## 📋 Checklist de Validação

Após reorganização, verificar:

- [ ] Todos os scripts executam corretamente
- [ ] Pipelines funcionam end-to-end
- [ ] Testes passam
- [ ] Imports atualizados
- [ ] Documentação consistente
- [ ] Dados preservados
- [ ] Git history preservado (usando `git mv` quando possível)

---

## 🎯 Benefícios Esperados

### 1. Navegação Clara
- Scripts organizados por função
- Docs separados por tipo
- Dados separados por estágio

### 2. Manutenibilidade
- Fácil encontrar código relevante
- Responsabilidades claras
- Menos duplicação

### 3. Onboarding
- Estrutura intuitiva
- Documentação consolidada
- Exemplos claros

### 4. CI/CD
- Pipelines bem definidos
- Testes isolados
- Configs centralizadas

---

## 📊 Comparação Antes/Depois

### Antes (Raiz com 40+ arquivos)

```
products-inventory/
├── analyze_*.py (4 arquivos)
├── *_enricher.py (3 arquivos)
├── extract_*.py (2 arquivos)
├── *.md (15 arquivos)
├── *.ts (5 arquivos)
├── *.ps1 (3 arquivos)
└── ... (difícil navegar)
```

### Depois (Estrutura Modular)

```
products-inventory/
├── README.md (único, autoritativo)
├── core/ (produção)
├── pipelines/ (orquestração)
├── tests/ (QA)
├── analysis/ (debug)
├── docs/ (bem organizada)
├── data/ (gitignored)
└── config/ (centralizadas)
```

---

## 🚨 Riscos e Mitigações

### Risco 1: Quebrar imports existentes
**Mitigação**: Script de atualização automática + testes

### Risco 2: Perder dados
**Mitigação**: Backup antes de migração

### Risco 3: Confusion durante transição
**Mitigação**: Documentar claramente + phase rollout

---

## 📅 Timeline Estimado

- **Fase 1-3** (Scripts): 2 horas
- **Fase 4-6** (Docs): 1 hora
- **Fase 7** (Data): 30 minutos
- **Fase 8-9** (Configs/Imports): 1.5 horas
- **Fase 10** (README): 1 hora
- **Validação**: 1 hora

**Total**: ~7 horas

---

## ✅ Próximos Passos

1. [ ] Revisar e aprovar este plano
2. [ ] Fazer backup completo
3. [ ] Executar migração por fases
4. [ ] Validar cada fase
5. [ ] Atualizar documentação
6. [ ] Commit e push

---

**Preparado por**: AI Development Team  
**Data**: 17 de Outubro de 2025  
**Versão**: 1.0.0
