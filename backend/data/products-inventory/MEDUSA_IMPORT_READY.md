# 🚀 MEDUSA.JS IMPORT GUIDE - Complete Inventory

**Date:** October 14, 2025  
**Products Ready:** 166 enriched products  
**Quality Level:** Medium-High (Score: 58.2/100)  
**Integration Target:** Medusa v2.x Product + Inventory Modules

---

## ✅ PRE-IMPORT CHECKLIST

- [x] Complete inventory extraction (4,517 products)
- [x] Data validation and filtering (2,838 valid)
- [x] LLM enrichment with scoring (166 products)
- [x] Price analysis completed
- [x] Certification mapping done
- [x] Category organization ready
- [ ] Medusa backend running
- [ ] Database migrations applied
- [ ] Admin dashboard accessible

---

## 📊 IMPORT STATISTICS

### Products by Category

| Category | Products | Avg Score | Avg Price | Ready for Import |
|----------|----------|-----------|-----------|------------------|
| Structures | 58 | 58.4 | R$ 77.49 | ✅ Yes |
| Panels | 39 | 66.3 | R$ 225.11 | ✅ Yes |
| Inverters | 36 | 58.9 | R$ 311.27 | ✅ Yes |
| Water Pumps | 18 | 48.9 | R$ 210.35 | ⚠️ Review |
| Stringboxes | 11 | 47.1 | R$ 451.58 | ⚠️ Review |
| Boxes | 3 | 46.8 | R$ 239.09 | ⚠️ Review |
| Miscellaneous | 3 | 53.9 | R$ 46.32 | ✅ Yes |
| Security | 2 | 56.1 | R$ 709.49 | ✅ Yes |
| Microinverters | 1 | 51.8 | R$ 979.82 | ✅ Yes |
| Batteries | 1 | 55.0 | R$ 284.46 | ✅ Yes |

### Products by Distributor

| Distributor | Products | Coverage |
|-------------|----------|----------|
| FortLev | 72 | 43.4% |
| NeoSolar | 58 | 34.9% |
| ODEX | 36 | 21.7% |

### Quality Distribution

| Score Range | Products | Percentage | Recommendation |
|-------------|----------|------------|----------------|
| 70-100 (High) | 42 | 25.3% | ✅ Import immediately |
| 60-69 (Good) | 44 | 26.5% | ✅ Import with review |
| 50-59 (Medium) | 58 | 34.9% | ⚠️ Review before import |
| 0-49 (Low) | 22 | 13.3% | ❌ Manual review required |

---

## ⚙️ IMPORT CONFIGURATION

### Recommended Settings

```typescript
// config/import-settings.ts
export const ImportConfig = {
  // Quality Filters
  minOverallScore: 60,  // Only medium-good quality and above
  minValueScore: 50,    // Reasonable price/value ratio
  requireImages: true,  // All products must have images
  
  // Categories to Import (prioritize high-value)
  categories: [
    'panels',       // 39 products, score: 66.3
    'inverters',    // 36 products, score: 58.9
    'structures',   // 58 products, score: 58.4 (high volume)
    'water_pumps',  // 18 products, score: 48.9 (specialized)
  ],
  
  // Distributors
  distributors: ['FortLev', 'NeoSolar', 'ODEX'],
  
  // Price Classification
  priceFilter: {
    include: ['excellent_deal', 'good_price', 'average'],
    exclude: ['expensive']
  },
  
  // Certification Requirements (optional)
  requireCertification: false,  // Only 55% have CE, 11% INMETRO
  preferredCerts: ['CE', 'INMETRO', 'TUV'],
  
  // Inventory Settings
  trackInventory: true,
  allowBackorders: false,
  defaultStock: 10,  // Placeholder until distributor sync
  
  // Image Processing
  processImages: true,
  generateThumbnails: true,
  optimizeForWeb: true
};
```

### Import Script Usage

```bash
# Navigate to project directory
cd c:\Users\fjuni\ysh_medusa\ysh-store\backend

# Run import with configuration
npm run medusa:import -- \
  --input="../data/products-inventory/enriched-complete/enriched_products_2025-10-14_10-30-42.json" \
  --config="./import-settings.ts" \
  --dry-run  # Test first

# After validation, run actual import
npm run medusa:import -- \
  --input="../data/products-inventory/enriched-complete/enriched_products_2025-10-14_10-30-42.json" \
  --config="./import-settings.ts"
```

---

## 🗂️ DATA MAPPING

### Enriched Schema → Medusa Product

```typescript
// Product mapping
{
  // Basic Information
  title: enriched.title,
  subtitle: enriched.metadata.model || null,
  description: enriched.metadata.description || '',
  handle: generateHandle(enriched.title),
  
  // Pricing
  prices: [{
    amount: Math.round(enriched.price_analysis.best_price * 100),
    currency_code: 'brl',
    region_id: 'br-southeast'
  }],
  
  // Categories & Tags
  categories: [mapCategory(enriched.category)],
  tags: [
    enriched.manufacturer,
    enriched.distributor,
    enriched.price_analysis.price_recommendation,
    ...extractTags(enriched.certifications)
  ],
  
  // Metadata
  metadata: {
    // Scores
    overall_score: enriched.overall_score,
    value_score: enriched.value_score,
    quality_score: enriched.quality_score,
    reliability_score: enriched.reliability_score,
    
    // Price Analysis
    price_comparison: {
      best: enriched.price_analysis.best_price,
      average: enriched.price_analysis.average_price,
      distributors: enriched.price_analysis.distributors_count,
      recommendation: enriched.price_analysis.price_recommendation
    },
    
    // Certifications
    certifications: {
      inmetro: enriched.certifications.inmetro,
      ce: enriched.certifications.ce_marking,
      tuv: enriched.certifications.tuv_certified,
      certification_score: enriched.certifications.certification_score
    },
    
    // Warranty
    warranty: {
      product_years: enriched.warranty.product_warranty_years,
      performance_years: enriched.warranty.performance_warranty_years,
      performance_guarantee: enriched.warranty.performance_guarantee_pct
    },
    
    // Technical KPIs
    kpis: enriched.kpis,
    
    // Source
    distributor: enriched.distributor,
    manufacturer: enriched.manufacturer,
    original_sku: enriched.sku
  },
  
  // Images
  images: enriched.images.map(url => ({ url })),
  
  // Variants (single variant for now)
  variants: [{
    title: 'Default',
    sku: enriched.sku || generateSKU(enriched),
    prices: [{
      amount: Math.round(enriched.price_analysis.best_price * 100),
      currency_code: 'brl'
    }],
    inventory_quantity: 10,
    manage_inventory: true,
    allow_backorder: false
  }]
}
```

---

## 📋 CATEGORY MAPPING

### Enriched Categories → Medusa Categories

```typescript
const categoryMapping = {
  'panels': {
    name: 'Painéis Solares',
    handle: 'paineis-solares',
    description: 'Módulos fotovoltaicos para geração de energia solar'
  },
  'inverters': {
    name: 'Inversores',
    handle: 'inversores',
    description: 'Inversores fotovoltaicos grid-tie e off-grid'
  },
  'microinverters': {
    name: 'Microinversores',
    handle: 'microinversores',
    description: 'Microinversores para sistemas distribuídos'
  },
  'batteries': {
    name: 'Baterias',
    handle: 'baterias',
    description: 'Baterias estacionárias e de lítio para armazenamento'
  },
  'structures': {
    name: 'Estruturas de Fixação',
    handle: 'estruturas',
    description: 'Estruturas metálicas para montagem de painéis solares'
  },
  'stringboxes': {
    name: 'String Box',
    handle: 'string-box',
    description: 'Caixas de proteção e junção para strings fotovoltaicas'
  },
  'water_pumps': {
    name: 'Bombas Solares',
    handle: 'bombas-solares',
    description: 'Bombas d\'água movidas a energia solar'
  },
  'boxes': {
    name: 'Caixas e Gabinetes',
    handle: 'caixas',
    description: 'Caixas de proteção e gabinetes elétricos'
  },
  'security': {
    name: 'Proteção e Segurança',
    handle: 'protecao',
    description: 'Dispositivos de proteção contra surtos e sobretensão'
  },
  'miscellaneous': {
    name: 'Acessórios',
    handle: 'acessorios',
    description: 'Acessórios diversos para sistemas fotovoltaicos'
  }
};
```

---

## 🎨 ADMIN DASHBOARD CUSTOMIZATION

### Product Scores Display

```typescript
// Add custom field displays in Medusa Admin

// 1. Product List - Show overall score badge
<ProductListItem>
  <ScoreBadge score={product.metadata.overall_score}>
    {product.metadata.overall_score >= 70 ? '🟢' : 
     product.metadata.overall_score >= 60 ? '🟡' : '🔴'}
    {product.metadata.overall_score.toFixed(1)}
  </ScoreBadge>
</ProductListItem>

// 2. Product Details - Full score breakdown
<ProductScoreCard>
  <ScoreRow label="Overall" value={metadata.overall_score} />
  <ScoreRow label="Value" value={metadata.value_score} />
  <ScoreRow label="Quality" value={metadata.quality_score} />
  <ScoreRow label="Reliability" value={metadata.reliability_score} />
</ProductScoreCard>

// 3. Price Comparison Widget
<PriceComparisonWidget>
  <PriceInfo 
    current={product.prices[0].amount / 100}
    average={metadata.price_comparison.average}
    best={metadata.price_comparison.best}
    recommendation={metadata.price_comparison.recommendation}
  />
</PriceComparisonWidget>

// 4. Certifications Display
<CertificationBadges>
  {metadata.certifications.inmetro && <Badge>INMETRO</Badge>}
  {metadata.certifications.ce && <Badge>CE</Badge>}
  {metadata.certifications.tuv && <Badge>TÜV</Badge>}
</CertificationBadges>
```

---

## 🔍 POST-IMPORT VALIDATION

### Validation Checklist

```bash
# 1. Check import statistics
medusa products:stats

# Expected output:
# - Total products: 100-150 (depends on filters)
# - Categories: 10
# - Variants: 100-150
# - Images: 100-150

# 2. Verify category distribution
medusa products:by-category

# 3. Check price ranges
medusa products:price-analysis

# 4. Validate images
medusa products:validate-images

# 5. Test admin access
# Navigate to: http://localhost:9000/admin/products
# Filter by: score >= 60
# Sort by: overall_score DESC
```

### Manual Verification

- [ ] All 166 products visible in admin
- [ ] Categories correctly assigned
- [ ] Images loading properly
- [ ] Prices in BRL format
- [ ] Metadata scores displaying
- [ ] Manufacturer/distributor tags present
- [ ] Certification badges showing
- [ ] Warranty information visible
- [ ] Product search working
- [ ] Filtering by score functional

---

## 🐛 TROUBLESHOOTING

### Common Issues

**1. Products Not Importing**
```bash
# Check enriched file format
cat enriched-complete/enriched_products_*.json | jq '.[] | keys'

# Verify schema compatibility
npm run medusa:validate-schema -- --input=enriched_products.json
```

**2. Images Not Loading**
```bash
# Test image URLs
curl -I "https://prod-platform-api.s3.amazonaws.com/..."

# Enable CORS for S3 bucket
aws s3api put-bucket-cors --bucket prod-platform-api --cors-configuration file://cors.json
```

**3. Scores Not Displaying in Admin**
```typescript
// Check metadata access in admin UI
console.log(product.metadata.overall_score)  // Should not be undefined

// Verify custom field configuration
// File: src/admin/widgets/product-scores.tsx
```

**4. Price Format Issues**
```typescript
// Medusa expects prices in cents
const priceInCents = Math.round(priceInReais * 100)

// Verify currency code
currency_code: 'brl'  // lowercase, ISO 4217
```

---

## 📈 PERFORMANCE OPTIMIZATION

### Batch Import Settings

```typescript
{
  batchSize: 50,  // Import 50 products at a time
  concurrency: 5,  // Process 5 batches concurrently
  retryAttempts: 3,
  retryDelay: 1000,  // ms
  
  // Skip duplicates
  deduplication: {
    key: 'sku',
    strategy: 'skip'  // or 'update'
  },
  
  // Image processing
  imageProcessing: {
    concurrency: 10,
    timeout: 30000,
    formats: ['webp', 'jpg'],
    sizes: [320, 640, 1280]
  }
}
```

---

## 🎯 SUCCESS METRICS

### Target KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Import Success Rate | >95% | Products imported / Total attempted |
| Image Load Success | >90% | Images loaded / Total products |
| Admin Load Time | <3s | Time to load products list |
| Search Performance | <500ms | Search query response time |
| Product Detail Load | <1s | Time to load single product |

### Quality Metrics

- **Average Product Score:** Target >60 (Current: 58.2)
- **High-Quality Products:** Target >30% (Current: 25.3% at score >70)
- **Certification Coverage:** Target >60% (Current: 55.4% CE)
- **Price Competitiveness:** Target >50% good deals (Current: 59.7%)

---

## 📞 SUPPORT & CONTACTS

**Technical Issues:**
- Email: dev@yellosolarhub.com
- Repository: github.com/own-boldsbrain/ysh-b2b

**Data Quality:**
- Email: compliance@yellosolarhub.com
- See: `ENRICHMENT_COMPLETE_SUMMARY.md` for known issues

**Business Questions:**
- Email: fernando@yellosolarhub.com

---

## 🔄 NEXT STEPS AFTER IMPORT

1. **Week 1: Initial Setup**
   - Import 166 enriched products
   - Configure admin dashboard widgets
   - Test storefront display
   - Set up inventory tracking

2. **Week 2: Quality Review**
   - Manual review of top 50 products
   - Fix any image loading issues
   - Update product descriptions
   - Verify pricing accuracy

3. **Week 3: Expansion**
   - Fix FOTUS data extraction (add 400-500 products)
   - Improve manufacturer normalization
   - Re-run enrichment on corrected data
   - Import additional 500-1000 products

4. **Month 2: Automation**
   - Schedule weekly enrichment runs
   - Implement price sync with distributors
   - Set up inventory level monitoring
   - Create automated quality reports

---

**Status:** ✅ Ready for Import  
**Last Updated:** October 14, 2025  
**Next Review:** After first import completion
