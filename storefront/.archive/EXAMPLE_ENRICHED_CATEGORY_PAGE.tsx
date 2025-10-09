/**
 * EXEMPLO: Integração de Hero Section com Dados Enriquecidos
 * ===========================================================
 * 
 * Este arquivo demonstra como usar os dados enriquecidos do UI Kit
 * nas páginas de categoria do frontend.
 */

import { getCategoryHero, getEnrichedProducts } from '@/lib/data/catalog-enriched'
import { Metadata } from 'next'
import LocalizedClientLink from '@/modules/common/components/localized-client-link'

type Params = { countryCode: string; category: string }

// Gerar metadata SEO otimizado
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { category } = await params
    const hero = await getCategoryHero(category)

    if (hero) {
        return {
            title: hero.title,
            description: hero.subtitle,
            keywords: `${category}, energia solar, equipamentos solares, ${hero.benefits.join(', ')}`,
        }
    }

    return {
        title: `${category} - Yello Solar Hub`,
        description: `Catálogo de ${category} para energia solar`,
    }
}

export default async function CategoryPageExample({ params }: { params: Promise<Params> }) {
    const { category } = await params

    // Carregar dados enriquecidos
    const hero = await getCategoryHero(category)
    const products = await getEnrichedProducts(category)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section com Dados AI */}
            {hero && (
                <section className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-16">
                    <div className="content-container">
                        <div className="text-center text-gray-900">
                            {/* Título Principal */}
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                {hero.title}
                            </h1>

                            {/* Subtítulo */}
                            <p className="text-xl md:text-2xl mb-8 opacity-90">
                                {hero.subtitle}
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                                <button className="ysh-btn-primary text-lg px-8 py-3">
                                    {hero.cta_primary}
                                </button>
                                <LocalizedClientLink
                                    href="/cotacao"
                                    className="ysh-btn-outline text-lg px-8 py-3"
                                >
                                    {hero.cta_secondary}
                                </LocalizedClientLink>
                            </div>

                            {/* Benefícios */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                {hero.benefits.map((benefit, i) => (
                                    <div
                                        key={i}
                                        className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex items-center justify-center gap-3">
                                            <span className="text-2xl">✓</span>
                                            <span className="font-semibold text-lg">{benefit}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Grid de Produtos com Badges */}
            <section className="content-container py-12">
                <h2 className="text-3xl font-bold mb-8">
                    Produtos em Destaque
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                        >
                            {/* Imagem */}
                            <div className="relative aspect-square bg-gray-100">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        Sem imagem
                                    </div>
                                )}

                                {/* Badges Automáticas */}
                                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                    {product.badges.map((badge, i) => (
                                        <span
                                            key={i}
                                            className={`
                        px-2 py-1 rounded-full text-xs font-semibold
                        ${badge.variant === 'success' ? 'bg-green-100 text-green-800' : ''}
                        ${badge.variant === 'info' ? 'bg-blue-100 text-blue-800' : ''}
                        ${badge.variant === 'warning' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${badge.variant === 'primary' ? 'bg-purple-100 text-purple-800' : ''}
                        ${badge.variant === 'default' ? 'bg-gray-100 text-gray-800' : ''}
                      `}
                                        >
                                            {badge.text}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <div className="p-4">
                                {/* Fabricante */}
                                <div className="text-xs text-gray-500 mb-1">
                                    {product.manufacturer}
                                </div>

                                {/* Nome */}
                                <h3
                                    className="font-semibold text-sm mb-2 line-clamp-2"
                                    title={product.name}
                                >
                                    {product.name}
                                </h3>

                                {/* Microcopy - Descrição Curta */}
                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                    {product.microcopy.short_description}
                                </p>

                                {/* Preço */}
                                {product.price_brl && (
                                    <div className="text-lg font-bold text-gray-900 mb-3">
                                        {new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                        }).format(product.price_brl)}
                                    </div>
                                )}

                                {/* CTA com Microcopy */}
                                <button
                                    title={product.microcopy.tooltip}
                                    className="ysh-btn-primary w-full text-sm"
                                >
                                    {product.microcopy.cta_text}
                                </button>

                                {/* Status de Disponibilidade */}
                                <div className="mt-2 text-xs text-green-600 text-center">
                                    {product.microcopy.availability_text}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Final */}
            <section className="bg-gray-900 text-white py-16">
                <div className="content-container text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Precisa de Ajuda para Escolher?
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Nossa equipe técnica está pronta para ajudar no dimensionamento do seu projeto
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <LocalizedClientLink href="/dimensionamento" className="ysh-btn-primary">
                            Dimensionar Sistema
                        </LocalizedClientLink>
                        <LocalizedClientLink href="/contato" className="ysh-btn-outline">
                            Falar com Especialista
                        </LocalizedClientLink>
                    </div>
                </div>
            </section>
        </div>
    )
}
