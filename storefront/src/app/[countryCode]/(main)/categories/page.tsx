import { Metadata } from "next"
import Link from "next/link"
import { getCategoryInfo, listCategories } from "@/lib/data/catalog"

export const metadata: Metadata = {
    title: "Catálogo de Produtos Solares - Yello Solar Hub",
    description: "Explore nosso catálogo completo: kits fotovoltaicos, painéis solares, inversores, baterias, estruturas e acessórios.",
}

export default async function CategoriesLandingPage({
    params,
}: {
    params: Promise<{ countryCode: string }>
}) {
    const { countryCode } = await params
    const categories = await listCategories()

    // Get info for all categories
    const categoriesInfo = await Promise.all(
        categories.map(async (slug) => ({
            slug,
            info: await getCategoryInfo(slug),
        }))
    )

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-white shadow-sm">
                <div className="content-container py-12">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Catálogo de Produtos Solares
                        </h1>
                        <p className="text-lg text-gray-600">
                            Explore nossa seleção completa de equipamentos solares de alta qualidade.
                            Mais de 700 produtos de distribuidores certificados para seu projeto de energia renovável.
                        </p>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="content-container py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoriesInfo.map(({ slug, info }) => (
                        <Link
                            key={slug}
                            href={`/${countryCode}/categories/${slug}`}
                            className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon placeholder - you can add actual icons here */}
                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                    {info.title.charAt(0)}
                                </div>

                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                                        {info.title}
                                    </h2>
                                    <p className="text-gray-600 text-sm mb-3">
                                        {info.description}
                                    </p>

                                    {/* Keywords */}
                                    {info.keywords && info.keywords.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {info.keywords.slice(0, 3).map((keyword) => (
                                                <span
                                                    key={keyword}
                                                    className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                                                >
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Arrow indicator */}
                                <div className="flex-shrink-0 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all">
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Não encontrou o que procura?
                    </h3>
                    <p className="text-lg text-gray-800 mb-6 max-w-2xl mx-auto">
                        Nossa equipe especializada pode ajudar a encontrar a solução ideal para seu projeto.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href={`/${countryCode}/dimensionamento`}
                            className="ysh-btn-secondary inline-block"
                        >
                            Fazer Dimensionamento
                        </Link>
                        <Link
                            href={`/${countryCode}/contato`}
                            className="ysh-btn-outline inline-block"
                        >
                            Falar com Especialista
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
