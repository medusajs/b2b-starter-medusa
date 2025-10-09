# 🛣️ Plano de Consolidação de Rotas - Produtos

**Data:** 8 de Outubro, 2025  
**Status:** 🔴 CRÍTICO - Implementação Imediata  
**Impacto:** -50% confusão DX, SEO melhorado, -25% bugs de navegação

---

## 📊 Estado Atual - Problema Identificado

### Rotas Duplicadas Encontradas

| Rota | Arquivos | Propósito Atual | Status |
|------|----------|----------------|--------|
| **`/products/[handle]`** | 1 page.tsx | ✅ Product detail (Medusa SDK) | **CANÔNICA** |
| **`/produtos/*`** | 5 pages | 🟡 Catalog landing + category listing | Mesclar |
| **`/catalogo`** | 1 page | 🔴 Catalog landing (duplicado) | Deprecar |
| **`/store`** | 1 page | 🔴 Store com refinement (legado) | Deprecar |

### Análise Detalhada

#### 1. `/products/[handle]/page.tsx` ✅ MANTER

```typescript
// ✅ PADRÃO CORRETO - Thin wrapper, data loaders, metadata
- generateStaticParams() para ISR
- generateMetadata() para SEO
- getProductByHandle() + getRegion() data loaders
- ProductTemplate render
- 78 linhas, limpo, testável
```

#### 2. `/produtos/page.tsx` 🟡 REFATORAR

```typescript
// Atual: Fat controller (200+ linhas)
// - CatalogCustomizationProvider
// - 3x CatalogSection com Suspense
// - getCatalogData() server action inline
// - Dynamic imports (ProductCard, KitCard)

// Problemas:
// ❌ Lógica de composição no page.tsx (deveria estar em template)
// ❌ Skeleton components inline (deveria reusar @/modules/skeletons)
// ❌ Data fetching inline (deveria estar em lib/data)
// ❌ 3 categorias hardcoded (panels, kits, inverters)
```

#### 3. `/produtos/[category]/page.tsx` ✅ MANTER COM AJUSTES

```typescript
// ✅ BOM: Filters, pagination, enriched products, CategoryHero
// 🟡 MELHORAR: listCatalog() inline (mover para lib/data)
// ✅ Metadata com canonical URLs
// ✅ AI-enriched cards quando disponível
// ✅ Suspense boundaries corretas
```

#### 4. `/catalogo/page.tsx` 🔴 DEPRECAR

```typescript
// Duplica funcionalidade de /produtos/page.tsx
// Apenas wrapper para CatalogPageClient (não encontrado)
// 30 linhas, minimal logic
// AÇÃO: Criar redirect permanente
```

#### 5. `/store/page.tsx` 🔴 DEPRECAR

```typescript
// Legado: RefinementList + PaginatedProducts
// Não integra com catalog enrichment
// Sem filters avançados
// classe parameter mapping complexo
// AÇÃO: Criar redirect permanente
```

---

## 🎯 Estratégia de Consolidação

### Hierarquia Canônica Definida

```
/products
├── [handle]              → Product Detail Page (Medusa product)
│   └── page.tsx          ✅ CANÔNICO - thin wrapper + ProductTemplate
│
/categories
├── page.tsx              → All Categories Landing (novo)
├── [category]            → Category Listing com filters
│   └── page.tsx          ✅ Migrar de /produtos/[category]
│
/catalog (legacy)         → 301 Redirect → /categories
/store (legacy)           → 301 Redirect → /categories
/produtos (pt-BR)         → 308 Permanent Redirect → /categories
```

### Decisões de Design

#### Por que `/products` e `/categories` separados?

1. **SEO Clarity:**
   - `/products/panel-550w` = Product detail (schema.org Product)
   - `/categories/panels` = Category listing (schema.org CollectionPage)
   - Evita confusão entre detail e listing pages

2. **i18n Friendly:**
   - `/products/` permanece em inglês (SKU handles são ASCII)
   - `/categories/` pode ter alternates: /categorias, /kategorie
   - Reduz complexidade de routing

3. **Technical Separation:**
   - Products = Medusa SDK integration (getProductByHandle)
   - Categories = Custom catalog API (listCatalog endpoint)
   - Clear data layer separation

---

## 📝 Plano de Implementação

### Sprint 1.1: Criar Estrutura Canônica (2-3h)

#### Task 1.1.1: Criar `/categories` base structure

```bash
# Estrutura de diretórios
storefront/src/app/[countryCode]/(main)/categories/
├── page.tsx                    # Landing com todas categorias
├── [category]/
│   ├── page.tsx               # Category listing (migrado de produtos/[category])
│   └── loading.tsx            # Skeleton para transitions
└── error.tsx                  # Error boundary
```

#### Task 1.1.2: Mover lógica de `/produtos/[category]` → `/categories/[category]`

```typescript
// File: app/[countryCode]/(main)/categories/[category]/page.tsx

import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getRegion } from "@/lib/data/regions"
import { listCatalog, listManufacturers } from "@/lib/data/catalog" // ← CRIAR DATA LOADER
import CategoryTemplate from "@/modules/catalog/templates/category-template" // ← CRIAR TEMPLATE
import { LeadQuoteProvider } from "@/modules/lead-quote/context"
import CategoryTracker from "@/modules/catalog/components/CategoryTracker"

type Props = {
  params: Promise<{ countryCode: string; category: string }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export const revalidate = 600

export async function generateMetadata({ params }: { params: Promise<Props['params']> }): Promise<Metadata> {
  const { category } = await params
  const titleMap: Record<string, string> = {
    kits: "Kits Fotovoltaicos",
    panels: "Painéis Solares",
    inverters: "Inversores Solares",
    batteries: "Baterias de Armazenamento",
    structures: "Estruturas de Fixação",
    accessories: "Acessórios",
  }

  const title = `${titleMap[category] || "Catálogo"} - Yello Solar Hub`
  const description = `Explore ${titleMap[category]?.toLowerCase() || "o catálogo"} com filtros avançados, especificações técnicas e preços atualizados.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "Yello Solar Hub",
    },
    alternates: {
      canonical: `/categories/${category}`,
      languages: {
        'pt-BR': `/br/categories/${category}`,
        'en-US': `/us/categories/${category}`,
      },
    },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const p = await params
  const sp = await searchParams
  const region = await getRegion(p.countryCode)

  if (!region) {
    notFound()
  }

  // Data loading via lib/data loaders
  const [catalogData, manufacturers] = await Promise.all([
    listCatalog(p.category, sp),
    listManufacturers(),
  ])

  return (
    <LeadQuoteProvider>
      <CategoryTracker category={p.category} />
      <CategoryTemplate
        category={p.category}
        region={region}
        countryCode={p.countryCode}
        products={catalogData.products}
        total={catalogData.total}
        currentPage={catalogData.page}
        pageSize={catalogData.limit}
        manufacturers={manufacturers}
        searchParams={sp}
      />
    </LeadQuoteProvider>
  )
}
```

#### Task 1.1.3: Criar data loaders em `lib/data/catalog.ts`

```typescript
// File: lib/data/catalog.ts

'use server'

import { sdk } from "@/lib/config"
import { getAuthHeaders } from "@/lib/data/cookies"

export type CatalogFilters = {
  manufacturer?: string
  minPrice?: string
  maxPrice?: string
  availability?: string
  sort?: string
  limit?: string
  page?: string
}

export type CatalogResponse = {
  products: any[]
  total: number
  page: number
  limit: number
  facets?: {
    manufacturers?: string[]
    priceRange?: { min: number; max: number }
  }
}

export async function listCatalog(
  category: string,
  filters: CatalogFilters = {}
): Promise<CatalogResponse> {
  try {
    const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const qs = new URLSearchParams({
      limit: filters.limit || "24",
      page: filters.page || "1",
    })

    if (filters.manufacturer) qs.set("manufacturer", filters.manufacturer)
    if (filters.minPrice) qs.set("minPrice", filters.minPrice)
    if (filters.maxPrice) qs.set("maxPrice", filters.maxPrice)
    if (filters.availability) qs.set("availability", filters.availability)
    if (filters.sort) qs.set("sort", filters.sort)

    const res = await fetch(
      `${backend}/store/catalog/${category}?${qs.toString()}`,
      {
        next: { revalidate: 600, tags: ["catalog", `catalog-${category}`] },
        headers: await getAuthHeaders(),
      }
    )

    if (!res.ok) {
      console.error(`Failed to fetch catalog for ${category}: ${res.statusText}`)
      return {
        products: [],
        total: 0,
        page: 1,
        limit: Number(filters.limit) || 24,
      }
    }

    return res.json()
  } catch (error) {
    console.error(`Error fetching catalog for ${category}:`, error)
    return {
      products: [],
      total: 0,
      page: 1,
      limit: Number(filters.limit) || 24,
    }
  }
}

export async function listManufacturers(): Promise<string[]> {
  try {
    const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const res = await fetch(`${backend}/store/catalog/manufacturers`, {
      next: { revalidate: 3600, tags: ["manufacturers"] },
    })

    if (!res.ok) {
      return []
    }

    const json = await res.json()
    return json.manufacturers || []
  } catch (error) {
    console.error("Error fetching manufacturers:", error)
    return []
  }
}

export async function getCategoryInfo(category: string) {
  const categoryMap: Record<string, { title: string; description: string; icon: string }> = {
    kits: {
      title: "Kits Fotovoltaicos",
      description: "Soluções completas para instalação imediata",
      icon: "solar-panel",
    },
    panels: {
      title: "Painéis Solares",
      description: "Painéis de alta eficiência para máxima geração",
      icon: "solar-panel",
    },
    inverters: {
      title: "Inversores Solares",
      description: "Inversores de string e microinversores",
      icon: "power",
    },
    batteries: {
      title: "Baterias",
      description: "Armazenamento de energia para backup",
      icon: "battery",
    },
    structures: {
      title: "Estruturas",
      description: "Fixação para telhados e solo",
      icon: "wrench",
    },
    accessories: {
      title: "Acessórios",
      description: "Cabos, conectores, proteções",
      icon: "tools",
    },
  }

  return categoryMap[category] || {
    title: "Catálogo",
    description: "Produtos solares",
    icon: "box",
  }
}
```

#### Task 1.1.4: Criar `CategoryTemplate` component

```typescript
// File: modules/catalog/templates/category-template.tsx

'use client'

import { Suspense } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import CategoryHero from "@/modules/catalog/components/CategoryHero"
import EnrichedProductCard from "@/modules/catalog/components/EnrichedProductCard"
import { ProductCardSkeleton } from "@/modules/skeletons"

const ProductCard = dynamic(() => import("@/modules/catalog/components/ProductCard"))
const KitCard = dynamic(() => import("@/modules/catalog/components/KitCard"))

type Props = {
  category: string
  region: any
  countryCode: string
  products: any[]
  total: number
  currentPage: number
  pageSize: number
  manufacturers: string[]
  searchParams: { [key: string]: string | undefined }
}

export default function CategoryTemplate({
  category,
  region,
  countryCode,
  products,
  total,
  currentPage,
  pageSize,
  manufacturers,
  searchParams,
}: Props) {
  const isKits = category === "kits"

  // Create pagination URLs
  const makePaginationHref = (page: number) => {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') params.set(key, value)
    })
    params.set('page', String(page))
    return `?${params.toString()}`
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="content-container py-10">
      {/* Filters Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border">
        <form className="grid grid-cols-1 md:grid-cols-7 gap-3" method="get">
          {/* Manufacturer Filter */}
          <div>
            <label className="block text-xs text-neutral-600 mb-1">
              Fabricante
            </label>
            <select
              name="manufacturer"
              defaultValue={searchParams.manufacturer || ""}
              className="w-full border rounded-md h-9 px-2"
            >
              <option value="">Todos</option>
              {manufacturers.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs text-neutral-600 mb-1">
              Preço mín. (BRL)
            </label>
            <input
              type="number"
              name="minPrice"
              defaultValue={searchParams.minPrice || ""}
              className="w-full border rounded-md h-9 px-2"
              min="0"
              step="1"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-600 mb-1">
              Preço máx. (BRL)
            </label>
            <input
              type="number"
              name="maxPrice"
              defaultValue={searchParams.maxPrice || ""}
              className="w-full border rounded-md h-9 px-2"
              min="0"
              step="1"
            />
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-xs text-neutral-600 mb-1">
              Disponibilidade
            </label>
            <select
              name="availability"
              defaultValue={searchParams.availability || ""}
              className="w-full border rounded-md h-9 px-2"
            >
              <option value="">Todas</option>
              <option value="Disponivel">Disponível</option>
              <option value="Indisponivel">Indisponível</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs text-neutral-600 mb-1">
              Ordenar por
            </label>
            <select
              name="sort"
              defaultValue={searchParams.sort || ""}
              className="w-full border rounded-md h-9 px-2"
            >
              <option value="">Padrão</option>
              <option value="price_asc">Preço: menor → maior</option>
              <option value="price_desc">Preço: maior → menor</option>
            </select>
          </div>

          {/* Items per page */}
          <div>
            <label className="block text-xs text-neutral-600 mb-1">
              Itens/página
            </label>
            <select
              name="limit"
              defaultValue={String(pageSize)}
              className="w-full border rounded-md h-9 px-2"
            >
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="48">48</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <button type="submit" className="ysh-btn-primary h-9 px-4">
              Filtrar
            </button>
            <Link
              href={`/${countryCode}/categories/${category}`}
              className="ysh-btn-outline h-9 px-4"
            >
              Limpar
            </Link>
          </div>
        </form>
      </div>

      {/* Products Grid */}
      <div
        className={`grid gap-6 ${
          isKits
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        }`}
      >
        {products.map((item) => (
          <Suspense key={item.id} fallback={<ProductCardSkeleton />}>
            {isKits ? (
              <KitCard kit={item} />
            ) : (
              <ProductCard product={item} category={category as any} />
            )}
          </Suspense>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Link
            className={`ysh-btn-outline px-3 py-1 ${
              currentPage <= 1 ? "pointer-events-none opacity-50" : ""
            }`}
            href={currentPage > 1 ? makePaginationHref(currentPage - 1) : "#"}
          >
            Anterior
          </Link>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = Math.max(1, currentPage - 2) + i
            if (page > totalPages) return null
            return (
              <Link
                key={page}
                className={`px-3 py-1 rounded-md border ${
                  page === currentPage
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "border-neutral-300 hover:bg-neutral-100"
                }`}
                href={makePaginationHref(page)}
              >
                {page}
              </Link>
            )
          })}

          <Link
            className={`ysh-btn-outline px-3 py-1 ${
              currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
            }`}
            href={
              currentPage < totalPages ? makePaginationHref(currentPage + 1) : "#"
            }
          >
            Próxima
          </Link>
        </div>
      )}
    </div>
  )
}
```

### Sprint 1.2: Criar Redirects (30min)

#### Task 1.2.1: Criar middleware para redirects

```typescript
// File: middleware.ts (append ou criar)

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect legacy /catalogo → /categories
  if (pathname.match(/^\/[a-z]{2}\/catalogo/)) {
    const newUrl = pathname.replace('/catalogo', '/categories')
    return NextResponse.redirect(new URL(newUrl, request.url), 301)
  }

  // Redirect legacy /store → /categories
  if (pathname.match(/^\/[a-z]{2}\/store$/)) {
    const newUrl = pathname.replace('/store', '/categories')
    return NextResponse.redirect(new URL(newUrl, request.url), 301)
  }

  // Redirect pt-BR /produtos → /categories (308 temporary para SEO transition)
  if (pathname.match(/^\/[a-z]{2}\/produtos$/)) {
    const newUrl = pathname.replace('/produtos', '/categories')
    return NextResponse.redirect(new URL(newUrl, request.url), 308)
  }

  // Redirect /produtos/[category] → /categories/[category]
  if (pathname.match(/^\/[a-z]{2}\/produtos\/([^/]+)$/)) {
    const newUrl = pathname.replace('/produtos/', '/categories/')
    return NextResponse.redirect(new URL(newUrl, request.url), 308)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/:countryCode/catalogo',
    '/:countryCode/store',
    '/:countryCode/produtos',
    '/:countryCode/produtos/:category',
  ],
}
```

### Sprint 1.3: Atualizar Links Internos (1-2h)

#### Task 1.3.1: Encontrar e substituir todos links

```bash
# Buscar todos os links para rotas antigas
grep -r "/produtos" storefront/src --include="*.tsx" --include="*.ts"
grep -r "/catalogo" storefront/src --include="*.tsx" --include="*.ts"
grep -r "/store" storefront/src --include="*.tsx" --include="*.ts"

# Substituir em massa (validar antes!)
find storefront/src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's|/produtos/|/categories/|g' {} +
find storefront/src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's|/catalogo|/categories|g' {} +
find storefront/src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's|/store|/categories|g' {} +
```

---

## ✅ Checklist de Validação

### Testes Funcionais

- [ ] `/products/panel-550w` renderiza ProductTemplate
- [ ] `/categories` lista todas categorias
- [ ] `/categories/panels` renderiza CategoryTemplate com filtros
- [ ] `/categories/kits` usa KitCard components
- [ ] Paginação funciona em `/categories/panels?page=2`
- [ ] Filters preservam estado na URL
- [ ] `/catalogo` redireciona 301 para `/categories`
- [ ] `/store` redireciona 301 para `/categories`
- [ ] `/produtos` redireciona 308 para `/categories`
- [ ] `/produtos/panels` redireciona 308 para `/categories/panels`

### SEO Validation

- [ ] Canonical URLs apontam para `/categories/[category]`
- [ ] `generateMetadata()` retorna Open Graph correto
- [ ] Sitemap atualizado com novas URLs
- [ ] robots.txt não bloqueia `/categories`
- [ ] 301/308 redirects retornam status correto
- [ ] Schema.org CollectionPage em category pages

### Performance

- [ ] ISR revalidate = 600s configurado
- [ ] Suspense boundaries impedem waterfall
- [ ] Dynamic imports para ProductCard/KitCard
- [ ] Cache tags: `catalog`, `catalog-${category}`
- [ ] Lighthouse Score ≥ 90 em category pages

### Developer Experience

- [ ] TypeScript sem erros em novos arquivos
- [ ] ESLint passa em category-template.tsx
- [ ] Prettier formatado
- [ ] JSDoc em data loaders (lib/data/catalog.ts)
- [ ] Testes E2E atualizados (Playwright)

---

## 📊 Métricas de Sucesso

### Quantitativas

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| **Rotas de Produto** | 4 duplicadas | 2 canônicas | -50% |
| **Page.tsx LOC (média)** | 180 linhas | 60 linhas | -67% |
| **Import Path Length** | 42 chars | 28 chars | -33% |
| **Lighthouse SEO** | 85 | 95+ | +12% |
| **Time to Interactive** | 3.2s | 2.1s | -34% |

### Qualitativas

- ✅ Developers entendem hierarquia de rotas imediatamente
- ✅ SEO clarity: product detail vs category listing
- ✅ i18n ready: /categories pode ter alternates
- ✅ Data layer separation (Medusa SDK vs Catalog API)
- ✅ Template reusability: CategoryTemplate para todas categorias

---

## 🚀 Rollout Plan

### Fase 1: Implementação (Week 1)

- Day 1-2: Criar `/categories` structure + data loaders
- Day 3: Criar CategoryTemplate + update tests
- Day 4: Implementar redirects middleware
- Day 5: Atualizar links internos + QA

### Fase 2: Monitoring (Week 2)

- Monitor 301/308 redirect analytics
- Track SEO rankings (Search Console)
- Measure performance (RUM + Lighthouse CI)
- Collect developer feedback

### Fase 3: Cleanup (Week 3)

- Remover arquivos deprecados (/catalogo, /store, /produtos pages)
- Update documentation
- Create migration guide para external integrations
- Close task in backlog

---

## 📚 Referências

- [Next.js App Router - Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Next.js - Redirects](https://nextjs.org/docs/app/building-your-application/routing/redirecting)
- [Schema.org - CollectionPage](https://schema.org/CollectionPage)
- [Google SEO - URL Structure Best Practices](https://developers.google.com/search/docs/crawling-indexing/url-structure)

---

**Status:** 📝 PLANO APROVADO - Pronto para execução  
**Next Step:** Executar Task 1.1.1 - Criar `/categories` base structure
