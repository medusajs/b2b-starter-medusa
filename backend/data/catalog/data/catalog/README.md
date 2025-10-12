# 📦 Catálogo YSH Solar Hub - Estrutura Organizada

**Versão**: 2.1.0 (Reorganização Final)
**Data**: Outubro 2025
**Status**: ✅ **ORGANIZAÇÃO COMPLETA**

---

## 🏗️ Nova Estrutura Organizacional

O catálogo foi **completamente reorganizado** em duas estruturas principais:

### 🎯 `/unified_schemas/` - SCHEMAS CONSOLIDADOS

**👆 USE ESTES PARA PRODUÇÃO!**

- ✅ **Dados consolidados** de todos os distribuidores
- ✅ **Normalizados e validados**
- ✅ **Sem duplicatas**
- ✅ **Estrutura padronizada**
- ✅ **1.161 produtos únicos**

### 📊 `/distributor_datasets/` - DATASETS POR DISTRIBUIDOR

- 🔍 **Dados específicos** por fornecedor
- 🛠️ **Para análises comparativas**
- 🔄 **Dados brutos e processados**
- 📈 **Rastreabilidade de origem**

---

## 📁 Estrutura Completa

```
catalog/
├── 🎯 unified_schemas/              ← USAR PARA PRODUÇÃO
│   ├── inverters_unified.json       (490 produtos)
│   ├── kits_unified.json           (336 produtos)
│   ├── ev_chargers_unified.json    (83 produtos)
│   ├── panels_unified.json         (29 produtos)
│   ├── batteries_unified.json      (21 produtos)
│   ├── [outros 7 arquivos...]
│   ├── MASTER_INDEX.json           (índice completo)
│   ├── INTEGRITY_REPORT.json       (qualidade dos dados)
│   └── README.md                    (documentação detalhada)
│
├── 📊 distributor_datasets/         ← DADOS POR DISTRIBUIDOR
│   ├── neosolar/
│   │   ├── neosolar_catalog.csv
│   │   └── README.md
│   ├── solfacil/
│   │   ├── solfacil-inverters.json
│   │   ├── solfacil-panels.json
│   │   ├── [outros arquivos...]
│   │   └── README.md
│   ├── odex/
│   │   ├── odex-inverters.json
│   │   ├── odex-panels.json
│   │   ├── [outros arquivos...]
│   │   └── README.md
│   ├── fotus/
│   │   ├── fotus-kits.json
│   │   ├── fotus-kits-hibridos.json
│   │   ├── extracted/
│   │   ├── schemas/
│   │   └── README.md
│   ├── fortlev/
│   │   └── README.md
│   ├── raw_csv/
│   │   ├── https___*.csv
│   │   └── README.md
│   └── README.md
│
├── � consolidated/                 ← ARQUIVOS CONSOLIDADOS AUXILIARES
│   ├── accessories.json
│   ├── cables.json
│   ├── chargers.json
│   ├── controllers.json
│   └── posts.json
│
├── 📊 reports/                      ← RELATÓRIOS E INVENTÁRIOS
│   ├── CATALOG_INVENTORY.json
│   ├── INVENTORY_REVIEW_REPORT.md
│   └── MIGRATION_REPORT.md
│
├── 📖 docs/                         ← DOCUMENTAÇÃO HISTÓRICA
│   ├── CONSOLIDACAO_VERIFICADA.md
│   └── READY_FOR_UX_UI.md
│
├── �️ images/                       ← IMAGENS E ASSETS
│   ├── IMAGE_MAP.json
│   ├── image_paths.txt
│   ├── content_ingress=portalb2b.neosolar.com.br.png
│   └── [subdiretórios por categoria]/
│
├── 📦 legacy/                       ← ARQUIVO HISTÓRICO
│   ├── *.backup
│   └── documentação antiga
│
├── ✅ panel-schema.json             ← SCHEMA DE VALIDAÇÃO
├── ✅ inverter-schema.json          ← SCHEMA DE VALIDAÇÃO
├── 🗂️ INDEX.md                       ← NAVEGAÇÃO RÁPIDA
└── 📋 README.md                      ← ESTE ARQUIVO
```

---

## 🎯 Como Usar

### Para Desenvolvimento/Produção

```javascript
// ✅ CORRETO - Use arquivos unificados
import inverters from './unified_schemas/inverters_unified.json';
import kits from './unified_schemas/kits_unified.json';
```

### Para Análises Específicas

```javascript
// ✅ Para comparar preços por distribuidor
import solfacilInverters from './distributor_datasets/solfacil/solfacil-inverters.json';
import odexInverters from './distributor_datasets/odex/odex-inverters.json';
```

### Para Dados Brutos

```javascript
// ✅ Para reprocessamento ou debugging
import rawData from './distributor_datasets/raw_csv/https___portalb2b.neosolar.com.csv';
```

---

## 📊 Estatísticas do Catálogo

| Categoria | Produtos | Principal Distribuidor |
|-----------|----------|------------------------|
| **Inversores** | 490 | NeoSolar (52%), ODEX (24%) |
| **Kits** | 336 | NeoSolar (97%), FOTUS (1%) |
| **Carregadores EV** | 83 | NeoSolar (98%) |
| **Painéis** | 29 | ODEX (31%), Solfácil (21%) |
| **Baterias** | 21 | NeoSolar (71%) |
| **Estruturas** | 30 | ODEX (87%) |
| **Outros** | 172 | Diversos |
| **TOTAL** | **1.161** | **5 distribuidores** |

---

## 🔄 Benefícios da Nova Organização

### ✅ Para Desenvolvedores

- **Arquivos únicos por categoria** (não mais dezenas de arquivos)
- **Estrutura de dados padronizada**
- **Validação automática**
- **Índices para busca rápida**
- **Organização clara**: produção, análise, docs, imagens separadas**

### ✅ Para Análistas

- **Dados separados por distribuidor**
- **Rastreabilidade completa**
- **Comparação de preços facilitada**
- **Dados brutos preservados**
- **Relatórios organizados em pasta dedicada**

### ✅ Para o Sistema

- **Performance melhorada** (menos arquivos)
- **Validação centralizada**
- **Duplicatas eliminadas**
- **Consistência garantida**
- **Estrutura escalável e mantível**

---

## ⚠️ Migração

### Arquivos Descontinuados

- ❌ `inverters.json` → ✅ `unified_schemas/inverters_unified.json`
- ❌ `kits.json` → ✅ `unified_schemas/kits_unified.json`
- ❌ `panels.json` → ✅ `unified_schemas/panels_unified.json`
- ❌ `accessories.json` → ✅ `unified_schemas/accessories_unified.json`

### Scripts de Migração

- Atualize imports para apontar para `/unified_schemas/`
- Use `MASTER_INDEX.json` para busca global
- Consulte `INTEGRITY_REPORT.json` para qualidade dos dados

---

## 📞 Suporte

Para dúvidas sobre a nova estrutura:

1. Consulte os READMEs específicos em cada diretório
2. Verifique os relatórios de integridade
3. Use os índices para navegação rápida
