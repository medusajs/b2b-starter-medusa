# Scripts de Normalização de Catálogo

Scripts para normalização do catálogo unificado YSH Solar, abstraindo distribuidores e criando SKUs únicos com precificação multi-distribuidor.

## 🎯 Objetivo

Transformar catálogo bruto de múltiplos distribuidores em catálogo unificado focado em:

- **Fabricantes** → **Séries** → **Modelos** → **SKUs únicos**
- Precificação comparativa entre distribuidores
- Deduplicação inteligente de produtos
- Normalização de kits em componentes

## 📦 Scripts Disponíveis

### 1. `01-extract-manufacturers.ts`

Extrai fabricantes únicos do catálogo e classifica por TIER.

**Entrada**: `unified_schemas/*.json`  
**Saída**: `unified_schemas/manufacturers.json`

**Funcionalidades**:

- Normalização de nomes de fabricantes
- Resolução de aliases (e.g., "CANADIAN" → "CANADIAN SOLAR")
- Classificação TIER (1, 2, 3)
- Estatísticas por fabricante

**Uso**:

```bash
yarn ts-node src/scripts/normalize-catalog/01-extract-manufacturers.ts
```

### 2. `02-generate-skus.ts`

Gera SKUs únicos para produtos, com deduplicação inteligente.

**Entrada**: `unified_schemas/*.json`  
**Saída**: `unified_schemas/skus_unified.json`

**Funcionalidades**:

- Geração de SKUs únicos (`FABRICANTE-CAT-MODELO-VARIANTE`)
- Deduplicação baseada em:
  - Fabricante (normalizado)
  - Modelo (fuzzy matching 90%+)
  - Especificações técnicas (tolerância 5%)
- Agregação de ofertas por distribuidor
- Cálculo de pricing summary (min, max, avg, median, variação)

**Algoritmo de Deduplicação**:

```
Score = Fabricante (30pts) + Modelo (30pts) + Specs (40pts)
Duplicata se Score >= 85%
```

**Uso**:

```bash
yarn ts-node src/scripts/normalize-catalog/02-generate-skus.ts
```

### 3. `03-normalize-kits.ts`

Normaliza kits solares, decompondo em componentes e mapeando para SKUs.

**Entrada**:

- `unified_schemas/kits_unified.json`
- `unified_schemas/skus_unified.json`

**Saída**: `unified_schemas/kits_normalized.json`

**Funcionalidades**:

- Decomposição de kits em componentes (painéis, inversores, baterias)
- Mapeamento de componentes para SKUs unificados
- Cálculo de desconto de kit vs. componentes individuais
- Agregação de ofertas de kit por distribuidor
- Score de confiança de mapeamento

**Uso**:

```bash
yarn ts-node src/scripts/normalize-catalog/03-normalize-kits.ts
```

### 4. `index.ts` (Orquestrador)

Executa pipeline completo de normalização.

**Funcionalidades**:

- Executa todos os passos em sequência
- Gera relatório consolidado
- Calcula métricas de qualidade

**Uso**:

```bash
# Pipeline completo
yarn normalize:catalog

# Apenas um passo específico
yarn normalize:catalog --step=1    # Fabricantes
yarn normalize:catalog --step=2    # SKUs
yarn normalize:catalog --step=3    # Kits
```

## 🚀 Quick Start

### 1. Executar Normalização Completa

```bash
cd backend
yarn normalize:catalog
```

### 2. Verificar Resultados

Arquivos gerados em `backend/data/catalog/unified_schemas/`:

- `manufacturers.json` - Fabricantes únicos
- `skus_unified.json` - SKUs com ofertas multi-distribuidor
- `kits_normalized.json` - Kits normalizados
- `NORMALIZATION_REPORT.json` - Relatório de execução

### 3. Analisar Relatório

```bash
cat data/catalog/unified_schemas/NORMALIZATION_REPORT.json
```

## 📊 Métricas Esperadas

Com base no catálogo atual (1161 produtos):

| Métrica | Valor Esperado |
|---------|----------------|
| **Produtos de Entrada** | 1161 |
| **SKUs Únicos Gerados** | ~800-900 |
| **Taxa de Deduplicação** | ~20-30% |
| **Fabricantes Únicos** | ~40-60 |
| **Ofertas/SKU (média)** | 1.3-1.5 |
| **SKUs com Múltiplas Ofertas** | 15-25% |
| **Taxa de Mapeamento (Kits)** | 85-95% |

## 🔧 Configuração

### Adicionar Novo Fabricante TIER

Editar `01-extract-manufacturers.ts`:

```typescript
const MANUFACTURER_METADATA: Record<string, Partial<ManufacturerData>> = {
  "NOVO_FABRICANTE": { tier: "TIER_1", country: "Brasil" },
  // ...
};
```

### Adicionar Alias de Fabricante

```typescript
const MANUFACTURER_ALIASES: Record<string, string[]> = {
  "CANADIAN SOLAR": ["CANADIAN", "CS", "CANADIAN-SOLAR"],
  // ...
};
```

### Ajustar Thresholds de Deduplicação

Editar `02-generate-skus.ts`:

```typescript
// Linha ~140
const similarity = calculateStringSimilarity(productModel, existingSKU.model_number);
if (similarity > 0.9) {  // Ajustar threshold (padrão: 0.9)
  // ...
}
```

## 📝 Output Schemas

### SKU Schema

```typescript
{
  "id": "DEYE-INV-SUNM2250G4-220V",
  "manufacturer_id": "deye",
  "manufacturer_name": "DEYE",
  "model_number": "SUN-M2250G4-EU-Q0",
  "category": "inverters",
  "technical_specs": {
    "power_w": 2250,
    "voltage_v": 220,
    "type": "MICROINVERSOR"
  },
  "distributor_offers": [
    {
      "distributor": "FOTUS",
      "price": 1850.00,
      "available": true,
      "quantity": 5
    },
    {
      "distributor": "NEOSOLAR",
      "price": 1920.00,
      "available": true,
      "quantity": 12
    }
  ],
  "pricing_summary": {
    "lowest_price": 1850.00,
    "highest_price": 1920.00,
    "avg_price": 1885.00,
    "price_variation_pct": 3.78
  }
}
```

### Kit Normalized Schema

```typescript
{
  "id": "KIT-1.2KWP-ASTRONERGY-TSUNESS",
  "system_capacity_kwp": 1.2,
  "components": [
    {
      "component_type": "panel",
      "sku_id": "ASTRONERGY-PAN-ASTRON600W",
      "quantity": 2,
      "unit_price": 520.00
    },
    {
      "component_type": "inverter",
      "sku_id": "TSUNESS-INV-SUN2250",
      "quantity": 1,
      "unit_price": 1850.00
    }
  ],
  "pricing": {
    "total_components_price": 2890.00,
    "kit_price": 2706.07,
    "discount_amount": 183.93,
    "discount_pct": 6.36
  },
  "kit_offers": [
    {
      "distributor": "FOTUS",
      "kit_price": 2706.07,
      "available_components": 2,
      "total_components": 2
    }
  ]
}
```

## 🐛 Troubleshooting

### Erro: "Cannot find module"

Compilar TypeScript primeiro:

```bash
yarn tsc
```

### Erro: "File not found"

Verificar que os dados unificados existem:

```bash
ls -la data/catalog/unified_schemas/*.json
```

### Baixa Taxa de Deduplicação

1. Verificar normalização de fabricantes
2. Ajustar threshold de similaridade (linha ~140 no script 2)
3. Verificar qualidade dos dados de entrada

### Muitos Componentes Não Mapeados (Kits)

1. Executar script 2 primeiro (gerar SKUs)
2. Verificar nomenclatura de componentes em `kits_unified.json`
3. Adicionar aliases de fabricantes em script 1

## 📚 Documentação Relacionada

- [Estratégia de Catálogo Unificado](../../docs/implementation/UNIFIED_CATALOG_STRATEGY.md)
- [Schemas JSON](../../../SCHEMAS_JSON_YSH.md)
- [SEMANTIC_ANALYSIS](../../../data/catalog/unified_schemas/SEMANTIC_ANALYSIS.json)

## 🔄 Próximos Passos

Após normalização:

1. **Importar para Medusa**:

   ```bash
   yarn seed:unified-catalog
   ```

2. **Criar Módulo `unified-catalog`** no Medusa

3. **Implementar APIs**:
   - `GET /store/catalog/skus`
   - `GET /store/catalog/skus/:id/compare`
   - `GET /store/catalog/manufacturers`

4. **Frontend**: Componente de comparação de preços

---

**Criado**: 2025-10-09  
**Autor**: GitHub Copilot  
**Versão**: 1.0
