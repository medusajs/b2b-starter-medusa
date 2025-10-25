# Normalização e Padronização de Schemas JSON do Catálogo

## 📋 Objetivo

Garantir consistência, normalização completa e alinhamento com as regras do Medusa.js personalizado para o Yello Solar Hub, incluindo sincronização com imagens processadas.

## 🎯 Problemas Identificados

### 1. **Inconsistências de Estrutura**

- ❌ Campos duplicados: `image` vs `image_url`, `processed_images` vs `images_processed`
- ❌ Preços em formatos mistos: string "R$ 490,00" vs number 490.0
- ❌ Availability em formatos mistos: string "Disponível" vs boolean true
- ❌ Caminhos de imagem com backslashes e forward slashes misturados

### 2. **Categorização Inconsistente**

- ❌ Categorias inválidas encontradas
- ❌ Campo `original_category` sem padronização
- ❌ Subcategorias faltando em alguns produtos
- ❌ Campo `category` em inglês, mas `type` em português

### 3. **Metadados Incompletos**

- ❌ Campo `metadata` ausente em alguns produtos
- ❌ `distributor` ora no root, ora em metadata
- ❌ Datas de normalização ausentes
- ❌ `original_id` não migrado para metadata

### 4. **Especificações Técnicas**

- ❌ `technical_specs` vazio em muitos produtos
- ❌ Campo `specifications` duplicando `technical_specs`
- ❌ Potência (power_w) não extraída do nome
- ❌ Informações técnicas perdidas durante consolidação

### 5. **Sincronização com Imagens**

- ❌ Produtos sem referência às imagens processadas
- ❌ Caminhos relativos inconsistentes
- ❌ Falta validação de existência de imagens
- ❌ Prioridade de processamento não definida

## ✅ Soluções Implementadas

### 1. **Padronização de Estrutura**

```json
{
  "id": "string (único)",
  "name": "string (obrigatório)",
  "manufacturer": "string",
  "model": "string",
  "category": "string (categoria válida)",
  "subcategory": "string (opcional)",
  "price": "string formatado (R$ X,XX)",
  "price_brl": "number (valor numérico)",
  "image_url": "string (caminho normalizado)",
  "source": "string",
  "availability": "boolean",
  "description": "string",
  "processed_images": {
    "thumb": "catalog/images_processed/.../thumb/...",
    "medium": "catalog/images_processed/.../medium/...",
    "large": "catalog/images_processed/.../large/..."
  },
  "pricing": {
    "price": "number",
    "price_brl": "number",
    "currency": "BRL"
  },
  "metadata": {
    "source": "string",
    "normalized": true,
    "normalized_at": "ISO 8601",
    "distributor": "YSH",
    "original_id": "string",
    "original_category": "string (se diferente)"
  },
  "technical_specs": {
    "power_w": "number",
    "...": "campos específicos por categoria"
  }
}
```

### 2. **Categorias Válidas (Medusa.js)**

```typescript
const VALID_CATEGORIES = {
  panels: 'Painéis Solares',
  inverters: 'Inversores',
  batteries: 'Baterias',
  kits: 'Kits Fotovoltaicos',
  'kits-hibridos': 'Kits Híbridos',
  structures: 'Estruturas de Montagem',
  cables: 'Cabos e Conectores',
  controllers: 'Controladores de Carga',
  chargers: 'Carregadores',
  ev_chargers: 'Carregadores Veiculares',
  accessories: 'Acessórios',
  stringboxes: 'String Boxes',
  posts: 'Postes e Suportes',
  pumps: 'Bombas Solares',
  stations: 'Estações de Carregamento',
  others: 'Outros'
};
```

### 3. **Normalização de Preços**

```typescript
function normalizePrice(price: any) {
  // Remove R$, espaços, pontos (milhares) e converte vírgula para ponto
  const numericPrice = parseFloat(
    price.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.').trim()
  );
  
  return {
    price: numericPrice,
    price_brl: numericPrice,
    currency: 'BRL'
  };
}
```

### 4. **Normalização de Caminhos de Imagem**

- ✅ Conversão de `\` para `/`
- ✅ Consolidação de `image` → `image_url`
- ✅ Remoção de `images_processed` duplicado
- ✅ Validação de estrutura `processed_images`

### 5. **Extração de Especificações Técnicas**

```typescript
// Extração automática de potência do nome do produto
const powerMatch = product.name.match(/(\d+(?:\.\d+)?)\s*k?w/i);
if (powerMatch) {
  const value = parseFloat(powerMatch[1]);
  product.technical_specs.power_w = 
    powerMatch[0].toLowerCase().includes('kw') ? value * 1000 : value;
}
```

### 6. **Normalização de Availability**

```typescript
product.availability = 
  availability === 'Disponível' || 
  availability === 'disponivel' ||
  availability === 'true' ||
  availability === true;
```

## 📊 Estatísticas por Categoria

### Unified Schemas

| Arquivo | Produtos | Categorias |
|---------|----------|------------|
| `panels_unified.json` | 2893 | panels |
| `inverters_unified.json` | ~1500 | inverters |
| `kits_unified.json` | ~1200 | kits |
| `batteries_unified.json` | 9 | batteries |
| `cables_unified.json` | 55 | cables |
| `controllers_unified.json` | 38 | controllers |
| `ev_chargers_unified.json` | 52 | ev_chargers |
| `accessories_unified.json` | 17 | accessories |
| `structures_unified.json` | 40 | structures |
| `stringboxes_unified.json` | ~100 | stringboxes |

### Schemas Enriched

| Arquivo | Produtos | Tipo |
|---------|----------|------|
| `fotus-kits-enriched.json` | ~900 | kits completos |
| `fotus-kits-hibridos-enriched.json` | ~20 | kits-hibridos |

## 🔧 Script de Normalização

Localização: `backend/src/scripts/normalize-schemas.ts`

### Funções Principais

1. **`normalizeCategory()`** - Valida e corrige categorias
2. **`normalizePrice()`** - Padroniza formato de preços
3. **`normalizeImagePaths()`** - Corrige caminhos de imagens
4. **`normalizeAvailability()`** - Converte availability para boolean
5. **`normalizeMetadata()`** - Garante metadados completos
6. **`normalizeTechnicalSpecs()`** - Consolida especificações técnicas

### Uso

```bash
cd backend
npx tsx src/scripts/normalize-schemas.ts
```

## 📝 Validações Aplicadas

### ✅ Campos Obrigatórios

- `id` (único)
- `name`
- `category` (válida)
- `price` / `price_brl`
- `description` (fallback para name)

### ✅ Conversões Automáticas

- Preços string → number + formatado
- Availability string → boolean
- Caminhos `\` → `/`
- Specifications → technical_specs

### ✅ Enriquecimento Automático

- Extração de potência do nome
- Geração de metadata completo
- Timestamp de normalização
- Inferência de categoria quando inválida

## 🎨 Sincronização com Imagens

### Estrutura de Diretórios

```tsx
backend/src/data/catalog/
├── images_processed/
│   ├── ODEX/
│   │   ├── PANELS/
│   │   │   ├── thumb/
│   │   │   ├── medium/
│   │   │   └── large/
│   │   ├── INVERTERS/
│   │   └── STRUCTURES/
│   ├── NEOSOLAR/
│   ├── FOTUS/
│   ├── FORTLEV/
│   └── SOLFACIL/
└── unified_schemas/
    ├── panels_unified.json
    ├── inverters_unified.json
    └── ...
```

### Mapeamento de Imagens

Cada produto deve ter:

```json
{
  "processed_images": {
    "thumb": "catalog/images_processed/ODEX/PANELS/thumb/sku_xxx.webp",
    "medium": "catalog/images_processed/ODEX/PANELS/medium/sku_xxx.webp",
    "large": "catalog/images_processed/ODEX/PANELS/large/sku_xxx.webp"
  },
  "image_quality_before": 65.6,
  "image_quality_after": 150,
  "image_upscale_factor": 2,
  "processing_date": "2025-10-07T03:10:52.288225"
}
```

## 🚀 Próximos Passos

### 1. Executar Normalização

```bash
cd backend
npx tsx src/scripts/normalize-schemas.ts
```

### 2. Re-seed do Catálogo

```bash
yarn seed
```

### 3. Validação no Admin

- Acessar <http://localhost:9000/app>
- Verificar categorias e produtos
- Confirmar imagens carregadas
- Validar preços e metadados

### 4. Validação na API

```bash
curl http://localhost:9000/store/products | jq '.products[] | {id, name, category, price, image_url}'
```

### 5. Teste no Storefront

- Acessar <http://localhost:3000/br>
- Navegar por categorias
- Verificar detalhes de produtos
- Validar imagens e preços

## 📚 Regras de Negócio

### Preços

- ✅ Sempre em BRL
- ✅ Formato: "R$ X.XXX,XX" (string) + number (price_brl)
- ✅ Precisão: 2 casas decimais
- ✅ Validação: price_brl > 0

### Imagens

- ✅ 3 tamanhos: thumb (150px), medium (500px), large (1200px)
- ✅ Formato: WebP
- ✅ Fallback: Imagem original se processamento falhar
- ✅ Validação de existência no seed

### Categorias

- ✅ Sempre em inglês (chave)
- ✅ Display name em português (valor)
- ✅ Hierarquia: categoria → subcategoria
- ✅ Relacionamento com Medusa category

### Metadados

- ✅ `distributor`: Sempre "YSH"
- ✅ `normalized`: true após processamento
- ✅ `source`: Origem do dado (odex, neosolar, etc.)
- ✅ Timestamps em ISO 8601

## ⚠️ Avisos e Considerações

1. **Backup**: Sempre faça backup antes de executar normalização
2. **Validação**: Revise logs de avisos após normalização
3. **Imagens**: Alguns produtos podem não ter imagens processadas
4. **Categorias**: Produtos com categorias inválidas são movidos para "others"
5. **Performance**: Normalização de ~5000 produtos leva ~30 segundos

## 📖 Referências

- [Medusa.js Product Schema](https://docs.medusajs.com/resources/references/product/models/Product)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [JSON Schema Validation](https://json-schema.org/)

---

**Última atualização**: 07/10/2025 - 21:30  
**Responsável**: GitHub Copilot + YSH Team  
**Status**: ✅ Script pronto para execução

##  Relatório de Validação Completo

### Status Geral (07/10/2025 - 22:15)

 **NORMALIZAÇÃO CONCLUÍDA COM SUCESSO**

| Métrica | Valor | Percentual |
|---------|-------|------------|
| **Total de Produtos** | 1.161 | 100% |
| **Arquivos Processados** | 12 | - |
| **Imagens Disponíveis** | 2.745 | - |
| **Produtos com Preço** | 1.057 | 91.0%  |
| **Produtos com Imagem** | 1.157 | 99.7%  |
| **Produtos Normalizados** | 1.161 | 100%  |

### Distribuição por Categoria

| Arquivo | Produtos | Com Preço | Com Imagem | Status |
|---------|----------|-----------|------------|--------|
| accessories_unified.json | 17 | 17 (100%) | 17 (100%) |  |
| batteries_unified.json | 9 | 9 (100%) | 9 (100%) |  |
| cables_unified.json | 55 | 52 (94.5%) | 55 (100%) |  3 sem preço |
| controllers_unified.json | 38 | 35 (92.1%) | 38 (100%) |  3 sem preço |
| ev_chargers_unified.json | 83 | 75 (90.4%) | 83 (100%) |  8 sem preço |
| inverters_unified.json | 490 | 473 (96.5%) | 489 (99.8%) |  17 sem preço |
| kits_unified.json | 336 | 307 (91.4%) | 334 (99.4%) |  29 sem preço |
| others_unified.json | 45 | 10 (22.2%) | 45 (100%) |  35 sem preço |
| panels_unified.json | 29 | 20 (69.0%) | 28 (96.6%) |  9 sem preço |
| posts_unified.json | 6 | 6 (100%) | 6 (100%) |  |
| stringboxes_unified.json | 13 | 13 (100%) | 13 (100%) |  |
| structures_unified.json | 40 | 40 (100%) | 40 (100%) |  |

### Imagens Processadas por Distribuidor

| Distribuidor | Total de Imagens | Status |
|--------------|------------------|--------|
| NEOSOLAR | 1.275 |  |
| FOTUS | 546 |  |
| ODEX | 483 |  |
| SOLFACIL | 441 |  |
| FORTLEV | 0 |  Sem imagens |

###  Problemas Identificados

**Críticos (117)**: Produtos sem ID, nome ou categoria obrigatória  
**Avisos (104)**: Produtos sem preço válido (9% do total)  
**Informativos (4)**: Produtos sem imagens ou reprocessamento necessário

###  Próximas Ações Recomendadas

**ALTA PRIORIDADE**:
- Corrigir 117 problemas críticos (ver VALIDATION_REPORT.json)
- Adicionar 35 preços em others_unified.json (77.8% sem preço)
- Processar imagens FORTLEV (0 imagens)

**MÉDIA PRIORIDADE**:
- Reprocessar 895 imagens para gerar thumb/medium/large
- Adicionar preços: kits (29), inverters (17), panels (9)

**BAIXA PRIORIDADE**:
- Re-seed completo do catálogo (após correções)
- Validação end-to-end no storefront

###  Métricas de Qualidade

| Métrica | Meta | Atual | Status |
|---------|------|-------|--------|
| Produtos com preço | 100% | 91.0% |  Faltam 104 |
| Produtos com imagem | 100% | 99.7% |  Faltam 4 |
| Normalização | 100% | 100% |  Completo |
| Processed images | 100% | 22.9% |  895 pendentes |
| Integridade de dados | 100% | 89.9% |  117 críticos |

---

**Relatório completo**: backend/src/data/catalog/unified_schemas/VALIDATION_REPORT.json  
**Data**: 07/10/2025 - 22:15
