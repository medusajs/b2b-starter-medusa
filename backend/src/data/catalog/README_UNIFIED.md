# 📦 Catálogo Unificado YSH Solar Hub

**Versão**: 2.0.0 (Consolidado)  
**Data**: 2025-10-07  
**Status**: ✅ **PRODUÇÃO - SCHEMAS UNIFICADOS**

---

## 🎯 Visão Geral

Catálogo **consolidado e unificado** de produtos solares da YSH:

- ✅ **1.161 produtos** consolidados sem perdas
- ✅ **12 categorias** unificadas (inversores, painéis, kits, etc.)
- ✅ **490 inversores** | **336 kits** | **83 carregadores EV**
- ✅ **99%+ completude** em dados críticos
- ✅ **Rastreabilidade completa** de origem

---

## 📂 Estrutura (USE `unified_schemas/`!)

```
catalog/
├── unified_schemas/              ← 🆕 USAR ESTES ARQUIVOS!
│   ├── inverters_unified.json    (490 produtos)
│   ├── kits_unified.json         (336 produtos)
│   ├── ev_chargers_unified.json  (83 produtos)
│   ├── panels_unified.json       (29 produtos)
│   ├── [outros 8 arquivos]
│   ├── MASTER_INDEX.json         (índice completo)
│   └── INTEGRITY_REPORT.json     (qualidade dos dados)
│
├── schemas_enriched/             ← Kits com specs técnicas
│   ├── fotus-kits-enriched.json  (223 kits)
│   └── fotus-kits-hibridos-enriched.json (24 kits)
│
└── CONSOLIDACAO_VERIFICADA.md    ← 📄 Documentação completa
```

---

## 🚀 Quick Start

```python
from pathlib import Path
import json

# Carregar inversores
SCHEMAS = Path('catalog/unified_schemas')
inverters = json.loads((SCHEMAS / 'inverters_unified.json').read_text())

print(f"📦 {len(inverters)} inversores carregados")

# Filtrar por fabricante
deye = [inv for inv in inverters 
        if 'deye' in inv.get('manufacturer', '').lower()]
print(f"⚡ {len(deye)} inversores Deye")
```

---

## 📊 Estatísticas por Categoria

| Categoria | Produtos | Completude | Status |
|-----------|----------|------------|--------|
| Inversores | 490 | 99.8% | ✅ |
| Kits | 336 | 74.5% | ⚠️ |
| Carregadores EV | 83 | 100% | ✅ |
| Cabos | 55 | 100% | ✅ |
| Estruturas | 40 | 100% | ✅ |
| Controladores | 38 | 100% | ✅ |
| Painéis | 29 | 96.6% | ✅ |
| Acessórios | 17 | 100% | ✅ |
| String Boxes | 13 | 100% | ✅ |
| Baterias | 9 | 100% | ✅ |
| Postes Solares | 6 | 100% | ✅ |
| Outros | 45 | 48.1% | ⚠️ |

**Total**: 1.161 produtos consolidados

---

## 📚 Arquivos Principais

### Schemas Unificados (unified_schemas/)

- `inverters_unified.json` - 490 inversores (Deye, Growatt, Sungrow, etc.)
- `kits_unified.json` - 336 kits completos (FOTUS, Neosolar, etc.)
- `ev_chargers_unified.json` - 83 carregadores veiculares
- `panels_unified.json` - 29 painéis solares
- `cables_unified.json` - 55 cabos solares
- `structures_unified.json` - 40 estruturas de montagem
- `controllers_unified.json` - 38 controladores MPPT
- `accessories_unified.json` - 17 acessórios diversos
- `stringboxes_unified.json` - 13 string boxes
- `batteries_unified.json` - 9 baterias
- `posts_unified.json` - 6 postes solares
- `others_unified.json` - 45 produtos diversos

### Índices e Relatórios

- `MASTER_INDEX.json` - Índice master com totais por categoria
- `CONSOLIDATION_METADATA.json` - Metadados de consolidação
- `INTEGRITY_REPORT.json` - Relatório de qualidade dos dados

---

## 🔍 Schema de Produto

Estrutura comum a todos os produtos:

```json
{
  "id": "unique_product_id",
  "name": "Nome do Produto",
  "manufacturer": "Fabricante",
  "model": "Modelo",
  "price_brl": 1234.56,
  "image_url": "/path/to/image.jpg",
  "metadata": {
    "source": "catalog",
    "merged_from_sources": ["catalog", "unified"],
    "last_consolidated": "2025-10-07T04:48:00"
  }
}
```

Campos adicionais específicos por categoria (ver `CONSOLIDACAO_VERIFICADA.md`).

---

## 🛠️ Manutenção

### Re-consolidar Catálogo

```bash
# Após adicionar novos produtos em catalog/*.json
python consolidate_schemas_unified.py

# Verificar resultado
cat catalog/unified_schemas/INTEGRITY_REPORT.json
```

### Verificar Integridade

```bash
# Ver estatísticas de qualidade
python -c "import json; r=json.load(open('catalog/unified_schemas/INTEGRITY_REPORT.json')); print(f'Total: {r[\"total_products\"]} produtos')"
```

---

## 📄 Documentação Completa

- **[CONSOLIDACAO_VERIFICADA.md](./CONSOLIDACAO_VERIFICADA.md)** - Documentação técnica completa da consolidação
- **[CATALOG_INVENTORY.json](./CATALOG_INVENTORY.json)** - Inventário detalhado de todos os arquivos

---

## 🔗 Integração

### PostgreSQL

```sql
CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,
    name TEXT NOT NULL,
    category VARCHAR(50),
    manufacturer VARCHAR(255),
    price_brl DECIMAL(10,2),
    metadata JSONB
);
```

### API REST (FastAPI)

```python
@app.get("/api/products/{category}")
async def get_products(category: str):
    file = Path(f'catalog/unified_schemas/{category}_unified.json')
    return json.loads(file.read_text())
```

---

## ✅ Garantias de Qualidade

- ✅ 100% dos produtos com ID único
- ✅ 99%+ dos produtos com nome e fabricante
- ✅ 0 duplicatas (942 merges inteligentes executados)
- ✅ 100% rastreabilidade à fonte original
- ✅ Integridade verificada por categoria

---

**Versão**: 2.0.0  
**Consolidado**: 2025-10-07  
**Status**: ✅ Pronto para Produção
