# 🚀 YSH Solar - Integração Schemas Enriquecidos → Medusa.js v2.x

> **Guia de Importação Completo**  
> Do Schema Enriquecido ao Product Module + Inventory Module  
> **Data:** 14 de Outubro de 2025

---

## 🎯 Visão Geral

Este guia demonstra como importar os **16.532 produtos enriquecidos** para o Medusa.js v2.x, aproveitando todos os metadados de qualidade, certificações, KPIs e análise de preços.

---

## 📦 Estrutura de Dados

### Schema Enriquecido (Entrada)

```typescript
interface EnrichedProduct {
  // Identificação
  id: string
  title: string
  sku: string
  manufacturer: string
  category: string
  
  // Análise de Preços
  price_analysis: {
    best_price: number
    worst_price: number
    average_price: number
    median_price: number
    price_variance: number
    distributors_count: number
    best_distributor: string
    price_range_pct: number
    price_recommendation: "excellent_deal" | "good_price" | "average" | "expensive"
  }
  
  // Garantias
  warranty: {
    product_warranty_years: number
    performance_warranty_years?: number
    performance_guarantee_pct?: number
    extendable: boolean
    coverage_scope: "standard" | "premium" | "full"
  }
  
  // Certificações
  certifications: {
    inmetro: boolean
    inmetro_code?: string
    iec_standards: string[]
    ce_marking: boolean
    ul_listed: boolean
    tuv_certified: boolean
    iso_9001: boolean
    iso_14001: boolean
    certification_score: number
  }
  
  // KPIs Técnicos
  kpis: {
    efficiency_pct?: number
    performance_ratio?: number
    degradation_rate_annual?: number
    temperature_coefficient?: number
    mtbf_hours?: number
    lifecycle_years?: number
    energy_payback_time_months?: number
    carbon_footprint_kg?: number
  }
  
  // Dados Originais
  technical_specs: Record<string, any>
  images: string[]
  metadata: Record<string, any>
  
  // Scores (0-100)
  overall_score: number
  value_score: number
  quality_score: number
  reliability_score: number
}
```

### Medusa Product (Saída)

```typescript
interface MedusaProductInput {
  // Core Product
  title: string
  handle: string
  description: string
  is_giftcard: false
  discountable: true
  status: "draft" | "proposed" | "published"
  
  // Variants
  variants: [{
    title: string
    sku: string
    manage_inventory: boolean
    allow_backorder: boolean
    prices: [{
      amount: number  // centavos
      currency_code: "BRL"
      min_quantity?: number
      max_quantity?: number
    }]
  }]
  
  // Categories
  categories: [{ id: string }]
  
  // Tags
  tags: [{ value: string }]
  
  // Images
  images: [{ url: string }]
  
  // Metadata Enriquecido
  metadata: {
    // Scores
    overall_score: number
    value_score: number
    quality_score: number
    reliability_score: number
    
    // Preço
    best_price: number
    price_recommendation: string
    price_variance: number
    
    // Garantia
    warranty_years: number
    warranty_performance_years?: number
    warranty_scope: string
    
    // Certificações
    inmetro_certified: boolean
    ce_certified: boolean
    tuv_certified: boolean
    certification_score: number
    iec_standards: string
    
    // KPIs
    efficiency_pct?: number
    lifecycle_years?: number
    degradation_rate?: number
    mtbf_hours?: number
    performance_ratio?: number
    
    // Técnico
    manufacturer: string
    category: string
    technical_specs: string  // JSON stringified
  }
}
```

---

## 🔧 Script de Conversão

### 1. Converter Produto Enriquecido → Medusa

```typescript
// src/workflows/import-enriched-products.ts

import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createProductsWorkflow, createInventoryItemsWorkflow } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

// ============================================================================
// CONVERSÃO DE SCHEMA
// ============================================================================

function convertEnrichedToMedusa(enriched: EnrichedProduct): MedusaProductInput {
  // Handle (URL-friendly slug)
  const handle = enriched.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // Remove acentos
    .replace(/[^a-z0-9\s-]/g, "")     // Remove caracteres especiais
    .replace(/\s+/g, "-")              // Espaços → hífens
    .replace(/-+/g, "-")               // Múltiplos hífens → um
    .substring(0, 100)                 // Limite 100 chars
  
  // Description (markdown formatado)
  const description = generateProductDescription(enriched)
  
  // Preço em centavos
  const priceInCents = Math.round(enriched.price_analysis.best_price * 100)
  
  // Tags
  const tags = [
    { value: enriched.manufacturer },
    { value: enriched.category },
    { value: enriched.price_analysis.price_recommendation },
    { value: `score-${Math.floor(enriched.overall_score / 10) * 10}` },
  ]
  
  // Certificações como tags
  if (enriched.certifications.inmetro) tags.push({ value: "inmetro" })
  if (enriched.certifications.ce_marking) tags.push({ value: "ce" })
  if (enriched.certifications.tuv_certified) tags.push({ value: "tuv" })
  
  return {
    title: enriched.title,
    handle,
    description,
    is_giftcard: false,
    discountable: true,
    status: enriched.overall_score >= 60 ? "published" : "draft",
    
    variants: [{
      title: "Default",
      sku: enriched.sku,
      manage_inventory: true,
      allow_backorder: false,
      prices: [{
        amount: priceInCents,
        currency_code: "BRL",
      }]
    }],
    
    tags,
    
    images: enriched.images.map(url => ({ url })),
    
    metadata: {
      // Scores
      overall_score: enriched.overall_score,
      value_score: enriched.value_score,
      quality_score: enriched.quality_score,
      reliability_score: enriched.reliability_score,
      
      // Preço
      best_price: enriched.price_analysis.best_price,
      price_recommendation: enriched.price_analysis.price_recommendation,
      price_variance: enriched.price_analysis.price_variance,
      distributors_count: enriched.price_analysis.distributors_count,
      
      // Garantia
      warranty_years: enriched.warranty.product_warranty_years,
      warranty_performance_years: enriched.warranty.performance_warranty_years,
      warranty_scope: enriched.warranty.coverage_scope,
      
      // Certificações
      inmetro_certified: enriched.certifications.inmetro,
      ce_certified: enriched.certifications.ce_marking,
      tuv_certified: enriched.certifications.tuv_certified,
      certification_score: enriched.certifications.certification_score,
      iec_standards: enriched.certifications.iec_standards.join(", "),
      
      // KPIs
      efficiency_pct: enriched.kpis.efficiency_pct,
      lifecycle_years: enriched.kpis.lifecycle_years,
      degradation_rate: enriched.kpis.degradation_rate_annual,
      mtbf_hours: enriched.kpis.mtbf_hours,
      performance_ratio: enriched.kpis.performance_ratio,
      
      // Técnico
      manufacturer: enriched.manufacturer,
      category: enriched.category,
      technical_specs: JSON.stringify(enriched.technical_specs),
    }
  }
}

// ============================================================================
// GERAÇÃO DE DESCRIÇÃO RICA
// ============================================================================

function generateProductDescription(enriched: EnrichedProduct): string {
  const lines: string[] = []
  
  // Título principal
  lines.push(`# ${enriched.title}`)
  lines.push("")
  
  // Scores em badges
  lines.push(`**Overall Score:** \`${enriched.overall_score.toFixed(1)}/100\` | `)
  lines.push(`**Value:** \`${enriched.value_score.toFixed(1)}/100\` | `)
  lines.push(`**Quality:** \`${enriched.quality_score.toFixed(1)}/100\``)
  lines.push("")
  
  // Recomendação de preço
  const priceEmoji = {
    excellent_deal: "🌟",
    good_price: "✅",
    average: "🟡",
    expensive: "🔴"
  }[enriched.price_analysis.price_recommendation]
  
  lines.push(`${priceEmoji} **${enriched.price_analysis.price_recommendation.replace("_", " ").toUpperCase()}** - `)
  lines.push(`Melhor preço: **R$ ${enriched.price_analysis.best_price.toFixed(2)}**`)
  lines.push("")
  
  // Fabricante e garantia
  lines.push(`## Especificações`)
  lines.push("")
  lines.push(`- **Fabricante:** ${enriched.manufacturer}`)
  lines.push(`- **Categoria:** ${enriched.category}`)
  lines.push(`- **Garantia:** ${enriched.warranty.product_warranty_years} anos`)
  
  if (enriched.warranty.performance_warranty_years) {
    lines.push(`- **Garantia Performance:** ${enriched.warranty.performance_warranty_years} anos (${enriched.warranty.performance_guarantee_pct}%)`)
  }
  lines.push("")
  
  // Certificações
  const certs = []
  if (enriched.certifications.inmetro) certs.push("INMETRO")
  if (enriched.certifications.ce_marking) certs.push("CE")
  if (enriched.certifications.tuv_certified) certs.push("TÜV")
  if (enriched.certifications.ul_listed) certs.push("UL")
  
  if (certs.length > 0) {
    lines.push(`## Certificações`)
    lines.push("")
    lines.push(`✓ ${certs.join(" • ")}`)
    lines.push("")
  }
  
  // KPIs técnicos
  if (Object.values(enriched.kpis).some(v => v != null)) {
    lines.push(`## KPIs Técnicos`)
    lines.push("")
    
    if (enriched.kpis.efficiency_pct) {
      lines.push(`- **Eficiência:** ${enriched.kpis.efficiency_pct.toFixed(2)}%`)
    }
    
    if (enriched.kpis.lifecycle_years) {
      lines.push(`- **Vida Útil:** ${enriched.kpis.lifecycle_years} anos`)
    }
    
    if (enriched.kpis.degradation_rate_annual) {
      lines.push(`- **Degradação Anual:** ${enriched.kpis.degradation_rate_annual}%`)
    }
    
    if (enriched.kpis.mtbf_hours) {
      const mtbfYears = (enriched.kpis.mtbf_hours / 8760).toFixed(1)
      lines.push(`- **MTBF:** ${enriched.kpis.mtbf_hours.toLocaleString()} horas (${mtbfYears} anos)`)
    }
    
    lines.push("")
  }
  
  // Specs técnicas
  if (Object.keys(enriched.technical_specs).length > 0) {
    lines.push(`## Especificações Técnicas`)
    lines.push("")
    
    for (const [key, value] of Object.entries(enriched.technical_specs)) {
      const label = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
      lines.push(`- **${label}:** ${value}`)
    }
    
    lines.push("")
  }
  
  return lines.join("\n")
}

// ============================================================================
// WORKFLOW DE IMPORTAÇÃO
// ============================================================================

export const importEnrichedProductsWorkflow = createWorkflow(
  "import-enriched-products",
  function (input: { 
    enrichedProductsPath: string
    categoryMappings: Record<string, string>  // category → medusa_category_id
    minScore?: number
  }) {
    // 1. Carregar produtos enriquecidos
    const enrichedProducts = JSON.parse(
      fs.readFileSync(input.enrichedProductsPath, "utf-8")
    ) as EnrichedProduct[]
    
    // 2. Filtrar por score mínimo
    const minScore = input.minScore ?? 50
    const filteredProducts = enrichedProducts.filter(p => p.overall_score >= minScore)
    
    console.log(`📦 Importando ${filteredProducts.length}/${enrichedProducts.length} produtos (score >= ${minScore})`)
    
    // 3. Converter para formato Medusa
    const medusaProducts = filteredProducts.map(p => {
      const product = convertEnrichedToMedusa(p)
      
      // Adicionar categoria se mapeada
      const categoryId = input.categoryMappings[p.category]
      if (categoryId) {
        product.categories = [{ id: categoryId }]
      }
      
      return product
    })
    
    // 4. Importar via workflow
    const { products } = createProductsWorkflow.runAsStep({
      input: { products: medusaProducts }
    })
    
    // 5. Criar inventory items
    const inventoryItems = products.map(product => ({
      sku: product.variants[0].sku,
      title: product.title,
      requires_shipping: true,
    }))
    
    createInventoryItemsWorkflow.runAsStep({
      input: { inventoryItems }
    })
    
    return new WorkflowResponse({
      imported: products.length,
      skipped: enrichedProducts.length - filteredProducts.length,
      products
    })
  }
)
```

---

## 🚀 Execução da Importação

### 1. Preparar Categorias Medusa

```typescript
// scripts/create-categories.ts

import { MedusaContainer } from "@medusajs/framework/types"

export async function createProductCategories(container: MedusaContainer) {
  const productCategoryService = container.resolve("productCategoryService")
  
  const categories = [
    { name: "Painéis Solares", handle: "panels", is_active: true },
    { name: "Inversores", handle: "inverters", is_active: true },
    { name: "Kits Completos", handle: "kits", is_active: true },
    { name: "Baterias", handle: "batteries", is_active: true },
    { name: "Estruturas", handle: "structures", is_active: true },
    { name: "String Boxes", handle: "stringboxes", is_active: true },
    { name: "Cabos e Conectores", handle: "cables", is_active: true },
    { name: "Acessórios", handle: "accessories", is_active: true },
  ]
  
  const created = {}
  
  for (const cat of categories) {
    const category = await productCategoryService.create(cat)
    created[cat.handle] = category.id
    console.log(`✅ Categoria: ${cat.name} (${category.id})`)
  }
  
  return created
}
```

### 2. Executar Importação

```typescript
// scripts/import-enriched-products.ts

import { importEnrichedProductsWorkflow } from "../src/workflows/import-enriched-products"
import { createProductCategories } from "./create-categories"

async function main() {
  const container = // ... get medusa container
  
  // 1. Criar categorias
  console.log("📂 Criando categorias...")
  const categoryMappings = await createProductCategories(container)
  
  // 2. Importar produtos
  console.log("\n📦 Importando produtos enriquecidos...")
  
  const result = await importEnrichedProductsWorkflow(container).run({
    input: {
      enrichedProductsPath: "./products-inventory/enriched-schemas/enriched_products_2025-10-14_09-46-52.json",
      categoryMappings,
      minScore: 60  // Apenas produtos com score >= 60
    }
  })
  
  console.log("\n✅ Importação concluída!")
  console.log(`  - Importados: ${result.imported}`)
  console.log(`  - Ignorados: ${result.skipped} (score < 60)`)
}

main().catch(console.error)
```

---

## 🔍 Consultas Úteis no Storefront

### 1. Buscar por Score

```typescript
// Produtos Top Quality (score >= 70)
const topQualityProducts = await sdk.store.product.list({
  fields: "+metadata",
  filters: {
    "metadata.overall_score": {
      $gte: 70
    }
  },
  limit: 20
})
```

### 2. Buscar por Certificação

```typescript
// Produtos com INMETRO
const inmetroProducts = await sdk.store.product.list({
  fields: "+metadata",
  filters: {
    "metadata.inmetro_certified": true
  }
})
```

### 3. Buscar "Excellent Deals"

```typescript
// Melhores ofertas
const bestDeals = await sdk.store.product.list({
  fields: "+metadata",
  filters: {
    "metadata.price_recommendation": "excellent_deal"
  },
  order: "-metadata.value_score"
})
```

### 4. Buscar por Fabricante Tier 1

```typescript
const tier1Brands = ["JinkoSolar", "Longi", "BYD", "Canadian Solar", "Trina Solar"]

const tier1Products = await sdk.store.product.list({
  fields: "+metadata",
  filters: {
    "metadata.manufacturer": {
      $in: tier1Brands
    }
  }
})
```

---

## 📊 Admin Dashboard - Visualizar Scores

### Custom Widget para Admin

```tsx
// src/admin/widgets/product-scores.tsx

import { defineWidgetConfig } from "@medusajs/admin-shared"

export default defineWidgetConfig({
  zone: "product.details.before",
  render: ({ data }) => {
    const metadata = data.metadata || {}
    
    return (
      <div className="bg-ui-bg-subtle p-4 rounded-lg">
        <h3 className="text-ui-fg-base font-semibold mb-4">Product Scores</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <ScoreCard 
            title="Overall" 
            score={metadata.overall_score} 
            color="blue" 
          />
          <ScoreCard 
            title="Value" 
            score={metadata.value_score} 
            color="green" 
          />
          <ScoreCard 
            title="Quality" 
            score={metadata.quality_score} 
            color="purple" 
          />
          <ScoreCard 
            title="Reliability" 
            score={metadata.reliability_score} 
            color="orange" 
          />
        </div>
        
        <div className="mt-4 pt-4 border-t border-ui-border-base">
          <div className="flex items-center justify-between text-sm">
            <span>Price Recommendation:</span>
            <Badge variant={getBadgeVariant(metadata.price_recommendation)}>
              {metadata.price_recommendation?.replace("_", " ")}
            </Badge>
          </div>
          
          {metadata.inmetro_certified && (
            <div className="mt-2 flex items-center text-sm text-ui-fg-subtle">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              INMETRO Certified
            </div>
          )}
        </div>
      </div>
    )
  }
})

function ScoreCard({ title, score, color }) {
  const getColorClass = () => {
    if (score >= 80) return "text-green-600 bg-green-50"
    if (score >= 60) return "text-blue-600 bg-blue-50"
    if (score >= 40) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }
  
  return (
    <div className={`p-3 rounded ${getColorClass()}`}>
      <div className="text-xs font-medium mb-1">{title}</div>
      <div className="text-2xl font-bold">{score?.toFixed(1) || "N/A"}</div>
    </div>
  )
}
```

---

## ✅ Checklist de Importação

- [ ] Criar categorias no Medusa
- [ ] Mapear categorias (enriched → medusa)
- [ ] Definir score mínimo para importação (recomendado: 60)
- [ ] Executar workflow de importação
- [ ] Validar produtos no Admin
- [ ] Testar consultas no Storefront
- [ ] Configurar sincronização semanal automática

---

**Próximos Passos:**

1. Implementar filtros avançados no storefront (por score, certificação, garantia)
2. Criar landing pages para "Top Deals" e "Premium Products"
3. Adicionar badges visuais (INMETRO, Excellent Deal, etc.)
4. Integrar com sistema de recomendação (baseado em scores)

---

**Desenvolvido por:** YSH Solar Development Team  
**Versão:** 1.0.0  
**Data:** 14 de Outubro de 2025
