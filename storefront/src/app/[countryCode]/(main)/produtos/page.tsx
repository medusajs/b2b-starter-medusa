import { Metadata } from "next"
import ProductCard from "@/modules/catalog/components/ProductCard"
import KitCard from "@/modules/catalog/components/KitCard"
import { promises as fs } from 'fs'
import path from 'path'

export const metadata: Metadata = {
    title: "Catálogo de Produtos Solares - Yello Solar Hub",
    description: "Explore nosso catálogo completo de painéis solares, inversores, kits fotovoltaicos e componentes para energia solar. 713 produtos de 5 distribuidores certificados.",
    keywords: "catálogo solar, painéis solares, inversores, kits fotovoltaicos, componentes solares, Yello Solar Hub",
}

async function getCatalogData() {
    try {
        const catalogPath = path.join(process.cwd(), '../../../data/catalog')

        // Load panels
        const panelsData = await fs.readFile(path.join(catalogPath, 'panels.json'), 'utf8')
        const panels = JSON.parse(panelsData).panels.slice(0, 6) // Show first 6 panels

        // Load kits
        const kitsData = await fs.readFile(path.join(catalogPath, 'fotus-kits.json'), 'utf8')
        const kits = JSON.parse(kitsData).slice(0, 4) // Show first 4 kits

        // Load inverters
        const invertersData = await fs.readFile(path.join(catalogPath, 'inverters.json'), 'utf8')
        const inverters = JSON.parse(invertersData).inverters.slice(0, 6) // Show first 6 inverters

        return { panels, kits, inverters }
    } catch (error) {
        console.error('Error loading catalog data:', error)
        return { panels: [], kits: [], inverters: [] }
    }
}

export default async function ProductsPage() {
    const { panels, kits, inverters } = await getCatalogData()

    return (
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
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Kits Fotovoltaicos Completos
                            </h2>
                            <p className="text-gray-600">
                                Soluções completas para instalação imediata
                            </p>
                        </div>
                        <a href="/produtos/kits" className="ysh-btn-outline">
                            Ver Todos os Kits
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {kits.map((kit: any) => (
                            <KitCard key={kit.id} kit={kit} />
                        ))}
                    </div>
                </section>

                {/* Panels Section */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Painéis Solares
                            </h2>
                            <p className="text-gray-600">
                                Painéis fotovoltaicos de alta eficiência para máxima geração
                            </p>
                        </div>
                        <a href="/produtos/paineis" className="ysh-btn-outline">
                            Ver Todos os Painéis
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {panels.map((panel: any, index: number) => (
                            <ProductCard
                                key={panel.sku || index}
                                product={panel}
                                category="panels"
                            />
                        ))}
                    </div>
                </section>

                {/* Inverters Section */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Inversores Solares
                            </h2>
                            <p className="text-gray-600">
                                Inversores de string e microinversores para todos os tipos de instalação
                            </p>
                        </div>
                        <a href="/produtos/inversores" className="ysh-btn-outline">
                            Ver Todos os Inversores
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {inverters.map((inverter: any, index: number) => (
                            <ProductCard
                                key={inverter.sku || index}
                                product={inverter}
                                category="inverters"
                            />
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-8 text-center text-gray-900">
                    <h3 className="text-2xl font-bold mb-4">
                        Não encontrou o que procura?
                    </h3>
                    <p className="text-lg mb-6 opacity-90">
                        Nossa equipe especializada pode ajudar a encontrar a solução ideal para seu projeto.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/dimensionamento" className="ysh-btn-secondary">
                            Fazer Dimensionamento
                        </a>
                        <a href="/contato" className="ysh-btn-outline">
                            Falar com Especialista
                        </a>
                    </div>
                </section>
            </div>
        </div>
    )
}