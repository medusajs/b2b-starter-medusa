# Integração Catálogo CDN AWS - Guia de Implementação

## 📚 Arquivos Criados

### 1. Schema SQL (`database/migrations/003-create-catalog-table.sql`)

**Funcionalidades:**

- ✅ Tabela `catalog` completa com 50+ campos tipados
- ✅ Constraints de validação por categoria (CHECK)
- ✅ 12 índices para performance de queries
- ✅ Views pré-otimizadas (catalog_available, catalog_inversores, catalog_kits, etc.)
- ✅ Triggers automáticos (updated_at, search_vector)
- ✅ Funções SQL (find_similar_by_power, increment_view_count, increment_widget_count)
- ✅ Busca full-text com tsvector (PostgreSQL)

**Como usar:**

```bash
psql $DATABASE_URL -f database/migrations/003-create-catalog-table.sql
```

### 2. Validadores TypeScript (`src/utils/catalog-validators.ts`)

**Funcionalidades:**

- ✅ Schemas Zod para validação por categoria
- ✅ Validação de campos obrigatórios e opcionais
- ✅ Validação de pricing (source, confidence, ranges)
- ✅ Validação de CDN (URL, publicação)
- ✅ Validação de campos críticos por categoria
- ✅ Sistema de warnings e errors
- ✅ Helpers de fallback (placeholders)

**Como usar:**

```typescript
import { validateProductForWidget, CatalogProduct } from './utils/catalog-validators';

const result = validateProductForWidget(product);

if (result.valid) {
  console.log('Produto válido:', result.product);
} else {
  console.error('Erros:', result.errors);
  console.warn('Avisos:', result.warnings);
}
```

### 3. Helpers de Widgets (`src/utils/catalog-widget-helpers.ts`)

**Funcionalidades:**
- ✅ Conexão com PostgreSQL via pg Pool
- ✅ Cache em memória com node-cache (1h TTL)
- ✅ Funções de busca (por SKU, categoria, potência, full-text)
- ✅ Formatadores para widgets (Card, Comparison, List, Kit)
- ✅ Funções de alto nível (generateProductCardWidget, generateInverterComparisonWidget, etc.)
- ✅ Analytics (view_count, widget_render_count)
- ✅ Gerenciamento de cache (clear, stats)

**Como usar:**
```typescript
import { 
  initializeDatabase,
  generateProductCardWidget,
  generateInverterComparisonWidget,
  generateCategoryListWidget,
  generateSolarKitWidget
} from './utils/catalog-widget-helpers';

// Inicializar
initializeDatabase(process.env.DATABASE_URL);

// Widget de produto único
const card = await generateProductCardWidget('GOODWEGW250KHTIMAGEPRODUCT600142');

// Widget de comparação de inversores
const comparison = await generateInverterComparisonWidget(10); // 10kW

// Widget de lista de categoria
const list = await generateCategoryListWidget('paineis', 1, 20);

// Widget de kit solar
const kit = await generateSolarKitWidget(10.5, 'ceramico');
```

### 4. Script de Importação (`scripts/import-catalog-to-db.js`)

**Funcionalidades:**

- ✅ Importa products-fully-priced-catalog.json → PostgreSQL
- ✅ Validação completa antes de inserir
- ✅ Inserção em lotes de 100 (performance)
- ✅ Tratamento de conflitos (UPSERT)
- ✅ Modo dry-run para testes
- ✅ Relatório detalhado de erros/warnings
- ✅ Estatísticas do catálogo após importação

**Como usar:**
```bash
# Teste (sem inserir)
node scripts/import-catalog-to-db.js --dry-run

# Importação real
node scripts/import-catalog-to-db.js

# Importação com logs detalhados
node scripts/import-catalog-to-db.js --verbose

# Pular validação de categoria (útil para dados incompletos)
node scripts/import-catalog-to-db.js --skip-validation
```

### 5. Documentação AWS CDN (`static/products/category-examples-cdn.json`)

**Conteúdo:**
- ✅ Metadados do catálogo (1.138 produtos, 1.183 imagens, R$ 577.8M)
- ✅ 23 categorias com exemplos reais
- ✅ Estrutura completa de dados por categoria
- ✅ Campos obrigatórios vs opcionais
- ✅ Padrões de URL da CDN
- ✅ Estatísticas de preços por categoria

## 🚀 Fluxo de Implementação

### Passo 1: Criar Banco de Dados

```bash
# Criar tabela catalog
psql $DATABASE_URL -f database/migrations/003-create-catalog-table.sql

# Verificar
psql $DATABASE_URL -c "SELECT COUNT(*) FROM catalog;"
```

### Passo 2: Importar Catálogo

```bash
# Teste primeiro
node scripts/import-catalog-to-db.js --dry-run

# Se OK, importar
node scripts/import-catalog-to-db.js
```

**Output esperado:**
```
📦 Importação do Catálogo CDN AWS → PostgreSQL

✓ 1138 produtos carregados do JSON
✓ 1138 produtos válidos
✓ 0 produtos com erros críticos
✓ 345 produtos com avisos
✓ Inseridos/Atualizados: 1138
✓ Erros de inserção: 0

📊 Estatísticas:
  inversores: 372 produtos
  kits: 272 produtos
  FORTLEV: 124 produtos
  ...
```

### Passo 3: Integrar com Backend

```typescript
// src/index.ts ou src/app.ts
import { initializeDatabase } from './utils/catalog-widget-helpers';

// No startup da aplicação
initializeDatabase(process.env.DATABASE_URL);
```

### Passo 4: Criar Endpoints de API

```typescript
// src/routes/catalog.ts
import express from 'express';
import {
  generateProductCardWidget,
  generateInverterComparisonWidget,
  generateCategoryListWidget,
  generateSolarKitWidget,
} from '../utils/catalog-widget-helpers';

const router = express.Router();

// GET /api/catalog/product/:sku
router.get('/product/:sku', async (req, res) => {
  try {
    const card = await generateProductCardWidget(req.params.sku);
    res.json(card);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// GET /api/catalog/compare/inverters?power_kw=10&limit=3
router.get('/compare/inverters', async (req, res) => {
  try {
    const powerKw = parseFloat(req.query.power_kw as string);
    const limit = parseInt(req.query.limit as string) || 3;
    
    const comparison = await generateInverterComparisonWidget(powerKw, limit);
    res.json(comparison);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/catalog/category/:category?page=1&page_size=10
router.get('/category/:category', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.page_size as string) || 10;
    
    const list = await generateCategoryListWidget(
      req.params.category,
      page,
      pageSize
    );
    
    res.json(list);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/catalog/kit?power_kwp=10&structure_type=ceramico
router.get('/kit', async (req, res) => {
  try {
    const powerKwp = parseFloat(req.query.power_kwp as string);
    const structureType = req.query.structure_type as string;
    
    const kit = await generateSolarKitWidget(powerKwp, structureType);
    res.json(kit);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
```

### Passo 5: Integrar com ChatKit

```typescript
// src/chatkit/handlers.ts
import { generateProductCardWidget } from '../utils/catalog-widget-helpers';

async function handleShowProduct(intent: Intent, context: ChatContext) {
  const sku = extractSKUFromIntent(intent);
  
  try {
    const widget = await generateProductCardWidget(sku);
    
    return {
      type: 'product_card',
      data: widget,
      message: `Aqui está o produto ${widget.name}:`,
    };
  } catch (error) {
    return {
      type: 'error',
      message: `Produto ${sku} não encontrado. Verifique o código e tente novamente.`,
    };
  }
}
```

## 📊 Queries SQL Úteis

### Produtos Mais Visualizados

```sql
SELECT sku, manufacturer, model, category, view_count, last_viewed_at
FROM catalog
WHERE cdn_published = true
ORDER BY view_count DESC
LIMIT 10;
```

### Produtos Sem Campos Críticos

```sql
-- Inversores sem potência
SELECT sku, manufacturer, model, price_brl
FROM catalog
WHERE category = 'inversores'
  AND power_kw IS NULL
  AND power_w IS NULL;

-- Painéis sem potência
SELECT sku, manufacturer, model, price_brl
FROM catalog
WHERE category = 'paineis'
  AND power_w IS NULL;
```

### Produtos com Preço Estimado

```sql
SELECT category, COUNT(*) as count, AVG(price_confidence) as avg_confidence
FROM catalog
WHERE price_source = 'estimated'
GROUP BY category
ORDER BY count DESC;
```

### Produtos por Fabricante e Categoria

```sql
SELECT 
  manufacturer,
  category,
  COUNT(*) as count,
  MIN(price_brl) as min_price,
  MAX(price_brl) as max_price,
  AVG(price_brl) as avg_price
FROM catalog
WHERE cdn_published = true
  AND manufacturer IS NOT NULL
GROUP BY manufacturer, category
ORDER BY count DESC;
```

## 🔧 Troubleshooting

### Erro: "Produto não encontrado"

**Possíveis causas:**
1. SKU não existe no banco
2. Produto não está publicado (cdn_published = false)
3. Produto está inativo (is_active = false)

**Solução:**
```sql
-- Verificar status do produto
SELECT sku, cdn_published, is_active, out_of_stock
FROM catalog
WHERE sku = 'SEU_SKU';

-- Ativar produto se necessário
UPDATE catalog
SET is_active = true, cdn_published = true
WHERE sku = 'SEU_SKU';
```

### Erro: "Constraint violation"

**Possíveis causas:**
1. Preço <= 0
2. Campo obrigatório nulo
3. Enum inválido (phase, technology, etc.)

**Solução:**
```sql
-- Validar antes de inserir
SELECT 
  sku,
  CASE WHEN price_brl <= 0 THEN 'Preço inválido' END,
  CASE WHEN category NOT IN ('inversores', 'kits', 'paineis', ...) THEN 'Categoria inválida' END
FROM staging_table
WHERE price_brl <= 0 OR category NOT IN (...);
```

### Performance Lenta

**Possíveis causas:**
1. Índices não criados
2. Cache desabilitado
3. Muitas queries sem paginação

**Solução:**
```sql
-- Verificar índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'catalog';

-- Analisar query lenta
EXPLAIN ANALYZE
SELECT * FROM catalog WHERE category = 'inversores';

-- Recriar índices se necessário
REINDEX TABLE catalog;
```

## 📈 Monitoramento

### Logs Importantes

```typescript
import { getCacheStats } from './utils/catalog-widget-helpers';

// Estatísticas do cache
const stats = getCacheStats();
console.log('Cache:', {
  keys: stats.keys,
  hits: stats.hits,
  misses: stats.misses,
  hit_rate: (stats.hits / (stats.hits + stats.misses) * 100).toFixed(2) + '%',
});
```

### Métricas SQL

```sql
-- Views por categoria (últimas 24h)
SELECT 
  category,
  COUNT(*) as views,
  COUNT(DISTINCT sku) as unique_products
FROM catalog
WHERE last_viewed_at > NOW() - INTERVAL '24 hours'
GROUP BY category
ORDER BY views DESC;

-- Widgets mais renderizados
SELECT sku, manufacturer, model, category, widget_render_count
FROM catalog
ORDER BY widget_render_count DESC
LIMIT 20;
```

## 🎯 Próximos Passos

### Curto Prazo
- [ ] Criar testes unitários para validadores
- [ ] Criar testes de integração para helpers
- [ ] Adicionar logging estruturado (Winston/Pino)
- [ ] Implementar rate limiting nos endpoints

### Médio Prazo
- [ ] Migrar cache para Redis (distribuído)
- [ ] Implementar ElasticSearch para busca avançada
- [ ] Criar sistema de recomendação
- [ ] Adicionar suporte a imagens WebP

### Longo Prazo
- [ ] Integração em tempo real com estoque
- [ ] Sistema de alertas de preço
- [ ] Marketplace multi-fornecedor
- [ ] IA para descrições automáticas

## 📞 Suporte

Para dúvidas sobre implementação, consulte:
- **Schema SQL**: `database/migrations/003-create-catalog-table.sql` (comentários inline)
- **Validadores**: `src/utils/catalog-validators.ts` (JSDoc completo)
- **Helpers**: `src/utils/catalog-widget-helpers.ts` (JSDoc completo)
- **Exemplos**: `static/products/category-examples-cdn.json`
