/**
 * SKU Autocomplete Search Component
 * Busca produtos por SKU com sugestões em tempo real
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { clx } from '@medusajs/ui'
import Image from 'next/image'

interface ProductSuggestion {
    id: string
    name: string
    sku: string
    image_url?: string
    price?: number
    category?: string
}

interface SKUAutocompleteProps {
    placeholder?: string
    className?: string
    onSelect?: (product: ProductSuggestion) => void
}

export function SKUAutocomplete({
    placeholder = "Buscar por SKU...",
    className,
    onSelect
}: SKUAutocompleteProps) {
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const router = useRouter()
    const wrapperRef = useRef<HTMLDivElement>(null)

    // Fecha dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Busca sugestões
    useEffect(() => {
        const searchSKU = async () => {
            if (query.length < 3) {
                setSuggestions([])
                setIsOpen(false)
                return
            }

            setIsLoading(true)

            try {
                const response = await fetch(`/api/products/search-sku?q=${encodeURIComponent(query)}`)
                const data = await response.json()

                if (data.products) {
                    const mapped: ProductSuggestion[] = data.products.map((p: any) => ({
                        id: p.id,
                        name: p.title || p.name,
                        sku: p.sku || p.metadata?.sku || '',
                        image_url: p.thumbnail || p.images?.[0]?.url,
                        price: p.variants?.[0]?.prices?.[0]?.amount,
                        category: p.categories?.[0]?.name,
                    }))

                    setSuggestions(mapped)
                    setIsOpen(mapped.length > 0)
                }
            } catch (error) {
                console.error('Error searching SKU:', error)
                setSuggestions([])
            } finally {
                setIsLoading(false)
            }
        }

        const debounceTimer = setTimeout(searchSKU, 300)
        return () => clearTimeout(debounceTimer)
    }, [query])

    // Navegação por teclado
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
                break
            case 'Enter':
                e.preventDefault()
                if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                    handleSelect(suggestions[selectedIndex])
                }
                break
            case 'Escape':
                setIsOpen(false)
                setSelectedIndex(-1)
                break
        }
    }

    const handleSelect = (product: ProductSuggestion) => {
        setQuery(product.sku)
        setIsOpen(false)
        setSelectedIndex(-1)

        if (onSelect) {
            onSelect(product)
        } else {
            // Navega para a página do produto
            router.push(`/produtos/${product.category || 'others'}/${product.id}`)
        }
    }

    const formatPrice = (amount?: number) => {
        if (!amount) return null
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount / 100)
    }

    return (
        <div ref={wrapperRef} className={clx('relative', className)}>
            {/* Input de busca */}
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    className={clx(
                        'w-full px-4 py-2 pr-10',
                        'border border-gray-300 rounded-lg',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500',
                        'placeholder:text-gray-400'
                    )}
                />

                {/* Ícone de busca/loading */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isLoading ? (
                        <svg className="animate-spin w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Dropdown de sugestões */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                    {suggestions.map((product, index) => (
                        <button
                            key={product.id}
                            onClick={() => handleSelect(product)}
                            className={clx(
                                'w-full p-3 flex items-start gap-3',
                                'hover:bg-gray-50 transition-colors',
                                'border-b border-gray-100 last:border-b-0',
                                selectedIndex === index && 'bg-blue-50'
                            )}
                        >
                            {/* Imagem do produto */}
                            {product.image_url && (
                                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded overflow-hidden">
                                    <Image
                                        src={product.image_url}
                                        alt={product.name}
                                        width={48}
                                        height={48}
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            {/* Informações */}
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="font-medium text-gray-900 text-sm truncate">
                                        {product.name}
                                    </p>
                                    {product.price && (
                                        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                                            {formatPrice(product.price)}
                                        </span>
                                    )}
                                </div>

                                <code className="text-xs text-gray-600 font-mono mt-1 block">
                                    SKU: {product.sku}
                                </code>

                                {product.category && (
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded">
                                        {product.category}
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Mensagem de "nenhum resultado" */}
            {query.length >= 3 && !isLoading && suggestions.length === 0 && isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-center text-gray-500">
                    Nenhum produto encontrado para &ldquo;{query}&rdquo;
                </div>
            )}
        </div>
    )
}

export default SKUAutocomplete
