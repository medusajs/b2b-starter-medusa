# 🚀 Importação de Produtos Enrichados para Medusa.js

**Última Atualização:** October 14, 2025  
**Produtos Disponíveis:** 166 enrichados e validados  
**Score Médio:** 58.2/100

---

## 📋 PRÉ-REQUISITOS

### 1. Ambiente Medusa.js

```bash
# Backend Medusa v2.x rodando
cd c:\Users\fjuni\ysh_medusa\ysh-store\backend

# Verificar se o backend está funcionando
npm run dev

# Deve estar acessível em:
# - API: http://localhost:9000
# - Admin: http://localhost:9000/admin
```

### 2. Banco de Dados

```bash
# Verificar conexão PostgreSQL
psql -U postgres -c "SELECT version();"

# Aplicar migrations se necessário
npm run medusa migrations run
```

### 3. Arquivos de Entrada

```
products-inventory/
├── enriched-complete/
│   └── enriched_products_2025-10-14_10-30-42.json  ← Arquivo principal
├── import-enriched-to-medusa.ts  ← Script de importação
└── MEDUSA_IMPORT_READY.md  ← Documentação
```

---

## ⚙️ CONFIGURAÇÃO

### Opção 1: Configuração Padrão (Recomendada)

```typescript
// Configuração padrão otimizada para qualidade
const config = {
    minOverallScore: 60,      // Apenas produtos com score ≥60
    minValueScore: 50,         // Boa relação preço/qualidade
    categories: [
        'panels',              // 39 produtos
        'inverters',           // 36 produtos
        'structures',          // 58 produtos
        'water_pumps'          // 18 produtos
    ],
    priceFilter: [
        'excellent_deal',      // 40.4% dos produtos
        'good_price',          // 19.3%
        'average'              // 16.9%
    ],
    requireCertification: false,  // Apenas 55% têm CE
    trackInventory: true,
    allowBackorders: false,
    defaultStock: 10,
    batchSize: 20
}
```

**Resultado Esperado:** ~100-120 produtos importados

### Opção 2: Importação Completa

```typescript
const config = {
    minOverallScore: 50,      // Score mais baixo
    minValueScore: 40,
    categories: undefined,    // Todas as categorias
    priceFilter: undefined,   // Todos os preços
    requireCertification: false,
    trackInventory: true,
    allowBackorders: false,
    defaultStock: 10,
    batchSize: 20
}
```

**Resultado Esperado:** ~166 produtos (todos)

### Opção 3: Apenas Alta Qualidade

```typescript
const config = {
    minOverallScore: 70,      // Apenas produtos premium
    minValueScore: 60,
    categories: ['panels', 'inverters'],
    priceFilter: ['excellent_deal', 'good_price'],
    requireCertification: false,
    trackInventory: true,
    allowBackorders: false,
    defaultStock: 10,
    batchSize: 20
}
```

**Resultado Esperado:** ~30-40 produtos de alta qualidade

---

## 🔧 USO

### Método 1: Integração no Backend Medusa

**Arquivo:** `src/workflows/import-products.ts`

```typescript
import { importEnrichedProducts } from '../../../data/products-inventory/import-enriched-to-medusa'
import { MedusaContainer } from '@medusajs/framework/types'

export async function importProductsCatalog(container: MedusaContainer) {
    const productsPath = '../../../data/products-inventory/enriched-complete/enriched_products_2025-10-14_10-30-42.json'
    
    const config = {
        minOverallScore: 60,
        categories: ['panels', 'inverters', 'structures', 'water_pumps'],
        priceFilter: ['excellent_deal', 'good_price', 'average']
    }
    
    await importEnrichedProducts(productsPath, container, config)
}
```

**Executar:**

```typescript
// Em algum subscriber ou job
import { importProductsCatalog } from './workflows/import-products'

// No evento de inicialização ou via admin API
await importProductsCatalog(container)
```

### Método 2: Script Standalone

**Arquivo:** `scripts/import-enriched.ts`

```typescript
import { MedusaApp } from '@medusajs/framework'
import { importEnrichedProducts } from '../data/products-inventory/import-enriched-to-medusa'

async function main() {
    // Inicializar container Medusa
    const { container } = await MedusaApp({
        configModule: {
            projectConfig: {
                database_url: process.env.DATABASE_URL,
                redis_url: process.env.REDIS_URL
            }
        }
    })
    
    // Importar produtos
    await importEnrichedProducts(
        './data/products-inventory/enriched-complete/enriched_products_2025-10-14_10-30-42.json',
        container,
        {
            minOverallScore: 60,
            categories: ['panels', 'inverters', 'structures']
        }
    )
    
    process.exit(0)
}

main().catch(console.error)
```

**Executar:**

```bash
cd c:\Users\fjuni\ysh_medusa\ysh-store\backend
npm run ts-node scripts/import-enriched.ts
```

### Método 3: API Endpoint (Admin)

**Arquivo:** `src/api/admin/products/import/route.ts`

```typescript
import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { importEnrichedProducts } from '../../../../../data/products-inventory/import-enriched-to-medusa'

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    const { minScore, categories } = req.body
    
    try {
        await importEnrichedProducts(
            './data/products-inventory/enriched-complete/enriched_products_2025-10-14_10-30-42.json',
            req.scope,
            {
                minOverallScore: minScore || 60,
                categories: categories
            }
        )
        
        res.json({ message: 'Import completed successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
```

**Testar:**

```bash
curl -X POST http://localhost:9000/admin/products/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"minScore": 60, "categories": ["panels", "inverters"]}'
```

---

## 📊 VALIDAÇÃO PÓS-IMPORTAÇÃO

### 1. Verificar Produtos no Admin

```
http://localhost:9000/admin/products
```

**Checklist:**

- [ ] Produtos visíveis na lista
- [ ] Categorias atribuídas corretamente
- [ ] Tags aplicadas (manufacturer, price, certifications)
- [ ] Imagens carregadas
- [ ] Preços em formato BRL
- [ ] Metadata de scores visível

### 2. Verificar via API

```bash
# Listar produtos
curl http://localhost:9000/store/products | jq '.products | length'

# Verificar produto específico com metadata
curl http://localhost:9000/store/products/{product_id} | jq '.product.metadata'
```

### 3. Verificar Banco de Dados

```sql
-- Contar produtos por categoria
SELECT 
    pc.name as category,
    COUNT(p.id) as products
FROM product p
JOIN product_category pc ON p.category_id = pc.id
GROUP BY pc.name
ORDER BY products DESC;

-- Verificar scores médios
SELECT 
    AVG((metadata->>'overall_score')::float) as avg_overall,
    AVG((metadata->>'value_score')::float) as avg_value,
    AVG((metadata->>'quality_score')::float) as avg_quality
FROM product
WHERE metadata->>'overall_score' IS NOT NULL;

-- Top 10 produtos por score
SELECT 
    title,
    (metadata->>'overall_score')::float as score,
    (metadata->>'manufacturer') as manufacturer
FROM product
ORDER BY (metadata->>'overall_score')::float DESC
LIMIT 10;
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Container is required"

**Causa:** Container do Medusa não inicializado  
**Solução:**

```typescript
// Garantir que container está disponível
const { container } = await MedusaApp({ ... })
await importEnrichedProducts(path, container, config)
```

### Erro: "Cannot create category"

**Causa:** Workflow de categorias não disponível  
**Solução:**

```bash
# Verificar se workflows estão registrados
npm run medusa workflows list

# Re-build do backend
npm run build
```

### Produtos não aparecem no storefront

**Causa:** Status do produto ou região de preço  
**Solução:**

```sql
-- Verificar status
SELECT title, status FROM product WHERE status != 'published';

-- Atualizar se necessário
UPDATE product SET status = 'published' WHERE status = 'draft';

-- Verificar preços com região
SELECT p.title, pv.prices 
FROM product p
JOIN product_variant pv ON p.id = pv.product_id;
```

### Imagens não carregam

**Causa:** URLs inválidas ou CORS  
**Solução:**

```typescript
// Verificar URLs antes de importar
const validImages = product.images.filter(url => {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
})
```

### Metadata não aparece no Admin

**Causa:** UI customizado necessário  
**Solução:** Ver `MEDUSA_IMPORT_READY.md` seção "Admin Dashboard Customization"

---

## 📈 MÉTRICAS DE SUCESSO

### Importação Bem-Sucedida

```
✓ 100-120 produtos importados
✓ 10 categorias criadas
✓ 50+ tags criadas
✓ 0 erros
✓ Tempo: 30-60 segundos
```

### Distribuição Esperada

| Categoria | Produtos | % do Total |
|-----------|----------|------------|
| Structures | 58 | 35% |
| Panels | 39 | 24% |
| Inverters | 36 | 22% |
| Water Pumps | 18 | 11% |
| Others | ~15 | 8% |

### Qualidade dos Dados

- **Score médio:** 60+ (filtro aplicado)
- **Preços competitivos:** 60%+ (excellent/good/average)
- **Com certificações:** 55%+ (CE marking)
- **Com imagens:** 100%

---

## 🔄 ATUALIZAÇÃO E MANUTENÇÃO

### Re-importação após Enrichment

```bash
# 1. Novo enrichment
cd products-inventory
python enrich_complete_inventory.py

# 2. Verificar novo arquivo gerado
ls enriched-complete/enriched_products_*.json | tail -1

# 3. Atualizar caminho no script
# import-enriched-to-medusa.ts linha X

# 4. Re-executar importação
npm run ts-node scripts/import-enriched.ts
```

### Importação Incremental

```typescript
// Importar apenas produtos novos
const config = {
    skipExisting: true,  // TODO: Implementar
    updatePrices: true,
    updateScores: true
}
```

### Limpeza de Dados Antigos

```sql
-- CUIDADO: Remove todos os produtos
DELETE FROM product WHERE metadata->>'enriched_at' IS NOT NULL;

-- Ou apenas produtos de teste
DELETE FROM product WHERE title LIKE 'TEST%';
```

---

## 📞 SUPORTE

**Problemas Técnicos:**

- Email: <dev@yellosolarhub.com>
- GitHub Issues: ysh-b2b/issues

**Dúvidas sobre Dados:**

- Ver: `ENRICHMENT_COMPLETE_SUMMARY.md`
- Ver: `ENRICHED_SCHEMA_REPORT_*.md`

---

## ✅ PRÓXIMOS PASSOS

1. ✅ **Importar produtos iniciais** (166 produtos)
2. ⏳ **Customizar Admin UI** (exibir scores)
3. ⏳ **Configurar Storefront** (filtros por score/cert)
4. ⏳ **Corrigir dados FOTUS** (+400 produtos)
5. ⏳ **Melhorar manufacturers** (+2,000 produtos)
6. ⏳ **Automatizar pipeline** (semanal)

**Status:** ✅ Pronto para importação inicial  
**Última Validação:** October 14, 2025
