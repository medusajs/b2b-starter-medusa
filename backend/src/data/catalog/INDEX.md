# 🗂️ Índice de Navegação - Catálogo YSH

**Acesso rápido aos arquivos e documentação do catálogo**

---

## 🎯 Produção (Use estes!)

| Categoria | Arquivo | Produtos |
|-----------|---------|----------|
| **Inversores** | [`unified_schemas/inverters_unified.json`](./unified_schemas/inverters_unified.json) | 490 |
| **Kits Solares** | [`unified_schemas/kits_unified.json`](./unified_schemas/kits_unified.json) | 336 |
| **Carregadores EV** | [`unified_schemas/ev_chargers_unified.json`](./unified_schemas/ev_chargers_unified.json) | 83 |
| **Painéis** | [`unified_schemas/panels_unified.json`](./unified_schemas/panels_unified.json) | 29 |
| **Baterias** | [`unified_schemas/batteries_unified.json`](./unified_schemas/batteries_unified.json) | 21 |

**📋 Arquivos de Controle:**

- [`unified_schemas/MASTER_INDEX.json`](./unified_schemas/MASTER_INDEX.json) - Índice completo
- [`unified_schemas/INTEGRITY_REPORT.json`](./unified_schemas/INTEGRITY_REPORT.json) - Qualidade dos dados

---

## 📊 Análises por Distribuidor

| Distribuidor | Diretório | Produtos |
|--------------|-----------|----------|
| **NeoSolar** | [`distributor_datasets/neosolar/`](./distributor_datasets/neosolar/) | ~425 |
| **Solfácil** | [`distributor_datasets/solfacil/`](./distributor_datasets/solfacil/) | ~142 |
| **ODEX** | [`distributor_datasets/odex/`](./distributor_datasets/odex/) | ~93 |
| **FOTUS** | [`distributor_datasets/fotus/`](./distributor_datasets/fotus/) | ~4 |
| **FortLev** | [`distributor_datasets/fortlev/`](./distributor_datasets/fortlev/) | ~7 |

---

## 📖 Documentação

| Arquivo | Descrição |
|---------|-----------|
| [`README.md`](./README.md) | Visão geral da nova estrutura |
| [`unified_schemas/README.md`](./unified_schemas/README.md) | Documentação dos schemas unificados |
| [`distributor_datasets/README.md`](./distributor_datasets/README.md) | Guia dos datasets por distribuidor |

---

## � Estrutura de Diretórios

| Diretório | Conteúdo | Uso |
|-----------|----------|-----|
| **`unified_schemas/`** | Dados consolidados e padronizados | **Produção** |
| **`distributor_datasets/`** | Dados brutos por distribuidor | Análise e debug |
| **`consolidated/`** | Arquivos consolidados adicionais | Produção auxiliar |
| **`reports/`** | Relatórios e inventários | Documentação |
| **`docs/`** | Documentação histórica | Referência |
| **`images/`** | Imagens e mapas de imagens | Assets visuais |
| **`legacy/`** | Arquivos históricos e backups | Arquivo |

---

## �🔍 Busca Rápida

### Por Tipo de Produto

- **Grid-tie**: `inverters_unified.json` → filter by `specifications.type: "grid-tie"`
- **Off-grid**: `inverters_unified.json` → filter by `specifications.type: "off-grid"`
- **Microinversores**: `inverters_unified.json` → filter by `specifications.type: "micro"`
- **Kits residenciais**: `kits_unified.json` → filter by `specifications.power: < 10kW`

### Por Distribuidor

- **NeoSolar**: filter by `source: "portalb2b.neosolar.com.br"`
- **Solfácil**: filter by `source: "loja.solfacil.com.br"`
- **ODEX**: filter by `source: "plataforma.odex.com.br"`

### Por Faixa de Preço

- **Até R$ 1.000**: filter by `pricing.original_price: <= 1000`
- **R$ 1.000-5.000**: filter by `pricing.original_price: 1000-5000`
- **Acima R$ 5.000**: filter by `pricing.original_price: >= 5000`

---

## ⚡ Links Diretos

### Schemas de Validação

- [`panel-schema.json`](./panel-schema.json) - Schema de painéis
- [`inverter-schema.json`](./inverter-schema.json) - Schema de inversores

### Relatórios

- [`reports/MIGRATION_REPORT.md`](./reports/MIGRATION_REPORT.md) - Relatório de migração
- [`reports/INVENTORY_REVIEW_REPORT.md`](./reports/INVENTORY_REVIEW_REPORT.md) - Revisão do inventário

### Dados Históricos

- [`docs/CONSOLIDACAO_VERIFICADA.md`](./docs/CONSOLIDACAO_VERIFICADA.md) - Consolidação verificada
- [`docs/READY_FOR_UX_UI.md`](./docs/READY_FOR_UX_UI.md) - Status de implementação
