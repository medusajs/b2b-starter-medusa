# 📦 Diretório de Dados do Catálogo

Este diretório contém os dados do catálogo de produtos YSH B2B, incluindo painéis solares, inversores, kits completos, baterias, cabos, estruturas e acessórios.

---

## 📁 Estrutura

```tsx
backend/data/catalog/
├── unified_schemas/          # Schemas JSON unificados por categoria
│   ├── kits_unified.json              # Kits solares completos
│   ├── panels_unified.json            # Painéis fotovoltaicos
│   ├── inverters_unified.json         # Inversores on-grid/off-grid
│   ├── batteries_unified.json         # Baterias e sistemas de armazenamento
│   ├── ev_chargers_unified.json       # Carregadores de veículos elétricos
│   ├── cables_unified.json            # Cabos e conectores
│   ├── structures_unified.json        # Estruturas de fixação
│   ├── accessories_unified.json       # Acessórios diversos
│   ├── stringboxes_unified.json       # String boxes
│   ├── posts_unified.json             # Postes e suportes
│   ├── controllers_unified.json       # Controladores de carga
│   ├── others_unified.json            # Outros produtos
│   └── sku_registry.json              # Registro de SKUs canônicos
│
└── images/                   # Metadados de imagens
    └── IMAGE_MAP.json                 # Mapeamento SKU → URLs de imagens
```

---

## 📊 Estatísticas

- **Total de arquivos**: 39 arquivos JSON
- **Categorias**: 12 categorias de produtos
- **Produtos estimados**: ~2.500+ itens
- **Distribuidores**: 5 (NeoSolar, Solfácil, ODEX, FOTUS, FortLev)

---

## 🔧 Como Usar

### Leitura via Módulo ysh-catalog

```typescript
import { YshCatalogService } from "./modules/ysh-catalog"

// Service configurado automaticamente via medusa-config.ts
const catalogService = container.resolve("ysh-catalog")

// Listar produtos por categoria
const kits = await catalogService.listProductsByCategory("kits", {
  page: 1,
  limit: 50,
  manufacturer: "Canadian Solar",
  minPrice: 10000,
  maxPrice: 50000
})

// Buscar produto específico
const product = await catalogService.getProductById("kits", "kit-001")

// Pesquisa global
const results = await catalogService.searchProducts("inversor growatt", {
  category: "inverters",
  limit: 20
})
```

### Leitura Direta (Scripts)

```typescript
import fs from "fs"
import path from "path"

const CATALOG_PATH = path.resolve(__dirname, "../../data/catalog/unified_schemas")

// Ler catálogo de painéis
const panelsPath = path.join(CATALOG_PATH, "panels_unified.json")
const panels = JSON.parse(fs.readFileSync(panelsPath, "utf-8"))

console.log(`Total de painéis: ${panels.length}`)
```

---

## 📝 Formato dos Schemas

### Exemplo: panels_unified.json

```json
[
  {
    "id": "panel-canadian-550w",
    "sku": "CAN-SOLAR-550W-HiKu6",
    "name": "Painel Solar Canadian Solar 550W HiKu6 Mono PERC",
    "manufacturer": "Canadian Solar",
    "category": "panels",
    "model": "CS6W-550MS",
    "technology": "Monocrystalline PERC",
    "kwp": 0.55,
    "cells": 144,
    "efficiency_pct": 21.2,
    "dimensions_mm": {
      "length": 2278,
      "width": 1134,
      "thickness": 35
    },
    "weight_kg": 27.5,
    "warranty_years": {
      "product": 12,
      "performance": 25
    },
    "price_brl": 850.00,
    "distributor": "NeoSolar",
    "availability": "in_stock",
    "source": "neosolar",
    "processed_images": {
      "thumb": "/images_processed/panels/canadian-solar-550w_thumb.webp",
      "medium": "/images_processed/panels/canadian-solar-550w_medium.webp",
      "large": "/images_processed/panels/canadian-solar-550w_large.webp"
    },
    "description": "Painel solar de alta eficiência com tecnologia PERC...",
    "datasheet_url": "https://..."
  }
]
```

### Campos Obrigatórios

- `id`: Identificador único
- `sku`: SKU canônico (ver sku_registry.json)
- `name`: Nome descritivo do produto
- `manufacturer`: Fabricante
- `category`: Categoria (kits, panels, inverters, etc.)
- `price_brl`: Preço base em reais

### Campos Opcionais (variam por categoria)

**Painéis**:

- `kwp`, `cells`, `efficiency_pct`, `dimensions_mm`, `weight_kg`, `warranty_years`

**Inversores**:

- `power_w`, `voltage_v`, `phases`, `mppt_trackers`, `max_input_voltage`

**Kits**:

- `panels[]`, `inverters[]`, `batteries[]`, `total_panels`, `total_power_w`

**Baterias**:

- `capacity_kwh`, `voltage_v`, `chemistry`, `cycles`, `dod_pct`

---

## 🔄 Atualização de Dados

### Via Script de Importação

```powershell
# Backend
cd backend
npm run seed:catalog-integrated
```

Este script:

1. Lê todos os arquivos `*_unified.json`
2. Cria/atualiza produtos no Medusa
3. Sincroniza preços no módulo `ysh-pricing`
4. Gera relatório de importação

### Substituição Manual

1. **Backup** dos arquivos atuais:

   ```powershell
   Copy-Item -Recurse backend/data/catalog backend/data/catalog.backup
   ```

2. **Copiar** novos arquivos para `backend/data/catalog/unified_schemas/`

3. **Validar** JSON:

   ```powershell
   npm run catalog:validate
   ```

4. **Importar** para Medusa:

   ```powershell
   npm run seed:catalog-integrated
   ```

---

## 🔐 Versionamento

Os dados do catálogo são **versionados junto com o código** no Git.

### Quando Commitar

- ✅ Novos produtos adicionados
- ✅ Preços atualizados (mensal/trimestral)
- ✅ Correções de dados (SKUs, especificações)
- ✅ Novos distribuidores

### Quando NÃO Commitar

- ❌ Backups temporários
- ❌ Arquivos de processamento intermediário
- ❌ Logs de importação

### .gitignore

```gitignore
# Já configurado
backend/data/catalog/*.backup
backend/data/catalog/*.log
backend/data/catalog/temp/
```

---

## 📈 Performance

### Cache

O módulo `ysh-catalog` **não usa cache** interno. Lê direto do disco.

O módulo `ysh-pricing` **usa cache Redis**:

- Preços: 1 hora TTL
- Inventário: 5 minutos TTL

### Tamanho

- **Total**: ~15MB (39 arquivos JSON)
- **Maior arquivo**: kits_unified.json (~3MB)
- **Menor arquivo**: others_unified.json (~50KB)

### Tempo de Leitura

- Leitura de 1 categoria: ~10-50ms
- Leitura completa (12 categorias): ~300-500ms
- Importação completa no Medusa: ~2-5 minutos

---

## 🔧 Scripts Úteis

### Gerar Registry de SKUs

```powershell
npm run catalog:sku:gen
```

Gera/atualiza `sku_registry.json` com SKUs canônicos.

### Validar Catálogo

```powershell
npm run catalog:validate
```

Valida:

- JSON bem formado
- Campos obrigatórios presentes
- Preços > 0
- SKUs únicos

### Gerar Relatório de Preços

```powershell
npm run catalog:price:report
```

Gera relatório com:

- Distribuição de preços por categoria
- Preços min/max/médio
- Produtos sem preço

### Normalizar Preços

```powershell
npm run catalog:price:normalize
```

Normaliza formatos de preços (R$ 1.234,56 → 1234.56).

---

## 🐛 Troubleshooting

### Erro: "Cannot find module './data/catalog/unified_schemas/...'"

**Causa**: Arquivo JSON ausente ou caminho incorreto.

**Solução**:

```powershell
# Verificar se arquivos existem
Get-ChildItem backend/data/catalog/unified_schemas/*.json

# Recriar estrutura se necessário
New-Item -ItemType Directory -Path backend/data/catalog/unified_schemas -Force
```

### Erro: "Unexpected token in JSON at position X"

**Causa**: JSON malformado.

**Solução**:

```powershell
# Validar JSON
npm run catalog:validate

# Ou manualmente
Get-Content backend/data/catalog/unified_schemas/kits_unified.json | ConvertFrom-Json
```

### Produtos não aparecem no storefront

**Causas possíveis**:

1. Catálogo não importado
2. Preços não sincronizados
3. Distribuidor inativo

**Diagnóstico**:

```powershell
# Verificar importação
docker logs ysh-b2b-backend-dev | Select-String "import"

# Verificar pricing
docker exec ysh-b2b-backend-dev npm run catalog:price:report

# Verificar distribuidores
Invoke-RestMethod -Uri "http://localhost:9000/admin/distributors" `
  -Headers @{ "Authorization" = "Bearer $adminToken" }
```

---

## 📚 Recursos Relacionados

- **Módulo ysh-catalog**: `backend/src/modules/ysh-catalog/`
- **Módulo ysh-pricing**: `backend/src/modules/ysh-pricing/`
- **Scripts de seed**: `backend/src/scripts/seed-catalog*.ts`
- **Documentação de migração**: `../MIGRATION_ERP_REMOVAL.md`
- **Análise de integração**: `../DOCKER_INTEGRATION_ANALYSIS.md`

---

**Última atualização**: 08/10/2025  
**Mantido por**: YSH B2B Team  
**Contato**: <dev@ysh.solar>
