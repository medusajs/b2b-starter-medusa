/**
 * Product Comparison Component
 * Comparação lado a lado de produtos por SKU
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { clx } from '@medusajs/ui'
import { CategoryIcon } from './CategoryIcon'
import { ProductSKU } from './product-identifiers/ProductSKU'
import { ProductModel } from './product-identifiers/ProductModel'

interface Product {
    id: string
    name: string
    sku: string
    category: string
    manufacturer: string
    model: string
    image_url?: string
    price?: number
    description?: string
    specifications?: Record<string, string | number>
}

interface ProductComparisonProps {
    initialSkus?: string[]
    maxProducts?: number
}

export function ProductComparison({
    initialSkus = [],
    maxProducts = 3
}: ProductComparisonProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [newSku, setNewSku] = useState('')

    const loadProducts = useCallback(async (skus: string[]) => {
        setIsLoading(true)
        const loadedProducts: Product[] = []

        for (const sku of skus.slice(0, maxProducts)) {
            try {
                const response = await fetch(`/api/products/by-sku/${encodeURIComponent(sku)}`)
                if (response.ok) {
                    const data = await response.json()
                    const product = data.product

                    loadedProducts.push({
                        id: product.id,
                        name: product.title || product.name,
                        sku: product.sku || product.metadata?.sku || sku,
                        category: product.categories?.[0]?.name || 'others',
                        manufacturer: product.metadata?.manufacturer || 'N/A',
                        model: product.metadata?.model || 'N/A',
                        image_url: product.thumbnail || product.images?.[0]?.url,
                        price: product.variants?.[0]?.prices?.[0]?.amount,
                        description: product.description,
                        specifications: product.metadata?.specifications || {},
                    })
                }
            } catch (error) {
                console.error(`Error loading product ${sku}:`, error)
            }
        }

        setProducts(loadedProducts)
        setIsLoading(false)
    }, [maxProducts])

    // Carrega produtos iniciais da URL ou props
    useEffect(() => {
        const skusFromUrl = searchParams?.get('skus')?.split(',').filter(Boolean) || []
        const skusToLoad = skusFromUrl.length > 0 ? skusFromUrl : initialSkus

        if (skusToLoad.length > 0) {
            loadProducts(skusToLoad)
        }
    }, [searchParams, initialSkus, loadProducts])

    const addProduct = async () => {
        if (!newSku.trim() || products.length >= maxProducts) return

        const skus = [...products.map(p => p.sku), newSku.trim()]
        router.push(`/produtos/comparar?skus=${skus.join(',')}`)
        setNewSku('')
    }

    const removeProduct = (sku: string) => {
        const remainingSkus = products.filter(p => p.sku !== sku).map(p => p.sku)

        if (remainingSkus.length === 0) {
            router.push('/produtos/comparar')
            setProducts([])
        } else {
            router.push(`/produtos/comparar?skus=${remainingSkus.join(',')}`)
        }
    }

    const formatPrice = (amount?: number) => {
        if (!amount) return 'Preço sob consulta'
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount / 100)
    }

    // Extrai todas as especificações únicas
    const allSpecs = Array.from(
        new Set(
            products.flatMap(p => Object.keys(p.specifications || {}))
        )
    )

    return (
        <div className="w-full">
            {/* Header com input para adicionar */}
            <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={newSku}
                            onChange={(e) => setNewSku(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addProduct()}
                            placeholder="Digite um SKU para adicionar à comparação..."
                            disabled={products.length >= maxProducts}
                            className={clx(
                                'w-full px-4 py-2',
                                'border border-gray-300 rounded-lg',
                                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                                'disabled:bg-gray-100 disabled:cursor-not-allowed'
                            )}
                        />
                    </div>
                    <button
                        onClick={addProduct}
                        disabled={!newSku.trim() || products.length >= maxProducts}
                        className={clx(
                            'px-6 py-2 rounded-lg font-medium',
                            'bg-blue-600 text-white',
                            'hover:bg-blue-700 transition-colors',
                            'disabled:bg-gray-300 disabled:cursor-not-allowed'
                        )}
                    >
                        Adicionar
                    </button>
                </div>

                {products.length >= maxProducts && (
                    <p className="mt-2 text-sm text-orange-600">
                        Máximo de {maxProducts} produtos para comparação
                    </p>
                )}
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
            )}

            {/* Comparação */}
            {!isLoading && products.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white rounded-lg shadow-sm overflow-hidden">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[150px]">
                                    Especificação
                                </th>
                                {products.map((product) => (
                                    <th key={product.id} className="px-4 py-3 min-w-[280px]">
                                        <div className="flex flex-col gap-2">
                                            {/* Imagem */}
                                            {product.image_url && (
                                                <div className="mx-auto w-32 h-32 bg-gray-100 rounded overflow-hidden">
                                                    <Image
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        width={128}
                                                        height={128}
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}

                                            {/* Nome */}
                                            <h3 className="font-semibold text-gray-900 text-sm">
                                                {product.name}
                                            </h3>

                                            {/* Botão remover */}
                                            <button
                                                onClick={() => removeProduct(product.sku)}
                                                className="text-xs text-red-600 hover:text-red-700 hover:underline"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {/* SKU */}
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="sticky left-0 bg-white px-4 py-3 font-medium text-sm text-gray-700">
                                    SKU
                                </td>
                                {products.map((product) => (
                                    <td key={product.id} className="px-4 py-3">
                                        <ProductSKU
                                            sku={product.sku}
                                            productId={product.id}
                                            productName={product.name}
                                            category={product.category}
                                        />
                                    </td>
                                ))}
                            </tr>

                            {/* Categoria */}
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="sticky left-0 bg-white px-4 py-3 font-medium text-sm text-gray-700">
                                    Categoria
                                </td>
                                {products.map((product) => (
                                    <td key={product.id} className="px-4 py-3">
                                        <CategoryIcon category={product.category as any} />
                                    </td>
                                ))}
                            </tr>

                            {/* Fabricante/Modelo */}
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="sticky left-0 bg-white px-4 py-3 font-medium text-sm text-gray-700">
                                    Fabricante/Modelo
                                </td>
                                {products.map((product) => (
                                    <td key={product.id} className="px-4 py-3">
                                        <ProductModel
                                            manufacturer={product.manufacturer}
                                            model={product.model}
                                        />
                                    </td>
                                ))}
                            </tr>

                            {/* Preço */}
                            <tr className="border-b border-gray-200 hover:bg-gray-50 bg-yellow-50">
                                <td className="sticky left-0 bg-yellow-50 px-4 py-3 font-medium text-sm text-gray-700">
                                    Preço
                                </td>
                                {products.map((product) => (
                                    <td key={product.id} className="px-4 py-3">
                                        <span className="text-lg font-bold text-gray-900">
                                            {formatPrice(product.price)}
                                        </span>
                                    </td>
                                ))}
                            </tr>

                            {/* Descrição */}
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="sticky left-0 bg-white px-4 py-3 font-medium text-sm text-gray-700">
                                    Descrição
                                </td>
                                {products.map((product) => (
                                    <td key={product.id} className="px-4 py-3">
                                        <p className="text-sm text-gray-600 line-clamp-3">
                                            {product.description || 'Sem descrição'}
                                        </p>
                                    </td>
                                ))}
                            </tr>

                            {/* Especificações dinâmicas */}
                            {allSpecs.map((spec) => (
                                <tr key={spec} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="sticky left-0 bg-white px-4 py-3 font-medium text-sm text-gray-700 capitalize">
                                        {spec.replace(/_/g, ' ')}
                                    </td>
                                    {products.map((product) => (
                                        <td key={product.id} className="px-4 py-3 text-sm text-gray-600">
                                            {product.specifications?.[spec] || '—'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && products.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <svg className="mx-auto w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhum produto para comparar
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Digite um SKU acima para começar a comparação
                    </p>
                </div>
            )}
        </div>
    )
}

export default ProductComparison
