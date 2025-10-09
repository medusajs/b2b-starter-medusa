# 📦 Guia de Uso - Componentes de Catálogo YSH

## 🎯 Visão Geral

Este guia documenta o uso dos componentes de catálogo do storefront YSH: **ProductCard**, **KitCard** e **EnrichedProductCard**.

---

## 📚 Índice

1. [ProductCard](#productcard)
2. [KitCard](#kitcard)
3. [EnrichedProductCard](#enrichedproductcard)
4. [CatalogCustomizationProvider](#catalogcustomizationprovider)
5. [APIs de Catálogo](#apis-de-catálogo)
6. [Exemplos Completos](#exemplos-completos)

---

## ProductCard

### Descrição

Componente para exibir produtos individuais (painéis, inversores, baterias, estruturas, etc.).

### Localização

```
src/modules/catalog/components/ProductCard.tsx
```

### Props

```typescript
interface ProductCardProps {
    product: {
        // Identificação
        id: string
        name: string
        sku?: string
        
        // Comercial
        price_brl?: number
        price?: string
        distributor?: string
        manufacturer?: string
        model?: string
        
        // Especificações
        kwp?: number
        potencia_kwp?: number
        efficiency_pct?: number
        
        // Classificação
        tier_recommendation?: string[]  // XPP, PP, P, M, G
        type?: string
        modalidade?: string  // on-grid, hibrido, off-grid, eaas, ppa
        classe_consumidora?: string[]  // residencial-b1, rural-b2, comercial-b3, etc.
        roi_estimado?: number  // em anos
        
        // Imagens
        processed_images?: {
            thumb: string
            medium: string
            large: string
        }
        image_url?: string
    }
    
    category?: 'panels' | 'inverters' | 'kits' | 'batteries' | 'structures'
}
```

### Exemplo de Uso

```tsx
import ProductCard from "@/modules/catalog/components/ProductCard"

function ProductsList() {
    const products = [
        {
            id: "neosolar_panels_12345",
            name: "Painel Solar 550W Monocristalino",
            sku: "PANEL-550-MONO",
            manufacturer: "JA Solar",
            model: "JAM72S30",
            price_brl: 850.00,
            kwp: 0.55,
            efficiency_pct: 21.2,
            tier_recommendation: ["XPP"],
            distributor: "NEOSOLAR",
            image_url: "/catalog/images/panel-550.jpg",
            classe_consumidora: ["residencial-b1", "comercial-b3"],
            roi_estimado: 5
        }
    ]

    return (
        <div className="grid grid-cols-3 gap-6">
            {products.map(product => (
                <ProductCard 
                    key={product.id} 
                    product={product} 
                    category="panels" 
                />
            ))}
        </div>
    )
}
```

### Features

- ✅ **Badges automáticos**: Tier (XPP, PP, P), modalidade, ROI
- ✅ **Overlay de ações**: Visualizar, favoritar, adicionar à cotação
- ✅ **Classes consumidoras**: Tags de segmentos atendidos
- ✅ **Especificações destacadas**: Potência, eficiência, garantia
- ✅ **Integração com LeadQuote**: Adiciona produtos à cotação
- ✅ **Analytics tracking**: Eventos automáticos
- ✅ **Customização via context**: CatalogCustomizationProvider

---

## KitCard

### Descrição

Componente especializado para exibir kits fotovoltaicos completos.

### Localização

```
src/modules/catalog/components/KitCard.tsx
```

### Props

```typescript
interface KitCardProps {
    kit: {
        // Identificação
        id: string
        name: string
        
        // Comercial
        potencia_kwp: number
        price_brl: number
        price: string
        distributor: string
        centro_distribuicao: string
        
        // Estrutura
        estrutura: string  // Tipo de telhado
        
        // Componentes
        panels: Array<{
            brand: string
            power_w: number
            quantity: number
        }>
        inverters: Array<{
            brand: string
            power_kw: number
            quantity: number
        }>
        batteries: Array<any>
        
        // Totais
        total_panels: number
        total_inverters: number
        total_power_w: number
        
        // Imagens
        processed_images?: {
            thumb: string
            medium: string
            large: string
        }
        image_url?: string
    }
}
```

### Exemplo de Uso

```tsx
import KitCard from "@/modules/catalog/components/KitCard"

function KitsList() {
    const kits = [
        {
            id: "FOTUS-KP04-8.8kWp",
            name: "Kit Híbrido 8.8kWp - Telhado Cerâmico",
            potencia_kwp: 8.8,
            price_brl: 28500.00,
            price: "R$ 28.500,00",
            distributor: "FOTUS",
            centro_distribuicao: "São Paulo - SP",
            estrutura: "Cerâmico",
            panels: [
                { brand: "JA Solar", power_w: 550, quantity: 16 }
            ],
            inverters: [
                { brand: "Growatt", power_kw: 8, quantity: 1 }
            ],
            batteries: [],
            total_panels: 16,
            total_inverters: 1,
            total_power_w: 8800,
            image_url: "/catalog/images/kit-8.8kwp.jpg"
        }
    ]

    return (
        <div className="grid grid-cols-4 gap-6">
            {kits.map(kit => (
                <KitCard key={kit.id} kit={kit} />
            ))}
        </div>
    )
}
```

### Features

- ✅ **Badge "KIT COMPLETO"**: Destaque visual para kits
- ✅ **Grid de especificações**: Potência, inversor com ícones
- ✅ **Resumo de componentes**: Painéis, inversor, estrutura
- ✅ **Centro de distribuição**: Informação de estoque/origem
- ✅ **Overlay de ações**: Visualizar, adicionar à cotação
- ✅ **Integração com LeadQuote**: Adiciona kits à cotação
- ✅ **Customização via context**: CatalogCustomizationProvider

---

## EnrichedProductCard

### Descrição

Versão enriquecida com IA do ProductCard, com badges, microcopy e SEO otimizado.

### Localização

```
src/modules/catalog/components/EnrichedProductCard.tsx
```

### Uso

```tsx
import EnrichedProductCard from "@/modules/catalog/components/EnrichedProductCard"

function EnrichedProductsList() {
    const enrichedProducts = [
        {
            id: "neosolar_panels_12345",
            name: "Painel Solar 550W Monocristalino",
            // ... outros campos do product
            enriched_badges: ["Mais Vendido", "Entrega Rápida"],
            enriched_microcopy: "Painel premium com 25 anos de garantia",
            seo_title: "Painel Solar 550W JA Solar - Alta Eficiência",
            seo_description: "Painel monocristalino de 550W com 21.2% de eficiência..."
        }
    ]

    return (
        <div className="grid grid-cols-3 gap-6">
            {enrichedProducts.map(product => (
                <EnrichedProductCard 
                    key={product.id} 
                    product={product}
                    category="panels"
                />
            ))}
        </div>
    )
}
```

---

## CatalogCustomizationProvider

### Descrição

Context provider para customizar comportamento dos cards de catálogo.

### Localização

```
src/modules/catalog/context/customization.tsx
```

### Props

```typescript
interface CatalogCustomization {
    // Badges extras personalizados
    extraBadges?: (item: any) => string[]
    
    // CTA primário customizado
    primaryCta?: (item: any) => {
        label: string
        href?: string
        onClick?: (item: any) => void
        variant?: 'primary' | 'secondary'
    }
    
    // CTA secundário customizado
    secondaryCta?: (item: any) => {
        label: string
        href?: string
        onClick?: (item: any) => void
        variant?: 'primary' | 'secondary'
    }
    
    // Especificações destacadas
    highlightSpecs?: (item: any) => Array<{
        label: string
        value: string
    }>
    
    // Logo do fabricante
    logoFor?: (manufacturer?: string) => string | null
}
```

### Exemplo de Uso

```tsx
import { CatalogCustomizationProvider } from "@/modules/catalog/context/customization"
import ProductCard from "@/modules/catalog/components/ProductCard"

function CustomizedCatalog() {
    return (
        <CatalogCustomizationProvider
            value={{
                // Adicionar badges customizados
                extraBadges: (item) => {
                    const badges: string[] = []
                    if (item.disponibilidade === 'Imediata') {
                        badges.push('Pronta Entrega')
                    }
                    if (item.promocao) {
                        badges.push('Promoção')
                    }
                    return badges
                },
                
                // CTA primário customizado
                primaryCta: (item) => ({
                    label: "Comprar Agora",
                    href: `/checkout/${item.id}`,
                    variant: "primary"
                }),
                
                // CTA secundário customizado
                secondaryCta: (item) => ({
                    label: "Solicitar Orçamento",
                    onClick: (item) => {
                        // Lógica customizada
                        console.log('Orçamento para:', item.name)
                    },
                    variant: "secondary"
                }),
                
                // Especificações destacadas
                highlightSpecs: (product) => {
                    const specs: Array<{ label: string; value: string }> = []
                    if (product.garantia_anos) {
                        specs.push({
                            label: "Garantia",
                            value: `${product.garantia_anos} anos`
                        })
                    }
                    if (product.tensao) {
                        specs.push({
                            label: "Tensão",
                            value: product.tensao
                        })
                    }
                    return specs
                },
                
                // Logo do fabricante
                logoFor: (manufacturer) => {
                    const logos: Record<string, string> = {
                        'JA Solar': '/logos/ja-solar.png',
                        'Growatt': '/logos/growatt.png',
                        'Canadian Solar': '/logos/canadian-solar.png'
                    }
                    return manufacturer ? logos[manufacturer] : null
                }
            }}
        >
            <div className="grid grid-cols-3 gap-6">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} category="panels" />
                ))}
            </div>
        </CatalogCustomizationProvider>
    )
}
```

---

## APIs de Catálogo

### Funções Disponíveis

```typescript
import {
    fetchProducts,
    fetchKits,
    searchCatalog,
    fetchCategories,
    fetchFeaturedProducts,
    fetchProduct,
    fetchKit,
    fetchDistributors
} from "@/lib/api/catalog-client"
```

### 1. fetchProducts

```typescript
const products = await fetchProducts({
    category: 'panels',
    limit: 20,
    offset: 0,
    distributor: 'NEOSOLAR',
    search: 'monocristalino',
    minPrice: 500,
    maxPrice: 1000
})
```

### 2. fetchKits

```typescript
const kits = await fetchKits({
    limit: 10,
    minPower: 5,
    maxPower: 15,
    type: 'hybrid',
    roofType: 'ceramico',
    distributor: 'FOTUS'
})
```

### 3. searchCatalog

```typescript
const results = await searchCatalog({
    query: 'growatt 10kw',
    categories: ['inverters', 'kits'],
    limit: 20
})
```

### 4. fetchCategories

```typescript
const categories = await fetchCategories(true) // incluir stats
```

### 5. fetchFeaturedProducts

```typescript
const { featured, kits } = await fetchFeaturedProducts({
    limit: 12,
    includeKits: true,
    categories: ['panels', 'inverters']
})
```

### 6. fetchProduct

```typescript
const product = await fetchProduct({
    id: 'neosolar_panels_12345',
    category: 'panels'  // opcional, acelera busca
})
```

### 7. fetchKit

```typescript
const kit = await fetchKit('FOTUS-KP04-8.8kWp')
```

### 8. fetchDistributors

```typescript
const distributors = await fetchDistributors({
    includeStats: true,
    includeProducts: false
})
```

---

## Exemplos Completos

### Exemplo 1: Página de Produtos com Customização

```tsx
import { fetchProducts, fetchKits } from "@/lib/api/catalog-client"
import { CatalogCustomizationProvider } from "@/modules/catalog/context/customization"
import ProductCard from "@/modules/catalog/components/ProductCard"
import KitCard from "@/modules/catalog/components/KitCard"

export default async function ProductsPage() {
    const [panels, kits] = await Promise.all([
        fetchProducts({ category: 'panels', limit: 6 }),
        fetchKits({ limit: 4 })
    ])

    return (
        <CatalogCustomizationProvider
            value={{
                extraBadges: (item) => {
                    const badges: string[] = []
                    if (item.tier_recommendation?.[0] === 'XPP') {
                        badges.push('Premium')
                    }
                    return badges
                },
                primaryCta: (item) => ({
                    label: "Ver Detalhes",
                    href: `/produtos/${item.id}`
                }),
                secondaryCta: (item) => ({
                    label: "Solicitar Cotação",
                    href: "/contato"
                })
            }}
        >
            <div className="space-y-16">
                {/* Painéis */}
                <section>
                    <h2 className="text-3xl font-bold mb-8">Painéis Solares</h2>
                    <div className="grid grid-cols-3 gap-6">
                        {panels.map(panel => (
                            <ProductCard 
                                key={panel.id} 
                                product={panel} 
                                category="panels" 
                            />
                        ))}
                    </div>
                </section>

                {/* Kits */}
                <section>
                    <h2 className="text-3xl font-bold mb-8">Kits Completos</h2>
                    <div className="grid grid-cols-4 gap-6">
                        {kits.map(kit => (
                            <KitCard key={kit.id} kit={kit} />
                        ))}
                    </div>
                </section>
            </div>
        </CatalogCustomizationProvider>
    )
}
```

### Exemplo 2: Busca com Filtros

```tsx
import { searchCatalog } from "@/lib/api/catalog-client"
import ProductCard from "@/modules/catalog/components/ProductCard"
import KitCard from "@/modules/catalog/components/KitCard"

export default async function SearchPage({ searchParams }: {
    searchParams: { q?: string }
}) {
    const query = searchParams.q || ''
    const results = await searchCatalog({ query, limit: 24 })

    return (
        <div>
            <h1>Resultados para: {query}</h1>
            <div className="grid grid-cols-4 gap-6">
                {results.map(item => (
                    item.category === 'kits' ? (
                        <KitCard key={item.id} kit={item} />
                    ) : (
                        <ProductCard 
                            key={item.id} 
                            product={item} 
                            category={item.category} 
                        />
                    )
                ))}
            </div>
        </div>
    )
}
```

### Exemplo 3: Produtos em Destaque

```tsx
import { fetchFeaturedProducts } from "@/lib/api/catalog-client"
import ProductCard from "@/modules/catalog/components/ProductCard"

export default async function HomePage() {
    const { featured } = await fetchFeaturedProducts({
        limit: 8,
        categories: ['panels', 'inverters']
    })

    return (
        <section>
            <h2>Produtos em Destaque</h2>
            <div className="grid grid-cols-4 gap-6">
                {featured.map(product => (
                    <ProductCard 
                        key={product.id} 
                        product={product}
                        category={product.category}
                    />
                ))}
            </div>
        </section>
    )
}
```

---

## 🎨 Classes CSS Disponíveis

### Card Container

```css
.ysh-product-card {
    /* Base card styling */
}

.ysh-product-card:hover {
    /* Hover effects */
}
```

### Badges

```css
.ysh-badge-tier-xpp { background: green; color: white; }
.ysh-badge-tier-pp { background: blue; color: white; }
.ysh-badge-tier-p { background: yellow; color: black; }
.ysh-badge-tier-m { background: orange; color: white; }
.ysh-badge-tier-g { background: gray; color: white; }
```

### Buttons

```css
.ysh-btn-primary { /* Primary CTA */ }
.ysh-btn-secondary { /* Secondary CTA */ }
.ysh-btn-outline { /* Outline button */ }
```

### Price

```css
.ysh-price {
    font-size: 1.25rem;
    font-weight: 700;
    color: rgb(17, 24, 39);
}
```

---

## ♿ Acessibilidade

Todos os componentes incluem:

- ✅ **ARIA labels**: Botões e ações rotulados
- ✅ **Alt text**: Imagens com descrição
- ✅ **Keyboard navigation**: Suporte completo a teclado
- ✅ **Focus visible**: Indicadores visuais de foco
- ✅ **Semantic HTML**: Tags HTML semânticas

---

## 📱 Responsividade

### Breakpoints

```css
/* Mobile: 1 coluna */
@media (max-width: 768px) {
    .grid { grid-template-columns: 1fr; }
}

/* Tablet: 2 colunas */
@media (min-width: 768px) {
    .grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop: 3-4 colunas */
@media (min-width: 1024px) {
    .grid { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1280px) {
    .grid { grid-template-columns: repeat(4, 1fr); }
}
```

---

## 🔄 ISR (Incremental Static Regeneration)

Todas as funções de API suportam ISR:

```typescript
// Revalidar a cada 1 hora
export const revalidate = 3600

const products = await fetchProducts({
    category: 'panels',
    limit: 20
})
```

---

## 📊 Analytics

Os componentes trackam automaticamente:

- ✅ `add_to_quote` - Quando adiciona à cotação
- ✅ `view_product` - Quando visualiza produto
- ✅ `view_kit` - Quando visualiza kit

---

## 🐛 Troubleshooting

### Produto não aparece

1. Verificar se o produto tem `id` válido
2. Verificar se `price_brl` está definido
3. Verificar se `image_url` ou `processed_images` existe

### Badge não aparece

1. Verificar se `tier_recommendation` está no formato correto: `['XPP']`
2. Verificar se `modalidade` é uma das opções válidas
3. Usar `extraBadges` no context para adicionar badges customizados

### CTA não funciona

1. Verificar se `CatalogCustomizationProvider` está envolvendo os cards
2. Verificar se `primaryCta`/`secondaryCta` retornam objeto válido
3. Verificar se `href` ou `onClick` estão definidos

---

## 📚 Recursos Adicionais

- [API Documentation](./CATALOG_API_DOCS.md)
- [Component Consistency Analysis](./COMPONENT_CONSISTENCY_ANALYSIS.md)
- [Storybook](http://localhost:6006) (quando disponível)

---

**Última atualização**: 07/10/2025  
**Versão**: 1.0.0
