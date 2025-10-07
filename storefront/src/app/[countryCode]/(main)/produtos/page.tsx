import { Metadata } from "next"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { Suspense } from "react"
import dynamic from "next/dynamic"
import { CatalogCustomizationProvider } from "@/modules/catalog/context/customization"

// Lazy load components para melhor performance
const ProductCard = dynamic(() => import("@/modules/catalog/components/ProductCard"), {
    loading: () => <ProductCardSkeleton />
})

const KitCard = dynamic(() => import("@/modules/catalog/components/KitCard"), {
    loading: () => <KitCardSkeleton />
})

// Skeleton components para loading states
function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
    )
}

function KitCardSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
    )
}

// Server Component para carregar dados
async function CatalogSection({ title, description, viewAllLink, items, ItemComponent, category }: {
    title: string
    description: string
    viewAllLink: string
    items: any[]
    ItemComponent: any
    category?: string
}) {
    return (
        <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {title}
                    </h2>
                    <p className="text-gray-600">
                        {description}
                    </p>
                </div>
                <LocalizedClientLink href={viewAllLink} className="ysh-btn-outline">
                    Ver Todos
                </LocalizedClientLink>
            </div>

            <div className={`grid gap-6 ${category === 'kits' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}>
                {items.map((item: any, index: number) => (
                    <Suspense key={item.id || item.sku || index} fallback={
                        category === 'kits' ? <KitCardSkeleton /> : <ProductCardSkeleton />
                    }>
                        <ItemComponent
                            {...(category === 'kits' ? { kit: item } : { product: item, category })}
                        />
                    </Suspense>
                ))}
            </div>
        </section>
    )
}

export const metadata: Metadata = {
    title: "Catálogo de Produtos Solares - Yello Solar Hub",
    description: "Explore nosso catálogo completo de painéis solares, inversores, kits fotovoltaicos e componentes para energia solar. 713 produtos de 5 distribuidores certificados.",
    keywords: "catálogo solar, painéis solares, inversores, kits fotovoltaicos, componentes solares, Yello Solar Hub",
}

// ISR - revalidar a cada hora
export const revalidate = 3600

async function getCatalogData() {
    'use server'

    try {
        const { promises: fs } = await import('fs')
        const path = await import('path')

        const catalogPath = path.join(process.cwd(), '../../../data/catalog')

        // Load data in parallel for better performance
        const [panelsData, kitsData, invertersData] = await Promise.all([
            fs.readFile(path.join(catalogPath, 'panels.json'), 'utf8'),
            fs.readFile(path.join(catalogPath, 'fotus-kits.json'), 'utf8'),
            fs.readFile(path.join(catalogPath, 'inverters.json'), 'utf8')
        ])

        const panels = JSON.parse(panelsData).panels.slice(0, 6)
        const kits = JSON.parse(kitsData).slice(0, 4)
        const inverters = JSON.parse(invertersData).inverters.slice(0, 6)

        return { panels, kits, inverters }
    } catch (error) {
        console.error('Error loading catalog data:', error)
        return { panels: [], kits: [], inverters: [] }
    }
}

export default async function ProductsPage() {
    const { panels, kits, inverters } = await getCatalogData()

    return (
        <CatalogCustomizationProvider
            value={{
                extraBadges: (item) => {
                    const badges: string[] = []
                    if ((item as any).type) badges.push((item as any).type)
                    if ((item as any).distributor) badges.push((item as any).distributor)
                    return badges
                },
                primaryCta: (item) => ({ label: "Ver Detalhes", href: `/produtos/${item.id}` }),
                secondaryCta: (item) => ({ label: "Solicitar Cotação", href: "/contato", variant: "secondary" }),
                highlightSpecs: (p: any) => {
                    const out: Array<{ label: string; value: string }> = []
                    if (p?.garantia_anos) out.push({ label: "Garantia", value: `${p.garantia_anos} anos` })
                    if (p?.tensao) out.push({ label: "Tensão", value: `${p.tensao}` })
                    if (p?.corrente) out.push({ label: "Corrente", value: `${p.corrente}` })
                    return out
                },
            }}
        >
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="content-container py-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Catálogo de Produtos Solares
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Explore nossa seleção completa de equipamentos solares de alta qualidade.
                            713 produtos de 5 distribuidores certificados para seu projeto de energia renovável.
                        </p>
                    </div>
                </div>
            </div>

            <div className="content-container py-12">
                {/* Kits Section */}
                <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-lg mb-16"></div>}>
                    <CatalogSection
                        title="Kits Fotovoltaicos Completos"
                        description="Soluções completas para instalação imediata"
                        viewAllLink="/produtos/kits"
                        items={kits}
                        ItemComponent={KitCard}
                        category="kits"
                    />
                </Suspense>

                {/* Panels Section */}
                <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-lg mb-16"></div>}>
                    <CatalogSection
                        title="Painéis Solares"
                        description="Painéis fotovoltaicos de alta eficiência para máxima geração"
                        viewAllLink="/produtos/panels"
                        items={panels}
                        ItemComponent={ProductCard}
                        category="panels"
                    />
                </Suspense>

                {/* Inverters Section */}
                <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-lg mb-16"></div>}>
                    <CatalogSection
                        title="Inversores Solares"
                        description="Inversores de string e microinversores para todos os tipos de instalação"
                        viewAllLink="/produtos/inverters"
                        items={inverters}
                        ItemComponent={ProductCard}
                        category="inverters"
                    />
                </Suspense>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-8 text-center text-gray-900">
                    <h3 className="text-2xl font-bold mb-4">
                        Não encontrou o que procura?
                    </h3>
                    <p className="text-lg mb-6 opacity-90">
                        Nossa equipe especializada pode ajudar a encontrar a solução ideal para seu projeto.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <LocalizedClientLink href="/dimensionamento" className="ysh-btn-secondary">
                            Fazer Dimensionamento
                        </LocalizedClientLink>
                        <LocalizedClientLink href="/contato" className="ysh-btn-outline">
                            Falar com Especialista
                        </LocalizedClientLink>
                    </div>
                </section>
            </div>
        </div>
        </CatalogCustomizationProvider>
    )
}
