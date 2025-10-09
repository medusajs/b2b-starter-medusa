/**
 * Category Template
 * 
 * Template for category listing pages with filters, pagination, and product grid.
 * Thin wrapper pattern: all data comes from page.tsx, no data fetching here.
 * 
 * @module modules/catalog/templates/category-template
 */

'use client'

import { Suspense } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { SkeletonProductPreview } from "@/modules/skeletons"
import type { CategoryInfo } from "@/lib/data/catalog"

const ProductCard = dynamic(() => import("@/modules/catalog/components/ProductCard"))
const KitCard = dynamic(() => import("@/modules/catalog/components/KitCard"))

// Simple skeleton for product cards
function ProductCardSkeleton() {
    return <SkeletonProductPreview />
}

type Props = {
    category: string
    categoryInfo: CategoryInfo
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
    categoryInfo,
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="content-container py-8">
                    <div className="mb-4">
                        <nav className="text-sm text-gray-600">
                            <Link href={`/${countryCode}/categories`} className="hover:text-gray-900">
                                Catálogo
                            </Link>
                            <span className="mx-2">/</span>
                            <span className="text-gray-900 font-medium">{categoryInfo.title}</span>
                        </nav>
                    </div>

                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                            {categoryInfo.title}
                        </h1>
                        <p className="text-lg text-gray-600">
                            {categoryInfo.description}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            {total} {total === 1 ? 'produto encontrado' : 'produtos encontrados'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="content-container py-8">
                {/* Filters Bar */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border">
                    <form className="grid grid-cols-1 md:grid-cols-7 gap-3" method="get">
                        {/* Manufacturer Filter */}
                        <div>
                            <label htmlFor="manufacturer" className="block text-xs text-neutral-600 mb-1">
                                Fabricante
                            </label>
                            <select
                                id="manufacturer"
                                name="manufacturer"
                                defaultValue={searchParams.manufacturer || ""}
                                className="w-full border rounded-md h-9 px-2 text-sm"
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
                            <label htmlFor="minPrice" className="block text-xs text-neutral-600 mb-1">
                                Preço mín. (BRL)
                            </label>
                            <input
                                id="minPrice"
                                type="number"
                                name="minPrice"
                                defaultValue={searchParams.minPrice || ""}
                                className="w-full border rounded-md h-9 px-2 text-sm"
                                min="0"
                                step="1"
                            />
                        </div>

                        <div>
                            <label htmlFor="maxPrice" className="block text-xs text-neutral-600 mb-1">
                                Preço máx. (BRL)
                            </label>
                            <input
                                id="maxPrice"
                                type="number"
                                name="maxPrice"
                                defaultValue={searchParams.maxPrice || ""}
                                className="w-full border rounded-md h-9 px-2 text-sm"
                                min="0"
                                step="1"
                            />
                        </div>

                        {/* Availability Filter */}
                        <div>
                            <label htmlFor="availability" className="block text-xs text-neutral-600 mb-1">
                                Disponibilidade
                            </label>
                            <select
                                id="availability"
                                name="availability"
                                defaultValue={searchParams.availability || ""}
                                className="w-full border rounded-md h-9 px-2 text-sm"
                            >
                                <option value="">Todas</option>
                                <option value="Disponivel">Disponível</option>
                                <option value="Indisponivel">Indisponível</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label htmlFor="sort" className="block text-xs text-neutral-600 mb-1">
                                Ordenar por
                            </label>
                            <select
                                id="sort"
                                name="sort"
                                defaultValue={searchParams.sort || ""}
                                className="w-full border rounded-md h-9 px-2 text-sm"
                            >
                                <option value="">Padrão</option>
                                <option value="price_asc">Preço: menor → maior</option>
                                <option value="price_desc">Preço: maior → menor</option>
                            </select>
                        </div>

                        {/* Items per page */}
                        <div>
                            <label htmlFor="limit" className="block text-xs text-neutral-600 mb-1">
                                Itens/página
                            </label>
                            <select
                                id="limit"
                                name="limit"
                                defaultValue={String(pageSize)}
                                className="w-full border rounded-md h-9 px-2 text-sm"
                            >
                                <option value="12">12</option>
                                <option value="24">24</option>
                                <option value="48">48</option>
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-end gap-2">
                            <button type="submit" className="ysh-btn-primary h-9 px-4 text-sm">
                                Filtrar
                            </button>
                            <Link
                                href={`/${countryCode}/categories/${category}`}
                                className="ysh-btn-outline h-9 px-4 text-sm"
                            >
                                Limpar
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Active Filters Chips */}
                {(() => {
                    const activeFilters: Array<{ key: string; label: string; value: string }> = []
                    if (searchParams.manufacturer) activeFilters.push({ key: 'manufacturer', label: 'Fabricante', value: searchParams.manufacturer })
                    if (searchParams.minPrice) activeFilters.push({ key: 'minPrice', label: 'Preço mín.', value: `R$ ${searchParams.minPrice}` })
                    if (searchParams.maxPrice) activeFilters.push({ key: 'maxPrice', label: 'Preço máx.', value: `R$ ${searchParams.maxPrice}` })
                    if (searchParams.availability) activeFilters.push({ key: 'availability', label: 'Disponibilidade', value: searchParams.availability })

                    if (activeFilters.length === 0) return null

                    const makeClearHref = (paramKey: string) => {
                        const params = new URLSearchParams()
                        Object.entries(searchParams).forEach(([key, value]) => {
                            if (value && key !== paramKey && key !== 'page') {
                                params.set(key, value)
                            }
                        })
                        params.set('page', '1')
                        return `?${params.toString()}`
                    }

                    return (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {activeFilters.map((f) => (
                                <Link
                                    key={f.key}
                                    href={makeClearHref(f.key)}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs border-neutral-300 hover:bg-neutral-100 transition-colors"
                                >
                                    <span className="text-neutral-600">{f.label}:</span>
                                    <span className="font-medium text-neutral-900">{f.value}</span>
                                    <span aria-hidden className="text-neutral-400">×</span>
                                </Link>
                            ))}
                        </div>
                    )
                })()}

                {/* Products Grid */}
                <div
                    className={`grid gap-6 mb-8 ${isKits
                            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        }`}
                >
                    {products.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-lg text-gray-600 mb-4">
                                Nenhum produto encontrado com os filtros selecionados.
                            </p>
                            <Link
                                href={`/${countryCode}/categories/${category}`}
                                className="ysh-btn-outline inline-block"
                            >
                                Limpar Filtros
                            </Link>
                        </div>
                    ) : (
                        products.map((item) => (
                            <Suspense key={item.id} fallback={<ProductCardSkeleton />}>
                                {isKits ? (
                                    <KitCard kit={item} />
                                ) : (
                                    <ProductCard product={item} category={category as any} />
                                )}
                            </Suspense>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <Link
                            className={`ysh-btn-outline px-3 py-2 text-sm ${currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                                }`}
                            href={currentPage > 1 ? makePaginationHref(currentPage - 1) : "#"}
                            aria-label="Página anterior"
                        >
                            Anterior
                        </Link>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = Math.max(1, currentPage - 2) + i
                            if (page > totalPages) return null
                            return (
                                <Link
                                    key={page}
                                    className={`px-3 py-2 rounded-md border text-sm ${page === currentPage
                                            ? "bg-neutral-900 text-white border-neutral-900"
                                            : "border-neutral-300 hover:bg-neutral-100"
                                        }`}
                                    href={makePaginationHref(page)}
                                    aria-label={`Página ${page}`}
                                    aria-current={page === currentPage ? "page" : undefined}
                                >
                                    {page}
                                </Link>
                            )
                        })}

                        <Link
                            className={`ysh-btn-outline px-3 py-2 text-sm ${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
                                }`}
                            href={currentPage < totalPages ? makePaginationHref(currentPage + 1) : "#"}
                            aria-label="Próxima página"
                        >
                            Próxima
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
