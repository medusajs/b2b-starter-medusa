# 🏭 Products Inventory - YSH B2B Platform

> **Sistema Completo de Gestão de Inventário Fotovoltaico**  
> **Versão**: 2.0.0 | **Status**: ✅ Production Ready | **Data**: 17 de Outubro de 2025

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Quick Start](#-quick-start)
- [Arquitetura](#-arquitetura)
- [Estrutura de Diretórios](#-estrutura-de-diretórios)
- [Workflows](#-workflows)
- [Documentação](#-documentação)
- [Status do Projeto](#-status-do-projeto)

---

## 🎯 Visão Geral

Sistema end-to-end para gestão de inventário de produtos solares fotovoltaicos com integração completa ao Medusa.js v2.x.

### Funcionalidades Principais

✅ **Extração**: Dados de 5 distribuidores (4,517 produtos)  
✅ **Validação**: SKU Governor com normalização agnóstica  
✅ **Enrichment**: LLM-powered com scores de qualidade  
✅ **Bundles**: Composição dinâmica de kits solares  
✅ **Import**: Integração automática com Medusa.js  
✅ **Analytics**: Análise de preços, qualidade e cobertura

### Números Atuais

| Métrica | Valor | Status |
|---------|-------|--------|
| **Produtos Extraídos** | 4,517 | ✅ |
| **Produtos Validados** | 2,838 (62.8%) | ✅ |
| **Produtos Enriquecidos** | 166 (5.8%) | 🔄 |
| **Categorias** | 18 | ✅ |
| **Distribuidores** | 5 | ✅ |
| **Score Médio** | 58.2/100 | 🟨 |

---

## 🚀 Quick Start

### Pré-requisitos

```powershell
# Python 3.11+
python --version

# Node.js 20+
node --version

# Dependências Python
pip install -r requirements.txt

# Dependências TypeScript (backend)
cd ..\..\..
npm install
```

### Pipeline Completo (End-to-End)

```powershell
# 1. Extração de dados brutos
python core/extractors/extract_complete.py

# 2. Validação e normalização
python core/validators/filter_valid.py

# 3. Enrichment com LLM
python core/enrichers/enrich_complete.py

# 4. Importação para Medusa
npm run ts-node core/importers/import_enriched.ts
```

### Pipeline Automatizado

```powershell
# Executa todo o pipeline de uma vez
python pipelines/run_complete.py
```

### SKU Governor (Validação Individual)

```powershell
# Validar produtos de um distribuidor
python core/validators/sku_governor.py `
  distributors/neosolar/neosolar-panels.json `
  --category panel `
  --distributor neosolar `
  --output-dir data/validated/neosolar/
```

### Bundle Composer

```powershell
# Criar bundle a partir de configuração
python core/composers/bundle_composer.py `
  examples/bundle-config-residential-hybrid.json `
  --output data/bundles/residential-hybrid-payload.json
```

---

## 🏗️ Arquitetura

### Fluxo de Dados

```
┌─────────────────┐
│  Distribuidores │  (JSONs brutos)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Extractors    │  extract_complete.py
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Validators    │  sku_governor.py → SKUs normalizados
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Enrichers     │  enrich_complete.py → LLM analysis
└────────┬────────┘
         │
         ├─────────────────────┐
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│    Composers    │   │    Importers    │
│  (Bundles/Cat)  │   │   (Medusa.js)   │
└────────┬────────┘   └────────┬────────┘
         │                     │
         └──────────┬──────────┘
                    ▼
         ┌─────────────────────┐
         │   Medusa Products   │
         │   + InventoryItems  │
         │   + Bundles         │
         └─────────────────────┘
```

### Componentes Core

#### 1. **Extractors** (`core/extractors/`)
Extração de dados brutos dos distribuidores.

- `extract_complete.py`: Extração completa (4,517 produtos)
- `extract_consolidated.py`: Extração consolidada com normalização

#### 2. **Validators** (`core/validators/`)
Validação e normalização de produtos.

- `sku_governor.py`: **SKU Governor** - Sistema de validação completo
- `filter_valid.py`: Filtro de produtos válidos
- `validate_merge.py`: Validação de merge

#### 3. **Enrichers** (`core/enrichers/`)
Enriquecimento com LLM (Gemma 3, OpenAI, etc).

- `enrich_schemas.py`: Enrichment com schemas validados
- `enrich_complete.py`: Enrichment completo do inventário
- `llm_enricher.py`: Base enricher com LLM
- `focused_enricher.py`: Enricher focado
- `simple_enricher.py`: Enricher simples

#### 4. **Composers** (`core/composers/`)
Composição de bundles e catálogos.

- `bundle_composer.py`: **Bundle Composer** - Composição dinâmica
- `catalog_generator.py`: Gerador de catálogo Medusa
- `merge_to_medusa.py`: Merge de produtos

#### 5. **Importers** (`core/importers/`)
Importação para Medusa.js v2.x (TypeScript).

- `import_enriched.ts`: Importador de produtos enriquecidos
- `import_catalog.ts`: Importador de catálogo completo
- `test_import.ts`: Testes de importação

#### 6. **Pipelines** (`pipelines/`)
Orquestradores de pipeline completo.

- `run_complete.py`: Pipeline end-to-end
- `run_governor.py`: Pipeline SKU Governor

#### 7. **Analysis** (`analysis/`)
Scripts de análise e debugging.

- `analyze_enrichment.py`: Análise de qualidade
- `analyze_schema_coverage.py`: Cobertura de schemas
- `analyze_skip_reasons.py`: Motivos de skip
- `analyze_top_products.py`: Top produtos
- `product_filling_analysis.py`: Preenchimento de campos

---

## 📁 Estrutura de Diretórios

```
products-inventory/
├── 📘 README.md                    # Este arquivo (documento principal)
├── 📋 CHANGELOG.md                 # Histórico de mudanças
├── 📋 REORGANIZATION_PLAN.md       # Plano de reorganização
│
├── 🔧 core/                        # Scripts principais (produção)
│   ├── extractors/                # Extração de dados
│   ├── validators/                # Validação e normalização
│   ├── enrichers/                 # Enrichment com LLM
│   ├── composers/                 # Bundles e catálogos
│   ├── importers/                 # Importação Medusa.js
│   └── gateways/                  # Unified gateway
│
├── 🔄 pipelines/                   # Orquestradores
│   ├── run_complete.py
│   ├── run_governor.py
│   └── configs/                   # Configurações de pipeline
│
├── 🧪 tests/                       # Testes automatizados
│   ├── test_sku_governor.ps1
│   ├── test_bundle_composer.ps1
│   └── fixtures/
│
├── 📊 analysis/                    # Análise e debugging
│   ├── analyze_enrichment.py
│   └── ...
│
├── 📚 docs/                        # Documentação
│   ├── guides/                    # Guias de uso
│   ├── architecture/              # Arquitetura
│   ├── reports/                   # Relatórios
│   └── legacy/                    # Docs antigas
│
├── 📦 data/                        # Dados processados (gitignored)
│   ├── raw/                       # Extrações brutas
│   ├── validated/                 # Produtos validados
│   ├── enriched/                  # Produtos enriquecidos
│   ├── bundles/                   # Bundles gerados
│   └── catalogs/                  # Catálogos Medusa
│
├── 🏭 distributors/                # Dados dos distribuidores
│   ├── neosolar/
│   ├── fortlev/
│   ├── fotus/
│   ├── odex/
│   └── solfacil/
│
├── 📐 schemas/                     # Schemas de validação
│   ├── panels/
│   ├── inverters/
│   ├── batteries/
│   └── structures/
│
├── 🔍 semantic/                    # Vector search & embeddings
│
├── 📝 examples/                    # Dados de exemplo
│   ├── neosolar-panels-sample.json
│   └── bundle-config-*.json
│
├── 🛠️ scripts/                     # Utilitários
│   ├── migration/                 # Scripts de migração
│   ├── setup/                     # Setup inicial
│   └── utils/                     # Utilidades
│
├── ⚙️ config/                      # Configurações
│   ├── payment-splits-types.ts
│   └── bundles/
│
└── 🌊 data-pipeline/               # Data pipeline (sub-projeto)
    └── ... (Pathway, Dagster, etc)
```

---

## 🔄 Workflows

### 1. Onboarding de Novo Distribuidor

```powershell
# 1. Adicionar JSONs do distribuidor
mkdir distributors/novo-distribuidor
# Copiar JSONs para a pasta

# 2. Executar SKU Governor
python core/validators/sku_governor.py `
  distributors/novo-distribuidor/panels.json `
  --category panel `
  --distributor novo-distribuidor `
  --output-dir data/validated/novo-distribuidor/

# 3. Revisar relatório
cat data/validated/novo-distribuidor/novo-distribuidor-panel-normalized-report.json

# 4. Se OK, adicionar ao pipeline completo
# Editar pipelines/configs/production.yaml
```

### 2. Criar Novo Bundle

```powershell
# 1. Criar configuração do bundle
# examples/bundle-config-meu-kit.json
{
  "name": "Kit Solar Residencial 10kWp",
  "sku": "KIT-RESON-10KWP-GROW",
  "components": [
    { "variant_sku": "PNL-JINK-JKM545-540W", "quantity": 18 },
    { "variant_sku": "INV-GROW-MIN-10KW-HYB", "quantity": 1 }
  ],
  "margin": 0.15
}

# 2. Gerar bundle
python core/composers/bundle_composer.py `
  examples/bundle-config-meu-kit.json `
  --output data/bundles/meu-kit-payload.json

# 3. Importar para Medusa
npm run ts-node core/importers/import_enriched.ts `
  --input data/bundles/meu-kit-payload.json
```

### 3. Enrichment Incremental

```powershell
# Enriquecer apenas produtos novos
python core/enrichers/enrich_complete.py `
  --input data/validated/valid_products_latest.json `
  --output data/enriched/complete/enriched_incremental.json `
  --skip-existing `
  --batch-size 50
```

### 4. Análise de Qualidade

```powershell
# Analisar qualidade do enrichment
python analysis/analyze_enrichment.py `
  data/enriched/complete/enriched_*.json

# Analisar cobertura de schemas
python analysis/analyze_schema_coverage.py

# Analisar top produtos
python analysis/analyze_top_products.py
```

---

## 📚 Documentação

### Guias de Uso

| Documento | Descrição |
|-----------|-----------|
| [QUICK_START.md](docs/guides/QUICK_START.md) | Início rápido |
| [SKU_GOVERNOR.md](docs/guides/SKU_GOVERNOR.md) | SKU Governor completo |
| [BUNDLE_COMPOSER.md](docs/guides/BUNDLE_COMPOSER.md) | Bundle Composer |
| [DEPLOYMENT.md](docs/guides/DEPLOYMENT.md) | Deploy em produção |
| [IMPORT_USAGE.md](docs/guides/IMPORT_USAGE.md) | Importação Medusa |

### Arquitetura

| Documento | Descrição |
|-----------|-----------|
| [SYSTEM_OVERVIEW.md](docs/architecture/SYSTEM_OVERVIEW.md) | Visão geral do sistema |
| [INVENTORY_BLUEPRINT.md](docs/architecture/INVENTORY_BLUEPRINT.md) | Blueprint do inventário |
| [DATA_FLOWS.md](docs/architecture/DATA_FLOWS.md) | Fluxos de dados |

### Relatórios

| Documento | Descrição |
|-----------|-----------|
| [PROJECT_STATUS.md](docs/reports/PROJECT_STATUS.md) | Status executivo |
| [IMPLEMENTATION.md](docs/reports/IMPLEMENTATION.md) | Implementação completa |
| [ENRICHMENT.md](docs/reports/ENRICHMENT.md) | Resumo de enrichment |
| [PRICING_ANALYSIS.md](docs/reports/PRICING_ANALYSIS.md) | Análise de preços |

---

## 📊 Status do Projeto

### ✅ Concluído

- [x] Extração de 5 distribuidores (4,517 produtos)
- [x] SKU Governor com normalização agnóstica
- [x] Pipeline de enrichment com LLM
- [x] Bundle Composer para kits virtuais
- [x] Importador Medusa.js v2.x
- [x] Análise de qualidade e cobertura
- [x] Documentação completa
- [x] Reorganização de estrutura

### 🔄 Em Progresso

- [ ] Enrichment de 2,666 produtos (target: 59%)
- [ ] Fix FOTUS data extraction
- [ ] Manufacturer normalization (desbloquear +2,000 produtos)
- [ ] INMETRO coverage (target: 20%+)

### 📋 Próximos Passos

#### Curto Prazo (Esta Semana)

1. **Fix Manufacturer Extraction**
   - Implementar `MANUFACTURER_NORMALIZATION` mapping
   - Desbloquear +2,000 produtos
   - Executar pipeline completo

2. **FOTUS Re-crawl**
   - Corrigir field mapping de preços
   - Validar 695 produtos
   - +400-500 produtos válidos esperados

3. **Production Import**
   - Importar 166 produtos validados para staging
   - Testar queries e filters
   - Go live com catálogo inicial

#### Médio Prazo (Próximas 2 Semanas)

4. **INMETRO Research**
   - Validação manual top 200 produtos
   - Pesquisa adicional de certificações
   - Target: 20%+ coverage

5. **Enrichment Expansion**
   - Enrichment completo de 2,666 produtos
   - Revisão de scores e qualidade
   - Categorias completas (18/18)

6. **Bundle Library**
   - 10+ bundles pré-configurados
   - Testes de disponibilidade dinâmica
   - Importação automática

---

## 🛠️ Desenvolvimento

### Setup Inicial

```powershell
# Clone do repositório
git clone https://github.com/own-boldsbrain/ysh-b2b
cd ysh-b2b/backend/data/products-inventory

# Instalar dependências
pip install -r requirements.txt

# Configurar environment
cp .env.example .env
# Editar .env com suas credenciais (OpenAI, etc)

# Executar testes
.\tests\test_sku_governor.ps1
.\tests\test_bundle_composer.ps1
```

### Executar Reorganização

```powershell
# Executar script de reorganização
.\scripts\migration\reorganize.ps1

# Verificar estrutura
tree /F
```

### Contribuindo

1. Criar branch feature
2. Implementar mudanças
3. Executar testes
4. Atualizar documentação
5. Criar Pull Request

---

## 🔗 Links Úteis

### Medusa.js

- [Medusa Docs](https://docs.medusajs.com)
- [Product Module](https://docs.medusajs.com/resources/references/product)
- [Inventory Module](https://docs.medusajs.com/resources/references/inventory)
- [Inventory Kits Pattern](https://docs.medusajs.com/resources/commerce-modules/product/guides/inventory-kits)

### YSH B2B Platform

- [Copilot Instructions](../../../.github/copilot-instructions.md)
- [Backend Modules](../../../backend/src/modules/)
- [Storefront](../../../storefront/)

---

## 📝 Changelog

### [2.0.0] - 2025-10-17

#### Added
- 🎉 Reorganização completa de estrutura
- 📁 Nova organização modular (core/, pipelines/, docs/, etc)
- 📚 Documentação consolidada
- 🔄 Pipeline automatizado completo
- 🧪 Testes reorganizados

#### Changed
- 📦 Scripts movidos para módulos apropriados
- 📖 Documentação reorganizada por tipo
- 🗂️ Dados separados em data/ (gitignored)

#### Fixed
- 🐛 Duplicação de documentação
- 🔧 Estrutura confusa de diretórios
- 📝 READMEs criados em todos os módulos

### [1.0.0] - 2025-10-14

#### Added
- ✅ Extração completa (4,517 produtos)
- ✅ SKU Governor
- ✅ Bundle Composer
- ✅ Enrichment com LLM (166 produtos)
- ✅ Importador Medusa.js

---

## 👥 Time

**Desenvolvido por**: YSH Solar Development Team  
**Mantido por**: Own Bold's Brain  
**Versão**: 2.0.0  
**Licença**: Proprietário

---

## 📞 Suporte

Para questões ou problemas:

1. Consulte a [documentação](docs/)
2. Execute os [testes](tests/)
3. Revise os [relatórios](docs/reports/)
4. Verifique os [exemplos](examples/)

---

**🎉 Pronto para produção!**
